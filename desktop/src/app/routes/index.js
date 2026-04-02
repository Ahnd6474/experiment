/**
 * Jakal Workspace is a local-first desktop shell. All feature slices read shared
 * data from WorkspaceSnapshot and perform writes only through WorkspaceRepository.
 * Top-level routes are projects, tasks, ideas, and files. Feature modules own
 * their UI and feature-local helpers, but shared entities may only reference each
 * other by ids through CrossLinkRefs.
 */
export const AppShellRoutes = Object.freeze([
  Object.freeze({
    key: "projects",
    label: "Projects",
    shortLabel: "Project hub",
    description:
      "GitHub-like delivery hub for repositories, milestones, and Jakal Flow sync health.",
    shellTitle: "Keep repository work anchored to the workspace graph.",
    shellHint:
      "Review active delivery, inspect linked ideas, and move into execution without leaving the shell.",
    accent: "#204262",
    path: "#/projects",
    nextRoutes: ["tasks", "ideas"],
  }),
  Object.freeze({
    key: "tasks",
    label: "Tasks",
    shortLabel: "Task board",
    description: "Execution board for active work, ownership, and next-up priorities.",
    shellTitle: "Move scoped work from planning into delivery.",
    shellHint:
      "Use the board to advance cards, rebalance ownership, and keep project work in motion.",
    accent: "#355437",
    path: "#/tasks",
    nextRoutes: ["projects", "files"],
  }),
  Object.freeze({
    key: "ideas",
    label: "Ideas",
    shortLabel: "Idea backlog",
    description: "Incubation space for future bets before they are promoted into tracked work.",
    shellTitle: "Shape future work before it becomes a project or task.",
    shellHint:
      "Use the backlog to compare concepts, inspect cross-links, and decide what should move forward.",
    accent: "#7c5120",
    path: "#/ideas",
    nextRoutes: ["projects", "tasks"],
  }),
  Object.freeze({
    key: "files",
    label: "Files",
    shortLabel: "File library",
    description: "Drive-style workspace library for briefs, specs, and supporting assets.",
    shellTitle: "Keep working documents attached to the same local-first workspace.",
    shellHint:
      "Browse root libraries, inspect linked documents, and keep project context attached to every file.",
    accent: "#5f3f62",
    path: "#/files",
    nextRoutes: ["projects", "ideas"],
  }),
]);

export const DEFAULT_APP_ROUTE = AppShellRoutes[0].key;

export function routeFromHash(hashValue) {
  const normalizedHash = (hashValue || "").replace(/^#\/?/, "");
  const matchedRoute = AppShellRoutes.find(
    (route) => route.key === normalizedHash,
  );

  return matchedRoute ? matchedRoute.key : DEFAULT_APP_ROUTE;
}
