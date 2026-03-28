/**
 * Jakal Workspace is a local-first desktop shell. All feature slices read shared
 * data from WorkspaceSnapshot v2 and perform writes only through
 * WorkspaceRepository. Top-level routes are projects, tasks, ideas, and files.
 * Feature modules own their UI and feature-local helpers, but shared entities
 * may only reference each other by ids.
 */
export const WORKSPACE_STORAGE_KEY = "jakal.workspace.snapshot";
export const WORKSPACE_STORAGE_VERSION = 2;

export const WorkspaceRouteKeys = Object.freeze([
  "projects",
  "tasks",
  "ideas",
  "files",
]);

export const ProjectStatusOrder = Object.freeze([
  "planned",
  "active",
  "paused",
  "done",
]);

export const TaskStatusOrder = Object.freeze([
  "backlog",
  "ready",
  "in_progress",
  "done",
]);

export const IdeaStageOrder = Object.freeze([
  "captured",
  "shaping",
  "validated",
  "promoted",
]);

export const FileKinds = Object.freeze(["folder", "document", "asset"]);

export const CrossLinkRefs = Object.freeze({
  projectId: "string | null",
  projectIds: "string[]",
  taskId: "string | null",
  taskIds: "string[]",
  ideaId: "string | null",
  ideaIds: "string[]",
  fileId: "string | null",
  fileIds: "string[]",
  parentId: "string | null",
  childIds: "string[]",
});

export const WorkspaceProject = Object.freeze({
  id: "string",
  slug: "string",
  title: "string",
  summary: "string",
  description: "string",
  status: ProjectStatusOrder.join(" | "),
  taskIds: CrossLinkRefs.taskIds,
  ideaIds: CrossLinkRefs.ideaIds,
  fileIds: CrossLinkRefs.fileIds,
  createdAt: "ISO-8601 string",
  updatedAt: "ISO-8601 string",
});

export const WorkspaceTask = Object.freeze({
  id: "string",
  projectId: CrossLinkRefs.projectId,
  ideaId: CrossLinkRefs.ideaId,
  title: "string",
  summary: "string",
  status: TaskStatusOrder.join(" | "),
  order: "number",
  fileIds: CrossLinkRefs.fileIds,
  createdAt: "ISO-8601 string",
  updatedAt: "ISO-8601 string",
});

export const WorkspaceIdea = Object.freeze({
  id: "string",
  title: "string",
  summary: "string",
  stage: IdeaStageOrder.join(" | "),
  projectIds: CrossLinkRefs.projectIds,
  taskIds: CrossLinkRefs.taskIds,
  fileIds: CrossLinkRefs.fileIds,
  promotedProjectId: CrossLinkRefs.projectId,
  createdAt: "ISO-8601 string",
  updatedAt: "ISO-8601 string",
});

export const WorkspaceFile = Object.freeze({
  id: "string",
  name: "string",
  summary: "string",
  kind: FileKinds.join(" | "),
  extension: "string",
  parentId: CrossLinkRefs.parentId,
  childIds: CrossLinkRefs.childIds,
  projectIds: CrossLinkRefs.projectIds,
  taskIds: CrossLinkRefs.taskIds,
  ideaIds: CrossLinkRefs.ideaIds,
  createdAt: "ISO-8601 string",
  updatedAt: "ISO-8601 string",
});

export const WorkspaceSnapshot = Object.freeze({
  meta: Object.freeze({
    schemaVersion: "number",
    seededAt: "ISO-8601 string",
    updatedAt: "ISO-8601 string",
  }),
  navigation: Object.freeze({
    lastRoute: WorkspaceRouteKeys.join(" | "),
  }),
  boards: Object.freeze({
    projects: Object.freeze({
      statusOrder: "WorkspaceProject.status[]",
    }),
    tasks: Object.freeze({
      statusOrder: "WorkspaceTask.status[]",
    }),
    ideas: Object.freeze({
      stageOrder: "WorkspaceIdea.stage[]",
    }),
  }),
  fileHierarchy: Object.freeze({
    rootFileIds: CrossLinkRefs.fileIds,
  }),
  projects: "WorkspaceProject[]",
  tasks: "WorkspaceTask[]",
  ideas: "WorkspaceIdea[]",
  files: "WorkspaceFile[]",
});

let entityCounter = 0;

function createEntityId(prefix) {
  entityCounter += 1;
  return `${prefix}-${Date.now()}-${entityCounter}`;
}

function normalizeText(value, fallback = "") {
  return typeof value === "string" ? value.trim() || fallback : fallback;
}

function normalizeOptionalId(value) {
  const normalizedValue = normalizeText(value);
  return normalizedValue || null;
}

function normalizeIdArray(value) {
  if (!Array.isArray(value)) {
    return [];
  }

  return [...new Set(value.map((entry) => normalizeText(entry)).filter(Boolean))];
}

function normalizeTimestamp(value, fallback) {
  return normalizeText(value, fallback);
}

function normalizeChoice(value, allowedValues, fallback) {
  return allowedValues.includes(value) ? value : fallback;
}

function normalizeOrder(value, fallback) {
  return Number.isFinite(value) ? value : fallback;
}

function toSlug(value) {
  return normalizeText(value, "project")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "") || "project";
}

function normalizeRouteKey(value) {
  return WorkspaceRouteKeys.includes(value) ? value : WorkspaceRouteKeys[0];
}

function firstId(value) {
  return normalizeIdArray(value)[0] ?? null;
}

function createWorkspaceBoards() {
  return {
    projects: {
      statusOrder: [...ProjectStatusOrder],
    },
    tasks: {
      statusOrder: [...TaskStatusOrder],
    },
    ideas: {
      stageOrder: [...IdeaStageOrder],
    },
  };
}

export function createWorkspaceProject(project = {}, options = {}) {
  const now = options.now ?? new Date().toISOString();
  const title = normalizeText(project.title, "Untitled project");
  const createdAt = normalizeTimestamp(project.createdAt, now);

  return {
    id: normalizeText(project.id, createEntityId("project")),
    slug: normalizeText(project.slug, toSlug(title)),
    title,
    summary: normalizeText(project.summary),
    description: normalizeText(project.description, normalizeText(project.summary)),
    status: normalizeChoice(
      project.status,
      ProjectStatusOrder,
      ProjectStatusOrder[0],
    ),
    taskIds: normalizeIdArray(project.taskIds),
    ideaIds: normalizeIdArray(project.ideaIds),
    fileIds: normalizeIdArray(project.fileIds),
    createdAt,
    updatedAt: normalizeTimestamp(project.updatedAt, createdAt),
  };
}

function createWorkspaceTask(task = {}, options = {}) {
  const now = options.now ?? new Date().toISOString();
  const createdAt = normalizeTimestamp(task.createdAt, now);

  return {
    id: normalizeText(task.id, createEntityId("task")),
    projectId: normalizeOptionalId(task.projectId),
    ideaId: normalizeOptionalId(task.ideaId),
    title: normalizeText(task.title, "Untitled task"),
    summary: normalizeText(task.summary),
    status: normalizeChoice(task.status, TaskStatusOrder, TaskStatusOrder[0]),
    order: normalizeOrder(task.order, options.fallbackOrder ?? 0),
    fileIds: normalizeIdArray(task.fileIds),
    createdAt,
    updatedAt: normalizeTimestamp(task.updatedAt, createdAt),
  };
}

function createWorkspaceIdea(idea = {}, options = {}) {
  const now = options.now ?? new Date().toISOString();
  const createdAt = normalizeTimestamp(idea.createdAt, now);

  return {
    id: normalizeText(idea.id, createEntityId("idea")),
    title: normalizeText(idea.title, "Untitled idea"),
    summary: normalizeText(idea.summary),
    stage: normalizeChoice(idea.stage, IdeaStageOrder, IdeaStageOrder[0]),
    projectIds: normalizeIdArray(idea.projectIds),
    taskIds: normalizeIdArray(idea.taskIds),
    fileIds: normalizeIdArray(idea.fileIds),
    promotedProjectId: normalizeOptionalId(idea.promotedProjectId),
    createdAt,
    updatedAt: normalizeTimestamp(idea.updatedAt, createdAt),
  };
}

function createWorkspaceFile(file = {}, options = {}) {
  const now = options.now ?? new Date().toISOString();
  const createdAt = normalizeTimestamp(file.createdAt, now);
  const kind = normalizeChoice(file.kind, FileKinds, options.defaultKind ?? "document");
  const name = normalizeText(file.name, "untitled");

  return {
    id: normalizeText(file.id, createEntityId("file")),
    name,
    summary: normalizeText(file.summary),
    kind,
    extension:
      kind === "folder"
        ? ""
        : normalizeText(file.extension, name.includes(".") ? name.split(".").pop() : ""),
    parentId: normalizeOptionalId(file.parentId),
    childIds: normalizeIdArray(file.childIds),
    projectIds: normalizeIdArray(file.projectIds),
    taskIds: normalizeIdArray(file.taskIds),
    ideaIds: normalizeIdArray(file.ideaIds),
    createdAt,
    updatedAt: normalizeTimestamp(file.updatedAt, createdAt),
  };
}

function normalizeProject(project = {}, index, now) {
  return createWorkspaceProject(
    {
      ...project,
      taskIds: project.taskIds ?? project.links?.taskIds,
      ideaIds: project.ideaIds ?? project.links?.ideaIds,
      fileIds: project.fileIds ?? project.links?.fileIds,
      id: project.id ?? `project-${index + 1}`,
      description: project.description ?? project.summary,
    },
    { now },
  );
}

function normalizeTask(task = {}, index, now) {
  return createWorkspaceTask(
    {
      ...task,
      projectId: task.projectId ?? firstId(task.projectIds ?? task.links?.projectIds),
      ideaId: task.ideaId ?? firstId(task.ideaIds ?? task.links?.ideaIds),
      fileIds: task.fileIds ?? task.links?.fileIds,
      id: task.id ?? `task-${index + 1}`,
    },
    { now, fallbackOrder: index },
  );
}

function normalizeIdea(idea = {}, index, now) {
  return createWorkspaceIdea(
    {
      ...idea,
      projectIds: idea.projectIds ?? idea.links?.projectIds,
      taskIds: idea.taskIds ?? idea.links?.taskIds,
      fileIds: idea.fileIds ?? idea.links?.fileIds,
      promotedProjectId:
        idea.promotedProjectId ??
        firstId(idea.promotedProjectIds ?? idea.links?.promotedProjectIds),
      id: idea.id ?? `idea-${index + 1}`,
    },
    { now },
  );
}

function normalizeFile(file = {}, index, now) {
  return createWorkspaceFile(
    {
      ...file,
      name: file.name ?? file.title,
      projectIds: file.projectIds ?? file.links?.projectIds,
      taskIds: file.taskIds ?? file.links?.taskIds,
      ideaIds: file.ideaIds ?? file.links?.ideaIds,
      id: file.id ?? `file-${index + 1}`,
    },
    { now, defaultKind: "document" },
  );
}

function finalizeFileHierarchy(files, rootFileIds) {
  const fileLookup = new Map(
    files.map((file) => [
      file.id,
      {
        ...file,
        childIds: [...file.childIds],
      },
    ]),
  );

  fileLookup.forEach((file) => {
    if (!file.parentId) {
      return;
    }

    const parentFile = fileLookup.get(file.parentId);
    if (!parentFile) {
      file.parentId = null;
      return;
    }

    if (!parentFile.childIds.includes(file.id)) {
      parentFile.childIds.push(file.id);
    }
  });

  const normalizedFiles = [...fileLookup.values()].map((file) => ({
    ...file,
    childIds: normalizeIdArray(file.childIds),
  }));
  const fileIds = new Set(normalizedFiles.map((file) => file.id));
  const normalizedRootFileIds = normalizeIdArray(rootFileIds).filter((id) =>
    fileIds.has(id),
  );

  return {
    files: normalizedFiles,
    rootFileIds:
      normalizedRootFileIds.length > 0
        ? normalizedRootFileIds
        : normalizedFiles.filter((file) => !file.parentId).map((file) => file.id),
  };
}

export function normalizeWorkspaceSnapshotV2(snapshot = {}) {
  const now = new Date().toISOString();
  const projects = Array.isArray(snapshot.projects)
    ? snapshot.projects.map((project, index) => normalizeProject(project, index, now))
    : [];
  const tasks = Array.isArray(snapshot.tasks)
    ? snapshot.tasks.map((task, index) => normalizeTask(task, index, now))
    : [];
  const ideas = Array.isArray(snapshot.ideas)
    ? snapshot.ideas.map((idea, index) => normalizeIdea(idea, index, now))
    : [];
  const normalizedFiles = Array.isArray(snapshot.files)
    ? snapshot.files.map((file, index) => normalizeFile(file, index, now))
    : [];
  const fileHierarchy = finalizeFileHierarchy(
    normalizedFiles,
    snapshot.fileHierarchy?.rootFileIds,
  );
  const seededAt = normalizeTimestamp(snapshot.meta?.seededAt, now);
  const updatedAt = normalizeTimestamp(snapshot.meta?.updatedAt, seededAt);

  return {
    meta: {
      schemaVersion: WORKSPACE_STORAGE_VERSION,
      seededAt,
      updatedAt,
    },
    navigation: {
      lastRoute: normalizeRouteKey(snapshot.navigation?.lastRoute),
    },
    boards: createWorkspaceBoards(),
    fileHierarchy: {
      rootFileIds: fileHierarchy.rootFileIds,
    },
    projects,
    tasks,
    ideas,
    files: fileHierarchy.files,
  };
}

export function createSeedWorkspaceSnapshot() {
  const now = new Date().toISOString();
  const rootFolderId = "file-shell-root";
  const guideFileId = "file-shell-guide";

  return {
    meta: {
      schemaVersion: WORKSPACE_STORAGE_VERSION,
      seededAt: now,
      updatedAt: now,
    },
    navigation: {
      lastRoute: "projects",
    },
    boards: createWorkspaceBoards(),
    fileHierarchy: {
      rootFileIds: [rootFolderId],
    },
    projects: [
      createWorkspaceProject(
        {
          id: "project-shell",
          slug: "workspace-shell",
          title: "Workspace shell",
          summary: "Stable desktop shell and route contracts for downstream slices.",
          description:
            "Route modules fan out from the shell while shared records stay frozen in WorkspaceSnapshot v2.",
          status: "active",
          taskIds: ["task-shell"],
          ideaIds: ["idea-shell"],
          fileIds: [rootFolderId, guideFileId],
        },
        { now },
      ),
    ],
    tasks: [
      createWorkspaceTask(
        {
          id: "task-shell",
          projectId: "project-shell",
          ideaId: "idea-shell",
          title: "Freeze repository boundary",
          summary: "All shared writes are routed through WorkspaceRepository.",
          status: "in_progress",
          order: 0,
          fileIds: [guideFileId],
        },
        { now },
      ),
    ],
    ideas: [
      createWorkspaceIdea(
        {
          id: "idea-shell",
          title: "Feature slice backlog",
          summary:
            "Parallel features plug into the shell without redefining snapshot shape.",
          stage: "shaping",
          projectIds: ["project-shell"],
          taskIds: ["task-shell"],
          fileIds: [guideFileId],
        },
        { now },
      ),
    ],
    files: [
      createWorkspaceFile(
        {
          id: rootFolderId,
          name: "workspace",
          summary: "Top-level file hierarchy root for the seeded shell.",
          kind: "folder",
          childIds: [guideFileId],
          projectIds: ["project-shell"],
        },
        { now, defaultKind: "folder" },
      ),
      createWorkspaceFile(
        {
          id: guideFileId,
          name: "workspace-overview.md",
          summary:
            "Shared contracts and route structure are frozen before feature work lands.",
          kind: "document",
          extension: "md",
          parentId: rootFolderId,
          projectIds: ["project-shell"],
          taskIds: ["task-shell"],
          ideaIds: ["idea-shell"],
        },
        { now, defaultKind: "document" },
      ),
    ],
  };
}
