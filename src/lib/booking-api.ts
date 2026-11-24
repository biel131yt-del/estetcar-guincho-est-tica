import { bookingSchema, statuses } from "./bookings.ts";
import { SERVICES } from "./business.ts";
import { z } from "zod";

type Statement = {
  bind(...values: (string | number)[]): Statement;
  run(): Promise<{ meta: { changes: number } }>;
  all(): Promise<{ results: unknown[] }>;
};

export type BookingEnv = {
  DB?: { prepare(query: string): Statement };
  ADMIN_EMAIL?: string;
};

function reply(body: unknown, status = 200) {
  return Response.json(body, { status, headers: { "Cache-Control": "no-store", "X-Content-Type-Options": "nosniff" } });
}

function canManage(request: Request, env: BookingEnv) {
  const email = request.headers.get("oai-authenticated-user-email")?.trim().toLowerCase();
  const ownerEmail = env.ADMIN_EMAIL?.trim().toLowerCase();
  return Boolean(ownerEmail && request.headers.get("oai-authenticated-user-id") && email === ownerEmail);
}

async function readJson(request: Request) {
  if (request.headers.get("content-type")?.split(";")[0] !== "application/json" || !request.body) {
    return null;
  }
  const reader = request.body.getReader();
  const decoder = new TextDecoder();
  let bytes = 0;
  let text = "";
  try {
    for (;;) {
      const { value, done } = await reader.read();
      if (done) break;
      bytes += value.byteLength;
      if (bytes > 8192) {
        await reader.cancel();
        return null;
      }
      text += decoder.decode(value, { stream: true });
    }
    return JSON.parse(text + decoder.decode()) as unknown;
  } catch {
    return null;
  }
}

const updateSchema = z.object({
  status: z.enum(statuses),
  internal_notes: z.string().trim().max(2000),
  updated_at: z.iso.datetime(),
});

export async function handleBookingApi(request: Request, env: BookingEnv) {
  const url = new URL(request.url);
  const method = request.method;
  const publicForm = url.pathname === "/api/agendamentos" && method === "POST";
  const adminPath = url.pathname === "/api/admin/agendamentos";
  const bookingId = /^\/api\/admin\/agendamentos\/([0-9a-f-]{36})$/.exec(url.pathname)?.[1];

  if (!publicForm && !adminPath && !bookingId) return reply({ error: "Rota indisponível." }, 404);
  if (!publicForm && !canManage(request, env)) return reply({ error: "Acesso reservado à equipe Estetcar." }, 403);
  if (method !== "GET" && request.headers.get("Origin") !== url.origin) {
    return reply({ error: "Origem da solicitação inválida." }, 403);
  }
  if (!env.DB) return reply({ error: "Agenda temporariamente indisponível." }, 503);
  const db = env.DB;

  try {
    if (method === "POST" && (publicForm || adminPath)) {
      const input = bookingSchema.safeParse(await readJson(request));
      if (!input.success) return reply({ error: "Revise os dados do agendamento." }, 400);
      const booking = input.data;
      if (!SERVICES.some(({ title }) => title === booking.service)) {
        return reply({ error: "Selecione um serviço disponível." }, 400);
      }
      if (publicForm && booking.scheduled_date < new Intl.DateTimeFormat("sv-SE", { timeZone: "America/Sao_Paulo" }).format()) {
        return reply({ error: "Selecione hoje ou uma data futura." }, 400);
      }
      await db.prepare(`INSERT INTO bookings
        (id, request_key, name, phone, service, vehicle, scheduled_date, scheduled_time,
         origin, destination, notes, source) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        ON CONFLICT(request_key) DO NOTHING`)
        .bind(crypto.randomUUID(), booking.request_key, booking.name, booking.phone, booking.service,
          booking.vehicle, booking.scheduled_date, booking.scheduled_time, booking.origin,
          booking.destination, booking.notes, publicForm ? "site" : "manual").run();
      return reply({ ok: true }, 201);
    }

    if (method === "GET" && adminPath) {
      const status = z.enum(statuses).safeParse(url.searchParams.get("status"));
      const page = Math.min(10000, Math.max(1, Number.parseInt(url.searchParams.get("page") || "1", 10) || 1));
      const list = await db.prepare(`SELECT id,name,phone,service,vehicle,scheduled_date,scheduled_time,
        origin,destination,notes,internal_notes,source,status,updated_at FROM bookings
        ${status.success ? "WHERE status = ?" : ""}
        ORDER BY scheduled_date DESC, scheduled_time DESC, id LIMIT 26 OFFSET ?`)
        .bind(...(status.success ? [status.data] : []), (page - 1) * 25).all();
      return reply({ bookings: list.results.slice(0, 25), more: list.results.length > 25 });
    }

    if (method === "PATCH" && bookingId) {
      const input = updateSchema.safeParse(await readJson(request));
      if (!input.success) return reply({ error: "Revise o status e as observações." }, 400);
      const { status, internal_notes, updated_at } = input.data;
      const changed = await db.prepare(`UPDATE bookings SET status = ?, internal_notes = ?,
        updated_at = strftime('%Y-%m-%dT%H:%M:%fZ', max(julianday('now'), julianday(updated_at) + 0.001 / 86400))
        WHERE id = ? AND updated_at = ?`).bind(status, internal_notes, bookingId, updated_at).run();
      return changed.meta.changes
        ? reply({ ok: true })
        : reply({ error: "Esse pedido foi atualizado. Recarregue a agenda antes de editar." }, 409);
    }

    return reply({ error: "Método indisponível." }, 405);
  } catch (error) {
    console.error("Falha na agenda", error instanceof Error ? error.name : "erro inesperado");
    return reply({ error: "Não foi possível acessar a agenda. Tente novamente." }, 503);
  }
}
