import {
  FaChartPie,
  FaShieldAlt,
} from "react-icons/fa";

import {
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Tooltip,
  Legend,
} from "recharts";

function AttackChart({ data = [] }) {
  const chartData = Array.isArray(data)
    ? data
        .map((item) => {
          if (typeof item === "string") {
            return {
              name: item,
              value: 1,
            };
          }

          return {
            name:
              item?.name ||
              item?.label ||
              item?.attack ||
              "Unknown",

            value:
              Number(
                item?.value ??
                item?.count ??
                item?.percentage ??
                0
              ) || 0,
          };
        })
        .filter(
          (item) =>
            item.name &&
            Number(item.value) > 0
        )
    : [];

  const total = chartData.reduce(
    (sum, item) => sum + item.value,
    0
  );

  const getPercentage = (value) => {
    if (!total) return 0;

    return ((value / total) * 100).toFixed(1);
  };

  const tooltipFormatter = (value) => {
    const numericValue =
      Number(value) || 0;

    return [
      `${numericValue.toLocaleString()} (${getPercentage(
        numericValue
      )}%)`,
      "Detections",
    ];
  };

  return (
    <div className="info-card attack-chart-card">

      <div
        className="attack-chart-header"
        style={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          textAlign: "center",
        }}
      >

        <div
          className="attack-chart-heading"
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            textAlign: "center",
            width: "100%",
          }}
        >

          <div className="attack-chart-icon">
            <FaChartPie />
          </div>

          <div
            style={{
              width: "100%",
              textAlign: "center",
            }}
          >
            <h3>
              Attack Distribution
            </h3>

            <p>
              Distribution of detected network
              activities in the current analysis.
            </p>
          </div>

        </div>

        {total > 0 && (
          <div
            className="attack-chart-total"
            style={{
              textAlign: "center",
            }}
          >
            {total.toLocaleString()}{" "}
            Total
          </div>
        )}

      </div>

      {chartData.length > 0 ? (
        <div className="attack-chart-layout">

          <div className="attack-chart-container">

            <ResponsiveContainer
              width="100%"
              height={380}
            >
              <PieChart>

                <Pie
                  data={chartData}
                  dataKey="value"
                  nameKey="name"
                  cx="50%"
                  cy="50%"
                  outerRadius={135}
                  innerRadius={72}
                  paddingAngle={2}
                  stroke="#101010"
                  strokeWidth={2}
                >

                  {chartData.map(
                    (entry, index) => (
                      <Cell
                        key={`cell-${index}`}
                      />
                    )
                  )}

                </Pie>

                <Tooltip
                  formatter={
                    tooltipFormatter
                  }
                  contentStyle={{
                    background: "#151515",
                    border:
                      "1px solid #303030",
                    borderRadius: "10px",
                    color: "#f5f5f5",
                  }}
                  labelStyle={{
                    color: "#f5f5f5",
                  }}
                />

                <Legend
                  verticalAlign="bottom"
                  height={36}
                  iconType="circle"
                  wrapperStyle={{
                    color: "#a3a3a3",
                    fontSize: "12px",
                  }}
                />

              </PieChart>
            </ResponsiveContainer>

          </div>

          <div className="attack-breakdown">

            <div className="attack-breakdown-header">
              <FaShieldAlt />

              <span>
                Detection Breakdown
              </span>
            </div>

            <div className="attack-breakdown-list">

              {chartData.map(
                (item, index) => (
                  <div
                    className="attack-breakdown-item"
                    key={`${item.name}-${index}`}
                  >

                    <div className="attack-breakdown-name">

                      <span className="attack-breakdown-dot" />

                      <span>
                        {item.name}
                      </span>

                    </div>

                    <div className="attack-breakdown-value">

                      <strong>
                        {Number(
                          item.value
                        ).toLocaleString()}
                      </strong>

                      <span>
                        {getPercentage(
                          item.value
                        )}%
                      </span>

                    </div>

                  </div>
                )
              )}

            </div>

          </div>

        </div>
      ) : (
        <div className="attack-chart-empty">

          <FaChartPie />

          <strong>
            No Attack Distribution Data
          </strong>

          <p>
            Run a network-flow analysis to
            generate the attack distribution.
          </p>

        </div>
      )}

    </div>
  );
}

export default AttackChart;