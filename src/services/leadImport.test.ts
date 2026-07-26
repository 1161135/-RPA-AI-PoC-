import { describe, expect, it } from 'vitest';
import { normalizeLeadRow } from './leadImport';

describe('normalizeLeadRow', () => {
  it('suggests a normalized date for an otherwise valid row', () => {
    const result = normalizeLeadRow({
      channel: 'douyin', contentId: 'video-1', comment: '眼干怎么办', occurredAt: '2026.7.26',
    }, 2);

    expect(result.normalized?.occurredAt).toBe('2026-07-26');
    expect(result.suggestions).toContain('日期已规范化为 2026-07-26');
  });

  it('rejects rows containing a phone number instead of importing and masking it', () => {
    const result = normalizeLeadRow({
      channel: 'jd', contentId: 'a', comment: '联系我 13800138000', occurredAt: '2026-07-26',
    }, 5);

    expect(result.issues[0]).toMatchObject({ code: 'personal_data_detected', row: 5 });
  });
});
