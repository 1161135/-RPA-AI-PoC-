import type { Anomaly, ChannelId } from '../domain/types';

export type ProductInventory = {
  sku: string;
  stock: number;
  averageDailySales: number;
  channel: ChannelId;
  demoDate: string;
  latestPaidOrders?: number;
  averageDailyOrders?: number;
  currentPrice?: number;
  targetPrice?: number;
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
  channel: product.channel,
  demoDate: product.demoDate,
  source: 'detected',
  history: [],
});

const createSalesAnomaly = (product: ProductInventory): Anomaly => {
  const orderChange = ((product.latestPaidOrders! - product.averageDailyOrders!) / product.averageDailyOrders!) * 100;
  const direction = orderChange < 0 ? '下降' : '上升';
  return {
    id: `sales-${product.sku}-${product.demoDate}`,
    type: '销量异常', severity: 'medium', status: 'pending', owner: '渠道运营专员',
    title: `${product.sku} 当日订单较 7 日均值${direction} ${Math.abs(orderChange).toFixed(0)}%`,
    detail: `当日支付订单 ${product.latestPaidOrders}，近 7 日日均订单 ${product.averageDailyOrders}。`,
    recommendation: orderChange < 0 ? '检查流量、活动与商品页转化链路。' : '复核订单质量并确认库存承接能力。',
    createdAt: '2026-07-24T08:30:00+08:00', channel: product.channel, demoDate: product.demoDate, source: 'detected', history: [],
  };
};

const createPriceAnomaly = (product: ProductInventory): Anomaly => ({
  id: `price-${product.sku}-${product.demoDate}`,
  type: '价格异常', severity: 'high', status: 'pending', owner: '商品运营专员',
  title: `${product.sku} 当前价偏离目标价超过 10%`,
  detail: `当前价 ¥${product.currentPrice}，目标价 ¥${product.targetPrice}。`,
  recommendation: '人工核对活动、优惠券与商品价格配置；PoC 不执行自动改价。',
  createdAt: '2026-07-24T08:30:00+08:00', channel: product.channel, demoDate: product.demoDate, source: 'detected', history: [],
});

/**
 * Returns extant workflow records unchanged and only appends genuinely new rule hits.
 * Zero sales velocity is deliberately excluded to avoid a false stockout alert.
 */
export const detectAnomalies = (products: ProductInventory[], existing: Anomaly[]): Anomaly[] => {
  const existingIds = new Set(existing.map((anomaly) => anomaly.id));
  const inventoryAnomalies = products
    .filter(
      (product) =>
        product.averageDailySales > 0 && product.stock / product.averageDailySales < 3,
    )
    .map(createInventoryAnomaly)
    .filter((anomaly) => !existingIds.has(anomaly.id));
  const salesAnomalies = products
    .filter((product) => product.latestPaidOrders !== undefined && product.averageDailyOrders && (product.latestPaidOrders / product.averageDailyOrders < 0.8 || product.latestPaidOrders / product.averageDailyOrders > 1.3))
    .map(createSalesAnomaly)
    .filter((anomaly) => !existingIds.has(anomaly.id));
  const priceAnomalies = products
    .filter((product) => product.currentPrice !== undefined && product.targetPrice && Math.abs(product.currentPrice - product.targetPrice) / product.targetPrice > 0.1)
    .map(createPriceAnomaly)
    .filter((anomaly) => !existingIds.has(anomaly.id));

  return [...existing, ...inventoryAnomalies, ...salesAnomalies, ...priceAnomalies];
};
