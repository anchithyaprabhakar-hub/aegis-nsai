import {
  FaHistory,
  FaShieldAlt,
  FaCheckCircle,
  FaExclamationTriangle,
  FaClock,
} from "react-icons/fa";

function RecentLogs({ logs = [] }) {
  const history = Array.isArray(logs)
    ? [...logs].reverse()
    : [];

  const getPrediction = (item) =>
    item?.prediction ||
    item?.final_prediction ||
    item?.label ||
    "Unknown";

  const getConfidence = (item) => {
    const value =
      Number(
        item?.confidence ??
        item?.ml_confidence ??
        0
      ) || 0;

    return `${value.toFixed(2)}%`;
  };

  const getTime = (item) =>
    item?.timestamp ||
    item?.detection_time ||
    item?.detectionTime ||
    item?.analysis_time ||
    "--:--:--";

  const getFileName = (item) =>
    item?.file_name ||
    item?.filename ||
    item?.fileName ||
    "Network Flow Dataset";

  const isNormal = (prediction) => {
    const value = String(prediction)
      .trim()
      .toLowerCase();

    return (
      value === "normal" ||
      value === "benign"
    );
  };

  return (
    <div className="info-card recent-logs-card">

      <div
        className="recent-logs-header"
        style={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          textAlign: "center",
        }}
      >

        <div
          className="recent-logs-heading"
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            textAlign: "center",
            width: "100%",
          }}
        >

          <div className="recent-logs-icon">
            <FaHistory />
          </div>

          <div
            style={{
              width: "100%",
              textAlign: "center",
            }}
          >
            <h3>
              Recent Detections
            </h3>

            <p>
              Historical network-security
              analysis results.
            </p>
          </div>

        </div>

        <div
          className="recent-logs-count"
          style={{
            textAlign: "center",
          }}
        >
          {history.length}{" "}
          {history.length === 1
            ? "Detection"
            : "Detections"}
        </div>

      </div>

      {history.length > 0 ? (
        <div className="recent-logs-table-container">

          <table className="recent-logs-table">

            <thead>
              <tr>
                <th>
                  DETECTION
                </th>

                <th>
                  CLASSIFICATION
                </th>

                <th>
                  CONFIDENCE
                </th>

                <th>
                  SOURCE
                </th>

                <th>
                  TIME
                </th>
              </tr>
            </thead>

            <tbody>

              {history
                .slice(0, 10)
                .map((item, index) => {

                  const prediction =
                    getPrediction(item);

                  const normal =
                    isNormal(prediction);

                  const confidence =
                    Number(
                      item?.confidence ??
                      item?.ml_confidence ??
                      0
                    ) || 0;

                  return (
                    <tr
                      key={
                        item?.id ||
                        `detection-${index}`
                      }
                    >

                      <td>
                        <div className="detection-id">
                          <span>
                            DET-
                            {String(
                              history.length -
                                index
                            ).padStart(
                              3,
                              "0"
                            )}
                          </span>
                        </div>
                      </td>

                      <td>
                        <div
                          className={
                            normal
                              ? "detection-classification detection-normal"
                              : "detection-classification detection-attack"
                          }
                        >

                          {normal ? (
                            <FaCheckCircle />
                          ) : (
                            <FaExclamationTriangle />
                          )}

                          <span>
                            {prediction}
                          </span>

                        </div>
                      </td>

                      <td>
                        <div className="detection-confidence">

                          <span>
                            {getConfidence(
                              item
                            )}
                          </span>

                          <div className="detection-confidence-track">

                            <div
                              className="detection-confidence-fill"
                              style={{
                                width: `${Math.min(
                                  Math.max(
                                    confidence,
                                    0
                                  ),
                                  100
                                )}%`,
                              }}
                            />

                          </div>

                        </div>
                      </td>

                      <td>
                        <div className="detection-source">

                          <FaShieldAlt />

                          <span>
                            {getFileName(
                              item
                            )}
                          </span>

                        </div>
                      </td>

                      <td>
                        <div className="detection-time">

                          <FaClock />

                          <span>
                            {getTime(item)}
                          </span>

                        </div>
                      </td>

                    </tr>
                  );
                })}

            </tbody>

          </table>

        </div>
      ) : (
        <div className="recent-logs-empty">

          <FaHistory />

          <strong>
            No Recent Detections
          </strong>

          <p>
            Completed security analyses will
            appear here.
          </p>

        </div>
      )}

    </div>
  );
}

export default RecentLogs;