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

function ConfidenceChart({ confidence = 0, prediction = "Unknown" }) {
  // Safely normalize confidence so undefined/null can never crash the chart.
  const numericConfidence = Number(confidence);

  const safeConfidence = Number.isFinite(numericConfidence)
    ? Math.max(0, Math.min(100, numericConfidence))
    : 0;

  const chartData = {
    labels: ["Confidence"],
    datasets: [
      {
        label: prediction || "Prediction",
        data: [safeConfidence],
        tension: 0.3,
        borderWidth: 3,
        pointRadius: 5,
        pointHoverRadius: 7,
      },
    ],
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: true,
      },
      tooltip: {
        callbacks: {
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
      y: {
        min: 0,
        max: 100,
        ticks: {
          callback: function (value) {
            const numericValue = Number(value);

            return Number.isFinite(numericValue)
              ? `${numericValue}%`
              : "0%";
          },
        },
      },
    },
  };

  return (
    <div
      style={{
        width: "100%",
        height: "260px",
        position: "relative",
      }}
    >
      <Line data={chartData} options={chartOptions} />
    </div>
  );
}

export default ConfidenceChart;