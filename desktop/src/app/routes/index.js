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
    surfaceKey: "projects",
    label: "Projects",
    shortLabel: "Project hub",
    description:
      "GitHub-like delivery hub for repositories, milestones, and Jakal Flow sync health.",
    shellTitle: "Keep repository work anchored to the workspace graph.",
    shellHint:
      "Review active delivery, inspect linked ideas, and move into execution without leaving the shell.",
    navigationHint: "Start here when you need repository context before acting on delivery work.",
    repositoryFocus: "Repository delivery and sync status",
    accent: "#204262",
    path: "#/projects",
    nextRoutes: ["tasks", "ideas"],
  }),
  Object.freeze({
    key: "tasks",
    surfaceKey: "tasks",
    label: "Tasks",
    shortLabel: "Task board",
    description: "Execution board for active work, ownership, and next-up priorities.",
    shellTitle: "Move scoped work from planning into delivery.",
    shellHint:
      "Use the board to advance cards, rebalance ownership, and keep project work in motion.",
    navigationHint: "Use this surface to turn repository scope into owned execution.",
    repositoryFocus: "Execution state linked back to Jakal Flow records",
    accent: "#355437",
    path: "#/tasks",
    nextRoutes: ["projects", "files"],
  }),
  Object.freeze({
    key: "ideas",
    surfaceKey: "ideas",
    label: "Ideas",
    shortLabel: "Idea backlog",
    description: "Incubation space for future bets before they are promoted into tracked work.",
    shellTitle: "Shape future work before it becomes a project or task.",
    shellHint:
      "Use the backlog to compare concepts, inspect cross-links, and decide what should move forward.",
    navigationHint: "Stay here when shaping upstream work before it becomes committed delivery.",
    repositoryFocus: "Future candidates that can graduate into repository-backed work",
    accent: "#7c5120",
    path: "#/ideas",
    nextRoutes: ["projects", "tasks"],
  }),
  Object.freeze({
    key: "files",
    surfaceKey: "files",
    label: "Files",
    shortLabel: "File library",
    description: "Drive-style workspace library for briefs, specs, and supporting assets.",
    shellTitle: "Keep working documents attached to the same local-first workspace.",
    shellHint:
      "Browse root libraries, inspect linked documents, and keep project context attached to every file.",
    navigationHint: "Use this surface when execution needs specs, briefs, or synced support material.",
    repositoryFocus: "Supporting documents tied to the Jakal Flow workspace",
    accent: "#5f3f62",
    path: "#/files",
    nextRoutes: ["projects", "ideas"],
  }),
]);

export const APP_SHELL_REPOSITORY = Object.freeze({
  label: "Jakal-flow repository",
  href: "https://github.com/Ahnd6474/Jakal-flow",
  shortHref: "github.com/Ahnd6474/Jakal-flow",
  description:
    "The upstream repository for the workflow model this desktop shell is organizing around.",
});

export const APP_SHELL_ROUTE_KEYS = Object.freeze(
  AppShellRoutes.map((route) => route.key),
);

export const DEFAULT_APP_ROUTE = APP_SHELL_ROUTE_KEYS[0];

export function getAppShellRoute(routeKey) {
  return AppShellRoutes.find((route) => route.key === routeKey) ?? null;
}

export function routeFromHash(hashValue) {
  const normalizedHash = (hashValue || "").replace(/^#\/?/, "");
  const matchedRoute = getAppShellRoute(normalizedHash);

  return matchedRoute ? matchedRoute.key : DEFAULT_APP_ROUTE;
}
