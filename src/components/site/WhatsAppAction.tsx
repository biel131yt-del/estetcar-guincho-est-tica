import type { ReactNode } from "react";
import { whatsappLink } from "@/lib/business";

export function WhatsAppAction({ children, message, className, label }: {
  children: ReactNode;
  message?: string;
  className?: string;
  label?: string;
}) {
  return <a href={whatsappLink(message)} className={className} aria-label={label}>{children}</a>;
}