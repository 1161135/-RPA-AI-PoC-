import type { ChannelAdapter } from './channelAdapter';
import { lastSuccessfulAt, sourceRows, type SourceRow } from '../data/mock-data';

const createMockAdapter = (channel: SourceRow['channel']): ChannelAdapter<SourceRow> => ({
  channel,
  async load() {
    return {
      rows: sourceRows.filter((row) => row.channel === channel),
      status: 'success',
      lastSuccessfulAt,
      isFallback: false,
    };
  },
});

export const mockAdapters: ChannelAdapter<SourceRow>[] = [
  createMockAdapter('tmall'),
  createMockAdapter('jd'),
  createMockAdapter('douyin'),
];

/** Demonstrates degradation: a failed fetch still exposes the previous JD snapshot. */
export const failedJdAdapter: ChannelAdapter<SourceRow> = {
  channel: 'jd',
  async load() {
    return {
      rows: sourceRows.filter((row) => row.channel === 'jd'),
      status: 'failed',
      lastSuccessfulAt,
      isFallback: true,
      error: 'JD API timeout',
    };
  },
};
