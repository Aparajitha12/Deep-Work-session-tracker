import { useState, useEffect, useCallback } from "react";
import SessionForm from "./components/SessionForm";
import SessionCard from "./components/SessionCard";
import History from "./components/History";
import LiveChart from "./components/LiveChart";
import axios from "axios";

const POLL_INTERVAL = 5000;

export default function App() {
  const [sessions, setSessions] = useState([]);
  const [tab, setTab] = useState("active");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const load = useCallback(async () => {
    try {
      const r = await axios.get("http://localhost:8000/sessions/history");
      setSessions(r.data);
      setError(null);
    } catch (e) {
      if (e.response) {
        setError(`Server error ${e.response.status}: ${e.response.data?.detail || "Unknown error"}`);
      } else {
        setError("Cannot reach backend. Is it running on port 8000?");
      }
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
    const t = setInterval(load, POLL_INTERVAL);
    return () => clearInterval(t);
  }, [load]);

  const active = sessions.filter(s => ["scheduled", "active", "paused"].includes(s.status));
  const history = sessions.filter(s => ["completed", "overdue", "interrupted", "abandoned"].includes(s.status));

  const handleTabChange = (t) => {
    setTab(t);
    setError(null);
  };

  return (
    <div style={{ minHeight: "100vh", background: "#0a0a0f", fontFamily: "'Inter', system-ui, -apple-system, 'Segoe UI', Roboto, 'Helvetica Neue', Arial" }}>
      <link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap" rel="stylesheet" />
      <style>{`
        * { box-sizing: border-box; margin: 0; padding: 0; }
        input, button { font-family: 'Inter', system-ui, -apple-system, 'Segoe UI', Roboto, 'Helvetica Neue', Arial; }
        input::placeholder { color: #6b7780; }
        input { color: #e8e8f0 !important; }
        button { cursor: pointer; }
        @keyframes slideUp { from { opacity: 0; transform: translateY(12px); } to { opacity: 1; transform: translateY(0); } }
        .slide-up { animation: slideUp 0.25s ease forwards; }
        ::-webkit-scrollbar { width: 4px; }
        ::-webkit-scrollbar-track { background: transparent; }
        ::-webkit-scrollbar-thumb { background: #2a2a3a; border-radius: 2px; }
      `}</style>

      <header style={{
        height: 56,
        borderBottom: "1px solid #1a1a2e",
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        padding: "0 32px",
        position: "sticky",
        top: 0,
        background: "#0a0a0fee",
        backdropFilter: "blur(20px)",
        zIndex: 100,
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <div style={{
            width: 24, height: 24, borderRadius: 6,
            background: "#00d68f",
            display: "flex", alignItems: "center", justifyContent: "center",
          }}>
            <div style={{ width: 8, height: 8, borderRadius: 2, background: "#0a0a0f" }} />
          </div>
          <span style={{ color: "#e8e8f0", fontSize: 14, fontWeight: 600, letterSpacing: 0.5 }}>
            DEEPWORK
          </span>
        </div>
        <nav style={{ display: "flex", gap: 2 }}>
          {[
            ["active", `Active (${active.length})`],
            ["history", "History"],
            ["stats", "Stats"],
          ].map(([t, label]) => (
            <button key={t} onClick={() => handleTabChange(t)} style={{
              background: tab === t ? "#1a1a2e" : "transparent",
              color: tab === t ? "#e8e8f0" : "#9fa8c6",
              border: "1px solid " + (tab === t ? "#2a2a4a" : "transparent"),
              borderRadius: 6,
              padding: "5px 14px",
              fontSize: 12,
              fontWeight: 500,
              letterSpacing: 0.3,
              transition: "all 0.15s",
            }}>{label}</button>
          ))}
        </nav>
      </header>

      <main style={{ maxWidth: 1100, margin: "0 auto", padding: "36px 24px" }}>

        {error && (
          <div style={{
            background: "#1a0808",
            border: "1px solid #4a1515",
            borderLeft: "3px solid #ff4444",
            borderRadius: 8,
            padding: "12px 16px",
            marginBottom: 24,
            display: "flex",
            alignItems: "center",
            gap: 10,
          }}>
            <span style={{ color: "#ff6666", fontSize: 12, fontFamily: "'Inter', system-ui, -apple-system, 'Segoe UI', Roboto, 'Helvetica Neue', Arial" }}>
              Error: {error}
            </span>
          </div>
        )}

        {tab === "active" && (
          <div className="slide-up">
            <SessionForm onCreated={load} />
            <div style={{ marginTop: 28 }}>
              {loading ? (
                <div style={{ textAlign: "center", padding: 48, color: "#9fa8c6", fontSize: 12 }}>
                  Loading...
                </div>
              ) : active.length === 0 ? (
                <div style={{
                  textAlign: "center", padding: "56px 0",
                  borderTop: "1px solid #242533",
                }}>
                  <p style={{ color: "#9fa8c6", fontSize: 13 }}>No active sessions. Schedule one above.</p>
                </div>
              ) : (
                active.map((s, i) => (
                  <div key={s.id} className="slide-up" style={{ animationDelay: `${i * 40}ms` }}>
                    <SessionCard session={s} onUpdate={load} />
                  </div>
                ))
              )}
            </div>
          </div>
        )}

        {tab === "stats" && (
          <div className="slide-up">
            <LiveChart sessions={sessions} />
          </div>
        )}

        {tab === "history" && (
          <div className="slide-up">
            <History sessions={history} loading={loading} />
          </div>
        )}

        
      </main>
    </div>
  );
}