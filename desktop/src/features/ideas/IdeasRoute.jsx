import React, { useEffect, useMemo, useState } from "react";
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
    gridTemplateColumns: "minmax(0, 1.7fr) minmax(240px, 1fr)",
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

  useEffect(() => {
    if (!allIdeaIds.includes(selectedIdeaId)) {
      setSelectedIdeaId(allIdeaIds[0] ?? null);
    }
  }, [allIdeaIds, selectedIdeaId]);

  const visibleGroups = useMemo(
    () =>
      board.groups.filter((group) => activeStage === "all" || group.key === activeStage),
    [activeStage, board.groups],
  );
  const selectedIdea = selectedIdeaId
    ? selectWorkspaceDetail(snapshot, "idea", selectedIdeaId)
    : null;
  const summary = createPrioritySummary(board.groups);
  const linkedTaskCount = snapshot.ideas.reduce(
    (count, idea) => count + idea.taskIds.length,
    0,
  );

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
              files before promotion.
            </p>
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

          <div style={styles.statGrid}>
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
              <p style={styles.statLabel}>Linked tasks</p>
              <p style={styles.statValue}>{linkedTaskCount}</p>
            </section>
          </div>
        </div>
      </section>

      <section style={styles.board}>
        {visibleGroups.map((group) => (
          <section key={group.key} style={styles.lane}>
            <header style={styles.laneHeader}>
              <h3 style={styles.laneTitle}>{formatStageLabel(group.key)}</h3>
              <span style={styles.laneCount}>{group.count}</span>
            </header>

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
                            {item.related.promotedProject ? "project seeded" : "future backlog"}
                          </span>
                        </div>
                      </button>
                    </li>
                  );
                })
              ) : (
                <li style={styles.empty}>No ideas in this stage yet.</li>
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
                    <span>Last updated</span>
                    <span>{selectedIdea.entity.updatedAt.slice(0, 10)}</span>
                  </li>
                </ul>
              </>
            ) : (
              <p style={styles.empty}>Select an idea card to inspect its links.</p>
            )}
          </section>

          <div style={styles.layout}>
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
