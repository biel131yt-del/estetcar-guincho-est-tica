import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowUpRight, CalendarDays, MapPin, Phone, Truck } from "lucide-react";
import { Layout, Reveal } from "@/components/site/Layout";
import { WhatsAppIcon } from "@/components/site/WhatsAppIcon";
import { BUSINESS, SERVICES, whatsappLink } from "@/lib/business";
import { seo } from "@/lib/seo";

export const Route = createFileRoute("/")({
  head: () => seo("Guincho 24 Horas em São Jerônimo e Charqueadas | Estetcar", "Guincho 24h, reboque de carros e motos e socorro automotivo em São Jerônimo, Charqueadas e Região Carbonífera."),
  component: Index,
});

function Index() {
  return (
    <Layout>
      <section className="rescue-hero overflow-hidden">
        <div className="hazard-bar" />
        <div className="mx-auto grid max-w-6xl items-center gap-8 px-4 py-14 md:grid-cols-[1.2fr_1fr] md:gap-14 md:py-24">
          <Reveal>
            <p className="mb-6 flex items-center gap-2 text-sm font-bold uppercase tracking-[.16em] text-primary"><span aria-hidden="true">●</span> Plantão 24 horas</p>
            <h1 className="max-w-[13ch] text-[clamp(2.9rem,6.7vw,6rem)] leading-[.95] tracking-tight">
              Furou o pneu? <span className="text-primary">A gente busca você.</span>
            </h1>
            <p className="mt-6 max-w-md text-lg text-muted-foreground">Guincho e socorro automotivo em São Jerônimo, Charqueadas e Região Carbonífera.</p>
            <div className="mt-8 flex flex-wrap gap-3">
              <a href={whatsappLink("Olá! Preciso de um guincho. Vou enviar minha localização.")} target="_blank" rel="noreferrer" className="btn-whatsapp"><WhatsAppIcon className="h-5 w-5" /> Chamar no WhatsApp</a>
              <a href={`tel:+${BUSINESS.phoneRaw}`} className="btn-outline"><Phone size={18} /> Ligar para o plantão</a>
            </div>
          </Reveal>
          <div className="rescue-card rounded-2xl border border-border p-6 sm:p-8">
            <div className="flex items-center justify-between border-b border-border pb-5">
              <Truck size={38} className="text-primary" aria-hidden="true" />
              <span className="font-display text-primary">ESTETCAR</span>
            </div>
            <div className="grid gap-5 pt-6">
              <div className="flex gap-4">
                <MapPin className="mt-1 shrink-0 text-primary" size={21} aria-hidden="true" />
                <div><h2 className="text-lg">Atendimento regional</h2><p className="mt-1 text-muted-foreground">{BUSINESS.region}</p></div>
              </div>
              <Link to="/agendar" className="flex items-center gap-4 rounded-lg border border-border bg-background/60 p-4 font-semibold transition-colors hover:border-primary">
                <CalendarDays className="shrink-0 text-primary" size={22} aria-hidden="true" />
                <span>Agendar transporte</span><ArrowUpRight className="ml-auto shrink-0" size={18} aria-hidden="true" />
              </Link>
            </div>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-4 py-20">
        <h2 className="text-3xl sm:text-4xl">Serviços de <span className="text-primary">socorro</span></h2>
        <div className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {SERVICES.map((s, i) => (
            <Reveal key={s.title} delay={i * 80}>
              <article className="card-hover h-full">
                <div className="text-3xl">{s.icon}</div>
                <h3 className="mt-3 text-lg">{s.title}</h3>
                <p className="mt-2 text-sm text-muted-foreground">{s.text}</p>
              </article>
            </Reveal>
          ))}
        </div>
        <Link to="/servicos" className="mt-8 inline-block font-semibold text-primary">Ver todos os serviços →</Link>
      </section>

      <section className="bg-card">
        <div className="mx-auto grid max-w-6xl gap-8 px-4 py-20 md:grid-cols-3">
          {[["1", "Chame", "Pelo WhatsApp ou telefone, envie sua localização."], ["2", "Chegamos", "A equipe confirma a disponibilidade e segue até o local."], ["3", "Resolvido", "Levamos seu veículo com segurança até o destino."]].map(([n, t, d]) => (
            <div key={n}>
              <span className="font-display text-6xl text-primary/30">{n}</span>
              <h3 className="mt-2 text-xl">{t}</h3>
              <p className="mt-2 text-muted-foreground">{d}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="mx-auto max-w-4xl px-4 py-20 text-center">
        <h2 className="text-3xl sm:text-5xl">Precisa de ajuda <span className="text-primary">agora?</span></h2>
        <p className="mt-4 text-muted-foreground">Ligue {BUSINESS.phoneDisplay} — atendemos dia e noite.</p>
        <div className="mt-8 flex flex-wrap justify-center gap-3">
          <a href={`tel:+${BUSINESS.phoneRaw}`} className="btn-primary">📞 Ligar agora</a>
          <a href={whatsappLink("Olá! Preciso de um guincho.")} target="_blank" rel="noreferrer" className="btn-whatsapp">💬 WhatsApp</a>
        </div>
      </section>
    </Layout>
  );
}

