"use client";
import axios from "axios";
import { useState } from "react";
const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || `${process.env.NEXT_PUBLIC_API_URL}/admin`,
});

// Attach token to every request automatically
api.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});


export default function CorrectModal({ record, onClose, onSuccess }) {
  const [field,    setField]    = useState("punchInTime");
  const [newValue, setNewValue] = useState("");
  const [note,     setNote]     = useState("");
  const [loading,  setLoading]  = useState(false);
  const [error,    setError]    = useState("");

  const fieldOptions = [
    { value: "punchInTime",  label: "Punch In Time" },
    { value: "punchOutTime", label: "Punch Out Time" },
    { value: "status",       label: "Status" },
  ];

  const statusOptions = ["present", "absent", "punched_in", "punched_out"];

  const handleSubmit = async () => {
    if (!newValue) return setError("Please enter a new value.");
    if (!note)     return setError("Please provide a correction note.");
    setLoading(true);
    setError("");
    try {
      await api.correctAttendance(record._id, { field, newValue, note });
      onSuccess("Attendance corrected and audit log updated.");
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  };

  // Current value for the selected field
  const currentValue = () => {
    if (field === "punchInTime")  return record.punchInTime  ? new Date(record.punchInTime).toLocaleString()  : "—";
    if (field === "punchOutTime") return record.punchOutTime ? new Date(record.punchOutTime).toLocaleString() : "—";
    if (field === "status")       return record.status || "—";
    return "—";
  };

  return (
    <div style={styles.overlay} onClick={onClose}>
      <div style={styles.modal} onClick={(e) => e.stopPropagation()}>
        <div style={styles.header}>
          <div>
            <h2 style={styles.title}>✏️ Correct Attendance</h2>
            <p style={styles.sub}>
              {record.userId?.name || "Employee"} · {record.date}
            </p>
          </div>
          <button style={styles.close} onClick={onClose}>✕</button>
        </div>

        <div style={styles.body}>
          {/* Record snapshot */}
          <div style={styles.snapshot}>
            <SnapItem label="Mode"      value={record.mode === "A" ? "Mode A — Geo-Fenced" : "Mode B — Remote"} />
            <SnapItem label="Status"    value={record.status?.replace("_", " ") || "—"} />
            <SnapItem label="Punch In"  value={record.punchInTime  ? new Date(record.punchInTime).toLocaleString()  : "—"} />
            <SnapItem label="Punch Out" value={record.punchOutTime ? new Date(record.punchOutTime).toLocaleString() : "—"} />
          </div>

          {/* Field selector */}
          <div style={styles.formGroup}>
            <label style={styles.label}>Field to Correct</label>
            <select
              style={styles.select}
              value={field}
              onChange={(e) => { setField(e.target.value); setNewValue(""); }}
            >
              {fieldOptions.map((o) => (
                <option key={o.value} value={o.value}>{o.label}</option>
              ))}
            </select>
          </div>

          {/* Current value display */}
          <div style={styles.currentVal}>
            <span style={{ color: "#64748b", fontSize: "12px" }}>Current value: </span>
            <span style={{ color: "#f59e0b", fontWeight: "600", fontSize: "13px" }}>{currentValue()}</span>
          </div>

          {/* New value input */}
          <div style={styles.formGroup}>
            <label style={styles.label}>New Value</label>
            {field === "status" ? (
              <select
                style={styles.select}
                value={newValue}
                onChange={(e) => setNewValue(e.target.value)}
              >
                <option value="">Select status...</option>
                {statusOptions.map((s) => (
                  <option key={s} value={s}>{s.replace("_", " ")}</option>
                ))}
              </select>
            ) : (
              <input
                type="datetime-local"
                style={styles.select}
                value={newValue}
                onChange={(e) => setNewValue(e.target.value)}
              />
            )}
          </div>

          {/* Note */}
          <div style={styles.formGroup}>
            <label style={styles.label}>Correction Note <span style={{ color: "#ef4444" }}>*</span></label>
            <textarea
              style={styles.textarea}
              rows={3}
              placeholder="Explain the reason for this correction (required for audit log)..."
              value={note}
              onChange={(e) => setNote(e.target.value)}
            />
          </div>

          {error && <div style={styles.error}>{error}</div>}

          {/* Audit notice */}
          <div style={styles.auditNotice}>
            🔒 This correction will be recorded in the immutable audit log with your identity, timestamp, and before/after values.
          </div>

          <div style={styles.btnRow}>
            <button style={styles.btnCancel} onClick={onClose}>Cancel</button>
            <button
              style={{ ...styles.btnSubmit, opacity: loading ? 0.6 : 1 }}
              onClick={handleSubmit}
              disabled={loading}
            >
              {loading ? "Saving..." : "✓ Save Correction"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

function SnapItem({ label, value }) {
  return (
    <div>
      <div style={{ fontSize: "11px", color: "#64748b", fontWeight: "600" }}>{label}</div>
      <div style={{ fontSize: "13px", color: "#e2e8f0", fontWeight: "500", marginTop: "2px" }}>{value}</div>
    </div>
  );
}

const styles = {
  overlay: {
    position: "fixed", inset: 0, background: "rgba(0,0,0,0.7)",
    zIndex: 1000, display: "flex", alignItems: "center", justifyContent: "center",
    padding: "20px",
  },
  modal: {
    background: "#1e293b", borderRadius: "16px",
    border: "1px solid #334155", width: "100%", maxWidth: "520px",
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
  body: { padding: "20px 24px" },
  snapshot: {
    display: "grid", gridTemplateColumns: "1fr 1fr",
    gap: "12px", background: "#0f172a", borderRadius: "10px",
    padding: "14px", marginBottom: "20px",
  },
  formGroup: { marginBottom: "16px" },
  label: { display: "block", fontSize: "12px", fontWeight: "600", color: "#94a3b8", marginBottom: "6px", letterSpacing: "0.5px" },
  select: {
    width: "100%", background: "#0f172a", border: "1px solid #334155",
    borderRadius: "8px", color: "#e2e8f0", padding: "10px 12px",
    fontSize: "14px", outline: "none", boxSizing: "border-box",
  },
  textarea: {
    width: "100%", background: "#0f172a", border: "1px solid #334155",
    borderRadius: "8px", color: "#e2e8f0", padding: "10px 12px",
    fontSize: "14px", outline: "none", resize: "vertical",
    boxSizing: "border-box", fontFamily: "inherit",
  },
  currentVal: {
    background: "#0f172a", borderRadius: "8px", padding: "8px 12px",
    marginBottom: "16px", marginTop: "-10px",
  },
  error: {
    background: "#450a0a", color: "#fca5a5",
    padding: "10px 14px", borderRadius: "8px", fontSize: "13px", marginBottom: "14px",
  },
  auditNotice: {
    background: "#1c1917", border: "1px solid #44403c",
    borderRadius: "8px", padding: "10px 14px",
    fontSize: "12px", color: "#a8a29e", marginBottom: "16px", lineHeight: 1.5,
  },
  btnRow: { display: "flex", gap: "10px", justifyContent: "flex-end" },
  btnCancel: {
    background: "#334155", border: "none", color: "#94a3b8",
    padding: "10px 20px", borderRadius: "8px", cursor: "pointer", fontWeight: "600",
  },
  btnSubmit: {
    background: "#3b82f6", border: "none", color: "#fff",
    padding: "10px 24px", borderRadius: "8px", cursor: "pointer",
    fontWeight: "700", fontSize: "14px",
  },
};