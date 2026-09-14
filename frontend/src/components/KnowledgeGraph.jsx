import {
  FaProjectDiagram,
  FaCheckCircle,
  FaShieldAlt,
  FaLink,
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
        padding: "30px",
      }}
    >

      {/* =====================================================
          HEADER
      ===================================================== */}

      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          gap: "18px",
          marginBottom: "22px",
        }}
      >

        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "12px",
          }}
        >

          <FaProjectDiagram
            style={{
              fontSize: "25px",
              color: "#f5f5f5",
            }}
          />

          <div>
            <h3
              style={{
                margin: 0,
                fontSize: "24px",
                fontWeight: "700",
                letterSpacing: ".3px",
              }}
            >
              Knowledge Graph
            </h3>

            <div
              style={{
                marginTop: "4px",
                color: "#8f8f8f",
                fontSize: "12px",
              }}
            >
              Symbolic security context
            </div>
          </div>

        </div>


        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "7px",
            padding: "8px 15px",
            borderRadius: "20px",
            background: "#222222",
            border: "1px solid #303030",
            color: "#e5e7eb",
            fontSize: "13px",
            fontWeight: "700",
            whiteSpace: "nowrap",
          }}
        >

          <FaLink
            style={{
              fontSize: "12px",
            }}
          />

          {nodes.length}{" "}
          {nodes.length === 1 ? "Node" : "Nodes"}

        </div>

      </div>


      {/* =====================================================
          DESCRIPTION
      ===================================================== */}

      <div
        style={{
          padding: "20px 22px",
          borderRadius: "13px",
          background: "#111111",
          border: "1px solid #303030",
          textAlign: "center",
        }}
      >

        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: "9px",
            color: "#e5e7eb",
            fontSize: "16px",
            fontWeight: "700",
          }}
        >

          <FaShieldAlt
            style={{
              color: "#38bdf8",
            }}
          />

          Symbolic Security Context

        </div>


        <p
          style={{
            margin: "10px auto 0",
            maxWidth: "950px",
            color: "#cfd3d8",
            fontSize: "14px",
            lineHeight: "1.7",
          }}
        >
          The knowledge graph represents security concepts and
          behavioural evidence associated with the detected network
          activity. These symbolic nodes complement the neural
          network prediction.
        </p>

      </div>


      {/* =====================================================
          KNOWLEDGE NODES
      ===================================================== */}

      {nodes.length > 0 ? (

        <div
          style={{
            display: "grid",
            gridTemplateColumns:
              "repeat(auto-fit, minmax(240px, 1fr))",
            gap: "16px",
            marginTop: "16px",
          }}
        >

          {nodes.map((node, index) => (

            <div
              key={`${node}-${index}`}
              style={{
                minHeight: "88px",
                padding: "20px",
                borderRadius: "13px",
                background: "#151515",
                border: "1px solid #303030",
                display: "flex",
                alignItems: "center",
                gap: "14px",
                transition:
                  "border-color .2s ease, transform .2s ease",
              }}
            >

              {/* Node Icon */}

              <div
                style={{
                  width: "42px",
                  height: "42px",
                  flexShrink: 0,
                  borderRadius: "11px",
                  background: "#222222",
                  border: "1px solid #363636",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >

                <FaCheckCircle
                  style={{
                    fontSize: "18px",
                    color: "#22c55e",
                  }}
                />

              </div>


              {/* Node Information */}

              <div
                style={{
                  minWidth: 0,
                  flex: 1,
                }}
              >

                <div
                  style={{
                    color: "#8f8f8f",
                    fontSize: "10px",
                    fontWeight: "700",
                    letterSpacing: "1px",
                    textTransform: "uppercase",
                    marginBottom: "5px",
                  }}
                >
                  Symbolic Node {index + 1}
                </div>

                <div
                  style={{
                    color: "#f1f5f9",
                    fontSize: "16px",
                    lineHeight: "1.35",
                    fontWeight: "700",
                    wordBreak: "break-word",
                  }}
                >
                  {node}
                </div>

              </div>

            </div>

          ))}

        </div>

      ) : (

        <div
          style={{
            marginTop: "16px",
            padding: "24px",
            borderRadius: "13px",
            background: "#111111",
            border: "1px solid #303030",
            textAlign: "center",
            color: "#8f8f8f",
            fontSize: "14px",
            lineHeight: "1.6",
          }}
        >
          No symbolic knowledge-graph nodes were generated
          for this analysis.
        </div>

      )}


      {/* =====================================================
          FOOTER
      ===================================================== */}

      {nodes.length > 0 && (

        <div
          style={{
            marginTop: "18px",
            padding: "15px 18px",
            borderRadius: "11px",
            background: "#111111",
            border: "1px solid #292929",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: "9px",
            color: "#9ca3af",
            fontSize: "12px",
            lineHeight: "1.55",
            textAlign: "center",
          }}
        >

          <FaProjectDiagram
            style={{
              color: "#facc15",
              flexShrink: 0,
            }}
          />

          These symbolic nodes connect the detected network
          behaviour with relevant security concepts and provide
          additional context for the final classification.

        </div>

      )}

    </div>
  );
}


export default KnowledgeGraph;