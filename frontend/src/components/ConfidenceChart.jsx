import {
  FaChartLine,
  FaPercentage,
} from "react-icons/fa";

import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
} from "recharts";

function ConfidenceChart({ data = [] }) {
  const chartData = Array.isArray(data)
    ? data.map((item, index) => ({
        name:
          item?.name ||
          item?.id ||
          `Detection ${index + 1}`,

        confidence:
          Number(
            item?.confidence ??
            item?.value ??
            0
          ) || 0,

        prediction:
          item?.prediction ||
          item?.label ||
          "Unknown",
      }))
    : [];

  const averageConfidence =
    chartData.length > 0
      ? chartData.reduce(
          (sum, item) =>
            sum + item.confidence,
          0
        ) / chartData.length
      : 0;

  const latestConfidence =
    chartData.length > 0
      ? chartData[
          chartData.length - 1
        ].confidence
      : 0;

  return (
    <div className="info-card confidence-history-card">

      <div
        className="confidence-history-header"
        style={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          textAlign: "center",
        }}
      >

        <div
          className="confidence-history-heading"
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            textAlign: "center",
            width: "100%",
          }}
        >

          <div className="confidence-history-icon">
            <FaChartLine />
          </div>

          <div
            style={{
              width: "100%",
              textAlign: "center",
            }}
          >
            <h3>
              Confidence History
            </h3>

            <p>
              Model confidence across recent
              security detections.
            </p>
          </div>

        </div>

        {chartData.length > 0 && (
          <div className="confidence-history-stats">

            <div>
              <span>
                AVERAGE
              </span>

              <strong>
                {averageConfidence.toFixed(2)}%
              </strong>
            </div>

            <div>
              <span>
                LATEST
              </span>

              <strong>
                {latestConfidence.toFixed(2)}%
              </strong>
            </div>

          </div>
        )}

      </div>

      {chartData.length > 0 ? (
        <div className="confidence-history-chart">

          <ResponsiveContainer
            width="100%"
            height={360}
          >
            <LineChart
              data={chartData}
              margin={{
                top: 20,
                right: 20,
                left: 5,
                bottom: 10,
              }}
            >

              <CartesianGrid
                stroke="#242424"
                strokeDasharray="3 3"
              />

              <XAxis
                dataKey="name"
                stroke="#666666"
                tick={{
                  fill: "#777780",
                  fontSize: 10,
                }}
                tickLine={false}
                axisLine={{
                  stroke: "#292929",
                }}
              />

              <YAxis
                domain={[0, 100]}
                stroke="#666666"
                tick={{
                  fill: "#777780",
                  fontSize: 10,
                }}
                tickLine={false}
                axisLine={{
                  stroke: "#292929",
                }}
                tickFormatter={(value) =>
                  `${value}%`
                }
              />

              <Tooltip
                contentStyle={{
                  background: "#151515",
                  border:
                    "1px solid #303030",
                  borderRadius: "10px",
                  color: "#f5f5f5",
                }}
                labelStyle={{
                  color: "#f5f5f5",
                  marginBottom: "5px",
                }}
                formatter={(value) => [
                  `${Number(
                    value
                  ).toFixed(2)}%`,
                  "Confidence",
                ]}
              />

              <Line
                type="monotone"
                dataKey="confidence"
                stroke="#38bdf8"
                strokeWidth={3}
                dot={{
                  r: 4,
                  fill: "#38bdf8",
                  stroke: "#0d0d0d",
                  strokeWidth: 2,
                }}
                activeDot={{
                  r: 6,
                }}
              />

            </LineChart>
          </ResponsiveContainer>

        </div>
      ) : (
        <div className="confidence-history-empty">

          <FaPercentage />

          <strong>
            No Confidence History
          </strong>

          <p>
            Complete an analysis to populate
            the confidence history chart.
          </p>

        </div>
      )}

    </div>
  );
}

export default ConfidenceChart;