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


  /* =========================================================
     GRAPH NODE POSITIONS
  ========================================================= */

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

    const radius = total <= 4 ? 34 : 38;

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
              Neuro-symbolic security relationships
            </div>

          </div>

        </div>


        <div
          style={{
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
          {nodes.length}{" "}
          {nodes.length === 1 ? "Node" : "Nodes"}
        </div>

      </div>


      {/* =====================================================
          GRAPH DESCRIPTION
      ===================================================== */}

      <div
        style={{
          padding: "17px 20px",
          borderRadius: "12px",
          background: "#111111",
          border: "1px solid #303030",
          textAlign: "center",
          color: "#cfd3d8",
          fontSize: "14px",
          lineHeight: "1.6",
        }}
      >
        The graph connects the final detection with symbolic
        security concepts identified from the analysed network
        behaviour.
      </div>


      {/* =====================================================
          GRAPH VISUALIZATION
      ===================================================== */}

      {nodes.length > 0 ? (

        <div
          style={{
            position: "relative",
            width: "100%",
            height: "470px",
            marginTop: "20px",
            borderRadius: "15px",
            background:
              "radial-gradient(circle at center, #171717 0%, #101010 55%, #0d0d0d 100%)",
            border: "1px solid #303030",
            overflow: "hidden",
          }}
        >

          {/* =================================================
              CONNECTION LINES
          ================================================= */}

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
                  stroke="#3a3a3a"
                  strokeWidth="0.35"
                  strokeDasharray="1.5 1"
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
              minHeight: "125px",
              padding: "20px",
              borderRadius: "18px",
              background: "#181818",
              border:
                "2px solid #38bdf8",
              boxShadow:
                "0 0 30px rgba(56, 189, 248, 0.12)",
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
              textAlign: "center",
              zIndex: 3,
            }}
          >

            <FaShieldAlt
              style={{
                fontSize: "24px",
                color: "#38bdf8",
                marginBottom: "9px",
              }}
            />

            <div
              style={{
                color: "#8f8f8f",
                fontSize: "10px",
                fontWeight: "700",
                letterSpacing: "1px",
                textTransform: "uppercase",
              }}
            >
              Final Detection
            </div>

            <div
              style={{
                marginTop: "6px",
                color: "#f5f5f5",
                fontSize: "21px",
                fontWeight: "800",
                lineHeight: "1.25",
                wordBreak: "break-word",
              }}
            >
              {prediction || "Unknown"}
            </div>

          </div>


          {/* =================================================
              SYMBOLIC NODES
          ================================================= */}

          {nodes.map((node, index) => {

            const position =
              getNodePosition(
                index,
                nodes.length
              );

            return (
              <div
                key={`${node}-${index}`}
                style={{
                  position: "absolute",
                  left: `${position.x}%`,
                  top: `${position.y}%`,
                  transform:
                    "translate(-50%, -50%)",
                  width: "175px",
                  minHeight: "82px",
                  padding: "15px",
                  borderRadius: "14px",
                  background: "#151515",
                  border:
                    "1px solid #3a3a3a",
                  display: "flex",
                  alignItems: "center",
                  gap: "11px",
                  zIndex: 2,
                  boxShadow:
                    "0 8px 20px rgba(0,0,0,.25)",
                }}
              >

                <div
                  style={{
                    width: "34px",
                    height: "34px",
                    flexShrink: 0,
                    borderRadius: "9px",
                    background: "#222222",
                    border:
                      "1px solid #363636",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >

                  <FaCheckCircle
                    style={{
                      color: "#22c55e",
                      fontSize: "16px",
                    }}
                  />

                </div>


                <div
                  style={{
                    minWidth: 0,
                  }}
                >

                  <div
                    style={{
                      color: "#777777",
                      fontSize: "9px",
                      fontWeight: "700",
                      letterSpacing: ".8px",
                      textTransform: "uppercase",
                      marginBottom: "4px",
                    }}
                  >
                    Symbolic Node
                  </div>

                  <div
                    style={{
                      color: "#e5e7eb",
                      fontSize: "14px",
                      fontWeight: "700",
                      lineHeight: "1.3",
                      wordBreak: "break-word",
                    }}
                  >
                    {node}
                  </div>

                </div>

              </div>
            );
          })}

        </div>

      ) : (

        /* =====================================================
           EMPTY GRAPH
        ===================================================== */

        <div
          style={{
            marginTop: "20px",
            minHeight: "260px",
            borderRadius: "15px",
            background: "#111111",
            border: "1px solid #303030",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            textAlign: "center",
            padding: "30px",
          }}
        >

          <FaProjectDiagram
            style={{
              fontSize: "34px",
              color: "#555555",
              marginBottom: "12px",
            }}
          />

          <div
            style={{
              color: "#9ca3af",
              fontSize: "15px",
              fontWeight: "600",
            }}
          >
            No symbolic knowledge-graph nodes
            were generated for this analysis.
          </div>

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

          The central detection is connected to symbolic
          behavioural concepts identified during analysis.

        </div>

      )}

    </div>
  );
}


export default KnowledgeGraph;