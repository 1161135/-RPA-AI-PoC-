import Papa from 'papaparse';
import type { ChannelId } from '../domain/types';

export type LeadImportRow = {
  channel: ChannelId;
  contentId: string;
  comment: string;
  occurredAt: string;
  maskedUserId?: string;
  sourceEvidenceId?: string;
};

export type LeadImportIssue = {
  row: number;
  code: 'missing_required_field' | 'invalid_channel' | 'invalid_date' | 'personal_data_detected' | 'invalid_content';
  field: string;
  message: string;
};

export type NormalizedLeadRow = {
  normalized?: LeadImportRow;
  issues: LeadImportIssue[];
  suggestions: string[];
};

const channels = new Set<ChannelId>(['tmall', 'jd', 'douyin']);
const phonePattern = /(?<!\d)1[3-9]\d{9}(?!\d)/;
const emailPattern = /[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}/i;
const explicitAccountPattern = /(?:微信|手机号|电话|邮箱|联系(?:我|方式)?)[：:\s]*[\w@.-]+/i;

function normalizeDate(value: string): string | undefined {
  const dotted = value.trim().match(/^(\d{4})[./](\d{1,2})[./](\d{1,2})$/);
  if (dotted) return `${dotted[1]}-${dotted[2].padStart(2, '0')}-${dotted[3].padStart(2, '0')}`;
  if (/^\d{4}-\d{2}-\d{2}$/.test(value.trim())) return value.trim();
  return undefined;
}

export function normalizeLeadRow(input: Record<string, string>, row: number): NormalizedLeadRow {
  const issues: LeadImportIssue[] = [];
  const suggestions: string[] = [];
  const channel = input.channel?.trim() as ChannelId | undefined;
  const contentId = input.contentId?.trim();
  const comment = input.comment?.trim();
  const rawDate = input.occurredAt?.trim();

  for (const [field, value] of Object.entries({ channel, contentId, comment, occurredAt: rawDate })) {
    if (!value) issues.push({ row, field, code: 'missing_required_field', message: `${field} 为必填字段` });
  }
  if (channel && !channels.has(channel)) issues.push({ row, field: 'channel', code: 'invalid_channel', message: '渠道仅支持 tmall、jd 或 douyin' });
  const occurredAt = rawDate ? normalizeDate(rawDate) : undefined;
  if (rawDate && !occurredAt) issues.push({ row, field: 'occurredAt', code: 'invalid_date', message: '日期格式应为 YYYY-MM-DD' });
  if (comment && (phonePattern.test(comment) || emailPattern.test(comment) || explicitAccountPattern.test(comment))) {
    issues.push({ row, field: 'comment', code: 'personal_data_detected', message: '疑似包含可识别个人信息，请先在源文件中完成脱敏' });
  }
  if (comment && comment.length > 1_000) issues.push({ row, field: 'comment', code: 'invalid_content', message: '评论长度不能超过 1000 字符' });
  if (rawDate && occurredAt && rawDate !== occurredAt) suggestions.push(`日期已规范化为 ${occurredAt}`);

  if (issues.length > 0 || !channel || !contentId || !comment || !occurredAt) return { issues, suggestions };
  return {
    normalized: {
      channel,
      contentId,
      comment,
      occurredAt,
      maskedUserId: input.maskedUserId?.trim() || undefined,
      sourceEvidenceId: input.sourceEvidenceId?.trim() || undefined,
    },
    issues,
    suggestions,
  };
}

export async function parseLeadCsv(file: File): Promise<NormalizedLeadRow[]> {
  return new Promise((resolve, reject) => {
    const rows: NormalizedLeadRow[] = [];
    Papa.parse<Record<string, string>>(file, {
      header: true,
      skipEmptyLines: 'greedy',
      worker: true,
      step: ({ data }) => rows.push(normalizeLeadRow(data, rows.length + 2)),
      complete: () => resolve(rows),
      error: (error) => reject(error),
    });
  });
}
