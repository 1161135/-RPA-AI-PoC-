import type { ChannelId, Role } from './types';

export type ContentTrack = 'product' | 'public_communication';
export type ContentRisk = 'block' | 'warning' | 'notice';
export type CreativeStatus = 'editing' | 'pending_review' | 'blocked' | 'returned' | 'pending_final_review' | 'approved_waiting_publish' | 'externally_logged';
export type ReturnReason = '合规风险' | '卖点不符' | '表述不规范' | '渠道规则不匹配';
export type KnowledgeBaseVersion = { id: string; version: string; reviewer: string; effectiveAt: string; scope: string };
export type CreativeHistory = { at: string; by: Role; action: string; note: string; knowledgeBaseVersion: string };

export type CreativeDraft = {
  id: string;
  track: ContentTrack;
  channel: ChannelId;
  risk: ContentRisk;
  status: CreativeStatus;
  owner: string;
  body: string;
  knowledgeBase: KnowledgeBaseVersion;
  history: CreativeHistory[];
};

export type CreativeTemplate = { id: string; category: string; type: '标题' | '图文' | '脚本' | '沟通话术'; body: string; approvedAt: string; knowledgeBase: KnowledgeBaseVersion };
export type PublishCheckIn = { channel: ChannelId; reference: string; publishedBy: string; publishedAt: string; note?: string };
