import type { AfterSalesTicket, ConsultationCheckIn, OrderRisk, OrderRiskStatus, RefundCheckIn, ReshipmentCheckIn } from '../domain/orderService';
import type { Role } from '../domain/types';

export function canHandleOrderRisk(role: Role, risk: OrderRisk, next: OrderRiskStatus, actorName: string): boolean {
  if (role === 'executive') return false;
  if (role === 'operator' && risk.owner !== actorName) return false;
  if (risk.status === 'pending_review') return next === 'in_progress';
  if (risk.status === 'in_progress') return next === 'resolved' || next === 'ignored';
  return role === 'manager' && next === 'in_progress';
}

export function canBatchHandle(item: OrderRisk | AfterSalesTicket, role: Role): boolean {
  return role !== 'executive' && 'ticketType' in item && item.ticketType === 'consultation';
}

export function logExternalAction(ticket: AfterSalesTicket, data: RefundCheckIn | ReshipmentCheckIn | ConsultationCheckIn): AfterSalesTicket {
  const valid = ticket.ticketType === 'refund'
    ? 'refundAmount' in data && data.refundAmount > 0 && Boolean(data.reference)
    : ticket.ticketType === 'reshipment'
      ? 'trackingNumber' in data && Boolean(data.trackingNumber) && Boolean(data.variant)
      : 'replySummary' in data && Boolean(data.replySummary);
  if (!valid) throw new Error('外部执行字段不完整');
  const note = 'refundAmount' in data
    ? `退款金额 ¥${data.refundAmount}；凭证 ${data.reference}`
    : 'trackingNumber' in data
      ? `物流单号 ${data.trackingNumber}；规格 ${data.variant}`
      : `回复摘要：${data.replySummary}`;
  return { ...ticket, status: 'closed', history: [...ticket.history, { at: '2026-07-26T10:00:00Z', by: 'operator', action: 'external_logged', note }] };
}
