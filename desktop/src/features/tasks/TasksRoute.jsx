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
};

export default function TasksRoute({ snapshot }) {
  const tasks = [...snapshot.tasks].sort((left, right) => left.order - right.order);
  const taskStatusOrder = snapshot.boards.tasks.statusOrder;

  return (
    <article style={styles.card}>
      <p style={styles.eyebrow}>Tasks</p>
      <h2 style={{ marginTop: 0 }}>Execution board</h2>
      <p>
        Task entities now carry stable status and order fields so the active
        work board can fan out without reopening the shared contract.
      </p>
      <p style={styles.meta}>
        Column order: <strong>{taskStatusOrder.join(" / ")}</strong>
      </p>
      <ul style={styles.list}>
        {tasks.map((task) => (
          <li key={task.id} style={styles.item}>
            <strong>{task.title}</strong>
            <div>{task.summary}</div>
            <div style={styles.meta}>
              {task.status} | order {task.order} | project {task.projectId ?? "none"}
            </div>
          </li>
        ))}
      </ul>
    </article>
  );
}
