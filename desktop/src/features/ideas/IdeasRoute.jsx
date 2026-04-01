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
    gridTemplateColumns: "repeat(auto-fit, minmax(140px, 1fr))",
    gap: "12px",
    marginTop: "18px",
  },
  metricCard: {
    padding: "14px 16px",
    borderRadius: "16px",
    backgroundColor: "#f5f1eb",
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
  laneGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
    gap: "12px",
  },
  lane: {
    padding: "16px",
    borderRadius: "18px",
    backgroundColor: "#eef2f4",
    border: "1px solid rgba(93, 107, 121, 0.12)",
  },
  laneHeader: {
    display: "flex",
    alignItems: "baseline",
    justifyContent: "space-between",
    gap: "12px",
    marginBottom: "10px",
  },
  laneCount: {
    fontSize: "12px",
    color: "#5d6b79",
  },
  ideaCard: {
    padding: "14px 16px",
    borderRadius: "14px",
    backgroundColor: "#ffffff",
    border: "1px solid rgba(93, 107, 121, 0.14)",
    boxShadow: "0 8px 20px rgba(16, 32, 51, 0.04)",
  },
  ideaStack: {
    display: "grid",
    gap: "10px",
  },
  meta: {
    marginTop: "8px",
    color: "#44515d",
    fontSize: "14px",
  },
  pills: {
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
  callout: {
    marginTop: "24px",
    padding: "18px 20px",
    borderRadius: "18px",
    background: "linear-gradient(135deg, #f4efe7 0%, #eef2f4 100%)",
    border: "1px solid rgba(93, 107, 121, 0.12)",
  },
  calloutTitle: {
    margin: "0 0 8px",
    fontSize: "17px",
  },
  calloutList: {
    display: "grid",
    gap: "8px",
    margin: "12px 0 0",
    paddingLeft: "20px",
  },
};

function sortIdeas(ideas) {
  return [...ideas].sort((left, right) => {
    const updatedDelta =
      new Date(right.updatedAt).getTime() - new Date(left.updatedAt).getTime();

    if (updatedDelta !== 0) {
      return updatedDelta;
    }

    return left.title.localeCompare(right.title);
  });
}

function getIdeaQueueLabel(idea) {
  if (idea.promotedProjectId) {
    return "promoted project tracking";
  }

  if (idea.stage === "validated") {
    return "ready for promotion";
  }

  return "incubation";
}

export default function IdeasRoute({ snapshot }) {
  const ideas = sortIdeas(snapshot.ideas);
  const ideaStageOrder = snapshot.boards.ideas.stageOrder;
  const stagedIdeas = ideaStageOrder.map((stage) => ({
    stage,
    items: ideas.filter((idea) => idea.stage === stage),
  }));
  const futureProjectIdeas = ideas.filter(
    (idea) => idea.stage === "validated" || idea.promotedProjectId,
  );
  const activeIdeas = ideas.filter((idea) => idea.stage !== "promoted");

  const ideaMetrics = ideaStageOrder.map((stage) => ({
    stage,
    count: ideas.filter((idea) => idea.stage === stage).length,
  }));

  return (
    <article style={styles.card}>
      <header style={styles.header}>
        <p style={styles.eyebrow}>Ideas</p>
        <h2 style={styles.title}>Incubation and future project tracking</h2>
        <p style={styles.subtitle}>
          Idea capture stays route-local while the snapshot keeps stage order,
          task links, and promotion targets ready for downstream planning.
        </p>
      </header>

      <section aria-label="Idea pipeline summary" style={styles.metrics}>
        {ideaMetrics.map((metric) => (
          <div key={metric.stage} style={styles.metricCard}>
            <p style={styles.metricLabel}>{metric.stage}</p>
            <p style={styles.metricValue}>{metric.count}</p>
          </div>
        ))}
      </section>

      <section style={styles.section}>
        <h3 style={styles.sectionTitle}>Incubation pipeline</h3>
        <div style={styles.laneGrid}>
          {stagedIdeas.map((lane) => (
            <section key={lane.stage} style={styles.lane} aria-label={lane.stage}>
              <div style={styles.laneHeader}>
                <strong>{lane.stage}</strong>
                <span style={styles.laneCount}>{lane.items.length} ideas</span>
              </div>
              <div style={styles.ideaStack}>
                {lane.items.map((idea) => (
                  <article key={idea.id} style={styles.ideaCard}>
                    <strong>{idea.title}</strong>
                    <div>{idea.summary}</div>
                    <div style={styles.meta}>
                      {idea.taskIds.length} tasks | {idea.projectIds.length} linked projects |{" "}
                      {idea.fileIds.length} files
                    </div>
                    <div style={styles.pills}>
                      <span style={styles.pill}>{getIdeaQueueLabel(idea)}</span>
                      {idea.promotedProjectId ? (
                        <span style={styles.pill}>
                          promoted project {idea.promotedProjectId}
                        </span>
                      ) : null}
                    </div>
                  </article>
                ))}
                {lane.items.length === 0 ? (
                  <div style={styles.meta}>No ideas in this stage yet.</div>
                ) : null}
              </div>
            </section>
          ))}
        </div>
      </section>

      <section style={styles.callout}>
        <h3 style={styles.calloutTitle}>Future project queue</h3>
        <p style={styles.subtitle}>
          These ideas are closest to becoming projects and can be promoted
          without leaving the route boundary.
        </p>
        <ul style={styles.calloutList}>
          {futureProjectIdeas.map((idea) => (
            <li key={idea.id}>
              <strong>{idea.title}</strong> - {getIdeaQueueLabel(idea)}
            </li>
          ))}
          {futureProjectIdeas.length === 0 ? (
            <li>No validated ideas are ready for promotion yet.</li>
          ) : null}
        </ul>
      </section>

      <section style={styles.section}>
        <h3 style={styles.sectionTitle}>Active idea backlog</h3>
        <div style={styles.ideaStack}>
          {activeIdeas.map((idea) => (
            <article key={idea.id} style={styles.ideaCard}>
              <strong>{idea.title}</strong>
              <div>{idea.summary}</div>
              <div style={styles.meta}>
                Stage {idea.stage} | {idea.taskIds.length} tasks | {idea.projectIds.length} linked
                projects
              </div>
            </article>
          ))}
        </div>
      </section>
    </article>
  );
}
