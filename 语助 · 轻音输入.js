// ==UserScript==
// @name         语助 · 轻音输入 (语音助手)
// @name:en      Voice Assistant - Speech to Text
// @name:ja      音声入力アシスタント (音声認識)
// @name:ko      음성 입력 도우미 (음성 인식)
// @name:zh-TW   語助 · 輕音輸入 (語音助手)
// @name:zh-HK   語助 · 輕音輸入 (語音助手)
// @icon         https://raw.githubusercontent.com/shiyi312/Voice-Assistant---Speech-to-Text/refs/heads/main/%E8%AF%AD%E9%9F%B3%20.ico
// @namespace    https://github.com/shiyi312/Voice-Assistant---Speech-to-Text
// @version      2.3.0
// @description  在任何输入框中通过语音高效填字，支持连续识别、自动聚焦、自定义快捷键、3秒静音自动停止。支持多国语言识别。
// @author       shiyi312
// @match        *://*/*
// @grant        GM_addStyle
// @grant        GM_setValue
// @grant        GM_getValue
// @grant        GM_deleteValue
// @grant        GM_registerMenuCommand
// @run-at       document-end
// @license      MIT
// ==/UserScript==

(function() {
  'use strict';

  // ---------- 配置默认值 ----------
  const CONFIG_DEFAULTS = {
    lang: 'zh-CN',
    autoSend: false,
    copyToClipboard: false,
    showInterim: true,
    shortcutKey: 'v',
    shortcutCtrl: true,
    shortcutShift: true,
    shortcutAlt: false
  };

  // ---------- 存储工具 ----------
  function getStorage(key, def) {
    try {
      if (typeof GM_getValue !== 'undefined') {
        const val = GM_getValue(key);
        return val !== undefined && val !== null ? val : def;
      }
      const val = localStorage.getItem('voice_helper_' + key);
      return val !== null ? JSON.parse(val) : def;
    } catch { return def; }
  }

  function setStorage(key, val) {
    try {
      if (typeof GM_setValue !== 'undefined') {
        GM_setValue(key, val);
        return;
      }
      localStorage.setItem('voice_helper_' + key, JSON.stringify(val));
    } catch {}
  }

  // ---------- 加载配置 ----------
  let config = {};
  function loadConfig() {
    for (let [key, def] of Object.entries(CONFIG_DEFAULTS)) {
      config[key] = getStorage(key, def);
    }
  }
  loadConfig();

  function saveConfig() {
    for (let [key, val] of Object.entries(config)) {
      setStorage(key, val);
    }
  }

  // ---------- 状态常量 ----------
  const STATE = {
    IDLE: 'idle',
    LISTENING: 'listening',
    PROCESSING: 'processing',
    ERROR: 'error'
  };

  let currentState = STATE.IDLE;
  let recognition = null;
  let isFinalReceived = false;
  let micButton, statusIndicator, interimDisplay, container, configPanel;
  let shortcutHandler = null;
  let isConfigOpen = false;
  let silenceTimer = null;
  const SILENCE_TIMEOUT = 3000;

  // ---------- 检测浏览器支持 ----------
  const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
  if (!SpeechRecognition) {
    createFallbackUI();
    return;
  }

  // ---------- CSS 样式 ----------
  GM_addStyle(`
    /* -------- 容器 -------- */
    #voice-assistant-container {
      position: fixed;
      bottom: 30px;
      right: 30px;
      z-index: 2147483647;
      display: flex;
      flex-direction: column;
      align-items: center;
      font-family: -apple-system, BlinkMacSystemFont, "SF Pro Display", "PingFang SC", sans-serif;
      user-select: none;
      pointer-events: none;
      touch-action: none;
    }
    #voice-assistant-container * { pointer-events: auto; touch-action: none; }

    /* -------- 主按钮 -------- */
    .va-mic {
      width: 64px;
      height: 64px;
      border-radius: 50%;
      border: none;
      background: rgba(30, 35, 42, 0.85);
      backdrop-filter: blur(16px);
      -webkit-backdrop-filter: blur(16px);
      box-shadow: 0 8px 32px rgba(0,0,0,0.35), inset 0 1px 0 rgba(255,255,255,0.08);
      color: #d0d7de;
      cursor: grab;
      display: flex;
      align-items: center;
      justify-content: center;
      transition: transform 0.25s cubic-bezier(0.34,1.56,0.64,1), background 0.3s, box-shadow 0.3s;
      will-change: transform;
      touch-action: none;
    }
    .va-mic:hover { transform: scale(1.06); background: rgba(44,52,64,0.92); }
    .va-mic:active { transform: scale(0.94); cursor: grabbing; }
    .va-mic.listening {
      background: rgba(26,115,74,0.9);
      color: #fff;
      animation: va-pulse-glow 1.6s ease-in-out infinite;
      box-shadow: 0 0 0 0 rgba(46,213,115,0.5);
    }
    @keyframes va-pulse-glow {
      0% { box-shadow: 0 0 0 0 rgba(46,213,115,0.45); }
      70% { box-shadow: 0 0 0 22px rgba(46,213,115,0); }
      100% { box-shadow: 0 0 0 0 rgba(46,213,115,0); }
    }
    .va-mic.error {
      background: rgba(200,60,60,0.9);
      color: #fff;
      animation: va-shake 0.4s ease;
    }
    @keyframes va-shake {
      0%,100% { transform: translateX(0); }
      25% { transform: translateX(-6px); }
      75% { transform: translateX(6px); }
    }

    /* -------- 状态提示 -------- */
    .va-status {
      margin-top: 12px;
      padding: 8px 18px;
      border-radius: 12px;
      background: #1E232B;
      box-shadow: 0 8px 24px rgba(0,0,0,0.55), inset 0 1px 0 rgba(255,255,255,0.06);
      font-size: 14px;
      font-weight: 500;
      letter-spacing: 0.02em;
      line-height: 1.6;
      color: #F0F4F8;
      text-align: center;
      max-width: 300px;
      pointer-events: none;
      border: 1px solid rgba(255,255,255,0.06);
      opacity: 0;
      transform: translateY(6px) scale(0.98);
      transition: opacity 0.25s ease, transform 0.25s cubic-bezier(0.34,1.56,0.64,1);
      position: relative;
      overflow: hidden;
    }
    .va-status::after {
      content: '';
      position: absolute;
      bottom: 0;
      left: 20%;
      width: 60%;
      height: 3px;
      border-radius: 4px;
      background: linear-gradient(90deg, transparent, rgba(46,213,115,0.35), transparent);
      opacity: 0.6;
      transition: opacity 0.4s;
    }
    .va-status:not(:empty) { opacity: 1; transform: translateY(0) scale(1); }
    .va-status:not(:empty)::after { opacity: 1; }
    .va-status[data-icon]::before { content: attr(data-icon); margin-right: 6px; }

    .va-interim {
      margin-top: 10px;
      padding: 4px 14px;
      border-radius: 20px;
      background: rgba(20,24,30,0.75);
      backdrop-filter: blur(8px);
      -webkit-backdrop-filter: blur(8px);
      font-size: 13px;
      font-weight: 400;
      letter-spacing: 0.02em;
      color: #E6EDF3;
      max-width: 280px;
      text-align: center;
      opacity: 0;
      transition: opacity 0.25s ease;
      box-shadow: 0 4px 16px rgba(0,0,0,0.3);
      border: 1px solid rgba(255,255,255,0.05);
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
      pointer-events: none;
    }
    .va-interim.visible { opacity: 0.9; }

    /* -------- 配置面板 -------- */
    .va-config-overlay {
      display: none;
      position: fixed;
      inset: 0;
      z-index: 2147483646;
      background: rgba(0,0,0,0.3);
      backdrop-filter: blur(4px);
      -webkit-backdrop-filter: blur(4px);
      opacity: 0;
      transition: opacity 0.35s ease;
      pointer-events: none;
    }
    .va-config-overlay.open {
      display: block;
      opacity: 1;
      pointer-events: auto;
    }

    .va-config-panel {
      position: fixed;
      top: 50%;
      left: 50%;
      transform: translate(-50%, -50%) scale(0.92);
      width: 320px;
      max-width: 92vw;
      padding: 28px 24px 24px;
      background: linear-gradient(145deg, rgba(30,35,42,0.96), rgba(22,26,32,0.98));
      backdrop-filter: blur(24px);
      -webkit-backdrop-filter: blur(24px);
      border-radius: 20px;
      box-shadow: 0 32px 80px rgba(0,0,0,0.6), 0 0 0 1px rgba(255,255,255,0.06);
      z-index: 2147483647;
      font-family: -apple-system, BlinkMacSystemFont, "SF Pro Display", "PingFang SC", sans-serif;
      color: #F0F4F8;
      font-size: 13px;
      transition: transform 0.4s cubic-bezier(0.34,1.56,0.64,1), opacity 0.35s ease;
      opacity: 0;
      pointer-events: none;
      max-height: 90vh;
      overflow-y: auto;
    }
    .va-config-overlay.open .va-config-panel {
      opacity: 1;
      pointer-events: auto;
      transform: translate(-50%, -50%) scale(1);
    }

    .va-config-panel::-webkit-scrollbar { width: 4px; }
    .va-config-panel::-webkit-scrollbar-track { background: transparent; }
    .va-config-panel::-webkit-scrollbar-thumb { background: rgba(255,255,255,0.15); border-radius: 4px; }

    .va-config-panel .va-config-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 20px;
      padding-bottom: 12px;
      border-bottom: 1px solid rgba(255,255,255,0.06);
    }
    .va-config-panel .va-config-header h4 {
      margin: 0;
      font-weight: 600;
      font-size: 16px;
      letter-spacing: 0.02em;
      color: #F0F4F8;
      display: flex;
      align-items: center;
      gap: 8px;
    }
    .va-config-panel .va-config-header h4::before {
      content: '🎙️';
      font-size: 18px;
    }
    .va-config-panel .va-close-btn {
      background: rgba(255,255,255,0.05);
      border: none;
      border-radius: 50%;
      width: 32px;
      height: 32px;
      color: #8b949e;
      font-size: 16px;
      cursor: pointer;
      transition: background 0.2s, color 0.2s, transform 0.2s;
      display: flex;
      align-items: center;
      justify-content: center;
    }
    .va-config-panel .va-close-btn:hover {
      background: rgba(255,255,255,0.12);
      color: #F0F4F8;
      transform: rotate(90deg);
    }

    .va-config-panel .va-config-group {
      margin-bottom: 16px;
    }
    .va-config-panel .va-config-group:last-child { margin-bottom: 0; }

    .va-config-panel .va-config-label {
      display: block;
      font-size: 11px;
      font-weight: 500;
      color: #8b949e;
      text-transform: uppercase;
      letter-spacing: 0.06em;
      margin-bottom: 6px;
    }

    /* -------- 下拉菜单 - 修复显示不全 + 宽度自适应 -------- */
    .va-config-panel select {
      width: 100%;
      min-width: 100%;
      padding: 8px 32px 8px 12px;
      background: rgba(255,255,255,0.05);
      border: 1px solid rgba(255,255,255,0.08);
      border-radius: 10px;
      color: #F0F4F8;
      font-size: 13px;
      transition: border-color 0.2s, background 0.2s;
      appearance: none;
      background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='10' height='6'%3E%3Cpath d='M0 0l5 6 5-6z' fill='%238b949e'/%3E%3C/svg%3E");
      background-repeat: no-repeat;
      background-position: right 12px center;
      cursor: pointer;
      box-sizing: border-box;
    }
    .va-config-panel select:hover { border-color: rgba(46,213,115,0.3); }
    .va-config-panel select:focus {
      outline: none;
      border-color: #2ed573;
      background: rgba(46,213,115,0.05);
    }
    /* 让下拉选项文字完整显示 */
    .va-config-panel select option {
      padding: 4px 8px;
      background: #1E232B;
      color: #F0F4F8;
      white-space: nowrap;
    }

    .va-config-panel .va-checkbox-row {
      display: flex;
      align-items: center;
      gap: 10px;
      padding: 4px 0;
      cursor: pointer;
    }
    .va-config-panel .va-checkbox-row input[type="checkbox"] {
      width: 18px;
      height: 18px;
      accent-color: #2ed573;
      cursor: pointer;
      flex-shrink: 0;
    }
    .va-config-panel .va-checkbox-row span {
      font-size: 13px;
      color: #e6edf3;
      user-select: none;
    }

    .va-config-panel .va-shortcut-box {
      padding: 10px 14px;
      background: rgba(255,255,255,0.04);
      border: 1px solid rgba(255,255,255,0.08);
      border-radius: 10px;
      color: #F0F4F8;
      font-size: 14px;
      font-weight: 500;
      text-align: center;
      cursor: pointer;
      user-select: none;
      transition: border-color 0.25s, background 0.25s;
      letter-spacing: 0.5px;
    }
    .va-config-panel .va-shortcut-box:focus {
      outline: none;
      border-color: #2ed573;
      background: rgba(46,213,115,0.06);
    }
    .va-config-panel .va-shortcut-box:empty::before {
      content: "按下组合键";
      color: #8b949e;
      font-weight: 400;
    }

    .va-config-panel .va-hint {
      font-size: 11px;
      color: #8b949e;
      margin-top: 4px;
      padding-left: 2px;
    }

    .va-config-panel .va-divider {
      height: 1px;
      background: rgba(255,255,255,0.06);
      margin: 16px 0;
    }

    .va-config-panel .va-footer-hint {
      font-size: 11px;
      color: #6b7a8a;
      text-align: center;
      padding-top: 4px;
    }

    /* -------- 响应式适配 -------- */
    @media (max-width: 480px) {
      .va-mic { width: 56px; height: 56px; }
      .va-config-panel { width: 92vw; padding: 20px 16px 20px; }
      .va-status { font-size: 13px; max-width: 220px; }
    }
  `);

  // ---------- UI 创建 ----------
  function createUI() {
    // 注册脚本猫/油猴菜单中的“设置”按钮
    if (typeof GM_registerMenuCommand !== 'undefined') {
      GM_registerMenuCommand('⚙️ 打开设置', toggleConfigPanel);
    }

    // 主容器
    container = document.createElement('div');
    container.id = 'voice-assistant-container';
    container.innerHTML = `
      <button id="va-mic" class="va-mic" title="单击录音 · 双击设置">
        <svg viewBox="0 0 24 24" width="28" height="28" fill="none" stroke="currentColor" stroke-width="2">
          <path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z" />
          <path d="M19 10v2a7 7 0 0 1-14 0v-2" />
          <line x1="12" y1="19" x2="12" y2="23" />
          <line x1="8" y1="23" x2="16" y2="23" />
        </svg>
      </button>
      <div id="va-interim" class="va-interim"></div>
      <div id="va-status" class="va-status"></div>
    `;
    document.body.appendChild(container);

    micButton = document.getElementById('va-mic');
    interimDisplay = document.getElementById('va-interim');
    statusIndicator = document.getElementById('va-status');

    // 创建配置面板（含遮罩）
    createConfigPanel();

    // 按钮交互：拖拽 + 单击/双击
    setupButtonInteraction(micButton);

    document.addEventListener('click', (e) => {
      if (e.target.closest('#voice-assistant-container') ||
          e.target.closest('.va-config-overlay')) return;
      if (currentState === STATE.IDLE) clearInterim();
    });

    createRecognitionInstance();
    bindShortcut();
  }

  // ---------- 按钮交互：拖拽 + 单击/双击 ----------
  function setupButtonInteraction(btn) {
    let startX, startY, isDragging = false;
    let clickCount = 0;
    let clickTimer = null;

    const onDown = (e) => {
      const pos = e.touches ? e.touches[0] : e;
      startX = pos.clientX;
      startY = pos.clientY;
      isDragging = false;
      btn.style.cursor = 'grabbing';
    };

    const onMove = (e) => {
      if (startX === undefined) return;
      const pos = e.touches ? e.touches[0] : e;
      const dx = pos.clientX - startX;
      const dy = pos.clientY - startY;
      if (Math.abs(dx) > 5 || Math.abs(dy) > 5) {
        isDragging = true;
        const c = btn.parentElement;
        let x = pos.clientX - 32;
        let y = pos.clientY - 32;
        x = Math.max(0, Math.min(window.innerWidth - c.offsetWidth, x));
        y = Math.max(0, Math.min(window.innerHeight - c.offsetHeight, y));
        c.style.left = x + 'px';
        c.style.top = y + 'px';
        c.style.right = 'auto';
        c.style.bottom = 'auto';
      }
    };

    const onUp = (e) => {
      if (startX === undefined) return;
      const pos = e.changedTouches ? e.changedTouches[0] : e;
      const dx = pos.clientX - startX;
      const dy = pos.clientY - startY;
      const dist = Math.sqrt(dx*dx + dy*dy);
      startX = startY = undefined;
      btn.style.cursor = 'grab';

      if (isDragging || dist > 5) {
        isDragging = false;
        return;
      }

      clickCount++;
      if (clickCount === 1) {
        clickTimer = setTimeout(() => {
          clickCount = 0;
          toggleListening();
        }, 280);
      } else if (clickCount >= 2) {
        clearTimeout(clickTimer);
        clickCount = 0;
        toggleConfigPanel();
      }
    };

    btn.addEventListener('mousedown', onDown);
    document.addEventListener('mousemove', onMove);
    document.addEventListener('mouseup', onUp);

    btn.addEventListener('touchstart', onDown, { passive: true });
    document.addEventListener('touchmove', onMove, { passive: true });
    document.addEventListener('touchend', onUp, { passive: true });

    btn.addEventListener('dragstart', (e) => e.preventDefault());
  }

  // ---------- 配置面板 ----------
  function createConfigPanel() {
    const overlay = document.createElement('div');
    overlay.className = 'va-config-overlay';
    overlay.id = 'va-config-overlay';
    document.body.appendChild(overlay);

    configPanel = document.createElement('div');
    configPanel.className = 'va-config-panel';
    configPanel.id = 'va-config-panel';
    configPanel.innerHTML = `
      <div class="va-config-header">
        <h4>设置</h4>
        <button class="va-close-btn" id="va-config-close">✕</button>
      </div>

      <div class="va-config-group">
        <span class="va-config-label">识别语言</span>
        <select id="va-lang-select">
          <option value="zh-CN">中文（普通话）</option>
          <option value="en-US">English (英语)</option>
          <option value="ja-JP">日本語 (日语)</option>
          <option value="ko-KR">한국어 (韩语)</option>
          <option value="fr-FR">Français (法语)</option>
          <option value="de-DE">Deutsch (德语)</option>
          <option value="es-ES">Español (西班牙语)</option>
          <option value="pt-BR">Português (葡萄牙语)</option>
          <option value="ru-RU">Русский (俄语)</option>
          <option value="it-IT">Italiano (意大利语)</option>
          <option value="auto">自动 (Auto)</option>
        </select>
      </div>

      <div class="va-config-group">
        <span class="va-config-label">选项</span>
        <label class="va-checkbox-row">
          <input type="checkbox" id="va-auto-send">
          <span>识别后自动发送</span>
        </label>
        <label class="va-checkbox-row">
          <input type="checkbox" id="va-copy-clip">
          <span>同时复制到剪贴板</span>
        </label>
        <label class="va-checkbox-row">
          <input type="checkbox" id="va-show-interim" checked>
          <span>显示实时识别文字</span>
        </label>
      </div>

      <div class="va-divider"></div>

      <div class="va-config-group">
        <span class="va-config-label">启动快捷键</span>
        <div id="va-shortcut-display" class="va-shortcut-box" tabindex="0">Ctrl+Shift+V</div>
        <div class="va-hint">点击输入框，然后按下组合键</div>
      </div>

      <div class="va-divider"></div>

      <div class="va-footer-hint">
        静音超时 3 秒自动停止 · 双击悬浮球打开此面板
      </div>
    `;
    overlay.appendChild(configPanel);

    // 加载配置
    document.getElementById('va-lang-select').value = config.lang || 'zh-CN';
    document.getElementById('va-auto-send').checked = config.autoSend || false;
    document.getElementById('va-copy-clip').checked = config.copyToClipboard || false;
    document.getElementById('va-show-interim').checked = config.showInterim !== undefined ? config.showInterim : true;
    updateShortcutDisplay();

    // 事件绑定
    document.getElementById('va-lang-select').addEventListener('change', (e) => {
      config.lang = e.target.value;
      saveConfig();
      if (recognition) recognition.lang = config.lang === 'auto' ? 'zh-CN' : config.lang;
    });
    document.getElementById('va-auto-send').addEventListener('change', (e) => {
      config.autoSend = e.target.checked;
      saveConfig();
    });
    document.getElementById('va-copy-clip').addEventListener('change', (e) => {
      config.copyToClipboard = e.target.checked;
      saveConfig();
    });
    document.getElementById('va-show-interim').addEventListener('change', (e) => {
      config.showInterim = e.target.checked;
      saveConfig();
    });

    const shortcutDisplay = document.getElementById('va-shortcut-display');
    shortcutDisplay.addEventListener('focus', () => {
      shortcutDisplay.textContent = '⌨️ 按下组合键';
      shortcutDisplay.style.borderColor = '#2ed573';
    });
    shortcutDisplay.addEventListener('blur', () => {
      shortcutDisplay.style.borderColor = '';
      updateShortcutDisplay();
    });
    shortcutDisplay.addEventListener('keydown', (e) => {
      e.preventDefault();
      e.stopPropagation();
      const ctrl = e.ctrlKey || e.metaKey;
      const shift = e.shiftKey;
      const alt = e.altKey;
      const key = e.key;
      if (key === 'Control' || key === 'Shift' || key === 'Alt' || key === 'Meta') return;
      if (!ctrl && !shift && !alt) {
        shortcutDisplay.textContent = '❌ 需要组合键';
        setTimeout(() => {
          if (document.activeElement === shortcutDisplay) {
            shortcutDisplay.textContent = '⌨️ 按下组合键';
          }
        }, 800);
        return;
      }
      config.shortcutKey = key.toLowerCase();
      config.shortcutCtrl = ctrl;
      config.shortcutShift = shift;
      config.shortcutAlt = alt;
      saveConfig();
      bindShortcut();
      updateShortcutDisplay();
      setTimeout(() => shortcutDisplay.blur(), 300);
    });

    document.getElementById('va-config-close').addEventListener('click', closeConfigPanel);
    overlay.addEventListener('click', (e) => {
      if (e.target === overlay) closeConfigPanel();
    });
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && isConfigOpen) closeConfigPanel();
    });
  }

  function closeConfigPanel() {
    const overlay = document.getElementById('va-config-overlay');
    if (overlay) overlay.classList.remove('open');
    isConfigOpen = false;
  }

  function toggleConfigPanel() {
    const overlay = document.getElementById('va-config-overlay');
    isConfigOpen = !isConfigOpen;
    overlay.classList.toggle('open', isConfigOpen);
    if (isConfigOpen) {
      document.getElementById('va-lang-select').value = config.lang || 'zh-CN';
      document.getElementById('va-auto-send').checked = config.autoSend || false;
      document.getElementById('va-copy-clip').checked = config.copyToClipboard || false;
      document.getElementById('va-show-interim').checked = config.showInterim !== undefined ? config.showInterim : true;
      updateShortcutDisplay();
    }
  }

  function updateShortcutDisplay() {
    const display = document.getElementById('va-shortcut-display');
    if (!display) return;
    const parts = [];
    if (config.shortcutCtrl) parts.push('Ctrl');
    if (config.shortcutShift) parts.push('Shift');
    if (config.shortcutAlt) parts.push('Alt');
    parts.push((config.shortcutKey || 'V').toUpperCase());
    display.textContent = parts.join('+');
  }

  // ---------- 快捷键绑定 ----------
  function bindShortcut() {
    if (shortcutHandler) {
      document.removeEventListener('keydown', shortcutHandler);
      shortcutHandler = null;
    }
    const { shortcutKey, shortcutCtrl, shortcutShift, shortcutAlt } = config;
    if (!shortcutKey) return;
    shortcutHandler = (e) => {
      if (e.ctrlKey !== shortcutCtrl) return;
      if (e.shiftKey !== shortcutShift) return;
      if (e.altKey !== shortcutAlt) return;
      if (e.key.toLowerCase() !== shortcutKey.toLowerCase()) return;
      e.preventDefault();
      toggleListening();
    };
    document.addEventListener('keydown', shortcutHandler);
  }

  // ---------- 状态控制 ----------
  function setState(newState, msg) {
    currentState = newState;
    statusIndicator.removeAttribute('data-icon');
    switch (newState) {
      case STATE.IDLE:
        micButton.classList.remove('listening', 'error');
        statusIndicator.textContent = msg || '';
        clearInterim();
        break;
      case STATE.LISTENING:
        micButton.classList.add('listening');
        statusIndicator.setAttribute('data-icon', '🎙️');
        statusIndicator.textContent = msg || '聆听中…';
        break;
      case STATE.PROCESSING:
        micButton.classList.remove('listening');
        statusIndicator.setAttribute('data-icon', '⏳');
        statusIndicator.textContent = msg || '识别中…';
        break;
      case STATE.ERROR:
        micButton.classList.add('error');
        statusIndicator.setAttribute('data-icon', '⚠️');
        statusIndicator.textContent = msg || '错误';
        break;
    }
  }

  function clearInterim() {
    if (interimDisplay) {
      interimDisplay.textContent = '';
      interimDisplay.classList.remove('visible');
    }
  }

  function showInterim(text) {
    if (!config.showInterim) return;
    if (interimDisplay) {
      interimDisplay.textContent = text;
      interimDisplay.classList.add('visible');
    }
  }

  // ---------- 智能寻找输入框 ----------
  function findBestInput() {
    const prioritySelectors = [
      'div[contenteditable="true"][class*="chat"]',
      'div[contenteditable="true"][class*="input"]',
      'textarea[class*="chat-input"]',
      'div[role="textbox"]',
      'textarea[class*="input-area"]',
      'div[contenteditable="true"][class*="editor"]',
      '#kw',
      '#chat-textarea',
      'textarea.input-area',
      'input:not([type="hidden"])',
      'textarea',
      '[contenteditable="true"]'
    ];
    for (let selector of prioritySelectors) {
      try {
        const el = document.querySelector(selector);
        if (el && el.offsetParent !== null && el.offsetWidth > 0 && el.offsetHeight > 0) {
          return el;
        }
      } catch (e) {}
    }
    return null;
  }

  // ---------- 静音超时 ----------
  function resetSilenceTimer() {
    if (silenceTimer) { clearTimeout(silenceTimer); silenceTimer = null; }
    if (currentState === STATE.LISTENING) {
      silenceTimer = setTimeout(() => {
        if (recognition && currentState === STATE.LISTENING) {
          recognition.stop();
        }
        silenceTimer = null;
      }, SILENCE_TIMEOUT);
    }
  }

  function clearSilenceTimer() {
    if (silenceTimer) { clearTimeout(silenceTimer); silenceTimer = null; }
  }

  // ---------- 创建识别实例 ----------
  function createRecognitionInstance() {
    if (recognition) { try { recognition.abort(); } catch(e) {} }
    recognition = new SpeechRecognition();
    recognition.continuous = true;
    recognition.interimResults = true;
    recognition.lang = config.lang === 'auto' ? 'zh-CN' : config.lang;
    recognition.maxAlternatives = 1;

    recognition.onstart = () => {
      setState(STATE.LISTENING);
      isFinalReceived = false;
      clearSilenceTimer();
      resetSilenceTimer();
    };

    recognition.onresult = (event) => {
      if (currentState === STATE.LISTENING) resetSilenceTimer();
      let interim = '', final = '';
      for (let i = event.resultIndex; i < event.results.length; i++) {
        const transcript = event.results[i][0].transcript;
        if (event.results[i].isFinal) final += transcript;
        else interim += transcript;
      }
      if (final) {
        isFinalReceived = true;
        setState(STATE.PROCESSING);
        insertText(final);
        if (config.copyToClipboard) navigator.clipboard.writeText(final).catch(() => {});
        if (config.autoSend) {
          const active = document.activeElement;
          if (active && (active.tagName === 'INPUT' || active.tagName === 'TEXTAREA' || active.isContentEditable)) {
            const enterEvent = new KeyboardEvent('keydown', { key: 'Enter', bubbles: true });
            active.dispatchEvent(enterEvent);
          }
        }
        setState(STATE.LISTENING);
        resetSilenceTimer();
      } else if (interim) {
        showInterim(interim);
        resetSilenceTimer();
      }
    };

    recognition.onerror = (event) => {
      clearSilenceTimer();
      if (event.error === 'not-allowed') setState(STATE.ERROR, '麦克风权限被拒绝');
      else if (event.error === 'no-speech') setState(STATE.IDLE, '未检测到语音，请重试');
      else if (event.error === 'audio-capture') setState(STATE.ERROR, '无法访问麦克风设备');
      else setState(STATE.ERROR, `错误: ${event.error}`);
    };

    recognition.onend = () => {
      clearSilenceTimer();
      if (currentState !== STATE.ERROR) {
        setState(STATE.IDLE, '已停止');
        clearInterim();
      }
    };
  }

  // ---------- 文本插入 ----------
  function insertText(text) {
    const active = document.activeElement;
    if (!active) return;
    if (active.tagName === 'INPUT' || active.tagName === 'TEXTAREA') {
      const start = active.selectionStart;
      const end = active.selectionEnd;
      const value = active.value;
      const newValue = value.substring(0, start) + text + value.substring(end);
      active.value = newValue;
      active.dispatchEvent(new Event('input', { bubbles: true }));
      active.setSelectionRange(start + text.length, start + text.length);
    } else if (active.isContentEditable) {
      document.execCommand('insertText', false, text);
    } else if (active.value !== undefined) {
      active.value += text;
      active.dispatchEvent(new Event('input', { bubbles: true }));
    }
  }

  // ---------- 切换录音 ----------
  function toggleListening() {
    if (currentState === STATE.LISTENING || currentState === STATE.PROCESSING) {
      if (recognition) { try { recognition.stop(); } catch(e) {} }
      clearSilenceTimer();
      setState(STATE.IDLE, '已停止');
      clearInterim();
      return;
    }

    let active = document.activeElement;
    if (!active || active.id === 'va-mic' || active.tagName === 'BODY') {
      const bestInput = findBestInput();
      if (bestInput) {
        active = bestInput;
        active.focus();
      } else {
        setState(STATE.ERROR, '未找到输入框，请手动点击');
        setTimeout(() => { if (currentState === STATE.ERROR) setState(STATE.IDLE); }, 2000);
        return;
      }
    }

    const isValid = active && (
      active.tagName === 'INPUT' ||
      active.tagName === 'TEXTAREA' ||
      active.isContentEditable
    );

    if (!isValid) {
      setState(STATE.ERROR, '请点击一个输入框');
      setTimeout(() => { if (currentState === STATE.ERROR) setState(STATE.IDLE); }, 2000);
      return;
    }

    if (!recognition) createRecognitionInstance();
    else { try { recognition.abort(); } catch(e) {} createRecognitionInstance(); }

    recognition.lang = config.lang === 'auto' ? 'zh-CN' : config.lang;
    recognition.continuous = true;

    try {
      recognition.start();
    } catch (e) {
      try {
        recognition.stop();
        setTimeout(() => {
          try { recognition.start(); } catch(e2) { setState(STATE.ERROR, '启动失败，请重试'); }
        }, 100);
      } catch(e2) {
        setState(STATE.ERROR, '启动失败，请重试');
      }
    }
  }

  // ---------- 降级 UI ----------
  function createFallbackUI() {
    const div = document.createElement('div');
    div.id = 'voice-assistant-container';
    div.innerHTML = `<button id="va-mic" class="va-mic" style="background:#999;" title="不支持语音识别"><span style="font-size:20px;">🚫</span></button>`;
    document.body.appendChild(div);
  }

  // ---------- 启动 ----------
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', createUI);
  } else {
    createUI();
  }

})();