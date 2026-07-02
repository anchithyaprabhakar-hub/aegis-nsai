import {
  FaProjectDiagram,
  FaNetworkWired,
  FaShieldAlt,
  FaBug,
  FaServer,
} from "react-icons/fa";

function KnowledgeGraph({ graph }) {
  const getIcon = (item) => {
    const text = item.toLowerCase();

    if (text.includes("port")) {
      return <FaNetworkWired color="#38bdf8" />;
    }

    if (text.includes("scan") || text.includes("recon")) {
      return <FaShieldAlt color="#22c55e" />;
    }

    if (
      text.includes("attack") ||
      text.includes("ddos") ||
      text.includes("brute")
    ) {
      return <FaBug color="#ef4444" />;
    }

    return <FaServer color="#9ca3af" />;
  };

  return (
    <div
      className="info-card"
      style={{ gridColumn: "1 / span 2" }}
    >
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: "25px",
        }}
      >
        <h3
          style={{
            display: "flex",
            alignItems: "center",
            gap: "10px",
            margin: 0,
          }}
        >
          <FaProjectDiagram color="#38bdf8" />
          Knowledge Graph
        </h3>

        <span
          style={{
            background: "#222",
            color: "#38bdf8",
            padding: "6px 12px",
            borderRadius: "20px",
            fontSize: "13px",
            fontWeight: "700",
          }}
        >
          {graph.length} Nodes
        </span>
      </div>

      <p
        style={{
          color: "#bdbdbd",
          marginBottom: "25px",
          lineHeight: "1.7",
        }}
      >
        The Neuro-Symbolic engine identified the following entities and
        relationships associated with the detected network activity.
      </p>

      {graph.length === 0 ? (
        <div
          style={{
            textAlign: "center",
            padding: "30px",
            color: "#8f8f8f",
          }}
        >
          <FaProjectDiagram
            size={42}
            style={{ marginBottom: "12px" }}
          />

          <p>No graph data available.</p>
        </div>
      ) : (
        <div className="tags">
          {graph.map((item, index) => (
            <div
              key={index}
              className="tag"
              style={{
                display: "flex",
                alignItems: "center",
                gap: "10px",
                padding: "12px 18px",
              }}
            >
              {getIcon(item)}

              <span>{item}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default KnowledgeGraph;