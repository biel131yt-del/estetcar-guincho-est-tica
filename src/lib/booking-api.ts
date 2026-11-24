import { bookingSchema, statuses } from "./bookings.ts";
import { SERVICES } from "./business.ts";
import { z } from "zod";

import { neon } from "@neondatabase/serverless";
import { adminAction, checkAdmin } from "./admin-auth.ts";

function reply(body: unknown, status = 200) {
  return Response.json(body, { status, headers: { "Cache-Control": "no-store", "X-Content-Type-Options": "nosniff" } });
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

export async function handleBookingApi(request: Request) {
  const url = new URL(request.url);
  const method = request.method;
  const publicForm = url.pathname === "/api/agendamentos" && method === "POST";
  const adminPath = url.pathname === "/api/admin/agendamentos";
  const bookingId = /^\/api\/admin\/agendamentos\/([0-9a-f-]{36})$/.exec(url.pathname)?.[1];

  const authAction = ["/api/admin/entrar", "/api/admin/trocar-senha", "/api/admin/sair"].includes(url.pathname);

  if (!publicForm && !adminPath && !bookingId && !authAction) return reply({ error: "Rota indisponível." }, 404);
  if (method !== "GET" && request.headers.get("Origin") !== url.origin) {
    return reply({ error: "Origem da solicitação inválida." }, 403);
  }
  const connection = process.env.DATABASE_URL;
  if (!connection) return reply({ error: "Agenda temporariamente indisponível." }, 503);

  try {
    const db = neon(connection);
    if (authAction) return await adminAction(request, db, url.pathname, await readJson(request));
    if (!publicForm) {
      const denied = await checkAdmin(request, db);
      if (denied) return denied;
    }
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
      await db.query(`INSERT INTO bookings
        (id, request_key, name, phone, service, vehicle, scheduled_date, scheduled_time,
         origin, destination, notes, source) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12)
        ON CONFLICT(request_key) DO NOTHING`,
        [crypto.randomUUID(), booking.request_key, booking.name, booking.phone, booking.service,
         booking.vehicle, booking.scheduled_date, booking.scheduled_time, booking.origin,
         booking.destination, booking.notes, publicForm ? "site" : "manual"]);
      return reply({ ok: true }, 201);
    }

    if (method === "GET" && adminPath) {
      const status = z.enum(statuses).safeParse(url.searchParams.get("status"));
      const page = Math.min(10000, Math.max(1, Number.parseInt(url.searchParams.get("page") || "1", 10) || 1));
      const list = await db.query(`SELECT id,name,phone,service,vehicle,scheduled_date,scheduled_time,
        origin,destination,notes,internal_notes,source,status,updated_at FROM bookings
        ${status.success ? "WHERE status = $1" : ""}
        ORDER BY scheduled_date DESC, scheduled_time DESC, id LIMIT 26 OFFSET ${status.success ? "$2" : "$1"}`,
        [...(status.success ? [status.data] : []), (page - 1) * 25]);
      return reply({ bookings: list.slice(0, 25), more: list.length > 25 });
    }

    if (method === "PATCH" && bookingId) {
      const input = updateSchema.safeParse(await readJson(request));
      if (!input.success) return reply({ error: "Revise o status e as observações." }, 400);
      const { status, internal_notes, updated_at } = input.data;
      const version = new Date(Math.max(Date.now(), Date.parse(updated_at) + 1)).toISOString();
      const changed = await db.query(`UPDATE bookings SET status = $1, internal_notes = $2, updated_at = $3
        WHERE id = $4 AND updated_at = $5 RETURNING id`, [status, internal_notes, version, bookingId, updated_at]);
      return changed.length
        ? reply({ ok: true })
        : reply({ error: "Esse pedido foi atualizado. Recarregue a agenda antes de editar." }, 409);
    }

    return reply({ error: "Método indisponível." }, 405);
  } catch (error) {
    console.error("Falha na agenda", error instanceof Error ? error.name : "erro inesperado");
    return reply({ error: "Não foi possível acessar a agenda. Tente novamente." }, 503);
  }
}
