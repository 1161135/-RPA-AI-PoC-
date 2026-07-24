import { describe, expect, it } from 'vitest';
import type { Anomaly } from '../domain/types';
import { detectAnomalies } from './anomalies';

const products = [
  { sku: 'SKU-203', stock: 8, averageDailySales: 3, channel: 'jd' as const, demoDate: '2026-07-23' },
  { sku: 'SKU-ZERO', stock: 0, averageDailySales: 0, channel: 'jd' as const, demoDate: '2026-07-23' },
];

describe('detectAnomalies', () => {
  it('creates a high inventory anomaly below three sellable days', () => {
    expect(detectAnomalies(products, [])).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          id: 'stock-SKU-203',
          type: '库存风险',
          severity: 'high',
        }),
      ]),
    );
  });

  it('does not create a high inventory anomaly when zero stock has no sales velocity', () => {
    expect(detectAnomalies([{ sku: 'SKU-ZERO', stock: 0, averageDailySales: 0, channel: 'jd', demoDate: '2026-07-23' }], [])).toEqual([]);
  });

  it('creates sales and price anomalies when configured thresholds are exceeded', () => {
    const detected = detectAnomalies([{
      sku: 'SKU-RULE', stock: 100, averageDailySales: 10, channel: 'tmall', demoDate: '2026-07-23',
      latestPaidOrders: 12, averageDailyOrders: 20, currentPrice: 88, targetPrice: 100,
    }], []);
    expect(detected).toEqual(expect.arrayContaining([
      expect.objectContaining({ id: 'sales-SKU-RULE-2026-07-23', type: '销量异常' }),
      expect.objectContaining({ id: 'price-SKU-RULE-2026-07-23', type: '价格异常' }),
    ]));
  });

  it('deduplicates generated anomalies and preserves existing workflow history', () => {
    const existing: Anomaly = {
      id: 'stock-SKU-203',
      type: '库存风险',
      severity: 'high',
      status: 'in_progress',
      owner: '供应链专员',
      title: '已有人处理的库存风险',
      detail: '保留详情',
      recommendation: '保留建议',
      createdAt: '2026-07-24T08:30:00',
      channel: 'jd',
      demoDate: '2026-07-23',
      history: [{ at: '2026-07-24T09:00:00', by: 'operator', status: 'in_progress', note: '已认领' }],
    };

    expect(detectAnomalies(products, [existing])).toEqual([existing]);
  });
});
