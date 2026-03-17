## Context

Bunpou currently ships as a markdown-driven VitePress site with a minimal Tauri shell. The content set is already valuable, but the product behaves like embedded documentation rather than a native study app. There is no app-specific home experience, no explicit offline content contract, and no release process that covers packaging metadata, QA, and store submission readiness.

The change spans multiple layers: content rendering, navigation, static asset handling, native bundling, and release operations. The target is a shippable desktop app first, using the existing Tauri foundation, while keeping the markdown content workflow intact so existing authoring remains low-friction.

## Goals / Non-Goals

**Goals:**
- Turn Bunpou into a coherent native app experience instead of a direct documentation embed.
- Preserve markdown as the source of truth while guaranteeing offline access to content and bundled audio.
- Define release-ready packaging, metadata, QA, and operational checks required before shipping.
- Keep the implementation incremental so the app can be improved without rewriting the content system.

**Non-Goals:**
- Rebuild the content stack into a custom SPA or a database-backed CMS.
- Introduce cloud sync, user accounts, or progress synchronization in this change.
- Commit to mobile store packaging in the first implementation pass.
- Redesign every grammar page; content quality improvements remain a separate effort.

## Decisions

### Use Tauri as the primary release target
We will keep Tauri as the native runtime because it already exists in the repository and is sufficient for a lightweight desktop learning app. This avoids a platform rewrite and lets the team focus on productization.

Alternative considered: moving to Electron. Rejected because it would increase runtime size and migration cost without solving the current product gaps.

### Keep markdown and VitePress, but add an app-specific shell
The markdown corpus under `docs/` remains the source of truth. We will add an app-specific entry experience, navigation model, and theme customizations around it rather than replacing the content system. This keeps authoring stable while giving the app a distinct product surface.

Alternative considered: building a custom front-end app that imports markdown directly. Rejected for the initial change because it adds unnecessary implementation risk and delays release readiness.

### Bundle all required learning assets for offline use
Grammar pages, menu metadata, and voice assets needed by the app SHALL be packaged into the distributable artifact. Asset references must resolve from the bundled app without network access, and missing assets must degrade predictably.

Alternative considered: online-first asset loading with cache fallback. Rejected because it weakens the value proposition of an installable app and complicates store review and QA.

### Add a release-readiness workflow as a product requirement
Release readiness will be treated as a first-class capability, not a loose checklist. The implementation should cover app identifiers, versioning, icons, descriptions, build outputs, smoke tests, and a documented publish procedure.

Alternative considered: leaving release work to manual ad hoc steps after coding. Rejected because the project is explicitly aiming for a publishable app and needs repeatable packaging quality.

### Prefer incremental desktop-first UX improvements
The first iteration should improve launch surface, navigation, window metadata, and content discoverability without attempting a complete pedagogical redesign. This creates a stable release candidate sooner.

Alternative considered: a broad product redesign including study plans and account systems. Rejected as too large for the initial change.

## Risks / Trade-offs

- [VitePress app customization may be more constrained than a custom SPA] → Mitigation: keep requirements focused on shell, navigation, and asset handling; escalate only if the framework blocks critical UX.
- [Bundled voice assets can increase installer size] → Mitigation: define which assets are required offline and validate packaging size during release QA.
- [Current content may include links or assumptions optimized for web deployment] → Mitigation: add app-specific navigation checks and offline smoke tests before release.
- [Store-readiness details differ by platform] → Mitigation: scope the initial release target to desktop packaging and document platform-specific follow-up work explicitly.

## Migration Plan

1. Introduce the app shell and content routing adjustments while preserving existing markdown paths.
2. Update asset packaging so the built app includes required docs and voice resources.
3. Expand Tauri metadata, icons, and bundle configuration to reflect a production app.
4. Add release documentation and verification steps, then produce trial builds for smoke testing.
5. If rollout issues appear, fall back to the current documentation build because content sources remain unchanged and the app shell is additive.

## Open Questions

- Which desktop storefront or distribution channel is the first shipping target: direct download, Mac App Store, or another marketplace?
- Whether all existing voice assets must ship offline by default or whether a curated subset is acceptable for the first release.
- Whether the app should preserve the current documentation-style information architecture or introduce course-first navigation on the initial home screen.