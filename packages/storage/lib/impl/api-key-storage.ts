import { createStorage, StorageEnum } from '../base/index.js';

export const apiKeyStorage = createStorage<string>(
  'ark-api-key-storage-key',
  '', // default value
  {
    storageEnum: StorageEnum.Sync, // Use chrome.storage.sync
    liveUpdate: true,
  },
);
