# 🎙️ 语助 · 轻音输入 (Voice Assistant - Speech to Text)

<p align="center">
  <img src="https://img.shields.io/badge/Platform-UserScript-2ed573?style=for-the-badge&logo=tampermonkey&logoColor=white" alt="Platform">
  <img src="https://img.shields.io/badge/Version-2.2.0-2ed573?style=for-the-badge" alt="Version">
  <img src="https://img.shields.io/badge/License-MIT-2ed573?style=for-the-badge" alt="License">
  <img src="https://img.shields.io/badge/Browser-Chrome%20%7C%20Edge%20%7C%20Firefox-2ed573?style=for-the-badge" alt="Browsers">
</p>

<p align="center">
  <strong>在任何输入框中通过语音高效填字 · 连续识别 · 自动聚焦 · 3秒静音自动停止</strong>
</p>

---

## 📖 简介

**语助 · 轻音输入** 是一款轻量级的用户脚本，基于浏览器原生 Web Speech API 实现语音识别。无论你在搜索框、聊天窗口、评论区还是 AI 对话界面，只需单击悬浮麦克风或按下快捷键，即可通过语音快速输入文字。

**设计哲学**：让语音输入成为浏览体验中自然延伸的一部分——不喧宾夺主，却无处不在。

---

## ✨ 功能特性

| 特性 | 说明 |
|------|------|
| 🎙️ **连续语音识别** | 采用 `continuous: true` 模式，说话停顿不超过 3 秒即可持续识别，无需反复点击 |
| ⏱️ **智能静音停止** | 连续 3 秒无声音输入自动停止，释放双手 |
| 🎯 **自动聚焦输入框** | 单击悬浮球自动寻找页面中的输入框（支持百度、DeepSeek、Kimi、通义千问等），无需手动点击 |
| 🖱️ **手势交互** | 单击 = 录音/停止 · 双击 = 打开设置 · 拖拽 = 移动位置，互不干扰 |
| ⌨️ **自定义快捷键** | 默认 `Ctrl+Shift+V`，可在配置面板自由修改 |
| 🌐 **多语言支持** | 中文、English、日本語、한국어、繁体中文（台湾/香港） |
| 📋 **辅助功能** | 识别后自动发送（模拟回车）· 同时复制到剪贴板 · 实时显示识别中间结果 |
| 🎨 **视觉设计** | 毛玻璃悬浮球 + 翡翠绿呼吸脉冲光晕 + 深色模态配置面板 |

---

## 🚀 安装

### 前置条件

你需要先安装用户脚本管理器：

- [Tampermonkey](https://www.tampermonkey.net/)（Chrome / Edge / Firefox）
- [ScriptCat 脚本猫](https://scriptcat.org/)（国内用户推荐）

### 安装脚本

**方式一：从 GreasyFork 安装（推荐）**

> 访问：[https://greasyfork.org/zh-CN/users/1640789-shiyi312](https://greasyfork.org/zh-CN/users/1640789-shiyi312)

点击脚本页面上的「安装此脚本」按钮即可。

**方式二：从 ScriptCat 安装**

> 访问：[https://scriptcat.org/zh-CN/users/202800](https://scriptcat.org/zh-CN/users/202800)

在用户主页找到「语助 · 轻音输入」，点击安装。

**方式三：手动安装**

1. 打开脚本管理器，点击「添加新脚本」
2. 删除默认内容，粘贴完整脚本代码
3. 按 `Ctrl+S` 保存

---

## 📋 使用指南

### 基本操作

| 操作 | 结果 |
|------|------|
| **单击** 悬浮球 | 启动 / 停止录音 |
| **双击** 悬浮球 | 打开 / 关闭配置面板 |
| **拖拽** 悬浮球 | 移动位置（不会触发任何点击） |
| **快捷键** | 默认 `Ctrl+Shift+V`，可在设置中自定义 |
| **ESC / 点击遮罩** | 关闭配置面板 |

### 配置选项

双击悬浮球打开配置面板，可调整以下选项：

| 选项 | 说明 |
|------|------|
| 识别语言 | 中文（普通话）/ English / 自动（优先中文） |
| 识别后自动发送 | 识别完成后自动模拟回车提交 |
| 同时复制到剪贴板 | 识别结果自动复制到系统剪贴板 |
| 显示实时识别文字 | 在悬浮球上方显示识别中间结果 |
| 启动快捷键 | 自定义触发录音的组合键 |

### 静音超时

默认 **3 秒** 无声音输入自动停止录音。每次语音输入（包括临时结果）都会重置计时器，确保长句识别不被中断。

---

## 🌐 多语言名称

脚本在 GreasyFork / ScriptCat 上会根据用户浏览器语言自动显示对应的名称：

| 语言 | 名称 |
|------|------|
| 简体中文（默认） | 语助 · 轻音输入 (语音助手) |
| English | Voice Assistant - Speech to Text |
| 日本語 | 音声入力アシスタント (音声認識) |
| 한국어 | 음성 입력 도우미 (음성 인식) |
| 繁體中文（台灣） | 語助 · 輕音輸入 (語音助手) |
| 繁體中文（香港） | 語助 · 輕音輸入 (語音助手) |

---

## 🧩 适配网站

脚本通过智能选择器优先级策略，自动适配以下类型的输入框：

- **AI 对话平台**：DeepSeek、Kimi、通义千问、豆包、文心一言
- **搜索引擎**：百度、必应、搜狗
- **社交媒体**：微博、知乎、贴吧
- **电商平台**：淘宝、京东
- **通用**：任意 `input`、`textarea`、`contenteditable` 元素

---

## 🛠️ 技术架构

### 核心技术

| 组件 | 技术选型 |
|------|----------|
| 语音识别 | Web Speech API（`window.SpeechRecognition`） |
| 存储方案 | `GM_setValue` / `localStorage` 双备用 |
| 样式注入 | `GM_addStyle` |
| 运行环境 | Tampermonkey / ScriptCat |

### 设计原则

- **零依赖**：纯原生 JavaScript，不引入任何第三方库
- **渐进增强**：在不支持语音识别的浏览器中优雅降级
- **事件解耦**：拖拽、单击、双击通过位移与时间双重判定，互不干扰
- **配置持久化**：所有用户设置自动保存，刷新页面后恢复

---

## 📁 仓库结构

```
Voice-Assistant---Speech-to-Text/
├── README.md          # 项目说明
├── LICENSE            # MIT 许可证
└── voice-assistant.user.js   # 完整脚本（待添加）
```

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

本项目采用 [MIT License](LICENSE) 开源许可证。

---

## 🔗 相关链接

| 平台 | 链接 |
|------|------|
| GitHub 仓库 | [shiyi312/Voice-Assistant---Speech-to-Text](https://github.com/shiyi312/Voice-Assistant---Speech-to-Text) |
| GreasyFork 作者主页 | [shiyi312](https://greasyfork.org/zh-CN/users/1640789-shiyi312) |
| ScriptCat 作者主页 | [辻弌20](https://scriptcat.org/zh-CN/users/202800) |

---

<p align="center">
  <sub>Built with ❤️ · 让每一次输入都更轻松</sub>
</p>
