import type { AssignmentRule, ImportedOrder, OrderRisk, OrderRiskType, SlaState, TicketType, WorkSeverity } from '../domain/orderService';
import type { ChannelId } from '../domain/types';

const severityRank: Record<WorkSeverity, number> = { high: 3, medium: 2, low: 1 };

function detectRules(row: ImportedOrder): OrderRiskType[] {
  const rules: OrderRiskType[] = [];
  if (row.paidAmount !== row.expectedAmount) rules.push('price_conflict');
  if (!row.stockAvailable || !row.addressValid) rules.push('fulfilment_check');
  if (row.repeatedOrder) rules.push('review_required');
  return rules;
}

function severityFor(rules: OrderRiskType[]): WorkSeverity {
  return rules.some((rule) => rule === 'price_conflict' || rule === 'review_required') ? 'high' : 'medium';
}

export function buildOrderRisks(rows: ImportedOrder[]): OrderRisk[] {
  return Object.values(rows.reduce<Record<string, OrderRisk>>((result, row) => {
    const rules = detectRules(row);
    if (!rules.length) return result;
    const severity = severityFor(rules);
    const current = result[row.orderId];
    result[row.orderId] = current
      ? { ...current, rules: [...new Set([...current.rules, ...rules])], severity: severityRank[severity] > severityRank[current.severity] ? severity : current.severity }
      : { id: `risk-${row.orderId}`, orderId: row.orderId, channel: row.channel, severity, rules, status: 'pending_review', owner: '待主管分派', detectedAt: row.detectedAt, source: row.source, customerKey: row.customerKey, history: [] };
    return result;
  }, {}));
}

export function getSlaHours(severity: WorkSeverity, ticketType?: TicketType) {
  return ticketType === 'consultation' ? 48 : severity === 'high' ? 24 : 72;
}

export function getSlaState(severity: WorkSeverity, detectedAt: string, now: string, ticketType?: TicketType): SlaState {
  const usedHours = (Date.parse(now) - Date.parse(detectedAt)) / 3_600_000;
  const limit = getSlaHours(severity, ticketType);
  return usedHours >= limit ? 'overdue' : usedHours >= limit * 0.8 ? 'due_soon' : 'on_track';
}

export function assignOwner(input: { channel: ChannelId; type: OrderRiskType | TicketType }, rules: AssignmentRule[]) {
  return rules.find((rule) => rule.channel === input.channel && rule.type === input.type)?.owner ?? '待主管分派';
}
