import type { CreativeDraft, CreativeTemplate, KnowledgeBaseVersion } from '../domain/creativeCompliance';

export const knowledgeBaseFixture: KnowledgeBaseVersion = { id: 'kb-eye-2026-07', version: 'v2026.07', reviewer: '运营主管', effectiveAt: '2026-07-01', scope: '眼部健康科普（模拟预审知识库）' };

export const creativeDraftFixtures: CreativeDraft[] = [
  { id: 'creative-product-101', track: 'product', channel: 'douyin', risk: 'warning', status: 'editing', owner: '运营专员', body: '夏季居家护理图文草稿：绝对有效的护理建议。', knowledgeBase: knowledgeBaseFixture, history: [] },
  { id: 'creative-public-203', track: 'public_communication', channel: 'douyin', risk: 'notice', status: 'pending_review', owner: '运营专员', body: '眼部不适相关健康科普回复草稿。\n\n本文仅为健康科普，不构成医疗建议；如有不适请咨询专业医师。', knowledgeBase: knowledgeBaseFixture, history: [] },
  { id: 'creative-product-305', track: 'product', channel: 'tmall', risk: 'block', status: 'blocked', owner: '运营主管', body: '可根治眼干问题。', knowledgeBase: knowledgeBaseFixture, history: [{ at: '2026-07-27T09:00:00Z', by: 'manager', action: 'blocked', note: '治疗承诺命中强拦截', knowledgeBaseVersion: 'v2026.07' }] },
];

export const creativeTemplateFixtures: CreativeTemplate[] = [
  { id: 'template-101', category: '眼部护理', type: '图文', body: '居家护理图文模板（模拟）：说明适用信息与使用提示。', approvedAt: '2026-07-20', knowledgeBase: knowledgeBaseFixture },
  { id: 'template-203', category: '健康科普', type: '沟通话术', body: '健康科普沟通模板（模拟）。', approvedAt: '2026-07-21', knowledgeBase: knowledgeBaseFixture },
];
