import {
  FaChartPie,
  FaShieldAlt,
  FaExclamationTriangle,
  FaBullseye,
  FaCheckCircle,
  FaBug,
} from "react-icons/fa";


function AttackAnalytics({ logs = [] }) {
  /* =========================================================
     NORMALIZE LOGS
  ========================================================= */

  const normalizedLogs = Array.isArray(logs)
    ? logs
    : [];

  const total = normalizedLogs.length;


  /* =========================================================
     NORMAL / MALICIOUS DETECTIONS
  ========================================================= */

  const isNormalPrediction = (prediction) => {
    const value = String(prediction || "")
      .trim()
      .toLowerCase();

    return (
      value === "normal" ||
      value === "benign"
    );
  };


  const maliciousAnalyses =
    normalizedLogs.filter(
      (log) =>
        !isNormalPrediction(log?.prediction)
    ).length;


  const normalAnalyses =
    normalizedLogs.filter(
      (log) =>
        isNormalPrediction(log?.prediction)
    ).length;


  /* =========================================================
     HIGH-RISK DETECTIONS
  ========================================================= */

  const highRisk =
    normalizedLogs.filter((log) => {
      const prediction =
        String(log?.prediction || "")
          .trim()
          .toLowerCase();

      const isBenign =
        prediction === "normal" ||
        prediction === "benign";

      return (
        !isBenign &&
        Number(log?.confidence) >= 70
      );
    }).length;


  /* =========================================================
     AVERAGE CONFIDENCE
  ========================================================= */

  const averageConfidence =
    total === 0
      ? "0.00"
      : (
          normalizedLogs.reduce(
            (sum, log) =>
              sum +
              (Number(log?.confidence) || 0),
            0
          ) / total
        ).toFixed(2);


  /* =========================================================
     MALICIOUS DETECTION RATE
  ========================================================= */

  const maliciousRate =
    total === 0
      ? "0.0"
      : (
          (maliciousAnalyses / total) * 100
        ).toFixed(1);


  /* =========================================================
     LATEST ANALYSIS
  ========================================================= */

  const latestAnalysis =
    total > 0
      ? normalizedLogs[total - 1]?.prediction ||
        "Unknown"
      : "None";


  const latestConfidence =
    total > 0
      ? Number(
          normalizedLogs[total - 1]?.confidence || 0
        ).toFixed(2)
      : "0.00";


  /* =========================================================
     METRIC CARD
  ========================================================= */

  const MetricCard = ({
    icon,
    label,
    value,
    iconColor = "#38bdf8",
    valueColor = "#f5f5f5",
  }) => (
    <div
      style={{
        minHeight: "88px",
        padding: "14px 16px",
        borderRadius: "11px",
        background: "#111111",
        border: "1px solid #2c2c2c",
        display: "flex",
        flexDirection: "column",
        justifyContent: "center",
      }}
    >
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: "8px",
          color: "#cfd3d8",
          fontSize: "13px",
          fontWeight: "600",
        }}
      >
        <span
          style={{
            color: iconColor,
            display: "flex",
            alignItems: "center",
          }}
        >
          {icon}
        </span>

        {label}
      </div>

      <div
        style={{
          marginTop: "7px",
          fontSize: "23px",
          lineHeight: "1.1",
          fontWeight: "700",
          color: valueColor,
        }}
      >
        {value}
      </div>
    </div>
  );


  /* =========================================================
     RENDER
  ========================================================= */

  return (
    <div className="info-card">

      {/* HEADER */}

      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          gap: "10px",
          marginBottom: "14px",
        }}
      >
        <FaChartPie
          style={{
            fontSize: "20px",
          }}
        />

        <h3
          style={{
            margin: 0,
            fontSize: "22px",
            fontWeight: "700",
          }}
        >
          Attack Analytics
        </h3>
      </div>


      {/* METRIC GRID */}

      <div
        style={{
          display: "grid",
          gridTemplateColumns:
            "repeat(4, minmax(0, 1fr))",
          gap: "10px",
        }}
      >

        <MetricCard
          icon={<FaShieldAlt />}
          label="Total Analyses"
          value={total}
          iconColor="#38bdf8"
        />


        <MetricCard
          icon={<FaExclamationTriangle />}
          label="High Risk"
          value={highRisk}
          iconColor="#ef4444"
          valueColor={
            highRisk > 0
              ? "#ef4444"
              : "#22c55e"
          }
        />


        <MetricCard
          icon={<FaBug />}
          label="Malicious Detections"
          value={maliciousAnalyses}
          iconColor="#f97316"
          valueColor={
            maliciousAnalyses > 0
              ? "#f97316"
              : "#22c55e"
          }
        />


        <MetricCard
          icon={<FaCheckCircle />}
          label="Normal Detections"
          value={normalAnalyses}
          iconColor="#22c55e"
          valueColor="#22c55e"
        />


        <MetricCard
          icon={<FaBullseye />}
          label="Average Confidence"
          value={`${averageConfidence}%`}
          iconColor="#facc15"
        />


        <MetricCard
          icon={<FaChartPie />}
          label="Malicious Rate"
          value={`${maliciousRate}%`}
          iconColor="#38bdf8"
        />


        <MetricCard
          icon={<FaShieldAlt />}
          label="Latest Detection"
          value={latestAnalysis}
          iconColor="#a855f7"
          valueColor={
            isNormalPrediction(latestAnalysis)
              ? "#22c55e"
              : "#ef4444"
          }
        />


        <MetricCard
          icon={<FaBullseye />}
          label="Latest Confidence"
          value={`${latestConfidence}%`}
          iconColor="#38bdf8"
        />

      </div>

    </div>
  );
}


export default AttackAnalytics;