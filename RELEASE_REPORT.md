# Bunpou Release Verification Report

Date: 2026-03-17

## Candidate Artifacts

- App bundle: `src-tauri/target/release/bundle/macos/Bunpou.app`
- Installer: `src-tauri/target/release/bundle/dmg/Bunpou_1.2.1_x64.dmg`

## Automated Checks

- `pnpm vitepress build --base=/`: passed
- `pnpm release:smoke`: passed
- `pnpm release:desktop`: produced desktop bundle artifacts after aligning the installed Tauri CLI with the repository's Tauri 1.x stack

## Launch Check

- The packaged macOS app process started successfully from `Bunpou.app`.

## Gaps / Follow-up

- No automated blocker was found in the packaging path.
- A final human QA pass is still recommended before store submission to visually confirm the home shell, navigation flow, bundled audio playback, fallback audio playback, and single-open external-link behavior in the packaged UI.