/**
 * Model registry for the standalone Chinese TTS app.
 * Only Kokoro-82M is exposed (GPU and CPU variants of the same model).
 */

import { resolveModelDownloadUrl } from './model-cache';

export interface HostedModel {
  id: string;
  name: string;
  url: string;
  fileName: string;
  description?: string;
}

export const KOKORO_82M: HostedModel = {
  id: 'kokoro_82m',
  name: 'Kokoro-82M（GPU）',
  url: 'https://modelscope.cn/models/litert-community/Kokoro-82M',
  fileName: 'kokoro_int8_gpu_fp16.litertlm',
  description: '9 种语言，含普通话',
};

/** CPU / WASM variant for devices without a usable GPU. */
export const KOKORO_82M_CPU: HostedModel = {
  id: 'kokoro_82m_cpu',
  name: 'Kokoro-82M（CPU）',
  url: 'https://modelscope.cn/models/litert-community/Kokoro-82M',
  fileName: 'kokoro_int8_fp16.litertlm',
  description: '无 GPU 时推荐，含普通话',
};

/** Kokoro 的全部可选变体（GPU / CPU）。 */
export const TTS_MODELS: HostedModel[] = [KOKORO_82M, KOKORO_82M_CPU];

/** Direct download URL of a hosted model (the shared cache key). */
export function hostedModelDownloadUrl(model: HostedModel): string {
  return resolveModelDownloadUrl(model.url, model.fileName);
}
