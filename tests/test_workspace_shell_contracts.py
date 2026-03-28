import json
import subprocess
from pathlib import Path


REPO_ROOT = Path(__file__).resolve().parents[1]


def read_text(relative_path: str) -> str:
    return (REPO_ROOT / relative_path).read_text(encoding="utf-8")


def assert_contains(source: str, *expected_fragments: str) -> None:
    for fragment in expected_fragments:
        assert fragment in source


def run_node(script: str) -> str:
    completed = subprocess.run(
        ["node", "--input-type=module", "-e", script],
        cwd=REPO_ROOT,
        check=True,
        capture_output=True,
        text=True,
    )
    return completed.stdout.strip()


def test_desktop_package_freezes_react_entrypoint_metadata():
    package_json = json.loads(read_text("desktop/package.json"))

    assert package_json["name"] == "jakal-workspace-desktop"
    assert package_json["type"] == "module"
    assert package_json["devDependencies"]["vite"] == "8.0.3"
    assert package_json["dependencies"]["react"] == "18.2.0"
    assert package_json["dependencies"]["react-dom"] == "18.2.0"


def test_routes_contract_exposes_the_four_stable_shell_surfaces():
    routes_source = read_text("desktop/src/app/routes/index.js")

    assert_contains(
        routes_source,
        'key: "projects"',
        'key: "tasks"',
        'key: "ideas"',
        'key: "files"',
        "export const AppShellRoutes",
        "routeFromHash",
    )


def test_snapshot_contract_freezes_v2_entities_boards_and_hierarchy():
    contracts_source = read_text("desktop/src/shared/contracts/index.js")

    assert_contains(
        contracts_source,
        "WORKSPACE_STORAGE_VERSION = 2",
        "export const WorkspaceProject",
        "export const WorkspaceTask",
        "export const WorkspaceIdea",
        "export const WorkspaceFile",
        "boards:",
        "fileHierarchy:",
        "rootFileIds",
        "createWorkspaceProject",
        "normalizeWorkspaceSnapshotV2",
        '"file-shell-root"',
        '"file-shell-guide"',
    )


def test_repository_adapter_normalizes_v2_writes_and_shared_helpers():
    storage_source = read_text("desktop/src/shared/storage/workspaceRepository.js")

    assert_contains(
        storage_source,
        "export class WorkspaceRepository",
        "defaultWorkspaceMigrations",
        "normalizeWorkspaceSnapshotV2",
        "updateNavigation(routeKey)",
        "createProject(projectInput = {})",
        "replaceSnapshot(snapshot)",
    )


def test_app_shell_only_selects_route_entries_and_repository_boundary():
    app_source = read_text("desktop/src/App.jsx")
    main_source = read_text("desktop/src/main.jsx")

    assert_contains(
        main_source,
        "<App repository={workspaceRepository} />",
    )
    assert_contains(
        app_source,
        'import ProjectsRoute from "./features/projects/ProjectsRoute.jsx";',
        'import TasksRoute from "./features/tasks/TasksRoute.jsx";',
        'import IdeasRoute from "./features/ideas/IdeasRoute.jsx";',
        'import FilesRoute from "./features/files/FilesRoute.jsx";',
        "const routeEntries = Object.freeze({",
        "repository.updateNavigation(activeRoute)",
        "<ActiveRouteEntry repository={repository} snapshot={snapshot} />",
    )
    assert "activeRecords.map" not in app_source
    assert "repository.writeSnapshot" not in app_source


def test_surface_route_entry_modules_exist_with_frozen_contract_docstring():
    for relative_path in (
        "desktop/src/features/projects/ProjectsRoute.jsx",
        "desktop/src/features/tasks/TasksRoute.jsx",
        "desktop/src/features/ideas/IdeasRoute.jsx",
        "desktop/src/features/files/FilesRoute.jsx",
    ):
        source = read_text(relative_path)

        assert_contains(
            source,
            "AppShell owns only route selection, shell chrome, and shared repository wiring.",
            "Shared data lives in WorkspaceSnapshot v2",
            "export default function",
        )


def test_repository_runtime_persists_v2_snapshot_and_project_defaults():
    result = run_node(
        """
        import { createWorkspaceRepository } from "./desktop/src/shared/storage/workspaceRepository.js";

        const storage = {
          cache: new Map(),
          getItem(key) { return this.cache.has(key) ? this.cache.get(key) : null; },
          setItem(key, value) { this.cache.set(key, value); },
          removeItem(key) { this.cache.delete(key); },
        };

        const repository = createWorkspaceRepository({ storage });
        const seeded = repository.readSnapshot();
        const created = repository.createProject({
          title: "Second project",
          summary: "Added during runtime verification.",
        });
        const updated = repository.updateNavigation("files");
        const createdProject = created.projects.at(-1);

        console.log(JSON.stringify({
          seededSchemaVersion: seeded.meta.schemaVersion,
          seededProjectStatuses: seeded.boards.projects.statusOrder,
          seededTaskStatus: seeded.tasks[0].status,
          rootFileIds: seeded.fileHierarchy.rootFileIds,
          createdProjects: created.projects.length,
          createdProjectStatus: createdProject.status,
          createdProjectSlug: createdProject.slug,
          createdProjectTaskIds: createdProject.taskIds,
          updatedRoute: updated.navigation.lastRoute,
          storedSchemaVersion: JSON.parse(storage.getItem("jakal.workspace.snapshot")).meta.schemaVersion,
        }));
        """
    )
    payload = json.loads(result)

    assert payload == {
        "seededSchemaVersion": 2,
        "seededProjectStatuses": ["planned", "active", "paused", "done"],
        "seededTaskStatus": "in_progress",
        "rootFileIds": ["file-shell-root"],
        "createdProjects": 2,
        "createdProjectStatus": "planned",
        "createdProjectSlug": "second-project",
        "createdProjectTaskIds": [],
        "updatedRoute": "files",
        "storedSchemaVersion": 2,
    }


def test_repository_migrates_v1_snapshots_to_v2_shape():
    result = run_node(
        """
        import { createWorkspaceRepository } from "./desktop/src/shared/storage/workspaceRepository.js";

        const storage = {
          cache: new Map([
            ["jakal.workspace.snapshot", JSON.stringify({
              meta: {
                schemaVersion: 1,
                seededAt: "2026-03-28T00:00:00.000Z",
                updatedAt: "2026-03-28T00:00:00.000Z",
              },
              navigation: {
                lastRoute: "tasks",
              },
              projects: [
                {
                  id: "project-legacy",
                  title: "Legacy project",
                  summary: "Migrated from v1.",
                  links: {
                    taskIds: ["task-legacy"],
                    ideaIds: ["idea-legacy"],
                    fileIds: ["file-legacy"],
                  },
                },
              ],
              tasks: [
                {
                  id: "task-legacy",
                  title: "Legacy task",
                  summary: "Migrated from v1.",
                  links: {
                    projectIds: ["project-legacy"],
                    ideaIds: ["idea-legacy"],
                    fileIds: ["file-legacy"],
                  },
                },
              ],
              ideas: [
                {
                  id: "idea-legacy",
                  title: "Legacy idea",
                  summary: "Migrated from v1.",
                  links: {
                    projectIds: ["project-legacy"],
                    taskIds: ["task-legacy"],
                    fileIds: ["file-legacy"],
                  },
                },
              ],
              files: [
                {
                  id: "file-legacy",
                  title: "legacy.md",
                  summary: "Migrated from v1.",
                  links: {
                    projectIds: ["project-legacy"],
                    taskIds: ["task-legacy"],
                    ideaIds: ["idea-legacy"],
                  },
                },
              ],
            })],
          ]),
          getItem(key) { return this.cache.has(key) ? this.cache.get(key) : null; },
          setItem(key, value) { this.cache.set(key, value); },
          removeItem(key) { this.cache.delete(key); },
        };

        const repository = createWorkspaceRepository({ storage });
        const snapshot = repository.readSnapshot();

        console.log(JSON.stringify({
          schemaVersion: snapshot.meta.schemaVersion,
          route: snapshot.navigation.lastRoute,
          projectStatus: snapshot.projects[0].status,
          projectTaskIds: snapshot.projects[0].taskIds,
          taskProjectId: snapshot.tasks[0].projectId,
          taskOrder: snapshot.tasks[0].order,
          ideaStage: snapshot.ideas[0].stage,
          fileName: snapshot.files[0].name,
          rootFileIds: snapshot.fileHierarchy.rootFileIds,
        }));
        """
    )
    payload = json.loads(result)

    assert payload == {
        "schemaVersion": 2,
        "route": "tasks",
        "projectStatus": "planned",
        "projectTaskIds": ["task-legacy"],
        "taskProjectId": "project-legacy",
        "taskOrder": 0,
        "ideaStage": "captured",
        "fileName": "legacy.md",
        "rootFileIds": ["file-legacy"],
    }


def test_routes_and_html_entrypoint_match_the_shell_contract():
    result = run_node(
        """
        import { AppShellRoutes, routeFromHash } from "./desktop/src/app/routes/index.js";

        console.log(JSON.stringify({
          routeKeys: AppShellRoutes.map((route) => route.key),
          filesHash: routeFromHash("#/files"),
          fallbackHash: routeFromHash("#/missing"),
        }));
        """
    )
    payload = json.loads(result)
    index_html = read_text("desktop/index.html")

    assert payload == {
        "routeKeys": ["projects", "tasks", "ideas", "files"],
        "filesHash": "files",
        "fallbackHash": "projects",
    }
    assert '<div id="root"></div>' in index_html
    assert 'src="/src/main.jsx"' in index_html
