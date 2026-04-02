# Jakal Workspace Desktop

Jakal Workspace Desktop is a local-first companion shell for organizing work around the upstream [`Jakal-flow`](https://github.com/Ahnd6474/Jakal-flow) project. It keeps four workspace surfaces inside one React shell:

- `projects`: repository-facing delivery hub
- `tasks`: active execution board
- `ideas`: incubation board for future work
- `files`: Drive-style library for briefs, specs, and support material

The current app is intentionally a verified shell and seeded workspace experience, not a full production desktop product.

## What The App Does Now

Implemented and verified in this repository:

- a shared shell with four stable top-level routes: `projects`, `tasks`, `ideas`, and `files`
- hash-based route selection with fallback to `projects`
- shell-level route framing, navigation hints, hero metrics, and cross-surface continuation links
- a dedicated repository connection panel, repository-focus labels, and direct upstream link to `Jakal-flow`
- seeded local-first persistence through browser `localStorage`
- one shared `WorkspaceSnapshot` contract with `WorkspaceRepository` as the only write boundary
- upgraded route experiences for idea shaping and file browsing
- a minimal Tauri Rust entrypoint at `src-tauri/src/main.rs`
- PowerShell harness helpers for prerequisite checks, upstream bootstrap, sample target materialization, and verification entrypoints

Still intentionally out of scope:

- full CRUD and relation-editing flows across all workspace entities
- task board interactions such as move, reorder, archive, or deeper scheduling controls
- idea promotion workflows that mutate real downstream project state
- file import, upload, and filesystem sync
- a runnable packaged Tauri desktop configuration (`src-tauri/Cargo.toml` and `src-tauri/tauri.conf.json` are absent)

## Intended Usage Model

This repo is designed as a companion workspace around the upstream `Jakal-flow` repository, not a replacement for it.

- Use `projects` to anchor repository-facing delivery context and sync health.
- Use `tasks` to keep active execution visible against that repository context.
- Use `ideas` to shape future work before it becomes committed delivery.
- Use `files` to stage local documents first, then connect only the material that should stay attached to projects, tasks, or ideas.

The shell is built to make those four surfaces feel like one workflow loop rather than isolated pages. Route metadata, continuation links, and repository focus labels are there to guide movement between planning, execution, incubation, and supporting material.

## Surface Guide

### Shared Shell

The shell hero summarizes workspace totals, the last active route, and connected provider count while exposing direct actions for the current surface and the upstream repository. Navigation cards describe each surface with route-specific hints, and the right-hand repository panel keeps the `Jakal-flow` relationship explicit while the active route renders inside the same shared frame.

### Ideas

The `ideas` route is an incubation board with:

- deferred search and stage filters across the full board
- searchable stage-based lanes
- workflow guidance for `captured`, `shaping`, `validated`, and `promoted`
- selected-idea detail panels
- readiness checks for linked projects, tasks, files, and promotion outcome
- continuity counts that show whether discovery is ready to graduate into repository-backed work

### Files

The `files` route is a local-first workspace browser with:

- root-library navigation
- folder breadcrumbs
- deferred local search and lightweight filtering
- recent document and top-linked-file callouts
- workflow guidance that explains when a file should stay local versus move into repository-backed work
- selection detail panels that explain the next recommended handoff into `projects`, `tasks`, or `ideas`

## Repository Layout

- `desktop/`: React + Vite shell
- `desktop/src/App.jsx`: shared shell framing and repository connection panel
- `desktop/src/app/routes/index.js`: frozen route contract and upstream repository metadata
- `desktop/src/features/ideas/IdeasRoute.jsx`: incubation board experience
- `desktop/src/features/files/FilesRoute.jsx`: local-first file library experience
- `desktop/src/shared/contracts/index.js`: snapshot shape and seed data
- `desktop/src/shared/storage/workspaceRepository.js`: persistence boundary and migration hook
- `scripts/`: PowerShell harness entrypoints and shared helpers
- `config/`: example config and tracked profiles
- `src-tauri/src/main.rs`: minimal Rust entrypoint stub
- `tests/test_workspace_shell_contracts.py`: Python verification for shell contracts and runtime behavior

## Local Setup

Prerequisites:

- Python 3.12+
- Node.js 20+
- npm 10+

Install frontend dependencies:

```bash
cd desktop
npm install
```

Optional harness prerequisites:

- PowerShell 5.1+ on Windows
- `git`
- `codex` only when using the `jakal-flow-local` managed profile

## Commands

Run the shell in development:

```bash
cd desktop
npm run dev
```

Create a production build:

```bash
cd desktop
npm run build
```

Run repository verification:

```bash
python -m pytest
```

Materialize the local sample target fixture:

```bash
powershell -NoProfile -ExecutionPolicy Bypass -File scripts/materialize-target.ps1 -ProfileId sample-local
```

Run ordered verification phases for the default managed profile:

```bash
powershell -NoProfile -ExecutionPolicy Bypass -File scripts/invoke-verification.ps1
```

## Verified Behavior

- `python -m pytest` passes from the repository root
- `npm run build` passes from `desktop/`
- `desktop/index.html` mounts the browser shell
- route selection is hash-based and falls back to `projects`
- all writes flow through `WorkspaceRepository`
- `scripts/materialize-target.ps1 -ProfileId sample-local` resolves to the tracked sample materializer
- `scripts/invoke-verification.ps1` exists as the fixed harness verification entrypoint described by `docs/ARCHITECTURE.md`

## Architecture Notes

The four workspace surfaces share one seeded snapshot object:

- `projects`
- `tasks`
- `ideas`
- `files`

Cross-surface relationships are stored by id through `links`, and UI state records the last active route in `navigation.lastRoute`.

`WorkspaceRepository` remains the only shared write boundary. It reads from storage, applies optional migrations, updates timestamps, and persists the full snapshot.

For harness-oriented work, `config/experiment.example.json` and `scripts/profile-common.ps1` define the fixed config keys, resolved paths, entry script names, and profile normalization rules.

## Limitations

- The app is still a shell-plus-seeded-data experience, not a complete productivity workspace.
- Persistence targets browser `localStorage`; there is no filesystem sync or multi-user support.
- The Tauri side is incomplete, so this repository is not yet a packaged desktop application.
- The managed verification flow for `jakal-flow-local` still depends on external tools and a mutable target checkout under `.local/`.

## Next Extension Points

- Replace seeded collections with real feature state and CRUD flows per surface.
- Add Tauri configuration and desktop packaging only after the React shell contract is stable enough to preserve.
- Expand tests from shell-level contracts into richer feature behavior once those behaviors are meant to be stable.
- If the harness is kept, add direct automated coverage for `scripts/invoke-verification.ps1`.
