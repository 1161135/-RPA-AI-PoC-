import { createContext, createElement, useContext, useMemo, useState, type PropsWithChildren } from 'react';
import type { ChannelId, Role } from '../domain/types';

export type PeriodPreset = 'yesterday' | 'last_7_days' | 'month' | 'custom';
export type CockpitFilters = { period: PeriodPreset; channels: ChannelId[]; customRange?: { from: string; to: string } };
export type CockpitContextValue = {
  filters: CockpitFilters;
  role: Role;
  setPeriod: (period: PeriodPreset) => void;
  toggleChannel: (channel: ChannelId) => void;
  setRole: (role: Role) => void;
  setCustomRange: (range: NonNullable<CockpitFilters['customRange']>) => void;
};

const ALL_CHANNELS: ChannelId[] = ['tmall', 'jd', 'douyin'];
const CockpitContext = createContext<CockpitContextValue | null>(null);

export function CockpitProvider({ children }: PropsWithChildren) {
  const [filters, setFilters] = useState<CockpitFilters>({ period: 'yesterday', channels: ALL_CHANNELS });
  const [role, setRole] = useState<Role>('operator');
  const value = useMemo<CockpitContextValue>(() => ({
    filters, role, setRole,
    setPeriod: (period) => setFilters((current) => ({ ...current, period })),
    toggleChannel: (channel) => setFilters((current) => {
      const selected = current.channels.includes(channel);
      if (selected && current.channels.length === 1) return current;
      return { ...current, channels: selected ? current.channels.filter((item) => item !== channel) : [...current.channels, channel] };
    }),
    setCustomRange: (customRange) => setFilters((current) => ({ ...current, period: 'custom', customRange })),
  }), [filters, role]);
  return createElement(CockpitContext.Provider, { value }, children);
}

export function useCockpitContext(): CockpitContextValue {
  const context = useContext(CockpitContext);
  if (!context) throw new Error('useCockpitContext must be used within CockpitProvider');
  return context;
}
