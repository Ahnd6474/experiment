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
    gap: "10px",
    marginBottom: "20px",
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
  },
  subtitle: {
    margin: 0,
    color: "#44515d",
  },
  metrics: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(150px, 1fr))",
    gap: "12px",
    marginTop: "18px",
  },
  metricCard: {
    padding: "14px 16px",
    borderRadius: "16px",
    backgroundColor: "#eef4f7",
    border: "1px solid rgba(93, 107, 121, 0.12)",
  },
  metricValue: {
    margin: "6px 0 0",
    fontSize: "28px",
    fontWeight: 700,
    lineHeight: 1,
  },
  metricLabel: {
    margin: 0,
    fontSize: "13px",
    color: "#5d6b79",
  },
  section: {
    marginTop: "24px",
  },
  sectionTitle: {
    margin: "0 0 12px",
    fontSize: "17px",
  },
  boardGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
    gap: "12px",
  },
  boardCard: {
    padding: "16px",
    borderRadius: "18px",
    backgroundColor: "#f5f8fa",
    border: "1px solid rgba(93, 107, 121, 0.12)",
  },
  boardHeader: {
    display: "flex",
    alignItems: "baseline",
    justifyContent: "space-between",
    gap: "12px",
    marginBottom: "10px",
  },
  boardCount: {
    fontSize: "12px",
    color: "#5d6b79",
  },
  fileTree: {
    display: "grid",
    gap: "8px",
    marginTop: "10px",
    paddingLeft: "18px",
  },
  treeItem: {
    padding: "8px 10px",
    borderRadius: "12px",
    backgroundColor: "#ffffff",
    border: "1px solid rgba(93, 107, 121, 0.12)",
  },
  meta: {
    marginTop: "8px",
    color: "#44515d",
    fontSize: "14px",
  },
  quickAccess: {
    display: "grid",
    gap: "10px",
    marginTop: "24px",
    padding: "18px 20px",
    borderRadius: "18px",
    background: "linear-gradient(135deg, #eef4f7 0%, #f8fafb 100%)",
    border: "1px solid rgba(93, 107, 121, 0.12)",
  },
  quickList: {
    display: "grid",
    gap: "8px",
    margin: "0",
    paddingLeft: "20px",
  },
  pillRow: {
    display: "flex",
    flexWrap: "wrap",
    gap: "6px",
    marginTop: "10px",
  },
  pill: {
    padding: "4px 8px",
    borderRadius: "999px",
    backgroundColor: "#eef2f4",
    color: "#44515d",
    fontSize: "12px",
  },
};

function sortFiles(files) {
  return [...files].sort((left, right) => {
    const updatedDelta =
      new Date(right.updatedAt).getTime() - new Date(left.updatedAt).getTime();

    if (updatedDelta !== 0) {
      return updatedDelta;
    }

    return left.name.localeCompare(right.name);
  });
}

function formatFilePath(file, filesById) {
  const path = [file.name];
  let current = file;

  while (current.parentId) {
    const parent = filesById.get(current.parentId);

    if (!parent) {
      break;
    }

    path.unshift(parent.name);
    current = parent;
  }

  return path.join(" / ");
}

function getFileLabel(file) {
  if (file.kind === "folder") {
    return "folder";
  }

  if (file.extension) {
    return file.extension;
  }

  return file.kind;
}

function renderChildren(file, filesById, depth = 0) {
  return file.childIds
    .map((childId) => filesById.get(childId))
    .filter(Boolean)
    .map((child) => (
      <div key={child.id} style={{ marginLeft: `${depth * 12}px` }}>
        <div style={styles.treeItem}>
          <strong>{child.name}</strong>
          <div>{child.summary}</div>
          <div style={styles.meta}>
            {getFileLabel(child)} | {child.childIds.length} children |{" "}
            {child.projectIds.length} linked projects
          </div>
          {child.childIds.length > 0 ? (
            <div style={styles.fileTree}>{renderChildren(child, filesById, depth + 1)}</div>
          ) : null}
        </div>
      </div>
    ));
}

export default function FilesRoute({ snapshot }) {
  const filesById = new Map(snapshot.files.map((file) => [file.id, file]));
  const rootFiles = snapshot.fileHierarchy.rootFileIds
    .map((fileId) => filesById.get(fileId))
    .filter(Boolean);
  const sortedFiles = sortFiles(snapshot.files);
  const folderCount = snapshot.files.filter((file) => file.kind === "folder").length;
  const documentCount = snapshot.files.filter((file) => file.kind === "document").length;
  const assetCount = snapshot.files.filter((file) => file.kind === "asset").length;

  return (
    <article style={styles.card}>
      <header style={styles.header}>
        <p style={styles.eyebrow}>Files</p>
        <h2 style={styles.title}>Drive-style file organization</h2>
        <p style={styles.subtitle}>
          Files stay in a local hierarchy with root folders, nested children,
          and cross-links to projects, tasks, and ideas.
        </p>
      </header>

      <section aria-label="File summary" style={styles.metrics}>
        <div style={styles.metricCard}>
          <p style={styles.metricLabel}>root folders</p>
          <p style={styles.metricValue}>{snapshot.fileHierarchy.rootFileIds.length}</p>
        </div>
        <div style={styles.metricCard}>
          <p style={styles.metricLabel}>folders</p>
          <p style={styles.metricValue}>{folderCount}</p>
        </div>
        <div style={styles.metricCard}>
          <p style={styles.metricLabel}>documents</p>
          <p style={styles.metricValue}>{documentCount}</p>
        </div>
        <div style={styles.metricCard}>
          <p style={styles.metricLabel}>assets</p>
          <p style={styles.metricValue}>{assetCount}</p>
        </div>
      </section>

      <section style={styles.section}>
        <h3 style={styles.sectionTitle}>Folder tree</h3>
        <div style={styles.boardGrid}>
          {rootFiles.map((file) => (
            <section key={file.id} style={styles.boardCard} aria-label={file.name}>
              <div style={styles.boardHeader}>
                <strong>{file.name}</strong>
                <span style={styles.boardCount}>{file.childIds.length} children</span>
              </div>
              <div>{file.summary}</div>
              <div style={styles.meta}>
                {getFileLabel(file)} | {file.projectIds.length} linked projects |{" "}
                {file.ideaIds.length} linked ideas
              </div>
              <div style={styles.fileTree}>{renderChildren(file, filesById)}</div>
            </section>
          ))}
        </div>
      </section>

      <section style={styles.quickAccess}>
        <h3 style={styles.sectionTitle}>Quick access</h3>
        <p style={styles.subtitle}>
          Recently updated files are surfaced here so the route behaves like a
          lightweight drive landing page.
        </p>
        <ul style={styles.quickList}>
          {sortedFiles.slice(0, 5).map((file) => (
            <li key={file.id}>
              <strong>{file.name}</strong> - {formatFilePath(file, filesById)}
              <div style={styles.pillRow}>
                <span style={styles.pill}>{getFileLabel(file)}</span>
                <span style={styles.pill}>{file.childIds.length} children</span>
                <span style={styles.pill}>{file.projectIds.length} projects</span>
                <span style={styles.pill}>{file.ideaIds.length} ideas</span>
              </div>
            </li>
          ))}
        </ul>
      </section>
    </article>
  );
}
