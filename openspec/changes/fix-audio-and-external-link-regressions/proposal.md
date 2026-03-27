## Why

The recent desktop packaging fixes introduced two regressions: entries without bundled local audio no longer play at all, and desktop external links now open the target twice. These break expected study behavior in production builds and need a focused follow-up change before the release flow is considered stable.

## What Changes

- Restore the non-bundled audio playback path for entries that do not have packaged local voice assets, while keeping bundled offline audio as the preferred source when available.
- Tighten the desktop external-link bridge so a single user click results in exactly one system-browser launch.
- Add regression coverage for mixed audio sources and desktop external-link handling in the packaged app flow.

## Capabilities

### New Capabilities

None.

### Modified Capabilities

- `offline-learning-content`: refine audio playback requirements so packaged local audio and non-bundled playback fallback both remain usable.
- `native-app-shell`: refine desktop external navigation behavior so out-of-app links are handed off once, without duplicate launches.

## Impact

Affected areas include `.vitepress/theme/components/GrammerContent.vue`, `.vitepress/theme/components/AppRuntimeBridge.vue`, the existing audio utility flow under `utils/`, and release verification for packaged desktop behavior.