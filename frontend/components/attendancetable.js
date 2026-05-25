"use client";

export default function AttendanceTable({ records, role, onViewBreadcrumbs, onCorrect }) {
  if (!records || records.length === 0) {
    return (
      <div style={styles.empty}>
        <div style={styles.emptyIcon}>📋</div>
        <p>No attendance records found.</p>
      </div>
    );
  }

  return (
    <div style={styles.wrapper}>
      <div style={styles.scrollArea}>
        <table style={styles.table}>
          <thead>
            <tr>
              {role !== "member" && <Th>Employee</Th>}
              <Th>Mode</Th>
              <Th>Date</Th>
              <Th>Punch In</Th>
              <Th>Punch Out</Th>
              <Th>Status</Th>
              {/* Mode A */}
              <Th>Zone</Th>
              {/* Mode B */}
              <Th>Distance</Th>
              <Th>Duration</Th>
              {/* Failed */}
              <Th>Result</Th>
              {/* Actions */}
              {(onViewBreadcrumbs || onCorrect) && <Th>Actions</Th>}
            </tr>
          </thead>
          <tbody>
            {records.map((rec) => (
              <tr key={rec._id} style={styles.row}>
                {role !== "member" && (
                  <td style={styles.td}>
                    <div style={styles.empName}>{rec.userId?.name || "—"}</div>
                    <div style={styles.empEmail}>{rec.userId?.email || ""}</div>
                  </td>
                )}

                {/* Mode badge */}
                <td style={styles.td}>
                  <span style={rec.mode === "A" ? styles.modeA : styles.modeB}>
                    {rec.mode === "A" ? "Mode A" : "Mode B"}
                  </span>
                </td>

                <td style={styles.td}>{rec.date || "—"}</td>

                <td style={styles.td}>
                  {rec.punchInTime
                    ? new Date(rec.punchInTime).toLocaleTimeString()
                    : "—"}
                </td>

                <td style={styles.td}>
                  {rec.punchOutTime
                    ? new Date(rec.punchOutTime).toLocaleTimeString()
                    : <span style={styles.active}>Active</span>}
                </td>

                {/* Status badge */}
                <td style={styles.td}>
                  <span style={statusStyle(rec.status)}>
                    {rec.status?.replace("_", " ") || "—"}
                  </span>
                </td>

                {/* Zone (Mode A) */}
                <td style={styles.td}>
                  {rec.mode === "A" ? (
  rec.zoneName ? (
    <span style={styles.zone}>
  📌 {rec.zoneName?.name} ({rec.zoneName?.radius}m)
</span>
                    ) : rec.failedAttempt ? (
                      <span style={styles.failed}>
                        Outside {rec.distanceFromZone ? `(${rec.distanceFromZone}m)` : ""}
                      </span>
                    ) : "—"
                  ) : <span style={styles.na}>N/A</span>}
                </td>

                {/* Distance (Mode B) */}
                <td style={styles.td}>
                  {rec.mode === "B"
                    ? rec.totalDistance != null
                      ? `${(rec.totalDistance / 1000).toFixed(2)} km`
                      : "—"
                    : <span style={styles.na}>N/A</span>}
                </td>

                {/* Duration (Mode B) */}
                <td style={styles.td}>
                  {rec.mode === "B"
                    ? rec.duration != null
                      ? formatDuration(rec.duration)
                      : "—"
                    : <span style={styles.na}>N/A</span>}
                </td>

                {/* Failed / Success */}
                <td style={styles.td}>
                  {rec.failedAttempt ? (
                    <span style={styles.failedBadge} title={rec.failedReason}>
                      ✗ {rec.failedReason?.replace(/_/g, " ") || "Failed"}
                    </span>
                  ) : (
                    <span style={styles.successBadge}>✓ OK</span>
                  )}
                </td>

                {/* Actions */}
                {(onViewBreadcrumbs || onCorrect) && (
                  <td style={styles.td}>
                    <div style={styles.actions}>
                      {onViewBreadcrumbs && rec.mode === "B" && (
                        <button
                          style={styles.actionBtn}
                          onClick={() => onViewBreadcrumbs(rec)}
                        >
                          🛰 Route
                        </button>
                      )}
                      {onCorrect && (
                        <button
                          style={{ ...styles.actionBtn, background: "#1e3a5f", color: "#93c5fd" }}
                          onClick={() => onCorrect(rec)}
                        >
                          ✏️ Correct
                        </button>
                      )}
                    </div>
                  </td>
                )}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div style={styles.footer}>
        Showing {records.length} record{records.length !== 1 ? "s" : ""}
      </div>
    </div>
  );
}

function Th({ children }) {
  return <th style={styles.th}>{children}</th>;
}

function statusStyle(status) {
  const base = {
    padding: "3px 10px", borderRadius: "20px",
    fontSize: "11px", fontWeight: "700", textTransform: "uppercase",
  };
  const map = {
    present:    { background: "#064e3b", color: "#34d399" },
    punched_in: { background: "#1e3a5f", color: "#60a5fa" },
    absent:     { background: "#450a0a", color: "#f87171" },
    punched_out:{ background: "#1c1917", color: "#a8a29e" },
  };
  return { ...base, ...(map[status] || { background: "#1e293b", color: "#94a3b8" }) };
}

function formatDuration(minutes) {
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  return h > 0 ? `${h}h ${m}m` : `${m}m`;
}

const styles = {
  wrapper: { background: "#1e293b", borderRadius: "14px", overflow: "hidden", border: "1px solid #334155" },
  scrollArea: { overflowX: "auto" },
  table: { width: "100%", borderCollapse: "collapse", minWidth: "860px" },
  th: {
    background: "#0f172a",
    color: "#64748b",
    fontSize: "11px",
    fontWeight: "700",
    letterSpacing: "0.8px",
    textTransform: "uppercase",
    padding: "12px 16px",
    textAlign: "left",
    borderBottom: "1px solid #334155",
  },
  td: {
    padding: "12px 16px",
    fontSize: "13px",
    color: "#cbd5e1",
    borderBottom: "1px solid #1e293b",
    verticalAlign: "middle",
  },
  row: { transition: "background 0.15s" },
  empName:  { fontWeight: "600", color: "#f1f5f9" },
  empEmail: { fontSize: "12px", color: "#64748b" },
  modeA: {
    padding: "3px 10px", borderRadius: "20px", fontSize: "11px",
    fontWeight: "700", background: "#064e3b", color: "#34d399",
  },
  modeB: {
    padding: "3px 10px", borderRadius: "20px", fontSize: "11px",
    fontWeight: "700", background: "#451a03", color: "#fb923c",
  },
  active: { color: "#34d399", fontWeight: "600" },
  zone:   { color: "#93c5fd", fontSize: "12px" },
  failed: { color: "#f87171", fontSize: "12px" },
  na:     { color: "#334155", fontSize: "12px" },
  failedBadge: {
    padding: "3px 10px", borderRadius: "20px", fontSize: "11px",
    fontWeight: "700", background: "#450a0a", color: "#f87171",
  },
  successBadge: {
    padding: "3px 10px", borderRadius: "20px", fontSize: "11px",
    fontWeight: "700", background: "#064e3b", color: "#34d399",
  },
  actions: { display: "flex", gap: "6px" },
  actionBtn: {
    background: "#064e3b", color: "#34d399", border: "none",
    borderRadius: "6px", padding: "5px 10px", cursor: "pointer",
    fontSize: "12px", fontWeight: "600",
  },
  empty: { textAlign: "center", padding: "60px 20px", color: "#64748b" },
  emptyIcon: { fontSize: "40px", marginBottom: "12px" },
  footer: {
    padding: "10px 16px",
    fontSize: "12px",
    color: "#475569",
    borderTop: "1px solid #334155",
    background: "#0f172a",
  },
};