import { describe, expect, it } from 'vitest';
import { canBulkApprove, logPriceExecution, type PricingProposal } from './pricingWorkflow';

const hardStopProposal: PricingProposal = { id: 'p-1', status: 'pending_approval', hardStop: true, history: [] };

describe('price approval workflow', () => {
  it('does not permit bulk approval for a hard-stop proposal', () => {
    expect(canBulkApprove(hardStopProposal)).toBe(false);
  });

  it('requires approval before external execution check-in', () => {
    expect(logPriceExecution({ ...hardStopProposal, hardStop: false }, 'operator', { platform: 'douyin', actualPrice: 99, evidenceRef: 'ticket-1', note: '已人工执行' })).toBeNull();
  });
});
