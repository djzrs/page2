# page2 · 浏览器端 AI 演示站点

部署在 GitHub Pages 的纯前端演示集合，访问入口：

```
https://djzrs.github.io/page2/
```

（本站另经 Cloudflare 按 `/page2/` 路径转发到自定义域名 `pages.maikemaker.eu.org`，访问路径不变。）

站点根部的 `index.html` 是**自动生成的导航页**，列出下面所有子项目。

## 子项目

| 目录 | 说明 | 入口 |
|------|------|------|
| `tts/` | 中文语音合成（MediaPipe Kokoro，支持流式播放、逐词高亮、中文发音人置顶） | `index.html` |
| `mp/` | Google 官方 MediaPipe Tasks 演示合集（视觉/音频/文本/决策等 21 个示例） | `index.html` |
| `webai/` | TensorFlow.js 浏览器端实验（COCO-SSD 目标检测等） | `coco-ssd.html` |
| `tts-src/` | **TTS 的源码**（不发布，仅供 CI 构建） | — |

## 部署方式：方案 C（Actions 构建 + 推送 gh-pages）

本站采用 **GitHub Actions 自动构建、推送到 `gh-pages` 分支、由 GitHub Pages 从该分支发布** 的方式。

```
push 到 main
   │
   ▼
GitHub Actions (.github/workflows/deploy.yml)
   ├─ 1. 安装 pnpm / Node
   ├─ 2. 构建 tts-src/  →  产物输出到 tts/
   ├─ 3. 汇总所有子项目目录到 _site/
   ├─ 4. gen-nav.mjs 自动生成导航首页 _site/index.html
   └─ 5. 把 _site/ 发布到 gh-pages 分支（force_orphan）
   │
   ▼
GitHub Pages：Source = Deploy from a branch → gh-pages / (root)
   │
   ▼
https://djzrs.github.io/page2/
```

### 为什么用方案 C

- Pages 的 Source 是**单一入口**，Actions 部署和分支部署不能同时配置。
- 方案 C 让 Pages 始终从 `gh-pages` 分支读文件（稳定的静态托管），而把"构建"这件事实自动化——兼顾了自动构建和分支部署的确定性。
- `tts/` 是**构建产物**，不手工维护、不进 git（见 `.gitignore`），每次由 CI 从 `tts-src/` 生成，避免"源码改了但产物没更新"。

### 关键配置（别改错）

1. **Pages 设置**：`Settings → Pages → Build and deployment`
   - Source = **Deploy from a branch**
   - Branch = **`gh-pages`** / **(root)**
2. **Actions 写权限**：`Settings → Actions → General → Workflow permissions`
   - 选 **Read and write permissions**（工作流需要推送 gh-pages 分支）
3. **`tts-src/package.json`** 里的 `packageManager` 与 `pnpm/action-setup` 不要重复声明版本（否则报 `Multiple versions of pnpm specified`）。当前只由 `package_json_file` 读取。
4. **相对路径**：`tts-src/vite.config.ts` 的 `base` 为 `./`，构建产物用相对路径引用资源，因此放到 `/page2/tts/` 子路径下也能正确加载。CI 通过 `OUT_DIR=../tts` 直接输出到站点目录。

## 日常操作

### 改了 TTS 代码，重新上线

```bash
# 改完 tts-src/ 里的源码后
git add -A
git commit -m "更新 TTS"
git push origin main
```

push 后 Actions 自动构建并发布，约 2-4 分钟。在仓库 **Actions** 标签页看进度。

### 新增一个子项目（自动进导航）

1. 在仓库根目录建子目录，例如 `newdemo/`，放入 `index.html`（或其它入口页）。
2. 编辑 `nav.config.json`，在 `projects` 里加一条（可选，不加也能自动出现在导航，但建议加上以获得好的名称和描述）：

   ```json
   "newdemo": {
     "name": "新演示",
     "desc": "一句话介绍",
     "icon": "science",
     "entry": "index.html"
   }
   ```
   还可把 `"newdemo"` 加入 `order` 数组控制排序。
3. `git push origin main` → CI 自动汇总该目录并生成导航。

导航生成的规则（`gen-nav.mjs`）：
- 扫描根目录下所有子目录，跳过 `nav.config.json` 里 `exclude` 列出的（默认 `tts-src`、`_site`、`.git`、`.github`、`node_modules`）。
- 每个子项目的显示名优先取配置里的 `name`，否则取入口页的 `<title>`，再否则取目录名。
- 入口页优先 `index.html`，可用配置 `entry` 指定（如 webai 用 `coco-ssd.html`）。

### 手动触发部署

不想改代码也想重新部署：仓库 **Actions** 标签页 → 选 `构建 TTS 并部署 gh-pages` → **Run workflow**。

### 本地预览

```bash
# TTS 开发预览（热更新，端口 5175）
cd tts-src
pnpm install
pnpm dev

# 本地生成本站导航页（输出到根目录 index.html）
node gen-nav.mjs

# 完整模拟 CI 构建（验证产物）
cd tts-src && OUT_DIR=../tts pnpm build && cd ..
node gen-nav.mjs ./_site/index.html
```

## 模型说明

站点本身不含模型权重。`tts/` 的 Kokoro 模型（约 281 MB）在访客浏览器里按需从 **ModelScope** 镜像下载并缓存，不经服务器、不占 GitHub Pages 流量。Kokoro 支持普通话及另外 8 种语言，中文音色（`zf_*`/`zm_*` 共 8 个）在发音人列表中置顶。
