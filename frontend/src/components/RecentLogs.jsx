import { FaClock, FaShieldAlt, FaBullseye } from "react-icons/fa";

function RecentLogs({ logs }) {
  return (
    <div className="info-card recent-logs">
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: "25px",
        }}
      >
        <h3 style={{ margin: 0 }}>
          Recent Detections
        </h3>

        <span
          style={{
            background: "#222",
            color: "#22c55e",
            padding: "6px 12px",
            borderRadius: "20px",
            fontSize: "13px",
            fontWeight: "700",
          }}
        >
          {logs.length} Total
        </span>
      </div>

      {logs.length === 0 ? (
        <div
          style={{
            textAlign: "center",
            color: "#8f8f8f",
            padding: "30px",
          }}
        >
          <FaShieldAlt
            size={40}
            style={{
              marginBottom: "12px",
              opacity: 0.5,
            }}
          />

          <p>No detections yet.</p>
        </div>
      ) : (
        <div className="logs">
          {logs.map((log, index) => (
            <div
              key={index}
              className={`log-row ${index === 0 ? "latest-row" : ""}`}
            >
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "8px",
                }}
              >
                <FaClock color="#9ca3af" />
                <span>{log.time}</span>
              </div>

              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "8px",
                }}
              >
                <FaShieldAlt color="#38bdf8" />
                <span>{log.prediction}</span>
              </div>

              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "8px",
                }}
              >
                <FaBullseye color="#facc15" />
                <span>{Number(log.confidence).toFixed(2)}%</span>
              </div>

              {index === 0 && (
                <span className="latest-badge">
                  ● LIVE
                </span>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default RecentLogs;