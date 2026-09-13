import {
  FaProjectDiagram,
  FaCheckCircle,
} from "react-icons/fa";

function KnowledgeGraph({ graph = [] }) {
  const nodes = Array.isArray(graph)
    ? graph
        .filter(Boolean)
        .map((item) => String(item).trim())
        .filter(Boolean)
    : [];

  return (
    <div
      className="info-card"
      style={{
        gridColumn: "1 / -1",
        padding: "22px 24px",
      }}
    >
      {/* Header */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          gap: "16px",
          marginBottom: "16px",
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "10px",
          }}
        >
          <FaProjectDiagram
            style={{
              fontSize: "20px",
            }}
          />

          <h3
            style={{
              margin: 0,
              fontSize: "22px",
              fontWeight: "700",
            }}
          >
            Knowledge Graph
          </h3>
        </div>

        <div
          style={{
            padding: "7px 14px",
            borderRadius: "20px",
            background: "#222222",
            color: "#e5e7eb",
            fontSize: "13px",
            fontWeight: "700",
            whiteSpace: "nowrap",
          }}
        >
          {nodes.length} {nodes.length === 1 ? "Node" : "Nodes"}
        </div>
      </div>

      {/* Context */}
      <div
        style={{
          padding: "14px 18px",
          borderRadius: "11px",
          background: "#111111",
          border: "1px solid #2c2c2c",
          textAlign: "center",
          fontSize: "15px",
          lineHeight: "1.55",
          color: "#cfd3d8",
        }}
      >
        <strong style={{ color: "#f5f5f5" }}>
          Symbolic Security Context:
        </strong>{" "}
        The knowledge graph represents security concepts and behavioural
        evidence associated with the detected network activity.
      </div>

      {/* Nodes */}
      {nodes.length > 0 ? (
        <div
          style={{
            display: "grid",
            gridTemplateColumns:
              "repeat(auto-fit, minmax(220px, 1fr))",
            gap: "12px",
            marginTop: "12px",
          }}
        >
          {nodes.map((node, index) => (
            <div
              key={`${node}-${index}`}
              style={{
                minHeight: "58px",
                padding: "12px 16px",
                borderRadius: "11px",
                background: "#111111",
                border: "1px solid #2c2c2c",
                display: "flex",
                alignItems: "center",
                gap: "10px",
              }}
            >
              <FaCheckCircle
                style={{
                  flexShrink: 0,
                  fontSize: "16px",
                  color: "#f5f5f5",
                }}
              />

              <span
                style={{
                  fontSize: "15px",
                  fontWeight: "600",
                  color: "#e5e7eb",
                }}
              >
                {node}
              </span>
            </div>
          ))}
        </div>
      ) : (
        <div
          style={{
            marginTop: "12px",
            padding: "16px",
            borderRadius: "11px",
            background: "#111111",
            border: "1px solid #2c2c2c",
            textAlign: "center",
            color: "#8f8f8f",
            fontSize: "14px",
          }}
        >
          No symbolic knowledge-graph nodes were generated for this analysis.
        </div>
      )}

      {/* Footer */}
      {nodes.length > 0 && (
        <p
          style={{
            margin: "14px 0 0",
            textAlign: "center",
            color: "#8f8f8f",
            fontSize: "13px",
            lineHeight: "1.5",
          }}
        >
          These nodes provide symbolic context that complements the neural
          network prediction and connects the detection with relevant
          security concepts.
        </p>
      )}
    </div>
  );
}

export default KnowledgeGraph;