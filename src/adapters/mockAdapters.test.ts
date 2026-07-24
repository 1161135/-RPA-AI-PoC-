import { describe, expect, it } from 'vitest';
import { failedJdAdapter, mockAdapters } from './mockAdapters';

describe('mock channel adapters', () => {
  it('exposes three channel adapters backed by seven days of multi-SKU fixtures', async () => {
    const results = await Promise.all(mockAdapters.map((adapter) => adapter.load()));

    expect(results).toHaveLength(3);
    expect(results.every((result) => result.status === 'success')).toBe(true);
    expect(new Set(results.flatMap((result) => result.rows.map((row) => row.date))).size).toBe(7);
    expect(results.every((result) => new Set(result.rows.map((row) => row.sku)).size >= 2)).toBe(true);
  });

  it('keeps the last successful JD snapshot when an adapter fails', async () => {
    await expect(failedJdAdapter.load()).resolves.toMatchObject({
      status: 'failed',
      isFallback: true,
      lastSuccessfulAt: '2026-07-24T08:25:00+08:00',
      error: 'JD API timeout',
    });
  });
});
