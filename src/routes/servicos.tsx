import { createFileRoute } from "@tanstack/react-router";
import { Layout, Reveal } from "@/components/site/Layout";
import { SERVICES, whatsappLink } from "@/lib/business";
import { seo } from "@/lib/seo";

export const Route = createFileRoute("/servicos")({
  head: () => seo("Serviços de Guincho e Reboque 24h | Estetcar", "Reboque de carros e motos, carga de bateria, troca de pneu, pane seca e transporte intermunicipal na Região Carbonífera – RS."),
  component: Servicos,
});

function Servicos() {
  return (
    <Layout>
      <div className="hazard-bar" />
      <section className="mx-auto max-w-6xl px-4 py-16">
        <h1 className="text-4xl sm:text-5xl">Nossos <span className="text-primary">serviços</span></h1>
        <p className="mt-4 max-w-2xl text-muted-foreground">Equipe preparada e guincho plataforma para atender qualquer emergência, a qualquer hora.</p>
        <div className="mt-12 grid gap-5 md:grid-cols-2">
          {SERVICES.map((s, i) => (
            <Reveal key={s.title} delay={i * 80}>
              <article className="card-hover flex h-full gap-5">
                <div className="text-4xl">{s.icon}</div>
                <div>
                  <h2 className="text-xl">{s.title}</h2>
                  <p className="mt-2 text-muted-foreground">{s.text}</p>
                  <a href={whatsappLink(`Olá! Quero um orçamento de: ${s.title}.`)} target="_blank" rel="noreferrer" className="mt-4 inline-block font-semibold text-primary">Pedir orçamento →</a>
                </div>
              </article>
            </Reveal>
          ))}
        </div>
      </section>
    </Layout>
  );
}
