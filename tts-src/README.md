# 中文语音合成（MediaPipe Kokoro）

一个可独立部署到 GitHub Pages 的中文语音合成网页应用。基于 MediaPipe `TextToSpeech`（Kokoro-82M 模型），推理完全在浏览器本地运行，文字不会上传到任何服务器。

## 特性

- **全中文界面**：所有按钮、提示、状态、示例文本均为中文。
- **仅保留 Kokoro 模型**：内置 GPU / CPU 两个变体，均从 ModelScope 镜像加载（国内可直连）。
- **中文发音人置顶**：发音人下拉框中，普通话音色排在最前并默认选中「晓晓」。
- **边合成边播放**：支持流式播放、整段合成、逐句点击朗读、逐词高亮、WAV 导出。
- **模型缓存**：模型下载后缓存在浏览器本地，同一浏览器再次访问无需重复下载。

## 本地运行

```bash
pnpm install
pnpm dev
```

打开 `http://localhost:5175/`。首次使用需要下载约 281 MB 的 Kokoro 模型（GPU 版），可在模型下拉框中切换到 CPU 版。

## 部署到 GitHub Pages

1. 在 GitHub 上新建一个仓库（例如 `tts-zh`）。
2. 把本目录的内容推送到该仓库的 `main` 分支。
3. 进入仓库 **Settings → Pages**，在 **Build and deployment** 中把 **Source** 设为 **GitHub Actions**。
4. 推送后 `.github/workflows/deploy.yml` 会自动构建并部署。部署完成后，访问地址为：

   ```
   https://<你的用户名>.github.io/<仓库名>/
   ```

构建脚本会自动从仓库名推导 Vite 的 `base` 路径，无需手动修改配置。若部署到自定义域名或用户主页站点，可设置环境变量 `VITE_BASE`（例如 `/`）。

> 说明：应用使用单线程 WASM，不需要 COOP/COEP 响应头，GitHub Pages 原生环境即可正常运行。模型从 ModelScope 直接下载，不经过你的服务器，也不占用 GitHub Pages 的流量配额。

## 项目结构

```
tts-zh/
├── index.html                  # 中文 HTML 入口
├── vite.config.ts              # 构建配置（base 自动推导）
├── copy-wasm.js                # 复制所需 WASM 文件
├── .github/workflows/deploy.yml# GitHub Pages 部署工作流
├── public/wasm/                # MediaPipe WASM（audio + vision，单线程）
└── src/
    ├── main.ts                 # 应用入口
    ├── app_clean.css           # 全局样式
    ├── tasks/text-to-speech.ts # TTS 核心逻辑（中文示例、发音人排序）
    ├── templates/text-to-speech.html # 中文界面模板
    ├── components/             # 基类、模型选择、缓存、计时器
    └── workers/                # 推理 Worker 及辅助逻辑
```

## 语言与发音人

Kokoro-82M 内置 54 个发音人，覆盖 9 种语言/方言。中文（普通话）发音人包括：

- 女声：`zf_xiaobei`、`zf_xiaoni`、`zf_xiaoxiao`、`zf_xiaoyi`
- 男声：`zm_yunjian`、`zm_yunxi`、`zm_yunxia`、`zm_yunyang`

默认选中 `zf_xiaoxiao`（晓晓）。切换发音人时，若文本框仍是预设示例，会自动切换为对应语言的示例文本；自己输入的内容不会被改动。

## 许可

基于 Google MediaPipe 示例项目改造，遵循 Apache License 2.0。
