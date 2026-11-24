import { createFileRoute } from "@tanstack/react-router";
import { ArrowUpRight, MapPin } from "lucide-react";
import { Layout, Reveal } from "@/components/site/Layout";
import { WhatsAppAction } from "@/components/site/WhatsAppAction";
import { WhatsAppIcon } from "@/components/site/WhatsAppIcon";
import { BUSINESS, SERVICES } from "@/lib/business";
import { seo } from "@/lib/seo";

export const Route = createFileRoute("/")({
  head: () => seo("Guincho 24 Horas em São Jerônimo e Charqueadas | Estetcar", "Guincho 24h, reboque de carros e motos e socorro automotivo em São Jerônimo, Charqueadas e Região Carbonífera."),
  component: Index,
});

function Index() {
  return (
    <Layout>
      <section className="rescue-hero" aria-labelledby="rescue-title">
        <picture className="rescue-hero-scene">
          <source media="(min-width: 960px)" srcSet="/images/estetcar-guincho-hero.webp" />
          <img
            src="/images/estetcar-guincho-hero-mobile.webp"
            alt="Guincho amarelo da Estetcar com a logo na porta e no capô, transportando um carro"
            width={825}
            height={557}
            fetchPriority="high"
            decoding="async"
          />
        </picture>
        <div className="rescue-hero-inner">
          <div className="rescue-hero-copy">
            <p className="rescue-hero-status"><span aria-hidden="true" /> Plantão 24 horas</p>
            <h1 id="rescue-title">Precisa de guincho <em>agora?</em></h1>
            <p className="rescue-hero-description">Socorro automotivo em São Jerônimo, Charqueadas e Região Carbonífera.</p>
            <WhatsAppAction className="btn-whatsapp rescue-hero-action">
              <WhatsAppIcon className="h-6 w-6 shrink-0" />
              <span>Chamar guincho agora</span>
              <ArrowUpRight className="h-5 w-5 shrink-0" aria-hidden="true" />
            </WhatsAppAction>
            <p className="rescue-hero-location"><MapPin size={16} aria-hidden="true" /> Envie sua localização na conversa.</p>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-4 py-14 sm:py-20">
        <h2 className="text-3xl sm:text-4xl">Serviços de <span className="text-primary">socorro</span></h2>
        <div className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {SERVICES.map((s, i) => (
            <Reveal key={s.title} delay={i * 80}>
              <article className="card-hover h-full">
                <div className="text-3xl">{s.icon}</div>
                <h3 className="mt-3 text-lg">{s.title}</h3>
                <p className="mt-2 text-sm text-muted-foreground">{s.text}</p>
                <WhatsAppAction message={`Olá, Estetcar! Preciso de ajuda com ${s.title.toLowerCase()}. Vou enviar minha localização.`} className="mt-4 inline-block font-semibold text-primary">Pedir atendimento →</WhatsAppAction>
              </article>
            </Reveal>
          ))}
        </div>
      </section>

      <section className="bg-card">
        <div className="mx-auto grid max-w-6xl gap-8 px-4 py-20 md:grid-cols-3">
          {[["1", "Chame", "Abra o WhatsApp e envie sua localização."], ["2", "Chegamos", "A equipe confirma a disponibilidade e segue até o local."], ["3", "Resolvido", "Levamos seu veículo com segurança até o destino."]].map(([n, t, d]) => (
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
        <p className="mt-4 text-muted-foreground">Chame no WhatsApp {BUSINESS.phoneDisplay}. O plantão funciona dia e noite.</p>
        <div className="mt-8 flex flex-wrap justify-center gap-3">
          <WhatsAppAction className="btn-whatsapp"><WhatsAppIcon className="h-5 w-5" /> Pedir socorro no WhatsApp</WhatsAppAction>
        </div>
      </section>
    </Layout>
  );
}
