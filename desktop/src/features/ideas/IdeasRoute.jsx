import React, { useDeferredValue, useEffect, useMemo, useState } from "react";
import {
  selectIdeaBoard,
  selectWorkspaceDetail,
} from "../../shared/selectors/index.js";

/**
 * AppShell owns only route selection, shell chrome, and shared repository wiring.
 * Each surface module owns its own UI state, selectors, and repository mutations.
 * Shared data lives in WorkspaceSnapshot v3, and surfaces may coordinate only
 * through frozen entity contracts and id-based cross-links, never by embedding
 * foreign records or writing around WorkspaceRepository.
 */

const STAGE_GUIDANCE = Object.freeze({
  captured: "Collect the signal and attach the first repository context before it disappears.",
  shaping: "Connect the concept to tasks, files, and linked projects so the handoff is reviewable.",
  validated: "This idea has enough evidence to graduate into scheduled repository work.",
  promoted: "The idea already seeded tracked delivery and now serves as upstream context.",
});

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
    gridTemplateColumns: "minmax(0, 1.7fr) minmax(280px, 1fr)",
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
  helperText: {
    margin: 0,
    color: "#5d6b79",
    fontSize: "13px",
    lineHeight: 1.5,
  },
  controlGrid: {
    display: "grid",
    gap: "14px",
    marginTop: "18px",
  },
  searchInput: {
    width: "100%",
    padding: "12px 14px",
    borderRadius: "14px",
    border: "1px solid rgba(93, 107, 121, 0.2)",
    backgroundColor: "#f8fafb",
    color: "#102033",
    fontSize: "14px",
  },
  filterRow: {
    display: "flex",
    flexWrap: "wrap",
    gap: "10px",
    marginTop: "6px",
  },
  pill: {
    padding: "9px 14px",
    borderRadius: "999px",
    border: "1px solid rgba(93, 107, 121, 0.2)",
    backgroundColor: "#ffffff",
    color: "#44515d",
    fontSize: "13px",
    fontWeight: 600,
    cursor: "pointer",
  },
  pillActive: {
    backgroundColor: "#102033",
    borderColor: "#102033",
    color: "#f8fafb",
  },
  workflowCard: {
    display: "grid",
    gap: "12px",
    padding: "18px",
    borderRadius: "18px",
    background:
      "linear-gradient(180deg, rgba(247, 248, 250, 1) 0%, rgba(238, 242, 244, 1) 100%)",
    border: "1px solid rgba(93, 107, 121, 0.12)",
  },
  workflowList: {
    display: "grid",
    gap: "10px",
    padding: 0,
    margin: 0,
    listStyle: "none",
  },
  workflowItem: {
    display: "grid",
    gap: "4px",
    padding: "12px 14px",
    borderRadius: "14px",
    backgroundColor: "#ffffff",
  },
  workflowHeader: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    gap: "12px",
  },
  stageTitle: {
    margin: 0,
    fontSize: "14px",
    fontWeight: 700,
    color: "#102033",
    textTransform: "capitalize",
  },
  stageCount: {
    padding: "4px 8px",
    borderRadius: "999px",
    backgroundColor: "#dce4ea",
    color: "#102033",
    fontSize: "12px",
    fontWeight: 700,
  },
  board: {
    display: "grid",
    gap: "16px",
    gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
  },
  lane: {
    display: "grid",
    gap: "12px",
    alignContent: "start",
    padding: "16px",
    borderRadius: "18px",
    backgroundColor: "#f6f8f9",
    border: "1px solid rgba(93, 107, 121, 0.12)",
  },
  laneHeader: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    gap: "12px",
  },
  laneTitle: {
    margin: 0,
    fontSize: "16px",
    textTransform: "capitalize",
  },
  laneCount: {
    minWidth: "28px",
    height: "28px",
    borderRadius: "999px",
    display: "grid",
    placeItems: "center",
    backgroundColor: "#dce4ea",
    color: "#102033",
    fontSize: "13px",
    fontWeight: 700,
  },
  laneList: {
    display: "grid",
    gap: "10px",
    padding: 0,
    margin: 0,
    listStyle: "none",
  },
  ideaCardButton: {
    width: "100%",
    padding: "14px",
    borderRadius: "16px",
    border: "1px solid rgba(93, 107, 121, 0.16)",
    backgroundColor: "#ffffff",
    textAlign: "left",
    cursor: "pointer",
  },
  ideaCardActive: {
    borderColor: "#102033",
    boxShadow: "0 10px 20px rgba(16, 32, 51, 0.1)",
  },
  cardTitle: {
    margin: 0,
    fontSize: "15px",
  },
  cardSummary: {
    margin: "8px 0 0",
    color: "#44515d",
    fontSize: "14px",
    lineHeight: 1.5,
  },
  metaRow: {
    display: "flex",
    flexWrap: "wrap",
    gap: "8px",
    marginTop: "12px",
  },
  tag: {
    padding: "5px 10px",
    borderRadius: "999px",
    backgroundColor: "#eef2f4",
    color: "#44515d",
    fontSize: "12px",
    fontWeight: 600,
  },
  detailGrid: {
    display: "grid",
    gap: "20px",
    gridTemplateColumns: "minmax(0, 1.5fr) minmax(260px, 1fr)",
  },
  detailPanel: {
    padding: "20px",
    borderRadius: "18px",
    backgroundColor: "#f7f8fa",
    border: "1px solid rgba(93, 107, 121, 0.12)",
  },
  detailList: {
    display: "grid",
    gap: "10px",
    padding: 0,
    margin: "14px 0 0",
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
  checklistItem: {
    display: "grid",
    gap: "4px",
    padding: "12px 14px",
    borderRadius: "14px",
    backgroundColor: "#ffffff",
  },
  checklistHeader: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    gap: "12px",
  },
  checklistTitle: {
    margin: 0,
    fontSize: "14px",
    color: "#102033",
  },
  checklistStatus: {
    padding: "4px 8px",
    borderRadius: "999px",
    backgroundColor: "#eef2f4",
    color: "#44515d",
    fontSize: "12px",
    fontWeight: 700,
    textTransform: "uppercase",
    letterSpacing: "0.04em",
  },
  continuityGrid: {
    display: "grid",
    gap: "12px",
    gridTemplateColumns: "repeat(auto-fit, minmax(120px, 1fr))",
    marginTop: "14px",
  },
  continuityCard: {
    padding: "14px",
    borderRadius: "16px",
    backgroundColor: "#ffffff",
    border: "1px solid rgba(93, 107, 121, 0.12)",
  },
  continuityValue: {
    margin: "6px 0 0",
    fontSize: "24px",
    fontWeight: 700,
    color: "#102033",
  },
  continuityLabel: {
    margin: 0,
    fontSize: "12px",
    color: "#5d6b79",
    textTransform: "uppercase",
    letterSpacing: "0.08em",
  },
  empty: {
    margin: 0,
    padding: "16px",
    borderRadius: "16px",
    backgroundColor: "#ffffff",
    color: "#5d6b79",
  },
};

function formatStageLabel(stage) {
  return stage.replace(/_/g, " ");
}

function formatIntegrationStatus(status) {
  return status.replace(/_/g, " ");
}

function createPrioritySummary(boardGroups) {
  const validatedCount =
    boardGroups.find((group) => group.key === "validated")?.items.length ?? 0;
  const shapingCount =
    boardGroups.find((group) => group.key === "shaping")?.items.length ?? 0;
  const promotedCount =
    boardGroups.find((group) => group.key === "promoted")?.items.length ?? 0;

  return {
    readyToPromote: validatedCount,
    shaping: shapingCount,
    promoted: promotedCount,
  };
}

function createReadinessChecks(selectedIdea) {
  if (!selectedIdea) {
    return [];
  }

  return [
    {
      key: "projects",
      label: "Project context",
      status: selectedIdea.related.projects.length > 0 ? "ready" : "missing",
      description:
        selectedIdea.related.projects.length > 0
          ? `${selectedIdea.related.projects.length} linked project records keep the handoff grounded.`
          : "Link a candidate project so the idea has a clear landing zone.",
    },
    {
      key: "tasks",
      label: "Execution signals",
      status: selectedIdea.related.tasks.length > 0 ? "ready" : "missing",
      description:
        selectedIdea.related.tasks.length > 0
          ? `${selectedIdea.related.tasks.length} linked tasks show how this concept could move into delivery.`
          : "Attach at least one task to make downstream execution visible.",
    },
    {
      key: "files",
      label: "Supporting files",
      status: selectedIdea.related.files.length > 0 ? "ready" : "missing",
      description:
        selectedIdea.related.files.length > 0
          ? `${selectedIdea.related.files.length} workspace files preserve specs and supporting material.`
          : "Add a file reference so briefs and specs stay attached to the idea.",
    },
    {
      key: "promotion",
      label: "Promotion outcome",
      status: selectedIdea.related.promotedProject ? "ready" : "pending",
      description: selectedIdea.related.promotedProject
        ? `${selectedIdea.related.promotedProject.title} already carries this idea into tracked work.`
        : "Keep shaping until a repository-backed promotion target is clear.",
    },
  ];
}

function renderReferenceList(title, items, emptyLabel) {
  return (
    <section style={styles.detailPanel}>
      <p style={styles.eyebrow}>{title}</p>
      <ul style={styles.detailList}>
        {items.length > 0 ? (
          items.map((item) => (
            <li key={item.id} style={styles.detailItem}>
              <span>{item.title ?? item.name}</span>
              <span style={styles.tag}>{item.status ?? item.kind ?? "linked"}</span>
            </li>
          ))
        ) : (
          <li style={styles.empty}>{emptyLabel}</li>
        )}
      </ul>
    </section>
  );
}

export default function IdeasRoute({ snapshot }) {
  const board = useMemo(() => selectIdeaBoard(snapshot), [snapshot]);
  const allIdeaIds = useMemo(
    () => board.groups.flatMap((group) => group.items.map((item) => item.entity.id)),
    [board],
  );
  const [activeStage, setActiveStage] = useState("all");
  const [selectedIdeaId, setSelectedIdeaId] = useState(allIdeaIds[0] ?? null);
  const [searchValue, setSearchValue] = useState("");
  const deferredSearchValue = useDeferredValue(searchValue);

  const normalizedSearch = useMemo(
    () => deferredSearchValue.trim().toLowerCase(),
    [deferredSearchValue],
  );

  const filteredGroups = useMemo(
    () =>
      board.groups.map((group) => ({
        ...group,
        items: group.items.filter((item) => {
          if (!normalizedSearch) {
            return true;
          }

          const searchSource = [
            item.entity.title,
            item.entity.summary,
            ...item.related.projects.map((project) => project.title),
            ...item.related.tasks.map((task) => task.title),
            ...item.related.files.map((file) => file.name),
          ]
            .filter(Boolean)
            .join(" ")
            .toLowerCase();

          return searchSource.includes(normalizedSearch);
        }),
      })),
    [board.groups, normalizedSearch],
  );

  const visibleGroups = useMemo(
    () =>
      filteredGroups.filter(
        (group) => activeStage === "all" || group.key === activeStage,
      ),
    [activeStage, filteredGroups],
  );

  const visibleIdeaIds = useMemo(
    () => visibleGroups.flatMap((group) => group.items.map((item) => item.entity.id)),
    [visibleGroups],
  );

  useEffect(() => {
    if (!allIdeaIds.includes(selectedIdeaId)) {
      setSelectedIdeaId(allIdeaIds[0] ?? null);
    }
  }, [allIdeaIds, selectedIdeaId]);

  useEffect(() => {
    if (visibleIdeaIds.length === 0) {
      return;
    }

    if (!visibleIdeaIds.includes(selectedIdeaId)) {
      setSelectedIdeaId(visibleIdeaIds[0] ?? null);
    }
  }, [selectedIdeaId, visibleIdeaIds]);

  const selectedIdea = selectedIdeaId
    ? selectWorkspaceDetail(snapshot, "idea", selectedIdeaId)
    : null;
  const summary = createPrioritySummary(board.groups);
  const linkedTaskCount = snapshot.ideas.reduce(
    (count, idea) => count + idea.taskIds.length,
    0,
  );
  const linkedFileCount = snapshot.ideas.reduce(
    (count, idea) => count + idea.fileIds.length,
    0,
  );
  const visibleIdeaCount = visibleGroups.reduce((count, group) => count + group.items.length, 0);
  const readinessChecks = createReadinessChecks(selectedIdea);

  return (
    <article style={styles.layout}>
      <section style={styles.card}>
        <div style={styles.hero}>
          <div>
            <p style={styles.eyebrow}>Ideas</p>
            <h2 style={{ margin: "4px 0 10px" }}>Incubation board</h2>
            <p style={{ margin: 0, color: "#44515d", lineHeight: 1.6 }}>
              Capture future projects, keep shaping work visible, and review how
              each concept is linked to tasks, project branches, and supporting
              files before promotion into the wider Jakal-flow workspace.
            </p>

            <div style={styles.controlGrid}>
              <label style={styles.layout}>
                <span style={styles.eyebrow}>Search ideas</span>
                <input
                  type="search"
                  value={searchValue}
                  placeholder="Filter by title, summary, project, task, or file"
                  onChange={(event) => setSearchValue(event.target.value)}
                  style={styles.searchInput}
                />
              </label>

              <div>
                <p style={styles.eyebrow}>Stage filter</p>
                <div style={styles.filterRow}>
                  <button
                    type="button"
                    onClick={() => setActiveStage("all")}
                    style={{
                      ...styles.pill,
                      ...(activeStage === "all" ? styles.pillActive : null),
                    }}
                  >
                    All stages
                  </button>
                  {board.stageOrder.map((stage) => (
                    <button
                      key={stage}
                      type="button"
                      onClick={() => setActiveStage(stage)}
                      style={{
                        ...styles.pill,
                        ...(activeStage === stage ? styles.pillActive : null),
                      }}
                    >
                      {formatStageLabel(stage)}
                    </button>
                  ))}
                </div>
              </div>

              <p style={styles.helperText}>
                {normalizedSearch
                  ? `${visibleIdeaCount} idea matches for "${deferredSearchValue.trim()}".`
                  : `${visibleIdeaCount} ideas visible across the current incubation view.`}
              </p>
            </div>
          </div>

          <section style={styles.workflowCard}>
            <div>
              <p style={styles.eyebrow}>Incubation workflow</p>
              <h3 style={{ margin: "4px 0 0" }}>Shape before promotion</h3>
            </div>
            <ul style={styles.workflowList}>
              {board.stageOrder.map((stage) => {
                const count =
                  board.groups.find((group) => group.key === stage)?.items.length ?? 0;

                return (
                  <li key={stage} style={styles.workflowItem}>
                    <div style={styles.workflowHeader}>
                      <p style={styles.stageTitle}>{formatStageLabel(stage)}</p>
                      <span style={styles.stageCount}>{count}</span>
                    </div>
                    <p style={styles.helperText}>
                      {STAGE_GUIDANCE[stage] ??
                        "Keep this idea connected to the broader workspace before moving on."}
                    </p>
                  </li>
                );
              })}
            </ul>
          </section>
        </div>

        <div style={{ ...styles.statGrid, marginTop: "20px" }}>
          <section style={styles.statCard}>
            <p style={styles.statLabel}>Ideas tracked</p>
            <p style={styles.statValue}>{snapshot.ideas.length}</p>
          </section>
          <section style={styles.statCard}>
            <p style={styles.statLabel}>Ready to promote</p>
            <p style={styles.statValue}>{summary.readyToPromote}</p>
          </section>
          <section style={styles.statCard}>
            <p style={styles.statLabel}>Shaping now</p>
            <p style={styles.statValue}>{summary.shaping}</p>
          </section>
          <section style={styles.statCard}>
            <p style={styles.statLabel}>Linked workspace docs</p>
            <p style={styles.statValue}>{linkedFileCount}</p>
          </section>
          <section style={styles.statCard}>
            <p style={styles.statLabel}>Linked tasks</p>
            <p style={styles.statValue}>{linkedTaskCount}</p>
          </section>
          <section style={styles.statCard}>
            <p style={styles.statLabel}>Promoted ideas</p>
            <p style={styles.statValue}>{summary.promoted}</p>
          </section>
        </div>
      </section>

      <section style={styles.board}>
        {visibleGroups.map((group) => (
          <section key={group.key} style={styles.lane}>
            <header style={styles.laneHeader}>
              <h3 style={styles.laneTitle}>{formatStageLabel(group.key)}</h3>
              <span style={styles.laneCount}>{group.items.length}</span>
            </header>
            <p style={styles.helperText}>
              {STAGE_GUIDANCE[group.key] ??
                "Review connected work before moving this idea forward."}
            </p>

            <ul style={styles.laneList}>
              {group.items.length > 0 ? (
                group.items.map((item) => {
                  const isActive = item.entity.id === selectedIdeaId;
                  const linkedCount =
                    item.related.projects.length +
                    item.related.tasks.length +
                    item.related.files.length;

                  return (
                    <li key={item.entity.id}>
                      <button
                        type="button"
                        onClick={() => setSelectedIdeaId(item.entity.id)}
                        style={{
                          ...styles.ideaCardButton,
                          ...(isActive ? styles.ideaCardActive : null),
                        }}
                      >
                        <h4 style={styles.cardTitle}>{item.entity.title}</h4>
                        <p style={styles.cardSummary}>{item.entity.summary}</p>
                        <div style={styles.metaRow}>
                          <span style={styles.tag}>{linkedCount} links</span>
                          <span style={styles.tag}>
                            sync {formatIntegrationStatus(item.integration.status)}
                          </span>
                          <span style={styles.tag}>
                            {item.related.promotedProject ? "project seeded" : "future backlog"}
                          </span>
                        </div>
                      </button>
                    </li>
                  );
                })
              ) : (
                <li style={styles.empty}>
                  {normalizedSearch
                    ? "No ideas match this filter in the current stage."
                    : "No ideas in this stage yet."}
                </li>
              )}
            </ul>
          </section>
        ))}
      </section>

      <section style={styles.card}>
        <div style={styles.detailGrid}>
          <section style={styles.detailPanel}>
            <p style={styles.eyebrow}>Selected idea</p>
            {selectedIdea ? (
              <>
                <h3 style={{ margin: "4px 0 10px" }}>{selectedIdea.entity.title}</h3>
                <p style={{ margin: 0, color: "#44515d", lineHeight: 1.6 }}>
                  {selectedIdea.entity.summary}
                </p>
                <div style={styles.metaRow}>
                  <span style={styles.tag}>
                    stage {formatStageLabel(selectedIdea.entity.stage)}
                  </span>
                  <span style={styles.tag}>
                    {selectedIdea.related.tasks.length} tasks linked
                  </span>
                  <span style={styles.tag}>
                    {selectedIdea.related.files.length} files linked
                  </span>
                  <span style={styles.tag}>
                    sync {formatIntegrationStatus(selectedIdea.integration.status)}
                  </span>
                </div>
                <ul style={styles.detailList}>
                  <li style={styles.detailItem}>
                    <span>Promotion path</span>
                    <span>
                      {selectedIdea.related.promotedProject?.title ?? "Still incubating"}
                    </span>
                  </li>
                  <li style={styles.detailItem}>
                    <span>Project coverage</span>
                    <span>{selectedIdea.related.projects.length} linked projects</span>
                  </li>
                  <li style={styles.detailItem}>
                    <span>Repository sync records</span>
                    <span>{selectedIdea.integration.recordCount}</span>
                  </li>
                  <li style={styles.detailItem}>
                    <span>Last updated</span>
                    <span>{selectedIdea.entity.updatedAt.slice(0, 10)}</span>
                  </li>
                </ul>

                <section style={{ marginTop: "18px" }}>
                  <p style={styles.eyebrow}>Incubation checklist</p>
                  <ul style={styles.detailList}>
                    {readinessChecks.map((check) => (
                      <li key={check.key} style={styles.checklistItem}>
                        <div style={styles.checklistHeader}>
                          <p style={styles.checklistTitle}>{check.label}</p>
                          <span style={styles.checklistStatus}>{check.status}</span>
                        </div>
                        <p style={styles.helperText}>{check.description}</p>
                      </li>
                    ))}
                  </ul>
                </section>
              </>
            ) : (
              <p style={styles.empty}>Select an idea card to inspect its links.</p>
            )}
          </section>

          <div style={styles.layout}>
            <section style={styles.detailPanel}>
              <p style={styles.eyebrow}>Workspace handoff</p>
              <h3 style={{ margin: "4px 0 0" }}>
                Keep discovery connected to the Jakal-flow model
              </h3>
              <p style={{ ...styles.helperText, marginTop: "10px" }}>
                Ideas should stay traceable into projects, tasks, and files so upstream
                thinking can graduate into repository-backed delivery without losing
                context.
              </p>

              {selectedIdea ? (
                <div style={styles.continuityGrid}>
                  <section style={styles.continuityCard}>
                    <p style={styles.continuityLabel}>Projects</p>
                    <p style={styles.continuityValue}>{selectedIdea.related.projects.length}</p>
                  </section>
                  <section style={styles.continuityCard}>
                    <p style={styles.continuityLabel}>Tasks</p>
                    <p style={styles.continuityValue}>{selectedIdea.related.tasks.length}</p>
                  </section>
                  <section style={styles.continuityCard}>
                    <p style={styles.continuityLabel}>Files</p>
                    <p style={styles.continuityValue}>{selectedIdea.related.files.length}</p>
                  </section>
                  <section style={styles.continuityCard}>
                    <p style={styles.continuityLabel}>Sync</p>
                    <p style={styles.continuityValue}>
                      {selectedIdea.integration.recordCount}
                    </p>
                  </section>
                </div>
              ) : (
                <p style={{ ...styles.empty, marginTop: "14px" }}>
                  Pick an idea to inspect how it connects to downstream repository work.
                </p>
              )}
            </section>

            {renderReferenceList(
              "Linked projects",
              selectedIdea?.related.projects ?? [],
              "No projects linked yet.",
            )}
            {renderReferenceList(
              "Linked tasks",
              selectedIdea?.related.tasks ?? [],
              "No execution tasks linked yet.",
            )}
            {renderReferenceList(
              "Linked files",
              selectedIdea?.related.files ?? [],
              "No supporting files linked yet.",
            )}
          </div>
        </div>
      </section>
    </article>
  );
}
