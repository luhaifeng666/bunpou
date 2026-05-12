# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
# Dev server
pnpm docs:dev

# Build
pnpm docs:build              # with /bunpou/ base path (GitHub Pages)
pnpm docs:build:nobase       # without base path (custom domain bunpou.cn)

# Preview production build
pnpm docs:preview

# Build desktop app (Tauri)
pnpm build:app               # alias: pnpm build

# Voice audio
pnpm generate:voice          # generate audio files
pnpm generate:voice:cover    # generate with cover
pnpm check:voice             # verify audio files

# Sidebar menu regeneration
pnpm docs:menu

# Deploy
pnpm pub                     # build:nobase + scp sync to server

# RAG query (standalone Python)
MIMO_API_KEY=xxx python rag_query.py "你的问题"
```

## Architecture

### Web (VitePress + Vue 3)

- **`.vitepress/config.ts`** — VitePress site config: nav, sidebar, search (local), social links, footer
- **`.vitepress/theme/`** — custom theme extending VitePress DefaultTheme:
  - `index.ts` — layout composition with slot插槽注入 (Giscus评论, RAG搜索等)
  - `components/` — Vue components:
    - `RAGSearch.vue` — AI grammar Q&A dialog (fixed position, calls rag_query.py backend)
    - `DeepSeek.vue` — DeepSeek chat component
    - `GrammerContent.vue` — grammar doc content display
    - `AppShellHome.vue` / `AppRuntimeBridge.vue` — desktop app integration
    - `GiscusComment.vue` — comment system via GitHub discussions
    - `Catalog.vue`, `LevelStatsHome.vue`, `Visitors.vue`, `Ad.vue`
  - `runtime.ts` — runtime enhancements (link handling, etc.)
  - `custom.css` — global style overrides
- **`docs/`** — all grammar content as Markdown, organized by JLPT level:
  - `bunpou/N5/` through `bunpou/N1/` — grammar points by level
  - `auxiliary/` — 助词 (particles)
  - `verb.md`, `adjective.md`, `kosoado.md`, `directions.md`, `frequency.md`, `wear.md`
  - `term/` — terminology
- **`utils/index.js`** — sidebar generation from file tree, audio validation utilities
- **`index.md`** — home page (hero + feature cards)

### Desktop (Tauri)

- **`src-tauri/`** — Rust-based Tauri v1 wrapper
  - `tauri.conf.json` — window config (1280x820), build commands, bundle settings
  - `Cargo.toml` — Rust deps (tauri 1.4, serde)
  - `src/main.rs` — minimal Tauri entry point
- Development: `tauri dev` (runs VitePress dev server + opens native window)
- Bundle: `tauri build` → macOS/Windows/Linux desktop app

### RAG (AI Grammar Assistant)

- **`rag_query.py`** — standalone Python RAG query script:
  - Local embedding: `sentence-transformers` (paraphrase-multilingual-MiniLM-L12-v2)
  - Vector storage: SQLite (`bunpou_rag.db`) with cosine similarity search
  - Generation: MiMo API (`mimo-v2-pro`) with OpenAI-compatible SDK
  - Multi-turn dialogue support via message history
- Dependencies: `pip install sentence-transformers numpy openai`

### CI/CD

- **`.github/workflows/deploy.yml`** — GitHub Pages deployment
- **`.github/workflows/tauri.yml`** — Tauri desktop app build
- **`.github/skills/` + `.github/prompts/`** — OPSX-based skill system for project management

## Key Patterns

- Grammar docs use gray-matter frontmatter with `title` field for sidebar display
- Sidebar is auto-generated at build time by `utils/index.js` reading the file tree
- Audio files are WAV format in `public/voices/`, organized by doc path
- `public/imgs/` contains SVG assets and generated grammar overview images
- Commit convention: follow existing style (feat/fix/style prefix + Chinese description)
