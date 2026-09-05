import {
  FaClock,
  FaShieldAlt,
  FaBullseye,
  FaFingerprint,
  FaFileCsv,
} from "react-icons/fa";

function RecentLogs({ logs = [] }) {
  const safeLogs = Array.isArray(logs) ? logs : [];

  const getSeverity = (prediction, confidence) => {
    const normalizedPrediction = String(
      prediction || ""
    ).toLowerCase();

    if (
      normalizedPrediction === "normal" ||
      normalizedPrediction === "benign"
    ) {
      return {
        label: "Low",
        color: "#22c55e",
      };
    }

    const value = Number(confidence);

    if (!Number.isFinite(value)) {
      return {
        label: "Review",
        color: "#facc15",
      };
    }

    if (value >= 80) {
      return {
        label: "Critical",
        color: "#ef4444",
      };
    }

    if (value >= 60) {
      return {
        label: "High",
        color: "#f97316",
      };
    }

    if (value >= 30) {
      return {
        label: "Medium",
        color: "#facc15",
      };
    }

    return {
      label: "Low",
      color: "#22c55e",
    };
  };

  return (
    <div className="info-card recent-logs">
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          gap: "15px",
          marginBottom: "30px",
          flexWrap: "wrap",
        }}
      >
        <h3
          style={{
            margin: 0,
          }}
        >
          Recent Detections
        </h3>

        <span
          style={{
            background: "#222",
            color: "#22c55e",
            padding: "6px 14px",
            borderRadius: "20px",
            fontSize: "13px",
            fontWeight: "700",
          }}
        >
          {safeLogs.length}{" "}
          {safeLogs.length === 1 ? "Detection" : "Detections"}
        </span>
      </div>

      {safeLogs.length === 0 ? (
        <div
          style={{
            textAlign: "center",
            padding: "45px",
            color: "#8f8f8f",
          }}
        >
          <FaShieldAlt
            size={45}
            style={{
              marginBottom: "18px",
              opacity: 0.5,
            }}
          />

          <h4>No detections yet</h4>

          <p>
            Upload a CSV file to begin network analysis.
          </p>
        </div>
      ) : (
        <div className="logs">
          {safeLogs.map((log, index) => {
            const confidence = Number(log?.confidence);

            const safeConfidence = Number.isFinite(confidence)
              ? confidence
              : 0;

            const prediction = log?.prediction || "Unknown";

            const severity = getSeverity(
              prediction,
              safeConfidence
            );

            const detectionId =
              log?.id ||
              `DET-${String(index + 1).padStart(3, "0")}`;

            const filename =
              log?.filename || "Uploaded network dataset";

            return (
              <div
                key={`${detectionId}-${index}`}
                className={`log-row ${
                  index === 0 ? "latest-row" : ""
                }`}
                style={{
                  display: "grid",
                  gap: "10px",
                }}
              >
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "8px",
                    fontWeight: "600",
                  }}
                >
                  <FaFingerprint />

                  <span>{detectionId}</span>

                  {index === 0 && (
                    <span className="latest-badge">
                      ● ANALYZED
                    </span>
                  )}
                </div>

                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "8px",
                  }}
                  title="Analyzed dataset"
                >
                  <FaFileCsv />

                  <span
                    style={{
                      overflow: "hidden",
                      textOverflow: "ellipsis",
                      whiteSpace: "nowrap",
                    }}
                    title={filename}
                  >
                    {filename}
                  </span>
                </div>

                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "8px",
                  }}
                  title="Detection timestamp"
                >
                  <FaClock />

                  <span>
                    {log?.time || "Unknown time"}
                  </span>
                </div>

                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "8px",
                    fontWeight: "600",
                  }}
                >
                  <FaShieldAlt />

                  <span>{prediction}</span>
                </div>

                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "8px",
                  }}
                >
                  <FaBullseye />

                  <span>
                    {safeConfidence.toFixed(2)}%
                  </span>
                </div>

                <span
                  style={{
                    background: severity.color,
                    color: "#000",
                    padding: "6px 12px",
                    borderRadius: "20px",
                    fontWeight: "700",
                    fontSize: "12px",
                    whiteSpace: "nowrap",
                    width: "fit-content",
                  }}
                >
                  {severity.label}
                </span>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

export default RecentLogs;