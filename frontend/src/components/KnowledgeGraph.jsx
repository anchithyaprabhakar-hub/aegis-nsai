function KnowledgeGraph({ graph }) {
  return (
    <div
      className="info-card"
      style={{ gridColumn: "1 / span 2" }}
    >
      <h3>Knowledge Graph</h3>

      <div className="tags">
        {graph.map((item, index) => (
          <span
            key={index}
            className="tag"
          >
            {item}
          </span>
        ))}
      </div>
    </div>
  );
}

export default KnowledgeGraph;