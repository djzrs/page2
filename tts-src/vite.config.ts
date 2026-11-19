import { defineConfig } from 'vite';
import fs from 'node:fs';
import path from 'node:path';
import { copyWasmFiles } from './copy-wasm.js';

/**
 * 静态部署（上传到仓库分支）时仓库名未知，使用相对路径 './'，
 * 这样构建产物放到任意子路径下都能正确加载资源。
 * 本地开发用 '/'；如需指定（如自定义域名），可设置 VITE_BASE。
 */
function resolveBase(): string {
  const override = process.env.VITE_BASE;
  if (override) return override.endsWith('/') ? override : `${override}/`;
  return './';
}

export default defineConfig(() => ({
  base: resolveBase(),
  plugins: [
    {
      name: 'mediapipe-wasm-plugin',
      buildStart() {
        copyWasmFiles();
      },
      configureServer(server) {
        copyWasmFiles();
        // Serve WASM/JS loaders with correct MIME types in dev.
        server.middlewares.use((req, res, next) => {
          if (!req.url) return next();
          const urlPath = req.url.split('?')[0];
          const match = urlPath.match(/(?:.*\/)?wasm\/(.+)$/);
          if (match) {
            const fileName = match[1];
            const filePath = path.resolve('public/wasm', fileName);
            if (fs.existsSync(filePath)) {
              if (fileName.endsWith('.wasm')) res.setHeader('Content-Type', 'application/wasm');
              else if (/\.(js|mjs)$/.test(fileName)) res.setHeader('Content-Type', 'application/javascript');
              res.setHeader('Access-Control-Allow-Origin', '*');
              fs.createReadStream(filePath).pipe(res);
              return;
            }
          }
          next();
        });
      },
    },
  ],
  optimizeDeps: {
    exclude: ['@mediapipe/tasks-audio', '@mediapipe/tasks-vision'],
  },
  worker: {
    format: 'es',
  },
  build: {
    sourcemap: false,
    // CI 构建时通过 OUT_DIR 直接输出到仓库的 tts/ 目录；本地默认 dist/。
    outDir: process.env.OUT_DIR || 'dist',
    emptyOutDir: true,
  },
  server: {
    port: 5175,
    strictPort: true,
  },
}));
