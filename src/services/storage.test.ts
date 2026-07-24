import { describe, expect, it } from 'vitest';
import type { Anomaly } from '../domain/types';
import { updateAnomalyStatus } from './storage';

const pending: Anomaly = {
  id: 'a-1', type: 'test', severity: 'high', status: 'pending', owner: 'owner', title: 'title', detail: 'detail',
  recommendation: 'recommendation', channel: 'jd', demoDate: '2026-07-23', createdAt: '2026-07-24T08:30:00+08:00', history: [],
};

describe('updateAnomalyStatus', () => {
  it('refuses a status change that the frozen actor cannot perform', () => {
    expect(updateAnomalyStatus(pending, 'in_progress', 'executive', 'attempt')).toBeNull();
  });
});
