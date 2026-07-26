import type { ChannelId } from '../domain/types';
import { canTransitionLead, type LeadRecord, type LeadRole } from '../domain/leads';

export type ExternalAction = {
  channel: ChannelId;
  action: 'manual_comment' | 'manual_reply' | 'manual_follow_up';
  note: string;
};

export function copyDraft(lead: LeadRecord, draft: string): LeadRecord & { copiedDraft: string } {
  return { ...lead, copiedDraft: draft };
}

export function logExternalAction(
  lead: LeadRecord,
  role: LeadRole,
  action: ExternalAction,
): LeadRecord | null {
  if (!action.note.trim() || !canTransitionLead(role, lead.status, 'externally_logged')) return null;
  return {
    ...lead,
    status: 'externally_logged',
    history: [...lead.history, {
      at: new Date().toISOString(),
      by: role,
      action: 'external_action_logged',
      note: `${action.channel}:${action.action} ${action.note.trim()}`,
    }],
  };
}
