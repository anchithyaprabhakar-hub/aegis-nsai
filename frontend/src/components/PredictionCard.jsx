function PredictionCard({ prediction, confidence }) {

  const getThreatColor = () => {

    if (confidence >= 80) return "#ef4444";      // Critical (Red)

    if (confidence >= 60) return "#f97316";      // High (Orange)

    if (confidence >= 30) return "#facc15";      // Medium (Yellow)

    return "#22c55e";                            // Low (Green)

  };

  const getSeverity = () => {

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
        {prediction}
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
        <strong> {prediction}</strong> based on learned attack patterns and
        symbolic rule evaluation.
      </p>

    </div>
  );
}

export default PredictionCard;