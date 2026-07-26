import type { AfterSalesTicket, AssignmentRule, ImportedOrder, OrderRisk } from '../domain/orderService';

export const importedOrderFixtures: ImportedOrder[] = [
  { orderId: 'DY-20260726-101', channel: 'douyin', detectedAt: '2026-07-26T09:00:00Z', source: '模拟快照', customerKey: 'U-***-018', paidAmount: 89, expectedAmount: 109, stockAvailable: true, addressValid: true, repeatedOrder: false },
  { orderId: 'JD-20260726-203', channel: 'jd', detectedAt: '2026-07-26T08:20:00Z', source: '模拟快照', customerKey: 'U-***-306', paidAmount: 129, expectedAmount: 129, stockAvailable: false, addressValid: false, repeatedOrder: false },
  { orderId: 'TM-20260726-305', channel: 'tmall', detectedAt: '2026-07-25T07:00:00Z', source: '最近成功快照（轻度降级）', customerKey: 'U-***-502', paidAmount: 199, expectedAmount: 199, stockAvailable: true, addressValid: true, repeatedOrder: true },
  { orderId: 'DY-20260726-420', channel: 'douyin', detectedAt: '2026-07-26T09:30:00Z', source: '模拟快照', customerKey: 'U-***-611', paidAmount: 69, expectedAmount: 69, stockAvailable: true, addressValid: true, repeatedOrder: false },
];

export const orderRiskFixtures: OrderRisk[] = [
  { id: 'order-risk-101', orderId: 'DY-20260726-101', channel: 'douyin', severity: 'high', rules: ['price_conflict'], status: 'pending_review', owner: '运营专员', detectedAt: '2026-07-26T09:00:00Z', source: '模拟快照', customerKey: 'U-***-018', history: [] },
  { id: 'order-risk-203', orderId: 'JD-20260726-203', channel: 'jd', severity: 'medium', rules: ['fulfilment_check'], status: 'in_progress', owner: '运营专员', detectedAt: '2026-07-26T08:20:00Z', source: '模拟快照', customerKey: 'U-***-306', history: [{ at: '2026-07-26T08:35:00Z', by: 'operator', action: 'started', note: '已请求仓配核验库存与区域' }] },
  { id: 'order-risk-305', orderId: 'TM-20260726-305', channel: 'tmall', severity: 'high', rules: ['review_required'], status: 'pending_review', owner: '待主管分派', detectedAt: '2026-07-25T07:00:00Z', source: '最近成功快照（轻度降级）', customerKey: 'U-***-502', history: [] },
];

export const afterSalesFixtures: AfterSalesTicket[] = [
  { id: 'ticket-refund-101', orderId: 'DY-20260725-088', channel: 'douyin', ticketType: 'refund', severity: 'medium', status: 'pending', owner: '运营专员', createdAt: '2026-07-26T07:00:00Z', source: '模拟快照', customerKey: 'U-***-221', summary: '退款申请，待核验履约状态', history: [] },
  { id: 'ticket-reship-203', orderId: 'JD-20260725-117', channel: 'jd', ticketType: 'reshipment', severity: 'high', status: 'awaiting_external', owner: '运营专员', createdAt: '2026-07-25T08:00:00Z', source: '最近成功快照（轻度降级）', customerKey: 'U-***-313', summary: '破损补发，待回填物流单号', history: [{ at: '2026-07-25T09:00:00Z', by: 'operator', action: 'approved', note: '人工复核后同意补发' }] },
  { id: 'ticket-consult-305', orderId: 'TM-20260726-210', channel: 'tmall', ticketType: 'consultation', severity: 'low', status: 'pending', owner: '运营专员', createdAt: '2026-07-26T08:30:00Z', source: '模拟快照', customerKey: 'U-***-441', summary: '咨询物流进度', history: [] },
];

export const assignmentRules: AssignmentRule[] = [
  { channel: 'douyin', type: 'price_conflict', owner: '运营专员' },
  { channel: 'jd', type: 'fulfilment_check', owner: '运营专员' },
  { channel: 'tmall', type: 'consultation', owner: '运营专员' },
];
