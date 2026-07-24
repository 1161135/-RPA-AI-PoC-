import { describe, expect, it } from 'vitest';
import { canTransitionAnomaly } from './types';

describe('role permissions', () => {
  it('allows an operator to claim an anomaly but blocks management edits', () => {
    expect(canTransitionAnomaly('operator', 'pending', 'in_progress')).toBe(true);
    expect(canTransitionAnomaly('executive', 'pending', 'in_progress')).toBe(false);
  });
});
