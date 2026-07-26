import { describe, expect, it } from 'vitest';
import { afterSalesFixtures, orderRiskFixtures } from '../data/orderServiceFixtures';
import { canBatchHandle, canHandleOrderRisk, logExternalAction } from './orderWorkflow';

describe('order service workflow', () => {
  it('enforces ownership and keeps high-risk work out of batch actions', () => {
    const risk = orderRiskFixtures[0];
    expect(canHandleOrderRisk('operator', risk, 'in_progress', '运营专员')).toBe(true);
    expect(canHandleOrderRisk('operator', risk, 'resolved', '其他负责人')).toBe(false);
    expect(canHandleOrderRisk('executive', risk, 'in_progress', '运营专员')).toBe(false);
    expect(canBatchHandle(afterSalesFixtures[2], 'operator')).toBe(true);
    expect(canBatchHandle(risk, 'manager')).toBe(false);
  });

  it('records type-specific external check-ins and closes completed tickets', () => {
    const refund = logExternalAction(afterSalesFixtures[0], { refundAmount: 99, reference: 'RF-101' });
    expect(refund.status).toBe('closed');
    expect(refund.history[refund.history.length - 1]?.note).toContain('RF-101');
    const reshipment = logExternalAction(afterSalesFixtures[1], { trackingNumber: 'SF-20260726', variant: '10ml*2' });
    expect(reshipment.status).toBe('closed');
    expect(reshipment.history[reshipment.history.length - 1]?.note).toContain('SF-20260726');
    expect(() => logExternalAction(afterSalesFixtures[0], { refundAmount: 99, reference: '' })).toThrow('外部执行字段不完整');
  });
});
