import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useRef, useState, type FormEvent } from "react";
import { BookingFields } from "@/components/site/BookingFields";
import { bookingFromForm, bookingSchema, statuses, statusLabels, type BookingInput } from "@/lib/bookings";
import { bookingRequest } from "@/lib/booking-client";

type Status = (typeof statuses)[number];
type Booking = Omit<BookingInput, "request_key"> & {
  id: string;
  source: "site" | "manual";
  status: Status;
  internal_notes: string;
  updated_at: string;
};
const endpoint = "/api/admin/agendamentos";

export const Route = createFileRoute("/admin")({
  head: () => ({ meta: [{ title: "Painel Estetcar" }, { name: "robots", content: "noindex, nofollow" }] }),
  component: Admin,
});

function Admin() {
  const [filter, setFilter] = useState("");
  const [page, setPage] = useState(1);
  const [revision, refresh] = useState(0);
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [more, setMore] = useState(false);
  const [state, setState] = useState<"loading" | "ready" | "denied" | "error">("loading");
  const [notice, setNotice] = useState("");
  const [manual, setManual] = useState(false);
  const [creating, setCreating] = useState(false);
  const requestKey = useRef("");
  const reload = () => refresh((value) => value + 1);

  useEffect(() => {
    const controller = new AbortController();
    setState("loading");
    const query = new URLSearchParams({ page: String(page), status: filter });
    bookingRequest<{ bookings: Booking[]; more: boolean }>(`${endpoint}?${query}`, "GET", undefined, controller.signal)
      .then((result) => {
        if (controller.signal.aborted) return;
        setBookings(result.bookings);
        setMore(result.more);
        setState("ready");
      })
      .catch((error) => {
        if (!controller.signal.aborted) setState(error.cause === 401 ? "denied" : "error");
      });
    return () => controller.abort();
  }, [filter, page, revision]);

  async function create(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (creating) return;
    requestKey.current ||= crypto.randomUUID();
    const data = bookingSchema.safeParse(bookingFromForm(event.currentTarget, requestKey.current));
    if (!data.success) { setNotice("Confira os campos e o telefone com DDD."); return; }
    setCreating(true);
    try {
      await bookingRequest(endpoint, "POST", data.data);
      requestKey.current = "";
      setManual(false);
      setFilter("");
      setPage(1);
      setNotice("Pedido manual registrado.");
      reload();
    } catch (error) {
      setNotice(error instanceof Error ? error.message : "Falha ao registrar.");
    } finally {
      setCreating(false);
    }
  }

  return (
    <main className="mx-auto min-h-screen max-w-6xl px-4 py-10 sm:py-16">
      <header className="flex flex-wrap items-start justify-between gap-5 border-b border-border pb-7">
        <div>
          <a href="/" className="font-display text-primary">ESTETCAR</a>
          <h1 className="mt-3 text-3xl sm:text-5xl">Agenda de atendimentos</h1>
        </div>
      </header>
      {state === "denied" && <section className="card-hover mt-8 max-w-lg">
        <h2 className="text-xl">Área da equipe</h2>
        <p className="my-4 text-muted-foreground">Abra o painel diretamente para informar as credenciais da Estetcar.</p>
        <a href="/admin" className="btn-primary">Abrir painel</a>
      </section>}
      {state === "loading" && <p role="status" className="mt-6">Carregando agenda…</p>}
      {state === "error" && <div className="mt-6"><p role="alert">A agenda está indisponível.</p><button className="btn-outline mt-3" onClick={reload}>Tentar novamente</button></div>}
      {(state === "ready" || state === "loading") && <section className="mt-6">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <label className="grid gap-1 text-sm">Filtrar por status
            <select value={filter} className="field" onChange={(event) => { setFilter(event.target.value); setPage(1); }}>
              <option value="">Todos os pedidos</option>
              {statuses.map((status) => <option key={status} value={status}>{statusLabels[status]}</option>)}
            </select>
          </label>
          {state === "ready" && <button type="button" className="btn-primary" aria-expanded={manual} onClick={() => setManual(!manual)}>{manual ? "Fechar cadastro" : "Registrar pedido manual"}</button>}
        </div>
        {notice && <p role="status" className="mt-4">{notice}</p>}
        {manual && state === "ready" && <form className="card-hover mt-5" onSubmit={create} onChange={() => { requestKey.current = ""; }}>
          <fieldset disabled={creating} className="grid gap-4 sm:grid-cols-2">
            <legend className="mb-4 font-display">Cadastro manual</legend>
            <BookingFields />
            <button className="btn-primary sm:col-span-2">{creating ? "Registrando…" : "Registrar pedido"}</button>
          </fieldset>
        </form>}
        {state === "ready" && <>
          <div className="mt-6 grid gap-4">
            {bookings.length === 0 && <p className="card-hover text-muted-foreground">Nenhum pedido nesta página.</p>}
            {bookings.map((booking) => <BookingCard key={`${booking.id}:${booking.updated_at}`} booking={booking} onSaved={() => { setNotice("Pedido atualizado."); reload(); }} reload={reload} />)}
          </div>
          <nav aria-label="Páginas de pedidos" className="mt-6 flex flex-wrap items-center gap-4">
            <button className="btn-outline disabled:opacity-40" disabled={page === 1} onClick={() => setPage(page - 1)}>Anterior</button>
            <span>Página {page}</span>
            <button className="btn-outline disabled:opacity-40" disabled={!more} onClick={() => setPage(page + 1)}>Próxima</button>
          </nav>
        </>}
      </section>}
    </main>
  );
}

function BookingCard({ booking, onSaved, reload }: { booking: Booking; onSaved: () => void; reload: () => void }) {
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [stale, setStale] = useState(false);
  async function save(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (busy || stale) return;
    const data = new FormData(event.currentTarget);
    setBusy(true);
    setError("");
    try {
      await bookingRequest(`${endpoint}/${booking.id}`, "PATCH", {
        status: data.get("status"),
        internal_notes: data.get("internal_notes"),
        updated_at: booking.updated_at,
      });
      onSaved();
    } catch (problem) {
      setError(problem instanceof Error ? problem.message : "Falha ao atualizar.");
      setStale(problem instanceof Error && problem.cause === 409);
    } finally {
      setBusy(false);
    }
  }

  return <details className="card-hover">
    <summary className="cursor-pointer">
      <span className="font-semibold">{booking.name} · {booking.service}</span>
      <span className="mt-1 block text-sm text-muted-foreground">{booking.scheduled_date.split("-").reverse().join("/")} às {booking.scheduled_time} · {statusLabels[booking.status]} · {booking.source === "site" ? "Site" : "Manual"}</span>
    </summary>
    <dl className="mt-5 grid gap-3 text-sm sm:grid-cols-2">
      <div><dt className="text-muted-foreground">Telefone</dt><dd><a className="text-primary underline" href={`tel:${booking.phone.length <= 11 ? "+55" : "+"}${booking.phone}`}>{booking.phone}</a></dd></div>
      <div><dt className="text-muted-foreground">Veículo</dt><dd>{booking.vehicle}</dd></div>
      <div><dt className="text-muted-foreground">Origem</dt><dd>{booking.origin}</dd></div>
      <div><dt className="text-muted-foreground">Destino</dt><dd>{booking.destination}</dd></div>
      {booking.notes && <div className="sm:col-span-2"><dt className="text-muted-foreground">Observação do cliente</dt><dd className="whitespace-pre-wrap break-words">{booking.notes}</dd></div>}
    </dl>
    <form className="mt-5" onSubmit={save}>
      <fieldset disabled={busy || stale} className="grid gap-3">
        <label className="grid gap-1 text-sm">Status
          <select name="status" className="field" defaultValue={booking.status}>{statuses.map((status) => <option key={status} value={status}>{statusLabels[status]}</option>)}</select>
        </label>
        <label className="grid gap-1 text-sm">Observações internas
          <textarea name="internal_notes" className="field" rows={3} maxLength={2000} defaultValue={booking.internal_notes} />
        </label>
        <button className="btn-primary justify-self-start">{busy ? "Salvando…" : "Salvar alterações"}</button>
      </fieldset>
      {error && <p role="alert" className="mt-3 text-destructive">{error}</p>}
      {stale && <button type="button" className="btn-outline mt-3" onClick={reload}>Recarregar agenda</button>}
    </form>
  </details>;
}