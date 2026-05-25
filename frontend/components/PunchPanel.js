"use client";

import { useState, useEffect } from "react";
import axios from "axios";

const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || "${process.env.NEXT_PUBLIC_API_URL}/admin",
});

// Attach token to every request automatically
api.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

export default function PunchPanel({ onSuccess }) {
  const [status, setStatus]                 = useState("idle");
  const [loading, setLoading]               = useState(false);
  const [error, setError]                   = useState("");
  const [consent, setConsent]               = useState(false);
  const [consentLoading, setConsentLoading] = useState(false);
  const [locationMsg, setLocationMsg]       = useState("");
  const [sessionInfo, setSessionInfo]       = useState(null);
  const [elapsed, setElapsed]               = useState(0);

  // ── Session timer ──────────────────────────────────────────────────────────
  useEffect(() => {
    let interval;
    if (status === "punched_in" && sessionInfo?.punchInTime) {
      interval = setInterval(() => {
        const diff = Math.floor((Date.now() - new Date(sessionInfo.punchInTime)) / 1000);
        setElapsed(diff);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [status, sessionInfo]);

  function formatElapsed(sec) {
    const h = Math.floor(sec / 3600);
    const m = Math.floor((sec % 3600) / 60);
    const s = sec % 60;
    return `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
  }

  // ── GPS ────────────────────────────────────────────────────────────────────
  async function getCoords() {
    if (!navigator.geolocation) throw new Error("Geolocation not supported.");
    return await new Promise((resolve, reject) => {
      navigator.geolocation.getCurrentPosition(
        (pos) => resolve({ lat: pos.coords.latitude, lng: pos.coords.longitude, accuracy: pos.coords.accuracy }),
        ()    => reject(new Error("Could not get GPS. Please enable location access.")),
        { enableHighAccuracy: true, timeout: 10000 }
      );
    });
  }

  // ── Grant / Revoke Consent ─────────────────────────────────────────────────
  const handleConsent = async (value) => {
    setConsentLoading(true);
    setError("");
    try {
      const res = await api.patch("/consent", { consent: value });
      setConsent(value);
      onSuccess(res.data.message);
    } catch (e) {
      setError(e.response?.data?.message || e.message);
    } finally {
      setConsentLoading(false);
    }
  };

  // ── Punch In ───────────────────────────────────────────────────────────────
  const handlePunchIn = async () => {
    setLoading(true);
    setError("");
    setLocationMsg("");
    try {
      const coords = await getCoords();
      const res    = await api.post("/punch-in", coords);
      setSessionInfo(res.data.record);
      setStatus("punched_in");
      onSuccess(res.data.message);
    } catch (e) {
      setError(e.response?.data?.message || e.message);
    } finally {
      setLoading(false);
    }
  };

  // ── Punch Out ──────────────────────────────────────────────────────────────
  const handlePunchOut = async () => {
    setLoading(true);
    setError("");
    try {
      let coords = {};
      try { coords = await getCoords(); } catch {} // GPS optional on punch-out

      const res = await api.post("/punch-out", coords);
      setStatus("idle");
      setSessionInfo(null);
      setElapsed(0);
      onSuccess(`${res.data.message} Duration: ${res.data.duration} min`);
    } catch (e) {
      setError(e.response?.data?.message || e.message);
    } finally {
      setLoading(false);
    }
  };

  // ── Report Location Off ────────────────────────────────────────────────────
  const handleLocationOff = async () => {
    setError("");
    try {
      const res = await api.post("/location-off", {});
      setLocationMsg(res.data.message);
    } catch (e) {
      setError(e.response?.data?.message || e.message);
    }
  };

  // ── Render ─────────────────────────────────────────────────────────────────
  return (
    <div style={styles.container}>

      {/* ── Consent ── */}
      <div style={styles.card}>
        <h2 style={styles.cardTitle}>📍 Location Consent</h2>
        <p style={styles.cardDesc}>
          FieldTrack Pro requires your consent before collecting GPS data.
          You must consent to punch in.
        </p>
        <div style={styles.consentRow}>
          <button
            style={{ ...styles.consentBtn, ...(consent ? styles.consentActive : {}) }}
            onClick={() => handleConsent(true)}
            disabled={consentLoading}
          >
            ✅ Grant Consent
          </button>
          <button
            style={{ ...styles.consentBtn, ...(!consent ? styles.consentRevoked : {}) }}
            onClick={() => handleConsent(false)}
            disabled={consentLoading}
          >
            ❌ Revoke Consent
          </button>
        </div>
        <p style={styles.consentStatus}>
          Status:{" "}
          <strong style={{ color: consent ? "#10b981" : "#ef4444" }}>
            {consent ? "Consent Granted" : "Consent Not Given"}
          </strong>
        </p>
      </div>

      {/* ── Punch In / Out ── */}
      <div style={styles.card}>
        <h2 style={styles.cardTitle}>⏱ Attendance</h2>

        {status === "punched_in" && (
          <div style={styles.timerBox}>
            <div style={styles.timerLabel}>SESSION ACTIVE</div>
            <div style={styles.timer}>{formatElapsed(elapsed)}</div>
            {sessionInfo?.mode === "A" && sessionInfo?.zoneName && (
              <div style={styles.zoneBadge}>📌 Zone: {sessionInfo.zoneName}</div>
            )}
            {sessionInfo?.mode === "B" && (
              <div style={styles.zoneBadge}>🛰 Remote Tracking Active</div>
            )}
          </div>
        )}

        <div style={styles.punchRow}>
          <button
            style={{
              ...styles.punchBtn,
              background: status === "idle" ? "#10b981" : "#1f2937",
              opacity: status === "punched_in" ? 0.4 : 1,
              cursor: status === "punched_in" || loading ? "not-allowed" : "pointer",
            }}
            onClick={handlePunchIn}
            disabled={status === "punched_in" || loading}
          >
            {loading && status === "idle" ? "Getting GPS..." : "🟢 Punch In"}
          </button>

          <button
            style={{
              ...styles.punchBtn,
              background: status === "punched_in" ? "#ef4444" : "#1f2937",
              opacity: status === "idle" ? 0.4 : 1,
              cursor: status === "idle" || loading ? "not-allowed" : "pointer",
            }}
            onClick={handlePunchOut}
            disabled={status === "idle" || loading}
          >
            {loading && status === "punched_in" ? "Processing..." : "🔴 Punch Out"}
          </button>
        </div>

        {error && <div style={styles.error}>{error}</div>}
      </div>

      {/* ── GPS Off Report ── */}
      {status === "punched_in" && (
        <div style={styles.card}>
          <h2 style={styles.cardTitle}>⚠️ GPS Issue?</h2>
          <p style={styles.cardDesc}>
            If your GPS was disabled during your shift, report it here so your admin is notified immediately.
          </p>
          <button style={styles.warnBtn} onClick={handleLocationOff}>
            Report GPS Disabled
          </button>
          {locationMsg && (
            <p style={{ color: "#fbbf24", marginTop: 10, fontSize: 13, margin: "10px 0 0" }}>
              ✓ {locationMsg}
            </p>
          )}
        </div>
      )}

    </div>
  );
}

const styles = {
  container: { display: "flex", flexDirection: "column", gap: "16px", maxWidth: "520px" },
  card: { background: "#1e293b", border: "1px solid #334155", borderRadius: "14px", padding: "24px" },
  cardTitle: { fontSize: "16px", fontWeight: "700", color: "#f1f5f9", margin: "0 0 8px" },
  cardDesc:  { fontSize: "13px", color: "#64748b", margin: "0 0 16px", lineHeight: 1.6 },
  consentRow: { display: "flex", gap: "10px" },
  consentBtn: {
    flex: 1, padding: "10px", borderRadius: "8px", border: "1px solid #334155",
    background: "#0f172a", color: "#94a3b8", cursor: "pointer",
    fontWeight: "600", fontSize: "14px", transition: "all 0.2s",
  },
  consentActive:  { background: "#064e3b", borderColor: "#10b981", color: "#10b981" },
  consentRevoked: { background: "#450a0a", borderColor: "#ef4444", color: "#ef4444" },
  consentStatus:  { fontSize: "13px", color: "#64748b", marginTop: "12px", marginBottom: 0 },
  timerBox: {
    background: "#0f172a", borderRadius: "10px", padding: "20px",
    textAlign: "center", marginBottom: "16px", border: "1px solid #1e3a5f",
  },
  timerLabel: { fontSize: "11px", color: "#64748b", letterSpacing: "1.5px", fontWeight: "700" },
  timer:      { fontSize: "42px", fontWeight: "800", color: "#3b82f6", fontVariantNumeric: "tabular-nums" },
  zoneBadge: {
    display: "inline-block", marginTop: "8px", background: "#1e3a5f",
    color: "#93c5fd", padding: "4px 12px", borderRadius: "20px",
    fontSize: "12px", fontWeight: "600",
  },
  punchRow: { display: "flex", gap: "12px" },
  punchBtn: {
    flex: 1, padding: "14px", borderRadius: "10px",
    border: "none", color: "#fff", fontSize: "15px",
    fontWeight: "700", transition: "all 0.2s",
  },
  error: {
    background: "#450a0a", color: "#fca5a5",
    padding: "10px 14px", borderRadius: "8px",
    fontSize: "13px", marginTop: "12px",
  },
  warnBtn: {
    background: "#451a03", border: "1px solid #f59e0b", color: "#fbbf24",
    padding: "10px 18px", borderRadius: "8px", cursor: "pointer",
    fontWeight: "600", fontSize: "14px",
  },
};