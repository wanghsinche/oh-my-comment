import { createStorage, StorageEnum } from '../base/index.js';

export const debugLogsStorage = createStorage<{ type: 'req' | 'res'; content: any; time: string }[]>(
  'debug-logs-storage-key',
  [],
  {
    storageEnum: StorageEnum.Session, // 只在当前浏览器会话中保留
    liveUpdate: true,
  },
);
