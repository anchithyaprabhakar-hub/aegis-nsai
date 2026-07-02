function ConfidenceBar({ confidence }) {

  let color = "#22c55e";
  let level = "Low";
  let description =
    "The prediction confidence is low. Additional monitoring is recommended.";

  if (confidence >= 80) {
    color = "#ef4444";
    level = "Critical";
    description =
      "The AI model is highly confident that this traffic represents malicious activity.";
  } else if (confidence >= 60) {
    color = "#f97316";
    level = "High";
    description =
      "The prediction indicates strong evidence of suspicious network behaviour.";
  } else if (confidence >= 30) {
    color = "#facc15";
    level = "Medium";
    description =
      "The prediction shows moderate confidence. Further investigation is recommended.";
  }

  return (
    <div className="info-card">

      <h3>Confidence Score</h3>

      <div
        style={{
          marginTop: "25px",
          width: "100%",
          height: "14px",
          background: "#2d2d2d",
          borderRadius: "12px",
          overflow: "hidden",
        }}
      >
        <div
          style={{
            width: `${confidence}%`,
            height: "100%",
            background: color,
            transition: "width 0.8s ease-in-out",
          }}
        />
      </div>

      <h2
        style={{
          marginTop: "22px",
          color,
          fontSize: "36px",
        }}
      >
        {confidence.toFixed(2)}%
      </h2>

      <div
        style={{
          display: "inline-block",
          marginTop: "12px",
          padding: "6px 16px",
          borderRadius: "20px",
          background: color,
          color: "#000",
          fontWeight: "700",
          fontSize: "14px",
        }}
      >
        {level} Confidence
      </div>

      <p
        style={{
          marginTop: "20px",
          color: "#cfcfcf",
          lineHeight: "1.7",
          fontSize: "15px",
        }}
      >
        {description}
      </p>

    </div>
  );
}

export default ConfidenceBar;