import { z } from "zod";

export const cents = z.number().int().min(0).max(100_000_000);
export const distance = z.number().int().min(0).max(20_000_000);
export const monthSchema = z.string().regex(/^20\d{2}-(0[1-9]|1[0-2])$/);

export const companySchema = z.object({
  name: z.string().trim().min(2).max(100),
  operating_notes: z.string().trim().max(2000),
  base_cents: cents,
  per_km_cents: cents,
  minimum_cents: cents,
  version: z.number().int().positive(),
});

export type CompanySettings = z.infer<typeof companySchema>;

export type Freight = {
  distance_meters: number | null;
  extras_cents: number;
  freight_cents: number | null;
  cost_cents: number;
  payment_received: boolean;
};

export type MonthlySummary = {
  orders: number;
  open: number;
  received: number;
  pending: number;
  costs: number;
};

export function estimateFreight(rates: CompanySettings, meters: number, extras: number) {
  const mileage = Math.round(rates.per_km_cents * meters / 1000);
  return Math.max(rates.minimum_cents, rates.base_cents + mileage) + extras;
}

export function localMonth() {
  return new Intl.DateTimeFormat("sv-SE", {
    timeZone: "America/Sao_Paulo", year: "numeric", month: "2-digit",
  }).format();
}

export function decimalUnits(value: FormDataEntryValue | null, digits: number) {
  const text = String(value ?? "").trim().replace(",", ".");
  if (!text) return null;
  if (!/^\d+(\.\d+)?$/.test(text)) return Number.NaN;
  const [whole, fraction = ""] = text.split(".");
  if (fraction.length > digits) return Number.NaN;
  return Number(whole) * 10 ** digits + Number(fraction.padEnd(digits, "0"));
}

export const brl = (value: number) => new Intl.NumberFormat("pt-BR", {
  style: "currency", currency: "BRL",
}).format(value / 100);
