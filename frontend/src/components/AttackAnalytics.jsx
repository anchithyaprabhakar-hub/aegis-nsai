import {
  FaChartPie,
  FaShieldAlt,
  FaExclamationTriangle,
  FaBullseye,
  FaCheckCircle,
  FaBug,
} from "react-icons/fa";

function AttackAnalytics({ logs }) {
  const total = Array.isArray(logs) ? logs.length : 0;

  const normalizedLogs = Array.isArray(logs)
    ? logs
    : [];

  const isNormalPrediction = (prediction) => {
    const value = String(prediction || "")
      .trim()
      .toLowerCase();

    return (
      value === "normal" ||
      value === "benign"
    );
  };

  const maliciousAnalyses = normalizedLogs.filter(
    (log) => !isNormalPrediction(log.prediction)
  ).length;

  const normalAnalyses = normalizedLogs.filter(
    (log) => isNormalPrediction(log.prediction)
  ).length;

  const highRisk = normalizedLogs.filter((log) => {
    const prediction = String(log.prediction || "")
      .trim()
      .toLowerCase();

    const isBenign =
      prediction === "normal" ||
      prediction === "benign";

    return (
      !isBenign &&
      Number(log.confidence) >= 70
    );
  }).length;

  const averageConfidence =
    total === 0
      ? 0
      : (
          normalizedLogs.reduce(
            (sum, log) =>
              sum + (Number(log.confidence) || 0),
            0
          ) / total
        ).toFixed(2);

  const maliciousRate =
    total === 0
      ? 0
      : ((maliciousAnalyses / total) * 100).toFixed(1);

  const latestAnalysis =
    total > 0
      ? normalizedLogs[0]?.prediction || "Unknown"
      : "None";

  const latestConfidence =
    total > 0
      ? Number(normalizedLogs[0]?.confidence || 0).toFixed(2)
      : "0.00";

  const metricStyle = {
    margin: "14px 0",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    gap: "8px",
    flexWrap: "wrap",
  };

  return (
    <div className="info-card">
      <h3>
        <FaChartPie /> Attack Analytics
      </h3>

      <div
        style={{
          marginTop: "25px",
        }}
      >
        <p style={metricStyle}>
          <FaShieldAlt color="#38bdf8" />
          <strong>Total Analyses:</strong>
          {total}
        </p>

        <p style={metricStyle}>
          <FaExclamationTriangle color="#ef4444" />
          <strong>High Risk:</strong>
          {highRisk}
        </p>

        <p style={metricStyle}>
          <FaBug color="#f97316" />
          <strong>Malicious Detections:</strong>
          {maliciousAnalyses}
        </p>

        <p style={metricStyle}>
          <FaCheckCircle color="#22c55e" />
          <strong>Normal Detections:</strong>
          {normalAnalyses}
        </p>

        <p style={metricStyle}>
          <FaBullseye color="#facc15" />
          <strong>Average Confidence:</strong>
          {averageConfidence}%
        </p>

        <p style={metricStyle}>
          <FaChartPie color="#38bdf8" />
          <strong>Malicious Detection Rate:</strong>
          {maliciousRate}%
        </p>

        <p style={metricStyle}>
          <strong>Latest Detection:</strong>
          {latestAnalysis}
        </p>

        {total > 0 && (
          <p style={metricStyle}>
            <strong>Latest Confidence:</strong>
            {latestConfidence}%
          </p>
        )}
      </div>
    </div>
  );
}

export default AttackAnalytics;
