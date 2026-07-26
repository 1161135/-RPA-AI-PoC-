import { describe, expect, it } from 'vitest';
import { dedupeSnapshots, detectPriceRisk } from './pricingRules';

describe('pricing risk rules', () => {
  it('uses the newest same-day channel sku competitor snapshot', () => {
    const result = dedupeSnapshots([
      { channel: 'douyin', sku: 'SKU-1', competitorId: 'c-1', at: '2026-07-26T08:00:00', price: 100 },
      { channel: 'douyin', sku: 'SKU-1', competitorId: 'c-1', at: '2026-07-26T09:00:00', price: 90 },
    ]);
    expect(result).toEqual([expect.objectContaining({ price: 90 })]);
  });

  it('routes a deposit-like competitor price to data-quality review', () => {
    expect(detectPriceRisk({ price: 1, note: '定金', previousPrice: 100, target: 110, mappingAgeDays: 0 })).toMatchObject({ type: 'suspect_price' });
  });
});
