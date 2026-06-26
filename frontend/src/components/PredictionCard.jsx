function PredictionCard({ prediction }) {
  return (
    <div className="info-card">
      <h3>Prediction</h3>

      <h1
        style={{
          color: "#ff4d4f",
          marginTop: "20px",
        }}
      >
        {prediction}
      </h1>
    </div>
  );
}

export default PredictionCard;