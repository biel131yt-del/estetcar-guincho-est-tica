import { createFileRoute, redirect } from "@tanstack/react-router";
import { whatsappLink } from "@/lib/business";

export const Route = createFileRoute("/agendar")({
  beforeLoad: () => {
    throw redirect({ href: whatsappLink("Olá, Estetcar! Preciso de um guincho ou transporte. Vou enviar os detalhes e minha localização."), statusCode: 302 });
  },
});