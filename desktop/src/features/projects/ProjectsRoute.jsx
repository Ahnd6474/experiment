import React from "react";
import {
  selectIntegrationOverview,
  selectProjectBoard,
} from "../../shared/selectors/index.js";

/**
 * AppShell owns only route selection, shell chrome, and shared repository wiring.
 * Each surface module owns its own UI state, selectors, and repository mutations.
 * Shared data lives in WorkspaceSnapshot v2, and surfaces may coordinate only
 * through frozen entity contracts and id-based cross-links, never by embedding
 * foreign records or writing around WorkspaceRepository.
 */

const styles = {
  card: {
    padding: "24px",
    borderRadius: "20px",
    backgroundColor: "#ffffff",
    border: "1px solid rgba(93, 107, 121, 0.14)",
    boxShadow: "0 12px 24px rgba(16, 32, 51, 0.06)",
  },
  eyebrow: {
    margin: 0,
    fontSize: "12px",
    letterSpacing: "0.18em",
    textTransform: "uppercase",
    color: "#5d6b79",
  },
  list: {
    display: "grid",
    gap: "12px",
    padding: 0,
    margin: "20px 0 0",
    listStyle: "none",
  },
  item: {
    padding: "14px 16px",
    borderRadius: "16px",
    backgroundColor: "#eef2f4",
  },
  meta: {
    marginTop: "8px",
    color: "#44515d",
    fontSize: "14px",
  },
  hero: {
    display: "grid",
    gap: "20px",
    padding: "24px",
    borderRadius: "24px",
    background:
      "linear-gradient(135deg, rgba(16, 32, 51, 0.98) 0%, rgba(34, 55, 74, 0.96) 58%, rgba(57, 79, 94, 0.92) 100%)",
    color: "#f8fafb",
  },
  heroTop: {
    display: "flex",
    flexWrap: "wrap",
    justifyContent: "space-between",
    gap: "16px",
    alignItems: "flex-start",
  },
  pillRow: {
    display: "flex",
    flexWrap: "wrap",
    gap: "8px",
  },
  pill: {
    padding: "6px 10px",
    borderRadius: "999px",
    border: "1px solid rgba(248, 250, 251, 0.16)",
    backgroundColor: "rgba(248, 250, 251, 0.08)",
    fontSize: "12px",
    letterSpacing: "0.04em",
    textTransform: "uppercase",
  },
  heroGrid: {
    display: "grid",
    gap: "12px",
    gridTemplateColumns: "repeat(auto-fit, minmax(140px, 1fr))",
  },
  heroStat: {
    padding: "14px 16px",
    borderRadius: "18px",
    backgroundColor: "rgba(248, 250, 251, 0.08)",
    border: "1px solid rgba(248, 250, 251, 0.12)",
  },
  statLabel: {
    margin: 0,
    fontSize: "12px",
    letterSpacing: "0.08em",
    textTransform: "uppercase",
    opacity: 0.78,
  },
  statValue: {
    margin: "6px 0 0",
    fontSize: "24px",
    fontWeight: 700,
    lineHeight: 1.1,
  },
  statNote: {
    margin: "4px 0 0",
    fontSize: "13px",
    opacity: 0.82,
  },
  section: {
    marginTop: "24px",
    display: "grid",
    gap: "16px",
  },
  sectionTitleRow: {
    display: "flex",
    flexWrap: "wrap",
    justifyContent: "space-between",
    gap: "12px",
    alignItems: "baseline",
  },
  sectionTitle: {
    margin: 0,
    fontSize: "22px",
  },
  sectionCaption: {
    margin: 0,
    color: "#5d6b79",
    fontSize: "14px",
  },
  board: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
    gap: "12px",
  },
  column: {
    padding: "16px",
    borderRadius: "18px",
    backgroundColor: "#f4f6f8",
    border: "1px solid rgba(93, 107, 121, 0.12)",
  },
  columnHeader: {
    display: "flex",
    justifyContent: "space-between",
    gap: "12px",
    alignItems: "baseline",
    marginBottom: "12px",
  },
  columnTitle: {
    margin: 0,
    fontSize: "16px",
    textTransform: "capitalize",
  },
  columnCount: {
    margin: 0,
    color: "#5d6b79",
    fontSize: "12px",
    letterSpacing: "0.08em",
    textTransform: "uppercase",
  },
  projectCard: {
    display: "grid",
    gap: "12px",
    padding: "16px",
    borderRadius: "16px",
    backgroundColor: "#ffffff",
    border: "1px solid rgba(93, 107, 121, 0.14)",
    boxShadow: "0 10px 20px rgba(16, 32, 51, 0.05)",
  },
  projectMeta: {
    display: "flex",
    flexWrap: "wrap",
    gap: "8px",
    color: "#44515d",
    fontSize: "13px",
  },
  metaBadge: {
    padding: "4px 8px",
    borderRadius: "999px",
    backgroundColor: "#eef2f4",
  },
  listCompact: {
    display: "grid",
    gap: "10px",
    padding: 0,
    margin: 0,
    listStyle: "none",
  },
  integrationGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))",
    gap: "12px",
  },
  integrationCard: {
    padding: "16px",
    borderRadius: "18px",
    backgroundColor: "#f8fafb",
    border: "1px solid rgba(93, 107, 121, 0.14)",
  },
  integrationStatus: {
    margin: "8px 0 0",
    fontSize: "13px",
    color: "#44515d",
  },
};

export default function ProjectsRoute({ snapshot }) {
  const projectBoard = selectProjectBoard(snapshot);
  const integrationOverview = selectIntegrationOverview(snapshot);
  const projects = snapshot.projects ?? [];
  const taskCount = snapshot.tasks?.length ?? 0;
  const ideaCount = snapshot.ideas?.length ?? 0;
  const fileCount = snapshot.files?.length ?? 0;
  const linkedTaskCount = projects.reduce(
    (count, project) => count + (project.taskIds?.length ?? 0),
    0,
  );
  const linkedIdeaCount = projects.reduce(
    (count, project) => count + (project.ideaIds?.length ?? 0),
    0,
  );
  const linkedFileCount = projects.reduce(
    (count, project) => count + (project.fileIds?.length ?? 0),
    0,
  );
  const activeProjectCount = projects.filter((project) => project.status === "active").length;
  const statusLabels = {
    planned: "Planning lane",
    active: "Active work",
    paused: "Paused",
    done: "Delivered",
  };

  function formatRecordSummary(records = {}) {
    const parts = Object.entries(records)
      .filter(([, value]) => value > 0)
      .map(([key, value]) => `${value} ${key}`);

    return parts.length > 0 ? parts.join(" | ") : "No linked records";
  }

  return (
    <article style={styles.card}>
      <section style={styles.hero}>
        <div style={styles.heroTop}>
          <div>
            <p style={{ ...styles.eyebrow, color: "rgba(248, 250, 251, 0.76)" }}>
              Projects
            </p>
            <h2 style={{ marginTop: "8px", marginBottom: "8px", fontSize: "30px" }}>
              Repository and delivery hub
            </h2>
            <p style={{ margin: 0, maxWidth: "760px", color: "rgba(248, 250, 251, 0.84)" }}>
              A GitHub-like workspace home for repository-style work, with
              project cards, linked tasks and files, and sync state surfaced
              directly from the local snapshot.
            </p>
          </div>
          <div style={styles.pillRow}>
            <span style={styles.pill}>
              {(snapshot.boards?.projects?.statusOrder ?? []).join(" / ")}
            </span>
            <span style={styles.pill}>{projects.length} projects</span>
            <span style={styles.pill}>{integrationOverview.providers.length} integrations</span>
          </div>
        </div>

        <div style={styles.heroGrid}>
          <div style={styles.heroStat}>
            <p style={styles.statLabel}>Projects</p>
            <p style={styles.statValue}>{projects.length}</p>
            <p style={styles.statNote}>{activeProjectCount} active in the main lane</p>
          </div>
          <div style={styles.heroStat}>
            <p style={styles.statLabel}>Linked work</p>
            <p style={styles.statValue}>{linkedTaskCount}</p>
            <p style={styles.statNote}>{linkedIdeaCount} ideas and {linkedFileCount} files</p>
          </div>
          <div style={styles.heroStat}>
            <p style={styles.statLabel}>Workspace graph</p>
            <p style={styles.statValue}>{taskCount + ideaCount + fileCount}</p>
            <p style={styles.statNote}>Shared records beyond the project surface</p>
          </div>
          <div style={styles.heroStat}>
            <p style={styles.statLabel}>Sync state</p>
            <p style={styles.statValue}>
              {integrationOverview.providers.filter((provider) => provider.connectionStatus === "connected").length}
            </p>
            <p style={styles.statNote}>Connected providers in the repository</p>
          </div>
        </div>
      </section>

      <section style={styles.section}>
        <div style={styles.sectionTitleRow}>
          <div>
            <h3 style={styles.sectionTitle}>Project board</h3>
            <p style={styles.sectionCaption}>
              Projects are grouped by the frozen board order and rendered like
              repository cards instead of a generic list.
            </p>
          </div>
          <p style={styles.sectionCaption}>
            Current route: <strong>projects</strong>
          </p>
        </div>

        <div style={styles.board}>
          {projectBoard.groups.map((group) => (
            <section key={group.key} style={styles.column}>
              <div style={styles.columnHeader}>
                <h4 style={styles.columnTitle}>{statusLabels[group.key] ?? group.key}</h4>
                <p style={styles.columnCount}>{group.count} projects</p>
              </div>
              <ul style={styles.listCompact}>
                {group.items.map((projectDetail) => {
                  const { entity: project, related, integration } = projectDetail;

                  return (
                    <li key={project.id} style={styles.projectCard}>
                      <div>
                        <strong>{project.title}</strong>
                        <div style={styles.meta}>{project.slug}</div>
                      </div>
                      <div>{project.description}</div>
                      <div style={styles.projectMeta}>
                        <span style={styles.metaBadge}>{project.status}</span>
                        <span style={styles.metaBadge}>{related.tasks.length} tasks</span>
                        <span style={styles.metaBadge}>{related.ideas.length} ideas</span>
                        <span style={styles.metaBadge}>{related.files.length} files</span>
                      </div>
                      <div style={styles.integrationStatus}>
                        Sync {integration.status} | {formatRecordSummary(integration.statusCounts)}
                      </div>
                    </li>
                  );
                })}
              </ul>
            </section>
          ))}
        </div>
      </section>

      <section style={styles.section}>
        <div style={styles.sectionTitleRow}>
          <div>
            <h3 style={styles.sectionTitle}>Repository links</h3>
            <p style={styles.sectionCaption}>
              The project hub keeps cross-route references visible without
              requiring edits to the other surfaces.
            </p>
          </div>
        </div>

        <div style={styles.integrationGrid}>
          {integrationOverview.providers.map((provider) => (
            <section key={provider.key} style={styles.integrationCard}>
              <p style={styles.eyebrow}>{provider.label}</p>
              <h4 style={{ marginTop: "8px", marginBottom: "8px" }}>
                {provider.provider === "github"
                  ? `${provider.countsByEntity.project ?? 0} project links`
                  : `${provider.countsByEntity.task ?? 0} task links`}
              </h4>
              <p style={{ margin: 0 }}>
                Connection: <strong>{provider.connectionStatus}</strong>
              </p>
              <p style={styles.integrationStatus}>
                Synced {provider.syncedAt ?? "not yet"} | {provider.recordCount} records
              </p>
              <div style={styles.projectMeta}>
                {Object.entries(provider.countsByEntity).map(([entityType, count]) => (
                  <span key={entityType} style={styles.metaBadge}>
                    {count} {entityType}
                  </span>
                ))}
              </div>
            </section>
          ))}
        </div>
      </section>
    </article>
  );
}
