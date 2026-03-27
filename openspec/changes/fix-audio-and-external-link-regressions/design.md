## Context

The current desktop regression sits at the boundary between content rendering and desktop runtime integration. `GrammerContent.vue` was simplified to prefer packaged wav assets, but that change also removed the older non-local playback path for entries that depend on generated or remote audio. `AppRuntimeBridge.vue` now intercepts external anchors for Tauri, but the current interception is permissive enough that one click can hand off the same URL twice.

## Goals / Non-Goals

**Goals:**
- Restore audio playback for entries without bundled local voice assets.
- Keep packaged wav playback as the first choice when local assets exist.
- Ensure a desktop external-link click produces exactly one system-browser launch.
- Add regression checks that cover both behaviors in release validation.

**Non-Goals:**
- Redesign the overall audio UX or change which pages have bundled wav assets.
- Replace the existing desktop link-opening strategy with a broader router rewrite.
- Introduce new online widgets or change the current desktop downgrade strategy for broken remote panels.

## Decisions

### Reintroduce a second audio path behind a single playback entry point
`GrammerContent.vue` should treat bundled wav playback and non-bundled playback as two branches of the same user action. If a packaged wav exists, the component plays it directly. If not, it should fall back to the existing generated or runtime playback path instead of immediately marking the entry unavailable.

Alternative considered: keeping the current local-only behavior and surfacing a clearer error. Rejected because the regression is functional, not just presentational, and the project previously supported those entries.

### Only mark audio unavailable after both playback paths fail
The component should not show an unavailable state merely because a local wav is missing. Unavailable should mean neither bundled playback nor fallback playback can be completed.

Alternative considered: using missing local assets as a hard unavailable state. Rejected because it breaks non-local audio entries that still have a valid playback path.

### Make desktop external-link interception idempotent per click
The runtime bridge should suppress duplicate handling by ensuring a single click event can produce at most one `open()` call. This likely means intercepting earlier in the event lifecycle and/or marking handled anchors so later handlers do not relaunch the same URL.

Alternative considered: relying on current bubbling plus `preventDefault()` only. Rejected because the regression shows that default prevention alone is not sufficient in the packaged runtime.

### Add verification that covers both local and non-local audio flows
Release verification should explicitly exercise one bundled audio entry and one fallback-audio entry, plus a desktop external link, so these regressions are caught before shipping.

Alternative considered: relying only on generic build success. Rejected because both regressions compiled cleanly and only failed behaviorally.

## Risks / Trade-offs

- [Fallback audio logic may reintroduce network dependence for some entries] -> Mitigation: keep bundled audio preferred and only invoke fallback when local assets are absent.
- [Desktop click interception changes can accidentally affect internal links] -> Mitigation: scope interception strictly to `http/https` anchors and keep internal navigation untouched.
- [Behavioral regressions are easy to miss in CI-only validation] -> Mitigation: extend smoke checks with explicit packaged-app manual steps.

## Migration Plan

1. Restore the missing fallback audio branch in the grammar playback component.
2. Harden the desktop external-link bridge against duplicate launches.
3. Update verification guidance so both scenarios are checked in future releases.
4. If the change causes unexpected runtime issues, revert the regression fix commit while keeping the rest of the desktop packaging work intact.

## Open Questions

None.