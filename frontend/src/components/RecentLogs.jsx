function RecentLogs({ logs }) {
  return (
    <div className="info-card recent-logs">
      <h3>Recent Detections</h3>

      {logs.length === 0 ? (
        <p>No detections yet.</p>
      ) : (
        <div className="logs">
          {logs.map((log, index) => (
            <div className="log-row" key={index}>
              <span>{log.time}</span>
              <span>{log.prediction}</span>
              <span>{log.confidence}%</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default RecentLogs;