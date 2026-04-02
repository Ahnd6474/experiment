import React, { useEffect, useState, useSyncExternalStore } from "react";
import {
  AppShellRoutes,
  DEFAULT_APP_ROUTE,
  routeFromHash,
} from "./app/routes/index.js";
import ProjectsRoute from "./features/projects/ProjectsRoute.jsx";
import TasksRoute from "./features/tasks/TasksRoute.jsx";
import IdeasRoute from "./features/ideas/IdeasRoute.jsx";
import FilesRoute from "./features/files/FilesRoute.jsx";
import {
  selectIntegrationOverview,
  selectWorkspaceOverview,
  selectWorkspaceSurface,
} from "./shared/selectors/index.js";

const routeEntries = Object.freeze({
  projects: ProjectsRoute,
  tasks: TasksRoute,
  ideas: IdeasRoute,
  files: FilesRoute,
});

const shellStyles = {
  app: {
    minHeight: "100vh",
    margin: 0,
    padding: "28px",
    background:
      "radial-gradient(circle at top left, rgba(255, 249, 234, 0.95) 0%, rgba(231, 237, 242, 0.92) 42%, rgba(217, 228, 236, 1) 100%)",
    color: "#102033",
    fontFamily: '"Segoe UI", sans-serif',
  },
  frame: {
    maxWidth: "1240px",
    margin: "0 auto",
    padding: "28px",
    borderRadius: "28px",
    backgroundColor: "rgba(255, 255, 255, 0.78)",
    boxShadow: "0 18px 52px rgba(16, 32, 51, 0.12)",
    backdropFilter: "blur(12px)",
  },
  header: {
    display: "grid",
    gap: "18px",
    marginBottom: "28px",
  },
  hero: {
    display: "grid",
    gap: "18px",
    gridTemplateColumns: "minmax(0, 1.65fr) minmax(300px, 1fr)",
    alignItems: "start",
  },
  heroCard: {
    padding: "22px 24px",
    borderRadius: "24px",
    background: "linear-gradient(145deg, #102033 0%, #2e5878 100%)",
    color: "#f7fafc",
  },
  heroStats: {
    display: "grid",
    gap: "12px",
    gridTemplateColumns: "repeat(auto-fit, minmax(150px, 1fr))",
  },
  eyebrow: {
    margin: 0,
    fontSize: "12px",
    letterSpacing: "0.18em",
    textTransform: "uppercase",
    color: "#5d6b79",
  },
  heroEyebrow: {
    margin: 0,
    fontSize: "12px",
    letterSpacing: "0.18em",
    textTransform: "uppercase",
    color: "rgba(247, 250, 252, 0.72)",
  },
  title: {
    margin: "6px 0 0",
    fontSize: "38px",
    lineHeight: 1.05,
  },
  subtitle: {
    margin: "12px 0 0",
    maxWidth: "760px",
    color: "rgba(247, 250, 252, 0.8)",
    lineHeight: 1.6,
  },
  nav: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(210px, 1fr))",
    gap: "14px",
    marginBottom: "24px",
  },
  navLink: {
    display: "grid",
    gap: "12px",
    padding: "18px",
    borderRadius: "20px",
    border: "1px solid rgba(93, 107, 121, 0.16)",
    backgroundColor: "#f8fafb",
    color: "inherit",
    textDecoration: "none",
    boxShadow: "0 10px 24px rgba(16, 32, 51, 0.05)",
  },
  navLinkActive: {
    color: "#f8fafb",
    borderColor: "transparent",
    boxShadow: "0 14px 30px rgba(16, 32, 51, 0.18)",
  },
  label: {
    fontSize: "18px",
    fontWeight: 700,
  },
  routeMeta: {
    display: "grid",
    gap: "6px",
  },
  caption: {
    margin: 0,
    fontSize: "13px",
    opacity: 0.84,
    lineHeight: 1.5,
  },
  statRow: {
    display: "flex",
    flexWrap: "wrap",
    gap: "8px",
  },
  pill: {
    padding: "6px 10px",
    borderRadius: "999px",
    fontSize: "12px",
    fontWeight: 600,
    backgroundColor: "rgba(16, 32, 51, 0.08)",
    color: "inherit",
  },
  heroPill: {
    backgroundColor: "rgba(247, 250, 252, 0.14)",
  },
  metricCard: {
    padding: "18px",
    borderRadius: "20px",
    backgroundColor: "#f7fafb",
    border: "1px solid rgba(93, 107, 121, 0.14)",
  },
  metricNumber: {
    margin: "8px 0 0",
    fontSize: "32px",
    fontWeight: 700,
    color: "#102033",
  },
  panel: {
    display: "grid",
    gap: "22px",
    gridTemplateColumns: "minmax(0, 2fr) minmax(320px, 1fr)",
    alignItems: "start",
  },
  stage: {
    display: "grid",
    gap: "16px",
  },
  contextGrid: {
    display: "grid",
    gap: "16px",
    gridTemplateColumns: "minmax(0, 1.2fr) minmax(260px, 0.8fr)",
  },
  statsCard: {
    padding: "22px",
    borderRadius: "22px",
    backgroundColor: "#f4f6f8",
    border: "1px solid rgba(93, 107, 121, 0.14)",
  },
  summaryTitle: {
    margin: "4px 0 0",
    fontSize: "24px",
    lineHeight: 1.2,
  },
  summaryBody: {
    margin: "12px 0 0",
    color: "#44515d",
    lineHeight: 1.6,
  },
  list: {
    display: "grid",
    gap: "10px",
    padding: 0,
    margin: "16px 0 0",
    listStyle: "none",
  },
  listItem: {
    padding: "12px 14px",
    borderRadius: "16px",
    backgroundColor: "#ffffff",
    border: "1px solid rgba(93, 107, 121, 0.14)",
  },
  listLabel: {
    fontSize: "13px",
    color: "#5d6b79",
  },
  listValue: {
    margin: "4px 0 0",
    fontSize: "15px",
    fontWeight: 600,
  },
  linkList: {
    display: "grid",
    gap: "10px",
    padding: 0,
    margin: "14px 0 0",
    listStyle: "none",
  },
  routeButton: {
    display: "block",
    padding: "12px 14px",
    borderRadius: "16px",
    textDecoration: "none",
    color: "#102033",
    backgroundColor: "#ffffff",
    border: "1px solid rgba(93, 107, 121, 0.14)",
  },
};

function useWorkspaceSnapshot(repository) {
  return useSyncExternalStore(
    (listener) => repository.subscribe(listener),
    () => repository.readSnapshot(),
    () => repository.readSnapshot(),
  );
}

function readCurrentRoute() {
  if (typeof window === "undefined") {
    return DEFAULT_APP_ROUTE;
  }

  return routeFromHash(window.location.hash);
}

function routeCollection(snapshot) {
  return {
    projects: snapshot.projects ?? [],
    tasks: snapshot.tasks ?? [],
    ideas: snapshot.ideas ?? [],
    files: snapshot.files ?? [],
  };
}

function summarizeSurfaceStructure(surface) {
  if (!surface) {
    return {
      primaryCount: 0,
      secondaryCount: 0,
      primaryLabel: "records",
      secondaryLabel: "groups",
    };
  }

  if (surface.board) {
    return {
      primaryCount: surface.itemCount,
      secondaryCount: surface.board.groups.length,
      primaryLabel: "records",
      secondaryLabel: "lanes",
    };
  }

  if (surface.tree) {
    return {
      primaryCount: surface.itemCount,
      secondaryCount: surface.tree.roots.length,
      primaryLabel: "records",
      secondaryLabel: "root folders",
    };
  }

  return {
    primaryCount: surface.itemCount ?? 0,
    secondaryCount: 0,
    primaryLabel: "records",
    secondaryLabel: "groups",
  };
}

function resolveNextRoutes(activeRoute) {
  const currentRoute =
    AppShellRoutes.find((route) => route.key === activeRoute) ?? AppShellRoutes[0];

  return currentRoute.nextRoutes
    .map((routeKey) => AppShellRoutes.find((route) => route.key === routeKey))
    .filter(Boolean);
}

export default function App({ repository }) {
  const snapshot = useWorkspaceSnapshot(repository);
  const [activeRoute, setActiveRoute] = useState(readCurrentRoute);
  const collections = routeCollection(snapshot);
  const workspaceOverview = selectWorkspaceOverview(snapshot);
  const integrationOverview = selectIntegrationOverview(snapshot);
  const activeSurface = selectWorkspaceSurface(snapshot, activeRoute);
  const activeSurfaceRoute =
    AppShellRoutes.find((route) => route.key === activeRoute) ?? AppShellRoutes[0];
  const relatedRoutes = resolveNextRoutes(activeRoute);
  const ActiveRouteEntry = routeEntries[activeRoute] ?? routeEntries[DEFAULT_APP_ROUTE];
  const activeCount = collections[activeRoute]?.length ?? 0;
  const activeStructure = summarizeSurfaceStructure(activeSurface);
  const connectedProviders = integrationOverview.providers.filter(
    (provider) => provider.connectionStatus === "connected",
  ).length;

  useEffect(() => {
    if (typeof window === "undefined") {
      return undefined;
    }

    const handleHashChange = () => {
      setActiveRoute(readCurrentRoute());
    };

    window.addEventListener("hashchange", handleHashChange);
    handleHashChange();

    return () => {
      window.removeEventListener("hashchange", handleHashChange);
    };
  }, []);

  useEffect(() => {
    repository.updateNavigation(activeRoute);
  }, [activeRoute, repository]);

  return (
    <main style={shellStyles.app}>
      <div style={shellStyles.frame}>
        <header style={shellStyles.header}>
          <section style={shellStyles.hero}>
            <div style={shellStyles.heroCard}>
              <p style={shellStyles.heroEyebrow}>Jakal Workspace Companion</p>
              <h1 style={shellStyles.title}>One desktop flow for Jakal Flow work</h1>
              <p style={shellStyles.subtitle}>
                Projects, active tasks, future ideas, and files now share one
                top-level workspace shell so the desktop companion feels like one
                product instead of four isolated routes.
              </p>
              <div style={shellStyles.statRow}>
                <span style={{ ...shellStyles.pill, ...shellStyles.heroPill }}>
                  last route {workspaceOverview.lastRoute}
                </span>
                <span style={{ ...shellStyles.pill, ...shellStyles.heroPill }}>
                  {connectedProviders} connected providers
                </span>
                <span style={{ ...shellStyles.pill, ...shellStyles.heroPill }}>
                  {workspaceOverview.totals.projects +
                    workspaceOverview.totals.tasks +
                    workspaceOverview.totals.ideas +
                    workspaceOverview.totals.files}{" "}
                  total records
                </span>
              </div>
            </div>

            <section style={shellStyles.heroStats}>
              <div style={shellStyles.metricCard}>
                <p style={shellStyles.eyebrow}>Projects</p>
                <p style={shellStyles.metricNumber}>{workspaceOverview.totals.projects}</p>
              </div>
              <div style={shellStyles.metricCard}>
                <p style={shellStyles.eyebrow}>Tasks</p>
                <p style={shellStyles.metricNumber}>{workspaceOverview.totals.tasks}</p>
              </div>
              <div style={shellStyles.metricCard}>
                <p style={shellStyles.eyebrow}>Ideas</p>
                <p style={shellStyles.metricNumber}>{workspaceOverview.totals.ideas}</p>
              </div>
              <div style={shellStyles.metricCard}>
                <p style={shellStyles.eyebrow}>Files</p>
                <p style={shellStyles.metricNumber}>{workspaceOverview.totals.files}</p>
              </div>
            </section>
          </section>
        </header>

        <nav aria-label="Workspace areas" style={shellStyles.nav}>
          {AppShellRoutes.map((route) => {
            const isActive = route.key === activeRoute;
            const overviewEntry =
              workspaceOverview.routes.find((entry) => entry.key === route.key) ?? null;

            return (
              <a
                key={route.key}
                href={route.path}
                style={{
                  ...shellStyles.navLink,
                  ...(isActive
                    ? {
                        ...shellStyles.navLinkActive,
                        backgroundColor: route.accent,
                      }
                    : null),
                }}
              >
                <div style={shellStyles.routeMeta}>
                  <span style={shellStyles.label}>{route.label}</span>
                  <span style={shellStyles.caption}>{route.shortLabel}</span>
                </div>
                <p style={shellStyles.caption}>{route.description}</p>
                <div style={shellStyles.statRow}>
                  <span style={shellStyles.pill}>
                    {overviewEntry?.itemCount ?? 0} items
                  </span>
                  <span style={shellStyles.pill}>
                    {overviewEntry?.integrationCount ?? 0} sync links
                  </span>
                </div>
              </a>
            );
          })}
        </nav>

        <section style={shellStyles.panel}>
          <div style={shellStyles.stage}>
            <section style={shellStyles.contextGrid}>
              <article style={shellStyles.statsCard}>
                <p style={shellStyles.eyebrow}>Current workspace surface</p>
                <h2 style={shellStyles.summaryTitle}>{activeSurfaceRoute.shellTitle}</h2>
                <p style={shellStyles.summaryBody}>{activeSurfaceRoute.shellHint}</p>
                <div style={shellStyles.statRow}>
                  <span style={shellStyles.pill}>
                    {activeStructure.primaryCount} {activeStructure.primaryLabel}
                  </span>
                  <span style={shellStyles.pill}>
                    {activeStructure.secondaryCount} {activeStructure.secondaryLabel}
                  </span>
                  <span style={shellStyles.pill}>{activeCount} seeded on route</span>
                </div>
              </article>

              <aside style={shellStyles.statsCard}>
                <p style={shellStyles.eyebrow}>Workspace flow</p>
                <h2 style={{ margin: "4px 0 0" }}>Continue the companion loop</h2>
                <p style={shellStyles.summaryBody}>
                  Every surface reads the same `WorkspaceRepository` snapshot, so
                  moving between plan, execution, incubation, and files keeps the
                  same records in view.
                </p>
                <ul style={shellStyles.linkList}>
                  {relatedRoutes.map((route) => (
                    <li key={route.key}>
                      <a href={route.path} style={shellStyles.routeButton}>
                        <strong>{route.label}</strong>
                        <p style={{ ...shellStyles.caption, margin: "6px 0 0" }}>
                          {route.shortLabel}
                        </p>
                      </a>
                    </li>
                  ))}
                </ul>
              </aside>
            </section>

            <ActiveRouteEntry repository={repository} snapshot={snapshot} />
          </div>

          <aside style={shellStyles.statsCard}>
            <p style={shellStyles.eyebrow}>Repository boundary</p>
            <h2 style={{ marginTop: 0 }}>WorkspaceRepository</h2>
            <p style={shellStyles.summaryBody}>
              AppShell owns navigation, route framing, and cross-surface
              workspace context. Feature routes render the detailed experiences
              while shared writes stay inside the same repository boundary.
            </p>

            <ul style={shellStyles.list}>
              <li style={shellStyles.listItem}>
                <p style={shellStyles.listLabel}>Active route</p>
                <p style={shellStyles.listValue}>{activeRoute}</p>
              </li>
              <li style={shellStyles.listItem}>
                <p style={shellStyles.listLabel}>Connected providers</p>
                <p style={shellStyles.listValue}>
                  {connectedProviders} of {integrationOverview.providers.length}
                </p>
              </li>
              <li style={shellStyles.listItem}>
                <p style={shellStyles.listLabel}>Workspace records</p>
                <p style={shellStyles.listValue}>
                  {workspaceOverview.totals.projects +
                    workspaceOverview.totals.tasks +
                    workspaceOverview.totals.ideas +
                    workspaceOverview.totals.files}
                </p>
              </li>
            </ul>
          </aside>
        </section>
      </div>
    </main>
  );
}
