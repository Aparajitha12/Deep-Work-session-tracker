const STATUS_CFG = {
  completed:   { color: "#4488ff", label: "COMPLETED" },
  overdue:     { color: "#ff8800", label: "OVERDUE" },
  interrupted: { color: "#ff4444", label: "INTERRUPTED" },
  abandoned:   { color: "#555570", label: "ABANDONED" },
};

export default function History({ sessions, loading }) {
  const total = sessions.length;
  const completed = sessions.filter(s => s.status === "completed").length;
  const overdue = sessions.filter(s => s.status === "overdue").length;
  const ratio = total ? Math.round((completed / total) * 100) : 0;
  const avgMins = total && sessions.filter(s => s.actual_duration).length
    ? Math.round(sessions.filter(s => s.actual_duration).reduce((a, s) => a + s.actual_duration, 0) / sessions.filter(s => s.actual_duration).length)
    : 0;

  const Stat = ({ label, value, color }) => (
    <div style={{
      background: "#0f0f1a", border: "1px solid #1a1a2e",
      borderRadius: 10, padding: "16px 18px", flex: 1,
    }}>
      <div style={{
        fontSize: 22, fontWeight: 600, color: color || "#e8e8f0",
        fontFamily: "'Inter', system-ui, -apple-system, 'Segoe UI', Roboto, 'Helvetica Neue', Arial", marginBottom: 6,
      }}>{value}</div>
      <div style={{ fontSize: 10, color: "#9fa8c6", letterSpacing: 1.5, textTransform: "uppercase" }}>{label}</div>
    </div>
  );

  return (
    <div style={{ maxWidth: 980, margin: "0 auto", padding: "8px 12px" }}>
      <div style={{ display: "flex", gap: 12, marginBottom: 28, alignItems: 'stretch' }}>
        <Stat label="Total" value={total} />
        <Stat label="Completed" value={completed} color="#4488ff" />
        <Stat label="Success Rate" value={`${ratio}%`} color={ratio >= 70 ? "#00d68f" : ratio >= 40 ? "#ffaa00" : "#ff4444"} />
        <Stat label="Avg Duration" value={avgMins ? `${avgMins}m` : "—"} color="#6060ff" />
        <Stat label="Overdue" value={overdue} color={overdue > 0 ? "#ff8800" : "#3a3a5a"} />
      </div>

      {loading ? (
        <div style={{ textAlign: "center", color: "#9fa8c6", padding: 48, fontSize: 12 }}>Loading...</div>
      ) : sessions.length === 0 ? (
        <div style={{ textAlign: "center", padding: "56px 0" }}>
          <p style={{ color: "#9fa8c6", fontSize: 13 }}>No completed sessions yet.</p>
        </div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          {sessions.map(s => {
            const cfg = STATUS_CFG[s.status] || { color: "#555570", label: s.status.toUpperCase() };
            return (
              <div key={s.id} style={{
                background: "#0f0f1a",
                border: "1px solid #1a1a2e",
                borderLeft: `4px solid ${cfg.color}`,
                borderRadius: 10,
                padding: "18px 20px",
                display: "flex", justifyContent: "space-between", alignItems: "center",
                gap: 12,
              }}>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{
                    fontSize: 16, fontWeight: 600, color: "#e8e8f0",
                    fontFamily: "'Inter', system-ui, -apple-system, 'Segoe UI', Roboto, 'Helvetica Neue', Arial",
                    marginBottom: 6,
                    overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap",
                  }}>{s.title}</div>
                  <div style={{
                    fontSize: 12, color: "#c9d0df",
                    fontFamily: "'Inter', system-ui, -apple-system, 'Segoe UI', Roboto, 'Helvetica Neue', Arial",
                  }}>
                    {s.scheduled_duration}m planned
                    {s.actual_duration != null && ` · ${s.actual_duration.toFixed(1)}m actual`}
                    {` · ${s.pause_count} pause${s.pause_count !== 1 ? "s" : ""}`}
                    {s.completion_ratio != null && ` · ${Math.round(s.completion_ratio * 100)}% ratio`}
                  </div>
                </div>
                <span style={{
                  fontSize: 9, fontWeight: 600, letterSpacing: 2,
                  color: cfg.color, textTransform: "uppercase",
                  fontFamily: "'Inter', system-ui, -apple-system, 'Segoe UI', Roboto, 'Helvetica Neue', Arial",
                  marginLeft: 16, flexShrink: 0,
                }}>{cfg.label}</span>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}