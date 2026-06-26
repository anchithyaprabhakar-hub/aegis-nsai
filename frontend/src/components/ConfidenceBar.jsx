function ConfidenceBar({ confidence }) {
  let color = "#22c55e"; // Green

  if (confidence >= 70) {
    color = "#ef4444"; // Red
  } else if (confidence >= 40) {
    color = "#f59e0b"; // Yellow
  }

  return (
    <div className="info-card">
      <h3>Confidence</h3>

      <div
        style={{
          width: "100%",
          height: "12px",
          background: "#333",
          borderRadius: "10px",
          overflow: "hidden",
          marginTop: "30px",
        }}
      >
        <div
          style={{
            width: `${confidence}%`,
            height: "100%",
            background: color,
            transition: "width 0.8s ease",
          }}
        />
      </div>

      <h2
        style={{
          marginTop: "25px",
          color,
        }}
      >
        {confidence.toFixed(2)}%
      </h2>
    </div>
  );
}

export default ConfidenceBar;