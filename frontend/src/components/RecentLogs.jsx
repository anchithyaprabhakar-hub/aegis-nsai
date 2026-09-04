import {
  FaClock,
  FaShieldAlt,
  FaBullseye,
  FaFingerprint,
} from "react-icons/fa";

function RecentLogs({ logs = [] }) {
  const safeLogs = Array.isArray(logs) ? logs : [];

  const getSeverity = (confidence) => {
    const value = Number(confidence);

    if (!Number.isFinite(value)) {
      return {
        label: "Low",
        color: "#22c55e",
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
          marginBottom: "30px",
        }}
      >
        <h3 style={{ margin: 0 }}>
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
          {safeLogs.length} Total
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

            const severity = getSeverity(safeConfidence);

            return (
              <div
                key={`${log?.time || "detection"}-${index}`}
                className={`log-row ${
                  index === 0 ? "latest-row" : ""
                }`}
              >
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "8px",
                  }}
                >
                  <FaFingerprint color="#38bdf8" />

                  <span>
                    DET-
                    {String(index + 1).padStart(3, "0")}
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
                  <FaClock color="#9ca3af" />

                  <span>
                    Detected: {log?.time || "Unknown"}
                  </span>
                </div>

                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "8px",
                  }}
                >
                  <FaShieldAlt color="#38bdf8" />

                  <span>
                    {log?.prediction || "Unknown"}
                  </span>
                </div>

                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "8px",
                  }}
                >
                  <FaBullseye color="#facc15" />

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
                  }}
                >
                  {severity.label}
                </span>

                {index === 0 && (
                  <span className="latest-badge">
                    ● ANALYZED
                  </span>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

export default RecentLogs;