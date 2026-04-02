# Jakal Workspace Desktop

Local-first workspace companion shell for a future desktop app that combines:

- a GitHub-like project hub
- a task board for active work
- an idea board for incubation and later projects
- a Drive-like file organizer

## Current Status

This repository now implements a verified shell-level companion experience for the four requested surfaces, but it is still not a full production workspace app.

Implemented and verified:

- a React shell with four stable top-level routes: `projects`, `tasks`, `ideas`, and `files`
- a shared `WorkspaceSnapshot` contract and `WorkspaceRepository` write boundary
- seeded local-first persistence through browser `localStorage`
- a minimal Tauri Rust entrypoint file at `src-tauri/src/main.rs`
- PowerShell harness helpers for prerequisite checks, upstream bootstrap, sample target materialization, and phase-based verification entrypoints

Still intentionally out of scope here:

- project CRUD and relation-aware detail views
- task board interactions such as move, reorder, archive, and project-linked metadata editing
- idea lifecycle workflows or idea-to-project conversion
- hierarchical file organization actions
- a runnable Tauri desktop package configuration (`src-tauri/Cargo.toml` and `src-tauri/tauri.conf.json` are absent)

## Repository Layout

- `desktop/`: React + Vite shell
- `desktop/src/app/routes/index.js`: frozen route contract
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

Optional harness prerequisites for the PowerShell scripts:

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
- `scripts/materialize-target.ps1 -ProfileId sample-local` resolves to the tracked sample materializer
- `scripts/invoke-verification.ps1` exists as the fixed harness verification entrypoint described by `docs/ARCHITECTURE.md`
- the browser shell mounts through `desktop/index.html`
- route selection is hash-based and falls back to `projects`
- all writes go through `WorkspaceRepository`

## Architecture Notes

The current codebase is intentionally narrow. The four surface areas share one seeded snapshot object:

- `projects`
- `tasks`
- `ideas`
- `files`

Cross-surface references are stored by id through `links`, and UI state records the last active route in `navigation.lastRoute`.

`WorkspaceRepository` is the only shared write boundary. It reads from storage, applies optional migrations, updates timestamps, and persists the full snapshot.

For harness-oriented work, `config/experiment.example.json` and `scripts/profile-common.ps1` define the fixed config keys, resolved paths, entry script names, and profile normalization rules.

## Limitations

- The app is currently a shell and seed-data viewer, not a full productivity workspace.
- Persistence targets browser `localStorage`; there is no filesystem sync or multi-user support.
- The Tauri side is incomplete, so this repository is not yet a packaged desktop application.
- The managed verification flow for `jakal-flow-local` still depends on external tools and a mutable target checkout under `.local/`.

## Next Extension Points

- Replace seeded collections with real feature state and CRUD flows per surface.
- Add Tauri configuration and desktop packaging only after the React shell contract is stable enough to preserve.
- Expand tests from shell-level contracts into feature behavior once those features actually exist.
- If the harness is kept, add direct automated coverage for `scripts/invoke-verification.ps1`.
