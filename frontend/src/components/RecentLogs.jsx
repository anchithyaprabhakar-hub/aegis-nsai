import {
  FaClock,
  FaShieldAlt,
  FaBullseye,
  FaFingerprint,
  FaFileCsv,
} from "react-icons/fa";


function RecentLogs({ logs = [] }) {
  const safeLogs = Array.isArray(logs)
    ? logs
    : [];


  /* =========================================================
     SEVERITY
  ========================================================= */

  const getSeverity = (
    prediction,
    confidence
  ) => {
    const normalizedPrediction =
      String(prediction || "")
        .trim()
        .toLowerCase();

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


  /* =========================================================
     NEWEST FIRST
  ========================================================= */

  const displayedLogs =
    [...safeLogs].reverse();


  /* =========================================================
     EMPTY STATE
  ========================================================= */

  if (safeLogs.length === 0) {
    return (
      <div
        className="info-card recent-logs"
        style={{
          width: "100%",
          padding: "20px 22px",
        }}
      >

        <div
          style={{
            textAlign: "center",
          }}
        >
          <h3
            style={{
              margin: 0,
              fontSize: "22px",
              fontWeight: "700",
            }}
          >
            Recent Detections
          </h3>

          <div
            style={{
              minHeight: "120px",
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
              color: "#8f8f8f",
            }}
          >

            <FaShieldAlt
              size={32}
              style={{
                marginBottom: "10px",
                opacity: 0.5,
              }}
            />

            <h4
              style={{
                margin: "0 0 5px",
                color: "#d4d4d8",
              }}
            >
              No detections yet
            </h4>

            <p
              style={{
                margin: 0,
                fontSize: "13px",
              }}
            >
              Upload a CSV file to begin
              network analysis.
            </p>

          </div>
        </div>

      </div>
    );
  }


  /* =========================================================
     RENDER
  ========================================================= */

  return (
    <div
      className="info-card recent-logs"
      style={{
        width: "100%",
        padding: "20px 22px",
      }}
    >

      {/* HEADER */}

      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          gap: "12px",
          marginBottom: "12px",
        }}
      >

        <h3
          style={{
            margin: 0,
            fontSize: "22px",
            fontWeight: "700",
          }}
        >
          Recent Detections
        </h3>

        <span
          style={{
            background: "#222222",
            color: "#22c55e",
            padding: "5px 12px",
            borderRadius: "20px",
            fontSize: "12px",
            fontWeight: "700",
            whiteSpace: "nowrap",
          }}
        >
          {safeLogs.length}{" "}
          {safeLogs.length === 1
            ? "Detection"
            : "Detections"}
        </span>

      </div>


      {/* COLUMN HEADERS */}

      <div
        style={{
          display: "grid",
          gridTemplateColumns:
            "0.8fr 1.7fr 1.2fr 1.1fr 0.8fr 0.7fr",
          gap: "10px",
          padding: "8px 12px",
          color: "#777777",
          fontSize: "10px",
          fontWeight: "700",
          textTransform: "uppercase",
          letterSpacing: "0.7px",
        }}
      >
        <span>Detection</span>
        <span>Dataset</span>
        <span>Time</span>
        <span>Prediction</span>
        <span>Confidence</span>
        <span>Severity</span>
      </div>


      {/* DETECTION ROWS */}

      <div
        style={{
          display: "flex",
          flexDirection: "column",
          gap: "7px",
        }}
      >

        {displayedLogs.map(
          (log, index) => {

            const confidence =
              Number(log?.confidence);

            const safeConfidence =
              Number.isFinite(confidence)
                ? confidence
                : 0;

            const prediction =
              log?.prediction ||
              "Unknown";

            const severity =
              getSeverity(
                prediction,
                safeConfidence
              );

            const detectionId =
              log?.id ||
              `DET-${String(
                safeLogs.length - index
              ).padStart(3, "0")}`;

            const filename =
              log?.filename ||
              "Uploaded network dataset";

            const timestamp =
              log?.timestamp ||
              log?.time ||
              "Unknown time";


            return (
              <div
                key={`${detectionId}-${index}`}
                className={
                  index === 0
                    ? "log-row latest-row"
                    : "log-row"
                }
                style={{
                  display: "grid",
                  gridTemplateColumns:
                    "0.8fr 1.7fr 1.2fr 1.1fr 0.8fr 0.7fr",
                  alignItems: "center",
                  gap: "10px",
                  minHeight: "52px",
                  padding: "9px 12px",
                  borderRadius: "10px",
                  background:
                    index === 0
                      ? "#181818"
                      : "#111111",
                  border:
                    index === 0
                      ? "1px solid #303030"
                      : "1px solid #242424",
                }}
              >

                {/* DETECTION ID */}

                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "7px",
                    minWidth: 0,
                    fontSize: "12px",
                    fontWeight: "600",
                  }}
                >

                  <FaFingerprint
                    style={{
                      flexShrink: 0,
                      color: "#8f8f8f",
                    }}
                  />

                  <span
                    style={{
                      overflow: "hidden",
                      textOverflow: "ellipsis",
                      whiteSpace: "nowrap",
                    }}
                  >
                    {detectionId}
                  </span>

                </div>


                {/* FILE */}

                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "7px",
                    minWidth: 0,
                    fontSize: "12px",
                    color: "#cfd3d8",
                  }}
                  title={filename}
                >

                  <FaFileCsv
                    style={{
                      flexShrink: 0,
                      color: "#8f8f8f",
                    }}
                  />

                  <span
                    style={{
                      overflow: "hidden",
                      textOverflow: "ellipsis",
                      whiteSpace: "nowrap",
                    }}
                  >
                    {filename}
                  </span>

                </div>


                {/* TIME */}

                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "7px",
                    minWidth: 0,
                    fontSize: "11px",
                    color: "#9ca3af",
                  }}
                  title={timestamp}
                >

                  <FaClock
                    style={{
                      flexShrink: 0,
                    }}
                  />

                  <span
                    style={{
                      overflow: "hidden",
                      textOverflow: "ellipsis",
                      whiteSpace: "nowrap",
                    }}
                  >
                    {timestamp}
                  </span>

                </div>


                {/* PREDICTION */}

                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "7px",
                    minWidth: 0,
                    fontSize: "12px",
                    fontWeight: "600",
                  }}
                >

                  <FaShieldAlt
                    style={{
                      flexShrink: 0,
                      color:
                        prediction === "Normal"
                          ? "#22c55e"
                          : "#ef4444",
                    }}
                  />

                  <span
                    style={{
                      overflow: "hidden",
                      textOverflow: "ellipsis",
                      whiteSpace: "nowrap",
                    }}
                    title={prediction}
                  >
                    {prediction}
                  </span>

                </div>


                {/* CONFIDENCE */}

                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "7px",
                    fontSize: "12px",
                    fontWeight: "600",
                    color: "#d4d4d8",
                  }}
                >

                  <FaBullseye
                    style={{
                      color: "#38bdf8",
                      flexShrink: 0,
                    }}
                  />

                  <span>
                    {safeConfidence.toFixed(2)}%
                  </span>

                </div>


                {/* SEVERITY */}

                <div>
                  <span
                    style={{
                      display: "inline-flex",
                      alignItems: "center",
                      justifyContent: "center",
                      minWidth: "58px",
                      padding: "5px 9px",
                      borderRadius: "20px",
                      background:
                        severity.color,
                      color: "#000000",
                      fontWeight: "700",
                      fontSize: "10px",
                      whiteSpace: "nowrap",
                    }}
                  >
                    {severity.label}
                  </span>
                </div>

              </div>
            );
          }
        )}

      </div>

    </div>
  );
}


export default RecentLogs;