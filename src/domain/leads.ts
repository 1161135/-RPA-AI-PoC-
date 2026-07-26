export type LeadStatus =
  | 'pending_review'
  | 'reviewing'
  | 'approved'
  | 'pending_external'
  | 'externally_logged'
  | 'followed_up'
  | 'ignored'
  | 'strong_block';

export type LeadRiskLevel = 'low' | 'warning' | 'strong_block';
export type LeadRole = 'operator' | 'manager' | 'executive';

export type LeadHistory = {
  at: string;
  by: LeadRole;
  action: string;
  note: string;
};

export type LeadRecord = {
  id: string;
  status: LeadStatus;
  riskLevel: LeadRiskLevel;
  ownerId: string;
  history: LeadHistory[];
};

const transitions: Record<LeadRole, Partial<Record<LeadStatus, LeadStatus[]>>> = {
  operator: {
    pending_review: ['reviewing'],
    reviewing: ['approved', 'ignored', 'strong_block'],
    approved: ['pending_external'],
    pending_external: ['externally_logged'],
    externally_logged: ['followed_up'],
  },
  manager: {
    pending_review: ['reviewing', 'ignored', 'strong_block'],
    reviewing: ['approved', 'ignored', 'strong_block'],
    approved: ['pending_external'],
    pending_external: ['externally_logged'],
    externally_logged: ['followed_up'],
    ignored: ['reviewing'],
  },
  executive: {},
};

export const canTransitionLead = (role: LeadRole, from: LeadStatus, to: LeadStatus): boolean =>
  transitions[role][from]?.includes(to) ?? false;

export const canConfirmLead = (lead: LeadRecord, role: LeadRole): boolean =>
  role !== 'executive' && lead.riskLevel !== 'strong_block';
