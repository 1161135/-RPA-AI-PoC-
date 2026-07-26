import { describe, expect, it } from 'vitest';
import { buildProposal, evaluateMargin } from './pricingStrategies';

describe('pricing proposal strategies', () => {
  it('keeps a margin-floor proposal above the safety price', () => {
    expect(buildProposal({ strategy: 'margin_floor', cost: 80, marginFloor: 0.2, competitorLow: 90, current: 110, target: 105, averageDailySales: 10, evaluationDays: 7 })).toMatchObject({ suggestedPrice: 100, marginProtected: true });
  });

  it('marks a price below five percent margin as a hard stop', () => {
    expect(evaluateMargin({ suggestedPrice: 84, cost: 80 }).hardStop).toBe(true);
  });
});
