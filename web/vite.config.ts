//
// Copyright 2023 Signal Messenger, LLC
// SPDX-License-Identifier: AGPL-3.0-only
//

import { brotliCompress } from 'zlib';
import { promisify } from 'util';
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { visualizer } from 'rollup-plugin-visualizer';
import gzipPlugin from 'rollup-plugin-gzip';

const GZIP_FILTER = /\.(js|mjs|cjs|json|css|html|wasm|svg|webp)$/;

// https://vitejs.dev/config/
export default defineConfig({
  css: {
    modules: {
      localsConvention: 'camelCaseOnly',
    },
  },
  worker: {
    format: 'es',
  },
  test: {
    environment: 'happy-dom',
  },
  plugins: [
    react(),
    gzipPlugin({ filter: GZIP_FILTER }),
    gzipPlugin({
      filter: GZIP_FILTER,
      customCompression: content => {
        return promisify(brotliCompress)(Buffer.from(content));
      },
      fileName: '.br',
    }),
    visualizer(),
  ],
  server: {
    proxy: {
      '/api/socket': {
        secure: true,
        target: 'wss://create.staging.signal.art',
        changeOrigin: true,
        headers: {
          origin: 'https://create.staging.signal.art',
        },
      },
      '/api': {
        secure: true,
        target: 'https://create.staging.signal.art',
        changeOrigin: true,
      },
    },
  },
});
