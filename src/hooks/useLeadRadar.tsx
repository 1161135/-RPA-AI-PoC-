import { createContext, useContext, useMemo, useState, type PropsWithChildren } from 'react';
import { leadRadarFixtures } from '../data/leadRadarFixtures';
import { classifyLead } from '../services/leadScoring';

export type RadarLead = (typeof leadRadarFixtures)[number] & ReturnType<typeof classifyLead>;
type LeadRadarContextValue = { leads: RadarLead[]; selectedId: string; setSelectedId: (id: string) => void };
const LeadRadarContext = createContext<LeadRadarContextValue | null>(null);

export function LeadRadarProvider({ children }: PropsWithChildren) {
  const [selectedId, setSelectedId] = useState('lead-001');
  const leads = useMemo(() => leadRadarFixtures.map((lead) => ({ ...lead, ...classifyLead(lead.comment) })), []);
  return <LeadRadarContext.Provider value={{ leads, selectedId, setSelectedId }}>{children}</LeadRadarContext.Provider>;
}

export function useLeadRadar() {
  const value = useContext(LeadRadarContext);
  if (!value) throw new Error('useLeadRadar must be used inside LeadRadarProvider');
  return value;
}
