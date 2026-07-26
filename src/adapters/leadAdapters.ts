import type { ChannelId } from '../domain/types';

export type LeadAdapter = {
  channel: ChannelId;
  authorizationType: 'official_api' | 'customer_local_authorization' | 'approved_snapshot';
  capability: 'realtime_read' | 'manual_assistance_only' | 'snapshot_readonly';
  dataMode: 'realtime' | 'snapshot_24h' | 'simulated';
  lastSuccessfulAt: string;
  noticePreview: string;
};

const adapters: Record<ChannelId, LeadAdapter> = {
  douyin: { channel: 'douyin', authorizationType: 'customer_local_authorization', capability: 'manual_assistance_only', dataMode: 'simulated', lastSuccessfulAt: '2026-07-26 09:30', noticePreview: '客户本地授权辅助：待运营人工执行' },
  tmall: { channel: 'tmall', authorizationType: 'official_api', capability: 'realtime_read', dataMode: 'realtime', lastSuccessfulAt: '2026-07-26 10:15', noticePreview: '官方授权数据：可在获准字段范围内读取' },
  jd: { channel: 'jd', authorizationType: 'approved_snapshot', capability: 'snapshot_readonly', dataMode: 'snapshot_24h', lastSuccessfulAt: '2026-07-25 21:00', noticePreview: '24 小时快照：不将缺失数据展示为零' },
};

export const getLeadAdapter = (channel: ChannelId): LeadAdapter => adapters[channel];
export const leadAdapters = Object.values(adapters);
