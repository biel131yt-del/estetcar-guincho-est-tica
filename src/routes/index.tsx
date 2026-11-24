import { createFileRoute, Link } from "@tanstack/react-router";
import { Layout, Reveal } from "@/components/site/Layout";
import { BUSINESS, SERVICES, whatsappLink } from "@/lib/business";
import { seo } from "@/lib/seo";

export const Route = createFileRoute("/")({
  head: () => seo("Guincho 24 Horas em São Jerônimo e Charqueadas | Estetcar", "Guincho 24h, reboque de carros e motos, carga de bateria e socorro na estrada. Atendimento rápido na Região Carbonífera – RS."),
  component: Index,
});

const stats = [["24h", "todos os dias"], ["30 min", "tempo médio de chegada"], ["100%", "carga segurada"]];

function Index() {
  return (
    <Layout>
      <section className="relative overflow-hidden">
        <div className="hazard-bar" />
        <div className="mx-auto grid max-w-6xl gap-10 px-4 py-20 md:grid-cols-[1.3fr_1fr] md:py-28">
          <Reveal>
            <p className="mb-4 inline-flex items-center gap-2 rounded-full border border-border px-3 py-1 text-sm text-muted-foreground">
              <span className="beacon text-accent">●</span> Atendendo agora · {BUSINESS.region}
            </p>
            <h1 className="text-4xl leading-[1.05] sm:text-6xl">
              Quebrou? <span className="text-primary">A gente</span> busca você.
            </h1>
            <p className="mt-6 max-w-xl text-lg text-muted-foreground">
              Guincho e socorro automotivo 24 horas. Reboque de carros e motos, carga de bateria, troca de pneu e transporte para longas distâncias.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <a href={whatsappLink("Olá! Preciso de um guincho agora.")} target="_blank" rel="noreferrer" className="btn-whatsapp">💬 Chamar no WhatsApp</a>
              <Link to="/agendar" className="btn-outline">Agendar transporte</Link>
            </div>
          </Reveal>
          <Reveal delay={200}>
            <div className="grid gap-4">
              {stats.map(([n, l]) => (
                <div key={n} className="card-hover flex items-baseline gap-4">
                  <span className="font-display text-4xl text-primary">{n}</span>
                  <span className="text-muted-foreground">{l}</span>
                </div>
              ))}
            </div>
          </Reveal>
        </div>
        <div className="pointer-events-none absolute bottom-3 left-0 text-5xl truck" aria-hidden><span className="inline-block -scale-x-100">🚛</span></div>
        <div className="road" />
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
          {[["1", "Chame", "Pelo WhatsApp ou telefone, envie sua localização."], ["2", "Chegamos", "Um guincho sai na hora até onde você está."], ["3", "Resolvido", "Levamos seu veículo com segurança até o destino."]].map(([n, t, d]) => (
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
