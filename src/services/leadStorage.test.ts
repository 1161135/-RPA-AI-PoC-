import { beforeEach, describe, expect, it } from 'vitest';
import type { LeadRecord } from '../domain/leads';
import { LEADS_STORAGE_KEY, loadLeads, saveLeads } from './leadStorage';

const fallback: LeadRecord[] = [{ id: 'fallback', status: 'pending_review', riskLevel: 'low', ownerId: 'operator-1', history: [] }];

describe('lead local storage', () => {
  beforeEach(() => localStorage.clear());

  it('uses fixtures when no audited workflow state was stored', () => {
    expect(loadLeads(fallback)).toEqual(fallback);
  });

  it('stores normalized workflow records but not import files', () => {
    saveLeads(fallback);
    expect(JSON.parse(localStorage.getItem(LEADS_STORAGE_KEY) ?? '[]')).toEqual(fallback);
  });
});
