(function(){let e=document.createElement(`link`).relList;if(e&&e.supports&&e.supports(`modulepreload`))return;for(let e of document.querySelectorAll(`link[rel="modulepreload"]`))n(e);new MutationObserver(e=>{for(let t of e)if(t.type===`childList`)for(let e of t.addedNodes)e.tagName===`LINK`&&e.rel===`modulepreload`&&n(e)}).observe(document,{childList:!0,subtree:!0});function t(e){let t={};return e.integrity&&(t.integrity=e.integrity),e.referrerPolicy&&(t.referrerPolicy=e.referrerPolicy),t.credentials=e.crossOrigin===`use-credentials`?`include`:e.crossOrigin===`anonymous`?`omit`:`same-origin`,t}function n(e){if(e.ep)return;e.ep=!0;let n=t(e);fetch(e.href,n)}})();var e=class{container;options;callback;activeValue;customStyle;constructor(e,t,n,r,i=`pills`){let a=document.getElementById(e);if(!a)throw Error(`Container element with id '${e}' not found.`);this.container=a,this.options=t,this.callback=r,this.activeValue=n,this.customStyle=i,this.render()}render(){let e=this.customStyle===`tabs`?`tabs-container`:`view-tabs`,t=this.customStyle===`tabs`?`tab-button`:`view-tab`;this.container.classList.add(e),this.container.innerHTML=``,this.options.forEach(e=>{let n=document.createElement(`button`);n.classList.add(t),n.dataset.value=e.value,e.icon?n.innerHTML=`<span class="material-icons">${e.icon}</span> ${e.label}`:n.textContent=e.label,e.value===this.activeValue&&n.classList.add(`active`),n.addEventListener(`click`,()=>{this.setActive(e.value)}),this.container.appendChild(n)})}setActive(e){let t=this.activeValue===e;this.activeValue=e;let n=this.customStyle===`tabs`?`.tab-button`:`.view-tab`;this.container.querySelectorAll(n).forEach(t=>{t.dataset.value===e?t.classList.add(`active`):t.classList.remove(`active`)}),t||this.callback(e)}},t=`mediapipe-tts-models-v1`;function n(e,t){let n=e.trim(),r=n.match(/^https?:\/\/huggingface\.co\/([^/]+)\/([^/]+)(?:\/(?:tree|blob|resolve)\/([^/]+)(?:\/(.+))?)?$/);if(r){let[,e,i,a,o]=r;if(a===`resolve`&&o)return n;let s=o||t||`${i}.litertlm`;return`https://huggingface.co/${e}/${i}/resolve/${a&&a!==`tree`&&a!==`blob`?a:`main`}/${s}`}let i=n.replace(/\/files\/?$/,``),a=i.match(/^https?:\/\/modelscope\.cn\/models\/([^/]+)\/([^/]+)(?:\/(?:tree|blob|resolve)\/([^/]+)(?:\/(.+))?)?$/);if(a){let[,e,n,r,o]=a;if(r===`resolve`&&o)return i;let s=o||t||`${n}.litertlm`;return`https://modelscope.cn/models/${e}/${n}/resolve/${r&&r!==`tree`&&r!==`blob`?r:`master`}/${s}`}return n}function r(e){return/^https?:\/\//i.test(e)}function i(e){return`${(e/1048576).toFixed(1)} MB`}var a={"https://modelscope.cn/models/litert-community/Kokoro-82M/resolve/master/kokoro_int8_gpu_fp16.litertlm":294750530,"https://modelscope.cn/models/litert-community/Kokoro-82M/resolve/master/kokoro_int8_fp16.litertlm":294783298};function o(e){return a[n(e)]??a[e]}async function s(){if(typeof caches>`u`)return null;try{return await caches.open(t)}catch(e){return console.warn(`Model cache unavailable:`,e),null}}var c=new Map;async function l(e){if(!r(e))return!1;let t=await s();return t?(await c.get(e),await t.match(e)!==void 0):!1}async function u(e){let t=await s();return t?(await c.get(e),t.delete(e)):!1}function d(e){return e===`downloading`?`正在下载模型……`:`正在初始化模型……`}var f={autoLoad:!0,autoLoadMaxBytes:1e8,accept:`.tflite,.task`,uploadLabel:`选择模型文件`},p=`[已下载]`,m=`[使用中]`,h=typeof CSS<`u`&&CSS.supports(`appearance`,`base-select`),g=class{container;options;onModelChanged;config;currentMode=`standard`;lastSelection=null;busy=!1;statusPinned=!1;selectionFixed=!1;cacheCheckGeneration=0;cachedValues=new Set;loadedValue=null;autoLoadPending=!0;phase=null;onPhaseChange=null;modelSelect;badgeContainer;badge;deleteBtn;loadButton=null;standardStatus=null;modelUpload;uploadStatus;progressWrap;progressBar;progressText;constructor(e,t,n,r={}){let i=document.getElementById(e);if(!i)throw Error(`ModelSelector: container ${e} not found`);this.container=i,this.options=t,this.onModelChanged=n,this.config={...f,...r},this.render()}updateOptions(e){this.options=e,this.renderOptions(),this.refreshCacheState()}getSelectedValue(){return this.modelSelect.value}setSelectedValue(e){this.options.some(t=>t.value===e)&&(this.modelSelect.value=e,this.selectionFixed=!0,this.refreshCacheState())}loadSelected(){this.modelUpload.value=``,this.uploadStatus.innerText=`未选择文件`,this.emit({type:`standard`,value:this.modelSelect.value})}isAutoLoad(e){let t=this.options.find(t=>t.value===e);if(t?.autoLoad!==void 0)return t.autoLoad;let n=this.sizeOf(e);return n===void 0?this.config.autoLoad:n<=this.config.autoLoadMaxBytes}getLastSelection(){return this.lastSelection}setBusy(e){this.busy=e;let t=this.lastSelection,n=e&&!(t?.type===`standard`&&this.isAutoLoad(t.value));this.modelSelect.disabled=n,this.modelUpload.disabled=n,this.loadButton&&(this.loadButton.disabled=n);let r=t?.type===`standard`&&!this.cachedValues.has(t.value);this.setPhase(e?r?`downloading`:`initializing`:null)}getPhase(){return this.phase}setPhase(e){let t=e!==this.phase;this.phase=e,this.updateLoadButton(),t&&this.onPhaseChange?.(e)}setStatus(e){let t=this.lastSelection?.type===`custom`?this.uploadStatus:this.standardStatus;t&&(t.textContent=e,t===this.standardStatus&&(this.statusPinned=!0))}setLoaded(e){this.loadedValue=e,this.renderModelMarks(),e!==null&&this.standardStatus&&!this.statusPinned&&!this.cachedValues.has(e)&&(this.standardStatus.textContent=``)}async refreshCacheState(){if(!this.config.resolveUrl)return;let e=this.config.resolveUrl,t=++this.cacheCheckGeneration,n=new Set;if(await Promise.all(this.options.map(async t=>{let r=e(t.value);r&&await l(r)&&n.add(t.value)})),t!==this.cacheCheckGeneration)return;if(this.cachedValues=n,this.config.preferCached&&!this.isAutoLoad(this.modelSelect.value)&&!this.selectionFixed&&!this.statusPinned&&!n.has(this.modelSelect.value)){let e=this.options.find(e=>n.has(e.value)&&!e.disabled);e&&(this.modelSelect.value=e.value)}this.renderModelMarks();let r=this.modelSelect.value,i=this.autoLoadPending&&!this.isAutoLoad(r);this.autoLoadPending=!1,i&&n.has(r)&&!this.busy&&!this.statusPinned&&this.loadedValue!==r?this.emit({type:`standard`,value:r}):!this.standardStatus||this.busy||this.isAutoLoad(r)||(r===this.loadedValue&&!n.has(r)?this.standardStatus.textContent=`使用中 · 未缓存，下次使用需重新下载`:this.statusPinned||this.renderCacheState(e(r),n.has(r)))}showProgress(e,t){if(this.progressWrap.style.display=`block`,t>0){let n=Math.min(100,Math.round(e/t*100));this.progressBar.style.width=`${n}%`,this.progressText.innerText=`${n}% (${i(e)} / ${i(t)})`,e>=t&&this.phase===`downloading`&&this.setPhase(`initializing`)}else this.progressBar.style.width=`100%`,this.progressText.innerText=i(e)}hideProgress(){this.progressWrap.style.display=`none`,this.progressBar.style.width=`0%`}render(){let t=this.container.id;this.container.innerHTML=`
      <div id="${t}-toggle" class="tab-container" style="margin-bottom: 12px;"></div>

      <div id="${t}-tab-standard" class="tab-content active">
        <div class="select-wrapper model-select-wrapper">
          <select id="${t}-standard-select" class="model-select">${h?`<button type="button" class="model-select-button"><selectedcontent></selectedcontent></button>`:``}</select>
          <div id="${t}-badge-container" class="model-badge-container" hidden style="position: absolute; top: -9px; right: 10px; display: flex; align-items: center; z-index: 10;">
            <span id="${t}-model-badge" class="model-badge" style="position: static; box-shadow: none; pointer-events: auto; padding-left: 2px;">
              <span class="material-icons model-badge-icon" aria-hidden="true">check_circle</span>
              <button type="button" id="${t}-model-delete-btn" class="model-delete-btn material-icons" title="从缓存中删除" style="background: transparent; border: none; padding: 0; margin-right: 2px; cursor: pointer; color: inherit; font-size: 0.9rem; line-height: 1; display: none;">delete_outline</button>
              <span class="model-badge-text">已加载</span>
            </span>
          </div>
        </div>
        <button type="button" id="${t}-standard-load-btn" class="action-button secondary load-model-btn">下载并初始化</button>
        <div id="${t}-standard-status" class="status-text standard-status"></div>
      </div>

      <div id="${t}-tab-upload" class="tab-content">
        <label class="file-upload-btn">
          <span class="file-upload-label">${this.config.uploadLabel}</span>
          <input type="file" id="${t}-file-input" class="model-upload" accept="${this.config.accept}">
        </label>
        <div id="${t}-upload-status" class="status-text upload-status">未选择文件</div>
      </div>

      <div id="${t}-progress" class="model-loading-progress" style="display: none;">
        <div class="progress-container">
          <div class="progress-bar"></div>
        </div>
        <div class="progress-text">0%</div>
      </div>
    `;let n=this.container.querySelector(`#${t}-tab-standard`),r=this.container.querySelector(`#${t}-tab-upload`);this.modelSelect=this.container.querySelector(`.model-select`),this.badgeContainer=this.container.querySelector(`.model-badge-container`),this.badge=this.container.querySelector(`.model-badge`),this.deleteBtn=this.container.querySelector(`.model-delete-btn`),this.loadButton=this.container.querySelector(`.load-model-btn`),this.standardStatus=this.container.querySelector(`.standard-status`),this.modelUpload=this.container.querySelector(`.model-upload`),this.uploadStatus=this.container.querySelector(`.upload-status`),this.progressWrap=this.container.querySelector(`.model-loading-progress`),this.progressBar=this.container.querySelector(`.progress-bar`),this.progressText=this.container.querySelector(`.progress-text`),this.renderOptions(),new e(`${t}-toggle`,[{label:`内置模型`,value:`standard`,icon:`grid_view`},{label:`上传文件`,value:`upload`,icon:`upload`}],`standard`,e=>{this.currentMode=e,n.classList.toggle(`active`,this.currentMode===`standard`),r.classList.toggle(`active`,this.currentMode===`upload`)},`tabs`),this.modelSelect.addEventListener(`change`,()=>{this.selectionFixed=!0,this.modelUpload.value=``,this.uploadStatus.innerText=`未选择文件`,this.isAutoLoad(this.modelSelect.value)?this.emit({type:`standard`,value:this.modelSelect.value}):(this.statusPinned=!1,this.autoLoadPending=!0,this.renderModelMarks(),this.refreshCacheState())}),this.loadButton?.addEventListener(`click`,()=>{this.loadSelected()}),this.deleteBtn.addEventListener(`click`,async()=>{let e=this.modelSelect.value;if(e){this.deleteBtn.disabled=!0;try{await this.deleteCachedModel(e)}finally{this.deleteBtn.disabled=!1}}}),this.modelUpload.addEventListener(`change`,e=>{let t=e.target.files?.[0];t&&(this.uploadStatus.innerText=t.name,this.emit({type:`custom`,file:t}))}),this.refreshCacheState()}renderOptions(){let e=this.modelSelect.value;Array.from(this.modelSelect.options).forEach(e=>e.remove()),this.options.forEach(e=>{let t=document.createElement(`option`);t.value=e.value,t.disabled=!!e.disabled,e.isDefault&&(t.selected=!0),h?t.innerHTML=`
          <span class="model-label">${e.label}</span>
          <span class="model-option-actions"></span>
        `:t.textContent=e.label,this.modelSelect.appendChild(t)}),e&&this.options.some(t=>t.value===e&&!t.isDefault)&&(this.modelSelect.value=e),this.renderModelMarks()}stateOf(e){return e&&e===this.loadedValue?`loaded`:this.cachedValues.has(e)?`downloaded`:null}async deleteCachedModel(e){let t=this.config.resolveUrl?this.config.resolveUrl(e):e;t&&await u(t),await this.refreshCacheState()}deleteTitle(e){return e===`loaded`?`从缓存中删除（当前仍在使用，刷新或切换模型后生效）`:`从缓存中删除`}sizeOf(e){let t=this.options.find(t=>t.value===e);if(t?.size&&t.size>0)return t.size;let n=this.config.resolveUrl?this.config.resolveUrl(e):e;return n?o(n):void 0}renderModelMarks(){for(let e of Array.from(this.modelSelect.options)){let t=this.options.find(t=>t.value===e.value)?.label??(h?e.querySelector(`.model-label`)?.textContent:e.textContent)??``,n=this.stateOf(e.value),r=n?void 0:this.sizeOf(e.value),a=r?i(r):null;if(n?(e.dataset.state=n,e.dataset.tag=n===`loaded`?`使用中`:`已下载`):(delete e.dataset.state,delete e.dataset.tag),h){let t=e.querySelector(`.model-option-actions`);if(t){if(t.innerHTML=``,n){let r=document.createElement(`span`);if(r.className=`model-badge-pill ${n===`loaded`?`loaded`:`downloaded`}`,r.textContent=n===`loaded`?`使用中`:`已下载`,t.appendChild(r),n===`loaded`){let e=document.createElement(`span`);e.className=`model-option-icon active-icon material-icons`,e.textContent=`check`,t.appendChild(e)}if(this.cachedValues.has(e.value)){let r=document.createElement(`span`);r.className=`model-option-icon model-option-delete material-icons`,r.textContent=`delete_outline`,r.title=this.deleteTitle(n);let i=e=>{e.preventDefault(),e.stopPropagation()};r.addEventListener(`mousedown`,i),r.addEventListener(`pointerdown`,i),r.addEventListener(`mouseup`,i),r.addEventListener(`pointerup`,i),r.addEventListener(`click`,async t=>{i(t),r.style.pointerEvents=`none`,r.style.opacity=`0.5`,await this.deleteCachedModel(e.value)}),t.appendChild(r)}}else if(a){let e=document.createElement(`span`);e.className=`model-option-size`,e.textContent=a,t.appendChild(e)}}}else{let r=n===`loaded`?m:n===`downloaded`?p:a?`(${a})`:``;e.textContent=r?`${t}  ${r}`:t}}let e=this.stateOf(this.modelSelect.value);if(this.badgeContainer.style.display=e===`loaded`?`flex`:`none`,this.updateLoadButton(),!e)return;let t=this.badge.querySelector(`.model-badge-icon`);e===`loaded`&&(t.style.display=`inline-block`,this.deleteBtn.style.display=`none`,this.badge.querySelector(`.model-badge-text`).textContent=`使用中`,this.badge.dataset.state=e,this.badge.title=`该模型正在使用，可随时合成`)}updateLoadButton(){let e=this.modelSelect.value,t=this.isAutoLoad(e);if(this.standardStatus&&(this.standardStatus.hidden=t||this.busy),!this.loadButton)return;let n=this.stateOf(e)===`loaded`;this.loadButton.hidden=t||n&&!this.busy,this.phase?this.loadButton.textContent=this.phase===`downloading`?`下载中……`:`初始化中……`:this.loadButton.textContent=this.cachedValues.has(e)?`初始化`:`下载并初始化`}emit(e){this.lastSelection=e,this.selectionFixed=!0,this.loadedValue=null,this.renderModelMarks(),e.type===`custom`&&(this.statusPinned=!1,this.standardStatus&&(this.standardStatus.textContent=``),this.refreshCacheState()),this.onModelChanged(e)}renderCacheState(e,t){let n=this.standardStatus;if(n.innerHTML=``,e){if(t)n.textContent=`已下载 · 已缓存到本浏览器`;else{let e=this.sizeOf(this.modelSelect.value);n.textContent=e?`模型未下载（${i(e)}）`:`模型未下载`}}}},_=`#007f8b`,v=`rgba(0, 127, 139, 0.16)`,y=`#d97706`,b=`rgba(217, 119, 6, 0.16)`,x=new Map;function S(){let e=window.location.hash||`#/vision/object_detector`,t=x.get(e);return t||(t={gpuSum:0,gpuCount:0,cpuSum:0,cpuCount:0,seriesASum:0,seriesACount:0,seriesBSum:0,seriesBCount:0,history:[]},x.set(e,t)),t}var C=class{rollingWindowSize;maxHistorySize;textUpdateIntervalMs;mode;labelA;labelB;rollingSamples=[];lastTextUpdateMs=0;lastDisplayedAvg=0;pendingUpdateTimer;canvas=null;valueBadgeEl=null;gpuAvgEl=null;cpuAvgEl=null;seriesAAvgEl=null;seriesBAvgEl=null;constructor(e=10,t=50,n=180){typeof e==`object`&&e?(this.rollingWindowSize=e.rollingWindowSize??10,this.maxHistorySize=e.maxHistorySize??50,this.textUpdateIntervalMs=e.textUpdateIntervalMs??180,this.mode=e.mode??`delegate`,this.labelA=e.labelA??(this.mode===`dual`?`A`:this.mode===`single`?`Query`:`GPU`),this.labelB=e.labelB??(this.mode===`dual`?`B`:`CPU`)):(this.rollingWindowSize=e,this.maxHistorySize=t,this.textUpdateIntervalMs=n,this.mode=`delegate`,this.labelA=`GPU`,this.labelB=`CPU`)}mount(){let e=document.querySelector(`.status-group`);if(!e)return;let t=document.getElementById(`status-message`);t&&t.classList.add(`sr-only-status`);let n=S(),r=n.history.length>0?n.history[n.history.length-1]:null,i=`- ms`;r&&(i=this.mode===`dual`&&r.timeB!==void 0?`${(r.time+r.timeB).toFixed(2)} ms`:`${r.time.toFixed(2)} ms`);let a=document.getElementById(`inference-time`);a&&(a.className=`inference-header-row`,a.innerHTML=`<span class="inference-section-title">推理耗时<span class="inference-sr-colon">： </span></span><span id="inference-time-value" class="inference-current-badge">${i}</span>`,this.valueBadgeEl=a.querySelector(`#inference-time-value`)),t&&a&&e.insertBefore(t,a.nextSibling);let o=document.getElementById(`inference-history-container`);if(!o){o=document.createElement(`div`),o.id=`inference-history-container`,o.className=`inference-history-body`;let t=``;t=this.mode===`dual`?`
          <span class="inference-delegate-stat">
            <span class="inference-legend-dot gpu"></span>
            ${this.labelA}: <strong id="inference-series-a-avg">--</strong>
          </span>
          <span class="inference-delegate-stat">
            <span class="inference-legend-dot cpu"></span>
            ${this.labelB}: <strong id="inference-series-b-avg">--</strong>
          </span>
        `:this.mode===`single`?`
          <span class="inference-delegate-stat">
            <span class="inference-legend-dot gpu"></span>
            ${this.labelA}: <strong id="inference-series-a-avg">--</strong>
          </span>
        `:`
          <span class="inference-delegate-stat">
            <span class="inference-legend-dot gpu"></span>
            ${this.labelA}: <strong id="inference-gpu-avg">--</strong>
          </span>
          <span class="inference-delegate-stat">
            <span class="inference-legend-dot cpu"></span>
            ${this.labelB}: <strong id="inference-cpu-avg">--</strong>
          </span>
        `,o.innerHTML=`
        <div class="inference-graph-wrapper">
          <canvas id="inference-history-canvas" class="inference-history-canvas"></canvas>
        </div>
        <div class="inference-delegate-summary">
          ${t}
        </div>
      `,e.appendChild(o)}this.canvas=o.querySelector(`#inference-history-canvas`),this.gpuAvgEl=o.querySelector(`#inference-gpu-avg`),this.cpuAvgEl=o.querySelector(`#inference-cpu-avg`),this.seriesAAvgEl=o.querySelector(`#inference-series-a-avg`),this.seriesBAvgEl=o.querySelector(`#inference-series-b-avg`),this.drawGraph(),this.updateDelegateSummaries()}syncStatusVisibility(e,t){let n=document.getElementById(`status-message`);if(this.valueBadgeEl&&this.valueBadgeEl.isConnected||(this.valueBadgeEl=document.getElementById(`inference-time-value`)),!this.valueBadgeEl)return;let r=t===`error`||/^error\b/i.test(e.trim())||e.toLowerCase().includes(`failed`),i=t===`idle`||t===`ready`||e.startsWith(`Done`)||e===`就绪`||e===`Ready`||e===`Webcam running...`||/ready/i.test(e);r?(n&&(n.classList.remove(`sr-only-status`),n.classList.add(`status-error`)),this.valueBadgeEl.classList.add(`error`),this.valueBadgeEl.textContent=`错误`):(n&&(n.classList.remove(`status-error`),n.classList.add(`sr-only-status`)),this.valueBadgeEl.classList.remove(`error`),i?this.lastDisplayedAvg>0?this.valueBadgeEl.textContent=`${this.lastDisplayedAvg.toFixed(2)} ms`:this.valueBadgeEl.textContent=`- ms`:this.valueBadgeEl.textContent=e.length>24?`${e.slice(0,22)}…`:e)}setStatus(e,t){let n=t===void 0?e:t,r=t===void 0?void 0:e,i=document.getElementById(`status-message`);i&&(i.textContent=n),this.syncStatusVisibility(n,r)}resetRollingWindow(){this.rollingSamples=[],this.lastTextUpdateMs=0,this.pendingUpdateTimer!==void 0&&(window.clearTimeout(this.pendingUpdateTimer),this.pendingUpdateTimer=void 0)}recordDual(e,t){if(!Number.isFinite(e)||e<0||!Number.isFinite(t)||t<0)return this.lastDisplayedAvg;let n=S();n.seriesASum+=e,n.seriesACount+=1,n.seriesBSum+=t,n.seriesBCount+=1;let r=e+t;this.rollingSamples.push(r),this.rollingSamples.length>this.rollingWindowSize&&this.rollingSamples.shift(),n.history.push({time:e,timeB:t}),n.history.length>this.maxHistorySize&&n.history.shift();let i=this.computeRollingAverage(),a=performance.now();if(this.rollingSamples.length===1||a-this.lastTextUpdateMs>=this.textUpdateIntervalMs)this.applyTextUpdate(i),this.lastTextUpdateMs=a;else if(this.pendingUpdateTimer===void 0){let e=this.textUpdateIntervalMs-(a-this.lastTextUpdateMs);this.pendingUpdateTimer=window.setTimeout(()=>{this.pendingUpdateTimer=void 0,this.applyTextUpdate(this.computeRollingAverage()),this.lastTextUpdateMs=performance.now()},Math.max(16,e))}return!this.canvas||!this.canvas.isConnected?this.mount():(this.drawGraph(),this.updateDelegateSummaries()),this.lastDisplayedAvg}recordSingle(e){if(!Number.isFinite(e)||e<0)return this.lastDisplayedAvg;let t=S();t.seriesASum+=e,t.seriesACount+=1,this.rollingSamples.push(e),this.rollingSamples.length>this.rollingWindowSize&&this.rollingSamples.shift(),t.history.push({time:e}),t.history.length>this.maxHistorySize&&t.history.shift();let n=this.computeRollingAverage(),r=performance.now();if(this.rollingSamples.length===1||r-this.lastTextUpdateMs>=this.textUpdateIntervalMs)this.applyTextUpdate(n),this.lastTextUpdateMs=r;else if(this.pendingUpdateTimer===void 0){let e=this.textUpdateIntervalMs-(r-this.lastTextUpdateMs);this.pendingUpdateTimer=window.setTimeout(()=>{this.pendingUpdateTimer=void 0,this.applyTextUpdate(this.computeRollingAverage()),this.lastTextUpdateMs=performance.now()},Math.max(16,e))}return!this.canvas||!this.canvas.isConnected?this.mount():(this.drawGraph(),this.updateDelegateSummaries()),this.lastDisplayedAvg}record(e,t=`GPU`){if(this.mode===`dual`&&typeof t==`number`)return this.recordDual(e,t);if(this.mode===`single`)return this.recordSingle(e);let n=t===`CPU`||t===`GPU`?t:`GPU`;if(!Number.isFinite(e)||e<0)return this.lastDisplayedAvg;let r=S();r.history.length>0&&r.history[r.history.length-1].delegate!==n&&(this.rollingSamples=[],this.lastTextUpdateMs=0),this.rollingSamples.push(e),this.rollingSamples.length>this.rollingWindowSize&&this.rollingSamples.shift(),n===`GPU`?(r.gpuSum+=e,r.gpuCount+=1):(r.cpuSum+=e,r.cpuCount+=1),r.history.push({time:e,delegate:n}),r.history.length>this.maxHistorySize&&r.history.shift();let i=this.computeRollingAverage(),a=performance.now();if(this.rollingSamples.length===1||a-this.lastTextUpdateMs>=this.textUpdateIntervalMs)this.applyTextUpdate(i),this.lastTextUpdateMs=a;else if(this.pendingUpdateTimer===void 0){let e=this.textUpdateIntervalMs-(a-this.lastTextUpdateMs);this.pendingUpdateTimer=window.setTimeout(()=>{this.pendingUpdateTimer=void 0,this.applyTextUpdate(this.computeRollingAverage()),this.lastTextUpdateMs=performance.now()},Math.max(16,e))}return!this.canvas||!this.canvas.isConnected?this.mount():(this.drawGraph(),this.updateDelegateSummaries()),this.lastDisplayedAvg}cleanup(){this.pendingUpdateTimer!==void 0&&(window.clearTimeout(this.pendingUpdateTimer),this.pendingUpdateTimer=void 0)}computeRollingAverage(){return this.rollingSamples.length===0?0:this.rollingSamples.reduce((e,t)=>e+t,0)/this.rollingSamples.length}applyTextUpdate(e){this.lastDisplayedAvg=e;let t=document.getElementById(`status-message`);if(t&&t.classList.contains(`status-error`)&&(t.classList.remove(`status-error`),t.classList.add(`sr-only-status`)),this.valueBadgeEl&&this.valueBadgeEl.isConnected||(this.valueBadgeEl=document.getElementById(`inference-time-value`)),this.valueBadgeEl)this.valueBadgeEl.classList.remove(`error`),this.valueBadgeEl.textContent=`${e.toFixed(2)} ms`;else{let t=document.getElementById(`inference-time`);t&&(t.innerText=`推理耗时：${e.toFixed(2)} 毫秒`)}}updateDelegateSummaries(){let e=S();if(this.mode===`dual`){if(this.seriesAAvgEl){if(e.seriesACount>0){let t=e.seriesASum/e.seriesACount;this.seriesAAvgEl.textContent=`${t.toFixed(1)} ms`}else this.seriesAAvgEl.textContent=`--`}if(this.seriesBAvgEl){if(e.seriesBCount>0){let t=e.seriesBSum/e.seriesBCount;this.seriesBAvgEl.textContent=`${t.toFixed(1)} ms`}else this.seriesBAvgEl.textContent=`--`}}else if(this.mode===`single`){if(this.seriesAAvgEl){if(e.seriesACount>0){let t=e.seriesASum/e.seriesACount;this.seriesAAvgEl.textContent=`${t.toFixed(1)} ms`}else this.seriesAAvgEl.textContent=`--`}}else{if(this.gpuAvgEl){if(e.gpuCount>0){let t=e.gpuSum/e.gpuCount;this.gpuAvgEl.textContent=`${t.toFixed(1)} ms`}else this.gpuAvgEl.textContent=`--`}if(this.cpuAvgEl){if(e.cpuCount>0){let t=e.cpuSum/e.cpuCount;this.cpuAvgEl.textContent=`${t.toFixed(1)} ms`}else this.cpuAvgEl.textContent=`--`}}}drawGraph(){if(!this.canvas)return;let e=this.canvas.getContext(`2d`);if(!e)return;let t=S().history,n=window.devicePixelRatio||1,r=this.canvas.clientWidth||248,i=this.canvas.clientHeight||64;(this.canvas.width!==Math.round(r*n)||this.canvas.height!==Math.round(i*n))&&(this.canvas.width=Math.round(r*n),this.canvas.height=Math.round(i*n)),e.save(),e.scale(n,n),e.clearRect(0,0,r,i);let a=Math.max(10,r-40-8),o=Math.max(10,i-8-8);e.strokeStyle=`#e2e8f0`,e.lineWidth=1,e.setLineDash([2,2]);for(let t of[0,.5,1]){let n=8+o*t;e.beginPath(),e.moveTo(40,n),e.lineTo(40+a,n),e.stroke()}if(e.setLineDash([]),t.length===0){e.fillStyle=`#94a3b8`,e.font=`11px "Google Sans", "Roboto", sans-serif`,e.textAlign=`center`,e.textBaseline=`middle`,e.fillText(`暂无数据`,r/2,i/2),e.restore();return}let s=Math.max(...t.map(e=>e.timeB===void 0?e.time:Math.max(e.time,e.timeB)),5)*1.2;e.fillStyle=`#64748b`,e.font=`9px "Roboto Mono", monospace`,e.textAlign=`right`,e.textBaseline=`middle`,e.fillText((e=>e>=1e3?`${(e/1e3).toFixed(1)}s`:`${Math.round(e)}ms`)(s),35,10),e.fillText(`0ms`,35,8+o-1);let c=e=>{let t=Math.max(0,Math.min(s,e));return 8+o-t/s*o},l=t.length,u=8+o,d=e=>l===1?40+a/2:40+e/(l-1)*a;if(this.mode===`dual`){if(l===1){let n=t[0],r=c(n.time);if(e.fillStyle=v,e.fillRect(40,r,a,u-r),e.strokeStyle=_,e.lineWidth=2,e.beginPath(),e.moveTo(40,r),e.lineTo(40+a,r),e.stroke(),n.timeB!==void 0){let t=c(n.timeB);e.fillStyle=b,e.fillRect(40,t,a,u-t),e.strokeStyle=y,e.lineWidth=2,e.beginPath(),e.moveTo(40,t),e.lineTo(40+a,t),e.stroke()}e.restore();return}let n=t.map((e,t)=>({x:d(t),y:c(e.time)}));e.fillStyle=v,e.beginPath(),e.moveTo(n[0].x,u),n.forEach(t=>e.lineTo(t.x,t.y)),e.lineTo(n[n.length-1].x,u),e.closePath(),e.fill(),e.strokeStyle=_,e.lineWidth=2,e.lineJoin=`round`,e.lineCap=`round`,e.beginPath(),n.forEach((t,n)=>n===0?e.moveTo(t.x,t.y):e.lineTo(t.x,t.y)),e.stroke();let r=t.map((e,t)=>({x:d(t),y:c(e.timeB??0)}));e.fillStyle=b,e.beginPath(),e.moveTo(r[0].x,u),r.forEach(t=>e.lineTo(t.x,t.y)),e.lineTo(r[r.length-1].x,u),e.closePath(),e.fill(),e.strokeStyle=y,e.lineWidth=2,e.lineJoin=`round`,e.lineCap=`round`,e.beginPath(),r.forEach((t,n)=>n===0?e.moveTo(t.x,t.y):e.lineTo(t.x,t.y)),e.stroke(),l<=25&&(n.forEach(t=>{e.fillStyle=_,e.beginPath(),e.arc(t.x,t.y,2.5,0,Math.PI*2),e.fill()}),r.forEach(t=>{e.fillStyle=y,e.beginPath(),e.arc(t.x,t.y,2.5,0,Math.PI*2),e.fill()})),e.restore();return}if(this.mode===`single`){if(l===1){let n=t[0],r=c(n.time);e.fillStyle=v,e.fillRect(40,r,a,u-r),e.strokeStyle=_,e.lineWidth=2,e.beginPath(),e.moveTo(40,r),e.lineTo(40+a,r),e.stroke(),e.fillStyle=_,e.beginPath(),e.arc(40+a/2,r,3,0,Math.PI*2),e.fill(),e.restore();return}let n=t.map((e,t)=>({x:d(t),y:c(e.time)}));e.fillStyle=v,e.beginPath(),e.moveTo(n[0].x,u),n.forEach(t=>e.lineTo(t.x,t.y)),e.lineTo(n[n.length-1].x,u),e.closePath(),e.fill(),e.strokeStyle=_,e.lineWidth=2,e.lineJoin=`round`,e.lineCap=`round`,e.beginPath(),n.forEach((t,n)=>n===0?e.moveTo(t.x,t.y):e.lineTo(t.x,t.y)),e.stroke(),l<=25&&n.forEach(t=>{e.fillStyle=_,e.beginPath(),e.arc(t.x,t.y,2.5,0,Math.PI*2),e.fill()}),e.restore();return}if(l===1){let n=t[0],r=c(n.time),i=n.delegate===`GPU`?_:y;e.fillStyle=n.delegate===`GPU`?v:b,e.fillRect(40,r,a,u-r),e.strokeStyle=i,e.lineWidth=2,e.beginPath(),e.moveTo(40,r),e.lineTo(40+a,r),e.stroke(),e.fillStyle=i,e.beginPath(),e.arc(40+a/2,r,3,0,Math.PI*2),e.fill(),e.restore();return}let f=[{delegate:t[0].delegate??`GPU`,points:[{x:d(0),y:c(t[0].time)}]}],p=[];for(let e=1;e<l;e++){let n=t[e-1],r=t[e],i=d(e-1),a=c(n.time),o=d(e),s=c(r.time),l=n.delegate??`GPU`,u=r.delegate??`GPU`;if(u===l)f[f.length-1].points.push({x:o,y:s});else{let e=(i+o)/2,t=(a+s)/2;f[f.length-1].points.push({x:e,y:t}),p.push(e),f.push({delegate:u,points:[{x:e,y:t},{x:o,y:s}]})}}for(let t of f){if(t.points.length<2)continue;let n=t.delegate===`GPU`?_:y;e.fillStyle=t.delegate===`GPU`?v:b,e.beginPath(),e.moveTo(t.points[0].x,u);for(let n of t.points)e.lineTo(n.x,n.y);e.lineTo(t.points[t.points.length-1].x,u),e.closePath(),e.fill(),e.strokeStyle=n,e.lineWidth=2,e.lineJoin=`round`,e.lineCap=`round`,e.beginPath(),t.points.forEach((t,n)=>{n===0?e.moveTo(t.x,t.y):e.lineTo(t.x,t.y)}),e.stroke()}for(let t of p)e.save(),e.strokeStyle=`#94a3b8`,e.lineWidth=1,e.setLineDash([3,3]),e.beginPath(),e.moveTo(t,8),e.lineTo(t,u),e.stroke(),e.restore();if(l<=15)for(let n=0;n<l;n++){let r=d(n),i=c(t[n].time);e.fillStyle=(t[n].delegate??`GPU`)===`GPU`?_:y,e.beginPath(),e.arc(r,i,2.5,0,Math.PI*2),e.fill()}e.restore()}},w=100;function T(){return typeof navigator<`u`&&navigator.webdriver===!0}function E(e,t){if(!T())return;let n=window.__mpTestResults??={seq:0,results:{},history:{}};n.seq+=1;let r={seq:n.seq,timestampMs:Date.now(),task:e};try{r.payload=t()}catch(e){r.error=e instanceof Error?e.message:String(e)}n.results[e]=r;let i=n.history[e]??=[];i.push(r),i.length>w&&i.shift()}var D=class{options;container;worker;currentModel;models={};customModelFile;modelSelector;currentDelegate=`GPU`;inferenceTimer=new C;initQueue=[];isWorkerReady=!1;modelRequested=!1;constructor(e){this.options=e,this.container=e.container,this.currentModel=e.defaultModelName,this.models[e.defaultModelName]=e.defaultModelUrl,e.models&&Object.assign(this.models,e.models),e.defaultDelegate&&(this.currentDelegate=e.defaultDelegate)}async initialize(){this.container.innerHTML=this.options.template,this.initWorker(),this.setupUI(),this.onInitializeUI(),this.setupDelegateSelect(),this.modelSelector&&!this.modelSelector.isAutoLoad(this.currentModel)?this.updateStatus(`模型未加载`):await this.initializeTask()}initWorker(){this.worker||=this.options.workerFactory(),this.worker&&(this.worker.onmessage=e=>{e.data?.type===`INIT_DONE`&&(this.loadedModel=e.data.modelName??this.initQueue[0]??this.currentModel,this.loadedDelegate=e.data.delegate??this.currentDelegate),this.handleWorkerMessage(e)})}loadedModel;loadedDelegate;hadDelegateFallback=!1;handleWorkerMessage(e){let{type:t}=e.data;switch(t){case`LOAD_PROGRESS`:this.handleLoadProgress(e.data);break;case`INIT_DONE`:this.handleInitDone(e.data);break;case`MODEL_CACHED`:this.modelSelector?.refreshCacheState();break;case`DELEGATE_FALLBACK`:let{reason:t,advice:n}=e.data,r=n?`${t}（${n}）`:`GPU 不可用。`;console.warn(`Worker fell back to CPU delegate: ${r}`),this.currentDelegate=`CPU`,this.hadDelegateFallback=!0;let i=document.getElementById(`delegate-select`);i&&(i.value=`CPU`),this.renderFallbackWarning(r);break;case`ERROR`:case`DETECT_ERROR`:case`CLASSIFY_ERROR`:this.initQueue.length>0&&this.initQueue.shift(),console.error(`Worker error:`,e.data.error),this.modelSelector?.hideProgress(),this.modelSelector?.setBusy(!1),this.setLoadingOverlay(null),this.updateStatus(`错误：${e.data.error}`)}}handleLoadProgress(e){let{progress:t,loaded:n,total:r}=e;t===void 0?n!==void 0&&r!==void 0&&(this.modelSelector?.showProgress(n,r),r>0&&n>=r&&setTimeout(()=>this.modelSelector?.hideProgress(),500)):(this.modelSelector?.showProgress(t*100,100),t>=1&&setTimeout(()=>this.modelSelector?.hideProgress(),500))}handleInitDone(e){let t=e?.modelName;t===void 0&&(t=this.initQueue.length>0?this.initQueue[0]:this.currentModel),this.initQueue.length>0&&this.initQueue.shift(),t===this.currentModel&&(this.modelSelector?.hideProgress(),this.modelSelector?.setBusy(!1),this.modelSelector?.setLoaded(t===`custom`?null:t),this.setLoadingOverlay(null),this.isWorkerReady=!0,this.hadDelegateFallback?(this.updateStatus(`GPU 不可用，已切换到 CPU（就绪）。`),this.hadDelegateFallback=!1):this.updateStatus(`就绪`))}setupDelegateSelect(){let e=document.getElementById(`delegate-select`);e&&(e.addEventListener(`change`,async()=>{this.currentDelegate=e.value,this.modelRequested&&await this.initializeTask()}),e.value=this.currentDelegate)}setupUI(){this.modelSelector=new g(`model-selector-container`,Object.keys(this.models).map(e=>({label:e,value:e,isDefault:e===this.options.defaultModelName})),async e=>{e.type===`standard`?(this.currentModel=e.value,this.customModelFile=void 0):e.type===`custom`&&(this.customModelFile=e.file,this.currentModel=`custom`),await this.initializeTask()},this.getModelSelectorConfig()),this.modelSelector.onPhaseChange=e=>{e&&document.querySelector(`.viewport.loading-model`)&&(this.setLoadingOverlay(e),this.updateStatus(d(e)))},this.inferenceTimer.mount()}getModelSelectorConfig(){return{resolveUrl:e=>this.resolveModelUrl(e)}}resolveModelUrl(e){let t=this.models[e];if(!t)return;if(t.startsWith(`http`))return t;let n=new URL(`./`,window.location.href).href;return new URL(t,n).href}setLoadingOverlay(e){let t=document.querySelector(`.viewport`);t&&(t.classList.toggle(`loading-model`,e!==null),e&&(t.dataset.loadingText=d(e)))}async initializeTask(){this.modelRequested=!0,this.isWorkerReady=!1,this.inferenceTimer.resetRollingWindow(),this.modelSelector?.setBusy(!0);let e=this.modelSelector?.getPhase()??`initializing`;this.setLoadingOverlay(e),this.updateStatus(d(e));let t=new URL(`./`,window.location.href).href,n=this.currentModel===`custom`?this.customModelFile:void 0,r=n?void 0:this.resolveModelUrl(this.currentModel),i=this.getWorkerInitParamsInner();this.initQueue.push(this.currentModel),this.worker?.postMessage({type:`INIT`,modelName:this.currentModel,modelAssetPath:r,modelFile:n,delegate:this.currentDelegate,baseUrl:t,...i})}getWorkerInitParamsInner(){return this.getWorkerInitParams()}updateStatus(e){let t=document.getElementById(`status-message`);t&&(t.innerText=e),this.inferenceTimer.syncStatusVisibility(e)}updateInferenceTime(e){return this.inferenceTimer.record(e,this.currentDelegate)}publishTestResult(e,t){E(e,()=>({model:this.loadedModel??null,delegate:this.loadedDelegate??null,...t()}))}cleanup(){this.inferenceTimer.cleanup(),this.worker&&=(this.worker.postMessage({type:`CLEANUP`}),this.worker.terminate(),void 0),this.isWorkerReady=!1}renderFallbackWarning(e){let t=document.getElementById(`fallback-warning`);if(!t){let e=document.querySelector(`.status-group`);e&&(t=document.createElement(`div`),t.id=`fallback-warning`,t.className=`fallback-warning`,t.style.cssText=`color: #d97706; font-size: 0.85rem; margin-top: 4px; font-weight: 500;`,e.appendChild(t))}t&&(t.innerText=`⚠️ GPU 不可用（${e}），已切换到 CPU 运行。`)}onInitializeUI(){}},O=[{id:`kokoro_82m`,name:`Kokoro-82M（GPU）`,url:`https://modelscope.cn/models/litert-community/Kokoro-82M`,fileName:`kokoro_int8_gpu_fp16.litertlm`,description:`9 种语言，含普通话`},{id:`kokoro_82m_cpu`,name:`Kokoro-82M（CPU）`,url:`https://modelscope.cn/models/litert-community/Kokoro-82M`,fileName:`kokoro_int8_fp16.litertlm`,description:`无 GPU 时推荐，含普通话`}];function k(e){return n(e.url,e.fileName)}var A=`<div class="task-container">\r
  <!-- 左侧控制区 -->\r
  <div class="controls-panel">\r
    <div class="section-title">模型选择</div>\r
    <div id="model-selector-container"></div>\r
\r
    <div class="divider"></div>\r
\r
    <div class="section-title">设置</div>\r
\r
    <div class="control-group">\r
      <div class="control-label">\r
        <span>发音人</span>\r
      </div>\r
      <div class="select-wrapper">\r
        <select id="voice-select" disabled>\r
          <option value="">请先加载模型</option>\r
        </select>\r
      </div>\r
    </div>\r
\r
    <div class="control-group">\r
      <div class="control-label">\r
        <span>语速</span>\r
        <span id="speaking-rate-value" class="value-badge">1.0</span>\r
      </div>\r
      <input type="range" id="speaking-rate" min="0.5" max="2" step="0.1" value="1" class="range-slider" />\r
      <div class="control-hint">重新加载模型后生效。</div>\r
    </div>\r
\r
    <div class="control-group">\r
      <div class="control-label">\r
        <span>运行设备</span>\r
      </div>\r
      <div class="select-wrapper">\r
        <select id="delegate-select">\r
          <option value="GPU" selected>GPU</option>\r
          <option value="CPU">CPU</option>\r
        </select>\r
      </div>\r
    </div>\r
\r
    <div class="divider"></div>\r
\r
    <div class="status-group">\r
      <div id="status-message" class="status-message">就绪</div>\r
      <div id="inference-time" class="inference-time">推理耗时：- 毫秒</div>\r
    </div>\r
  </div>\r
\r
  <!-- 右侧输出区 -->\r
  <div class="output-panel">\r
    <div class="output-header">\r
      <h2>中文语音合成</h2>\r
    </div>\r
\r
    <div class="viewport tts-viewport">\r
      <div class="tts-card">\r
        <div class="preset-bar" id="tts-samples">\r
          <span class="preset-bar-label">示例</span>\r
          <button class="sample-chip active" data-sample="welcome">欢迎语</button>\r
          <button class="sample-chip" data-sample="story">小故事</button>\r
          <button class="sample-chip" data-sample="numbers">数字与日期</button>\r
          <button class="sample-chip" data-sample="article">多段文章</button>\r
        </div>\r
\r
        <textarea\r
          id="tts-text-input"\r
          class="slot-textarea"\r
          rows="5"\r
          placeholder="输入或粘贴要朗读的文字……"\r
        ></textarea>\r
\r
        <div class="tts-actions">\r
          <button\r
            id="tts-stream-btn"\r
            class="action-button"\r
            title="边合成边播放：首个片段生成后立即播放，其余文本继续在后台合成。"\r
            disabled\r
          >\r
            <span class="material-icons">graphic_eq</span> 流式播放\r
          </button>\r
          <button\r
            id="tts-speak-btn"\r
            class="action-button secondary"\r
            title="先把整段文字合成为一个音频再播放。想更快听到声音请用「流式播放」。"\r
            disabled\r
          >\r
            <span class="material-icons">record_voice_over</span> 合成全部\r
          </button>\r
          <button id="tts-stop-btn" class="action-button secondary" disabled>\r
            <span class="material-icons">stop</span> 停止\r
          </button>\r
          <button id="tts-download-btn" class="action-button secondary" disabled>\r
            <span class="material-icons">download</span> 导出 WAV\r
          </button>\r
        </div>\r
      </div>\r
\r
      <div id="tts-output" class="tts-output">\r
        <div class="audio-visualizer-container">\r
          <canvas id="tts-waveform"></canvas>\r
        </div>\r
\r
        <div class="tts-metrics">\r
          <div class="tts-metric">\r
            <span class="tts-metric-label">首字延迟</span>\r
            <span id="tts-metric-first" class="tts-metric-value">-</span>\r
          </div>\r
          <div class="tts-metric">\r
            <span class="tts-metric-label">合成耗时</span>\r
            <span id="tts-metric-total" class="tts-metric-value">-</span>\r
          </div>\r
          <div class="tts-metric">\r
            <span class="tts-metric-label">音频时长</span>\r
            <span id="tts-metric-audio" class="tts-metric-value">-</span>\r
          </div>\r
          <div class="tts-metric">\r
            <span class="tts-metric-label">实时率</span>\r
            <span id="tts-metric-rtf" class="tts-metric-value">-</span>\r
          </div>\r
        </div>\r
\r
        <div class="tts-reader-bar">\r
          <div class="tts-reader-hint" title="点击任意句子即可从该句开始朗读">\r
            <span class="material-icons" style="font-size: 16px; flex-shrink: 0">touch_app</span>\r
            <span class="tts-reader-hint-text">点击任意句子即可从该句开始朗读</span>\r
          </div>\r
          <div class="tts-reader-controls">\r
            <span id="tts-sentence-badge" class="tts-sentence-badge"></span>\r
            <button id="tts-prev-sent-btn" type="button" class="tts-nav-btn" title="上一句" disabled>\r
              <span class="material-icons" style="font-size: 16px">skip_previous</span>\r
              <span>上一句</span>\r
            </button>\r
            <button id="tts-next-sent-btn" type="button" class="tts-nav-btn" title="下一句" disabled>\r
              <span>下一句</span>\r
              <span class="material-icons" style="font-size: 16px">skip_next</span>\r
            </button>\r
          </div>\r
        </div>\r
\r
        <div id="tts-transcript" class="tts-transcript" aria-live="polite"></div>\r
      </div>\r
    </div>\r
  </div>\r
\r
  <style>\r
    .tts-viewport {\r
      justify-content: flex-start !important;\r
      padding: 20px;\r
      gap: 16px;\r
    }\r
\r
    .tts-card,\r
    .tts-output {\r
      width: 100%;\r
      max-width: 720px;\r
    }\r
\r
    .tts-actions {\r
      display: flex;\r
      flex-wrap: wrap;\r
      gap: 10px;\r
      margin-top: 12px;\r
    }\r
\r
    .tts-actions .action-button {\r
      margin-top: 0;\r
    }\r
\r
    .tts-output .audio-visualizer-container {\r
      margin-top: 0;\r
    }\r
\r
    #tts-waveform {\r
      width: 100%;\r
      height: 100%;\r
      display: block;\r
    }\r
\r
    .tts-metrics {\r
      display: grid;\r
      grid-template-columns: repeat(4, minmax(0, 1fr));\r
      gap: 8px;\r
      margin-top: 12px;\r
    }\r
\r
    .tts-metric {\r
      display: flex;\r
      flex-direction: column;\r
      padding: 8px 12px;\r
      background: #f8fafc;\r
      border: 1px solid var(--border-color);\r
      border-radius: var(--radius-sm);\r
    }\r
\r
    .tts-metric-label {\r
      font-size: 0.72rem;\r
      font-weight: 600;\r
      color: var(--text-secondary);\r
    }\r
\r
    .tts-metric-value {\r
      font-family: 'Roboto Mono', monospace;\r
      font-size: 0.95rem;\r
      color: var(--text-main);\r
      margin-top: 2px;\r
    }\r
\r
    .tts-reader-bar {\r
      display: flex;\r
      align-items: center;\r
      justify-content: space-between;\r
      flex-wrap: nowrap;\r
      gap: 8px;\r
      margin-top: 14px;\r
      padding: 6px 10px;\r
      background: #f8fafc;\r
      border: 1px solid var(--border-color);\r
      border-bottom: none;\r
      border-radius: var(--radius-sm) var(--radius-sm) 0 0;\r
    }\r
\r
    .tts-reader-hint {\r
      display: inline-flex;\r
      align-items: center;\r
      gap: 6px;\r
      min-width: 0;\r
      flex: 1 1 auto;\r
      font-size: 0.78rem;\r
      color: var(--text-secondary);\r
    }\r
\r
    .tts-reader-hint-text {\r
      min-width: 0;\r
      overflow: hidden;\r
      text-overflow: ellipsis;\r
      white-space: nowrap;\r
    }\r
\r
    .tts-reader-controls {\r
      display: inline-flex;\r
      align-items: center;\r
      flex-shrink: 0;\r
      gap: 6px;\r
    }\r
\r
    .tts-sentence-badge {\r
      font-size: 0.75rem;\r
      font-weight: 600;\r
      color: var(--primary, #00796b);\r
      padding: 2px 8px;\r
      background: rgba(0, 151, 167, 0.1);\r
      border-radius: 999px;\r
      white-space: nowrap;\r
    }\r
\r
    .tts-sentence-badge:empty {\r
      display: none;\r
    }\r
\r
    .tts-nav-btn {\r
      display: inline-flex;\r
      align-items: center;\r
      gap: 2px;\r
      padding: 3px 8px;\r
      font-size: 0.76rem;\r
      font-weight: 500;\r
      color: var(--text-main);\r
      background: #ffffff;\r
      border: 1px solid var(--border-color);\r
      border-radius: 4px;\r
      cursor: pointer;\r
      transition: background-color 0.12s ease, border-color 0.12s ease;\r
    }\r
\r
    .tts-nav-btn:hover:not(:disabled) {\r
      background: #f1f5f9;\r
      border-color: var(--primary, #00796b);\r
    }\r
\r
    .tts-nav-btn:disabled {\r
      opacity: 0.45;\r
      cursor: not-allowed;\r
    }\r
\r
    .tts-transcript {\r
      margin-top: 0;\r
      padding: 14px 16px;\r
      min-height: 64px;\r
      border: 1px solid var(--border-color);\r
      border-radius: 0 0 var(--radius-sm) var(--radius-sm);\r
      background: #ffffff;\r
      font-size: 1rem;\r
      line-height: 1.75;\r
      color: var(--text-secondary);\r
    }\r
\r
    .tts-transcript:empty::before {\r
      content: '朗读时，每个字词会在此处高亮显示。';\r
      color: #9aa0a6;\r
      font-style: italic;\r
    }\r
\r
    .tts-paragraph {\r
      margin: 0 0 10px 0;\r
    }\r
\r
    .tts-paragraph:last-child {\r
      margin-bottom: 0;\r
    }\r
\r
    .tts-sentence {\r
      border-radius: 3px;\r
      padding: 1px 0;\r
      cursor: pointer;\r
      transition: background-color 0.12s ease, color 0.12s ease;\r
    }\r
\r
    .tts-sentence:hover {\r
      background: rgba(0, 151, 167, 0.08);\r
      color: var(--text-main);\r
    }\r
\r
    .tts-sentence.active {\r
      background: rgba(0, 151, 167, 0.11);\r
      color: var(--text-main);\r
    }\r
\r
    .tts-sentence.synthesizing {\r
      background: rgba(245, 158, 11, 0.14);\r
      color: var(--text-main);\r
    }\r
\r
    .tts-sentence.spoken {\r
      color: var(--text-main);\r
    }\r
\r
    .tts-transcript .tts-word {\r
      border-radius: 3px;\r
      padding: 1px 0;\r
      transition: background-color 0.08s ease, box-shadow 0.08s ease;\r
    }\r
\r
    .tts-transcript .tts-word.spoken {\r
      color: var(--text-main);\r
    }\r
\r
    .tts-transcript .tts-word.active {\r
      background: var(--primary-soft, #b2dfdb);\r
      box-shadow: 0 0 0 2px var(--primary-soft, #b2dfdb);\r
      color: #004d40;\r
    }\r
\r
    .control-hint {\r
      font-size: 0.75rem;\r
      color: var(--text-secondary);\r
      margin-top: 4px;\r
    }\r
\r
    @media (max-width: 600px) {\r
      .tts-metrics {\r
        grid-template-columns: repeat(2, minmax(0, 1fr));\r
      }\r
    }\r
  </style>\r
</div>\r
`,j=O[0],M=[`zf_xiaoxiao`,`zf_xiaobei`,`zf_xiaoni`,`zf_xiaoyi`],N={welcome:`欢迎使用中文语音合成。您听到的每个字，都是直接在浏览器里生成的，文字不会被发送到任何服务器。

声音会在合成的过程中边生成边播放，首个字几乎没有延迟，剩下的内容在后台继续生成。

点击下面任意一句话，就能立刻从那一句开始朗读，并看着每个字词随着声音实时高亮。`,story:`守塔人最后一次登上螺旋楼梯。外面的暴风雨终于过去了，清晨的第一缕阳光洒在平静的银色海面上。

遥远的地平线上，一叶孤帆乘着金色的微风，缓缓转向港湾。他微笑着合上厚重的航海日志，又煮了一壶新鲜的咖啡。

在这片海岬上度过了四十个冬天后，那盏旧灯已改用太阳能为船只导航，但它洒在水面上的温暖光芒，始终没有改变。`,numbers:`您飞往苏黎世的航班将于三月三日上午七点四十五分，在十二号登机口起飞。票价为二百四十九美元九十九美分，全程直飞约需一个半小时。

到达二号航站楼后，史密斯博士会在四号站台等您，搭乘九点三十分的特快列车。请准备好您的确认码：ZX-4082，以便查验。

在四千五百二十条航线上，正点率高达百分之九十九点四，票价低至四十五欧元或三十九点五英镑。`,article:`端侧语音合成为网页应用带来了自然、低延迟的语音交互，同时完整保护用户隐私。

由于推理在 WebGPU 或 WebAssembly 上本地运行，音频生成可以离线工作，也不会产生任何云端服务费用。

试着点击这篇文章里不同的句子，或者切换不同发音人，比较一下音色和合成速度吧。`},P={zh:N.welcome,en:`Welcome to MediaPipe Text to Speech. Every word you hear is generated right here in your browser, without sending any text to a server.

Click on any sentence below to jump immediately to that line, and watch each word highlight in real time as it is spoken.`,ja:`MediaPipeへようこそ。この音声は、すべてお使いのブラウザの中で生成されています。

下の任意の文をクリックすると、その位置からすぐに読み上げが始まります。`};function F(e){let t=0,n=0,r=0,i=0;for(let a of e)for(let e=0;e<a.length;e++){let o=a[e];t++,Number.isFinite(o)?(r+=o*o,Math.abs(o)>i&&(i=Math.abs(o))):n++}let a=t-n;return{sampleCount:t,nonFiniteCount:n,rms:a>0?Math.sqrt(r/a):0,peak:i}}var I=class extends D{voices=[];speakingRate=1;requestId=0;isSynthesizing=!1;firstChunkMs;pendingSpeakSentenceIdx;audioCtx;scheduled=[];utteranceStartAt=0;nextStartAt=0;playedAudioSec=0;animationFrame;outputChunks=[];outputSampleRate=24e3;wordTimestamps=[];spokenText=``;utteranceCharOffset=0;startSentenceIdx=0;activeSentenceIdx=-1;sentences=[];renderedWordCount=0;selectedEnglishSample=`welcome`;requestedMode=`SYNTHESIZE`;requestedText=``;textInput;sampleChips=[];voiceSelect;speakBtn;streamBtn;stopBtn;downloadBtn;prevSentBtn;nextSentBtn;sentenceBadgeEl;transcriptEl;wordSpans=[];canvas;constructor(e){super(e)}getModelSelectorConfig(){return{autoLoad:!1,accept:`.litertlm`,uploadLabel:`选择 .litertlm 模型文件`,resolveUrl:e=>this.resolveModelUrl(e),preferCached:!0}}onInitializeUI(){this.textInput=document.getElementById(`tts-text-input`),this.voiceSelect=document.getElementById(`voice-select`),this.speakBtn=document.getElementById(`tts-speak-btn`),this.streamBtn=document.getElementById(`tts-stream-btn`),this.stopBtn=document.getElementById(`tts-stop-btn`),this.downloadBtn=document.getElementById(`tts-download-btn`),this.prevSentBtn=document.getElementById(`tts-prev-sent-btn`),this.nextSentBtn=document.getElementById(`tts-next-sent-btn`),this.sentenceBadgeEl=document.getElementById(`tts-sentence-badge`),this.transcriptEl=document.getElementById(`tts-transcript`),this.canvas=document.getElementById(`tts-waveform`),this.textInput.value=N.welcome,this.renderTranscript(this.textInput.value),this.modelSelector?.updateOptions(O.map(e=>({label:e.name,value:e.id,isDefault:e.id===j.id}))),this.sampleChips=Array.from(document.querySelectorAll(`#tts-samples .sample-chip`)),this.sampleChips.forEach(e=>{e.addEventListener(`click`,()=>{let t=e.dataset.sample;this.selectedEnglishSample=t,this.stop(),this.textInput.value=N[t],this.syncActiveSampleChip(),this.renderTranscript(this.textInput.value)})}),this.textInput.addEventListener(`input`,()=>{this.syncActiveSampleChip(),!this.isSynthesizing&&this.scheduled.length===0&&this.renderTranscript(this.textInput.value)}),this.voiceSelect.addEventListener(`change`,()=>{this.stop();let e=this.textInput.value,t=this.voiceLang(this.voiceSelect.value),n=Object.values(N).includes(e)||Object.values(P).includes(e),r;n&&(r=t===`zh`?N[this.selectedEnglishSample]??N.welcome:this.sampleForVoice(this.voiceSelect.value)),r!==void 0&&r!==e&&(this.textInput.value=r,this.syncActiveSampleChip(),this.renderTranscript(this.textInput.value)),this.isWorkerReady&&!this.isSynthesizing&&this.voiceSelect.value&&this.worker?.postMessage({type:`WARMUP_VOICE`,voiceId:this.voiceSelect.value})});let e=document.getElementById(`speaking-rate`),t=document.getElementById(`speaking-rate-value`);e.addEventListener(`input`,()=>{t.innerText=parseFloat(e.value).toFixed(1)}),e.addEventListener(`change`,()=>{this.speakingRate=parseFloat(e.value),this.modelRequested&&this.initializeTask()}),this.speakBtn.addEventListener(`click`,()=>this.synthesize(`SYNTHESIZE`,0)),this.streamBtn.addEventListener(`click`,()=>this.synthesize(`STREAM`,0)),this.stopBtn.addEventListener(`click`,()=>this.stop()),this.downloadBtn.addEventListener(`click`,()=>this.downloadWav()),this.prevSentBtn.addEventListener(`click`,()=>{let e=Math.max(0,(this.activeSentenceIdx>=0?this.activeSentenceIdx:0)-1);this.speakFromSentence(e)}),this.nextSentBtn.addEventListener(`click`,()=>{let e=Math.min(Math.max(0,this.sentences.length-1),(this.activeSentenceIdx>=0?this.activeSentenceIdx:-1)+1);this.speakFromSentence(e)}),this.drawWaveform()}resolveModelUrl(e){let t=O.find(t=>t.id===e);return t?k(t):void 0}getWorkerInitParams(){return{speakingRate:this.speakingRate,voiceId:this.voiceSelect?.value||void 0}}async initializeTask(){this.stop(!1),this.setActionsEnabled(!1),this.voiceSelect.disabled=!0,await super.initializeTask()}handleInitDone(e){if(super.handleInitDone(e),this.isWorkerReady&&(this.populateVoices(e?.voices??[]),this.setActionsEnabled(!0),this.pendingSpeakSentenceIdx!==void 0)){let e=this.pendingSpeakSentenceIdx;this.pendingSpeakSentenceIdx=void 0,this.synthesize(`STREAM`,e)}}handleWorkerMessage(e){let t=e.data;switch(t.type){case`AUDIO_CHUNK`:t.requestId===this.requestId&&this.handleAudioChunk(t);break;case`SYNTHESIS_DONE`:t.requestId===this.requestId&&this.handleSynthesisDone(t);break;case`SYNTHESIS_ERROR`:t.requestId===this.requestId&&(this.isSynthesizing=!1,this.updateStatus(`错误：${t.error}`),this.setActionsEnabled(!0));break;case`ERROR`:this.pendingSpeakSentenceIdx=void 0,super.handleWorkerMessage(e);break;default:super.handleWorkerMessage(e)}}populateVoices(e){this.voices=e;let t=this.voiceSelect.value;this.voiceSelect.innerHTML=``;let n=new Map;for(let t of e){let e=t.locale||`other`;n.has(e)||n.set(e,[]),n.get(e).push(t)}let r=e=>/^zh\b/i.test(e)?0:e.toLowerCase()===`other`?2:1,i=[...n.entries()].sort(([e],[t])=>{let n=r(e)-r(t);return n===0?e.localeCompare(t):n});for(let[e,t]of i){let n=document.createElement(`optgroup`);n.label=/^zh\b/i.test(e)?`${e}（中文）`:e;let r=[...t].sort((e,t)=>{let n=M.indexOf(e.voiceId),r=M.indexOf(t.voiceId);return(n<0?99:n)-(r<0?99:r)});for(let e of r){let t=document.createElement(`option`);t.value=e.voiceId,t.textContent=e.displayName&&e.displayName!==e.voiceId?`${e.displayName}（${e.voiceId}）`:e.voiceId,n.appendChild(t)}this.voiceSelect.appendChild(n)}e.length===0&&(this.voiceSelect.innerHTML=`<option value="">模型默认发音人</option>`);let a=e.map(e=>e.voiceId),o=M.find(e=>a.includes(e))??e.find(e=>/^zh\b/i.test(e.locale??``))?.voiceId;a.includes(t)?this.voiceSelect.value=t:o&&(this.voiceSelect.value=o),this.voiceSelect.disabled=!1}voiceLang(e){return(this.voices.find(t=>t.voiceId===e)?.locale??`en`).split(/[-_]/)[0].toLowerCase()}sampleForVoice(e){return P[this.voiceLang(e)]??N.welcome}syncActiveSampleChip(){let e=this.textInput.value;this.sampleChips.forEach(t=>{let n=t.dataset.sample;t.classList.toggle(`active`,e===N[n])})}setActionsEnabled(e){let t=e&&this.isWorkerReady&&!this.isSynthesizing;this.speakBtn.disabled=!t,this.streamBtn.disabled=!t,this.stopBtn.disabled=!(this.isSynthesizing||this.scheduled.length>0),this.downloadBtn.disabled=this.isSynthesizing||this.outputChunks.length===0,this.updateSentenceNavButtons()}updateSentenceNavButtons(){if(!this.prevSentBtn||!this.nextSentBtn)return;let e=this.sentences.length,t=this.activeSentenceIdx>=0?this.activeSentenceIdx:0;this.prevSentBtn.disabled=e<=1||t<=0,this.nextSentBtn.disabled=e<=1||t>=e-1,this.sentenceBadgeEl&&(e>0&&this.activeSentenceIdx>=0?this.sentenceBadgeEl.textContent=`第 ${this.activeSentenceIdx+1} / ${e} 句`:e>0?this.sentenceBadgeEl.textContent=`共 ${e} 句`:this.sentenceBadgeEl.textContent=``)}ensureAudioContext(){return this.audioCtx&&this.audioCtx.state!==`closed`||(this.audioCtx=new AudioContext),this.audioCtx.state===`suspended`&&this.audioCtx.resume(),this.audioCtx}speakFromSentence(e){if(!this.textInput.value.trim())return;if(this.ensureAudioContext(),!this.isWorkerReady){this.pendingSpeakSentenceIdx=e,this.modelSelector?.getPhase()||this.modelSelector?.loadSelected();return}let t=this.sentences.length>0?Math.max(0,Math.min(e,this.sentences.length-1)):0;this.synthesize(`STREAM`,t)}synthesize(e,t=0){let n=this.textInput.value.trim();if(!n||!this.worker||!this.isWorkerReady)return;this.isSynthesizing&&this.worker.postMessage({type:`CANCEL`}),this.stopPlayback(),this.ensureAudioContext(),this.spokenText!==n||this.sentences.length===0?this.renderTranscript(n):this.resetWordSpansInTranscript();let r=this.sentences.length>0?Math.max(0,Math.min(t,this.sentences.length-1)):0,i=this.sentences[r]?.startChar??0,a=n.slice(i);a.trim()&&(this.requestId++,this.isSynthesizing=!0,this.firstChunkMs=void 0,this.outputChunks=[],this.wordTimestamps=[],this.renderedWordCount=0,this.spokenText=n,this.utteranceCharOffset=i,this.startSentenceIdx=r,this.activeSentenceIdx=r,this.requestedMode=e,this.requestedText=a,this.utteranceStartAt=0,this.nextStartAt=0,this.playedAudioSec=0,this.highlightSentenceSpan(r,!0),this.resetMetrics(),this.drawWaveform(),this.updateStatus(e===`STREAM`?r>0?`正在从第 ${r+1} 句开始流式合成……`:`正在流式合成……`:`正在合成全文……`),this.setActionsEnabled(!0),this.worker.postMessage({type:e,requestId:this.requestId,text:a,voiceId:this.voiceSelect.value}))}handleAudioChunk(e){let{samples:t,sampleRateHz:n,wordTimestamps:r,elapsedMs:i}=e;this.firstChunkMs===void 0&&(this.firstChunkMs=i,this.setMetric(`tts-metric-first`,`${Math.round(i)} ms`),this.updateStatus(`正在播放……`));let a=n>0?this.totalSamples()/n:0;this.outputSampleRate=n,this.outputChunks.push(t);let o=this.outputSampleRate>0?this.totalSamples()/this.outputSampleRate:0;this.setMetric(`tts-metric-total`,`${Math.round(i)} ms`),this.setMetric(`tts-metric-audio`,`${o.toFixed(2)} s`),this.setMetric(`tts-metric-rtf`,o>0?(i/1e3/o).toFixed(3):`-`);let s=this.spokenText.slice(this.utteranceCharOffset);for(let e of r){let t=e.startChar>=0&&e.endChar<=s.length&&s.slice(e.startChar,e.endChar)===e.word?{startChar:e.startChar,endChar:e.endChar}:this.utf8ByteRangeToCharRange(s,e.startChar,e.endChar);this.wordTimestamps.push({...e,startChar:t.startChar+this.utteranceCharOffset,endChar:t.endChar+this.utteranceCharOffset})}if(t.length>0){let e=this.ensureAudioContext(),r=e.createBuffer(1,t.length,n);r.copyToChannel(t,0);let i=e.createBufferSource();i.buffer=r,i.connect(e.destination);let o=Math.max(this.nextStartAt,e.currentTime+.01);this.utteranceStartAt===0&&(this.utteranceStartAt=o),i.start(o),this.nextStartAt=o+r.duration;let s={startAt:o,duration:r.duration,audioOffsetSec:a,source:i};this.scheduled.push(s),i.onended=()=>{this.playedAudioSec=Math.max(this.playedAudioSec,s.audioOffsetSec+s.duration),this.scheduled=this.scheduled.filter(e=>e!==s),this.scheduled.length===0&&!this.isSynthesizing&&this.onPlaybackFinished()}}this.drawWaveform(),this.startAnimation()}handleSynthesisDone(e){this.isSynthesizing=!1;let t=this.totalSamples()/this.outputSampleRate,n=this.updateInferenceTime(e.totalMs);this.setMetric(`tts-metric-total`,`${Math.round(e.totalMs)} ms`),this.setMetric(`tts-metric-audio`,`${t.toFixed(2)} s`),this.setMetric(`tts-metric-rtf`,t>0?(e.totalMs/1e3/t).toFixed(3):`-`),this.publishTestResult(`text_to_speech`,()=>({mode:this.requestedMode,text:this.requestedText,voiceId:this.voiceSelect.value,cancelled:!!e.cancelled,sampleRateHz:this.outputSampleRate,chunkCount:this.outputChunks.length,durationSec:t,wordTimestampCount:this.wordTimestamps.length,...F(this.outputChunks)})),e.cancelled?this.updateStatus(`已停止`):this.scheduled.length===0?this.onPlaybackFinished():this.updateStatus(`合成耗时 ${Math.round(n)} 毫秒 · 播放中`),this.setActionsEnabled(!0)}onPlaybackFinished(){this.stopAnimation(),this.highlightWordAt(1/0),this.highlightSentenceSpan(-1,!1),this.transcriptEl&&this.textInput&&this.spokenText!==this.textInput.value.trim()&&this.renderTranscript(this.textInput.value),this.drawWaveform(),this.isSynthesizing||this.updateStatus(`就绪`),this.setActionsEnabled(!0)}stopPlayback(){for(let e of this.scheduled){e.source.onended=null;try{e.source.stop()}catch{}}this.scheduled=[],this.stopAnimation()}stop(e=!0){e&&(this.pendingSpeakSentenceIdx=void 0),this.isSynthesizing&&(this.worker?.postMessage({type:`CANCEL`}),this.requestId++,this.isSynthesizing=!1,this.updateStatus(`已停止`)),this.stopPlayback(),this.highlightSentenceSpan(-1,!1),this.transcriptEl&&this.textInput&&this.spokenText!==this.textInput.value.trim()&&this.renderTranscript(this.textInput.value),this.speakBtn&&this.setActionsEnabled(!0)}getPlayheadSec(){if(!this.audioCtx||this.utteranceStartAt===0)return 0;let e=this.audioCtx.currentTime+.035;if(e<this.utteranceStartAt)return 0;for(let t of this.scheduled)if(e>=t.startAt&&e<t.startAt+t.duration)return t.audioOffsetSec+(e-t.startAt);let t=this.playedAudioSec;for(let n of this.scheduled)e>=n.startAt+n.duration&&(t=Math.max(t,n.audioOffsetSec+n.duration));return t}utf8ByteRangeToCharRange(e,t,n){if(t<=0&&n<=0)return{startChar:0,endChar:0};let r=0,i=0,a=-1,o=-1;for(;i<e.length;){a<0&&r>=t&&(a=i);let s=e.codePointAt(i),c=s>65535?2:1;if(r+=s<=127?1:s<=2047?2:s<=65535?3:4,i+=c,r>=n){o=i;break}}return a<0&&(a=Math.min(t,e.length)),o<0&&(o=e.length),{startChar:a,endChar:o}}startAnimation(){if(this.animationFrame!==void 0)return;let e=()=>{if(this.animationFrame=requestAnimationFrame(e),!this.audioCtx)return;let t=this.getPlayheadSec();this.highlightWordAt(t),this.drawWaveform(t)};this.animationFrame=requestAnimationFrame(e)}stopAnimation(){this.animationFrame!==void 0&&cancelAnimationFrame(this.animationFrame),this.animationFrame=void 0}parseSentences(e){let t=[],n=e.length,r=0,i=0,a=e=>e===`.`||e===`!`||e===`?`||e===`。`||e===`！`||e===`？`||e===`।`||e===`॥`,o=e=>e===`"`||e===`'`||e===`”`||e===`’`||e===`)`||e===`]`||e===`」`||e===`』`,s=new Set([`dr`,`mr`,`mrs`,`ms`,`st`,`jr`,`sr`,`prof`,`vs`,`etc`,`approx`,`dept`,`fig`,`inc`,`ltd`,`no`]),c=(t,n,r)=>{if(t+1<r&&e[t+1]===`.`||t>n&&t+1<r&&/\d/.test(e[t-1])&&/\d/.test(e[t+1]))return!0;let i=t+1;for(;i<r&&o(e[i]);)i++;if(i>=r)return!1;if(!/\s/.test(e[i]))return!0;let a=i;for(;a<r&&/\s/.test(e[a]);)a++;if(a<r&&/^[a-z,;:]/.test(e[a]))return!0;let c=t;for(;c>n&&/[a-zA-Z0-9]/.test(e[c-1]);)c--;let l=e.slice(c,t);return l?!!(c===n&&/^\d+$/.test(l)||l.length===1&&/[a-zA-Z]/.test(l)||c>n&&e[c-1]===`.`||s.has(l.toLowerCase())):!1};for(;i<n;){for(;i<n&&/\s/.test(e[i]);)i++;if(i>=n)break;let s=i;for(;s<n&&e[s]!==`
`&&e[s]!==`\r`;)s++;let l=i,u=i;for(;u<s;){if(a(e[u])){if(e[u]===`.`&&c(u,i,s)){u++;continue}let n=u+1;for(;n<s&&o(e[n]);)n++;let a=e.charCodeAt(u)>127;if(n===s||a||/\s/.test(e[n])){let i=e.slice(l,n);for(i.trim().length>0&&t.push({index:t.length,paragraphIndex:r,startChar:l,endChar:n,text:i});n<s&&/\s/.test(e[n]);)n++;l=n,u=n;continue}}u++}if(l<s){let n=s;for(;n>l&&/\s/.test(e[n-1]);)n--;n>l&&t.push({index:t.length,paragraphIndex:r,startChar:l,endChar:n,text:e.slice(l,n)})}for(r++,i=s;i<n&&(e[i]===`
`||e[i]===`\r`);)i++}return t}renderTranscript(e){let t=e.trim();if(this.spokenText=t,this.transcriptEl.innerHTML=``,this.wordSpans=[],this.renderedWordCount=0,this.sentences=[],this.activeSentenceIdx=-1,!t){this.updateSentenceNavButtons();return}let n=this.parseSentences(t),r=new Map;for(let e of n)r.has(e.paragraphIndex)||r.set(e.paragraphIndex,[]),r.get(e.paragraphIndex).push(e);for(let[,e]of r){let t=document.createElement(`p`);t.className=`tts-paragraph`,e.forEach((n,r)=>{let i=document.createElement(`span`);i.className=`tts-sentence`,i.dataset.sentIdx=String(n.index),i.title=`点击从这句话开始朗读`,i.textContent=n.text,i.addEventListener(`click`,()=>{this.speakFromSentence(n.index)}),t.appendChild(i),r<e.length-1&&t.appendChild(document.createTextNode(` `)),this.sentences.push({...n,element:i})}),this.transcriptEl.appendChild(t)}this.updateSentenceNavButtons()}resetWordSpansInTranscript(){this.wordSpans=[],this.renderedWordCount=0;for(let e of this.sentences)e.element.classList.remove(`active`,`synthesizing`,`spoken`),e.element.textContent=e.text}highlightSentenceSpan(e,t){this.activeSentenceIdx=e;for(let n of this.sentences){let r=n.index===e;n.element.classList.toggle(`active`,r&&!t),n.element.classList.toggle(`synthesizing`,r&&t),n.element.classList.toggle(`spoken`,e>=0&&n.index>=this.startSentenceIdx&&n.index<e)}this.updateSentenceNavButtons()}buildWordSpans(){let e=this.spokenText,t=[...this.wordTimestamps].sort((e,t)=>e.startChar-t.startChar);this.wordSpans=[],this.renderedWordCount=this.wordTimestamps.length;for(let n of this.sentences){let r=t.filter(e=>e.startChar<n.endChar&&e.endChar>n.startChar);if(n.element.innerHTML=``,r.length===0){n.element.textContent=n.text;continue}let i=n.startChar;for(let t of r){let r=Math.max(n.startChar,t.startChar),a=Math.min(n.endChar,t.endChar);if(r<i||a>e.length||a<=r)continue;r>i&&n.element.append(e.slice(i,r));let o=document.createElement(`span`);o.className=`tts-word`,o.textContent=e.slice(r,a),o.dataset.start=String(t.startSec),o.dataset.end=String(t.endSec),o.dataset.sentIdx=String(n.index),n.element.append(o),this.wordSpans.push(o),i=a}i<n.endChar&&n.element.append(e.slice(i,n.endChar))}}highlightWordAt(e){if(this.wordTimestamps.length===0)return;this.renderedWordCount!==this.wordTimestamps.length&&this.buildWordSpans();let t=-1,n=-1,r=!1;for(let i=0;i<this.wordSpans.length;i++){let a=this.wordSpans[i],o=parseFloat(a.dataset.start),s=parseFloat(a.dataset.end),c=i+1<this.wordSpans.length?this.wordSpans[i+1]:void 0,l=c?parseFloat(c.dataset.start):s+.15,u=o-.015,d=l-.015,f=Math.min(d,Math.max(s,o+.08)+.22),p=i===0&&Number.isFinite(e)&&e>=0&&e<u,m=!r&&(p||e>=u&&e<Math.max(s,f)&&e<d);m&&(r=!0);let h=p||e>=u;a.classList.toggle(`active`,m),a.classList.toggle(`spoken`,h);let g=Number(a.dataset.sentIdx);m&&(t=g),h&&(n=g)}if(Number.isFinite(e)){let e=t>=0?t:n;e>=0&&this.highlightSentenceSpan(e,!1)}}totalSamples(){return this.outputChunks.reduce((e,t)=>e+t.length,0)}drawWaveform(e){let t=this.canvas;if(!t)return;(t.width!==t.clientWidth||t.height!==t.clientHeight)&&(t.width=t.clientWidth,t.height=t.clientHeight);let n=t.getContext(`2d`);if(!n)return;let{width:r,height:i}=t;n.fillStyle=`#f8f9fa`,n.fillRect(0,0,r,i);let a=this.totalSamples();if(a===0||r===0){n.strokeStyle=`rgba(0, 151, 167, 0.4)`,n.beginPath(),n.moveTo(0,i/2),n.lineTo(r,i/2),n.stroke();return}let o=Math.max(1,Math.ceil(a/r)),s=e===void 0?1/0:e*this.outputSampleRate/a*r,c=0,l=0,u=1,d=-1;for(let e of this.outputChunks)for(let t=0;t<e.length;t++){let r=e[t];if(r<u&&(u=r),r>d&&(d=r),++l===o){n.fillStyle=c<=s?`rgba(0, 96, 100, 1.0)`:`rgba(0, 151, 167, 0.45)`;let e=(1-d)/2*i,t=(1-u)/2*i;n.fillRect(c,e,1,Math.max(1,t-e)),c++,l=0,u=1,d=-1}}Number.isFinite(s)&&s>=0&&s<=r&&(n.fillStyle=`#d93025`,n.fillRect(s,0,2,i))}resetMetrics(){for(let e of[`tts-metric-first`,`tts-metric-total`,`tts-metric-audio`,`tts-metric-rtf`])this.setMetric(e,`-`)}setMetric(e,t){let n=document.getElementById(e);n&&(n.textContent=t)}downloadWav(){let e=this.totalSamples();if(e===0)return;let t=this.outputSampleRate,n=new ArrayBuffer(44+e*2),r=new DataView(n),i=(e,t)=>{for(let n=0;n<t.length;n++)r.setUint8(e+n,t.charCodeAt(n))};i(0,`RIFF`),r.setUint32(4,36+e*2,!0),i(8,`WAVE`),i(12,`fmt `),r.setUint32(16,16,!0),r.setUint16(20,1,!0),r.setUint16(22,1,!0),r.setUint32(24,t,!0),r.setUint32(28,t*2,!0),r.setUint16(32,2,!0),r.setUint16(34,16,!0),i(36,`data`),r.setUint32(40,e*2,!0);let a=44;for(let e of this.outputChunks)for(let t=0;t<e.length;t++,a+=2){let n=Math.max(-1,Math.min(1,e[t]));r.setInt16(a,n<0?n*32768:n*32767,!0)}let o=URL.createObjectURL(new Blob([n],{type:`audio/wav`})),s=document.createElement(`a`);s.href=o,s.download=`mediapipe-tts-${this.voiceSelect.value||`speech`}.wav`,s.click(),setTimeout(()=>URL.revokeObjectURL(o),1e3)}cleanup(){this.stop(),this.audioCtx&&=(this.audioCtx.close(),void 0),super.cleanup()}},L=null;async function R(e){L=new I({container:e,template:A,defaultModelName:j.id,defaultModelUrl:k(j),workerFactory:()=>new Worker(new URL(new URL(`text-to-speech.worker-CDcHnB1X.js`,import.meta.url).href,``+import.meta.url),{type:`module`}),defaultDelegate:`GPU`}),await L.initialize()}function z(){L&&=(L.cleanup(),null)}var B=document.querySelector(`#app`);B.innerHTML=`
  <div class="app-container">
    <main class="main-content">
      <div id="task-stage" class="task-stage"></div>
    </main>
  </div>
`,R(B.querySelector(`#task-stage`)),window.cleanupActiveTask=()=>z();