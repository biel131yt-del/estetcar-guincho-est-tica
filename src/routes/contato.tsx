import { createFileRoute } from "@tanstack/react-router";
import { Layout } from "@/components/site/Layout";
import { BUSINESS, whatsappLink } from "@/lib/business";
import { seo } from "@/lib/seo";

export const Route = createFileRoute("/contato")({
  head: () => seo("Contato e Localização | Guincho Estetcar 24h", "Fale com a Estetcar: telefone, WhatsApp e localização no Google Maps. Atendimento 24 horas na Região Carbonífera – RS."),
  component: Contato,
});

function Contato() {
  return (
    <Layout>
      <div className="hazard-bar" />
      <section className="mx-auto grid max-w-6xl gap-10 px-4 py-16 md:grid-cols-2">
        <div>
          <h1 className="text-4xl sm:text-5xl">Fale <span className="text-primary">conosco</span></h1>
          <p className="mt-4 text-muted-foreground">Atendimento 24 horas, inclusive fins de semana e feriados.</p>
          <ul className="mt-8 grid gap-4">
            <li className="card-hover">📞 <a href={`tel:+${BUSINESS.phoneRaw}`} className="font-semibold">{BUSINESS.phoneDisplay}</a></li>
            <li className="card-hover">💬 <a href={whatsappLink("Olá!")} target="_blank" rel="noreferrer" className="font-semibold">WhatsApp</a></li>
            <li className="card-hover">📍 {BUSINESS.region} — <a href={BUSINESS.mapsUrl} target="_blank" rel="noreferrer" className="text-primary">abrir no Maps</a></li>
          </ul>
        </div>
        <iframe
          title="Localização Estetcar"
          className="h-96 w-full rounded-lg border border-border md:h-full"
          loading="lazy"
          src={`https://maps.google.com/maps?q=${BUSINESS.lat},${BUSINESS.lng}&z=15&output=embed`}
        />
      </section>
    </Layout>
  );
}
