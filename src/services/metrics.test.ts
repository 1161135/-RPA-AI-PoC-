import { describe, expect, it } from 'vitest';
import { calculateMetrics, calculatePeriodChange, calculateSavedHours } from './metrics';

describe('calculateMetrics', () => {
  it('calculates GMV only from paid orders and reports refunds separately', () => {
    expect(
      calculateMetrics([
        { paidAmount: 100, refundedAmount: 10, visits: 20, paidOrders: 2 },
        { paidAmount: 50, refundedAmount: 0, visits: 30, paidOrders: 1 },
      ]),
    ).toMatchObject({
      gmv: 150,
      refunds: 10,
      visits: 50,
      paidOrders: 3,
      conversionRate: 0.06,
      aov: 50,
    });
  });

  it('returns zero rates when visits or paid orders are zero', () => {
    expect(
      calculateMetrics([{ paidAmount: 0, refundedAmount: 0, visits: 0, paidOrders: 0 }]),
    ).toMatchObject({ conversionRate: 0, aov: 0 });
  });

  it('calculates simulated saved hours from successful runs and manual minutes', () => {
    expect(calculateSavedHours(16, 15)).toBe(4);
  });

  it('calculates a comparable period change without dividing by zero', () => {
    expect(calculatePeriodChange(126, 120)).toBeCloseTo(0.05);
    expect(calculatePeriodChange(10, 0)).toBeNull();
  });
});
