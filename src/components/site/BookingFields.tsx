import { SERVICES } from '@/lib/business';

export function BookingFields() {
  return <>
    <label className="grid gap-1 text-sm">Nome<input required name="name" autoComplete="name" minLength={2} maxLength={80} className="field" /></label>
    <label className="grid gap-1 text-sm">Telefone / WhatsApp<input required type="tel" name="phone" autoComplete="tel" minLength={10} maxLength={20} className="field" /></label>
    <label className="grid gap-1 text-sm">Serviço<select name="service" className="field">{SERVICES.map(s => <option key={s.title}>{s.title}</option>)}</select></label>
    <label className="grid gap-1 text-sm">Veículo (modelo e ano)<input required name="vehicle" maxLength={80} className="field" /></label>
    <label className="grid gap-1 text-sm">Data<input required type="date" name="scheduled_date" className="field" /></label>
    <label className="grid gap-1 text-sm">Horário<input required type="time" name="scheduled_time" className="field" /></label>
    <label className="grid gap-1 text-sm">Origem<input required name="origin" maxLength={120} className="field" /></label>
    <label className="grid gap-1 text-sm">Destino<input required name="destination" maxLength={120} className="field" /></label>
    <label className="grid gap-1 text-sm sm:col-span-2">Observações<textarea name="notes" rows={3} maxLength={400} className="field" /></label>
  </>;
}
