/**
 * Copyright 2026 The MediaPipe Authors.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

import type { VoiceInfo, WordTimestamp } from '@mediapipe/tasks-audio';
import { BaseTask, BaseTaskOptions } from '../components/base-task';
import type { ModelSelectorConfig } from '../components/model-selector';
import { TTS_MODELS, hostedModelDownloadUrl } from '../components/model-registry';

// @ts-ignore
import template from '../templates/text-to-speech.html?raw';

const DEFAULT_MODEL = TTS_MODELS[0];
// 默认发音人：优先中文女声「晓晓」，找不到时回退到任意中文音色。
const PREFERRED_VOICES = ['zf_xiaoxiao', 'zf_xiaobei', 'zf_xiaoni', 'zf_xiaoyi'];

/** 四段中文示例，对应界面上的四个示例按钮。 */
const CHINESE_SAMPLES: Record<string, string> = {
  welcome: [
    '欢迎使用中文语音合成。您听到的每个字，都是直接在浏览器里生成的，文字不会被发送到任何服务器。',
    '声音会在合成的过程中边生成边播放，首个字几乎没有延迟，剩下的内容在后台继续生成。',
    '点击下面任意一句话，就能立刻从那一句开始朗读，并看着每个字词随着声音实时高亮。',
  ].join('\n\n'),
  story: [
    '守塔人最后一次登上螺旋楼梯。外面的暴风雨终于过去了，清晨的第一缕阳光洒在平静的银色海面上。',
    '遥远的地平线上，一叶孤帆乘着金色的微风，缓缓转向港湾。他微笑着合上厚重的航海日志，又煮了一壶新鲜的咖啡。',
    '在这片海岬上度过了四十个冬天后，那盏旧灯已改用太阳能为船只导航，但它洒在水面上的温暖光芒，始终没有改变。',
  ].join('\n\n'),
  numbers: [
    '您飞往苏黎世的航班将于三月三日上午七点四十五分，在十二号登机口起飞。票价为二百四十九美元九十九美分，全程直飞约需一个半小时。',
    '到达二号航站楼后，史密斯博士会在四号站台等您，搭乘九点三十分的特快列车。请准备好您的确认码：ZX-4082，以便查验。',
    '在四千五百二十条航线上，正点率高达百分之九十九点四，票价低至四十五欧元或三十九点五英镑。',
  ].join('\n\n'),
  article: [
    '端侧语音合成为网页应用带来了自然、低延迟的语音交互，同时完整保护用户隐私。',
    '由于推理在 WebGPU 或 WebAssembly 上本地运行，音频生成可以离线工作，也不会产生任何云端服务费用。',
    '试着点击这篇文章里不同的句子，或者切换不同发音人，比较一下音色和合成速度吧。',
  ].join('\n\n'),
};

/** 按发音人语言（locale 前缀）对应的示例文本。Kokoro 含多语言音色。 */
const LOCALIZED_SAMPLES: Record<string, string> = {
  zh: CHINESE_SAMPLES.welcome,
  en: [
    'Welcome to MediaPipe Text to Speech. Every word you hear is generated right here in your browser, without sending any text to a server.',
    'Click on any sentence below to jump immediately to that line, and watch each word highlight in real time as it is spoken.',
  ].join('\n\n'),
  ja: [
    'MediaPipeへようこそ。この音声は、すべてお使いのブラウザの中で生成されています。',
    '下の任意の文をクリックすると、その位置からすぐに読み上げが始まります。',
  ].join('\n\n'),
};

interface ScheduledChunk {
  /** AudioContext time at which the chunk starts playing. */
  startAt: number;
  duration: number;
  /** Cumulative synthesized audio offset (seconds) at the start of this chunk. */
  audioOffsetSec: number;
  source: AudioBufferSourceNode;
}

interface SentenceSpanInfo {
  index: number;
  paragraphIndex: number;
  startChar: number;
  endChar: number;
  text: string;
  element: HTMLSpanElement;
}

/**
 * Level statistics of synthesized audio for automated validation (see
 * test-hooks.ts): silence, clipping and invalid samples all show up here.
 */
function summarizeSamples(chunks: Float32Array[]): Record<string, unknown> {
  let count = 0;
  let nonFinite = 0;
  let sumSquares = 0;
  let peak = 0;
  for (const chunk of chunks) {
    for (let i = 0; i < chunk.length; i++) {
      const v = chunk[i];
      count++;
      if (!Number.isFinite(v)) {
        nonFinite++;
        continue;
      }
      sumSquares += v * v;
      if (Math.abs(v) > peak) peak = Math.abs(v);
    }
  }
  const finite = count - nonFinite;
  return { sampleCount: count, nonFiniteCount: nonFinite, rms: finite > 0 ? Math.sqrt(sumSquares / finite) : 0, peak };
}

class TextToSpeechTask extends BaseTask {
  private voices: VoiceInfo[] = [];
  private speakingRate = 1.0;

  // Request state
  private requestId = 0;
  private isSynthesizing = false;
  private firstChunkMs: number | undefined;
  private pendingSpeakSentenceIdx: number | undefined;

  // Playback state
  private audioCtx: AudioContext | undefined;
  private scheduled: ScheduledChunk[] = [];
  /** AudioContext time at which the current utterance starts. */
  private utteranceStartAt = 0;
  /** AudioContext time at which the next chunk can start (gapless playback). */
  private nextStartAt = 0;
  /** Cumulative synthesized audio duration (seconds) of chunks that have finished playing. */
  private playedAudioSec = 0;
  private animationFrame: number | undefined;

  // Output of the last utterance (for WAV export and visualization)
  private outputChunks: Float32Array[] = [];
  private outputSampleRate = 24000;
  private wordTimestamps: WordTimestamp[] = [];
  private spokenText = '';
  /** Character offset in `spokenText` where the current synthesis request began. */
  private utteranceCharOffset = 0;
  private startSentenceIdx = 0;
  private activeSentenceIdx = -1;
  private sentences: SentenceSpanInfo[] = [];
  private renderedWordCount = 0;
  private selectedEnglishSample = 'welcome';
  /** How the current synthesis was requested and the text sent to the model, reported with its result. */
  private requestedMode: 'SYNTHESIZE' | 'STREAM' = 'SYNTHESIZE';
  private requestedText = '';

  // DOM
  private textInput!: HTMLTextAreaElement;
  private sampleChips: HTMLButtonElement[] = [];
  private voiceSelect!: HTMLSelectElement;
  private speakBtn!: HTMLButtonElement;
  private streamBtn!: HTMLButtonElement;
  private stopBtn!: HTMLButtonElement;
  private downloadBtn!: HTMLButtonElement;
  private prevSentBtn!: HTMLButtonElement;
  private nextSentBtn!: HTMLButtonElement;
  private sentenceBadgeEl!: HTMLElement;
  private transcriptEl!: HTMLElement;
  private wordSpans: HTMLSpanElement[] = [];
  private canvas!: HTMLCanvasElement;

  constructor(options: BaseTaskOptions) {
    super(options);
  }

  protected override getModelSelectorConfig(): ModelSelectorConfig {
    // The models are 80-700 MB: only download once the user asks for it.
    return {
      autoLoad: false,
      accept: '.litertlm',
      uploadLabel: '选择 .litertlm 模型文件',
      resolveUrl: (value) => this.resolveModelUrl(value),
      preferCached: true,
    };
  }

  protected override onInitializeUI() {
    this.textInput = document.getElementById('tts-text-input') as HTMLTextAreaElement;
    this.voiceSelect = document.getElementById('voice-select') as HTMLSelectElement;
    this.speakBtn = document.getElementById('tts-speak-btn') as HTMLButtonElement;
    this.streamBtn = document.getElementById('tts-stream-btn') as HTMLButtonElement;
    this.stopBtn = document.getElementById('tts-stop-btn') as HTMLButtonElement;
    this.downloadBtn = document.getElementById('tts-download-btn') as HTMLButtonElement;
    this.prevSentBtn = document.getElementById('tts-prev-sent-btn') as HTMLButtonElement;
    this.nextSentBtn = document.getElementById('tts-next-sent-btn') as HTMLButtonElement;
    this.sentenceBadgeEl = document.getElementById('tts-sentence-badge') as HTMLElement;
    this.transcriptEl = document.getElementById('tts-transcript') as HTMLElement;
    this.canvas = document.getElementById('tts-waveform') as HTMLCanvasElement;

    this.textInput.value = CHINESE_SAMPLES.welcome;
    this.renderTranscript(this.textInput.value);

    this.modelSelector?.updateOptions(
      TTS_MODELS.map((m) => ({ label: m.name, value: m.id, isDefault: m.id === DEFAULT_MODEL.id }))
    );

    this.sampleChips = Array.from(document.querySelectorAll<HTMLButtonElement>('#tts-samples .sample-chip'));
    this.sampleChips.forEach((chip) => {
      chip.addEventListener('click', () => {
        const sample = chip.dataset.sample!;
        this.selectedEnglishSample = sample;
        this.stop();
        this.textInput.value = CHINESE_SAMPLES[sample];
        this.syncActiveSampleChip();
        this.renderTranscript(this.textInput.value);
      });
    });

    this.textInput.addEventListener('input', () => {
      this.syncActiveSampleChip();
      if (!this.isSynthesizing && this.scheduled.length === 0) {
        this.renderTranscript(this.textInput.value);
      }
    });

    this.voiceSelect.addEventListener('change', () => {
      this.stop();
      const val = this.textInput.value;
      const targetLang = this.voiceLang(this.voiceSelect.value);
      // 当文本框里还是某个预设示例时，切换到对应语言的示例；
      // 用户自己输入的内容则保持不动。
      const isPreset = Object.values(CHINESE_SAMPLES).includes(val) || Object.values(LOCALIZED_SAMPLES).includes(val);
      let nextText: string | undefined;
      if (isPreset) {
        if (targetLang === 'zh') {
          nextText = CHINESE_SAMPLES[this.selectedEnglishSample] ?? CHINESE_SAMPLES.welcome;
        } else {
          nextText = this.sampleForVoice(this.voiceSelect.value);
        }
      }
      if (nextText !== undefined && nextText !== val) {
        this.textInput.value = nextText;
        this.syncActiveSampleChip();
        this.renderTranscript(this.textInput.value);
      }
      if (this.isWorkerReady && !this.isSynthesizing && this.voiceSelect.value) {
        this.worker?.postMessage({ type: 'WARMUP_VOICE', voiceId: this.voiceSelect.value });
      }
    });

    const rateInput = document.getElementById('speaking-rate') as HTMLInputElement;
    const rateValue = document.getElementById('speaking-rate-value')!;
    rateInput.addEventListener('input', () => {
      rateValue.innerText = parseFloat(rateInput.value).toFixed(1);
    });
    rateInput.addEventListener('change', () => {
      this.speakingRate = parseFloat(rateInput.value);
      // The speaking rate is an engine option: reload if a model is active.
      if (this.modelRequested) this.initializeTask();
    });

    this.speakBtn.addEventListener('click', () => this.synthesize('SYNTHESIZE', 0));
    this.streamBtn.addEventListener('click', () => this.synthesize('STREAM', 0));
    this.stopBtn.addEventListener('click', () => this.stop());
    this.downloadBtn.addEventListener('click', () => this.downloadWav());

    this.prevSentBtn.addEventListener('click', () => {
      const target = Math.max(0, (this.activeSentenceIdx >= 0 ? this.activeSentenceIdx : 0) - 1);
      this.speakFromSentence(target);
    });
    this.nextSentBtn.addEventListener('click', () => {
      const target = Math.min(
        Math.max(0, this.sentences.length - 1),
        (this.activeSentenceIdx >= 0 ? this.activeSentenceIdx : -1) + 1
      );
      this.speakFromSentence(target);
    });

    this.drawWaveform();
  }

  protected override resolveModelUrl(modelName: string): string | undefined {
    const model = TTS_MODELS.find((m) => m.id === modelName);
    return model ? hostedModelDownloadUrl(model) : undefined;
  }

  protected override getWorkerInitParams(): Record<string, any> {
    return {
      speakingRate: this.speakingRate,
      voiceId: this.voiceSelect?.value || undefined,
    };
  }

  protected override async initializeTask(): Promise<void> {
    this.stop(/*clearPendingSpeak=*/ false);
    this.setActionsEnabled(false);
    this.voiceSelect.disabled = true;
    await super.initializeTask();
  }

  protected override handleInitDone(data?: any) {
    super.handleInitDone(data);
    if (!this.isWorkerReady) return;
    this.populateVoices(data?.voices ?? []);
    this.setActionsEnabled(true);
    if (this.pendingSpeakSentenceIdx !== undefined) {
      const idx = this.pendingSpeakSentenceIdx;
      this.pendingSpeakSentenceIdx = undefined;
      this.synthesize('STREAM', idx);
    }
  }

  protected override handleWorkerMessage(event: MessageEvent) {
    const data = event.data;
    switch (data.type) {
      case 'AUDIO_CHUNK':
        if (data.requestId === this.requestId) this.handleAudioChunk(data);
        break;
      case 'SYNTHESIS_DONE':
        if (data.requestId === this.requestId) this.handleSynthesisDone(data);
        break;
      case 'SYNTHESIS_ERROR':
        if (data.requestId === this.requestId) {
          this.isSynthesizing = false;
          this.updateStatus(`错误：${data.error}`);
          this.setActionsEnabled(true);
        }
        break;
      case 'ERROR':
        this.pendingSpeakSentenceIdx = undefined;
        super.handleWorkerMessage(event);
        break;
      default:
        super.handleWorkerMessage(event);
    }
  }

  private populateVoices(voices: VoiceInfo[]) {
    this.voices = voices;
    const previous = this.voiceSelect.value;
    this.voiceSelect.innerHTML = '';

    // 按语言分组，中文分组排在最前，其余按名称排序。
    const byLocale = new Map<string, VoiceInfo[]>();
    for (const v of voices) {
      const key = v.locale || 'other';
      if (!byLocale.has(key)) byLocale.set(key, []);
      byLocale.get(key)!.push(v);
    }
    const localeRank = (locale: string) => (/^zh\b/i.test(locale) ? 0 : locale.toLowerCase() === 'other' ? 2 : 1);
    const sortedLocales = [...byLocale.entries()].sort(([a], [b]) => {
      const rankDiff = localeRank(a) - localeRank(b);
      return rankDiff !== 0 ? rankDiff : a.localeCompare(b);
    });
    for (const [locale, list] of sortedLocales) {
      const group = document.createElement('optgroup');
      group.label = /^zh\b/i.test(locale) ? `${locale}（中文）` : locale;
      // 组内也把推荐的中文音色排到最前。
      const sortedList = [...list].sort((a, b) => {
        const ia = PREFERRED_VOICES.indexOf(a.voiceId);
        const ib = PREFERRED_VOICES.indexOf(b.voiceId);
        return (ia < 0 ? 99 : ia) - (ib < 0 ? 99 : ib);
      });
      for (const v of sortedList) {
        const opt = document.createElement('option');
        opt.value = v.voiceId;
        opt.textContent = v.displayName && v.displayName !== v.voiceId ? `${v.displayName}（${v.voiceId}）` : v.voiceId;
        group.appendChild(opt);
      }
      this.voiceSelect.appendChild(group);
    }

    if (voices.length === 0) {
      this.voiceSelect.innerHTML = '<option value="">模型默认发音人</option>';
    }

    const ids = voices.map((v) => v.voiceId);
    // 默认发音人：优先中文音色，保证与默认中文示例文本一致。
    const preferred = PREFERRED_VOICES.find((id) => ids.includes(id)) ?? voices.find((v) => /^zh\b/i.test(v.locale ?? ''))?.voiceId;
    if (ids.includes(previous)) this.voiceSelect.value = previous;
    else if (preferred) this.voiceSelect.value = preferred;
    this.voiceSelect.disabled = false;
  }

  private voiceLang(voiceId: string): string {
    const locale = this.voices.find((v) => v.voiceId === voiceId)?.locale ?? 'en';
    return locale.split(/[-_]/)[0].toLowerCase();
  }

  private sampleForVoice(voiceId: string): string {
    return LOCALIZED_SAMPLES[this.voiceLang(voiceId)] ?? CHINESE_SAMPLES.welcome;
  }

  private syncActiveSampleChip() {
    const val = this.textInput.value;
    this.sampleChips.forEach((chip) => {
      const sample = chip.dataset.sample!;
      chip.classList.toggle('active', val === CHINESE_SAMPLES[sample]);
    });
  }

  private setActionsEnabled(ready: boolean) {
    const canSpeak = ready && this.isWorkerReady && !this.isSynthesizing;
    this.speakBtn.disabled = !canSpeak;
    this.streamBtn.disabled = !canSpeak;
    this.stopBtn.disabled = !(this.isSynthesizing || this.scheduled.length > 0);
    this.downloadBtn.disabled = this.isSynthesizing || this.outputChunks.length === 0;
    this.updateSentenceNavButtons();
  }

  private updateSentenceNavButtons() {
    if (!this.prevSentBtn || !this.nextSentBtn) return;
    const count = this.sentences.length;
    const cur = this.activeSentenceIdx >= 0 ? this.activeSentenceIdx : 0;
    this.prevSentBtn.disabled = count <= 1 || cur <= 0;
    this.nextSentBtn.disabled = count <= 1 || cur >= count - 1;
    if (this.sentenceBadgeEl) {
      if (count > 0 && this.activeSentenceIdx >= 0) {
        this.sentenceBadgeEl.textContent = `第 ${this.activeSentenceIdx + 1} / ${count} 句`;
      } else if (count > 0) {
        this.sentenceBadgeEl.textContent = `共 ${count} 句`;
      } else {
        this.sentenceBadgeEl.textContent = '';
      }
    }
  }

  private ensureAudioContext(): AudioContext {
    if (!this.audioCtx || this.audioCtx.state === 'closed') {
      this.audioCtx = new AudioContext();
    }
    // Created/resumed from a click handler, so autoplay policies are satisfied.
    if (this.audioCtx.state === 'suspended') this.audioCtx.resume();
    return this.audioCtx;
  }

  private speakFromSentence(sentenceIdx: number) {
    const text = this.textInput.value.trim();
    if (!text) return;
    this.ensureAudioContext();
    if (!this.isWorkerReady) {
      this.pendingSpeakSentenceIdx = sentenceIdx;
      if (!this.modelSelector?.getPhase()) {
        this.modelSelector?.loadSelected();
      }
      return;
    }

    const clampedSentIdx =
      this.sentences.length > 0 ? Math.max(0, Math.min(sentenceIdx, this.sentences.length - 1)) : 0;
    this.synthesize('STREAM', clampedSentIdx);
  }

  private synthesize(mode: 'SYNTHESIZE' | 'STREAM', startSentenceIdx = 0) {
    const fullText = this.textInput.value.trim();
    if (!fullText || !this.worker || !this.isWorkerReady) return;

    if (this.isSynthesizing) {
      this.worker.postMessage({ type: 'CANCEL' });
    }
    this.stopPlayback();
    this.ensureAudioContext();

    if (this.spokenText !== fullText || this.sentences.length === 0) {
      this.renderTranscript(fullText);
    } else {
      this.resetWordSpansInTranscript();
    }

    const clampedSentIdx =
      this.sentences.length > 0 ? Math.max(0, Math.min(startSentenceIdx, this.sentences.length - 1)) : 0;
    const charOffset = this.sentences[clampedSentIdx]?.startChar ?? 0;
    const textToSpeak = fullText.slice(charOffset);
    if (!textToSpeak.trim()) return;

    this.requestId++;
    this.isSynthesizing = true;
    this.firstChunkMs = undefined;
    this.outputChunks = [];
    this.wordTimestamps = [];
    this.renderedWordCount = 0;
    this.spokenText = fullText;
    this.utteranceCharOffset = charOffset;
    this.startSentenceIdx = clampedSentIdx;
    this.activeSentenceIdx = clampedSentIdx;
    this.requestedMode = mode;
    this.requestedText = textToSpeak;

    this.utteranceStartAt = 0;
    this.nextStartAt = 0;
    this.playedAudioSec = 0;

    this.highlightSentenceSpan(clampedSentIdx, /*synthesizing=*/ true);
    this.resetMetrics();
    this.drawWaveform();

    this.updateStatus(
      mode === 'STREAM'
        ? clampedSentIdx > 0
          ? `正在从第 ${clampedSentIdx + 1} 句开始流式合成……`
          : '正在流式合成……'
        : '正在合成全文……'
    );
    this.setActionsEnabled(true);

    this.worker.postMessage({
      type: mode,
      requestId: this.requestId,
      text: textToSpeak,
      voiceId: this.voiceSelect.value,
    });
  }

  private handleAudioChunk(data: {
    samples: Float32Array;
    sampleRateHz: number;
    wordTimestamps: WordTimestamp[];
    elapsedMs: number;
  }) {
    const { samples, sampleRateHz, wordTimestamps, elapsedMs } = data;
    if (this.firstChunkMs === undefined) {
      this.firstChunkMs = elapsedMs;
      this.setMetric('tts-metric-first', `${Math.round(elapsedMs)} ms`);
      this.updateStatus('正在播放……');
    }

    const audioOffsetSec = sampleRateHz > 0 ? this.totalSamples() / sampleRateHz : 0;
    this.outputSampleRate = sampleRateHz;
    this.outputChunks.push(samples);

    const audioSec = this.outputSampleRate > 0 ? this.totalSamples() / this.outputSampleRate : 0;
    this.setMetric('tts-metric-total', `${Math.round(elapsedMs)} ms`);
    this.setMetric('tts-metric-audio', `${audioSec.toFixed(2)} s`);
    this.setMetric('tts-metric-rtf', audioSec > 0 ? (elapsedMs / 1000 / audioSec).toFixed(3) : '-');

    const utteranceText = this.spokenText.slice(this.utteranceCharOffset);
    // Newer @mediapipe/tasks-audio builds convert C++ UTF-8 byte offsets to
    // UTF-16 code-unit indices in the WASM binding; older builds (1.2.2) return
    // raw UTF-8 byte offsets. Detect which one we received so both work.
    for (const w of wordTimestamps) {
      const isUtf16Range =
        w.startChar >= 0 && w.endChar <= utteranceText.length && utteranceText.slice(w.startChar, w.endChar) === w.word;
      const charRange = isUtf16Range
        ? { startChar: w.startChar, endChar: w.endChar }
        : this.utf8ByteRangeToCharRange(utteranceText, w.startChar, w.endChar);
      this.wordTimestamps.push({
        ...w,
        startChar: charRange.startChar + this.utteranceCharOffset,
        endChar: charRange.endChar + this.utteranceCharOffset,
      });
    }

    if (samples.length > 0) {
      const ctx = this.ensureAudioContext();
      const buffer = ctx.createBuffer(1, samples.length, sampleRateHz);
      buffer.copyToChannel(samples as Float32Array<ArrayBuffer>, 0);
      const source = ctx.createBufferSource();
      source.buffer = buffer;
      source.connect(ctx.destination);

      const startAt = Math.max(this.nextStartAt, ctx.currentTime + 0.01);
      if (this.utteranceStartAt === 0) this.utteranceStartAt = startAt;
      source.start(startAt);
      this.nextStartAt = startAt + buffer.duration;

      const entry: ScheduledChunk = { startAt, duration: buffer.duration, audioOffsetSec, source };
      this.scheduled.push(entry);
      source.onended = () => {
        this.playedAudioSec = Math.max(this.playedAudioSec, entry.audioOffsetSec + entry.duration);
        this.scheduled = this.scheduled.filter((s) => s !== entry);
        if (this.scheduled.length === 0 && !this.isSynthesizing) this.onPlaybackFinished();
      };
    }

    this.drawWaveform();
    this.startAnimation();
  }

  private handleSynthesisDone(data: { totalMs: number; cancelled: boolean }) {
    this.isSynthesizing = false;
    const audioSec = this.totalSamples() / this.outputSampleRate;

    const avg = this.updateInferenceTime(data.totalMs);
    this.setMetric('tts-metric-total', `${Math.round(data.totalMs)} ms`);
    this.setMetric('tts-metric-audio', `${audioSec.toFixed(2)} s`);
    this.setMetric('tts-metric-rtf', audioSec > 0 ? (data.totalMs / 1000 / audioSec).toFixed(3) : '-');
    this.publishTestResult('text_to_speech', () => ({
      mode: this.requestedMode,
      // The text sent to the model (the page can also start from a later sentence).
      text: this.requestedText,
      voiceId: this.voiceSelect.value,
      cancelled: Boolean(data.cancelled),
      sampleRateHz: this.outputSampleRate,
      chunkCount: this.outputChunks.length,
      durationSec: audioSec,
      wordTimestampCount: this.wordTimestamps.length,
      ...summarizeSamples(this.outputChunks),
    }));

    if (data.cancelled) {
      this.updateStatus('已停止');
    } else if (this.scheduled.length === 0) {
      this.onPlaybackFinished();
    } else {
      this.updateStatus(`合成耗时 ${Math.round(avg)} 毫秒 · 播放中`);
    }
    this.setActionsEnabled(true);
  }

  private onPlaybackFinished() {
    this.stopAnimation();
    this.highlightWordAt(Number.POSITIVE_INFINITY);
    this.highlightSentenceSpan(-1, false);
    if (this.transcriptEl && this.textInput && this.spokenText !== this.textInput.value.trim()) {
      this.renderTranscript(this.textInput.value);
    }
    this.drawWaveform();
    if (!this.isSynthesizing) this.updateStatus('就绪');
    this.setActionsEnabled(true);
  }

  private stopPlayback() {
    for (const s of this.scheduled) {
      s.source.onended = null;
      try {
        s.source.stop();
      } catch (_) {}
    }
    this.scheduled = [];
    this.stopAnimation();
  }

  private stop(clearPendingSpeak = true) {
    if (clearPendingSpeak) {
      this.pendingSpeakSentenceIdx = undefined;
    }
    if (this.isSynthesizing) {
      this.worker?.postMessage({ type: 'CANCEL' });
      // Ignore chunks of the cancelled request that are already on their way.
      this.requestId++;
      this.isSynthesizing = false;
      this.updateStatus('已停止');
    }
    this.stopPlayback();
    this.highlightSentenceSpan(-1, false);
    if (this.transcriptEl && this.textInput && this.spokenText !== this.textInput.value.trim()) {
      this.renderTranscript(this.textInput.value);
    }
    if (this.speakBtn) this.setActionsEnabled(true);
  }

  /**
   * Computes the current playhead in synthesized audio seconds (`0 .. totalAudioSec`),
   * immune to inter-chunk scheduling gaps or underruns.
   */
  private getPlayheadSec(): number {
    if (!this.audioCtx || this.utteranceStartAt === 0) return 0;
    // Compensate ~35ms for browser Web Audio output buffer latency so the
    // visual word highlight lands right on the audible word onset.
    const now = this.audioCtx.currentTime + 0.035;
    if (now < this.utteranceStartAt) return 0;

    for (const chunk of this.scheduled) {
      if (now >= chunk.startAt && now < chunk.startAt + chunk.duration) {
        return chunk.audioOffsetSec + (now - chunk.startAt);
      }
    }

    let playhead = this.playedAudioSec;
    for (const chunk of this.scheduled) {
      if (now >= chunk.startAt + chunk.duration) {
        playhead = Math.max(playhead, chunk.audioOffsetSec + chunk.duration);
      }
    }
    return playhead;
  }

  private utf8ByteRangeToCharRange(
    text: string,
    startByte: number,
    endByte: number
  ): { startChar: number; endChar: number } {
    if (startByte <= 0 && endByte <= 0) return { startChar: 0, endChar: 0 };
    let bytePos = 0;
    let charPos = 0;
    let startChar = -1;
    let endChar = -1;
    while (charPos < text.length) {
      if (startChar < 0 && bytePos >= startByte) {
        startChar = charPos;
      }
      const cp = text.codePointAt(charPos)!;
      const charLen = cp > 0xffff ? 2 : 1;
      const utf8Len = cp <= 0x7f ? 1 : cp <= 0x7ff ? 2 : cp <= 0xffff ? 3 : 4;
      bytePos += utf8Len;
      charPos += charLen;
      if (bytePos >= endByte) {
        endChar = charPos;
        break;
      }
    }
    if (startChar < 0) startChar = Math.min(startByte, text.length);
    if (endChar < 0) endChar = text.length;
    return { startChar, endChar };
  }

  // --- Visualization & Interactive Sentence Reader ----------------------

  private startAnimation() {
    if (this.animationFrame !== undefined) return;
    const tick = () => {
      this.animationFrame = requestAnimationFrame(tick);
      if (!this.audioCtx) return;
      const elapsed = this.getPlayheadSec();
      this.highlightWordAt(elapsed);
      this.drawWaveform(elapsed);
    };
    this.animationFrame = requestAnimationFrame(tick);
  }

  private stopAnimation() {
    if (this.animationFrame !== undefined) cancelAnimationFrame(this.animationFrame);
    this.animationFrame = undefined;
  }

  /** Splits `text` into paragraphs and clickable sentences with exact character offsets. */
  private parseSentences(text: string): Array<Omit<SentenceSpanInfo, 'element'>> {
    const out: Array<Omit<SentenceSpanInfo, 'element'>> = [];
    const n = text.length;
    let pIdx = 0;
    let i = 0;

    const isSentenceTerminator = (ch: string) =>
      ch === '.' || ch === '!' || ch === '?' || ch === '。' || ch === '！' || ch === '？' || ch === '।' || ch === '॥';
    const isClosingQuoteOrBracket = (ch: string) =>
      ch === '"' || ch === "'" || ch === '”' || ch === '’' || ch === ')' || ch === ']' || ch === '」' || ch === '』';
    const nonSplittingAbbrs = new Set([
      'dr',
      'mr',
      'mrs',
      'ms',
      'st',
      'jr',
      'sr',
      'prof',
      'vs',
      'etc',
      'approx',
      'dept',
      'fig',
      'inc',
      'ltd',
      'no',
    ]);
    const isNonSplittingPeriod = (periodIdx: number, pStart: number, pEnd: number): boolean => {
      if (periodIdx + 1 < pEnd && text[periodIdx + 1] === '.') return true;
      if (
        periodIdx > pStart &&
        periodIdx + 1 < pEnd &&
        /\d/.test(text[periodIdx - 1]) &&
        /\d/.test(text[periodIdx + 1])
      ) {
        return true;
      }
      let afterIdx = periodIdx + 1;
      while (afterIdx < pEnd && isClosingQuoteOrBracket(text[afterIdx])) afterIdx++;
      if (afterIdx >= pEnd) return false;
      if (!/\s/.test(text[afterIdx])) return true;
      let nextWordIdx = afterIdx;
      while (nextWordIdx < pEnd && /\s/.test(text[nextWordIdx])) nextWordIdx++;
      if (nextWordIdx < pEnd && /^[a-z,;:]/.test(text[nextWordIdx])) return true;
      let tokStart = periodIdx;
      while (tokStart > pStart && /[a-zA-Z0-9]/.test(text[tokStart - 1])) tokStart--;
      const token = text.slice(tokStart, periodIdx);
      if (!token) return false;
      if (tokStart === pStart && /^\d+$/.test(token)) return true;
      if (token.length === 1 && /[a-zA-Z]/.test(token)) return true;
      if (tokStart > pStart && text[tokStart - 1] === '.') return true;
      if (nonSplittingAbbrs.has(token.toLowerCase())) return true;
      return false;
    };

    while (i < n) {
      while (i < n && /\s/.test(text[i])) i++;
      if (i >= n) break;

      // Find the end of the current paragraph (delimited by one or more newlines).
      let pEnd = i;
      while (pEnd < n && text[pEnd] !== '\n' && text[pEnd] !== '\r') pEnd++;

      let sStart = i;
      let j = i;
      while (j < pEnd) {
        if (isSentenceTerminator(text[j])) {
          if (text[j] === '.' && isNonSplittingPeriod(j, i, pEnd)) {
            j++;
            continue;
          }
          let k = j + 1;
          while (k < pEnd && isClosingQuoteOrBracket(text[k])) k++;
          // Split if at end of paragraph, CJK/Indic punctuation, or followed by whitespace.
          const isCjkOrIndic = text.charCodeAt(j) > 0x7f;
          if (k === pEnd || isCjkOrIndic || /\s/.test(text[k])) {
            const sentText = text.slice(sStart, k);
            if (sentText.trim().length > 0) {
              out.push({
                index: out.length,
                paragraphIndex: pIdx,
                startChar: sStart,
                endChar: k,
                text: sentText,
              });
            }
            while (k < pEnd && /\s/.test(text[k])) k++;
            sStart = k;
            j = k;
            continue;
          }
        }
        j++;
      }

      if (sStart < pEnd) {
        let sEnd = pEnd;
        while (sEnd > sStart && /\s/.test(text[sEnd - 1])) sEnd--;
        if (sEnd > sStart) {
          out.push({
            index: out.length,
            paragraphIndex: pIdx,
            startChar: sStart,
            endChar: sEnd,
            text: text.slice(sStart, sEnd),
          });
        }
      }

      pIdx++;
      i = pEnd;
      while (i < n && (text[i] === '\n' || text[i] === '\r')) i++;
    }

    return out;
  }

  private renderTranscript(text: string) {
    const trimmed = text.trim();
    this.spokenText = trimmed;
    this.transcriptEl.innerHTML = '';
    this.wordSpans = [];
    this.renderedWordCount = 0;
    this.sentences = [];
    this.activeSentenceIdx = -1;

    if (!trimmed) {
      this.updateSentenceNavButtons();
      return;
    }

    const parsed = this.parseSentences(trimmed);
    const byParagraph = new Map<number, Array<Omit<SentenceSpanInfo, 'element'>>>();
    for (const s of parsed) {
      if (!byParagraph.has(s.paragraphIndex)) byParagraph.set(s.paragraphIndex, []);
      byParagraph.get(s.paragraphIndex)!.push(s);
    }

    for (const [, list] of byParagraph) {
      const pEl = document.createElement('p');
      pEl.className = 'tts-paragraph';
      list.forEach((s, idxWithinPara) => {
        const span = document.createElement('span');
        span.className = 'tts-sentence';
        span.dataset.sentIdx = String(s.index);
        span.title = '点击从这句话开始朗读';
        span.textContent = s.text;
        span.addEventListener('click', () => {
          this.speakFromSentence(s.index);
        });
        pEl.appendChild(span);
        if (idxWithinPara < list.length - 1) {
          pEl.appendChild(document.createTextNode(' '));
        }
        this.sentences.push({ ...s, element: span });
      });
      this.transcriptEl.appendChild(pEl);
    }

    this.updateSentenceNavButtons();
  }

  private resetWordSpansInTranscript() {
    this.wordSpans = [];
    this.renderedWordCount = 0;
    for (const s of this.sentences) {
      s.element.classList.remove('active', 'synthesizing', 'spoken');
      s.element.textContent = s.text;
    }
  }

  private highlightSentenceSpan(sentIdx: number, synthesizing: boolean) {
    this.activeSentenceIdx = sentIdx;
    for (const s of this.sentences) {
      const isCurrent = s.index === sentIdx;
      s.element.classList.toggle('active', isCurrent && !synthesizing);
      s.element.classList.toggle('synthesizing', isCurrent && synthesizing);
      s.element.classList.toggle('spoken', sentIdx >= 0 && s.index >= this.startSentenceIdx && s.index < sentIdx);
    }
    this.updateSentenceNavButtons();
  }

  /** Builds per-word spans inside each clickable `.tts-sentence` element. */
  private buildWordSpans() {
    const text = this.spokenText;
    const words = [...this.wordTimestamps].sort((a, b) => a.startChar - b.startChar);
    this.wordSpans = [];
    this.renderedWordCount = this.wordTimestamps.length;

    for (const s of this.sentences) {
      const sentWords = words.filter((w) => w.startChar < s.endChar && w.endChar > s.startChar);
      s.element.innerHTML = '';
      if (sentWords.length === 0) {
        s.element.textContent = s.text;
        continue;
      }

      let cursor = s.startChar;
      for (const w of sentWords) {
        const wStart = Math.max(s.startChar, w.startChar);
        const wEnd = Math.min(s.endChar, w.endChar);
        if (wStart < cursor || wEnd > text.length || wEnd <= wStart) continue;
        if (wStart > cursor) {
          s.element.append(text.slice(cursor, wStart));
        }
        const span = document.createElement('span');
        span.className = 'tts-word';
        span.textContent = text.slice(wStart, wEnd);
        span.dataset.start = String(w.startSec);
        span.dataset.end = String(w.endSec);
        span.dataset.sentIdx = String(s.index);
        s.element.append(span);
        this.wordSpans.push(span);
        cursor = wEnd;
      }
      if (cursor < s.endChar) {
        s.element.append(text.slice(cursor, s.endChar));
      }
    }
  }

  private highlightWordAt(elapsedSec: number) {
    if (this.wordTimestamps.length === 0) return;
    if (this.renderedWordCount !== this.wordTimestamps.length) this.buildWordSpans();

    let currentSentIdx = -1;
    let latestSpokenSentIdx = -1;
    let activeAssigned = false;
    for (let i = 0; i < this.wordSpans.length; i++) {
      const span = this.wordSpans[i];
      const start = parseFloat(span.dataset.start!);
      const end = parseFloat(span.dataset.end!);
      const nextSpan = i + 1 < this.wordSpans.length ? this.wordSpans[i + 1] : undefined;
      const nextStart = nextSpan ? parseFloat(nextSpan.dataset.start!) : end + 0.15;
      const onsetSec = start - 0.015;
      const nextOnsetSec = nextStart - 0.015;
      const holdUntil = Math.min(nextOnsetSec, Math.max(end, start + 0.08) + 0.22);
      const isFirstWordLeadIn = i === 0 && Number.isFinite(elapsedSec) && elapsedSec >= 0 && elapsedSec < onsetSec;
      const isActive =
        !activeAssigned &&
        (isFirstWordLeadIn ||
          (elapsedSec >= onsetSec && elapsedSec < Math.max(end, holdUntil) && elapsedSec < nextOnsetSec));
      if (isActive) activeAssigned = true;
      const isSpoken = isFirstWordLeadIn || elapsedSec >= onsetSec;
      span.classList.toggle('active', isActive);
      span.classList.toggle('spoken', isSpoken);
      const sentIdx = Number(span.dataset.sentIdx);
      if (isActive) currentSentIdx = sentIdx;
      if (isSpoken) latestSpokenSentIdx = sentIdx;
    }

    if (Number.isFinite(elapsedSec)) {
      const targetSent = currentSentIdx >= 0 ? currentSentIdx : latestSpokenSentIdx;
      if (targetSent >= 0) {
        this.highlightSentenceSpan(targetSent, false);
      }
    }
  }

  private totalSamples(): number {
    return this.outputChunks.reduce((n, c) => n + c.length, 0);
  }

  private drawWaveform(playheadSec?: number) {
    const canvas = this.canvas;
    if (!canvas) return;
    if (canvas.width !== canvas.clientWidth || canvas.height !== canvas.clientHeight) {
      canvas.width = canvas.clientWidth;
      canvas.height = canvas.clientHeight;
    }
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    const { width, height } = canvas;
    ctx.fillStyle = '#f8f9fa';
    ctx.fillRect(0, 0, width, height);

    const total = this.totalSamples();
    if (total === 0 || width === 0) {
      ctx.strokeStyle = 'rgba(0, 151, 167, 0.4)';
      ctx.beginPath();
      ctx.moveTo(0, height / 2);
      ctx.lineTo(width, height / 2);
      ctx.stroke();
      return;
    }

    // While streaming the final length is unknown; scale to what we have so far.
    const samplesPerPx = Math.max(1, Math.ceil(total / width));
    const playheadX =
      playheadSec !== undefined ? ((playheadSec * this.outputSampleRate) / total) * width : Number.POSITIVE_INFINITY;

    let x = 0;
    let acc = 0;
    let min = 1;
    let max = -1;
    for (const chunk of this.outputChunks) {
      for (let i = 0; i < chunk.length; i++) {
        const v = chunk[i];
        if (v < min) min = v;
        if (v > max) max = v;
        if (++acc === samplesPerPx) {
          ctx.fillStyle = x <= playheadX ? 'rgba(0, 96, 100, 1.0)' : 'rgba(0, 151, 167, 0.45)';
          const y1 = ((1 - max) / 2) * height;
          const y2 = ((1 - min) / 2) * height;
          ctx.fillRect(x, y1, 1, Math.max(1, y2 - y1));
          x++;
          acc = 0;
          min = 1;
          max = -1;
        }
      }
    }

    if (Number.isFinite(playheadX) && playheadX >= 0 && playheadX <= width) {
      ctx.fillStyle = '#d93025';
      ctx.fillRect(playheadX, 0, 2, height);
    }
  }

  private resetMetrics() {
    for (const id of ['tts-metric-first', 'tts-metric-total', 'tts-metric-audio', 'tts-metric-rtf']) {
      this.setMetric(id, '-');
    }
  }

  private setMetric(id: string, value: string) {
    const el = document.getElementById(id);
    if (el) el.textContent = value;
  }

  // --- WAV export -------------------------------------------------------

  private downloadWav() {
    const total = this.totalSamples();
    if (total === 0) return;
    const sampleRate = this.outputSampleRate;
    const buffer = new ArrayBuffer(44 + total * 2);
    const view = new DataView(buffer);
    const writeString = (offset: number, s: string) => {
      for (let i = 0; i < s.length; i++) view.setUint8(offset + i, s.charCodeAt(i));
    };
    writeString(0, 'RIFF');
    view.setUint32(4, 36 + total * 2, true);
    writeString(8, 'WAVE');
    writeString(12, 'fmt ');
    view.setUint32(16, 16, true); // PCM chunk size
    view.setUint16(20, 1, true); // PCM format
    view.setUint16(22, 1, true); // mono
    view.setUint32(24, sampleRate, true);
    view.setUint32(28, sampleRate * 2, true); // byte rate
    view.setUint16(32, 2, true); // block align
    view.setUint16(34, 16, true); // bits per sample
    writeString(36, 'data');
    view.setUint32(40, total * 2, true);
    let offset = 44;
    for (const chunk of this.outputChunks) {
      for (let i = 0; i < chunk.length; i++, offset += 2) {
        const s = Math.max(-1, Math.min(1, chunk[i]));
        view.setInt16(offset, s < 0 ? s * 0x8000 : s * 0x7fff, true);
      }
    }
    const url = URL.createObjectURL(new Blob([buffer], { type: 'audio/wav' }));
    const a = document.createElement('a');
    a.href = url;
    a.download = `mediapipe-tts-${this.voiceSelect.value || 'speech'}.wav`;
    a.click();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
  }

  public override cleanup() {
    this.stop();
    if (this.audioCtx) {
      this.audioCtx.close();
      this.audioCtx = undefined;
    }
    super.cleanup();
  }
}

let activeTask: TextToSpeechTask | null = null;

export async function setupTextToSpeech(container: HTMLElement) {
  activeTask = new TextToSpeechTask({
    container,
    template,
    defaultModelName: DEFAULT_MODEL.id,
    defaultModelUrl: hostedModelDownloadUrl(DEFAULT_MODEL),
    workerFactory: () =>
      new Worker(new URL('../workers/text-to-speech.worker.ts', import.meta.url), { type: 'module' }),
    defaultDelegate: 'GPU',
  });

  await activeTask.initialize();
}

export function cleanupTextToSpeech() {
  if (activeTask) {
    activeTask.cleanup();
    activeTask = null;
  }
}
