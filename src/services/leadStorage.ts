import type { LeadRecord } from '../domain/leads';

export const LEADS_STORAGE_KEY = 'rpa-cockpit-public-leads';

export function loadLeads(fallback: LeadRecord[]): LeadRecord[] {
  try {
    const value = localStorage.getItem(LEADS_STORAGE_KEY);
    return value ? JSON.parse(value) as LeadRecord[] : fallback;
  } catch {
    return fallback;
  }
}

export function saveLeads(leads: LeadRecord[]): void {
  localStorage.setItem(LEADS_STORAGE_KEY, JSON.stringify(leads));
}
