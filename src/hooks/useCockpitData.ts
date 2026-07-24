import { createContext, createElement, useContext, useMemo, useState, type PropsWithChildren } from 'react';
import type { Anomaly, AutomationTask, ChannelId, Role } from '../domain/types';
import { automationTaskFixtures, sourceRows, type SourceRow } from '../data/mock-data';
import { calculateMetrics } from '../services/metrics';
import { detectAnomalies } from '../services/anomalies';
import { loadAnomalies, saveAnomalies } from '../services/storage';

export type PeriodPreset = 'yesterday' | 'last_7_days' | 'month' | 'custom';
export type CockpitFilters = { period: PeriodPreset; channels: ChannelId[]; customRange?: { from: string; to: string } };
export type CockpitContextValue = {
  filters: CockpitFilters;
  role: Role;
  setPeriod: (period: PeriodPreset) => void;
  toggleChannel: (channel: ChannelId) => void;
  setRole: (role: Role) => void;
  setCustomRange: (range: NonNullable<CockpitFilters['customRange']>) => void;
  anomalyRecords: Anomaly[];
  persistAnomalies: (next: Anomaly[]) => void;
};

export type ChannelMetric = ReturnType<typeof calculateMetrics> & { channel: ChannelId };
export type TrendPoint = { date: string } & Record<ChannelId, number>;
export type SkuMetric = ReturnType<typeof calculateMetrics> & {
  sku: string;
  stock: number;
  averageDailySales: number;
  channel: ChannelId;
  demoDate: string;
};
export type CockpitData = {
  filteredRows: SourceRow[];
  metrics: ReturnType<typeof calculateMetrics>;
  channelMetrics: ChannelMetric[];
  trend: TrendPoint[];
  skuMetrics: SkuMetric[];
};

const ALL_CHANNELS: ChannelId[] = ['tmall', 'jd', 'douyin'];
const CockpitContext = createContext<CockpitContextValue | null>(null);

export function CockpitProvider({ children }: PropsWithChildren) {
  const [filters, setFilters] = useState<CockpitFilters>({ period: 'yesterday', channels: ALL_CHANNELS });
  const [role, setRole] = useState<Role>('operator');
  const [anomalyRecords, setAnomalyRecords] = useState<Anomaly[]>(loadAnomalies);
  const value = useMemo<CockpitContextValue>(() => ({
    filters, role, setRole, anomalyRecords,
    persistAnomalies: (next) => { setAnomalyRecords(next); saveAnomalies(next); },
    setPeriod: (period) => setFilters((current) => ({ ...current, period })),
    toggleChannel: (channel) => setFilters((current) => {
      const selected = current.channels.includes(channel);
      if (selected && current.channels.length === 1) return current;
      return { ...current, channels: selected ? current.channels.filter((item) => item !== channel) : [...current.channels, channel] };
    }),
    setCustomRange: (customRange) => setFilters((current) => ({ ...current, period: 'custom', customRange })),
  }), [anomalyRecords, filters, role]);
  return createElement(CockpitContext.Provider, { value }, children);
}

export function useCockpitContext(): CockpitContextValue {
  const context = useContext(CockpitContext);
  if (!context) throw new Error('useCockpitContext must be used within CockpitProvider');
  return context;
}

function datesForPeriod(rows: SourceRow[], filters: CockpitFilters): Set<string> {
  const ordered = [...new Set(rows.map((row) => row.date))].sort();
  if (filters.period === 'custom' && filters.customRange) {
    return new Set(ordered.filter((date) => date >= filters.customRange!.from && date <= filters.customRange!.to));
  }
  if (filters.period === 'yesterday') return new Set(ordered.slice(-1));
  if (filters.period === 'last_7_days') return new Set(ordered.slice(-7));
  const latestMonth = ordered[ordered.length - 1]?.slice(0, 7);
  return new Set(ordered.filter((date) => date.startsWith(latestMonth ?? '')));
}

function aggregateRows(rows: SourceRow[]) {
  return calculateMetrics(rows);
}

/** Derives every visible business KPI from source rows after global filters are applied. */
export function useCockpitData(): CockpitData {
  const { filters } = useCockpitContext();
  return useMemo(() => {
    const selectedDates = datesForPeriod(sourceRows, filters);
    const filteredRows = sourceRows.filter((row) => selectedDates.has(row.date) && filters.channels.includes(row.channel));
    const channelMetrics = ALL_CHANNELS
      .filter((channel) => filters.channels.includes(channel))
      .map((channel) => ({ channel, ...aggregateRows(filteredRows.filter((row) => row.channel === channel)) }));
    const dates = [...new Set(filteredRows.map((row) => row.date))].sort();
    const trend = dates.map((date) => {
      const point: TrendPoint = { date, tmall: 0, jd: 0, douyin: 0 };
      ALL_CHANNELS.forEach((channel) => { point[channel] = aggregateRows(filteredRows.filter((row) => row.date === date && row.channel === channel)).gmv; });
      return point;
    });
    const skuIds = [...new Set(filteredRows.map((row) => row.sku))].sort();
    const skuMetrics = skuIds.map((sku) => {
      const rows = filteredRows.filter((row) => row.sku === sku);
      const latest = rows[rows.length - 1];
      return { sku, ...aggregateRows(rows), stock: latest?.stock ?? 0, averageDailySales: latest?.averageDailySales ?? 0, channel: latest?.channel ?? 'tmall', demoDate: latest?.date ?? '' };
    });
    return { filteredRows, metrics: aggregateRows(filteredRows), channelMetrics, trend, skuMetrics };
  }, [filters]);
}

/** Workflow records use the same global time and channel scope as the dashboard. */
export function useScopedAnomalies(): Anomaly[] {
  const { filters, anomalyRecords } = useCockpitContext();
  const { skuMetrics } = useCockpitData();
  return useMemo(() => {
    const scopedDates = datesForPeriod(sourceRows, filters);
    const all = detectAnomalies(
      skuMetrics.map(({ sku, stock, averageDailySales, channel, demoDate }) => ({ sku, stock, averageDailySales, channel, demoDate })),
      anomalyRecords,
    );
    return all.filter((anomaly) => filters.channels.includes(anomaly.channel) && scopedDates.has(anomaly.demoDate));
  }, [anomalyRecords, filters, skuMetrics]);
}

export function useAutomationTasks(): AutomationTask[] {
  const { filters } = useCockpitContext();
  return useMemo(() => {
    const scopedDates = datesForPeriod(sourceRows, filters);
    return automationTaskFixtures.filter((task) => filters.channels.includes(task.channel) && scopedDates.has(task.demoDate));
  }, [filters]);
}
