function ExplanationCard({ message }) {
  return (
    <div
      className="info-card"
      style={{ gridColumn: "1 / span 2" }}
    >
      <h3>AI Explanation</h3>
      <p>{message}</p>
    </div>
  );
}

export default ExplanationCard;