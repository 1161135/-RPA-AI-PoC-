import type { ChannelId } from '../domain/types';

export type ExportFilters = {
  period: 'yesterday' | 'last_7_days' | 'month' | 'custom';
  channels: ChannelId[];
  customRange?: { from: string; to: string };
};

/** The only fields permitted in the Power BI hand-off dataset. */
export const POWER_BI_FIELDS = [
  'date',
  'channel',
  'sku',
  'visits',
  'paidOrders',
  'paidAmount',
  'refundedAmount',
  'stock',
  'averageDailySales',
] as const;

export type PowerBiExportRow = Record<(typeof POWER_BI_FIELDS)[number], string | number>;

function datesForFilter(rows: ReadonlyArray<PowerBiExportRow>, filters: ExportFilters): Set<string> {
  const dates = [...new Set(rows.map((row) => String(row.date)))].sort();
  if (filters.period === 'custom' && filters.customRange) {
    return new Set(dates.filter((date) => date >= filters.customRange!.from && date <= filters.customRange!.to));
  }
  if (filters.period === 'yesterday') return new Set(dates.slice(-1));
  if (filters.period === 'last_7_days') return new Set(dates.slice(-7));
  const latestMonth = dates[dates.length - 1]?.slice(0, 7) ?? '';
  return new Set(dates.filter((date) => date.startsWith(latestMonth)));
}

function escapeCsv(value: string | number): string {
  const text = String(value);
  return /[",\n]/.test(text) ? `"${text.replace(/"/g, '""')}"` : text;
}

/**
 * Builds a de-identified CSV from the current global filter state.
 * Deliberately maps each approved field instead of spreading source rows so PII cannot leak.
 */
export function generatePowerBiCsv(
  rows: ReadonlyArray<PowerBiExportRow>,
  filters: ExportFilters,
): string {
  const selectedDates = datesForFilter(rows, filters);
  const selectedRows = rows.filter(
    (row) => selectedDates.has(String(row.date)) && filters.channels.includes(row.channel as ChannelId),
  );
  const lines = selectedRows.map((row) => POWER_BI_FIELDS.map((field) => escapeCsv(row[field])).join(','));
  return [POWER_BI_FIELDS.join(','), ...lines].join('\n');
}

/** Browser-only download helper used by the PoC's Power BI hand-off. */
export function downloadCsv(csv: string, filename = 'rpa-cockpit-power-bi.csv'): void {
  const url = URL.createObjectURL(new Blob([csv], { type: 'text/csv;charset=utf-8' }));
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  link.click();
  URL.revokeObjectURL(url);
}
