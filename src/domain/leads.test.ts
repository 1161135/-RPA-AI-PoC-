import { describe, expect, it } from 'vitest';
import { canConfirmLead, canTransitionLead, type LeadRecord } from './leads';

const lead = {
  id: 'lead-001',
  status: 'pending_review',
  riskLevel: 'low',
} as LeadRecord;

describe('lead workflow permissions', () => {
  it('allows an assigned operator to move a low-risk lead into external execution', () => {
    expect(canTransitionLead('operator', 'approved', 'pending_external')).toBe(true);
  });

  it('blocks every role from confirming a strong compliance block', () => {
    expect(canConfirmLead({ ...lead, riskLevel: 'strong_block' }, 'manager')).toBe(false);
  });
});
