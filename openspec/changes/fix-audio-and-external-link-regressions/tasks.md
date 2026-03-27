## 1. Audio Regression Repair

- [x] 1.1 Audit the current `GrammerContent.vue` playback flow and identify where the non-bundled audio branch was removed.
- [x] 1.2 Restore fallback playback for entries without packaged wav assets while keeping bundled local audio as the preferred source.
- [x] 1.3 Verify unavailable-state handling only appears after both local and fallback playback paths fail.

## 2. External Link Deduplication

- [x] 2.1 Inspect the desktop runtime bridge and reproduce why one external-link click can trigger duplicate browser launches.
- [x] 2.2 Update the external-link interception logic so one click yields exactly one `open()` handoff for `http/https` URLs.

## 3. Regression Verification

- [x] 3.1 Add or update release verification guidance to cover one bundled audio entry, one fallback-audio entry, and one desktop external link.
- [ ] 3.2 Rebuild the packaged desktop app and confirm both regressions are resolved in the release artifact.