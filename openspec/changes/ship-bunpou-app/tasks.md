## 1. App Shell

- [x] 1.1 Audit the current VitePress/Tauri entry flow and define the app-specific home, navigation, and branding surfaces to replace the raw docs-first launch experience.
- [x] 1.2 Implement the Bunpou app home and navigation updates in the front-end so users can enter courses, grammar categories, and index/search flows from a native-feeling shell.
- [x] 1.3 Update Tauri window configuration, title, icons, and other presentation defaults so release builds no longer use development-style shell behavior.

## 2. Offline Learning Content

- [x] 2.1 Trace how markdown pages, menu data, and voice files are currently built and loaded, then define the packaged asset paths required for offline use.
- [x] 2.2 Update the build and runtime asset-loading flow so bundled grammar content renders correctly without network access inside the packaged app.
- [x] 2.3 Package supported voice assets for offline playback and add a visible fallback state for entries whose optional audio is unavailable.

## 3. Release Readiness

- [x] 3.1 Complete production bundle metadata in the Tauri configuration, including identifier, descriptive fields, icons, and release-oriented versioning expectations.
- [x] 3.2 Create or update release scripts and documentation covering build prerequisites, package generation, and artifact handoff for a desktop release.
- [x] 3.3 Define a release checklist that covers installation, launch, navigation, offline content, and audio smoke testing before distribution.

## 4. Verification

- [x] 4.1 Produce a trial release build and verify that the packaged app launches into the new Bunpou shell with bundled content available offline.
- [x] 4.2 Run the documented smoke checks against the candidate build and record any gaps that block a shippable release.