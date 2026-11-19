#!/usr/bin/env node
/**
 * 自动生成站点导航页。
 *
 * 扫描仓库根目录下的子项目，结合 nav.config.json 生成 index.html。
 * 新增子项目：只要建好目录（含入口页）并在 nav.config.json 里加一条即可；
 * 未列出的目录也会自动出现在导航里（名称取入口页的 <title>）。
 *
 * 用法：node gen-nav.mjs [输出路径]
 * 默认输出到 ./index.html；CI 里传 ./_site/index.html。
 */
import fs from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const outFile = process.argv[2] || path.join(root, 'index.html');
const configPath = path.join(root, 'nav.config.json');

let config = {};
try {
  config = JSON.parse(fs.readFileSync(configPath, 'utf8'));
} catch (_) {
  // 没有配置也能工作，用默认值。
}
const siteTitle = config.siteTitle || '我的演示站点';
const siteSubtitle = config.siteSubtitle || '';
const order = config.order || [];
const projectsCfg = config.projects || {};
const exclude = new Set(config.exclude || ['tts-src', '_site', '.git', '.github', 'node_modules']);

function readTitle(file) {
  try {
    const html = fs.readFileSync(file, 'utf8');
    const m = html.match(/<title[^>]*>([\s\S]*?)<\/title>/i);
    return m ? m[1].replace(/\s+/g, ' ').trim() : null;
  } catch {
    return null;
  }
}

function pickEntry(dirPath) {
  const cfg = projectsCfg[path.basename(dirPath)];
  if (cfg?.entry && fs.existsSync(path.join(dirPath, cfg.entry))) return cfg.entry;
  if (fs.existsSync(path.join(dirPath, 'index.html'))) return 'index.html';
  // 配置里指定了入口但文件不存在时，退回目录里第一个 html。
  const htmls = fs.readdirSync(dirPath).filter((f) => f.toLowerCase().endsWith('.html'));
  return htmls.length ? htmls.sort()[0] : null;
}

// 扫描所有子目录
const found = [];
for (const name of fs.readdirSync(root)) {
  if (exclude.has(name)) continue;
  const full = path.join(root, name);
  if (!fs.statSync(full).isDirectory()) continue;
  const entry = pickEntry(full);
  if (!entry) continue;
  const cfg = projectsCfg[name] || {};
  found.push({
    dir: name,
    entry,
    name: cfg.name || readTitle(path.join(full, entry)) || name,
    desc: cfg.desc || '',
    icon: cfg.icon || 'language',
    badge: cfg.badge || '',
  });
}

// 按 order 排序，其余按目录名
found.sort((a, b) => {
  const ia = order.indexOf(a.dir);
  const ib = order.indexOf(b.dir);
  if (ia >= 0 && ib >= 0) return ia - ib;
  if (ia >= 0) return -1;
  if (ib >= 0) return 1;
  return a.dir.localeCompare(b.dir);
});

const cards = found
  .map(
    (p) => `      <a class="card" href="./${p.dir}/${p.entry}">
        <div class="card-icon material-icons">${p.icon}</div>
        <div class="card-body">
          <h2>${p.name}${p.badge ? ` <span class="badge">${p.badge}</span>` : ''}</h2>
          ${p.desc ? `<p>${p.desc}</p>` : ''}
          <span class="path">/${p.dir}/</span>
        </div>
        <span class="arrow material-icons">chevron_right</span>
      </a>`
  )
  .join('\n');

const html = `<!DOCTYPE html>
<html lang="zh-CN">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>${siteTitle}</title>
    <link rel="preconnect" href="https://fonts.googleapis.com" />
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
    <link href="https://fonts.googleapis.com/css2?family=Roboto:wght@400;500;700&display=swap" rel="stylesheet" />
    <link href="https://fonts.googleapis.com/icon?family=Material+Icons" rel="stylesheet" />
    <style>
      :root {
        --primary: #007f8b;
        --bg: #f8f9fa;
        --surface: #ffffff;
        --text: #202124;
        --muted: #5f6368;
        --border: #e0e0e0;
      }
      * { box-sizing: border-box; }
      body {
        margin: 0;
        min-height: 100vh;
        font-family: 'Roboto', 'PingFang SC', 'Microsoft YaHei', sans-serif;
        color: var(--text);
        background: var(--bg);
        -webkit-font-smoothing: antialiased;
      }
      .wrap { max-width: 880px; margin: 0 auto; padding: 56px 20px 80px; }
      header { text-align: center; margin-bottom: 40px; }
      .logo {
        display: inline-flex; align-items: center; justify-content: center;
        width: 64px; height: 64px; border-radius: 18px;
        background: var(--primary); color: #fff; font-size: 34px; margin-bottom: 18px;
      }
      h1 { font-size: 1.9rem; font-weight: 500; margin: 0 0 8px; }
      .subtitle { color: var(--muted); margin: 0; font-size: 0.98rem; }
      .grid { display: grid; gap: 14px; }
      .card {
        display: flex; align-items: center; gap: 18px;
        background: var(--surface); border: 1px solid var(--border);
        border-radius: 14px; padding: 20px 22px;
        text-decoration: none; color: inherit;
        box-shadow: 0 1px 3px rgba(0,0,0,.04);
        transition: transform .15s ease, box-shadow .15s ease, border-color .15s ease;
      }
      .card:hover {
        transform: translateY(-2px);
        border-color: var(--primary);
        box-shadow: 0 6px 16px rgba(0,127,139,.14);
      }
      .card-icon {
        flex-shrink: 0; width: 52px; height: 52px; border-radius: 12px;
        display: flex; align-items: center; justify-content: center;
        font-size: 26px; color: var(--primary);
        background: rgba(0,127,139,.09);
      }
      .card-body { flex: 1; min-width: 0; }
      .card-body h2 { font-size: 1.12rem; font-weight: 500; margin: 0 0 5px; }
      .card-body p { margin: 0 0 6px; color: var(--muted); font-size: 0.9rem; line-height: 1.5; }
      .path { font-size: 0.78rem; color: var(--primary); font-family: monospace; }
      .badge {
        font-size: 0.68rem; font-weight: 500; vertical-align: middle;
        padding: 2px 8px; border-radius: 999px;
        background: rgba(0,127,139,.12); color: var(--primary);
      }
      .arrow { color: #b0b6bd; flex-shrink: 0; }
      footer { text-align: center; color: #9aa0a6; font-size: 0.8rem; margin-top: 48px; }
      @media (max-width: 600px) {
        .wrap { padding: 36px 14px 60px; }
        .card { padding: 16px; gap: 12px; }
        .card-icon { width: 44px; height: 44px; font-size: 22px; }
      }
    </style>
  </head>
  <body>
    <div class="wrap">
      <header>
        <div class="logo material-icons">apps</div>
        <h1>${siteTitle}</h1>
        ${siteSubtitle ? `<p class="subtitle">${siteSubtitle}</p>` : ''}
      </header>
      <main class="grid">
${cards}
      </main>
      <footer>由 GitHub Actions 自动生成导航 · ${found.length} 个子项目</footer>
    </div>
  </body>
</html>
`;

fs.mkdirSync(path.dirname(outFile), { recursive: true });
fs.writeFileSync(outFile, html, 'utf8');
console.log(`导航已生成: ${outFile} (${found.length} 个项目: ${found.map((p) => p.dir).join(', ')})`);
