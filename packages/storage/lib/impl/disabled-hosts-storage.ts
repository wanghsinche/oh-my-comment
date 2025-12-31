import { createStorage, StorageEnum } from '../base/index.js';

export const disabledHostsStorage = createStorage<string[]>(
  'disabled-hosts-storage-key',
  [], // default value: no hosts disabled
  {
    storageEnum: StorageEnum.Sync,
    liveUpdate: true,
  },
);
