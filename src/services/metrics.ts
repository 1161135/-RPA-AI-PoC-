export type MetricRow = {
  paidAmount: number;
  refundedAmount: number;
  visits: number;
  paidOrders: number;
};

export const calculateMetrics = (rows: MetricRow[]) => {
  const gmv = rows.reduce((sum, row) => sum + row.paidAmount, 0);
  const refunds = rows.reduce((sum, row) => sum + row.refundedAmount, 0);
  const visits = rows.reduce((sum, row) => sum + row.visits, 0);
  const paidOrders = rows.reduce((sum, row) => sum + row.paidOrders, 0);

  return {
    gmv,
    refunds,
    visits,
    paidOrders,
    conversionRate: visits === 0 ? 0 : paidOrders / visits,
    aov: paidOrders === 0 ? 0 : gmv / paidOrders,
  };
};

/** Simulated ROI: successful runs multiplied by the standard manual time per run. */
export const calculateSavedHours = (successfulRuns: number, manualMinutes: number) =>
  (successfulRuns * manualMinutes) / 60;

/** Returns the relative change against a comparable prior period, or null when no baseline exists. */
export const calculatePeriodChange = (current: number, previous: number): number | null =>
  previous === 0 ? null : (current - previous) / previous;
