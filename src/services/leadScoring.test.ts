import { describe, expect, it } from 'vitest';
import { classifyLead, findSimilarLeads, type ScoredLead } from './leadScoring';

describe('lead scoring', () => {
  it('routes price objection to a review queue rather than discarding a purchase signal', () => {
    expect(classifyLead('眼干滴眼液太贵了，哪个更适合？')).toMatchObject({ intent: 'price_sensitive', priority: 'medium' });
  });

  it('blocks a strong compliance phrase before purchase intent is considered', () => {
    expect(classifyLead('保证治愈吗，我要买')).toMatchObject({ riskLevel: 'strong_block' });
  });

  it('only labels similar wording as a manual-review hint', () => {
    const current = { id: 'a', comment: '眼干怎么缓解', channel: 'douyin' } as ScoredLead;
    const matches = findSimilarLeads(current, [current, { id: 'b', comment: '眼干怎么缓解比较好', channel: 'jd' } as ScoredLead]);

    expect(matches).toEqual(expect.arrayContaining([expect.objectContaining({ id: 'b', kind: 'similar_content' })]));
  });
});
