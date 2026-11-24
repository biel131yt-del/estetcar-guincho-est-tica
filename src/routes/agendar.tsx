import { createFileRoute } from "@tanstack/react-router";
import { useState, type FormEvent } from "react";
import { Layout } from "@/components/site/Layout";
import { SERVICES, whatsappLink } from "@/lib/business";
import { seo } from "@/lib/seo";

export const Route = createFileRoute("/agendar")({
  head: () => seo("Agendar Guincho ou Transporte | Estetcar", "Agende o transporte do seu veículo com a Estetcar. Preencha o formulário e confirme pelo WhatsApp."),
  component: Agendar,
});

function Agendar() {
  const [sent, setSent] = useState(false);
  function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const f = new FormData(e.currentTarget);
    const g = (k: string) => String(f.get(k) ?? "");
    const msg = `Olá! Quero agendar um serviço.\n\nNome: ${g("nome")}\nServiço: ${g("servico")}\nVeículo: ${g("veiculo")}\nData: ${g("data")} às ${g("hora")}\nOrigem: ${g("origem")}\nDestino: ${g("destino")}\nObs: ${g("obs")}`;
    window.open(whatsappLink(msg), "_blank");
    setSent(true);
  }
  return (
    <Layout>
      <div className="hazard-bar" />
      <section className="mx-auto max-w-3xl px-4 py-16">
        <h1 className="text-4xl sm:text-5xl">Agende seu <span className="text-primary">transporte</span></h1>
        <p className="mt-4 text-muted-foreground">Preencha os dados e confirme pelo WhatsApp. Para emergências, chame direto — atendemos na hora.</p>
        <form onSubmit={onSubmit} className="mt-10 grid gap-4 rounded-lg border border-border bg-card p-6 sm:grid-cols-2">
          <label className="grid gap-1 text-sm">Nome<input required name="nome" maxLength={80} className="field" /></label>
          <label className="grid gap-1 text-sm">Serviço
            <select name="servico" className="field">{SERVICES.map((s) => <option key={s.title}>{s.title}</option>)}</select>
          </label>
          <label className="grid gap-1 text-sm sm:col-span-2">Veículo (modelo e ano)<input required name="veiculo" maxLength={80} className="field" /></label>
          <label className="grid gap-1 text-sm">Data<input required type="date" name="data" className="field" /></label>
          <label className="grid gap-1 text-sm">Horário<input required type="time" name="hora" className="field" /></label>
          <label className="grid gap-1 text-sm">Origem<input required name="origem" maxLength={120} className="field" /></label>
          <label className="grid gap-1 text-sm">Destino<input required name="destino" maxLength={120} className="field" /></label>
          <label className="grid gap-1 text-sm sm:col-span-2">Observações<textarea name="obs" rows={3} maxLength={400} className="field" /></label>
          <button type="submit" className="btn-whatsapp sm:col-span-2">💬 Enviar pelo WhatsApp</button>
          {sent && <p className="text-sm text-success sm:col-span-2">Pronto! Finalize o envio na conversa do WhatsApp que abriu.</p>}
        </form>
      </section>
    </Layout>
  );
}
