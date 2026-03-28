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

export default function ProjectsRoute({ snapshot }) {
  const projects = snapshot.projects;
  const projectStatusOrder = snapshot.boards.projects.statusOrder;

  return (
    <article style={styles.card}>
      <p style={styles.eyebrow}>Projects</p>
      <h2 style={{ marginTop: 0 }}>Repository and delivery hub</h2>
      <p>
        Shared project creation defaults are frozen in the repository and the
        v2 snapshot exposes id-only links into tasks, ideas, and files.
      </p>
      <p style={styles.meta}>
        Status board: <strong>{projectStatusOrder.join(" / ")}</strong>
      </p>
      <ul style={styles.list}>
        {projects.map((project) => (
          <li key={project.id} style={styles.item}>
            <strong>{project.title}</strong>
            <div>{project.summary}</div>
            <div style={styles.meta}>
              {project.status} | {project.taskIds.length} tasks |{" "}
              {project.ideaIds.length} ideas | {project.fileIds.length} files
            </div>
          </li>
        ))}
      </ul>
    </article>
  );
}
