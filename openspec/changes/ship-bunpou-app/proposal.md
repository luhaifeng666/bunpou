## Why

The current project is primarily a VitePress documentation site with a basic Tauri wrapper, which is not sufficient for App Store style distribution or a polished end-user learning experience. We need a defined productization plan now so Bunpou can evolve from a reference site into a releasable app with native packaging, offline usability, and clear release readiness requirements.

## What Changes

- Define a native app shell that reframes the content as an installable learning product instead of a documentation viewer.
- Add requirements for offline-first access to grammar content and bundled audio assets that work without a network connection.
- Add release-readiness requirements for app metadata, packaging, QA, and distribution workflows needed before store submission.
- Clarify the content navigation, home entry, and study-oriented flows expected from the app experience.

## Capabilities

### New Capabilities
- `native-app-shell`: Provide a productized native shell with app-specific home, navigation, window behavior, branding, and packaged runtime configuration.
- `offline-learning-content`: Provide bundled grammar content and audio that remain usable offline, with predictable asset loading and fallback behavior.
- `release-readiness`: Define the packaging, metadata, compliance checklist, and verification workflow required to ship Bunpou as a store-ready app.

### Modified Capabilities

None.

## Impact

Affected areas include the VitePress app entry and theme customization, Tauri configuration and bundling metadata, asset packaging for markdown and voice files, release automation/documentation, and QA coverage for desktop app behavior. This will likely require updates in `package.json`, `src-tauri/tauri.conf.json`, the docs site structure, static assets under `public/` and `docs/`, and release/build scripts.