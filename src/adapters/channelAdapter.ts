import type { ChannelId } from '../domain/types';

export type AdapterLoadResult<T> = {
  rows: T[];
  status: 'success' | 'failed';
  lastSuccessfulAt: string;
  isFallback: boolean;
  error?: string;
};

export interface ChannelAdapter<T> {
  channel: ChannelId;
  load(): Promise<AdapterLoadResult<T>>;
}
