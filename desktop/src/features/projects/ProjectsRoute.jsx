import React, { useEffect, useState } from "react";
import {
  selectIntegrationOverview,
  selectProjectBoard,
  selectWorkspaceOverview,
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
    display: "grid",
    gap: "20px",
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
  hero: {
    display: "grid",
    gap: "16px",
    gridTemplateColumns: "minmax(0, 1.7fr) minmax(280px, 1fr)",
  },
  heroCard: {
    padding: "20px",
    borderRadius: "18px",
    background: "linear-gradient(145deg, #102033 0%, #315170 100%)",
    color: "#f7fafc",
  },
  heroMeta: {
    color: "rgba(247, 250, 252, 0.76)",
    margin: "8px 0 0",
  },
  statGrid: {
    display: "grid",
    gap: "12px",
    gridTemplateColumns: "repeat(auto-fit, minmax(130px, 1fr))",
  },
  statCard: {
    padding: "16px",
    borderRadius: "16px",
    backgroundColor: "#f4f6f8",
    border: "1px solid rgba(93, 107, 121, 0.14)",
  },
  statNumber: {
    margin: "8px 0 0",
    fontSize: "30px",
    fontWeight: 700,
    color: "#102033",
  },
  shell: {
    display: "grid",
    gap: "20px",
    gridTemplateColumns: "minmax(0, 1.45fr) minmax(300px, 1fr)",
  },
  board: {
    display: "grid",
    gap: "16px",
  },
  lane: {
    padding: "18px",
    borderRadius: "18px",
    backgroundColor: "#f8fafb",
    border: "1px solid rgba(93, 107, 121, 0.14)",
  },
  laneHeader: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "baseline",
    gap: "12px",
    marginBottom: "14px",
  },
  laneTitle: {
    margin: 0,
    textTransform: "capitalize",
  },
  laneCount: {
    margin: 0,
    fontSize: "13px",
    color: "#5d6b79",
  },
  list: {
    display: "grid",
    gap: "12px",
    padding: 0,
    margin: 0,
    listStyle: "none",
  },
  item: {
    padding: "16px",
    borderRadius: "16px",
    backgroundColor: "#ffffff",
    border: "1px solid rgba(93, 107, 121, 0.14)",
  },
  itemHeader: {
    display: "flex",
    justifyContent: "space-between",
    gap: "12px",
    alignItems: "flex-start",
  },
  itemTitleButton: {
    padding: 0,
    border: 0,
    background: "none",
    color: "#102033",
    fontSize: "16px",
    fontWeight: 700,
    cursor: "pointer",
    textAlign: "left",
  },
  badgeRow: {
    display: "flex",
    flexWrap: "wrap",
    gap: "8px",
    marginTop: "10px",
  },
  badge: {
    padding: "5px 10px",
    borderRadius: "999px",
    backgroundColor: "#eef2f4",
    color: "#44515d",
    fontSize: "12px",
  },
  meta: {
    marginTop: "10px",
    color: "#44515d",
    fontSize: "14px",
  },
  sidePanel: {
    display: "grid",
    gap: "16px",
    alignContent: "start",
  },
  panelCard: {
    padding: "18px",
    borderRadius: "18px",
    backgroundColor: "#f8fafb",
    border: "1px solid rgba(93, 107, 121, 0.14)",
  },
  form: {
    display: "grid",
    gap: "10px",
  },
  label: {
    display: "grid",
    gap: "6px",
    fontSize: "13px",
    color: "#44515d",
  },
  input: {
    width: "100%",
    boxSizing: "border-box",
    padding: "11px 12px",
    borderRadius: "12px",
    border: "1px solid rgba(93, 107, 121, 0.22)",
    backgroundColor: "#ffffff",
    font: "inherit",
    color: "#102033",
  },
  textArea: {
    minHeight: "74px",
    resize: "vertical",
  },
  actionRow: {
    display: "flex",
    flexWrap: "wrap",
    gap: "10px",
  },
  primaryButton: {
    padding: "10px 14px",
    borderRadius: "12px",
    border: 0,
    backgroundColor: "#102033",
    color: "#f8fafb",
    font: "inherit",
    cursor: "pointer",
  },
  secondaryButton: {
    padding: "10px 14px",
    borderRadius: "12px",
    border: "1px solid rgba(93, 107, 121, 0.18)",
    backgroundColor: "#ffffff",
    color: "#102033",
    font: "inherit",
    cursor: "pointer",
  },
  relationList: {
    display: "grid",
    gap: "10px",
    padding: 0,
    margin: "12px 0 0",
    listStyle: "none",
  },
  relationItem: {
    padding: "12px 14px",
    borderRadius: "14px",
    backgroundColor: "#ffffff",
    border: "1px solid rgba(93, 107, 121, 0.14)",
  },
};

function formatStatusLabel(value) {
  return value.replace(/_/g, " ");
}

function formatTimestamp(value) {
  if (!value) {
    return "Not synced";
  }

  return new Date(value).toLocaleString();
}

export default function ProjectsRoute({ repository, snapshot }) {
  const board = selectProjectBoard(snapshot);
  const workspaceOverview = selectWorkspaceOverview(snapshot);
  const integrationOverview = selectIntegrationOverview(snapshot);
  const [selectedProjectId, setSelectedProjectId] = useState(
    board.groups.find((group) => group.items.length > 0)?.items[0]?.entity.id ?? null,
  );
  const [projectDraft, setProjectDraft] = useState({
    title: "",
    summary: "",
    status: board.statusOrder[0] ?? "planned",
  });
  const [taskDraft, setTaskDraft] = useState("");

  useEffect(() => {
    const selectedStillExists = board.groups.some((group) =>
      group.items.some((item) => item.entity.id === selectedProjectId),
    );

    if (!selectedStillExists) {
      setSelectedProjectId(
        board.groups.find((group) => group.items.length > 0)?.items[0]?.entity.id ?? null,
      );
    }
  }, [board.groups, selectedProjectId]);

  const selectedProject =
    board.groups.flatMap((group) => group.items).find((item) => item.entity.id === selectedProjectId) ??
    null;
  const activeProjects =
    board.groups.find((group) => group.key === "active")?.items.length ?? 0;
  const connectedProviders = integrationOverview.providers.filter(
    (provider) => provider.connectionStatus === "connected",
  ).length;

  function handleCreateProject(event) {
    event.preventDefault();

    if (!projectDraft.title.trim()) {
      return;
    }

    const nextSnapshot = repository.createProject({
      title: projectDraft.title,
      summary: projectDraft.summary,
      description: projectDraft.summary,
      status: projectDraft.status,
    });
    const nextProject = nextSnapshot.projects.at(-1);

    setProjectDraft({
      title: "",
      summary: "",
      status: board.statusOrder[0] ?? "planned",
    });
    setSelectedProjectId(nextProject?.id ?? null);
  }

  function handleCreateTask(event) {
    event.preventDefault();

    if (!selectedProject || !taskDraft.trim()) {
      return;
    }

    repository.createTask({
      title: taskDraft,
      summary: `Seeded from ${selectedProject.entity.title}.`,
      projectId: selectedProject.entity.id,
      status: "backlog",
    });
    setTaskDraft("");
  }

  return (
    <article style={styles.card}>
      <div style={styles.hero}>
        <section style={styles.heroCard}>
          <p style={styles.eyebrow}>Projects</p>
          <h2 style={{ margin: "4px 0 0" }}>GitHub-like project hub</h2>
          <p style={styles.heroMeta}>
            Repositories, delivery tracks, and linked workspace records stay on one frozen
            snapshot so planning and execution read the same graph.
          </p>
          <div style={styles.badgeRow}>
            {integrationOverview.providers.map((provider) => (
              <span key={provider.key} style={{ ...styles.badge, backgroundColor: "rgba(255,255,255,0.14)", color: "#f7fafc" }}>
                {provider.label} {provider.recordCount}
              </span>
            ))}
          </div>
        </section>

        <section style={styles.statGrid}>
          <div style={styles.statCard}>
            <p style={styles.eyebrow}>Tracked projects</p>
            <p style={styles.statNumber}>{workspaceOverview.totals.projects}</p>
          </div>
          <div style={styles.statCard}>
            <p style={styles.eyebrow}>Active delivery</p>
            <p style={styles.statNumber}>{activeProjects}</p>
          </div>
          <div style={styles.statCard}>
            <p style={styles.eyebrow}>Linked tasks</p>
            <p style={styles.statNumber}>{workspaceOverview.totals.tasks}</p>
          </div>
          <div style={styles.statCard}>
            <p style={styles.eyebrow}>Connected syncs</p>
            <p style={styles.statNumber}>{connectedProviders}</p>
          </div>
        </section>
      </div>

      <div style={styles.shell}>
        <section style={styles.board}>
          {board.groups.map((group) => (
            <section key={group.key} style={styles.lane}>
              <div style={styles.laneHeader}>
                <h3 style={styles.laneTitle}>{formatStatusLabel(group.key)}</h3>
                <p style={styles.laneCount}>{group.count} repositories</p>
              </div>

              <ul style={styles.list}>
                {group.items.map((item) => (
                  <li key={item.entity.id} style={styles.item}>
                    <div style={styles.itemHeader}>
                      <div>
                        <button
                          type="button"
                          style={styles.itemTitleButton}
                          onClick={() => setSelectedProjectId(item.entity.id)}
                        >
                          {item.entity.title}
                        </button>
                        <div style={styles.meta}>{item.entity.summary}</div>
                      </div>

                      <label style={styles.label}>
                        Status
                        <select
                          aria-label={`${item.entity.title} status`}
                          style={styles.input}
                          value={item.entity.status}
                          onChange={(event) =>
                            repository.moveProject(item.entity.id, {
                              status: event.target.value,
                            })
                          }
                        >
                          {board.statusOrder.map((status) => (
                            <option key={status} value={status}>
                              {formatStatusLabel(status)}
                            </option>
                          ))}
                        </select>
                      </label>
                    </div>

                    <div style={styles.badgeRow}>
                      <span style={styles.badge}>{item.related.tasks.length} open work items</span>
                      <span style={styles.badge}>{item.related.ideas.length} linked ideas</span>
                      <span style={styles.badge}>{item.related.files.length} files</span>
                      <span style={styles.badge}>
                        sync {formatStatusLabel(item.integration.status)}
                      </span>
                    </div>
                  </li>
                ))}
              </ul>
            </section>
          ))}
        </section>

        <aside style={styles.sidePanel}>
          <section style={styles.panelCard}>
            <p style={styles.eyebrow}>Quick create</p>
            <h3 style={{ margin: "4px 0 12px" }}>Add repository track</h3>
            <form style={styles.form} onSubmit={handleCreateProject}>
              <label style={styles.label}>
                Project title
                <input
                  style={styles.input}
                  value={projectDraft.title}
                  onChange={(event) =>
                    setProjectDraft((current) => ({
                      ...current,
                      title: event.target.value,
                    }))
                  }
                />
              </label>
              <label style={styles.label}>
                Summary
                <textarea
                  style={{ ...styles.input, ...styles.textArea }}
                  value={projectDraft.summary}
                  onChange={(event) =>
                    setProjectDraft((current) => ({
                      ...current,
                      summary: event.target.value,
                    }))
                  }
                />
              </label>
              <label style={styles.label}>
                Lane
                <select
                  style={styles.input}
                  value={projectDraft.status}
                  onChange={(event) =>
                    setProjectDraft((current) => ({
                      ...current,
                      status: event.target.value,
                    }))
                  }
                >
                  {board.statusOrder.map((status) => (
                    <option key={status} value={status}>
                      {formatStatusLabel(status)}
                    </option>
                  ))}
                </select>
              </label>
              <button type="submit" style={styles.primaryButton}>
                Create project
              </button>
            </form>
          </section>

          <section style={styles.panelCard}>
            <p style={styles.eyebrow}>Selected repository</p>
            <h3 style={{ margin: "4px 0 0" }}>
              {selectedProject?.entity.title ?? "Pick a project lane"}
            </h3>
            <p style={styles.meta}>
              {selectedProject?.entity.description ??
                "Open a project card to inspect linked tasks, ideas, files, and sync state."}
            </p>

            {selectedProject ? (
              <>
                <div style={styles.badgeRow}>
                  <span style={styles.badge}>
                    Updated {formatTimestamp(selectedProject.entity.updatedAt)}
                  </span>
                  <span style={styles.badge}>
                    {selectedProject.integration.recordCount} sync records
                  </span>
                </div>

                <form style={{ ...styles.form, marginTop: "14px" }} onSubmit={handleCreateTask}>
                  <label style={styles.label}>
                    Add task to {selectedProject.entity.title}
                    <input
                      style={styles.input}
                      value={taskDraft}
                      onChange={(event) => setTaskDraft(event.target.value)}
                    />
                  </label>
                  <div style={styles.actionRow}>
                    <button type="submit" style={styles.primaryButton}>
                      Create linked task
                    </button>
                    <button
                      type="button"
                      style={styles.secondaryButton}
                      onClick={() =>
                        repository.updateProject(selectedProject.entity.id, {
                          summary: `${selectedProject.entity.summary} Prioritized in project hub.`,
                        })
                      }
                    >
                      Mark as reviewed
                    </button>
                  </div>
                </form>

                <ul style={styles.relationList}>
                  {selectedProject.related.tasks.map((task) => (
                    <li key={task.id} style={styles.relationItem}>
                      <strong>{task.title}</strong>
                      <div style={styles.meta}>
                        {formatStatusLabel(task.status)} | {task.fileIds.length} files
                      </div>
                    </li>
                  ))}
                  {selectedProject.related.ideas.map((idea) => (
                    <li key={idea.id} style={styles.relationItem}>
                      <strong>{idea.title}</strong>
                      <div style={styles.meta}>
                        Idea lane {formatStatusLabel(idea.stage)}
                      </div>
                    </li>
                  ))}
                  {selectedProject.related.files.map((file) => (
                    <li key={file.id} style={styles.relationItem}>
                      <strong>{file.name}</strong>
                      <div style={styles.meta}>
                        {file.kind} asset linked into the workspace
                      </div>
                    </li>
                  ))}
                </ul>
              </>
            ) : null}
          </section>
        </aside>
      </div>
    </article>
  );
}
