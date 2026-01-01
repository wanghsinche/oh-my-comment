import { createStorage, StorageEnum } from '../base/index.js';

export const hostPersonaStorage = createStorage<Record<string, string>>(
  'host-persona-storage-key',
  {},
  {
    storageEnum: StorageEnum.Sync,
    liveUpdate: true,
  },
);
