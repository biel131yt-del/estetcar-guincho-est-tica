import { z } from 'zod';

export const statuses = ['novo', 'confirmado', 'em_atendimento', 'concluido', 'cancelado'] as const;
export const statusLabels: Record<(typeof statuses)[number], string> = { novo: 'Novo', confirmado: 'Confirmado', em_atendimento: 'Em atendimento', concluido: 'Concluído', cancelado: 'Cancelado' };
export const bookingSchema = z.object({
  request_key: z.uuid(),
  name: z.string().trim().min(2).max(80),
  phone: z.string().transform(v => v.replace(/\D/g, '')).pipe(z.string().min(10).max(15)),
  service: z.string().trim().min(1).max(100),
  vehicle: z.string().trim().min(1).max(80),
  scheduled_date: z.iso.date(),
  scheduled_time: z.string().regex(/^([01]\d|2[0-3]):[0-5]\d$/),
  origin: z.string().trim().min(1).max(120),
  destination: z.string().trim().min(1).max(120),
  notes: z.string().trim().max(400),
});
export type BookingInput = z.input<typeof bookingSchema>;
export function bookingMessage(b: BookingInput) {
  return `Olá! Quero agendar um serviço.\n\nNome: ${b.name}\nTelefone: ${b.phone}\nServiço: ${b.service}\nVeículo: ${b.vehicle}\nData: ${b.scheduled_date} às ${b.scheduled_time}\nOrigem: ${b.origin}\nDestino: ${b.destination}\nObs: ${b.notes}`;
}
export function bookingFromForm(form: HTMLFormElement, requestKey: string): BookingInput {
  const f = new FormData(form);
  const g = (key: string) => String(f.get(key) ?? '');
  return { request_key: requestKey, name: g('name'), phone: g('phone'), service: g('service'), vehicle: g('vehicle'), scheduled_date: g('scheduled_date'), scheduled_time: g('scheduled_time'), origin: g('origin'), destination: g('destination'), notes: g('notes') };
}