function PredictionCard({ prediction, confidence }) {
  const normalizedPrediction = String(prediction || "").trim();
  const isNormal = normalizedPrediction === "Normal";

  const getThreatColor = () => {
    if (isNormal) return "#22c55e";

    if (confidence >= 80) return "#ef4444";
    if (confidence >= 60) return "#f97316";
    if (confidence >= 30) return "#facc15";

    return "#22c55e";
  };

  const getSeverity = () => {
    if (isNormal) return "Low";

    if (confidence >= 80) return "Critical";
    if (confidence >= 60) return "High";
    if (confidence >= 30) return "Medium";

    return "Low";
  };

  return (
    <div className="info-card">
      <h3>Prediction</h3>

      <h1
        style={{
          color: getThreatColor(),
          marginTop: "20px",
          fontSize: "42px",
          fontWeight: "700",
        }}
      >
        {normalizedPrediction || "Unknown"}
      </h1>

      <div
        style={{
          marginTop: "18px",
          display: "inline-block",
          padding: "8px 18px",
          borderRadius: "25px",
          background: getThreatColor(),
          color: "#000",
          fontWeight: "700",
          fontSize: "15px",
        }}
      >
        Severity : {getSeverity()}
      </div>

      <p
        style={{
          marginTop: "20px",
          color: "#bdbdbd",
          lineHeight: "1.8",
        }}
      >
        The AI engine has classified the uploaded network traffic as
        <strong> {normalizedPrediction || "Unknown"}</strong> based on
        learned attack patterns and symbolic rule evaluation.
      </p>
    </div>
  );
}

export default PredictionCard;