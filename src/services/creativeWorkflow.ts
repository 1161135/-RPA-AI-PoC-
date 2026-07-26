import type { CreativeDraft, CreativeStatus, PublishCheckIn } from '../domain/creativeCompliance';
import type { Role } from '../domain/types';

export function canTransition(role: Role, draft: CreativeDraft, next: CreativeStatus): boolean {
  if (role === 'executive') return false;
  if (draft.risk === 'block' && next !== 'editing') return false;
  if (draft.status === 'returned') return next === 'editing';
  if (draft.status === 'editing') return next === 'pending_review';
  if (draft.status === 'pending_review') return next === 'pending_final_review' || next === 'returned';
  if (draft.status === 'pending_final_review') return role === 'manager' && (next === 'approved_waiting_publish' || next === 'returned');
  return false;
}

export function canBulkReview(draft: CreativeDraft, role: Role): boolean {
  return role !== 'executive' && draft.track === 'product' && draft.risk === 'notice';
}

export function logPublish(draft: CreativeDraft, checkIn: PublishCheckIn): CreativeDraft {
  if (draft.status !== 'approved_waiting_publish' || !checkIn.reference.trim()) throw new Error('发布打卡条件不满足');
  return { ...draft, status: 'externally_logged', history: [...draft.history, { at: checkIn.publishedAt, by: 'operator', action: 'external_publish_logged', note: `${checkIn.channel}：${checkIn.reference}；发布人 ${checkIn.publishedBy}`, knowledgeBaseVersion: draft.knowledgeBase.version }] };
}
