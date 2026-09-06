import {
  FaProjectDiagram,
  FaNetworkWired,
  FaShieldAlt,
  FaBug,
  FaServer,
  FaCheckCircle,
} from "react-icons/fa";

function KnowledgeGraph({ graph }) {
  const graphNodes = Array.isArray(graph) ? graph : [];

  const getIcon = (item) => {
    const text = String(item || "").toLowerCase();

    if (
      text.includes("port") ||
      text.includes("network") ||
      text.includes("open")
    ) {
      return <FaNetworkWired />;
    }

    if (
      text.includes("scan") ||
      text.includes("reconnaissance") ||
      text.includes("recon")
    ) {
      return <FaShieldAlt />;
    }

    if (
      text.includes("attack") ||
      text.includes("ddos") ||
      text.includes("brute") ||
      text.includes("disruption")
    ) {
      return <FaBug />;
    }

    if (
      text.includes("normal") ||
      text.includes("no malicious")
    ) {
      return <FaCheckCircle />;
    }

    return <FaServer />;
  };

  return (
    <div
      className="info-card"
      style={{
        gridColumn: "1 / span 2",
      }}
    >
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          gap: "15px",
          marginBottom: "20px",
          flexWrap: "wrap",
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
          <FaProjectDiagram />
          Knowledge Graph
        </h3>

        <span
          style={{
            background: "#222",
            padding: "6px 12px",
            borderRadius: "20px",
            fontSize: "13px",
            fontWeight: "700",
          }}
        >
          {graphNodes.length}{" "}
          {graphNodes.length === 1 ? "Node" : "Nodes"}
        </span>
      </div>

      <div
        style={{
          padding: "14px 16px",
          marginBottom: "20px",
          borderRadius: "10px",
          background: "#111111",
          border: "1px solid #2c2c2c",
        }}
      >
        <p
          style={{
            margin: 0,
            color: "#d1d5db",
            lineHeight: "1.7",
          }}
        >
          <strong>Symbolic Security Context:</strong>{" "}
          The knowledge graph represents security concepts and behavioural
          evidence associated with the detected network activity.
        </p>
      </div>

      {graphNodes.length === 0 ? (
        <div
          style={{
            textAlign: "center",
            padding: "35px 20px",
            color: "#8f8f8f",
            border: "1px dashed #333",
            borderRadius: "12px",
          }}
        >
          <FaProjectDiagram
            size={42}
            style={{
              marginBottom: "12px",
            }}
          />

          <p
            style={{
              margin: 0,
            }}
          >
            No symbolic graph data is available for this analysis.
          </p>
        </div>
      ) : (
        <>
          <div
            style={{
              display: "grid",
              gridTemplateColumns:
                "repeat(auto-fit, minmax(190px, 1fr))",
              gap: "12px",
            }}
          >
            {graphNodes.map((item, index) => (
              <div
                key={`${String(item)}-${index}`}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "12px",
                  padding: "15px",
                  borderRadius: "10px",
                  background: "#151515",
                  border: "1px solid #2c2c2c",
                  minHeight: "54px",
                }}
              >
                <span
                  style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    minWidth: "32px",
                    fontSize: "17px",
                  }}
                >
                  {getIcon(item)}
                </span>

                <span
                  style={{
                    color: "#e5e7eb",
                    fontWeight: "600",
                    lineHeight: "1.4",
                  }}
                >
                  {String(item)}
                </span>
              </div>
            ))}
          </div>

          <p
            style={{
              marginTop: "18px",
              marginBottom: 0,
              color: "#8f8f8f",
              fontSize: "14px",
              lineHeight: "1.6",
            }}
          >
            These nodes provide symbolic context that complements the neural
            network prediction and helps connect the detection with relevant
            security concepts.
          </p>
        </>
      )}
    </div>
  );
}

export default KnowledgeGraph;