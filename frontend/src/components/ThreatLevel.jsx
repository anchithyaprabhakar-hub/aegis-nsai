function ThreatLevel({ level }) {

  const getColor = () => {
    switch (level) {

      case "Low":
        return "green";

      case "Medium":
        return "orange";

      case "High":
        return "red";

      default:
        return "blue";
    }
  };

  return (
    <div className="info-card">
      <h3>Threat Level</h3>

      <span className={`badge ${getColor()}`}>
        {level}
      </span>
    </div>
  );
}

export default ThreatLevel;