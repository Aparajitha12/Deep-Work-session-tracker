import { useMemo } from "react";
import { Bar, Line } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
);

export default function LiveChart({ sessions }) {
  const { statusCounts, avgProgress, labels } = useMemo(() => {
    const counts = { scheduled: 0, active: 0, paused: 0, completed: 0, overdue: 0, interrupted: 0, abandoned: 0 };
    let totalProgress = 0;
    let progCount = 0;

    for (const s of sessions) {
      counts[s.status] = (counts[s.status] || 0) + 1;
      if (s.status === 'active' && s.scheduled_duration && s.start_time) {
      const totalSecs = s.scheduled_duration * 60;
      const start = new Date(s.start_time).getTime();
        if (!Number.isNaN(start)) {
          const elapsed = Math.max(0, Math.floor((Date.now() - start) / 1000));
          const p = Math.min(100, Math.round((elapsed / totalSecs) * 100));
          totalProgress += p;
          progCount += 1;
        }
      }
    }

    const labels = ["scheduled","active","paused","completed","overdue","interrupted","abandoned"];
    return { statusCounts: counts, avgProgress: progCount ? Math.round(totalProgress / progCount) : 0, labels };
  }, [sessions]);

  const barData = useMemo(() => ({
    labels: labels.map(l => l.toUpperCase()),
    datasets: [
      {
        label: 'Sessions',
        data: labels.map(l => statusCounts[l] || 0),
        backgroundColor: ['#00d68f','#00ff99','#ffcc00','#44aaff','#ff8800','#ff5555','#7777aa'],
        borderRadius: 6,
      }
    ]
  }), [labels, statusCounts]);

  const lineData = useMemo(() => ({
    labels: ['now'],
    datasets: [{
      label: 'Avg progress (active)',
      data: [avgProgress],
      borderColor: '#00d68f',
      backgroundColor: 'rgba(0,214,143,0.12)',
      tension: 0.3,
      fill: true,
    }]
  }), [avgProgress]);

  const barOpts = { plugins: { legend: { display: false } }, maintainAspectRatio: false };
  const lineOpts = { plugins: { legend: { display: false } }, scales: { y: { max: 100, min: 0 } }, maintainAspectRatio: false };

  return (
    <div style={{ display: 'flex', gap: 12, marginBottom: 20, alignItems: 'stretch' }}>
      <div style={{ flex: 1, minHeight: 120, background: '#0f0f1a', border: '1px solid #1a1a2e', borderRadius: 10, padding: 12 }}>
        <div style={{ fontSize: 12, color: '#cfcfe5', marginBottom: 8 }}>Sessions by status</div>
        <div style={{ height: 90 }}>
          <Bar data={barData} options={barOpts} />
        </div>
      </div>

      <div style={{ width: 170, minHeight: 120, background: '#0f0f1a', border: '1px solid #1a1a2e', borderRadius: 10, padding: 12 }}>
        <div style={{ fontSize: 12, color: '#cfcfe5', marginBottom: 8 }}>Avg active progress</div>
        <div style={{ height: 90 }}>
          <Line data={lineData} options={lineOpts} />
        </div>
        <div style={{ marginTop: 8, fontSize: 13, color: '#9fa8c6', fontWeight: 600 }}>{avgProgress}%</div>
      </div>
    </div>
  );
}
