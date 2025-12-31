import { createStorage, StorageEnum } from '../base/index.js';

export const presetPromptsStorage = createStorage<string>(
  'preset-prompts-storage-key',
  '', // default value
  {
    storageEnum: StorageEnum.Sync, // Use chrome.storage.sync
    liveUpdate: true,
  },
);
