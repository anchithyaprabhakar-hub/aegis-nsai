import {
  Line
} from "react-chartjs-2";

import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Tooltip,
  Legend,
} from "chart.js";

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Tooltip,
  Legend
);

function ConfidenceChart({ logs }) {

  const data = {

    labels: logs
      .slice()
      .reverse()
      .map((_, index) => `Scan ${index + 1}`),

    datasets: [

      {

        label: "Confidence",

        data: logs
          .slice()
          .reverse()
          .map((log) => Number(log.confidence)),

        borderColor: "#22c55e",

        backgroundColor: "rgba(34,197,94,.2)",

        fill: true,

        tension: 0.4,

      },

    ],

  };

  const options = {

    responsive: true,

    maintainAspectRatio: true,

    plugins: {

      legend: {

        labels: {

          color: "#ffffff",

        },

      },

    },

    scales: {

      x: {

        ticks: {

          color: "#ffffff",

        },

        grid: {

          color: "#333",

        },

      },

      y: {

        beginAtZero: true,

        max: 100,

        ticks: {

          color: "#ffffff",

        },

        grid: {

          color: "#333",

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

      <h3>Confidence History</h3>

      {logs.length === 0 ? (

        <p>No confidence data available.</p>

      ) : (

        <Line
          data={data}
          options={options}
        />

      )}

    </div>

  );

}

export default ConfidenceChart;