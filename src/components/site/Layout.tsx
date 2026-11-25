import type { ReactNode } from "react";
import { BUSINESS } from "@/lib/business";
import { WhatsAppAction } from "@/components/site/WhatsAppAction";
import { WhatsAppIcon } from "@/components/site/WhatsAppIcon";

export function Layout({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen flex flex-col">
      <header className="sticky top-0 z-40 border-b border-border bg-background/85 backdrop-blur">
        <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-4 py-3">
          <div className="font-display text-xl tracking-tight">
            ESTET<span className="text-primary">CAR</span>
            <span className="ml-2 hidden text-xs font-sans text-muted-foreground sm:inline">guincho 24h</span>
          </div>
          <WhatsAppAction className="btn-whatsapp text-sm"><WhatsAppIcon className="h-4 w-4" /> WhatsApp 24h</WhatsAppAction>
        </div>
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
            <WhatsAppAction className="font-semibold text-primary underline-offset-4 hover:underline">Enviar minha localização →</WhatsAppAction>
          </div>
        </div>
        <p className="pb-6 text-center text-xs text-muted-foreground">© {new Date().getFullYear()} {BUSINESS.name}</p>
      </footer>
      <WhatsAppAction label="Chamar a Estetcar no WhatsApp" className="fab-whatsapp">
        <WhatsAppIcon className="h-7 w-7" />
      </WhatsAppAction>
    </div>
  );
}

export function Reveal({ children, delay = 0 }: { children: ReactNode; delay?: number }) {
  return <div className="reveal" style={{ animationDelay: `${delay}ms` }}>{children}</div>;
}

