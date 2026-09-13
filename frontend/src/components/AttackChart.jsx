import { Doughnut } from "react-chartjs-2";

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
  /* =========================================================
     NORMALIZE LOGS
  ========================================================= */

  const safeLogs = Array.isArray(logs)
    ? logs.filter(Boolean)
    : [];


  /* =========================================================
     COUNT DETECTIONS
  ========================================================= */

  const attackCounts = {};

  safeLogs.forEach((log) => {
    const prediction = String(
      log?.prediction ||
      log?.attack ||
      "Unknown"
    ).trim();

    if (!prediction) return;

    attackCounts[prediction] =
      (attackCounts[prediction] || 0) + 1;
  });


  /* =========================================================
     SORT DETECTIONS
  ========================================================= */

  const sortedEntries = Object.entries(
    attackCounts
  ).sort(([nameA], [nameB]) => {
    const normalA =
      nameA.toLowerCase() === "normal" ||
      nameA.toLowerCase() === "benign";

    const normalB =
      nameB.toLowerCase() === "normal" ||
      nameB.toLowerCase() === "benign";

    if (normalA && !normalB) return -1;
    if (!normalA && normalB) return 1;

    return nameA.localeCompare(nameB);
  });


  const labels = sortedEntries.map(
    ([label]) => label
  );

  const values = sortedEntries.map(
    ([, value]) => value
  );


  /* =========================================================
     CHART DATA
  ========================================================= */

  const chartData = {
    labels,

    datasets: [
      {
        data: values,

        backgroundColor: [
          "#22c55e",
          "#ef4444",
          "#f97316",
          "#facc15",
          "#a855f7",
          "#38bdf8",
          "#06b6d4",
          "#e879f9",
        ],

        borderColor: "#151515",

        borderWidth: 2,

        hoverOffset: 4,
      },
    ],
  };


  /* =========================================================
     CHART OPTIONS
  ========================================================= */

  const chartOptions = {
    responsive: true,

    maintainAspectRatio: false,

    cutout: "58%",

    animation: {
      duration: 350,
    },

    plugins: {
      legend: {
        position: "right",

        labels: {
          color: "#d4d4d8",

          padding: 8,

          boxWidth: 10,

          boxHeight: 10,

          font: {
            size: 11,
          },
        },
      },

      tooltip: {
        callbacks: {
          label: (context) => {
            const label =
              context.label || "";

            const value =
              Number(context.raw) || 0;

            const total =
              values.reduce(
                (sum, item) =>
                  sum + item,
                0
              );

            const percentage =
              total > 0
                ? (
                    (value / total) *
                    100
                  ).toFixed(1)
                : "0.0";

            return `${label}: ${value} (${percentage}%)`;
          },
        },
      },
    },
  };


  /* =========================================================
     EMPTY STATE
  ========================================================= */

  if (safeLogs.length === 0) {
    return (
      <div
        className="info-card"
        style={{
          width: "100%",
          padding: "18px 22px",
        }}
      >
        <h3
          style={{
            margin: 0,
            textAlign: "center",
            fontSize: "21px",
          }}
        >
          Attack Distribution
        </h3>

        <div
          style={{
            height: "100px",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            color: "#8f8f8f",
            fontSize: "13px",
          }}
        >
          No attack data available.
        </div>
      </div>
    );
  }


  /* =========================================================
     RENDER
  ========================================================= */

  return (
    <div
      className="info-card"
      style={{
        gridColumn: "1 / span 2",
        padding: "18px 22px",
      }}
    >

      {/* HEADER */}

      <div
        style={{
          textAlign: "center",
          marginBottom: "6px",
        }}
      >
        <h3
          style={{
            margin: 0,
            fontSize: "21px",
            fontWeight: "700",
          }}
        >
          Attack Distribution
        </h3>

        <p
          style={{
            margin: "4px 0 0",
            color: "#8f8f8f",
            fontSize: "12px",
          }}
        >
          Distribution of detections recorded during
          this analysis session.
        </p>
      </div>


      {/* COMPACT CHART */}

      <div
        style={{
          width: "100%",
          height: "185px",
          position: "relative",
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          overflow: "hidden",
        }}
      >
        <Doughnut
          data={chartData}
          options={chartOptions}
        />
      </div>

    </div>
  );
}


export default AttackChart;