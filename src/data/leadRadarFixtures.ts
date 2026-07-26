import type { ChannelId } from '../domain/types';

export const publicLeadKeywordGroups = {
  symptom: ['眼干', '眼痒', '红血丝', '皮肤修复', '伤口愈合'],
  demand: ['怎么缓解', '用什么', '怎么修复', '需要护理', '如何改善'],
  decision: ['求推荐', '哪个好', '我要买', '有用吗', '哪里能买'],
  negative: ['别联系', '不要再推', '骗子', '投诉', '垃圾'],
} as const;

export type LeadRadarFixture = {
  id: string;
  channel: ChannelId;
  contentId: string;
  comment: string;
  occurredAt: string;
  maskedUserId: string;
  sourceEvidenceId: string;
};

export const leadRadarFixtures: LeadRadarFixture[] = [
  { id: 'lead-001', channel: 'douyin', contentId: 'dy-video-108', comment: '眼干滴眼液太贵了，哪个更适合？', occurredAt: '2026-07-26', maskedUserId: 'u***8', sourceEvidenceId: 'sample-001' },
  { id: 'lead-002', channel: 'tmall', contentId: 'tm-detail-203', comment: '皮肤修复怎么缓解，求推荐', occurredAt: '2026-07-26', maskedUserId: 'u***2', sourceEvidenceId: 'sample-002' },
  { id: 'lead-003', channel: 'jd', contentId: 'jd-topic-012', comment: '保证治愈吗，我要买', occurredAt: '2026-07-26', maskedUserId: 'u***4', sourceEvidenceId: 'sample-003' },
];

export const leadRuleVersions = [
  { id: 'v1.1', status: 'current', publishedAt: '2026-07-26T09:30:00+08:00', note: '增加价格敏感分流与强拦截词' },
  { id: 'v1.0', status: 'historical', publishedAt: '2026-07-24T09:30:00+08:00', note: '初始眼部与皮肤修复需求词' },
] as const;
