export type Role = 'operator' | 'manager' | 'executive';
export type AnomalyStatus = 'pending' | 'in_progress' | 'resolved' | 'ignored';
export type ChannelId = 'tmall' | 'jd' | 'douyin';
export type AnomalySeverity = 'high' | 'medium';
export type HandlingMethod = '人工复核' | '已补货' | '已改价' | '优化投放' | '忽略';

export type Anomaly = {
  id: string;
  type: string;
  severity: AnomalySeverity;
  status: AnomalyStatus;
  owner: string;
  title: string;
  detail: string;
  recommendation: string;
  channel: ChannelId;
  demoDate: string;
  source?: 'preset' | 'detected';
  createdAt: string;
  history: Array<{ at: string; by: Role; status: AnomalyStatus; note: string; method?: HandlingMethod }>;
};

export type AutomationTaskStatus = 'success' | 'failed';
export type AutomationTask = {
  id: string;
  task: string;
  channel: ChannelId;
  status: AutomationTaskStatus;
  demoDate: string;
  lastSuccessfulAt: string;
  isFallback: boolean;
  manualMinutes: number;
  successfulRuns: number;
  detail: string;
};

const allowedTransitions: Record<Role, Record<AnomalyStatus, AnomalyStatus[]>> = {
  operator: {
    pending: ['in_progress'],
    in_progress: ['resolved', 'ignored'],
    resolved: [],
    ignored: [],
  },
  manager: {
    pending: ['in_progress', 'resolved', 'ignored'],
    in_progress: ['resolved', 'ignored'],
    resolved: ['in_progress'],
    ignored: ['in_progress'],
  },
  executive: {
    pending: [],
    in_progress: [],
    resolved: [],
    ignored: [],
  },
};

export const canTransitionAnomaly = (
  role: Role,
  from: AnomalyStatus,
  to: AnomalyStatus,
) => allowedTransitions[role][from].includes(to);
