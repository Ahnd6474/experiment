You are Planner Agent B for the local project at C:\Users\alber\OneDrive\문서\GitHub\jakal-work.
Follow any AGENTS.md rules in the repository.

Planner Agent A has already produced an intermediate decomposition artifact.
Your job is to convert that artifact into the final execution DAG.

Break the user's request into small execution checkpoints.
Use Planner Agent A's decomposition as the primary intermediate artifact, then regroup those ideas into a DAG execution tree where each node has one clear, locally judgeable completion condition.
Each node may contain multiple small sub-steps if they belong to the same clear outcome.
If a node would contain multiple independently judgeable outcomes, split it into multiple nodes.

Prefer narrow, dependency-aware blocks that Codex can realistically complete in one focused pass.
Do not combine unrelated work into the same node.
Do not require concrete test commands at planning time.
At this stage, define nodes by clear success conditions rather than by existing test commands.
Optimize the plan for a finished, handoff-quality result rather than a narrow MVP slice.
Prefer implementation choices that are simple, durable, and polished enough to keep if the project continues.
If the requested outcome cannot be completed reliably without setup, integration, validation, cleanup, documentation, polish, or supporting implementation work that the user did not explicitly mention, include that work in the plan.
Treat all directly necessary supporting work as in scope so the result feels complete; do not add speculative roadmap items or optional expansion beyond the requested product outcome.
Use the following priority order while planning:
1. Follow AGENTS.md and explicit repository constraints first.
2. Use the user request as the primary product goal within those constraints.
3. Use src/jakal_flow/docs/REFERENCE_GUIDE.md for unstated implementation preferences and tie-breakers.
4. Use README.md and other repository docs to align with the existing structure.
5. Fall back to generic defaults only if the repository sources above do not decide the issue.

Requested execution mode:
parallel

The app is currently in parallel mode. Plan a DAG execution tree instead of a simple list.
Use `step_id` and `depends_on` to define the graph.
Only let steps become parallel-ready when their dependencies are complete.
Maximize safe frontier width. Prefer plans that create at least one credible parallel-ready wave with 2 or more steps after any required prerequisite setup.
Unless Agent A identifies a real safety blocker, convert its parallelizable groups into at least one concrete 2+ step ready wave.
For any steps that may run in parallel, provide non-empty `owned_paths` and make them as narrow as possible.
Prefer exact files or leaf directories over broad package roots so the scheduler can batch more work safely.
Keep exact-path ownership exclusive across the same ready wave.
If a wide fan-out needs one small contract-freezing or coordination step first, add that narrow prerequisite instead of collapsing the whole plan back to serial.
If the source inventory or Planner Agent A shows that the relevant implementation already exists, fold scaffold-only bootstrap work into the concrete implementation step or reduce it to the smallest contract-tightening edit.
Do not put risky, tightly coupled, shared-contract, or same-file refactors in the same parallel-ready wave.
If a step needs broad repo-wide edits or merge-sensitive refactors, keep it isolated rather than pretending it is parallel-safe.
When several branches should reconverge before later integration-sensitive work, emit an explicit join node instead of hiding that synchronization inside a vague later task.
Use `metadata.step_kind = "join"` for an explicit merge/integration checkpoint and `metadata.step_kind = "barrier"` for a synchronization checkpoint that must run alone before later work continues.
Join or barrier nodes must run alone, must not use `parallel_group`, and should depend on the upstream nodes they are reconciling.
Use join nodes sparingly. Add them only when a later task truly needs the combined result of multiple earlier branches or when integration risk is high enough that the synchronization point should be first-class in the graph.
Do not include the final closeout sweep inside the normal task list. The app runs a separate closeout block after all planned tasks finish.

Model routing guidance for this run:
Default routing for this run:
- General implementation steps should stay on `openai` with the current Codex model selection.
- UI, frontend, desktop, web, and visual polish steps may use `gemini` when Gemini CLI is configured; otherwise keep them on `openai`.
- If you do not need to pin a provider for a non-ensemble run, leaving `model_provider` and `model` blank is acceptable.

Return exactly one JSON object with a top-level "tasks" array containing 3 to 5 items.

JSON shape:
{
  "title": "short project name",
  "summary": "one short paragraph",
  "tasks": [
    {
      "step_id": "stable id like ST1",
      "task_title": "short stage name",
      "display_description": "one sentence or less for UI display",
      "codex_description": "one paragraph or less with the actual execution instruction for Codex",
      "model_provider": "execution backend for this step, such as openai, claude, or gemini",
      "model": "model slug or alias for this step",
      "reasoning_effort": "one of low, medium, high, xhigh based on expected difficulty",
      "depends_on": ["step ids that must complete first"],
      "owned_paths": ["repo-relative paths or directories this step primarily owns"],
      "success_criteria": "clear completion condition that can be judged locally",
      "metadata": {
        "step_kind": "task unless this is an explicit join or barrier node",
        "merge_from": ["step ids being explicitly reconciled; usually the same as depends_on for join nodes"],
        "join_policy": "use `all` for join nodes and leave empty for normal task nodes",
        "join_reason": "brief note explaining why this synchronization point exists",
        "candidate_block_id": "Planner Agent A block id",
        "parallelizable_after": ["Planner Agent A block ids or contract names carried through"],
        "implementation_notes": "non-docstring planning note carried forward from Planner Agent A",
        "is_skeleton_contract": false,
        "skeleton_contract_docstring": "required only when this step is the skeleton/bootstrap contract step; otherwise empty string",
        "candidate_owned_paths": ["Planner Agent A ownership hint for post-processing and traceability"]
      }
    }
  ]
}

Field requirements:

- "title": short and concise title for project.
- "summary": a short paragraph explaining the overall execution flow from a project perspective. It must briefly describe the role of each task in the broader project, not just restate the user request.
- "step_id": use stable ids like `ST1`, `ST2`, `ST3` so dependency references stay unambiguous.
- "task_title": short and actionable title for task.
- "display_description": very short user-facing explanation, no more than one sentence.
- "codex_description": the actual instruction for Codex, no more than one paragraph, specific enough to execute.
- "model_provider": choose a concrete provider for the step. In ensemble mode, set this explicitly for every step and follow the routing guidance above.
- "model": choose the concrete model slug or alias for the selected provider. In ensemble mode, set this explicitly for every step and follow the routing guidance above.
- "reasoning_effort": choose only `low`, `medium`, `high`, or `xhigh`. Use `low` for narrow mechanical edits, `medium` for normal implementation, `high` for multi-file or tricky work, and `xhigh` only for the hardest investigations or refactors.
- "depends_on": in parallel mode, use this to encode the DAG.
- "owned_paths": in parallel mode, list the main repo-relative files or directories each step owns so independently ready steps can be batched safely. Prefer narrow exact files or leaf directories. Use an empty array only when the step should run alone.
- "success_criteria": a concrete, locally judgeable done condition, describing what must be true when the block is complete.
- "metadata": carry Planner Agent A traceability hints. Preserve `candidate_block_id`, carry `parallelizable_after`, keep non-skeleton notes in `implementation_notes`, and use `skeleton_contract_docstring` only for the skeleton/bootstrap contract step.
- Do not assign a provider that is marked unavailable in the routing guidance unless the target repository explicitly requires it.
- For a normal work node, set `metadata.step_kind` to `task` or leave it empty.
- For an explicit synchronization node, set `metadata.step_kind` to `join` or `barrier`. Join nodes should normally depend on 2 or more upstream steps, set `metadata.merge_from`, and use `metadata.join_policy = "all"`.
- Do not emit `join_policy = "any"` or other custom merge semantics. The runtime currently supports only explicit `all` joins.
- If the step is the skeleton/bootstrap contract step, make `codex_description` explicitly tell the executor to update existing code in place when that surface already exists and create only the smallest necessary skeleton otherwise.

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
- idea lifecycle workflows or idea-to-project c...

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

Planner Agent A decomposition artifact:
{
  "title": "jakal workspace hub",
  "strategy_summary": "Extend the existing local-first shell instead of rebuilding it: keep the frozen four-route app shell, the `WorkspaceSnapshot v3` data model, and the `WorkspaceRepository` write boundary intact, then add one shared sync layer for the public `Ahnd6474/Jakal-flow` integration before fanning out into route-local product surfaces. The safest parallel shape is one shared-root integration block first, four feature-route blocks in parallel second, and a final shell-integration plus verification sweep last.",
  "shared_contracts": [
    "WorkspaceSnapshot v3 remains the only shared state contract; projects, tasks, ideas, and files continue to reference each other by ids only.",
    "WorkspaceRepository and WorkspaceIntegrationAdapter remain the only shared write and external-sync boundaries; route UIs must not parse remote payloads directly or mutate snapshot state outside repository methods.",
    "Top-level navigation stays frozen to the four existing route keys: `projects`, `tasks`, `ideas`, and `files`.",
    "The first external source to support is the public `Ahnd6474/Jakal-flow` repository, normalized into `integrations.jakalFlow`, `integrations.github`, and `WorkspaceIntegrationRecord` state without breaking offline/local-first behavior.",
    "Drive-like file organization continues to use `fileHierarchy.rootFileIds`, `parentId`, and `childIds`; no second tree model or denormalized nested file payloads should be introduced.",
    "Idea promotion continues to flow through the existing `promoteIdeaToProject` semantics so project creation from an idea stays one shared contract instead of per-route custom logic."
  ],
  "skeleton_step": {
    "block_id": "",
    "needed": false,
    "task_title": "",
    "purpose": "",
    "contract_docstring": "",
    "candidate_owned_paths": [],
    "success_criteria": ""
  },
  "candidate_blocks": [
    {
      "block_id": "B1",
      "goal": "Establish a live, refreshable Jakal-flow and GitHub sync boundary for `Ahnd6474/Jakal-flow` that feeds normalized integration state into the workspace.",
      "work_items": [
        "Add a shared integration client or adapter layer that fetches public repository metadata and syncable records for `Ahnd6474/Jakal-flow`.",
        "Map remote payloads into `replaceJakalFlowIntegration`, `replaceGitHubIntegration`, and `upsertIntegrationRecord` inputs without exposing raw API shapes to route code.",
        "Persist loading, connected, synced, and error states in the existing integration contract so network failure stays non-fatal to local-first feature flows.",
        "Update shared selectors only where needed so route surfaces can consume provider summaries and per-entity sync badges from normalized state."
      ],
      "implementation_notes": "This is the only genuinely shared-root-heavy block and should own the external sync story end to end. Prefer browser-native `fetch` and a narrow shared module under `desktop/src/shared` instead of introducing a broad dependency or letting each route perform its own API parsing. If no stable Jakal-flow API exists beyond the public GitHub repository, keep the implementation read-only against GitHub data and record that limitation through normalized error and metadata fields instead of widening entity contracts.",
      "testable_boundary": "A mocked or fixture-backed sync refresh can populate provider state and integration records for `Ahnd6474/Jakal-flow`, selectors return stable summaries, and sync errors persist without damaging local project/task/idea/file data.",
      "candidate_owned_paths": [
        "desktop/src/shared/storage/workspaceRepository.js",
        "desktop/src/shared/storage/index.js",
        "desktop/src/shared/selectors/index.js",
        "desktop/src/shared/integrations"
      ],
      "parallelizable_after": [
        "WorkspaceSnapshot v3 remains the only shared state contract; projects, tasks, ideas, and files continue to refe...

User request:
깃허브 같은거+업무 관리용 보드+아이디어 및 추후 진행 프로젝트 관리용 보드+구글 드라이브 느낌의 파일 정리를 생성해줘

https://github.com/Ahnd6474/Jakal-flow와 연동 되어야 하고
