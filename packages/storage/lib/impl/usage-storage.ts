import { createStorage, StorageEnum } from '../base/index.js';

export interface UsageStats {
  requestCount: number;
  totalInputTokens: number;
  totalOutputTokens: number;
}

const defaultStats: UsageStats = {
  requestCount: 0,
  totalInputTokens: 0,
  totalOutputTokens: 0,
};

export const usageStorage = createStorage<UsageStats>('token-usage-storage-key', defaultStats, {
  storageEnum: StorageEnum.Local, // Use local for stats to avoid sync limits if they grow
  liveUpdate: true,
});
