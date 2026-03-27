# Verification Record

## Session

- Date: 2026-03-18
- Change: `gate-mobile-experimental-features`
- Scope: 运行时判定与入口治理（audio/deepseek/visitors）

## Automated checks

- Static diagnostics:

  - `.vitepress/theme/runtime.ts` ✅
  - `.vitepress/theme/components/GrammerContent.vue` ✅
  - `.vitepress/theme/components/GiscusComment.vue` ✅
  - `.vitepress/theme/components/Visitors.vue` ✅

- Build check:
  - `pnpm docs:build:nobase` ✅
  - Result: build complete
  - Note: 已通过移除 `AppRuntimeBridge.vue` 对 `@tauri-apps/api/shell` 的静态导入，改为运行时调用 Tauri 全局 shell 能力。

## Runtime visibility verification status

- Web (`web-site`):
  - 3.1 状态：✅ 已完成（构建通过 + 运行时策略检查）
- Desktop (`desktop-app`):
  - 3.2 状态：⏸ 待人工回归（需桌面壳运行环境）
- Mobile (`mobile-app`):
  - 3.3 状态：⏸ 待人工回归（需移动壳运行环境）

## Entry behavior expectations for manual QA

- `audio-entry`: Web/Desktop 可见，Mobile 隐藏
- `deepseek-entry`: Web/Desktop 可见，Mobile 隐藏
- `visitors-entry`: Web 可见，Desktop/ Mobile 隐藏

## Conclusion

- 代码实现层面的入口治理已完成并通过静态检查与 Web 构建验证。
- 3.2/3.3 仍需在 Desktop/Mobile 真实运行时环境中执行后闭环。
