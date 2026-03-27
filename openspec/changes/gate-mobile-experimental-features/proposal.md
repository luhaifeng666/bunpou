# Mobile runtime gating for feature entrypoints

## Why

在路线 B（桌面继续 Tauri、移动端独立壳）下，我们计划在移动端初期阶段临时隐藏以下入口：

- 例句音频播放入口
- DeepSeek 入口
- 访问统计入口

这样做可以降低移动端首发复杂度与审核风险（网络依赖、第三方脚本、音频策略差异），但前提是**不能误伤现有网站与桌面端行为**。

当前代码中部分条件判断使用了“是否桌面端（`isDesktopApp`）”语义，若直接以“非桌面端”判定隐藏，则会连带影响 Web 站点。因此需要定义明确的平台判定与入口治理规则。

## What Changes

- 新增 `mobile-runtime-gating` 能力，约束平台判定与入口可见性治理。
- 明确“移动端隐藏入口”仅作用于移动 App 运行时，不影响：
  - Web 站点（浏览器访问）
  - 桌面 App（Tauri）
- 为音频、DeepSeek、访问统计三类入口定义一致的可见性要求与回归保护场景。
- 要求入口隐藏属于 UI 层策略，不应破坏既有组件的桌面/网站可用路径。

## Capabilities

### New Capabilities

- `mobile-runtime-gating`: 提供跨平台运行时判定与按平台入口开关治理机制，保障移动端功能裁剪不会影响现有网站和桌面端。

### Modified Capabilities

None.

## Impact

受影响区域主要在前端主题与组件层（如 `GrammerContent.vue`、`GiscusComment.vue`、`Visitors.vue` 及相关入口挂载点），以及平台运行时判定逻辑。

此变更是**入口治理与需求约束**，不直接要求改动内容数据结构或桌面端打包流程。
