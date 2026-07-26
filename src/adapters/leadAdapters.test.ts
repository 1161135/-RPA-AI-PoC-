import { describe, expect, it } from 'vitest';
import { getLeadAdapter } from './leadAdapters';

describe('lead source adapters', () => {
  it('labels customer-local authorization as assisted work rather than real-time collection', () => {
    expect(getLeadAdapter('douyin')).toMatchObject({ capability: 'manual_assistance_only' });
  });

  it('keeps the latest successful timestamp when the adapter is degraded', () => {
    expect(getLeadAdapter('jd')).toMatchObject({ dataMode: 'snapshot_24h', lastSuccessfulAt: expect.any(String) });
  });
});
