import { Link } from "@tanstack/react-router";
import type { ReactNode } from "react";
import { Phone } from "lucide-react";
import { BUSINESS, whatsappLink } from "@/lib/business";
import { WhatsAppIcon } from "@/components/site/WhatsAppIcon";

const nav = [
  { to: "/", label: "Início" },
  { to: "/servicos", label: "Serviços" },
  { to: "/agendar", label: "Agendar" },
  { to: "/contato", label: "Contato" },
] as const;

export function Layout({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen flex flex-col">
      <header className="sticky top-0 z-40 border-b border-border bg-background/85 backdrop-blur">
        <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-4 py-3">
          <Link to="/" className="font-display text-xl tracking-tight">
            ESTET<span className="text-primary">CAR</span>
            <span className="ml-2 hidden text-xs font-sans text-muted-foreground sm:inline">guincho 24h</span>
          </Link>
          <nav className="hidden gap-6 text-sm font-semibold md:flex">
            {nav.map((n) => (
              <Link key={n.to} to={n.to} className="text-muted-foreground transition-colors hover:text-primary" activeProps={{ className: "text-primary" }} activeOptions={{ exact: true }}>
                {n.label}
              </Link>
            ))}
          </nav>
          <a href={`tel:+${BUSINESS.phoneRaw}`} className="btn-primary text-sm"><Phone size={16} aria-hidden="true" /> Ligar</a>
        </div>
        <nav className="flex justify-around border-t border-border py-2 text-xs font-semibold md:hidden">
          {nav.map((n) => (
            <Link key={n.to} to={n.to} className="text-muted-foreground" activeProps={{ className: "text-primary" }} activeOptions={{ exact: true }}>{n.label}</Link>
          ))}
        </nav>
      </header>
      <main className="flex-1">{children}</main>
      <footer className="border-t border-border bg-card">
        <div className="mx-auto grid max-w-6xl gap-6 px-4 py-10 md:grid-cols-3">
          <div>
            <p className="font-display text-lg">ESTET<span className="text-primary">CAR</span></p>
            <p className="mt-2 text-sm text-muted-foreground">Guincho e socorro automotivo 24 horas em {BUSINESS.region}.</p>
          </div>
          <div className="text-sm">
            <p className="font-semibold">Atendimento</p>
            <p className="text-muted-foreground">24 horas, 7 dias por semana</p>
            <p className="text-muted-foreground">{BUSINESS.phoneDisplay}</p>
          </div>
          <div className="text-sm">
            <a href={BUSINESS.mapsUrl} target="_blank" rel="noreferrer" className="text-primary underline-offset-4 hover:underline">Ver no Google Maps →</a>
          </div>
        </div>
        <p className="pb-6 text-center text-xs text-muted-foreground">© {new Date().getFullYear()} {BUSINESS.name}</p>
      </footer>
      <a
        href={whatsappLink("Olá! Preciso de um guincho.")}
        target="_blank"
        rel="noreferrer"
        aria-label="Chamar no WhatsApp"
        title="Chamar no WhatsApp"
        className="fab-whatsapp"
      >
        <WhatsAppIcon className="h-7 w-7" />
      </a>
    </div>
  );
}

export function Reveal({ children, delay = 0 }: { children: ReactNode; delay?: number }) {
  return <div className="reveal" style={{ animationDelay: `${delay}ms` }}>{children}</div>;
}

