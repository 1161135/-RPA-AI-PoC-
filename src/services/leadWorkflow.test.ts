import { describe, expect, it } from 'vitest';
import type { LeadRecord } from '../domain/leads';
import { copyDraft, logExternalAction } from './leadWorkflow';

const approvedLead: LeadRecord = {
  id: 'lead-001',
  status: 'pending_external',
  riskLevel: 'low',
  ownerId: 'operator-1',
  history: [],
};

describe('lead workflow actions', () => {
  it('does not treat copying a draft as an external send', () => {
    expect(copyDraft(approvedLead, '健康科普草稿').status).toBe('pending_external');
  });

  it('requires an operator to log the external action before follow-up', () => {
    const logged = logExternalAction(approvedLead, 'operator', {
      channel: 'douyin', action: 'manual_comment', note: '已由运营在平台内完成',
    });

    expect(logged?.status).toBe('externally_logged');
    expect(logged?.history[0]?.action).toBe('external_action_logged');
  });

  it('does not let an executive mutate a lead', () => {
    expect(logExternalAction(approvedLead, 'executive', { channel: 'jd', action: 'manual_reply', note: 'x' })).toBeNull();
  });
});
