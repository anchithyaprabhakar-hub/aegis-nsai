import {
  FaChartPie,
  FaShieldAlt,
  FaExclamationTriangle,
  FaBullseye,
} from "react-icons/fa";

function AttackAnalytics({ logs }) {
  const total = logs.length;

  const highRisk = logs.filter((log) => {
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
          logs.reduce(
            (sum, log) => sum + Number(log.confidence),
            0
          ) / total
        ).toFixed(2);

  const latestAttack =
    total > 0 ? logs[0].prediction : "None";

  return (
    <div className="info-card">
      <h3>
        <FaChartPie /> Attack Analytics
      </h3>

      <div style={{ marginTop: "25px" }}>
        <p>
          <FaShieldAlt color="#38bdf8" />{" "}
          <strong>Total Analyses:</strong> {total}
        </p>

        <p>
          <FaExclamationTriangle color="#ef4444" />{" "}
          <strong>High Risk:</strong> {highRisk}
        </p>

        <p>
          <FaBullseye color="#facc15" />{" "}
          <strong>Average Confidence:</strong>{" "}
          {averageConfidence}%
        </p>

        <p>
          <strong>Latest Attack:</strong>{" "}
          {latestAttack}
        </p>
      </div>
    </div>
  );
}

export default AttackAnalytics;