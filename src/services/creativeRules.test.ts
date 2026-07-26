import { describe, expect, it } from 'vitest';
import { appendPublicDisclaimer, applyLowRiskRewrite, evaluateCreative, selectStrictestRisk } from './creativeRules';

describe('creative compliance rules', () => {
  it('uses the strictest medical and advertising rule result', () => {
    expect(evaluateCreative('可根治眼干', 'douyin').risk).toBe('block');
    expect(evaluateCreative('绝对有效的护理建议', 'douyin').risk).toBe('warning');
    expect(selectStrictestRisk(['notice', 'warning'])).toBe('warning');
  });

  it('injects public disclaimer and rewrites weak-risk wording', () => {
    expect(appendPublicDisclaimer('健康科普草稿')).toContain('不构成医疗建议');
    expect(applyLowRiskRewrite('绝对有效，立刻改善')).toContain('建议结合个人情况');
  });
});
