import { describe, expect, it } from 'vitest';
import { creativeDraftFixtures } from '../data/creativeFixtures';
import { canBulkReview, canTransition, logPublish } from './creativeWorkflow';

describe('creative review workflow', () => {
  it('prevents strong blocks from bypassing review and allows returned drafts to re-enter editing', () => {
    const blocked = creativeDraftFixtures[2];
    expect(canTransition('operator', blocked, 'pending_final_review')).toBe(false);
    expect(canTransition('operator', { ...creativeDraftFixtures[0], status: 'returned' }, 'editing')).toBe(true);
    expect(canBulkReview({ ...creativeDraftFixtures[0], risk: 'notice' }, 'operator')).toBe(true);
    expect(canBulkReview(creativeDraftFixtures[1], 'manager')).toBe(false);
  });

  it('records external publishing as a human check-in', () => {
    const logged = logPublish({ ...creativeDraftFixtures[0], status: 'approved_waiting_publish' }, { channel: 'douyin', reference: 'DY-creative-101', publishedBy: '运营专员', publishedAt: '2026-07-27T10:00:00Z' });
    expect(logged.status).toBe('externally_logged');
    expect(logged.history[logged.history.length - 1].note).toContain('DY-creative-101');
  });
});
