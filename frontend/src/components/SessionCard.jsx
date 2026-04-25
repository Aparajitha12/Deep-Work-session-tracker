import { useState, useEffect, useRef } from "react";
import { startSession, pauseSession, resumeSession, completeSession } from "../api/sessions";

const STATUS = {
  scheduled:   { color: "#00d68f", bg: "#0a0f0a", label: "SCHEDULED" },
  active:      { color: "#00ff99", bg: "#071210", label: "ACTIVE" },
  paused:      { color: "#ffcc00", bg: "#131000", label: "PAUSED" },
  completed:   { color: "#44aaff", bg: "#070d1a", label: "COMPLETED" },
  interrupted: { color: "#ff5555", bg: "#130707", label: "INTERRUPTED" },
  abandoned:   { color: "#7777aa", bg: "#0d0d12", label: "ABANDONED" },
  overdue:     { color: "#ff8800", bg: "#130d00", label: "OVERDUE" },
};

const hexToRgb = (hex) => {
  const h = hex.replace('#', '');
  const full = h.length === 3 ? h.split('').map(c => c + c).join('') : h;
  const r = parseInt(full.slice(0,2), 16);
  const g = parseInt(full.slice(2,4), 16);
  const b = parseInt(full.slice(4,6), 16);
  return { r, g, b };
};

const luminance = ({ r, g, b }) => {
  const srgb = [r, g, b].map(v => v / 255).map(c => c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4));
  return 0.2126 * srgb[0] + 0.7152 * srgb[1] + 0.0722 * srgb[2];
};

const contrastColor = (bgHex, light = '#ffffff', dark = '#000000') => {
  try {
    const lum = luminance(hexToRgb(bgHex));
    return lum > 0.5 ? dark : light;
  } catch (e) {
    return light;
  }
};

export default function SessionCard({ session, onUpdate }) {
  const [pauseReason, setPauseReason] = useState("");
  const [elapsed, setElapsed] = useState(0);
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState("");
  const intervalRef = useRef(null);
  const startMsRef = useRef(null);

  useEffect(() => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }

    if (session.status === "active") {
      let parsed = null;
      if (session.start_time) {
        parsed = new Date(session.start_time).getTime();
        if (Number.isNaN(parsed)) {
          const raw = session.start_time.endsWith("Z") ? session.start_time : session.start_time + "Z";
          parsed = new Date(raw).getTime();
        }
      }
      if (!session.start_time || Number.isNaN(parsed)) parsed = Date.now();
      startMsRef.current = parsed;

      const tick = () => {
        const diff = Math.floor((Date.now() - startMsRef.current) / 1000);
        setElapsed(diff > 0 ? diff : 0);
      };

      tick();
      intervalRef.current = setInterval(tick, 1000);
    } else {
      setElapsed(0);
    }

    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [session.status, session.start_time]);

  const fmt = (totalSec) => {
    if (totalSec <= 0) return "00:00";
    const h = Math.floor(totalSec / 3600);
    const m = Math.floor((totalSec % 3600) / 60);
    const s = totalSec % 60;
    if (h > 0) return `${String(h).padStart(2,"0")}:${String(m).padStart(2,"0")}:${String(s).padStart(2,"0")}`;
    return `${String(m).padStart(2,"0")}:${String(s).padStart(2,"0")}`;
  };

  const totalSecs = session.scheduled_duration * 60;
  const remaining = Math.max(0, totalSecs - elapsed);
  const isOvertime = elapsed > totalSecs;
  const overtime = isOvertime ? elapsed - totalSecs : 0;
  const progress = totalSecs > 0 ? Math.min((elapsed / totalSecs) * 100, 100) : 0;
  const pausesUsed = session.pause_count || 0;
  const pausesLeft = Math.max(0, 3 - pausesUsed);

  const act = async (fn) => {
    setBusy(true);
    setErr("");
    try {
      await fn();
      onUpdate();
    } catch (e) {
      if (e.response) {
        const detail = e.response.data?.detail;
        if (Array.isArray(detail)) setErr(detail.map(d => d.msg.replace("Value error, ", "")).join(". "));
        else if (typeof detail === "string") setErr(detail);
        else setErr(`Server error (${e.response.status}). Try again.`);
      } else {
        setErr("Cannot reach server.");
      }
    } finally {
      setBusy(false);
    }
  };

  const cfg = STATUS[session.status] || STATUS.scheduled;
  const baseContrast = contrastColor(cfg.bg);
  const textColor = baseContrast === '#ffffff' ? '#f3f6ff' : '#081217';
  const mutedColor = baseContrast === '#ffffff' ? '#9fa8c6' : '#6b7780';

  const ActionBtn = ({ label, onClick, color, bg }) => (
    <button
      onClick={onClick}
      disabled={busy}
      style={{
        background: bg,
        color: color,
        border: `1px solid ${color}55`,
        borderRadius: 7,
        padding: "9px 18px",
        fontSize: 12,
        fontWeight: 700,
        letterSpacing: 0.8,
        fontFamily: "'Inter', system-ui, -apple-system, 'Segoe UI', Roboto, 'Helvetica Neue', Arial",
        opacity: busy ? 0.5 : 1,
        cursor: busy ? "not-allowed" : "pointer",
        transition: "all 0.15s",
        whiteSpace: "nowrap",
      }}
    >{label}</button>
  );

  return (
    <div style={{
      background: cfg.bg,
      border: `1px solid ${cfg.color}33`,
      borderLeft: `3px solid ${cfg.color}`,
      borderRadius: 12,
      padding: "20px 22px",
      marginBottom: 12,
    }}>

      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 14 }}>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{
            fontSize: 17, fontWeight: 700, color: textColor,
            fontFamily: "'Inter', system-ui, -apple-system, 'Segoe UI', Roboto, 'Helvetica Neue', Arial",
            marginBottom: 4,
          }}>{session.title}</div>

          {session.goal && (
            <div style={{ fontSize: 12, color: mutedColor, fontFamily: "'Inter', system-ui, -apple-system, 'Segoe UI', Roboto, 'Helvetica Neue', Arial", marginBottom: 8 }}>
              {session.goal}
            </div>
          )}

          {[("active"), ("paused")].includes(session.status) && (
            <div style={{ display: "flex", alignItems: "center", gap: 6, marginTop: 6 }}>
              {[0, 1, 2].map(i => (
                <div key={i} style={{
                  width: 9, height: 9, borderRadius: "50%",
                  background: i < pausesUsed ? "#ff5555" : "#2a2a44",
                  border: `1px solid ${i < pausesUsed ? "#ff555588" : "#3a3a5a"}`,
                  transition: "background 0.3s",
                }} />
              ))}
              <span style={{
                 fontSize: 11,
                 color: pausesLeft === 0 ? "#ff6666"
                   : pausesLeft === 1 ? "#ffcc00"
                   : mutedColor,
                fontFamily: "'Inter', system-ui, -apple-system, 'Segoe UI', Roboto, 'Helvetica Neue', Arial",
                marginLeft: 2,
              }}>
                {pausesLeft === 0
                  ? "Next pause -> interrupted"
                  : pausesLeft === 1
                  ? `${pausesLeft} pause left`
                  : `${pausesLeft} pauses left`}
              </span>
            </div>
          )}
        </div>

        <div style={{ textAlign: "right", marginLeft: 24, flexShrink: 0 }}>
          <div style={{
            fontSize: 9, fontWeight: 700, letterSpacing: 2.5,
            color: cfg.color, marginBottom: 8,
            fontFamily: "'Inter', system-ui, -apple-system, 'Segoe UI', Roboto, 'Helvetica Neue', Arial",
          }}>{cfg.label}</div>

          {session.status === "active" && (
            <>
              <div style={{
                fontFamily: "'Inter', system-ui, -apple-system, 'Segoe UI', Roboto, 'Helvetica Neue', Arial",
                fontSize: 32, fontWeight: 700,
                color: isOvertime ? "#ff8800" : cfg.color,
                letterSpacing: 3,
                lineHeight: 1,
                fontVariantNumeric: "tabular-nums",
              }}>{fmt(elapsed)}</div>
              <div style={{
                fontFamily: "'Inter', system-ui, -apple-system, 'Segoe UI', Roboto, 'Helvetica Neue', Arial",
                fontSize: 12,
                color: isOvertime ? "#ff8800" : mutedColor,
                marginTop: 6,
                letterSpacing: 0.5,
              }}>
                {isOvertime ? `+${fmt(overtime)} over` : `${fmt(remaining)} left`}
              </div>
            </>
          )}

          {session.status === "paused" && (
            <div style={{ fontSize: 14, color: "#ffcc00", fontFamily: "'Inter', system-ui, -apple-system, 'Segoe UI', Roboto, 'Helvetica Neue', Arial", fontWeight: 600 }}>
              PAUSED
            </div>
          )}

          {session.status === "scheduled" && (
            <div style={{ fontSize: 14, color: mutedColor, fontFamily: "'Inter', system-ui, -apple-system, 'Segoe UI', Roboto, 'Helvetica Neue', Arial" }}>
              {session.scheduled_duration}m
            </div>
          )}
        </div>
      </div>

      {session.status === "active" && (
        <div style={{ marginBottom: 16 }}>
          <div style={{
            height: 5, background: "#1a1a2e",
            borderRadius: 3, overflow: "hidden",
          }}>
            <div style={{
              height: "100%",
              width: `${progress}%`,
              background: isOvertime
                ? "linear-gradient(90deg, #ff8800, #ff4400)"
                : "linear-gradient(90deg, #00d68f, #00ffaa)",
              borderRadius: 3,
              transition: "width 0.9s linear",
            }} />
          </div>
          <div style={{ display: "flex", justifyContent: "space-between", marginTop: 5 }}>
            <span style={{ fontSize: 10, color: mutedColor, fontFamily: "'Inter', system-ui, -apple-system, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, monospace" }}>0:00</span>
            <span style={{ fontSize: 10, color: mutedColor, fontFamily: "'Inter', system-ui, -apple-system, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, monospace" }}>
              {session.scheduled_duration}:00
            </span>
          </div>
        </div>
      )}

      {err && (
          <div style={{
            fontSize: 12, color: "#ffaaaa",
            background: "#1a0808", border: "1px solid #4a1515",
            borderRadius: 6, padding: "9px 13px", marginBottom: 12,
            fontFamily: "'Inter', system-ui, -apple-system, 'Segoe UI', Roboto, 'Helvetica Neue', Arial",
          }}>Error: {err}</div>
      )}

      <div style={{ display: "flex", gap: 8, flexWrap: "wrap", alignItems: "center" }}>
        {session.status === "scheduled" && (
          <ActionBtn
            label="Start Session"
            onClick={() => act(() => startSession(session.id))}
            color="#00ff99"
            bg="#0a1f14"
          />
        )}

        {session.status === "active" && (
          <>
            <input
              placeholder="Enter pause reason before pausing..."
              value={pauseReason}
              onChange={e => setPauseReason(e.target.value)}
              style={{
                flex: 1, minWidth: 200,
                background: "#0d0d1a",
                border: "1px solid #2a2a4a",
                borderRadius: 7,
                padding: "9px 13px",
                color: textColor,
                fontSize: 12,
                fontFamily: "'Inter', system-ui, -apple-system, 'Segoe UI', Roboto, 'Helvetica Neue', Arial",
                outline: "none",
              }}
            />
            <ActionBtn
              label="Pause"
              onClick={() => {
                if (!pauseReason.trim()) {
                  setErr("Please type a reason before pausing - e.g. 'Phone call' or 'Quick break'");
                  return;
                }
                act(() => pauseSession(session.id, pauseReason));
              }}
              color="#ffcc00"
              bg="#1a1500"
            />
            <ActionBtn
              label="Complete"
              onClick={() => act(() => completeSession(session.id))}
              color="#44aaff"
              bg="#07101a"
            />
          </>
        )}

        {session.status === "paused" && (
          <>
            <ActionBtn
              label="Resume"
              onClick={() => act(() => resumeSession(session.id))}
              color="#00ff99"
              bg="#0a1f14"
            />
            <ActionBtn
              label="Complete"
              onClick={() => act(() => completeSession(session.id))}
              color="#44aaff"
              bg="#07101a"
            />
          </>
        )}
      </div>
    </div>
  );
}
