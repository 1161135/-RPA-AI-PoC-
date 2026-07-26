import type { ChannelId } from '../domain/types';
import type { LeadRiskLevel } from '../domain/leads';

export type LeadIntent = 'purchase_ready' | 'needs_guidance' | 'price_sensitive' | 'service_recovery' | 'filtered' | 'general';
export type LeadPriority = 'high' | 'medium' | 'low' | 'filtered';
export type LeadClassification = {
  intent: LeadIntent;
  priority: LeadPriority;
  riskLevel: LeadRiskLevel;
  matchedTerms: string[];
  lossReason?: 'irrelevant' | 'hostile' | 'service_recovery' | 'compliance_block';
};

export type ScoredLead = {
  id: string;
  comment: string;
  channel: ChannelId;
};

export type SimilarLeadHint = {
  id: string;
  kind: 'similar_content';
  score: number;
};

const strongBlockTerms = ['保证治愈', '根治', '绝对有效', '处方药推荐'];
const explicitRejectTerms = ['不要再推', '别联系', '拉黑'];
const hostileTerms = ['骗子', '垃圾', '投诉'];
const priceTerms = ['太贵', '价格高', '便宜点'];
const decisionTerms = ['我要买', '求推荐', '哪个好', '有用吗'];
const demandTerms = ['怎么缓解', '用什么', '怎么修复'];
const symptomTerms = ['眼干', '眼痒', '红血丝', '皮肤修复', '伤口愈合'];

function matches(text: string, terms: string[]): string[] {
  return terms.filter((term) => text.includes(term));
}

export function classifyLead(comment: string): LeadClassification {
  const termMatches = [
    ...matches(comment, strongBlockTerms),
    ...matches(comment, explicitRejectTerms),
    ...matches(comment, hostileTerms),
    ...matches(comment, priceTerms),
    ...matches(comment, decisionTerms),
    ...matches(comment, demandTerms),
    ...matches(comment, symptomTerms),
  ];
  if (matches(comment, strongBlockTerms).length > 0) return { intent: 'general', priority: 'filtered', riskLevel: 'strong_block', matchedTerms: termMatches, lossReason: 'compliance_block' };
  if (matches(comment, explicitRejectTerms).length > 0 || matches(comment, hostileTerms).length > 0) return { intent: 'filtered', priority: 'filtered', riskLevel: 'low', matchedTerms: termMatches, lossReason: 'hostile' };
  if (matches(comment, priceTerms).length > 0 && matches(comment, symptomTerms).length > 0) return { intent: 'price_sensitive', priority: 'medium', riskLevel: 'warning', matchedTerms: termMatches };
  if (matches(comment, decisionTerms).length > 0 && matches(comment, symptomTerms).length > 0) return { intent: 'purchase_ready', priority: 'high', riskLevel: 'low', matchedTerms: termMatches };
  if (matches(comment, demandTerms).length > 0 && matches(comment, symptomTerms).length > 0) return { intent: 'needs_guidance', priority: 'medium', riskLevel: 'low', matchedTerms: termMatches };
  return { intent: 'general', priority: 'low', riskLevel: 'low', matchedTerms: termMatches };
}

function normalizedTokens(text: string): Set<string> {
  const normalized = text.replace(/[，。！？、？\s]/g, '');
  return new Set(symptomTerms.concat(demandTerms, decisionTerms).filter((term) => normalized.includes(term)));
}

export function findSimilarLeads(current: ScoredLead, candidates: ScoredLead[]): SimilarLeadHint[] {
  const currentTokens = normalizedTokens(current.comment);
  return candidates.flatMap((candidate) => {
    if (candidate.id === current.id) return [];
    const otherTokens = normalizedTokens(candidate.comment);
    const overlap = [...currentTokens].filter((token) => otherTokens.has(token));
    const union = new Set([...currentTokens, ...otherTokens]);
    const score = union.size === 0 ? 0 : overlap.length / union.size;
    return score >= 0.33 ? [{ id: candidate.id, kind: 'similar_content' as const, score }] : [];
  });
}
