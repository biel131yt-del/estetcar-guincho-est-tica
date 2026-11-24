import { createFileRoute } from "@tanstack/react-router";
import { useRef, useState, type FormEvent } from "react";
import { Layout } from "@/components/site/Layout";
import { BookingFields } from "@/components/site/BookingFields";
import { bookingFromForm, bookingMessage, bookingSchema } from "@/lib/bookings";
import { bookingRequest } from "@/lib/booking-client";
import { BUSINESS, whatsappLink } from "@/lib/business";
import { seo } from "@/lib/seo";

export const Route = createFileRoute("/agendar")({
  head: () => seo("Agendar Guincho ou Transporte | Estetcar", "Solicite o transporte do seu veículo com a Estetcar na Região Carbonífera."),
  component: Agendar,
});

function Agendar() {
  const request = useRef<{ details: string; key: string } | null>(null);
  const [busy, setBusy] = useState(false);
  const [saved, setSaved] = useState(false);
  const [whatsapp, setWhatsapp] = useState("");
  const [error, setError] = useState("");

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (busy || saved) return;
    setError("");
    setWhatsapp("");
    const details = bookingFromForm(event.currentTarget, "");
    const fingerprint = JSON.stringify(details);
    if (request.current?.details !== fingerprint) {
      request.current = { details: fingerprint, key: crypto.randomUUID() };
    }
    const booking = bookingSchema.safeParse({ ...details, request_key: request.current.key });
    if (!booking.success) {
      setError("Confira os dados e informe um telefone com DDD.");
      return;
    }
    setWhatsapp(whatsappLink(bookingMessage(booking.data)));
    setBusy(true);
    try {
      await bookingRequest("/api/agendamentos", "POST", booking.data);
      setSaved(true);
    } catch (problem) {
      setError(problem instanceof Error ? problem.message : "Falha ao registrar o pedido.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <Layout>
      <div className="hazard-bar" />
      <section className="mx-auto max-w-3xl px-4 py-16">
        <h1 className="text-4xl sm:text-5xl">Agende seu <span className="text-primary">transporte</span></h1>
        <p className="mt-4 text-muted-foreground">Envie a solicitação para a equipe confirmar a disponibilidade. Precisa de guincho agora? <a className="text-primary underline" href={`tel:+${BUSINESS.phoneRaw}`}>Ligue para o plantão 24h.</a></p>
        {!saved && (
          <form onSubmit={submit} className="mt-8 rounded-lg border border-border bg-card p-5 sm:p-7" onChange={() => { setWhatsapp(""); setError(""); }}>
            <fieldset disabled={busy} className="grid gap-4 sm:grid-cols-2">
              <legend className="sr-only">Dados do transporte</legend>
              <BookingFields />
              <p className="text-sm text-muted-foreground sm:col-span-2">A Estetcar usa esses dados para atender o seu pedido e entrar em contato.</p>
              <button type="submit" className="btn-primary sm:col-span-2">{busy ? "Enviando…" : "Solicitar agendamento"}</button>
            </fieldset>
          </form>
        )}
        {saved && <p role="status" className="mt-8 rounded-lg border border-border bg-card p-5">Solicitação registrada. A equipe ainda vai confirmar a data e o horário.</p>}
        {error && <p role="alert" className="mt-4 text-destructive">{error}</p>}
        {(saved || error) && whatsapp && <a href={whatsapp} target="_blank" rel="noreferrer" className="btn-whatsapp mt-4">{saved ? "Acompanhar pelo WhatsApp" : "Enviar o pedido pelo WhatsApp"}</a>}
      </section>
    </Layout>
  );
}
