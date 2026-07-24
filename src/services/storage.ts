import { canTransitionAnomaly, type Anomaly, type AnomalyStatus, type Role } from '../domain/types';

export const ANOMALIES_STORAGE_KEY = 'rpa-cockpit-anomalies';

const simulatedAnomalies: Anomaly[] = [
  {
    id: 'conversion-SKU-305',
    type: '转化异常',
    severity: 'medium',
    status: 'pending',
    owner: '抖音运营专员',
    title: 'SKU-305 支付转化率较近 7 日均值下降 24%',
    detail: '模拟数据：需复核内容流量、商品页与活动价格。',
    recommendation: '检查商品链接、投放计划和详情页转化链路。',
    createdAt: '2026-07-24T08:30:00+08:00',
    channel: 'douyin',
    demoDate: '2026-07-23',
    source: 'preset',
    history: [],
  },
  {
    id: 'compliance-SKU-101',
    type: '合规异常',
    severity: 'high',
    status: 'pending',
    owner: '合规审核专员',
    title: 'SKU-101 详情页待完成医药合规复核',
    detail: '模拟规则命中：敏感宣传语待人工药师确认。',
    recommendation: '暂停素材更新，并提交合规审核。',
    createdAt: '2026-07-24T08:30:00+08:00',
    channel: 'tmall',
    demoDate: '2026-07-23',
    source: 'preset',
    history: [],
  },
];

export function loadAnomalies(): Anomaly[] {
  try {
    const stored = localStorage.getItem(ANOMALIES_STORAGE_KEY);
    return stored ? JSON.parse(stored) as Anomaly[] : simulatedAnomalies;
  } catch {
    return simulatedAnomalies;
  }
}

export function saveAnomalies(anomalies: Anomaly[]): void {
  localStorage.setItem(ANOMALIES_STORAGE_KEY, JSON.stringify(anomalies));
}

export function updateAnomalyStatus(
  anomaly: Anomaly,
  status: AnomalyStatus,
  by: Role,
  note: string,
): Anomaly | null {
  if (!canTransitionAnomaly(by, anomaly.status, status)) return null;
  return {
    ...anomaly,
    status,
    history: [...anomaly.history, { at: new Date().toISOString(), by, status, note }],
  };
}
