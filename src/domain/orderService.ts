import type { ChannelId, Role } from './types';

export type OrderRiskType = 'price_conflict' | 'fulfilment_check' | 'review_required';
export type TicketType = 'refund' | 'reshipment' | 'consultation';
export type WorkSeverity = 'high' | 'medium' | 'low';
export type OrderRiskStatus = 'pending_review' | 'in_progress' | 'resolved' | 'ignored' | 'external_logged';
export type TicketStatus = 'pending' | 'in_progress' | 'awaiting_external' | 'awaiting_customer' | 'closed';
export type SlaState = 'on_track' | 'due_soon' | 'overdue';

export type WorkHistory = { at: string; by: Role; action: string; note: string };

export type ImportedOrder = {
  orderId: string;
  channel: ChannelId;
  detectedAt: string;
  source: string;
  customerKey: string;
  paidAmount: number;
  expectedAmount: number;
  stockAvailable: boolean;
  addressValid: boolean;
  repeatedOrder: boolean;
};

export type OrderRisk = {
  id: string;
  orderId: string;
  channel: ChannelId;
  severity: WorkSeverity;
  rules: OrderRiskType[];
  status: OrderRiskStatus;
  owner: string;
  detectedAt: string;
  source: string;
  customerKey: string;
  history: WorkHistory[];
};

export type AfterSalesTicket = {
  id: string;
  orderId: string;
  channel: ChannelId;
  ticketType: TicketType;
  severity: WorkSeverity;
  status: TicketStatus;
  owner: string;
  createdAt: string;
  source: string;
  customerKey: string;
  summary: string;
  history: WorkHistory[];
};

export type AssignmentRule = { channel: ChannelId; type: OrderRiskType | TicketType; owner: string };
export type RefundCheckIn = { refundAmount: number; reference: string };
export type ReshipmentCheckIn = { trackingNumber: string; variant: string; reference?: string };
export type ConsultationCheckIn = { replySummary: string; reference?: string };
