import { useEffect, useState, type FormEvent } from "react";
import { bookingRequest } from "@/lib/booking-client";
import { brl, cents, decimalUnits, distance, estimateFreight, type CompanySettings, type Freight, type MonthlySummary } from "@/lib/freight";

export function BusinessOverview({ revision, month, setMonth }: { revision: number; month: string; setMonth: (month: string) => void }) {
  const [summary, setSummary] = useState<MonthlySummary | null>(null);
  const [error, setError] = useState("");
  useEffect(() => {
    const controller = new AbortController();
    setSummary(null);
    setError("");
    if (!month) return;
    bookingRequest<MonthlySummary>(`/api/admin/resumo?month=${encodeURIComponent(month)}`, "GET", undefined, controller.signal)
      .then((data) => { if (!controller.signal.aborted) setSummary(data); })
      .catch(() => { if (!controller.signal.aborted) setError("Resumo indisponível. Atualize a página para tentar novamente."); });
    return () => controller.abort();
  }, [month, revision]);

  const items = summary && [
    ["Pedidos / em aberto", `${summary.orders} / ${summary.open}`],
    ["Recebido", brl(summary.received)],
    ["A receber", brl(summary.pending)],
    ["Custos registrados", brl(summary.costs)],
    ["Recebido menos custos", brl(summary.received - summary.costs)],
  ];
  return <section className="mt-7" aria-labelledby="business-overview">
    <div className="flex flex-wrap items-end justify-between gap-3">
      <div>
        <h2 id="business-overview" className="text-2xl">Visão da empresa</h2>
        <p className="mt-1 text-sm text-muted-foreground">Valores agrupados pelo mês da data agendada.</p>
      </div>
      <label className="grid gap-1 text-sm">Mês de referência
        <input className="field" type="month" value={month} onChange={(event) => setMonth(event.target.value)} />
      </label>
    </div>
    {items && <dl className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
      {items.map(([name, value]) => <div key={name} className="rounded-lg border border-border bg-card p-4">
        <dt className="text-sm text-muted-foreground">{name}</dt>
        <dd className="mt-1 text-lg font-bold">{value}</dd>
      </div>)}
    </dl>}
    {error && <p role="alert" className="mt-3 text-destructive">{error}</p>}
    {!month && <p className="mt-3 text-sm text-muted-foreground">Selecione o mês para consultar os valores.</p>}
    {month && !items && !error && <p role="status" className="mt-3 text-sm text-muted-foreground">Carregando resumo…</p>}
  </section>;
}

export function CompanyForm({ settings, onSaved }: { settings: CompanySettings; onSaved: (settings: CompanySettings) => void }) {
  const [busy, setBusy] = useState(false);
  const [feedback, setFeedback] = useState("");
  const [failed, setFailed] = useState(false);
  async function save(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (busy) return;
    const data = new FormData(event.currentTarget);
    setBusy(true);
    setFeedback("");
    setFailed(false);
    try {
      const saved = await bookingRequest<CompanySettings>("/api/admin/empresa", "PUT", {
        name: data.get("name"),
        operating_notes: data.get("operating_notes"),
        base_cents: decimalUnits(data.get("base_cents"), 2),
        per_km_cents: decimalUnits(data.get("per_km_cents"), 2),
        minimum_cents: decimalUnits(data.get("minimum_cents"), 2),
        version: settings.version,
      });
      onSaved(saved);
      setFeedback("Configurações salvas.");
    } catch (error) {
      setFailed(true);
      setFeedback(error instanceof Error ? error.message : "Falha ao salvar a empresa.");
    } finally {
      setBusy(false);
    }
  }

  return <details className="card-hover mt-5">
    <summary className="cursor-pointer font-semibold">Empresa e tabela de frete</summary>
    <form className="mt-4" onSubmit={save}>
      <fieldset disabled={busy} className="grid gap-4 sm:grid-cols-3">
        <label className="grid gap-1 text-sm sm:col-span-3">Nome de exibição no painel
          <input className="field" name="name" defaultValue={settings.name} required minLength={2} maxLength={100} />
        </label>
        <AmountInput label="Taxa de saída (R$)" name="base_cents" amount={settings.base_cents} required />
        <AmountInput label="Tarifa por km (R$)" name="per_km_cents" amount={settings.per_km_cents} required />
        <AmountInput label="Frete mínimo (R$)" name="minimum_cents" amount={settings.minimum_cents} required />
        <label className="grid gap-1 text-sm sm:col-span-3">Notas internas da operação
          <textarea className="field" name="operating_notes" defaultValue={settings.operating_notes} rows={3} maxLength={2000} />
        </label>
        <p className="text-sm text-muted-foreground sm:col-span-3">O cálculo soma a taxa de saída à quilometragem, aplica o mínimo e acrescenta os adicionais do pedido.</p>
        <button className="btn-primary justify-self-start sm:col-span-3" type="submit">{busy ? "Salvando…" : "Salvar configurações"}</button>
      </fieldset>
      {feedback && <p className={`mt-3 ${failed ? "text-destructive" : ""}`} role={failed ? "alert" : "status"}>{feedback}</p>}
    </form>
  </details>;
}

function AmountInput({ label, name, amount, required = false }: { label: string; name: string; amount: number; required?: boolean }) {
  return <label className="grid gap-1 text-sm">{label}
    <input className="field" type="number" min="0" max="1000000" step="0.01" name={name} required={required} defaultValue={amount / 100} />
  </label>;
}

export function FreightFields({ freight, company }: { freight: Freight; company: CompanySettings | null }) {
  const [km, setKm] = useState(freight.distance_meters === null ? "" : String(freight.distance_meters / 1000));
  const [extra, setExtra] = useState(String(freight.extras_cents / 100));
  const [price, setPrice] = useState(freight.freight_cents === null ? "" : String(freight.freight_cents / 100));
  const meters = distance.safeParse(decimalUnits(km, 3));
  const extras = cents.safeParse(decimalUnits(extra, 2) ?? 0);
  const tariffSet = company && (company.base_cents > 0 || company.per_km_cents > 0 || company.minimum_cents > 0);
  const amount = company && tariffSet && meters.success && extras.success
    ? estimateFreight(company, meters.data, extras.data) : null;
  return <fieldset className="grid gap-3 rounded-lg border border-border p-4 sm:grid-cols-2">
    <legend className="px-2 font-semibold">Frete e pagamento</legend>
    <label className="grid gap-1 text-sm">Distância cobrada (km)
      <input className="field" type="number" name="distance_km" min="0" max="20000" step="0.001" value={km} onChange={(event) => setKm(event.target.value)} />
    </label>
    <label className="grid gap-1 text-sm">Adicionais (R$)
      <input className="field" type="number" name="extras" min="0" max="1000000" step="0.01" value={extra} onChange={(event) => setExtra(event.target.value)} />
    </label>
    <label className="grid gap-1 text-sm">Valor final do frete (R$)
      <input className="field" type="number" name="freight_price" min="0" max="1000000" step="0.01" value={price} onChange={(event) => setPrice(event.target.value)} />
    </label>
    <AmountInput label="Custo do atendimento (R$)" name="cost" amount={freight.cost_cents} />
    <div className="flex flex-wrap items-center gap-3 sm:col-span-2">
      <label className="flex items-center gap-2 text-sm">
        <input type="checkbox" name="received" defaultChecked={freight.payment_received} /> Pagamento recebido
      </label>
      {amount !== null && cents.safeParse(amount).success && <button type="button" className="btn-outline text-sm" onClick={() => setPrice((amount / 100).toFixed(2))}>
        Usar cálculo de {brl(amount)}
      </button>}
      {amount !== null && !cents.safeParse(amount).success && <p className="text-sm text-destructive">O cálculo ultrapassou o limite de valor do frete.</p>}
      {!tariffSet && <p className="text-sm text-muted-foreground">Cadastre as tarifas da empresa para habilitar o cálculo.</p>}
    </div>
  </fieldset>;
}