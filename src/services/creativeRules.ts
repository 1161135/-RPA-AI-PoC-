import type { ContentRisk } from '../domain/creativeCompliance';
import type { ChannelId } from '../domain/types';

const blockedTerms = ['根治', '治疗', '处方药推荐'];
const warningTerms = ['绝对有效', '立刻改善'];
const disclaimer = '本文仅为健康科普，不构成医疗建议；如有不适请咨询专业医师。';

export function selectStrictestRisk(risks: ContentRisk[]): ContentRisk {
  return risks.includes('block') ? 'block' : risks.includes('warning') ? 'warning' : 'notice';
}

export function evaluateCreative(text: string, _channel: ChannelId): { risk: ContentRisk; terms: string[] } {
  const terms = [...blockedTerms, ...warningTerms].filter((term) => text.includes(term));
  const risk: ContentRisk = terms.some((term) => blockedTerms.includes(term)) ? 'block' : terms.length ? 'warning' : 'notice';
  return { risk, terms };
}

export function appendPublicDisclaimer(text: string): string {
  return text.includes(disclaimer) ? text : `${text}\n\n${disclaimer}`;
}

export function applyLowRiskRewrite(text: string): string {
  return text.replaceAll('绝对有效', '建议结合个人情况').replaceAll('立刻改善', '可关注日常护理');
}
