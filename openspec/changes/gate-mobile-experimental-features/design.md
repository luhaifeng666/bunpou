# Design: mobile runtime gating

## Context

在路线 B 下，Bunpou 将继续维护：

- Web 站点（VitePress）
- Desktop App（Tauri）
- Mobile App（独立移动壳）

当前需求是：在 Mobile App 首发阶段临时隐藏以下入口：

- 例句音频播放入口
- DeepSeek 入口
- 访问统计入口

同时保证 Web 与 Desktop 现有行为不变。

## Goals

- 为三端建立清晰且可复用的平台判定语义。
- 将“入口隐藏”限制在 UI 可见性层，不直接等同于“功能删除”。
- 在发布前可通过跨端检查证明未误伤 Web 与 Desktop。

## Non-Goals

- 不在本次变更中重构内容组织结构（Markdown/导航数据）。
- 不在本次变更中引入新的移动端业务功能。
- 不在本次变更中移除桌面与网站既有能力。

## Runtime classification model

### 1) Runtime types

系统运行时分为三类：

- `web-site`: 浏览器访问站点（含移动浏览器）
- `desktop-app`: Tauri 桌面壳
- `mobile-app`: iOS/Android 原生壳内运行

### 2) Why this model

当前代码中已有 `isDesktopApp` 判断（例如通过 `__TAURI_IPC__`），但“非桌面端”并不等于“移动端”，因为 Web 站点同样属于非桌面端。若继续沿用“非桌面端即移动端”会导致网站误伤。

### 3) Runtime truth table

为避免判定歧义，运行时识别建议采用“壳信号优先，UA 仅辅助”的真值表：

| Case                     | `__TAURI_IPC__ in window` | Mobile App Shell Signal | Browser UA is mobile | Expected runtime |
| ------------------------ | ------------------------- | ----------------------- | -------------------- | ---------------- |
| Desktop Tauri            | true                      | false                   | 任意                 | `desktop-app`    |
| iOS/Android App WebView  | false                     | true                    | true/false           | `mobile-app`     |
| Mobile Browser 访问站点  | false                     | false                   | true                 | `web-site`       |
| Desktop Browser 访问站点 | false                     | false                   | false                | `web-site`       |

判定原则：

1. **壳信号优先于 UA**：只要存在明确壳信号，直接归类为对应 App 运行时。
2. **UA 不用于区分 web-site 与 mobile-app**：移动浏览器访问网站依旧是 `web-site`。
3. **无壳信号默认 web-site**：作为保守兜底，避免误把网站判定为移动 App。

## Entry gating strategy

入口治理按“运行时 + 功能键”判定。

```text
isEntryVisible(feature, runtime)
  = policy[feature][runtime]
```

建议初始策略矩阵：

| Feature        | web-site | desktop-app                | mobile-app |
| -------------- | -------- | -------------------------- | ---------- |
| audio-entry    | visible  | visible                    | hidden     |
| deepseek-entry | visible  | visible                    | hidden     |
| visitors-entry | visible  | hidden/visible（保持现状） | hidden     |

说明：

- `visitors-entry` 在桌面端当前已有条件关闭；本设计保持既有行为，不强行改为可见。
- “hidden”仅表示入口不可见，不等于删除底层模块。

## Integration points

基于当前代码结构，入口治理将主要落在以下组件挂载点（后续实现时确认）：

- `GrammerContent.vue`（音频入口触发）
- `GiscusComment.vue` / `DeepSeek.vue`（DeepSeek 入口链路）
- `Visitors.vue`（访问统计入口）
- `.vitepress/theme/index.ts`（全局挂载层）

## Behavior safety boundaries

为避免误伤，设计约束如下：

1. 平台判定必须返回三态之一（`web-site`/`desktop-app`/`mobile-app`），不得仅返回布尔值“是否桌面端”。
2. 入口可见性策略必须集中管理，避免在组件内散落条件分支造成语义漂移。
3. 入口隐藏不应影响页面主体阅读路径（课程导航、语法内容渲染）。
4. 入口隐藏不应导致控制台高频报错（如组件仍在尝试初始化被关闭的第三方资源）。

## Test and verification design

跨端回归最小集合：

- Web 站点：
  - 音频入口可见
  - DeepSeek 入口可见
  - 访问统计入口保持现状
- Desktop App：
  - 音频入口可见
  - DeepSeek 入口可见
  - 访问统计入口保持现状（通常隐藏）
- Mobile App：
  - 音频入口隐藏
  - DeepSeek 入口隐藏
  - 访问统计入口隐藏
  - 页面主体内容可正常浏览

判定回归补充（与真值表一致）：

- 桌面 Tauri 环境命中 `desktop-app`，不可误判为 `mobile-app`。
- 手机浏览器打开线上站点命中 `web-site`，不可误判为 `mobile-app`。
- iOS/Android 原生壳内页面命中 `mobile-app`。
- 在任一 UA 伪装场景下，壳信号优先级不应被 UA 覆盖。

## Risks and mitigations

- 风险：误把“非桌面端”当成“移动端”，导致 Web 入口被关闭。

  - 缓解：引入三态运行时分类并在回归中强制验证 Web 可见性。

- 风险：入口关闭后，组件仍初始化第三方脚本或网络请求。

  - 缓解：将入口可见性与初始化行为绑定，入口关闭时禁止执行初始化。

- 风险：策略散落在多个组件，后续维护出现偏差。
  - 缓解：集中配置策略矩阵，并让组件仅消费判定结果。

## Rollout suggestion

- 第一步：在预发布环境开启移动端入口隐藏策略。
- 第二步：执行三端可见性冒烟回归。
- 第三步：通过后随移动端首发上线。
- 第四步：后续按产品节奏逐项恢复入口（例如先恢复音频，再恢复 DeepSeek）。
