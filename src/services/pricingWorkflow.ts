export type PricingStatus = 'pending_analysis' | 'pending_approval' | 'approved' | 'returned' | 'pending_external' | 'externally_logged' | 'closed';
export type PricingProposal = { id: string; status: PricingStatus; hardStop: boolean; history: string[] };
export type PriceExecution = { platform: string; actualPrice: number; evidenceRef: string; note: string };

export function canBulkApprove(proposal: PricingProposal): boolean {
  return proposal.status === 'pending_approval' && !proposal.hardStop;
}

export function logPriceExecution(proposal: PricingProposal, role: 'operator' | 'manager' | 'executive', execution: PriceExecution): PricingProposal | null {
  if (role === 'executive' || proposal.status !== 'pending_external' || !execution.note.trim() || !execution.evidenceRef.trim()) return null;
  return { ...proposal, status: 'externally_logged', history: [...proposal.history, `external_price_execution:${execution.platform}:${execution.actualPrice}:${execution.evidenceRef}`] };
}
