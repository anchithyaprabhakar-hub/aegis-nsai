function PredictionCard({ prediction }) {

  const getColor = () => {

    switch (prediction) {

      case "BENIGN":
        return "green";

      case "PortScan":
        return "orange";

      case "DDoS":
        return "red";

      default:
        return "blue";
    }
  };

  return (
    <div className="info-card">

      <h3>Prediction</h3>

      <span className={`badge ${getColor()}`}>
        {prediction}
      </span>

    </div>
  );
}

export default PredictionCard;