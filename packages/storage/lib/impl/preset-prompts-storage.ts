import { createStorage, StorageEnum } from '../base/index.js';

export interface Persona {
  id: string;
  name: string;
  prompt: string;
  isDefault: boolean;
}

const DEFAULT_PERSONA: Persona = {
  id: 'default',
  name: 'Default Assistant',
  prompt:
    'You are my digital twin. help me craft engaging, witty, and contextually relevant comments on social media posts. Adopt a friendly and approachable tone, while ensuring professionalism and respectfulness in your replies. Always consider the content of the post and the likely audience when generating comments. Avoid controversial topics and maintain a positive online presence.',
  isDefault: true,
};

export const presetPromptsStorage = createStorage<Persona[]>(
  'preset-prompts-storage-key-v2',
  [DEFAULT_PERSONA],
  {
    storageEnum: StorageEnum.Sync, // Use chrome.storage.sync
    liveUpdate: true,
  },
);
