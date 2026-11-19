import fs from 'fs';
import path from 'path';
import { createRequire } from 'module';

const require = createRequire(import.meta.url);

// Only the audio task and the FilesetResolver from tasks-vision are needed.
const targets = [
  { name: '@mediapipe/tasks-vision', entry: '@mediapipe/tasks-vision/vision_wasm_internal.js' },
  { name: '@mediapipe/tasks-audio', entry: '@mediapipe/tasks-audio/audio_wasm_internal.js' },
];

const destDir = path.resolve('public/wasm');

export function copyWasmFiles(dest = destDir) {
  if (!fs.existsSync(dest)) {
    fs.mkdirSync(dest, { recursive: true });
  }

  targets.forEach(({ name, entry }) => {
    try {
      const entryPath = require.resolve(entry);
      const srcDir = path.dirname(entryPath);
      if (fs.existsSync(srcDir)) {
        const files = fs.readdirSync(srcDir);
        files.forEach((file) => {
          fs.copyFileSync(path.join(srcDir, file), path.join(dest, file));
        });
      }
    } catch (e) {
      console.warn(`Could not resolve WASM assets for ${name}:`, e.message);
    }
  });

  console.log('Successfully prepared WASM static assets.');
}

if (process.argv[1] && path.resolve(process.argv[1]) === path.resolve(new URL(import.meta.url).pathname)) {
  copyWasmFiles();
}
