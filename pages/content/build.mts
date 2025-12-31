import { resolve } from 'node:path';
import { makeEntryPointPlugin } from '@extension/hmr';
import { withPageConfig } from '@extension/vite-config';
import { IS_DEV } from '@extension/env';
import { build } from 'vite';
import { build as buildTW } from 'tailwindcss/lib/cli/build';

const rootDir = resolve(import.meta.dirname);
const srcDir = resolve(rootDir, 'src');

const config = withPageConfig({
  mode: IS_DEV ? 'development' : undefined,
  resolve: {
    alias: {
      '@src': srcDir,
    },
  },
  publicDir: resolve(rootDir, 'public'),
  plugins: [IS_DEV && makeEntryPointPlugin()],
  build: {
    lib: {
      name: 'content',
      formats: ['iife'],
      entry: resolve(srcDir, 'index.tsx'),
      fileName: 'index',
    },
    outDir: resolve(rootDir, '..', '..', 'dist', 'content'),
  },
});

const tailwindArgs = {
  '--input': resolve(rootDir, '../../packages/ui/global.css'), // Use the global css as input
  '--output': resolve(rootDir, '../../dist/content/style.css'),
  '--config': resolve(rootDir, 'tailwind.config.ts'),
  '--watch': IS_DEV,
};

// Wait for the Tailwind build to complete before starting the Vite build
await buildTW(tailwindArgs);

//@ts-expect-error This is hidden property into vite's resolveConfig()
config.configFile = false;
await build(config);
