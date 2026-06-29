function RecentLogs({ logs }) {
  return (
    <div className="info-card recent-logs">
      <h3>Recent Detections</h3>

      {logs.length === 0 ? (
        <p>No detections yet.</p>
      ) : (
        <div className="logs">
          {logs.map((log, index) => (
            <div
              key={index}
              className={`log-row ${index === 0 ? "latest-row" : ""}`}
            >
              <span>{log.time}</span>
              <span>{log.prediction}</span>
              <span>{log.confidence}%</span>

              {index === 0 && (
                <span className="latest-badge">● Latest</span>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default RecentLogs;