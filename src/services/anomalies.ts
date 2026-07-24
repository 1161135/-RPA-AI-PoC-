import type { Anomaly } from '../domain/types';

export type ProductInventory = {
  sku: string;
  stock: number;
  averageDailySales: number;
};

const createInventoryAnomaly = (product: ProductInventory): Anomaly => ({
  id: `stock-${product.sku}`,
  type: '库存风险',
  severity: 'high',
  status: 'pending',
  owner: '供应链专员',
  title: `${product.sku} 库存可售天数低于 3 天`,
  detail: `当前库存 ${product.stock}，近 7 日平均日销 ${product.averageDailySales}`,
  recommendation: '复核库存并安排补货',
  createdAt: '2026-07-24T08:30:00+08:00',
  history: [],
});

/**
 * Returns extant workflow records unchanged and only appends genuinely new rule hits.
 * Zero sales velocity is deliberately excluded to avoid a false stockout alert.
 */
export const detectAnomalies = (products: ProductInventory[], existing: Anomaly[]): Anomaly[] => {
  const existingIds = new Set(existing.map((anomaly) => anomaly.id));
  const generated = products
    .filter(
      (product) =>
        product.averageDailySales > 0 && product.stock / product.averageDailySales < 3,
    )
    .map(createInventoryAnomaly)
    .filter((anomaly) => !existingIds.has(anomaly.id));

  return [...existing, ...generated];
};
