import { createStorage, StorageEnum } from '../base/index.js';
import type { BaseStorageType } from '../base/types.js';

type Theme = 'light' | 'dark';

type ThemeStorage = BaseStorageType<Theme> & {
  toggle: () => Promise<void>;
};

const storage = createStorage<Theme>('theme-storage-key', 'light', {
  storageEnum: StorageEnum.Local,
  liveUpdate: true,
});

export const exampleThemeStorage: ThemeStorage = {
  ...storage,
  toggle: async () => {
    const currentTheme = await storage.get();
    await storage.set(currentTheme === 'light' ? 'dark' : 'light');
  },
};
