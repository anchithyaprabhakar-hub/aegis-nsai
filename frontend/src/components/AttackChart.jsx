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

/* =========================================================
   AEGIS-NSAI ATTACK DISTRIBUTION
   ========================================================= */

const COLORS = [
  "#38bdf8",
  "#f43f5e",
  "#f59e0b",
  "#a78bfa",
  "#22c55e",
  "#22d3ee",
  "#fb7185",
  "#c084fc",
  "#facc15",
  "#4ade80",
];

function AttackChart({ data = [] }) {
  /* =========================================================
     NORMALIZE DATA
     ========================================================= */

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

  /* =========================================================
     TOTAL
     ========================================================= */

  const total = chartData.reduce(
    (sum, item) =>
      sum + Number(item.value || 0),
    0
  );

  /* =========================================================
     PERCENTAGE
     ========================================================= */

  const getPercentage = (value) => {
    if (!total) {
      return "0.0";
    }

    return (
      (Number(value) / total) *
      100
    ).toFixed(1);
  };

  /* =========================================================
     TOOLTIP
     ========================================================= */

  const tooltipFormatter = (value) => {
    const numericValue =
      Number(value) || 0;

    return [
      `${numericValue.toLocaleString()} detections`,
      `${getPercentage(numericValue)}%`,
    ];
  };

  /* =========================================================
     RENDER
     ========================================================= */

  return (
    <div className="info-card attack-chart-card">

      {/* =====================================================
          HEADER
          ===================================================== */}

      <div className="attack-chart-header">

        <div className="attack-chart-heading">

          <div className="attack-chart-icon">
            <FaChartPie />
          </div>

          <div>

            <h3>
              Attack Distribution
            </h3>

            <p>
              Classification distribution across
              analyzed network traffic.
            </p>

          </div>

        </div>

        {total > 0 && (
          <div className="attack-chart-total">
            {total.toLocaleString()}{" "}
            Total Detections
          </div>
        )}

      </div>

      {/* =====================================================
          CHART
          ===================================================== */}

      {chartData.length > 0 ? (

        <div className="attack-chart-layout">

          {/* =================================================
              DONUT
              ================================================= */}

          <div className="attack-chart-container">

            <ResponsiveContainer
              width="100%"
              height={390}
            >

              <PieChart>

                <Pie
                  data={chartData}
                  dataKey="value"
                  nameKey="name"
                  cx="50%"
                  cy="47%"
                  outerRadius={135}
                  innerRadius={78}
                  paddingAngle={3}
                  stroke="#0b0b0b"
                  strokeWidth={3}
                >

                  {chartData.map(
                    (entry, index) => (
                      <Cell
                        key={`${entry.name}-${index}`}
                        fill={
                          COLORS[
                            index %
                              COLORS.length
                          ]
                        }
                      />
                    )
                  )}

                </Pie>

                {/* CENTER VALUE */}

                <text
                  x="50%"
                  y="44%"
                  textAnchor="middle"
                  dominantBaseline="middle"
                  fill="#f5f5f5"
                  fontSize="30"
                  fontWeight="800"
                >
                  {total.toLocaleString()}
                </text>

                <text
                  x="50%"
                  y="52%"
                  textAnchor="middle"
                  dominantBaseline="middle"
                  fill="#777777"
                  fontSize="11"
                  fontWeight="700"
                >
                  DETECTIONS
                </text>

                {/* TOOLTIP */}

                <Tooltip
                  formatter={
                    tooltipFormatter
                  }

                  contentStyle={{
                    background:
                      "#151515",
                    border:
                      "1px solid #383838",
                    borderRadius:
                      "12px",
                    color:
                      "#f5f5f5",
                    boxShadow:
                      "0 10px 30px rgba(0,0,0,0.45)",
                  }}

                  labelStyle={{
                    color: "#f5f5f5",
                    fontWeight: 700,
                    marginBottom: "5px",
                  }}

                  itemStyle={{
                    color: "#38bdf8",
                  }}
                />

                {/* LEGEND */}

                <Legend
                  verticalAlign="bottom"
                  height={45}
                  iconType="circle"

                  wrapperStyle={{
                    color: "#a3a3a3",
                    fontSize: "12px",
                    paddingTop: "10px",
                  }}
                />

              </PieChart>

            </ResponsiveContainer>

          </div>

          {/* =================================================
              BREAKDOWN
              ================================================= */}

          <div className="attack-breakdown">

            <div className="attack-breakdown-header">

              <FaShieldAlt />

              <span>
                Detection Breakdown
              </span>

            </div>

            <div className="attack-breakdown-list">

              {chartData.map(
                (item, index) => {

                  const percentage =
                    getPercentage(
                      item.value
                    );

                  const itemColor =
                    COLORS[
                      index %
                        COLORS.length
                    ];

                  return (
                    <div
                      className="attack-breakdown-item"
                      key={`${item.name}-${index}`}
                    >

                      <div className="attack-breakdown-name">

                        <span
                          className="attack-breakdown-dot"
                          style={{
                            background:
                              itemColor,
                            boxShadow:
                              `0 0 10px ${itemColor}66`,
                          }}
                        />

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

                        <span
                          style={{
                            color:
                              itemColor,
                          }}
                        >
                          {percentage}%
                        </span>

                      </div>

                    </div>
                  );
                }
              )}

            </div>

          </div>

        </div>

      ) : (

        /* ===================================================
           EMPTY STATE
           =================================================== */

        <div className="attack-chart-empty">

          <div className="attack-chart-empty-icon">
            <FaChartPie />
          </div>

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