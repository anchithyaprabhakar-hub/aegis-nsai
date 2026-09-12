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

  const total =
    normalizedLogs.length;


  /* =========================================================
     NORMAL / MALICIOUS DETECTIONS
  ========================================================= */

  const isNormalPrediction = (
    prediction
  ) => {
    const value =
      String(prediction || "")
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
        !isNormalPrediction(
          log?.prediction
        )
    ).length;


  const normalAnalyses =
    normalizedLogs.filter(
      (log) =>
        isNormalPrediction(
          log?.prediction
        )
    ).length;


  /* =========================================================
     HIGH-RISK DETECTIONS
  ========================================================= */

  const highRisk =
    normalizedLogs.filter((log) => {
      const prediction =
        String(
          log?.prediction || ""
        )
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
              (
                Number(
                  log?.confidence
                ) || 0
              ),
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
          (
            maliciousAnalyses /
            total
          ) * 100
        ).toFixed(1);


  /* =========================================================
     LATEST ANALYSIS
     
     App.jsx appends new detections to
     the END of the history array.
  ========================================================= */

  const latestAnalysis =
    total > 0
      ? normalizedLogs[
          total - 1
        ]?.prediction || "Unknown"
      : "None";


  const latestConfidence =
    total > 0
      ? Number(
          normalizedLogs[
            total - 1
          ]?.confidence || 0
        ).toFixed(2)
      : "0.00";


  /* =========================================================
     METRIC STYLE
  ========================================================= */

  const metricStyle = {
    margin: "14px 0",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    gap: "8px",
    flexWrap: "wrap",
  };


  /* =========================================================
     RENDER
  ========================================================= */

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

        {/* TOTAL ANALYSES */}

        <p style={metricStyle}>
          <FaShieldAlt color="#38bdf8" />

          <strong>
            Total Analyses:
          </strong>

          {total}
        </p>


        {/* HIGH RISK */}

        <p style={metricStyle}>
          <FaExclamationTriangle color="#ef4444" />

          <strong>
            High Risk:
          </strong>

          {highRisk}
        </p>


        {/* MALICIOUS */}

        <p style={metricStyle}>
          <FaBug color="#f97316" />

          <strong>
            Malicious Detections:
          </strong>

          {maliciousAnalyses}
        </p>


        {/* NORMAL */}

        <p style={metricStyle}>
          <FaCheckCircle color="#22c55e" />

          <strong>
            Normal Detections:
          </strong>

          {normalAnalyses}
        </p>


        {/* AVERAGE CONFIDENCE */}

        <p style={metricStyle}>
          <FaBullseye color="#facc15" />

          <strong>
            Average Confidence:
          </strong>

          {averageConfidence}%
        </p>


        {/* MALICIOUS RATE */}

        <p style={metricStyle}>
          <FaChartPie color="#38bdf8" />

          <strong>
            Malicious Detection Rate:
          </strong>

          {maliciousRate}%
        </p>


        {/* LATEST DETECTION */}

        <p style={metricStyle}>
          <strong>
            Latest Detection:
          </strong>

          {latestAnalysis}
        </p>


        {/* LATEST CONFIDENCE */}

        {total > 0 && (
          <p style={metricStyle}>
            <strong>
              Latest Confidence:
            </strong>

            {latestConfidence}%
          </p>
        )}

      </div>

    </div>
  );
}


export default AttackAnalytics;