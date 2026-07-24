import { describe, expect, it } from 'vitest';
import { generatePowerBiCsv } from './export';

const rows = [
  {
    date: '2026-07-22', channel: 'tmall', sku: 'SKU-101', visits: 100, paidOrders: 6,
    paidAmount: 900, refundedAmount: 0, stock: 20, averageDailySales: 5,
    customerName: '不应导出', phone: '13800000000', address: '不应导出地址',
  },
  {
    date: '2026-07-23', channel: 'jd', sku: 'SKU-203', visits: 80, paidOrders: 4,
    paidAmount: 600, refundedAmount: 10, stock: 8, averageDailySales: 3,
    customerName: '不应导出', phone: '13900000000', address: '不应导出地址',
  },
] as const;

describe('generatePowerBiCsv', () => {
  it('exports only the approved de-identified schema and applies the current filters', () => {
    const csv = generatePowerBiCsv(rows, {
      period: 'yesterday',
      channels: ['jd'],
    });

    expect(csv.split('\n')).toEqual([
      'date,channel,sku,visits,paidOrders,paidAmount,refundedAmount,stock,averageDailySales',
      '2026-07-23,jd,SKU-203,80,4,600,10,8,3',
    ]);
    expect(csv).not.toMatch(/customerName|phone|address|13800000000|不应导出/);
  });
});
