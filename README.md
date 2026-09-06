# 🎙️ 语助 · 轻音输入

<p align="center">
  <img src="https://img.shields.io/badge/Platform-UserScript-2ed573?style=for-the-badge&logo=tampermonkey&logoColor=white" alt="Platform">
  <img src="https://img.shields.io/badge/Version-2.3.0-2ed573?style=for-the-badge" alt="Version">
  <img src="https://img.shields.io/badge/License-MIT-2ed573?style=for-the-badge" alt="License">
  <img src="https://img.shields.io/badge/Browser-Chrome%20%7C%20Edge%20%7C%20Firefox-2ed573?style=for-the-badge" alt="Browsers">
  <img src="https://img.shields.io/badge/Status-Stable-2ed573?style=for-the-badge" alt="Status">
</p>

<p align="center">
  <strong>在任何输入框中通过语音高效填字 · 连续识别 · 自动聚焦 · 5秒静音自动停止</strong>
</p>

<p align="center">
  <a href="#-安装">📦 安装</a> ·
  <a href="#-使用指南">📖 使用</a> ·
  <a href="#-功能特性">✨ 特性</a> ·
  <a href="#-自定义配置">⚙️ 自定义</a> ·
  <a href="#-技术架构">🛠️ 架构</a>
</p>

---

## 📖 简介

**语助 · 轻音输入** 是一款轻量级用户脚本，基于浏览器原生 Web Speech API 实现语音识别。无论你在搜索框、聊天窗口、评论区还是 AI 对话界面，只需单击悬浮麦克风或按下快捷键，即可通过语音快速输入文字。

> **设计哲学**：让语音输入成为浏览体验中自然延伸的一部分——不喧宾夺主，却无处不在。

---

## ✨ 功能特性

| 特性 | 说明 |
|:---|:---|
| 🎙️ **连续语音识别** | `continuous: true` 模式，说话停顿不超过 5 秒即可持续识别 |
| ⏱️ **智能静音停止** | 连续 5 秒无声音自动停止，释放双手，适合长句输入 |
| 🎯 **自动聚焦输入框** | 单击悬浮球自动寻找页面输入框，支持百度、DeepSeek、Kimi、通义千问等 |
| 🖱️ **手势交互** | 单击 = 录音/停止 · 双击 = 设置 · 拖拽 = 移动，互不干扰 |
| ⌨️ **自定义快捷键** | 默认 `Ctrl+Shift+V`，可在配置面板自由修改 |
| 🌐 **多语言语音识别** | 中文、英语、日语、韩语、法语、德语、西班牙语、葡萄牙语、俄语、意大利语 |
| 🌏 **多语言界面** | 简体中文、English、日本語、한국어、繁體中文（台灣/香港） |
| 📋 **辅助功能** | 自动发送（模拟回车）· 复制到剪贴板 · 实时显示识别中间结果 |
| 🎨 **视觉设计** | 毛玻璃悬浮球 + 翡翠绿呼吸脉冲光晕 + 深色模态配置面板 |
| 📱 **触摸支持** | 完美适配触摸屏设备，移动端同样流畅 |

---

## 🚀 安装

### 前置条件

你需要先安装用户脚本管理器：

| 管理器 | 平台 | 说明 |
|:---|:---|:---|
| [Tampermonkey](https://www.tampermonkey.net/) | Chrome / Edge / Firefox | 全球最流行的脚本管理器 |
| [ScriptCat 脚本猫](https://scriptcat.org/) | Chrome / Edge | 国内用户推荐，功能丰富 |

### 安装脚本

**方式一：从 GreasyFork 安装（推荐）**

> 👉 [**立即安装**](https://greasyfork.org/zh-CN/scripts/516209)

1. 访问 [GreasyFork 脚本页面](https://greasyfork.org/zh-CN/scripts/516209)
2. 点击绿色的 **「安装此脚本」** 按钮
3. 在脚本管理器中确认安装

**方式二：从 ScriptCat 安装**

> 👉 [**立即安装**](https://scriptcat.org/zh-CN/script-show-page/3314)

1. 访问 [ScriptCat 脚本页面](https://scriptcat.org/zh-CN/script-show-page/3314)
2. 点击 **「安装」** 按钮
3. 在脚本管理器中确认安装

**方式三：手动安装**

```bash
# 克隆仓库
git clone https://github.com/shiyi312/Voice-Assistant---Speech-to-Text.git

# 或直接复制 voice-assistant.user.js 的内容
# 在脚本管理器中新建脚本，粘贴保存
```

---

## 📋 使用指南

### 基本操作

| 操作 | 结果 |
|:---|:---|
| **单击** 悬浮球 | 启动 / 停止录音 |
| **双击** 悬浮球 | 打开 / 关闭配置面板 |
| **拖拽** 悬浮球 | 移动位置（不会触发任何点击） |
| **快捷键** | 默认 `Ctrl+Shift+V`，可在设置中自定义 |
| **菜单项** | 在脚本猫/油猴菜单中点击「⚙️ 打开设置」 |
| **ESC / 点击遮罩** | 关闭配置面板 |

### 配置选项

双击悬浮球或通过菜单打开配置面板，可调整以下选项：

| 选项 | 可选值 | 说明 |
|:---|:---|:---|
| 识别语言 | 中文 / English / 日本語 / 한국어 / 等 | 切换语音识别引擎的语言模型 |
| 识别后自动发送 | 开启 / 关闭 | 识别完成后自动模拟回车提交 |
| 同时复制到剪贴板 | 开启 / 关闭 | 识别结果自动复制到系统剪贴板 |
| 显示实时识别文字 | 开启 / 关闭 | 在悬浮球上方显示识别中间结果 |
| 启动快捷键 | 自定义组合键 | 点击输入框后按下组合键即可录制 |

---

## ⚙️ 自定义配置

### 修改静音自动停止时长

默认 **5 秒** 无声音输入自动停止录音。如果你希望调整这个时长（例如改为 3 秒或 10 秒），按以下步骤操作：

**步骤 1：打开脚本编辑器**

- 在浏览器工具栏点击脚本管理器图标（Tampermonkey 或 ScriptCat）
- 找到「语助 · 轻音输入 (语音助手)」
- 点击 **「编辑」** 进入脚本编辑界面

**步骤 2：找到静音超时配置**

在脚本代码顶部附近（大约第 94 行），找到这一行：

```javascript
const SILENCE_TIMEOUT = 5000;     // 5秒
```

**步骤 3：修改数值**

将 `5000` 改为你想要的时长（单位：毫秒）：

| 想要时长 | 修改为 |
|:---|:---|
| 3 秒 | `const SILENCE_TIMEOUT = 3000;` |
| 5 秒（默认） | `const SILENCE_TIMEOUT = 5000;` |
| 8 秒 | `const SILENCE_TIMEOUT = 8000;` |
| 10 秒 | `const SILENCE_TIMEOUT = 10000;` |
| 永不自动停止 | `const SILENCE_TIMEOUT = Infinity;` |

**步骤 4：保存生效**

按 `Ctrl+S` 保存脚本，刷新目标网页即可生效。无需重启浏览器。

> **提示**：时长设置过短（如 1-2 秒）可能导致说话停顿稍长就被切断；设置过长（如 30 秒以上）则可能在忘记停止时持续录音。建议在 3-8 秒之间选择最适合自己的值。

### 添加更多语音识别语言

找到配置面板中语言选择部分（大约第 350 行），在 `<select id="va-lang-select">` 中添加：

```html
<option value="ar-SA">العربية (阿拉伯语)</option>
<option value="hi-IN">हिन्दी (印地语)</option>
```

支持的语言标签参见 [BCP 47 标准](https://www.rfc-editor.org/rfc/bcp/bcp47.txt)。

---

## 🧩 适配网站

脚本通过智能选择器优先级策略，自动适配以下类型的输入框：

| 类别 | 平台 |
|:---|:---|
| 🤖 **AI 对话** | DeepSeek、Kimi、通义千问、豆包、文心一言 |
| 🔍 **搜索引擎** | 百度、必应、搜狗 |
| 📱 **社交媒体** | 微博、知乎、贴吧 |
| 🛒 **电商平台** | 淘宝、京东 |
| 📝 **通用** | 任意 `input`、`textarea`、`contenteditable` 元素 |

---

## 🛠️ 技术架构

### 核心技术栈

| 组件 | 技术选型 | 说明 |
|:---|:---|:---|
| 语音识别 | Web Speech API | `window.SpeechRecognition` / `webkitSpeechRecognition` |
| 存储方案 | GM_setValue / localStorage | 双备用策略，兼容性最佳 |
| 样式注入 | GM_addStyle | 动态注入 CSS，不污染页面 |
| 菜单注册 | GM_registerMenuCommand | 在脚本管理器中添加设置入口 |
| 运行环境 | Tampermonkey / ScriptCat | 双平台兼容 |

### 设计原则

- **零依赖**：纯原生 JavaScript，不引入任何第三方库
- **渐进增强**：在不支持语音识别的浏览器中优雅降级
- **事件解耦**：拖拽、单击、双击通过位移与时间双重判定，互不干扰
- **配置持久化**：所有用户设置自动保存，刷新页面后恢复

### 架构流程图

```
用户操作（单击/快捷键/菜单）
        ↓
   自动聚焦输入框
        ↓
   启动 SpeechRecognition
        ↓
   ┌─── onresult ───┐
   │                 │
   临时结果 → 实时显示    最终结果 → 填入输入框
   │                 │
   └─── 重置静音计时 ───┘
        ↓
   5秒无声音 → 自动停止
```

---

## 🌏 多语言支持

### 语音识别语言

| 语言 | 代码 | 说明 |
|:---|:---|:---|
| 中文（普通话） | `zh-CN` | 默认选项 |
| English | `en-US` | 美式英语 |
| 日本語 | `ja-JP` | 日语 |
| 한국어 | `ko-KR` | 韩语 |
| Français | `fr-FR` | 法语 |
| Deutsch | `de-DE` | 德语 |
| Español | `es-ES` | 西班牙语 |
| Português | `pt-BR` | 葡萄牙语 |
| Русский | `ru-RU` | 俄语 |
| Italiano | `it-IT` | 意大利语 |
| 自动 | `auto` | 浏览器自动检测 |

### 界面显示语言

脚本在 GreasyFork / ScriptCat 上会根据用户浏览器语言自动切换名称：

| 语言 | 显示名称 |
|:---|:---|
| 简体中文 | 语助 · 轻音输入 (语音助手) |
| English | Voice Assistant - Speech to Text |
| 日本語 | 音声入力アシスタント (音声認識) |
| 한국어 | 음성 입력 도우미 (음성 인식) |
| 繁體中文（台灣） | 語助 · 輕音輸入 (語音助手) |
| 繁體中文（香港） | 語助 · 輕音輸入 (語音助手) |

---

## 📝 更新日志

### v2.3.0 (2026-09-06)

- ✨ 新增脚本猫/油猴菜单「⚙️ 打开设置」入口
- 🎨 优化下拉菜单样式，完整显示语言选项
- 🌐 为所有非中文语言添加中文注释（如 `한국어 (韩语)`）
- ⏱️ 静音超时调整为 5 秒，更适合长句输入
- 🐛 修复下拉菜单文字被截断的问题

### v2.2.0 (2026-09-06)

- 🎨 重新设计配置面板（居中模态 + 毛玻璃效果）
- 🖱️ 重构交互逻辑（拖拽/单击/双击完美区分）
- ⏱️ 新增静音自动停止功能
- 🔧 新增 `GM_registerMenuCommand` 菜单支持

### v2.1.0 (2026-09-06)

- ⏱️ 引入静音超时机制
- 🐛 修复拖拽误触问题

### v2.0.0 (2026-09-06)

- 🔄 从浏览器插件迁移至用户脚本
- 🌐 支持 Tampermonkey / ScriptCat 双平台
- 🎯 新增自动聚焦输入框功能

---

## 🤝 贡献

欢迎提交 Issue 和 Pull Request！

1. Fork 本仓库
2. 创建你的特性分支 (`git checkout -b feature/AmazingFeature`)
3. 提交你的改动 (`git commit -m 'Add some AmazingFeature'`)
4. 推送到分支 (`git push origin feature/AmazingFeature`)
5. 打开 Pull Request

---

## 📄 许可证

本项目采用 [MIT License](LICENSE) 开源许可证。你可以自由使用、修改、分发本脚本，但需保留原作者声明。

---

## 🔗 相关链接

| 平台 | 链接 |
|:---|:---|
| GitHub 仓库 | [shiyi312/Voice-Assistant---Speech-to-Text](https://github.com/shiyi312/Voice-Assistant---Speech-to-Text) |
| GreasyFork 脚本页 | [语助 · 轻音输入](https://greasyfork.org/zh-CN/scripts/516209) |
| GreasyFork 作者主页 | [shiyi312](https://greasyfork.org/zh-CN/users/1640789-shiyi312) |
| ScriptCat 脚本页 | [语助 · 轻音输入](https://scriptcat.org/zh-CN/script-show-page/3314) |
| ScriptCat 作者主页 | [辻弌20](https://scriptcat.org/zh-CN/users/202800) |

---

<p align="center">
  <sub>Built with ❤️ · 让每一次输入都更轻松</sub>
</p>
