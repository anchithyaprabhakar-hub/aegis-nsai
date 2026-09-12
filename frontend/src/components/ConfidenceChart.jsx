import React from "react";

import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Tooltip,
  Legend,
} from "chart.js";

import { Line } from "react-chartjs-2";


ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Tooltip,
  Legend
);


function ConfidenceChart({
  confidence,
  prediction,
  data,
  result,
  history,
  detections,
}) {
  /*
   * AEGIS-NSAI Confidence History
   *
   * The component accepts the existing data props used by
   * different parts of the dashboard and normalizes them
   * into a single chart data structure.
   */


  /* =========================================================
     FIND SOURCE DATA
  ========================================================= */

  let source =
    result ??
    data ??
    history ??
    detections;


  /* =========================================================
     NORMALIZE HISTORY
  ========================================================= */

  let historyData = [];

  if (Array.isArray(source)) {
    historyData = source;
  } else if (source && typeof source === "object") {
    historyData = [source];
  }


  /* =========================================================
     FALLBACK FOR DIRECT CONFIDENCE/PREDICTION PROPS
  ========================================================= */

  if (
    historyData.length === 0 &&
    (confidence !== undefined || prediction !== undefined)
  ) {
    historyData = [
      {
        prediction:
          prediction || "Unknown",

        confidence:
          confidence || 0,
      },
    ];
  }


  /* =========================================================
     EXTRACT VALID DETECTIONS
  ========================================================= */

  const chartItems = historyData
    .map((item, index) => {
      const itemPrediction =
        item?.prediction ??
        item?.label ??
        item?.attack ??
        item?.detection ??
        item?.final_prediction ??
        "Unknown";

      const itemConfidence =
        item?.confidence ??
        item?.ml_confidence ??
        item?.prediction_confidence ??
        item?.score ??
        0;

      const numericConfidence =
        Number(itemConfidence);

      const safeConfidence =
        Number.isFinite(numericConfidence)
          ? Math.max(
              0,
              Math.min(100, numericConfidence)
            )
          : 0;

      const safePrediction =
        itemPrediction &&
        String(itemPrediction).trim()
          ? String(itemPrediction).trim()
          : "Unknown";

      return {
        index,
        prediction: safePrediction,
        confidence: safeConfidence,
      };
    })
    .filter((item) => item.prediction !== "Unknown");


  /* =========================================================
     LIMIT DISPLAYED HISTORY
  ========================================================= */

  const displayedItems =
    chartItems.slice(-10);


  /* =========================================================
     EMPTY STATE
  ========================================================= */

  if (displayedItems.length === 0) {
    return (
      <div
        className="info-card"
        style={{
          width: "100%",
        }}
      >
        <h3>
          Confidence History
        </h3>

        <div
          style={{
            height: "300px",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            color: "#8f8f8f",
            textAlign: "center",
          }}
        >
          No confidence data available yet.
        </div>
      </div>
    );
  }


  /* =========================================================
     CHART LABELS
  ========================================================= */

  const labels =
    displayedItems.map(
      (item, index) =>
        `Detection ${index + 1}`
    );


  /* =========================================================
     CHART DATA
  ========================================================= */

  const chartData = {
    labels,

    datasets: [
      {
        label: "Confidence",

        data: displayedItems.map(
          (item) => item.confidence
        ),

        borderColor: "#38bdf8",

        backgroundColor:
          "rgba(56, 189, 248, 0.15)",

        pointBackgroundColor:
          "#38bdf8",

        pointBorderColor:
          "#38bdf8",

        pointRadius: 5,

        pointHoverRadius: 7,

        borderWidth: 3,

        tension: 0.3,

        fill: true,
      },
    ],
  };


  /* =========================================================
     CHART OPTIONS
  ========================================================= */

  const chartOptions = {
    responsive: true,

    maintainAspectRatio: false,

    animation: {
      duration: 600,
    },

    plugins: {
      legend: {
        display: true,

        labels: {
          color: "#d1d5db",

          font: {
            size: 14,
          },
        },
      },

      tooltip: {
        callbacks: {
          title: function (_, items) {
            if (!items?.length) {
              return "Detection";
            }

            const index =
              items[0].dataIndex;

            return (
              displayedItems[index]
                ?.prediction ||
              "Detection"
            );
          },

          label: function (context) {
            const value =
              Number(context.raw);

            return ` Confidence: ${
              Number.isFinite(value)
                ? value.toFixed(2)
                : "0.00"
            }%`;
          },
        },
      },
    },

    scales: {
      x: {
        ticks: {
          color: "#9ca3af",

          font: {
            size: 12,
          },
        },

        grid: {
          color:
            "rgba(255,255,255,0.05)",
        },
      },

      y: {
        min: 0,

        max: 100,

        ticks: {
          stepSize: 10,

          color: "#9ca3af",

          callback: function (value) {
            const numericValue =
              Number(value);

            return Number.isFinite(
              numericValue
            )
              ? `${numericValue}%`
              : "0%";
          },
        },

        grid: {
          color:
            "rgba(255,255,255,0.05)",
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
        width: "100%",
      }}
    >
      <h3>
        Confidence History
      </h3>

      <div
        style={{
          width: "100%",
          height: "300px",
          position: "relative",
          marginTop: "20px",
        }}
      >
        <Line
          data={chartData}
          options={chartOptions}
        />
      </div>
    </div>
  );
}


export default ConfidenceChart;