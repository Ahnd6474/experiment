import React, { useDeferredValue, useEffect, useMemo, useState } from "react";
import {
  selectFileTree,
  selectWorkspaceDetail,
} from "../../shared/selectors/index.js";

/**
 * AppShell owns only route selection, shell chrome, and shared repository wiring.
 * Each surface module owns its own UI state, selectors, and repository mutations.
 * Shared data lives in WorkspaceSnapshot v3, and surfaces may coordinate only
 * through frozen entity contracts and id-based cross-links, never by embedding
 * foreign records or writing around WorkspaceRepository.
 */

const styles = {
  layout: {
    display: "grid",
    gap: "20px",
  },
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
  hero: {
    display: "grid",
    gap: "16px",
    gridTemplateColumns: "minmax(0, 1.8fr) minmax(240px, 1fr)",
    alignItems: "start",
  },
  statGrid: {
    display: "grid",
    gap: "12px",
    gridTemplateColumns: "repeat(auto-fit, minmax(150px, 1fr))",
  },
  statCard: {
    padding: "16px",
    borderRadius: "16px",
    backgroundColor: "#f3f5f7",
  },
  statValue: {
    margin: "8px 0 0",
    fontSize: "28px",
    fontWeight: 700,
    color: "#102033",
  },
  statLabel: {
    margin: 0,
    color: "#5d6b79",
    fontSize: "13px",
  },
  browser: {
    display: "grid",
    gap: "20px",
    gridTemplateColumns: "240px minmax(0, 1.5fr) minmax(260px, 1fr)",
    alignItems: "start",
  },
  sidebar: {
    display: "grid",
    gap: "16px",
  },
  panel: {
    padding: "18px",
    borderRadius: "18px",
    backgroundColor: "#f6f8f9",
    border: "1px solid rgba(93, 107, 121, 0.12)",
  },
  sectionTitle: {
    margin: "4px 0 0",
    fontSize: "16px",
  },
  buttonList: {
    display: "grid",
    gap: "10px",
    padding: 0,
    margin: "14px 0 0",
    listStyle: "none",
  },
  navButton: {
    width: "100%",
    padding: "12px 14px",
    borderRadius: "14px",
    border: "1px solid rgba(93, 107, 121, 0.14)",
    backgroundColor: "#ffffff",
    color: "#102033",
    textAlign: "left",
    cursor: "pointer",
  },
  navButtonActive: {
    backgroundColor: "#102033",
    borderColor: "#102033",
    color: "#f8fafb",
  },
  breadcrumbRow: {
    display: "flex",
    flexWrap: "wrap",
    gap: "8px",
    marginTop: "14px",
  },
  controlRow: {
    display: "grid",
    gap: "12px",
    marginTop: "18px",
    gridTemplateColumns: "minmax(0, 1fr) auto",
    alignItems: "center",
  },
  searchInput: {
    width: "100%",
    padding: "12px 14px",
    borderRadius: "14px",
    border: "1px solid rgba(93, 107, 121, 0.16)",
    backgroundColor: "#ffffff",
    color: "#102033",
  },
  filterRow: {
    display: "flex",
    flexWrap: "wrap",
    gap: "8px",
    marginTop: "14px",
  },
  crumbButton: {
    padding: "8px 12px",
    borderRadius: "999px",
    border: "1px solid rgba(93, 107, 121, 0.14)",
    backgroundColor: "#ffffff",
    color: "#44515d",
    cursor: "pointer",
  },
  list: {
    display: "grid",
    gap: "12px",
    padding: 0,
    margin: "18px 0 0",
    listStyle: "none",
  },
  itemButton: {
    width: "100%",
    display: "grid",
    gap: "10px",
    padding: "16px",
    borderRadius: "18px",
    border: "1px solid rgba(93, 107, 121, 0.14)",
    backgroundColor: "#ffffff",
    color: "#102033",
    textAlign: "left",
    cursor: "pointer",
  },
  itemButtonActive: {
    borderColor: "#102033",
    boxShadow: "0 10px 20px rgba(16, 32, 51, 0.1)",
  },
  itemHeader: {
    display: "flex",
    justifyContent: "space-between",
    gap: "12px",
    alignItems: "center",
  },
  itemMeta: {
    display: "flex",
    flexWrap: "wrap",
    gap: "8px",
  },
  tag: {
    padding: "5px 10px",
    borderRadius: "999px",
    backgroundColor: "#eef2f4",
    color: "#44515d",
    fontSize: "12px",
    fontWeight: 600,
  },
  detailList: {
    display: "grid",
    gap: "10px",
    padding: 0,
    margin: "16px 0 0",
    listStyle: "none",
  },
  detailItem: {
    display: "flex",
    justifyContent: "space-between",
    gap: "12px",
    padding: "10px 12px",
    borderRadius: "14px",
    backgroundColor: "#ffffff",
  },
  linkList: {
    display: "grid",
    gap: "10px",
    padding: 0,
    margin: "16px 0 0",
    listStyle: "none",
  },
  empty: {
    margin: "16px 0 0",
    padding: "16px",
    borderRadius: "16px",
    backgroundColor: "#ffffff",
    color: "#5d6b79",
  },
  helperCard: {
    display: "grid",
    gap: "12px",
    marginTop: "18px",
    padding: "16px",
    borderRadius: "18px",
    background:
      "linear-gradient(135deg, rgba(16, 32, 51, 0.98), rgba(42, 79, 104, 0.92))",
    color: "#f8fafb",
  },
  helperList: {
    display: "grid",
    gap: "10px",
    padding: 0,
    margin: 0,
    listStyle: "none",
  },
  helperItem: {
    padding: "12px 14px",
    borderRadius: "14px",
    backgroundColor: "rgba(255, 255, 255, 0.08)",
  },
  routeLinks: {
    display: "flex",
    flexWrap: "wrap",
    gap: "10px",
    marginTop: "6px",
  },
  routeLink: {
    padding: "9px 12px",
    borderRadius: "999px",
    backgroundColor: "rgba(255, 255, 255, 0.12)",
    color: "#f8fafb",
    textDecoration: "none",
    fontWeight: 600,
  },
  detailSection: {
    marginTop: "18px",
  },
  detailHeading: {
    margin: "0 0 10px",
    fontSize: "14px",
    textTransform: "uppercase",
    letterSpacing: "0.08em",
    color: "#5d6b79",
  },
};

const FILE_VIEW_FILTERS = [
  { key: "all", label: "All items" },
  { key: "folders", label: "Folders" },
  { key: "documents", label: "Documents" },
  { key: "linked", label: "Linked only" },
];

function formatFileKind(kind, extension) {
  if (kind === "folder") {
    return "folder";
  }

  return extension ? `${kind} .${extension}` : kind;
}

function flattenNodes(nodes, collection = []) {
  nodes.forEach((node) => {
    collection.push(node);
    flattenNodes(node.children, collection);
  });

  return collection;
}

function smartCollections(snapshot) {
  const documents = snapshot.files.filter((file) => file.kind === "document");
  const linked = snapshot.files.filter(
    (file) => file.projectIds.length || file.taskIds.length || file.ideaIds.length,
  );

  return {
    recentDocuments: [...documents]
      .sort((left, right) => right.updatedAt.localeCompare(left.updatedAt))
      .slice(0, 3),
    linkedWork: [...linked]
      .sort(
        (left, right) =>
          right.projectIds.length +
          right.taskIds.length +
          right.ideaIds.length -
          (left.projectIds.length + left.taskIds.length + left.ideaIds.length),
      )
      .slice(0, 3),
  };
}

function normalizeSearchValue(value) {
  return value.trim().toLowerCase();
}

function matchesFileQuery(node, normalizedQuery) {
  if (!normalizedQuery) {
    return true;
  }

  const searchIndex = [
    node.entity.name,
    node.entity.summary,
    node.entity.extension,
    node.related.projects.map((project) => project.name).join(" "),
    node.related.tasks.map((task) => task.name).join(" "),
    node.related.ideas.map((idea) => idea.name).join(" "),
  ]
    .join(" ")
    .toLowerCase();

  return searchIndex.includes(normalizedQuery);
}

function matchesFileFilter(node, activeFilter) {
  if (activeFilter === "folders") {
    return node.entity.kind === "folder";
  }

  if (activeFilter === "documents") {
    return node.entity.kind === "document";
  }

  if (activeFilter === "linked") {
    return (
      node.related.projects.length > 0 ||
      node.related.tasks.length > 0 ||
      node.related.ideas.length > 0
    );
  }

  return true;
}

function describeNextStep(detail) {
  if (!detail) {
    return "Select a folder or document to inspect its workspace handoff and linked records.";
  }

  if (detail.entity.kind === "folder") {
    return "Use folders to stage local-first working sets before linking documents back to active delivery work.";
  }

  if (detail.related.tasks.length > 0) {
    return "This document is already tied to execution. Open Tasks to keep delivery context and file support aligned.";
  }

  if (detail.related.projects.length > 0) {
    return "This document supports a live project thread. Jump to Projects to review scope and downstream task impact.";
  }

  if (detail.related.ideas.length > 0) {
    return "This document is supporting incubation work. Review Ideas before promoting it into a committed project flow.";
  }

  return "This document is still unlinked. Keep it local until it is ready to attach to a project, task, or idea.";
}

export default function FilesRoute({ snapshot }) {
  const rootTree = useMemo(() => selectFileTree(snapshot), [snapshot]);
  const rootIds = useMemo(
    () => rootTree.roots.map((node) => node.entity.id),
    [rootTree],
  );
  const [activeFolderId, setActiveFolderId] = useState(rootIds[0] ?? null);
  const [selectedFileId, setSelectedFileId] = useState(rootIds[0] ?? null);
  const [searchValue, setSearchValue] = useState("");
  const [activeFilter, setActiveFilter] = useState("all");
  const deferredSearchValue = useDeferredValue(searchValue);
  const normalizedSearchValue = useMemo(
    () => normalizeSearchValue(deferredSearchValue),
    [deferredSearchValue],
  );

  useEffect(() => {
    if (activeFolderId && snapshot.files.some((file) => file.id === activeFolderId)) {
      return;
    }

    setActiveFolderId(rootIds[0] ?? null);
  }, [activeFolderId, rootIds, snapshot.files]);

  const activeTree = useMemo(
    () => selectFileTree(snapshot, activeFolderId),
    [activeFolderId, snapshot],
  );
  const activeFolder = activeFolderId
    ? selectWorkspaceDetail(snapshot, "file", activeFolderId)
    : null;
  const activeItems = activeFolderId ? activeTree.roots : rootTree.roots;
  const filteredItems = useMemo(
    () =>
      activeItems.filter(
        (node) =>
          matchesFileFilter(node, activeFilter) &&
          matchesFileQuery(node, normalizedSearchValue),
      ),
    [activeFilter, activeItems, normalizedSearchValue],
  );
  const flattenedRootNodes = useMemo(() => flattenNodes(rootTree.roots), [rootTree]);
  const collections = useMemo(() => smartCollections(snapshot), [snapshot]);
  const selectedNode =
    activeItems.find((node) => node.entity.id === selectedFileId) ??
    flattenedRootNodes.find((node) => node.entity.id === selectedFileId) ??
    activeFolder ??
    rootTree.roots[0] ??
    null;
  const selectedDetail = selectedNode
    ? selectWorkspaceDetail(snapshot, "file", selectedNode.entity.id)
    : null;

  useEffect(() => {
    if (activeItems.some((node) => node.entity.id === selectedFileId)) {
      return;
    }

    if (activeFolderId && activeFolder) {
      setSelectedFileId(activeFolderId);
      return;
    }

    setSelectedFileId(activeItems[0]?.entity.id ?? rootIds[0] ?? null);
  }, [activeFolder, activeFolderId, activeItems, rootIds, selectedFileId]);

  const totalFolders = snapshot.files.filter((file) => file.kind === "folder").length;
  const totalDocuments = snapshot.files.filter((file) => file.kind === "document").length;
  const linkedFiles = snapshot.files.filter(
    (file) => file.projectIds.length || file.taskIds.length || file.ideaIds.length,
  ).length;
  const unlinkedDocuments = snapshot.files.filter(
    (file) =>
      file.kind === "document" &&
      !file.projectIds.length &&
      !file.taskIds.length &&
      !file.ideaIds.length,
  ).length;
  const selectedConnectionCount =
    (selectedDetail?.related.projects.length ?? 0) +
    (selectedDetail?.related.tasks.length ?? 0) +
    (selectedDetail?.related.ideas.length ?? 0);
  const hasActiveSearch = normalizedSearchValue.length > 0 || activeFilter !== "all";

  return (
    <article style={styles.layout}>
      <section style={styles.card}>
        <div style={styles.hero}>
          <div>
            <p style={styles.eyebrow}>Files</p>
            <h2 style={{ margin: "4px 0 10px" }}>Drive-style organizer</h2>
            <p style={{ margin: 0, color: "#44515d", lineHeight: 1.6 }}>
              Start local, shape the workspace tree, and only then connect folders
              or documents back to projects, tasks, and idea backlog entries inside
              the Jakal-flow companion loop.
            </p>
            <div style={styles.breadcrumbRow}>
              <button
                type="button"
                onClick={() => setActiveFolderId(rootIds[0] ?? null)}
                style={styles.crumbButton}
              >
                Home
              </button>
              {(activeFolder?.related.path ?? []).map((file) => (
                <button
                  key={file.id}
                  type="button"
                  onClick={() => setActiveFolderId(file.id)}
                  style={styles.crumbButton}
                >
                  {file.name}
                </button>
              ))}
            </div>
          </div>

          <div style={styles.statGrid}>
            <section style={styles.statCard}>
              <p style={styles.statLabel}>Root libraries</p>
              <p style={styles.statValue}>{snapshot.fileHierarchy.rootFileIds.length}</p>
            </section>
            <section style={styles.statCard}>
              <p style={styles.statLabel}>Folders</p>
              <p style={styles.statValue}>{totalFolders}</p>
            </section>
            <section style={styles.statCard}>
              <p style={styles.statLabel}>Documents</p>
              <p style={styles.statValue}>{totalDocuments}</p>
            </section>
            <section style={styles.statCard}>
              <p style={styles.statLabel}>Linked records</p>
              <p style={styles.statValue}>{linkedFiles}</p>
            </section>
            <section style={styles.statCard}>
              <p style={styles.statLabel}>Needs triage</p>
              <p style={styles.statValue}>{unlinkedDocuments}</p>
            </section>
          </div>
        </div>
      </section>

      <section style={styles.browser}>
        <aside style={styles.sidebar}>
          <section style={styles.panel}>
            <p style={styles.eyebrow}>Libraries</p>
            <h3 style={styles.sectionTitle}>Root folders</h3>
            <ul style={styles.buttonList}>
              {rootTree.roots.map((node) => (
                <li key={node.entity.id}>
                  <button
                    type="button"
                    onClick={() => {
                      setActiveFolderId(node.entity.id);
                      setSelectedFileId(node.entity.id);
                    }}
                    style={{
                      ...styles.navButton,
                      ...(activeFolderId === node.entity.id ? styles.navButtonActive : null),
                    }}
                  >
                    {node.entity.name}
                  </button>
                </li>
              ))}
            </ul>
          </section>

          <section style={styles.panel}>
            <p style={styles.eyebrow}>Quick access</p>
            <h3 style={styles.sectionTitle}>Recent docs</h3>
            {collections.recentDocuments.length > 0 ? (
              <ul style={styles.buttonList}>
                {collections.recentDocuments.map((file) => (
                  <li key={file.id}>
                    <button
                      type="button"
                      onClick={() => {
                        setActiveFolderId(file.parentId ?? rootIds[0] ?? null);
                        setSelectedFileId(file.id);
                      }}
                      style={styles.navButton}
                    >
                      {file.name}
                    </button>
                  </li>
                ))}
              </ul>
            ) : (
              <p style={styles.empty}>
                No documents yet. Create or import local reference material before
                linking it into delivery work.
              </p>
            )}
            <div style={styles.helperCard}>
              <p style={{ ...styles.eyebrow, color: "rgba(248, 250, 251, 0.72)" }}>
                Workflow guide
              </p>
              <h3 style={{ margin: 0 }}>Keep the repository loop visible</h3>
              <ul style={styles.helperList}>
                <li style={styles.helperItem}>
                  Curate local folders first, then attach only the files that should
                  follow the Jakal-flow execution path.
                </li>
                <li style={styles.helperItem}>
                  Use project links for scoped deliverables, task links for active
                  execution, and idea links for pre-commit research.
                </li>
              </ul>
              <div style={styles.routeLinks}>
                <a href="#/projects" style={styles.routeLink}>
                  Open Projects
                </a>
                <a href="#/tasks" style={styles.routeLink}>
                  Open Tasks
                </a>
                <a href="#/ideas" style={styles.routeLink}>
                  Open Ideas
                </a>
              </div>
            </div>
          </section>
        </aside>

        <section style={styles.card}>
          <p style={styles.eyebrow}>Current folder</p>
          <h3 style={{ margin: "4px 0 10px" }}>
            {activeFolder?.entity.name ?? "Workspace"}
          </h3>
          <p style={{ margin: 0, color: "#44515d", lineHeight: 1.6 }}>
            {activeFolder?.entity.summary ??
              "Choose a root library to browse folders and linked documents."}
          </p>
          <div style={styles.controlRow}>
            <label>
              <span style={styles.eyebrow}>Local search</span>
              <input
                type="search"
                value={searchValue}
                onChange={(event) => setSearchValue(event.target.value)}
                placeholder="Search files, summaries, or linked work"
                style={styles.searchInput}
              />
            </label>
            <span style={styles.tag}>
              {filteredItems.length} of {activeItems.length} visible
            </span>
          </div>
          <div style={styles.filterRow}>
            {FILE_VIEW_FILTERS.map((filter) => (
              <button
                key={filter.key}
                type="button"
                onClick={() => setActiveFilter(filter.key)}
                style={{
                  ...styles.crumbButton,
                  ...(activeFilter === filter.key ? styles.navButtonActive : null),
                }}
              >
                {filter.label}
              </button>
            ))}
          </div>

          <ul style={styles.list}>
            {filteredItems.length > 0 ? (
              filteredItems.map((node) => {
                const isActive = node.entity.id === selectedFileId;
                const canOpen = node.entity.kind === "folder";

                return (
                  <li key={node.entity.id}>
                    <button
                      type="button"
                      onClick={() => {
                        setSelectedFileId(node.entity.id);
                        if (canOpen) {
                          setActiveFolderId(node.entity.id);
                        }
                      }}
                      style={{
                        ...styles.itemButton,
                        ...(isActive ? styles.itemButtonActive : null),
                      }}
                    >
                      <div style={styles.itemHeader}>
                        <strong>{node.entity.name}</strong>
                        <span style={styles.tag}>
                          {formatFileKind(node.entity.kind, node.entity.extension)}
                        </span>
                      </div>
                      <div style={{ color: "#44515d", lineHeight: 1.5 }}>
                        {node.entity.summary}
                      </div>
                      <div style={styles.itemMeta}>
                        <span style={styles.tag}>
                          {node.related.children.length} children
                        </span>
                        <span style={styles.tag}>
                          {node.related.projects.length +
                            node.related.tasks.length +
                            node.related.ideas.length}{" "}
                          linked entities
                        </span>
                        {canOpen ? <span style={styles.tag}>Open folder</span> : null}
                      </div>
                    </button>
                  </li>
                );
              })
            ) : activeItems.length > 0 ? (
              <li style={styles.empty}>
                {hasActiveSearch
                  ? "No files match the current local search or filter. Clear the query or switch filters to widen the folder view."
                  : "This folder has items, but nothing is visible yet."}
              </li>
            ) : (
              <li style={styles.empty}>
                This folder is empty. Use it as a local staging area until a
                document is ready to connect to a project, task, or idea.
              </li>
            )}
          </ul>
        </section>

        <aside style={styles.layout}>
          <section style={styles.card}>
            <p style={styles.eyebrow}>Selection</p>
            <h3 style={{ margin: "4px 0 10px" }}>
              {selectedDetail?.entity.name ?? "No file selected"}
            </h3>
            <p style={{ margin: 0, color: "#44515d", lineHeight: 1.6 }}>
              {selectedDetail?.entity.summary ??
                "Pick a folder or document to inspect its linked workspace context."}
            </p>
            <ul style={styles.detailList}>
              <li style={styles.detailItem}>
                <span>Type</span>
                <span>
                  {selectedDetail
                    ? formatFileKind(
                        selectedDetail.entity.kind,
                        selectedDetail.entity.extension,
                      )
                    : "n/a"}
                </span>
              </li>
              <li style={styles.detailItem}>
                <span>Parent</span>
                <span>{selectedDetail?.related.parent?.name ?? "Root level"}</span>
              </li>
              <li style={styles.detailItem}>
                <span>Updated</span>
                <span>{selectedDetail?.entity.updatedAt.slice(0, 10) ?? "n/a"}</span>
              </li>
            </ul>
            <div style={styles.detailSection}>
              <h4 style={styles.detailHeading}>Jakal-flow next step</h4>
              <p style={{ margin: 0, color: "#44515d", lineHeight: 1.6 }}>
                {describeNextStep(selectedDetail)}
              </p>
            </div>
          </section>

          <section style={styles.card}>
            <p style={styles.eyebrow}>Connected work</p>
            <h3 style={styles.sectionTitle}>Top linked files</h3>
            {collections.linkedWork.length > 0 ? (
              <ul style={styles.linkList}>
                {collections.linkedWork.map((file) => (
                  <li key={file.id} style={styles.detailItem}>
                    <span>{file.name}</span>
                    <span>
                      {file.projectIds.length + file.taskIds.length + file.ideaIds.length} refs
                    </span>
                  </li>
                ))}
              </ul>
            ) : (
              <p style={styles.empty}>
                No linked files yet. Keep documents local until they earn a clear
                place in project, task, or idea tracking.
              </p>
            )}
            <ul style={styles.linkList}>
              <li style={styles.detailItem}>
                <span>Projects</span>
                <span>{selectedDetail?.related.projects.length ?? 0}</span>
              </li>
              <li style={styles.detailItem}>
                <span>Tasks</span>
                <span>{selectedDetail?.related.tasks.length ?? 0}</span>
              </li>
              <li style={styles.detailItem}>
                <span>Ideas</span>
                <span>{selectedDetail?.related.ideas.length ?? 0}</span>
              </li>
            </ul>
            <div style={styles.detailSection}>
              <h4 style={styles.detailHeading}>Selection status</h4>
              <p style={{ margin: 0, color: "#44515d", lineHeight: 1.6 }}>
                {selectedDetail
                  ? `${selectedConnectionCount} workspace links are currently attached to this selection.`
                  : "Select a file to inspect how it contributes to the wider workspace flow."}
              </p>
            </div>
          </section>
        </aside>
      </section>
    </article>
  );
}
