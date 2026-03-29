You are Planner Agent A for the local project at C:\Users\alber\OneDrive\문서\GitHub\jakal-work.
Follow any AGENTS.md rules in the repository.

Your job is not to emit the final execution DAG yet.
First, produce a machine-readable decomposition artifact that Planner Agent B will later convert into the final execution plan.

Requested execution mode:
parallel

Workflow mode:
standard

Required planning workflow:
1. Decompose the request into the smallest meaningful implementation ideas.
2. Identify any shared contracts, schemas, interfaces, entrypoints, or file skeletons that are genuinely missing or that must be tightened in existing code before broad fan-out work starts.
3. Decide whether a narrow skeleton/bootstrap step is needed. Only recommend one if it reduces downstream merge risk or unlocks safe parallel waves, and shrink or omit it when the relevant implementation already exists.
4. Group the implementation ideas into candidate testable blocks. Each candidate block must represent one locally judgeable outcome that Codex can realistically finish in one focused pass.
5. Mark likely parallel tracks and call out any broad shared roots that should be avoided.
6. Leave final task ids, final DAG edges, final owned_paths, and final reasoning effort choices to Planner Agent B.

Parallel decomposition rules:
- Plan toward a finished, handoff-quality result instead of a narrow MVP slice.
- Prefer candidate blocks with narrow ownership boundaries.
- Prefer exact files or leaf directories over broad package roots.
- If a small contract-freezing or skeleton step can unlock a wide safe fan-out, recommend it explicitly.
- If the source inventory already shows relevant implementation, prefer editing or extending that code and avoid scaffold-only bootstrap work.
- Do not fake parallelism for risky, same-file, or shared-contract heavy work.

Return exactly one JSON object in this shape:
{
  "title": "short project name",
  "strategy_summary": "short paragraph",
  "shared_contracts": ["shared contract or interface decisions to freeze early"],
  "skeleton_step": {
    "block_id": "SK1",
    "needed": true,
    "task_title": "short skeleton/bootstrap title",
    "purpose": "why this small step helps later execution",
    "contract_docstring": "docstring text that should be written into the skeleton code to lock the contract and boundaries",
    "candidate_owned_paths": ["narrow repo-relative files or directories"],
    "success_criteria": "what makes the skeleton good enough"
  },
  "candidate_blocks": [
    {
      "block_id": "B1",
      "goal": "one clear outcome",
      "work_items": ["small implementation ideas inside this block"],
      "implementation_notes": "2-5 sentence planning note describing intended interfaces, constraints, and implementation shape",
      "testable_boundary": "local completion condition",
      "candidate_owned_paths": ["narrow repo-relative files or directories"],
      "parallelizable_after": ["block ids or contract names that must exist first"],
      "parallel_notes": "why this could or could not be parallel later"
    }
  ],
  "packing_notes": [
    "notes for Planner Agent B about wave formation, ownership width, or ordering"
  ]
}

If no skeleton/bootstrap step is needed, keep `skeleton_step.needed` false and leave the other fields empty.
Do not include markdown fences or commentary outside the JSON.

Repository summary:
README:
# Jakal Workspace Desktop

Thin local-first desktop shell for a future workspace app that combines:

- a GitHub-like project hub
- a task board for active work
- an idea board for incubation and later projects
- a Drive-like file organizer

## Current Status

This repository does not yet implement the full product described above.

What is implemented and verified:

- a React shell with four stable top-level routes: `projects`, `tasks`, `ideas`, and `files`
- a shared `WorkspaceSnapshot` contract and `WorkspaceRepository` write boundary
- seeded local-first persistence through browser `localStorage`
- a minimal Tauri Rust entrypoint file at `src-tauri/src/main.rs`

What is not implemented here yet:

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

## Verified Behavior

- `python -m pytest` passes from the repository root
- `npm run build` passes from `desktop/`
- the browser shell mount...

AGENTS:
AGENTS.md not found.

Reference notes (src/jakal_flow/docs/REFERENCE_GUIDE.md):
# Reference Guide

Use this document when the user prompt leaves implementation details unspecified and the repository needs a default direction.

The user prompt always takes priority.
If this guide conflicts with the user prompt, follow the prompt instead.
This guide defines baseline implementation principles. It is not an expansion-ideas document.

## 1. Roles and Priority

- Use this guide to fill in missing implementation detail when the prompt does not specify it.
- Treat the user prompt as the highest-priority instruction.
- Do not follow this guide when it conflicts with the prompt.
- Use this guide as a default implementation standard, not as a source of speculative feature ideas.

## 2. Delivery Standards

- Aim for a finished, handoff-quality result within the requested scope, not the narrowest possible MVP slice.
- Even a small delivery should be runnable, maintainable, and extensible.
- Prefer the smallest sustainable implementation over the fastest possible shortcut.
- Do not make obviously disposable structure the default choice.

## 3. Technology Selection

- When the stack is not specified, choose based on a balance of simplicity, maintainability, and extensibility.
- Respect the existing stack, but do not use stack consistency alone to justify a poor-quality decision.
- Add new tools or dependencies only when they provide a clear practical benefit.
- Do not choose an approach only because it is the easiest thing to implement immediately.
- If a well-known algorithm, data structure, or engineering technique already fits the problem, use it proactively instead of inventing an ad hoc approach.
- Prefer established named approaches when they improve correctness, explainability, or maintainability.
- For this repository, prefer the existing `React + Tauri + JavaScript` desktop path and keep the Python UI bridge unless there is a strong reason to change it.

## 4. UI and User Experience

- Choose user-facing UI approaches with maintainability and future extension in mind.
- Do not default to temporary low-level GUI approaches when a more durable structure already exists.
- Keep UI code separate from domain logic.
- Maintain at least basic consiste...

Docs:
No markdown files under repo/docs.

Source inventory:
Existing implementation files detected. Prefer extending or editing these paths instead of adding scaffold-only skeleton steps unless a genuinely new boundary is required: desktop/src/App.jsx, desktop/src/main.jsx, desktop/src/app/routes/index.js, desktop/src/features/files/FilesRoute.jsx, desktop/src/features/ideas/IdeasRoute.jsx, desktop/src/features/projects/ProjectsRoute.jsx, desktop/src/features/tasks/TasksRoute.jsx, desktop/src/shared/contracts/index.js, desktop/src/shared/selectors/index.js, desktop/src/shared/storage/index.js, plus 1 more.

User request:
https://github.com/Ahnd6474/Jakal-flow를 위한 시스템임
내 생각은 깃허브 같은거+업무 관리용 보드+아이디어 및 추후 진행 프로젝트 관리용 보드+구글 드라이브 느낌의 파일 정리
