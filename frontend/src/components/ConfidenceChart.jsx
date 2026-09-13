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
  /* =========================================================
     FIND SOURCE DATA
  ========================================================= */

  const source =
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
  } else if (
    source &&
    typeof source === "object"
  ) {
    historyData = [source];
  }


  /* =========================================================
     FALLBACK
  ========================================================= */

  if (
    historyData.length === 0 &&
    (
      confidence !== undefined ||
      prediction !== undefined
    )
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
              Math.min(
                100,
                numericConfidence
              )
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
    .filter(
      (item) =>
        item.prediction !== "Unknown"
    );


  /* =========================================================
     LAST 10 DETECTIONS
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
          padding: "20px 22px",
        }}
      >
        <h3
          style={{
            margin: 0,
            fontSize: "22px",
            fontWeight: "700",
            textAlign: "center",
          }}
        >
          Confidence History
        </h3>

        <div
          style={{
            height: "120px",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            color: "#8f8f8f",
            textAlign: "center",
            fontSize: "14px",
          }}
        >
          No confidence data available yet.
        </div>
      </div>
    );
  }


  /* =========================================================
     LABELS
  ========================================================= */

  const labels =
    displayedItems.map(
      (_, index) =>
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
          "rgba(56, 189, 248, 0.10)",

        pointBackgroundColor:
          "#38bdf8",

        pointBorderColor:
          "#38bdf8",

        pointRadius: 3.5,

        pointHoverRadius: 5,

        borderWidth: 2,

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
      duration: 400,
    },

    plugins: {
      legend: {
        display: false,
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
          color: "#8f8f8f",

          font: {
            size: 10,
          },

          maxRotation: 0,

          autoSkip: true,

          maxTicksLimit: 10,
        },

        grid: {
          color:
            "rgba(255,255,255,0.04)",
        },

        border: {
          display: false,
        },
      },

      y: {
        min: 0,

        max: 100,

        ticks: {
          stepSize: 20,

          color: "#8f8f8f",

          font: {
            size: 10,
          },

          callback: function (value) {
            return `${value}%`;
          },
        },

        grid: {
          color:
            "rgba(255,255,255,0.04)",
        },

        border: {
          display: false,
        },
      },
    },

    interaction: {
      intersect: false,

      mode: "index",
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
        padding: "20px 22px",
      }}
    >

      {/* HEADER */}

      <div
        style={{
          textAlign: "center",
          marginBottom: "10px",
        }}
      >
        <h3
          style={{
            margin: 0,
            fontSize: "22px",
            fontWeight: "700",
          }}
        >
          Confidence History
        </h3>

        <p
          style={{
            margin: "5px 0 0",
            color: "#8f8f8f",
            fontSize: "13px",
          }}
        >
          Confidence across recent detections
        </p>
      </div>


      {/* CHART */}

      <div
        style={{
          width: "100%",
          height: "220px",
          position: "relative",
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