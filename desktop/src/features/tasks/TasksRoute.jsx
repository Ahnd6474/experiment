import React, { useState } from "react";
import {
  selectTaskBoard,
  selectWorkspaceOverview,
  selectWorkspaceReferenceLists,
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
    gap: "12px",
  },
  boardWrap: {
    display: "grid",
    gap: "16px",
    gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
    alignItems: "start",
  },
  column: {
    display: "grid",
    gap: "12px",
    padding: "16px",
    borderRadius: "18px",
    backgroundColor: "#f8fafb",
    border: "1px solid rgba(93, 107, 121, 0.14)",
    minHeight: "240px",
  },
  columnHeader: {
    display: "flex",
    justifyContent: "space-between",
    gap: "12px",
    alignItems: "baseline",
  },
  columnTitle: {
    margin: 0,
    textTransform: "capitalize",
    fontSize: "18px",
  },
  list: {
    display: "grid",
    gap: "12px",
    padding: 0,
    margin: 0,
    listStyle: "none",
  },
  item: {
    display: "grid",
    gap: "10px",
    padding: "14px",
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
  title: {
    margin: 0,
    fontSize: "16px",
  },
  meta: {
    color: "#44515d",
    fontSize: "14px",
  },
  badgeRow: {
    display: "flex",
    flexWrap: "wrap",
    gap: "8px",
  },
  badge: {
    padding: "5px 10px",
    borderRadius: "999px",
    backgroundColor: "#eef2f4",
    color: "#44515d",
    fontSize: "12px",
  },
  toolbar: {
    display: "grid",
    gap: "14px",
    gridTemplateColumns: "minmax(0, 1.4fr) minmax(280px, 1fr)",
  },
  panel: {
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
  actionRow: {
    display: "flex",
    flexWrap: "wrap",
    gap: "8px",
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
  metricGrid: {
    display: "grid",
    gap: "12px",
    gridTemplateColumns: "repeat(auto-fit, minmax(140px, 1fr))",
    marginTop: "4px",
  },
  metricCard: {
    padding: "14px",
    borderRadius: "14px",
    backgroundColor: "#ffffff",
    border: "1px solid rgba(93, 107, 121, 0.14)",
  },
  metricNumber: {
    margin: "8px 0 0",
    fontSize: "28px",
    fontWeight: 700,
    color: "#102033",
  },
};

function formatStatusLabel(value) {
  return value.replace(/_/g, " ");
}

function projectLabel(taskItem) {
  return taskItem.related.projects[0]?.title ?? "Unassigned project";
}

export default function TasksRoute({ repository, snapshot }) {
  const board = selectTaskBoard(snapshot);
  const workspaceOverview = selectWorkspaceOverview(snapshot);
  const references = selectWorkspaceReferenceLists(snapshot);
  const [taskDraft, setTaskDraft] = useState({
    title: "",
    summary: "",
    status: board.statusOrder[0] ?? "backlog",
    projectId: references.projects[0]?.id ?? "",
  });

  const inProgressCount =
    board.groups.find((group) => group.key === "in_progress")?.items.length ?? 0;
  const readyCount =
    board.groups.find((group) => group.key === "ready")?.items.length ?? 0;

  function handleCreateTask(event) {
    event.preventDefault();

    if (!taskDraft.title.trim()) {
      return;
    }

    repository.createTask({
      title: taskDraft.title,
      summary: taskDraft.summary,
      status: taskDraft.status,
      projectId: taskDraft.projectId || null,
    });
    setTaskDraft({
      title: "",
      summary: "",
      status: board.statusOrder[0] ?? "backlog",
      projectId: taskDraft.projectId,
    });
  }

  return (
    <article style={styles.card}>
      <section style={styles.hero}>
        <p style={styles.eyebrow}>Tasks</p>
        <h2 style={{ margin: 0 }}>Active work board</h2>
        <p style={{ margin: 0, color: "#44515d" }}>
          Delivery lanes, project ownership, and linked files stay inside the shared
          snapshot so execution can move without reopening the contract.
        </p>
        <div style={styles.metricGrid}>
          <div style={styles.metricCard}>
            <p style={styles.eyebrow}>Total tasks</p>
            <p style={styles.metricNumber}>{workspaceOverview.totals.tasks}</p>
          </div>
          <div style={styles.metricCard}>
            <p style={styles.eyebrow}>Ready next</p>
            <p style={styles.metricNumber}>{readyCount}</p>
          </div>
          <div style={styles.metricCard}>
            <p style={styles.eyebrow}>In progress</p>
            <p style={styles.metricNumber}>{inProgressCount}</p>
          </div>
          <div style={styles.metricCard}>
            <p style={styles.eyebrow}>Linked projects</p>
            <p style={styles.metricNumber}>{workspaceOverview.totals.projects}</p>
          </div>
        </div>
      </section>

      <section style={styles.toolbar}>
        <div style={styles.panel}>
          <p style={styles.eyebrow}>Quick add</p>
          <h3 style={{ margin: "4px 0 12px" }}>Seed a board card</h3>
          <form style={styles.form} onSubmit={handleCreateTask}>
            <label style={styles.label}>
              Task title
              <input
                style={styles.input}
                value={taskDraft.title}
                onChange={(event) =>
                  setTaskDraft((current) => ({
                    ...current,
                    title: event.target.value,
                  }))
                }
              />
            </label>
            <label style={styles.label}>
              Summary
              <input
                style={styles.input}
                value={taskDraft.summary}
                onChange={(event) =>
                  setTaskDraft((current) => ({
                    ...current,
                    summary: event.target.value,
                  }))
                }
              />
            </label>
            <div style={styles.actionRow}>
              <label style={{ ...styles.label, flex: "1 1 150px" }}>
                Lane
                <select
                  style={styles.input}
                  value={taskDraft.status}
                  onChange={(event) =>
                    setTaskDraft((current) => ({
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
              <label style={{ ...styles.label, flex: "1 1 180px" }}>
                Project link
                <select
                  style={styles.input}
                  value={taskDraft.projectId}
                  onChange={(event) =>
                    setTaskDraft((current) => ({
                      ...current,
                      projectId: event.target.value,
                    }))
                  }
                >
                  <option value="">No project</option>
                  {references.projects.map((project) => (
                    <option key={project.id} value={project.id}>
                      {project.label}
                    </option>
                  ))}
                </select>
              </label>
            </div>
            <button type="submit" style={styles.primaryButton}>
              Create task
            </button>
          </form>
        </div>

        <div style={styles.panel}>
          <p style={styles.eyebrow}>Board rules</p>
          <h3 style={{ margin: "4px 0 12px" }}>Column order</h3>
          <div style={styles.badgeRow}>
            {board.statusOrder.map((status) => (
              <span key={status} style={styles.badge}>
                {formatStatusLabel(status)}
              </span>
            ))}
          </div>
          <p style={{ margin: "14px 0 0", color: "#44515d" }}>
            Each card can be reassigned to a new lane or project directly from the board.
          </p>
        </div>
      </section>

      <section style={styles.boardWrap}>
        {board.groups.map((group) => (
          <section key={group.key} style={styles.column}>
            <div style={styles.columnHeader}>
              <h3 style={styles.columnTitle}>{formatStatusLabel(group.key)}</h3>
              <span style={styles.meta}>{group.count} cards</span>
            </div>

            <ul style={styles.list}>
              {group.items.map((item, index) => (
                <li key={item.entity.id} style={styles.item}>
                  <div style={styles.itemHeader}>
                    <div>
                      <h4 style={styles.title}>{item.entity.title}</h4>
                      <div style={styles.meta}>{item.entity.summary}</div>
                    </div>
                    <span style={styles.badge}>#{index + 1}</span>
                  </div>

                  <div style={styles.badgeRow}>
                    <span style={styles.badge}>{projectLabel(item)}</span>
                    <span style={styles.badge}>{item.related.files.length} files</span>
                    <span style={styles.badge}>
                      sync {formatStatusLabel(item.integration.status)}
                    </span>
                  </div>

                  <label style={styles.label}>
                    Move lane
                    <select
                      aria-label={`${item.entity.title} lane`}
                      style={styles.input}
                      value={item.entity.status}
                      onChange={(event) =>
                        repository.moveTask(item.entity.id, {
                          status: event.target.value,
                          index: 0,
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

                  <label style={styles.label}>
                    Reassign project
                    <select
                      aria-label={`${item.entity.title} project`}
                      style={styles.input}
                      value={item.entity.projectId ?? ""}
                      onChange={(event) =>
                        repository.moveTask(item.entity.id, {
                          projectId: event.target.value || null,
                        })
                      }
                    >
                      <option value="">No project</option>
                      {references.projects.map((project) => (
                        <option key={project.id} value={project.id}>
                          {project.label}
                        </option>
                      ))}
                    </select>
                  </label>

                  <div style={styles.actionRow}>
                    <button
                      type="button"
                      style={styles.secondaryButton}
                      onClick={() =>
                        repository.updateTask(item.entity.id, {
                          summary: `${item.entity.summary} Updated from board review.`,
                        })
                      }
                    >
                      Add review note
                    </button>
                    <button
                      type="button"
                      style={styles.primaryButton}
                      onClick={() =>
                        repository.moveTask(item.entity.id, {
                          status:
                            board.statusOrder[
                              Math.min(
                                board.statusOrder.indexOf(item.entity.status) + 1,
                                board.statusOrder.length - 1,
                              )
                            ],
                          index: 0,
                        })
                      }
                    >
                      Advance card
                    </button>
                  </div>
                </li>
              ))}
            </ul>
          </section>
        ))}
      </section>
    </article>
  );
}
