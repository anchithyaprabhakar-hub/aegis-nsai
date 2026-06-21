function ConfidenceBar({ confidence }) {
  return (
    <div className="info-card">
      <h3>Confidence</h3>

      <div className="progress">
        <div
          className="progress-fill"
          style={{ width: `${confidence}%` }}
        ></div>
      </div>

      <h2>{confidence}%</h2>
    </div>
  );
}

export default ConfidenceBar;