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
  childList: {
    display: "grid",
    gap: "6px",
    padding: 0,
    margin: "10px 0 0",
    listStyle: "none",
  },
  child: {
    padding: "10px 12px",
    borderRadius: "12px",
    backgroundColor: "#ffffff",
    border: "1px solid rgba(93, 107, 121, 0.14)",
  },
  meta: {
    marginTop: "8px",
    color: "#44515d",
    fontSize: "14px",
  },
};

export default function FilesRoute({ snapshot }) {
  const filesById = new Map(snapshot.files.map((file) => [file.id, file]));
  const rootFiles = snapshot.fileHierarchy.rootFileIds
    .map((fileId) => filesById.get(fileId))
    .filter(Boolean);

  return (
    <article style={styles.card}>
      <p style={styles.eyebrow}>Files</p>
      <h2 style={{ marginTop: 0 }}>Local file organizer</h2>
      <p>
        File hierarchy primitives are frozen with root ids, parent ids, and
        child ids so drive-like navigation can expand behind this route entry.
      </p>
      <p style={styles.meta}>
        Root nodes: <strong>{snapshot.fileHierarchy.rootFileIds.length}</strong>
      </p>
      <ul style={styles.list}>
        {rootFiles.map((file) => (
          <li key={file.id} style={styles.item}>
            <strong>{file.name}</strong>
            <div>{file.summary}</div>
            <div style={styles.meta}>
              {file.kind} | {file.childIds.length} children | {file.projectIds.length} linked
              projects
            </div>
            <ul style={styles.childList}>
              {file.childIds.map((childId) => {
                const child = filesById.get(childId);

                if (!child) {
                  return null;
                }

                return (
                  <li key={child.id} style={styles.child}>
                    <strong>{child.name}</strong>
                    <div>{child.summary}</div>
                  </li>
                );
              })}
            </ul>
          </li>
        ))}
      </ul>
    </article>
  );
}
