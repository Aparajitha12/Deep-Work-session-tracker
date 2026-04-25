import { useState } from "react";
import { createSession } from "../api/sessions";

export default function SessionForm({ onCreated }) {
  const [form, setForm] = useState({ title: "", goal: "", scheduled_duration: "" });
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState("");

  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));

  const submit = async () => {
    if (!form.title.trim()) return setErr("Session title is required.");
    if (!form.scheduled_duration || parseInt(form.scheduled_duration) <= 0)
      return setErr("Duration must be greater than 0 minutes.");
    if (parseInt(form.scheduled_duration) > 480)
      return setErr("Duration cannot exceed 480 minutes (8 hours).");
    setErr("");
    setLoading(true);
    try {
      await createSession({ ...form, scheduled_duration: parseInt(form.scheduled_duration) });
      setForm({ title: "", goal: "", scheduled_duration: "" });
      onCreated();
    } catch (e) {
      if (e.response) {
        const detail = e.response.data?.detail;
        if (Array.isArray(detail)) {
          setErr(detail.map(d => d.msg.replace("Value error, ", "")).join(". "));
        } else if (typeof detail === "string") {
          setErr(detail);
        } else {
          setErr(`Server error (${e.response.status}). Please try again.`);
        }
      } else {
        setErr("Cannot connect to server. Make sure the backend is running.");
      }
    } finally {
      setLoading(false);
    }
  };

  const inputStyle = {
    background: "#111118",
    border: "1px solid #22223a",
    borderRadius: 7,
    padding: "11px 14px",
    color: "#e8e8f0",
    fontSize: 13,
    fontFamily: "'Inter', system-ui, -apple-system, 'Segoe UI', Roboto, 'Helvetica Neue', Arial",
    width: "100%",
    transition: "border-color 0.15s",
    outline: "none",
  };

  return (
    <div style={{
      background: "#0f0f1a",
      border: "1px solid #1a1a2e",
      borderRadius: 12,
      padding: "22px 24px",
    }}>
      <div style={{
        fontSize: 10, fontWeight: 600, color: "#cfcfe5",
        letterSpacing: 2, textTransform: "uppercase", marginBottom: 16,
        fontFamily: "'Inter', system-ui, -apple-system, 'Segoe UI', Roboto, 'Helvetica Neue', Arial",
      }}>
        New Session
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 90px", gap: 8, marginBottom: 8 }}>
        <input
          placeholder="Session title *"
          value={form.title}
          onChange={e => set("title", e.target.value)}
          onKeyDown={e => e.key === "Enter" && submit()}
          style={inputStyle}
        />
        <input
          placeholder="Goal (optional)"
          value={form.goal}
          onChange={e => set("goal", e.target.value)}
          style={inputStyle}
        />
        <input
          placeholder="Mins *"
          type="number"
          min="1"
          max="480"
          value={form.scheduled_duration}
          onChange={e => set("scheduled_duration", e.target.value)}
          onKeyDown={e => e.key === "Enter" && submit()}
          style={inputStyle}
        />
      </div>

      {err && (
        <div style={{
          fontSize: 12, color: "#ff8080",
          background: "#1a0a0a",
          border: "1px solid #3a1515",
          borderRadius: 6,
          padding: "8px 12px",
          marginBottom: 10,
          fontFamily: "'Inter', system-ui, -apple-system, 'Segoe UI', Roboto, 'Helvetica Neue', Arial",
        }}>
          Error: {err}
        </div>
      )}

      <button
        onClick={submit}
        disabled={loading}
        style={{
          background: loading ? "#0d1f18" : "#00d68f",
          color: loading ? "#1a3a2a" : "#0a0a0f",
          border: "none",
          borderRadius: 7,
          padding: "10px 22px",
          fontSize: 13,
          fontWeight: 600,
          letterSpacing: 0.3,
          transition: "all 0.15s",
          opacity: loading ? 0.7 : 1,
          cursor: loading ? "not-allowed" : "pointer",
        }}
      >
        {loading ? "Scheduling..." : "+ Schedule Session"}
      </button>
    </div>
  );
}