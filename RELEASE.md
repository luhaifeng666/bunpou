# Bunpou Desktop Release Guide

## Scope

This guide covers the desktop release workflow for Bunpou as a packaged Tauri application.

## Packaged Asset Paths

- Grammar content: `.vitepress/dist/**/*.html`
- Search index and site assets: `.vitepress/dist/assets/*`
- Voice assets: `.vitepress/dist/voices/*.wav`
- App icons: `src-tauri/icons/*`

The desktop build relies on `pnpm docs:build:nobase` so packaged assets resolve without a hosted base path.

## Release Steps

1. Install dependencies with `pnpm install`.
2. Build the app with `pnpm release:desktop`.
3. Run smoke verification with `pnpm release:smoke`.
4. Install the generated desktop artifact from `src-tauri/target/release/bundle/`.
5. Run the manual checklist below before distribution.

## Manual Smoke Checklist

- [ ] Launch the packaged app and confirm the window title is `Bunpou · 日语语法学习`.
- [ ] Confirm the home screen exposes direct entry points for quick index, course grammar, and term lookup.
- [ ] Open at least one course page and one topic page while offline.
- [ ] Trigger audio on a page with bundled voice assets and confirm playback works.
- [ ] Trigger audio on a page without bundled voice assets and confirm fallback speech playback works.
- [ ] Trigger audio on a page without bundled voice assets and confirm `无离线语音` only appears if fallback playback also fails.
- [ ] Click one external `http/https` link from the packaged app and confirm the system browser opens exactly once.
- [ ] Confirm app icons and bundle metadata are populated in the generated installer.

## Distribution Notes

- Current release target: desktop distribution.
- Store-specific signing and notarization are follow-up work and must be completed per platform before store submission.
