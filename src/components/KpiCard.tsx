type KpiCardProps = { label: string; value: string; delta?: string; tone?: 'positive' | 'negative' | 'neutral' | 'accent'; caption?: string };
export function KpiCard({ label, value, delta, tone = 'neutral', caption }: KpiCardProps) {
  return <article className="kpi-card"><p className="kpi-label">{label}</p><div className="kpi-value-row"><strong>{value}</strong>{delta && <span className={`delta delta-${tone}`}>{delta}</span>}</div>{caption && <p className="kpi-caption">{caption}</p>}</article>;
}
