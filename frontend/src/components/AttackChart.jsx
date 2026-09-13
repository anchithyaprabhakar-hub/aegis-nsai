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
     ORDER DATA
     
     Keep Normal first, followed by attack categories.
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

  const data = {
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

        hoverOffset: 5,
      },
    ],
  };


  /* =========================================================
     CHART OPTIONS
  ========================================================= */

  const options = {
    responsive: true,

    maintainAspectRatio: false,

    animation: {
      duration: 500,
    },

    plugins: {
      legend: {
        position: "right",

        labels: {
          color: "#d4d4d8",

          padding: 12,

          boxWidth: 12,

          boxHeight: 12,

          font: {
            size: 12,
          },
        },
      },

      tooltip: {
        callbacks: {
          label: (context) => {
            const label =
              context.label || "";

            const value =
              context.raw || 0;

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
     RENDER
  ========================================================= */

  return (
    <div
      className="info-card"
      style={{
        gridColumn: "1 / span 2",
        padding: "20px 22px",
      }}
    >

      {/* HEADER */}

      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          marginBottom: "12px",
        }}
      >

        <h3
          style={{
            margin: 0,
            fontSize: "22px",
            fontWeight: "700",
          }}
        >
          Attack Distribution
        </h3>

      </div>


      {/* DESCRIPTION */}

      <p
        style={{
          margin: "0 0 12px",
          textAlign: "center",
          color: "#8f8f8f",
          fontSize: "13px",
        }}
      >
        Distribution of detections recorded during this
        analysis session.
      </p>


      {/* CHART */}

      {safeLogs.length === 0 ? (

        <div
          style={{
            minHeight: "120px",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            color: "#8f8f8f",
            fontSize: "14px",
          }}
        >
          No attack data available.
        </div>

      ) : (

        <div
          style={{
            height: "245px",
            maxWidth: "650px",
            margin: "0 auto",
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