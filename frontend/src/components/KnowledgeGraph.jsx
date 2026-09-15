import {
  FaProjectDiagram,
  FaCheckCircle,
  FaShieldAlt,
} from "react-icons/fa";

function KnowledgeGraph({
  graph = [],
  prediction = "Unknown",
}) {
  const nodes = Array.isArray(graph)
    ? graph
        .filter(Boolean)
        .map((item) => String(item).trim())
        .filter(Boolean)
    : [];

  const getNodePosition = (index, total) => {
    if (total === 1) {
      return {
        x: 50,
        y: 50,
      };
    }

    const angle =
      (index / total) * Math.PI * 2 -
      Math.PI / 2;

    const radius =
      total <= 4 ? 34 : 38;

    return {
      x:
        50 +
        Math.cos(angle) * radius,

      y:
        50 +
        Math.sin(angle) * radius,
    };
  };

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
          gap: "12px",
        }}
      >
        <FaProjectDiagram
          style={{
            color: "#38bdf8",
            fontSize: "24px",
          }}
        />

        <div>
          <h3
            style={{
              margin: 0,
              fontSize: "24px",
              fontWeight: "700",
            }}
          >
            Knowledge Graph
          </h3>

          <p
            style={{
              margin: "7px 0 0",
              color: "#8f8f98",
              fontSize: "14px",
            }}
          >
            Security concepts associated with the
            detected network behaviour.
          </p>
        </div>
      </div>

      {/* =====================================================
          GRAPH
      ===================================================== */}

      {nodes.length > 0 ? (
        <div
          style={{
            position: "relative",
            width: "100%",
            height: "470px",
            marginTop: "24px",
            overflow: "hidden",
            borderRadius: "14px",
            background:
              "radial-gradient(circle at center, #161616 0%, #101010 55%, #0d0d0d 100%)",
            border:
              "1px solid rgba(255,255,255,0.08)",
          }}
        >
          {/* SVG CONNECTIONS */}

          <svg
            viewBox="0 0 100 100"
            preserveAspectRatio="none"
            style={{
              position: "absolute",
              inset: 0,
              width: "100%",
              height: "100%",
              pointerEvents: "none",
            }}
          >
            {nodes.map((node, index) => {
              const position =
                getNodePosition(
                  index,
                  nodes.length
                );

              return (
                <line
                  key={`line-${index}`}
                  x1="50"
                  y1="50"
                  x2={position.x}
                  y2={position.y}
                  stroke="#38bdf8"
                  strokeWidth="0.35"
                  strokeOpacity="0.55"
                />
              );
            })}
          </svg>

          {/* =================================================
              CENTRAL DETECTION NODE
          ================================================= */}

          <div
            style={{
              position: "absolute",
              left: "50%",
              top: "50%",
              transform:
                "translate(-50%, -50%)",

              width: "190px",
              minHeight: "115px",

              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",

              padding: "18px",

              borderRadius: "16px",

              background:
                "linear-gradient(145deg, #181818, #111111)",

              border:
                "2px solid #38bdf8",

              boxShadow:
                "0 0 30px rgba(56,189,248,0.16)",

              textAlign: "center",

              zIndex: 5,
            }}
          >
            <FaShieldAlt
              style={{
                color: "#38bdf8",
                fontSize: "23px",
                marginBottom: "9px",
              }}
            />

            <span
              style={{
                color: "#8f8f98",
                fontSize: "10px",
                fontWeight: "700",
                textTransform: "uppercase",
                letterSpacing: "1px",
              }}
            >
              Detected Activity
            </span>

            <strong
              style={{
                marginTop: "5px",
                color: "#f5f5f5",
                fontSize: "18px",
                lineHeight: "1.2",
                wordBreak: "break-word",
              }}
            >
              {String(prediction || "Unknown")}
            </strong>
          </div>

          {/* =================================================
              KNOWLEDGE NODES
          ================================================= */}

          {nodes.map((node, index) => {
            const position =
              getNodePosition(
                index,
                nodes.length
              );

            return (
              <div
                key={`node-${index}`}
                style={{
                  position: "absolute",

                  left: `${position.x}%`,
                  top: `${position.y}%`,

                  transform:
                    "translate(-50%, -50%)",

                  width:
                    nodes.length <= 3
                      ? "180px"
                      : "155px",

                  minHeight: "76px",

                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  justifyContent: "center",

                  padding: "12px 15px",

                  background: "#171717",

                  border:
                    "1px solid rgba(255,255,255,0.14)",

                  borderRadius: "14px",

                  boxShadow:
                    "0 8px 24px rgba(0,0,0,0.3)",

                  textAlign: "center",

                  zIndex: 4,
                }}
              >
                <FaCheckCircle
                  style={{
                    color: "#22c55e",
                    fontSize: "18px",
                    marginBottom: "8px",
                  }}
                />

                <span
                  style={{
                    color: "#e5e7eb",
                    fontSize: "14px",
                    fontWeight: "700",
                    lineHeight: "1.35",
                  }}
                >
                  {node}
                </span>

                <span
                  style={{
                    marginTop: "4px",
                    color: "#737373",
                    fontSize: "10px",
                  }}
                >
                  Security context
                </span>
              </div>
            );
          })}
        </div>
      ) : (
        /* =====================================================
           EMPTY STATE
        ===================================================== */

        <div
          style={{
            minHeight: "250px",
            marginTop: "24px",

            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",

            borderRadius: "14px",

            background: "#101010",

            border:
              "1px solid rgba(255,255,255,0.08)",

            textAlign: "center",
          }}
        >
          <FaProjectDiagram
            style={{
              color: "#525252",
              fontSize: "38px",
              marginBottom: "14px",
            }}
          />

          <strong
            style={{
              color: "#a3a3a3",
              fontSize: "16px",
            }}
          >
            No Knowledge Graph Context
          </strong>

          <p
            style={{
              marginTop: "7px",
              color: "#666666",
              fontSize: "13px",
            }}
          >
            No symbolic security concepts were
            returned for this analysis.
          </p>
        </div>
      )}

      {/* =====================================================
          FOOTER
      ===================================================== */}

      {nodes.length > 0 && (
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "9px",

            marginTop: "16px",

            color: "#737373",
            fontSize: "12px",
          }}
        >
          <FaProjectDiagram
            style={{
              color: "#38bdf8",
            }}
          />

          <span>
            The central node represents the final
            detection and surrounding nodes represent
            associated security concepts.
          </span>
        </div>
      )}
    </div>
  );
}

export default KnowledgeGraph;