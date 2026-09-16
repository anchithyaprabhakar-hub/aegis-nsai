import {
  FaChartLine,
  FaExclamationTriangle,
  FaShieldAlt,
  FaCheckCircle,
  FaPercentage,
  FaClock,
} from "react-icons/fa";

function AttackAnalytics({ logs = [], analysisHistory = [] }) {
  const history =
    Array.isArray(logs) && logs.length > 0
      ? logs
      : Array.isArray(analysisHistory)
      ? analysisHistory
      : [];

  const totalAnalyses = history.length;

  const maliciousDetections = history.filter(
    (item) => {
      const prediction = String(
        item?.prediction || ""
      )
        .trim()
        .toLowerCase();

      return (
        prediction !== "" &&
        prediction !== "normal" &&
        prediction !== "benign"
      );
    }
  ).length;

  const normalDetections = history.filter(
    (item) => {
      const prediction = String(
        item?.prediction || ""
      )
        .trim()
        .toLowerCase();

      return (
        prediction === "normal" ||
        prediction === "benign"
      );
    }
  ).length;

  const highRiskDetections = history.filter(
    (item) => {
      const prediction = String(
        item?.prediction || ""
      )
        .trim()
        .toLowerCase();

      const confidence =
        Number(item?.confidence) || 0;

      const isNormal =
        prediction === "normal" ||
        prediction === "benign";

      return (
        !isNormal &&
        confidence >= 80
      );
    }
  ).length;

  const averageConfidence =
    totalAnalyses > 0
      ? history.reduce(
          (sum, item) =>
            sum +
            (Number(item?.confidence) || 0),
          0
        ) / totalAnalyses
      : 0;

  const maliciousRate =
    totalAnalyses > 0
      ? (maliciousDetections /
          totalAnalyses) *
        100
      : 0;

  const latestDetection =
    history.length > 0
      ? history[history.length - 1]
      : null;

  const latestPrediction =
    latestDetection?.prediction || "--";

  const latestConfidence =
    Number(
      latestDetection?.confidence
    ) || 0;

  const getLatestTime = () => {
    if (!latestDetection) {
      return "--:--:--";
    }

    return (
      latestDetection.timestamp ||
      latestDetection.detection_time ||
      latestDetection.detectionTime ||
      latestDetection.analysis_time ||
      "--:--:--"
    );
  };

  const metrics = [
    {
      label: "TOTAL ANALYSES",
      value: totalAnalyses.toLocaleString(),
      icon: FaChartLine,
      className: "analytics-blue",
    },
    {
      label: "HIGH RISK",
      value: highRiskDetections.toLocaleString(),
      icon: FaExclamationTriangle,
      className: "analytics-red",
    },
    {
      label: "MALICIOUS",
      value: maliciousDetections.toLocaleString(),
      icon: FaShieldAlt,
      className: "analytics-orange",
    },
    {
      label: "NORMAL",
      value: normalDetections.toLocaleString(),
      icon: FaCheckCircle,
      className: "analytics-green",
    },
    {
      label: "AVG CONFIDENCE",
      value: `${averageConfidence.toFixed(2)}%`,
      icon: FaPercentage,
      className: "analytics-purple",
    },
    {
      label: "MALICIOUS RATE",
      value: `${maliciousRate.toFixed(2)}%`,
      icon: FaShieldAlt,
      className: "analytics-orange",
    },
    {
      label: "LATEST DETECTION",
      value: latestPrediction,
      icon: FaClock,
      className: "analytics-cyan",
    },
    {
      label: "LATEST CONFIDENCE",
      value:
        latestDetection
          ? `${latestConfidence.toFixed(2)}%`
          : "--",
      icon: FaPercentage,
      className: "analytics-purple",
    },
  ];

  return (
    <div className="info-card analytics-card">

      <div
        className="analytics-header"
        style={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          textAlign: "center",
        }}
      >

        <div
          className="analytics-heading"
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            textAlign: "center",
            width: "100%",
          }}
        >

          <div className="analytics-heading-icon">
            <FaChartLine />
          </div>

          <div
            style={{
              width: "100%",
              textAlign: "center",
            }}
          >
            <h3>
              Attack Analytics
            </h3>

            <p>
              Security analysis statistics from
              the current detection history.
            </p>
          </div>

        </div>

        <div
          className="analytics-count"
          style={{
            textAlign: "center",
          }}
        >
          {totalAnalyses}{" "}
          {totalAnalyses === 1
            ? "Analysis"
            : "Analyses"}
        </div>

      </div>

      {totalAnalyses > 0 ? (
        <div className="analytics-grid">

          {metrics.map(
            ({
              label,
              value,
              icon: Icon,
              className,
            }) => (
              <div
                className={`analytics-metric ${className}`}
                key={label}
              >

                <div className="analytics-metric-top">

                  <span>
                    {label}
                  </span>

                  <Icon />

                </div>

                <div className="analytics-metric-value">
                  {value}
                </div>

              </div>
            )
          )}

        </div>
      ) : (
        <div className="analytics-empty">

          <FaChartLine />

          <strong>
            No Analysis History
          </strong>

          <p>
            Upload a network-flow CSV to begin
            building security analytics.
          </p>

        </div>
      )}

      {latestDetection && (
        <div className="analytics-latest">

          <div className="analytics-latest-title">
            <FaClock />
            Latest Detection
          </div>

          <div className="analytics-latest-content">

            <div>
              <span className="analytics-label">
                Classification
              </span>

              <strong>
                {latestPrediction}
              </strong>
            </div>

            <div>
              <span className="analytics-label">
                Confidence
              </span>

              <strong>
                {latestConfidence.toFixed(2)}%
              </strong>
            </div>

            <div>
              <span className="analytics-label">
                Detection Time
              </span>

              <strong>
                {getLatestTime()}
              </strong>
            </div>

          </div>

        </div>
      )}

    </div>
  );
}

export default AttackAnalytics;