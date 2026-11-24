import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import {
  Outlet,
  createRootRouteWithContext,
  HeadContent,
  Scripts,
  type ErrorComponentProps,
} from "@tanstack/react-router";
import type { ReactNode } from "react";

import { WhatsAppAction } from "@/components/site/WhatsAppAction";

import appCss from "../styles.css?url";

function NotFoundComponent() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="max-w-md text-center">
        <h1 className="text-7xl font-bold text-foreground">404</h1>
        <h2 className="mt-4 text-xl font-semibold text-foreground">Página não encontrada</h2>
        <p className="mt-2 text-sm text-muted-foreground">
          O endereço pode ter mudado.
        </p>
        <div className="mt-6">
          <WhatsAppAction className="btn-whatsapp">Pedir ajuda no WhatsApp</WhatsAppAction>
        </div>
      </div>
    </div>
  );
}

function ErrorComponent({ error }: ErrorComponentProps) {
  console.error(error);

  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="max-w-md text-center">
        <h1 className="text-xl font-semibold tracking-tight text-foreground">
          A página não carregou
        </h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Fale com a Estetcar pelo WhatsApp para pedir atendimento.
        </p>
        <div className="mt-6 flex flex-wrap justify-center gap-2">
          <WhatsAppAction className="btn-whatsapp">Pedir ajuda no WhatsApp</WhatsAppAction>
        </div>
      </div>
    </div>
  );
}

export const Route = createRootRouteWithContext<{ queryClient: QueryClient }>()({
  head: () => ({
    // Replace these placeholders with the app's name and description when first building the app.
    // Each content route, / included, must still set its own head(). Never add og:image or
    // twitter:image here: every page without its own would inherit the root's preview image.
    meta: [
      { charSet: "utf-8" },
      { name: "viewport", content: "width=device-width, initial-scale=1" },
      { title: "Guincho 24 Horas Estetcar" },
      { name: "description", content: "Guincho e socorro automotivo 24h na Região Carbonífera – RS." },
      { name: "theme-color", content: "#1a1c22" },
    ],
    links: [
      {
        rel: "stylesheet",
        href: appCss,
      },
      { rel: "preconnect", href: "https://fonts.googleapis.com" },
      { rel: "stylesheet", href: "https://fonts.googleapis.com/css2?family=Archivo+Black&family=Barlow:wght@400;600;700&display=swap" },
      { rel: "icon", href: "/estetcar.svg", type: "image/svg+xml" },
    ],
  }),
  shellComponent: RootShell,
  component: RootComponent,
  notFoundComponent: NotFoundComponent,
  errorComponent: ErrorComponent,
});

function RootShell({ children }: { children: ReactNode }) {
  return (
    <html lang="pt-BR">
      <head>
        <HeadContent />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "AutoTowing",
              name: "Guincho 24 Horas Estetcar",
              telephone: "+5551998026941",
              openingHours: "Mo-Su 00:00-23:59",
              areaServed: ["São Jerônimo", "Charqueadas", "Triunfo", "Arroio dos Ratos", "Rio Grande do Sul"],
              geo: { "@type": "GeoCoordinates", latitude: -29.9610881, longitude: -51.6874006 },
              hasMap: "https://www.google.com/maps/place/Guincho+24+horas+estetcar/@-29.9610881,-51.6874006,17z",
            }),
          }}
        />
      </head>
      <body>
        {children}
        <Scripts />
      </body>
    </html>
  );
}

function RootComponent() {
  const { queryClient } = Route.useRouteContext();

  return (
    <QueryClientProvider client={queryClient}>
      {/* Required: nested routes render here. Removing <Outlet /> breaks all child routes. */}
      <Outlet />
    </QueryClientProvider>
  );
}

