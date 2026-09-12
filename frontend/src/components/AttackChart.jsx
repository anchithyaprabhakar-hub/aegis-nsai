import { Pie } from "react-chartjs-2";

import {
  Chart as ChartJS,
  ArcElement,
  Tooltip,
  Legend,
} from "chart.js";

ChartJS.register(
  ArcElement,
  Tooltip,
  Legend
);

function AttackChart({ logs = [] }) {
  // Always work with an array.
  // This prevents the dashboard from crashing when logs
  // has not been initialized yet.
  const safeLogs = Array.isArray(logs) ? logs : [];

  const attackCounts = {};

  safeLogs.forEach((log) => {
    if (!log) return;

    const prediction = String(
      log.prediction || log.attack || "Unknown"
    ).trim();

    attackCounts[prediction] =
      (attackCounts[prediction] || 0) + 1;
  });

  const data = {
    labels: Object.keys(attackCounts),
    datasets: [
      {
        data: Object.values(attackCounts),
        backgroundColor: [
          "#ef4444",
          "#3b82f6",
          "#22c55e",
          "#f59e0b",
          "#a855f7",
          "#06b6d4",
        ],
        borderColor: "#171717",
        borderWidth: 2,
      },
    ],
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,

    plugins: {
      legend: {
        position: "bottom",
        labels: {
          color: "#ffffff",
          font: {
            size: 14,
          },
        },
      },
    },
  };

  return (
    <div
      className="info-card"
      style={{
        gridColumn: "1 / span 2",
      }}
    >
      <h3>Attack Distribution</h3>

      {safeLogs.length === 0 ? (
        <p>No attack data available.</p>
      ) : (
        <div
          style={{
            height: "420px",
            position: "relative",
          }}
        >
          <Pie
            data={data}
            options={options}
          />
        </div>
      )}
    </div>
  );
}

export default AttackChart;