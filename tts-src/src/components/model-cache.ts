/**
 * Shared model download + cache layer for the standalone TTS app.
 * Downloads are persisted with the Cache API, keyed by URL, so a model is only
 * downloaded once per origin and reused across page loads and delegate switches.
 * This module stays free of DOM access so workers can import it.
 */

const MODEL_CACHE_NAME = 'mediapipe-tts-models-v1';

export type ModelProgressCallback = (loaded: number, total: number) => void;

export interface ModelStream {
  stream: ReadableStream<Uint8Array>;
  size: number;
  fromCache: boolean;
  cached: Promise<boolean>;
}

/** Resolves a ModelScope / Hugging Face repository URL to a direct binary download URL. */
export function resolveModelDownloadUrl(rawUrl: string, defaultFileName?: string): string {
  const trimmed = rawUrl.trim();
  const hfRepoMatch = trimmed.match(
    /^https?:\/\/huggingface\.co\/([^/]+)\/([^/]+)(?:\/(?:tree|blob|resolve)\/([^/]+)(?:\/(.+))?)?$/
  );
  if (hfRepoMatch) {
    const [, org, repo, branchOrType, filePath] = hfRepoMatch;
    if (branchOrType === 'resolve' && filePath) return trimmed;
    const fileName = filePath || defaultFileName || `${repo}.litertlm`;
    const branch = branchOrType && branchOrType !== 'tree' && branchOrType !== 'blob' ? branchOrType : 'main';
    return `https://huggingface.co/${org}/${repo}/resolve/${branch}/${fileName}`;
  }
  const msTrimmed = trimmed.replace(/\/files\/?$/, '');
  const msRepoMatch = msTrimmed.match(
    /^https?:\/\/modelscope\.cn\/models\/([^/]+)\/([^/]+)(?:\/(?:tree|blob|resolve)\/([^/]+)(?:\/(.+))?)?$/
  );
  if (msRepoMatch) {
    const [, org, repo, branchOrType, filePath] = msRepoMatch;
    if (branchOrType === 'resolve' && filePath) return msTrimmed;
    const fileName = filePath || defaultFileName || `${repo}.litertlm`;
    const branch = branchOrType && branchOrType !== 'tree' && branchOrType !== 'blob' ? branchOrType : 'master';
    return `https://modelscope.cn/models/${org}/${repo}/resolve/${branch}/${fileName}`;
  }
  return trimmed;
}

export function isCacheableModelUrl(url: string): boolean {
  return /^https?:\/\//i.test(url);
}

export function formatMegabytes(bytes: number): string {
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

const KNOWN_MODEL_SIZES: Record<string, number> = {
  'https://modelscope.cn/models/litert-community/Kokoro-82M/resolve/master/kokoro_int8_gpu_fp16.litertlm': 294750530,
  'https://modelscope.cn/models/litert-community/Kokoro-82M/resolve/master/kokoro_int8_fp16.litertlm': 294783298,
};

export function getKnownModelSize(url: string): number | undefined {
  return KNOWN_MODEL_SIZES[resolveModelDownloadUrl(url)] ?? KNOWN_MODEL_SIZES[url];
}

export function trackProgress(
  stream: ReadableStream<Uint8Array>,
  total: number,
  onProgress?: ModelProgressCallback | null
): ReadableStream<Uint8Array> {
  if (!onProgress) return stream;
  let loaded = 0;
  return stream.pipeThrough(
    new TransformStream<Uint8Array, Uint8Array>({
      transform(chunk, controller) {
        loaded += chunk.byteLength;
        onProgress(loaded, total);
        controller.enqueue(chunk);
      },
    })
  );
}

async function openModelCache(): Promise<Cache | null> {
  if (typeof caches === 'undefined') return null;
  try {
    return await caches.open(MODEL_CACHE_NAME);
  } catch (err) {
    console.warn('Model cache unavailable:', err);
    return null;
  }
}

function contentLength(response: Response): number {
  const value = Number(response.headers.get('content-length') || 0);
  return Number.isFinite(value) && value > 0 ? value : 0;
}

async function fetchFromNetwork(url: string): Promise<Response> {
  const response = await fetch(url);
  if (!response.ok || !response.body) {
    throw new Error(`Failed to download model (HTTP ${response.status}) from ${url}`);
  }
  if ((response.headers.get('content-type') || '').includes('text/html')) {
    throw new Error(`Expected a model file but received an HTML page from ${url}`);
  }
  return response;
}

const pendingWrites = new Map<string, Promise<boolean>>();

export async function isModelCached(url: string): Promise<boolean> {
  if (!isCacheableModelUrl(url)) return false;
  const cache = await openModelCache();
  if (!cache) return false;
  await pendingWrites.get(url);
  return (await cache.match(url)) !== undefined;
}

export async function removeCachedModel(url: string): Promise<boolean> {
  const cache = await openModelCache();
  if (!cache) return false;
  await pendingWrites.get(url);
  return cache.delete(url);
}

export async function clearModelCache(): Promise<void> {
  if (typeof caches === 'undefined') return;
  await Promise.all(pendingWrites.values());
  await caches.delete(MODEL_CACHE_NAME);
}

export async function openModelStream(url: string, onProgress?: ModelProgressCallback | null): Promise<ModelStream> {
  const cache = isCacheableModelUrl(url) ? await openModelCache() : null;

  if (cache) {
    await pendingWrites.get(url);
    const cached = await cache.match(url);
    if (cached?.body) {
      const size = contentLength(cached);
      return {
        stream: trackProgress(cached.body, size, onProgress),
        size,
        fromCache: true,
        cached: Promise.resolve(true),
      };
    }
  }

  const response = await fetchFromNetwork(url);
  const size = contentLength(response);
  if (size > 0) KNOWN_MODEL_SIZES[url] = size;
  let body = response.body!;
  let written: Promise<boolean> = Promise.resolve(false);

  if (cache) {
    const [toCache, toCaller] = body.tee();
    body = toCaller;
    const headers = new Headers({
      'content-type': response.headers.get('content-type') || 'application/octet-stream',
    });
    if (size) headers.set('content-length', String(size));
    written = cache
      .put(url, new Response(toCache, { status: 200, headers }))
      .then(() => true)
      .catch((err) => {
        console.warn(`Model could not be cached (${url}):`, err);
        return false;
      })
      .finally(() => pendingWrites.delete(url));
    pendingWrites.set(url, written);
  }

  return { stream: trackProgress(body, size, onProgress), size, fromCache: false, cached: written };
}

export async function fetchModelBytes(url: string, onProgress?: ModelProgressCallback | null): Promise<ArrayBuffer> {
  const { stream } = await openModelStream(url, onProgress);
  return new Response(stream).arrayBuffer();
}
