import { describe, expect, it } from 'vitest';
import { importedOrderFixtures, assignmentRules } from '../data/orderServiceFixtures';
import { assignOwner, buildOrderRisks, getSlaState } from './orderRules';

describe('order service rules', () => {
  it('filters normal orders and merges multiple rule hits into one risk', () => {
    expect(buildOrderRisks([importedOrderFixtures[3]])).toEqual([]);
    const merged = buildOrderRisks([{ ...importedOrderFixtures[0], stockAvailable: false }]);
    expect(merged).toHaveLength(1);
    expect(merged[0].rules).toEqual(['price_conflict', 'fulfilment_check']);
    expect(merged[0].severity).toBe('high');
  });

  it('calculates SLA from detection time and assigns by channel rule', () => {
    expect(getSlaState('high', '2026-07-25T08:00:00Z', '2026-07-26T09:00:00Z')).toBe('overdue');
    expect(getSlaState('low', '2026-07-26T08:30:00Z', '2026-07-26T10:00:00Z', 'consultation')).toBe('on_track');
    expect(assignOwner({ channel: 'douyin', type: 'price_conflict' }, assignmentRules)).toBe('运营专员');
    expect(assignOwner({ channel: 'jd', type: 'refund' }, assignmentRules)).toBe('待主管分派');
  });
});
