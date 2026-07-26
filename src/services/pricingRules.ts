export type PriceSnapshot = { channel: string; sku: string; competitorId: string; at: string; price: number };
export type PriceRiskInput = { price: number; note?: string; previousPrice: number; target: number; mappingAgeDays: number };

export function dedupeSnapshots(snapshots: PriceSnapshot[]): PriceSnapshot[] {
  const latest = new Map<string, PriceSnapshot>();
  for (const snapshot of snapshots) {
    const key = `${snapshot.channel}|${snapshot.sku}|${snapshot.competitorId}|${snapshot.at.slice(0, 10)}`;
    if (!latest.has(key) || latest.get(key)!.at < snapshot.at) latest.set(key, snapshot);
  }
  return [...latest.values()];
}

export function detectPriceRisk(input: PriceRiskInput) {
  if (/定金|凑单|错价勿拍/.test(input.note ?? '') || input.price <= 1) return { type: 'suspect_price', severity: 'medium', action: 'data_quality_review' };
  if (input.mappingAgeDays > 7) return { type: 'stale_mapping', severity: 'medium', action: 'mapping_update' };
  if (input.previousPrice > 0 && (input.previousPrice - input.price) / input.previousPrice >= 0.1) return { type: 'competitor_drop', severity: 'high', action: 'price_review' };
  if (input.target > 0 && Math.abs(input.price - input.target) / input.target >= 0.08) return { type: 'target_deviation', severity: 'medium', action: 'strategy_review' };
  return { type: 'normal', severity: 'low', action: 'none' };
}
