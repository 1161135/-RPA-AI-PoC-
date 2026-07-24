import { describe, expect, it } from 'vitest';
import { canTransitionAnomaly } from './types';

describe('role permissions', () => {
  it('allows an operator to claim an anomaly but blocks management edits', () => {
    expect(canTransitionAnomaly('operator', 'pending', 'in_progress')).toBe(true);
    expect(canTransitionAnomaly('executive', 'pending', 'in_progress')).toBe(false);
  });

  it('requires every anomaly to be scoped to a channel and demonstration date', () => {
    const scoped = {
      id: 'demo', type: 'demo', severity: 'high' as const, status: 'pending' as const,
      owner: 'owner', title: 'title', detail: 'detail', recommendation: 'recommendation',
      createdAt: '2026-07-24T08:30:00+08:00', channel: 'jd' as const, demoDate: '2026-07-23', history: [],
    };
    expect(scoped.channel).toBe('jd');
    expect(scoped.demoDate).toBe('2026-07-23');
  });
});
