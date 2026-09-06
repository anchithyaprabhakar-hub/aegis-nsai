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
   * AEGIS-NSAI Confidence Chart
   *
   * Supports the different data shapes that may already be
   * used by App.jsx without requiring App.jsx to be rewritten.
   */

  // ---------------------------------------------------------
  // 1. Find the most useful source of analysis data
  // ---------------------------------------------------------

  let source = result ?? data ?? history ?? detections;

  // If an array was supplied, use the latest detection.
  if (Array.isArray(source)) {
    source = source.length > 0 ? source[source.length - 1] : null;
  }

  // ---------------------------------------------------------
  // 2. Extract prediction
  // ---------------------------------------------------------

  const extractedPrediction =
    prediction ??
    source?.prediction ??
    source?.label ??
    source?.attack ??
    source?.detection ??
    source?.final_prediction ??
    "Unknown";

  // ---------------------------------------------------------
  // 3. Extract confidence
  // ---------------------------------------------------------

  const extractedConfidence =
    confidence ??
    source?.confidence ??
    source?.ml_confidence ??
    source?.prediction_confidence ??
    source?.score ??
    0;

  const numericConfidence = Number(extractedConfidence);

  const safeConfidence = Number.isFinite(numericConfidence)
    ? Math.max(0, Math.min(100, numericConfidence))
    : 0;

  const safePrediction =
    extractedPrediction && String(extractedPrediction).trim()
      ? String(extractedPrediction).trim()
      : "Unknown";

  // ---------------------------------------------------------
  // 4. Determine chart appearance
  // ---------------------------------------------------------

  const isNormal =
    safePrediction.toLowerCase() === "normal" ||
    safePrediction.toLowerCase() === "benign";

  const lineColor = isNormal ? "#22c55e" : "#ef4444";

  // ---------------------------------------------------------
  // 5. Chart data
  // ---------------------------------------------------------

  const chartData = {
    labels: [safePrediction],
    datasets: [
      {
        label: "Confidence",
        data: [safeConfidence],
        borderColor: lineColor,
        backgroundColor: lineColor,
        pointBackgroundColor: lineColor,
        pointBorderColor: lineColor,
        pointRadius: 6,
        pointHoverRadius: 8,
        borderWidth: 3,
        tension: 0.3,
      },
    ],
  };

  // ---------------------------------------------------------
  // 6. Chart options
  // ---------------------------------------------------------

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
          title: function () {
            return safePrediction;
          },

          label: function (context) {
            const value = Number(context.raw);

            return ` Confidence: ${
              Number.isFinite(value) ? value.toFixed(2) : "0.00"
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
            size: 13,
          },
        },

        grid: {
          color: "rgba(255,255,255,0.05)",
        },
      },

      y: {
        min: 0,
        max: 100,

        ticks: {
          stepSize: 10,

          color: "#9ca3af",

          callback: function (value) {
            const numericValue = Number(value);

            return Number.isFinite(numericValue)
              ? `${numericValue}%`
              : "0%";
          },
        },

        grid: {
          color: "rgba(255,255,255,0.05)",
        },
      },
    },
  };

  // ---------------------------------------------------------
  // 7. Render
  // ---------------------------------------------------------

  return (
    <div
      style={{
        width: "100%",
        height: "300px",
        position: "relative",
      }}
    >
      <Line data={chartData} options={chartOptions} />
    </div>
  );
}

export default ConfidenceChart;