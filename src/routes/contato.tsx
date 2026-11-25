import { createFileRoute, redirect } from "@tanstack/react-router";
import { whatsappLink } from "@/lib/business";

export const Route = createFileRoute("/contato")({
  beforeLoad: () => {
    throw redirect({ href: whatsappLink(), statusCode: 302 });
  },
});