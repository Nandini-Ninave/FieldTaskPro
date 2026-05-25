"use client";
import axios from "axios";
import { useEffect, useState } from "react";
// import { api } from "../lib/api";
const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL ||   `${process.env.NEXT_PUBLIC_API_URL}/admin`,
});

// Attach token to every request automatically
api.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

export default function BreadcrumbModal({ session, onClose }) {
  const [data, setData]       = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError]     = useState("");

  useEffect(() => {
    async function load() {
      try {
        const res = await api.getBreadcrumbs(session._id);
        setData(res);
      } catch (e) {
        setError(e.message);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [session._id]);

  return (
    <div style={styles.overlay} onClick={onClose}>
      <div style={styles.modal} onClick={(e) => e.stopPropagation()}>
        <div style={styles.header}>
          <div>
            <h2 style={styles.title}>🛰 Route Trail</h2>
            <p style={styles.sub}>{session.userId?.name || "Employee"} · Mode B Session</p>
          </div>
          <button style={styles.close} onClick={onClose}>✕</button>
        </div>

        {loading && <div style={styles.loading}>Loading breadcrumbs...</div>}
        {error   && <div style={styles.error}>{error}</div>}

        {data && (
          <>
            {/* Session Summary */}
            <div style={styles.summaryRow}>
              <SummaryItem label="Punch In"  value={data.punchInTime  ? new Date(data.punchInTime).toLocaleString()  : "—"} />
              <SummaryItem label="Punch Out" value={data.punchOutTime ? new Date(data.punchOutTime).toLocaleString() : "Active"} />
              <SummaryItem label="Distance"  value={data.totalDistance != null ? `${(data.totalDistance / 1000).toFixed(2)} km` : "—"} />
              <SummaryItem label="Duration"  value={data.duration != null ? formatDuration(data.duration) : "—"} />
              <SummaryItem label="Points"    value={data.breadcrumbs?.length || 0} />
            </div>

            {/* Breadcrumb List */}
            <div style={styles.listHeader}>
              <span style={styles.listTitle}>GPS Breadcrumbs ({data.breadcrumbs?.length})</span>
            </div>

            <div style={styles.listArea}>
              {data.breadcrumbs?.length === 0 && (
                <p style={{ color: "#64748b", textAlign: "center", padding: 20 }}>No GPS points recorded.</p>
              )}
              {data.breadcrumbs?.map((crumb, i) => (
                <div key={i} style={styles.crumb}>
                  <div style={styles.crumbIndex}>{i + 1}</div>
                  <div style={styles.crumbInfo}>
                    <div style={styles.crumbCoords}>
                      {crumb.lat?.toFixed(6)}, {crumb.lng?.toFixed(6)}
                    </div>
                    <div style={styles.crumbMeta}>
                      {crumb.recordedAt && new Date(crumb.recordedAt).toLocaleTimeString()}
                      {crumb.accuracy != null && ` · Accuracy: ${Math.round(crumb.accuracy)}m`}
                      {crumb.speed    != null && ` · Speed: ${(crumb.speed * 3.6).toFixed(1)} km/h`}
                      {crumb.battery  != null && ` · 🔋 ${crumb.battery}%`}
                    </div>
                  </div>
                  <a
                    href={`https://www.google.com/maps?q=${crumb.lat},${crumb.lng}`}
                    target="_blank"
                    rel="noreferrer"
                    style={styles.mapLink}
                  >
                    🗺
                  </a>
                </div>
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
}

function SummaryItem({ label, value }) {
  return (
    <div style={{ textAlign: "center" }}>
      <div style={{ fontSize: "11px", color: "#64748b", fontWeight: "600", letterSpacing: "0.5px" }}>{label}</div>
      <div style={{ fontSize: "14px", color: "#f1f5f9", fontWeight: "700", marginTop: "2px" }}>{value}</div>
    </div>
  );
}

function formatDuration(minutes) {
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  return h > 0 ? `${h}h ${m}m` : `${m}m`;
}

const styles = {
  overlay: {
    position: "fixed", inset: 0, background: "rgba(0,0,0,0.7)",
    zIndex: 1000, display: "flex", alignItems: "center", justifyContent: "center",
    padding: "20px",
  },
  modal: {
    background: "#1e293b", borderRadius: "16px",
    border: "1px solid #334155", width: "100%", maxWidth: "640px",
    maxHeight: "85vh", display: "flex", flexDirection: "column",
    overflow: "hidden",
  },
  header: {
    display: "flex", justifyContent: "space-between", alignItems: "flex-start",
    padding: "20px 24px", borderBottom: "1px solid #334155",
  },
  title: { margin: 0, fontSize: "18px", fontWeight: "800", color: "#f8fafc" },
  sub:   { margin: "4px 0 0", fontSize: "13px", color: "#64748b" },
  close: {
    background: "#334155", border: "none", color: "#94a3b8",
    width: "32px", height: "32px", borderRadius: "8px",
    cursor: "pointer", fontSize: "14px", fontWeight: "700",
  },
  loading: { padding: "30px", textAlign: "center", color: "#64748b" },
  error:   { margin: "16px", background: "#450a0a", color: "#fca5a5", padding: "12px", borderRadius: "8px" },
  summaryRow: {
    display: "flex", gap: "0", padding: "16px 24px",
    borderBottom: "1px solid #334155",
    justifyContent: "space-around",
  },
  listHeader: { padding: "12px 24px 8px", },
  listTitle: { fontSize: "12px", fontWeight: "700", color: "#64748b", letterSpacing: "0.8px", textTransform: "uppercase" },
  listArea: { overflowY: "auto", padding: "0 24px 24px", flex: 1 },
  crumb: {
    display: "flex", alignItems: "center", gap: "12px",
    padding: "10px 0", borderBottom: "1px solid #0f172a",
  },
  crumbIndex: {
    width: "26px", height: "26px", borderRadius: "50%",
    background: "#0f172a", color: "#3b82f6", fontSize: "11px",
    fontWeight: "700", display: "flex", alignItems: "center",
    justifyContent: "center", flexShrink: 0,
  },
  crumbInfo: { flex: 1 },
  crumbCoords: { fontSize: "13px", color: "#e2e8f0", fontWeight: "600", fontFamily: "monospace" },
  crumbMeta:   { fontSize: "11px", color: "#64748b", marginTop: "2px" },
  mapLink: {
    color: "#3b82f6", textDecoration: "none", fontSize: "16px",
    padding: "4px 8px", borderRadius: "6px", background: "#0f172a",
  },
};