import React from "react";

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
  header: {
    display: "grid",
    gap: "12px",
    marginBottom: "24px",
  },
  eyebrow: {
    margin: 0,
    fontSize: "12px",
    letterSpacing: "0.18em",
    textTransform: "uppercase",
    color: "#5d6b79",
  },
  title: {
    margin: 0,
    fontSize: "28px",
    lineHeight: 1.1,
  },
  subtitle: {
    margin: 0,
    maxWidth: "760px",
    color: "#44515d",
  },
  summaryGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(160px, 1fr))",
    gap: "12px",
    marginBottom: "24px",
  },
  summaryCard: {
    padding: "16px",
    borderRadius: "16px",
    backgroundColor: "#f4f6f8",
    border: "1px solid rgba(93, 107, 121, 0.12)",
  },
  summaryLabel: {
    margin: 0,
    fontSize: "12px",
    letterSpacing: "0.14em",
    textTransform: "uppercase",
    color: "#5d6b79",
  },
  summaryValue: {
    margin: "8px 0 0",
    fontSize: "28px",
    lineHeight: 1,
    fontWeight: 700,
  },
  summaryNote: {
    margin: "8px 0 0",
    color: "#44515d",
    fontSize: "13px",
  },
  board: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
    gap: "14px",
  },
  column: {
    display: "grid",
    alignContent: "start",
    gap: "12px",
    padding: "16px",
    borderRadius: "18px",
    backgroundColor: "#f8fafb",
    border: "1px solid rgba(93, 107, 121, 0.14)",
  },
  columnHeader: {
    display: "flex",
    alignItems: "baseline",
    justifyContent: "space-between",
    gap: "12px",
  },
  columnTitle: {
    margin: 0,
    fontSize: "16px",
  },
  columnCount: {
    fontSize: "13px",
    color: "#5d6b79",
  },
  taskList: {
    display: "grid",
    gap: "10px",
    padding: 0,
    margin: 0,
    listStyle: "none",
  },
  taskCard: {
    display: "grid",
    gap: "8px",
    padding: "14px",
    borderRadius: "14px",
    backgroundColor: "#ffffff",
    border: "1px solid rgba(93, 107, 121, 0.12)",
    boxShadow: "0 6px 18px rgba(16, 32, 51, 0.05)",
  },
  taskTitleRow: {
    display: "flex",
    alignItems: "flex-start",
    justifyContent: "space-between",
    gap: "12px",
  },
  taskTitle: {
    margin: 0,
    fontSize: "15px",
    lineHeight: 1.25,
  },
  taskIndex: {
    flexShrink: 0,
    padding: "4px 8px",
    borderRadius: "999px",
    backgroundColor: "#eef2f4",
    color: "#44515d",
    fontSize: "12px",
  },
  taskSummary: {
    margin: 0,
    color: "#44515d",
    fontSize: "14px",
  },
  taskMeta: {
    display: "flex",
    flexWrap: "wrap",
    gap: "8px",
    alignItems: "center",
    color: "#5d6b79",
    fontSize: "12px",
  },
  pill: {
    display: "inline-flex",
    alignItems: "center",
    padding: "4px 8px",
    borderRadius: "999px",
    backgroundColor: "#eef2f4",
  },
  emptyState: {
    padding: "14px",
    borderRadius: "14px",
    border: "1px dashed rgba(93, 107, 121, 0.24)",
    color: "#5d6b79",
    backgroundColor: "rgba(255, 255, 255, 0.7)",
  },
};

function formatStatusLabel(status) {
  return status
    .split("_")
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");
}

function groupTasksByStatus(tasks, statusOrder) {
  const groupedTasks = new Map(statusOrder.map((status) => [status, []]));

  tasks.forEach((task) => {
    if (!groupedTasks.has(task.status)) {
      groupedTasks.set(task.status, []);
    }

    groupedTasks.get(task.status).push(task);
  });

  return groupedTasks;
}

export default function TasksRoute({ snapshot }) {
  const projectTitleById = new Map(
    snapshot.projects.map((project) => [project.id, project.title]),
  );
  const tasks = [...snapshot.tasks].sort((left, right) => {
    const statusOrder = snapshot.boards.tasks.statusOrder;
    const leftStatusIndex = statusOrder.indexOf(left.status);
    const rightStatusIndex = statusOrder.indexOf(right.status);

    if (leftStatusIndex !== rightStatusIndex) {
      return leftStatusIndex - rightStatusIndex;
    }

    if (left.order !== right.order) {
      return left.order - right.order;
    }

    return left.title.localeCompare(right.title);
  });
  const taskStatusOrder = snapshot.boards.tasks.statusOrder;
  const groupedTasks = groupTasksByStatus(tasks, taskStatusOrder);
  const activeTaskCount = tasks.filter((task) => task.status !== "done").length;

  return (
    <article style={styles.card}>
      <header style={styles.header}>
        <p style={styles.eyebrow}>Tasks</p>
        <h2 style={styles.title}>Execution board</h2>
        <p style={styles.subtitle}>
          Work stays organized around the frozen task board order so the route
          can support active execution, review queues, and finished work without
          depending on any shared contract changes.
        </p>
      </header>

      <section aria-label="Task board summary" style={styles.summaryGrid}>
        <div style={styles.summaryCard}>
          <p style={styles.summaryLabel}>Total tasks</p>
          <p style={styles.summaryValue}>{tasks.length}</p>
          <p style={styles.summaryNote}>Ordered by status and local board index.</p>
        </div>
        <div style={styles.summaryCard}>
          <p style={styles.summaryLabel}>Active work</p>
          <p style={styles.summaryValue}>{activeTaskCount}</p>
          <p style={styles.summaryNote}>Backlog, ready, and in-progress items.</p>
        </div>
        <div style={styles.summaryCard}>
          <p style={styles.summaryLabel}>Board lanes</p>
          <p style={styles.summaryValue}>{taskStatusOrder.length}</p>
          <p style={styles.summaryNote}>{taskStatusOrder.join(" / ")}</p>
        </div>
      </section>

      <section aria-label="Task board" style={styles.board}>
        {taskStatusOrder.map((status) => {
          const statusTasks = groupedTasks.get(status) ?? [];

          return (
            <section key={status} aria-label={`${formatStatusLabel(status)} tasks`} style={styles.column}>
              <div style={styles.columnHeader}>
                <h3 style={styles.columnTitle}>{formatStatusLabel(status)}</h3>
                <span style={styles.columnCount}>{statusTasks.length} items</span>
              </div>

              <ul style={styles.taskList}>
                {statusTasks.length === 0 ? (
                  <li style={styles.emptyState}>
                    Nothing is parked here yet. Move a task into this lane to keep
                    the board flowing.
                  </li>
                ) : (
                  statusTasks.map((task) => (
                    <li key={task.id} style={styles.taskCard}>
                      <div style={styles.taskTitleRow}>
                        <h4 style={styles.taskTitle}>{task.title}</h4>
                        <span style={styles.taskIndex}>#{task.order + 1}</span>
                      </div>
                      <p style={styles.taskSummary}>{task.summary}</p>
                      <div style={styles.taskMeta}>
                        <span style={styles.pill}>
                          Project: {projectTitleById.get(task.projectId) ?? "Unassigned"}
                        </span>
                        <span style={styles.pill}>Task ID: {task.id}</span>
                        {task.ideaId ? (
                          <span style={styles.pill}>Idea-linked</span>
                        ) : null}
                      </div>
                    </li>
                  ))
                )}
              </ul>
            </section>
          );
        })}
      </section>
    </article>
  );
}
