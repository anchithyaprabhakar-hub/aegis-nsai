import {
  FaBrain,
  FaProjectDiagram,
  FaInfoCircle,
  FaCheckCircle,
} from "react-icons/fa";


function ExplanationCard({
  prediction,
  confidence,
  message,
  symbolicConfidence,
  symbolicSupport,
  symbolicExplanation,
}) {
  const mlConfidence =
    Number(confidence) || 0;

  /*
   * Symbolic support represents behavioural/rule evidence.
   * It is not a statistical probability.
   */
  const symbolicEvidence =
    Number(
      symbolicSupport ?? symbolicConfidence
    ) || 0;


  /* =========================================================
     HELPERS
  ========================================================= */

  const isNormal =
    prediction === "Normal" ||
    prediction === "Benign";


  const getDecisionSummary = () => {
    if (
      symbolicEvidence > 0 &&
      !isNormal
    ) {
      return (
        "The neural network identified the dominant attack pattern, "
        + "while symbolic rules provided supporting behavioural evidence."
      );
    }

    if (isNormal) {
      return (
        "The uploaded traffic was classified as normal network behaviour. "
        + "Symbolic rules did not provide sufficient attack support to "
        + "override the neural prediction."
      );
    }

    return (
      "The final classification is based on the combined neural "
      + "prediction and symbolic reasoning components."
    );
  };


  const getDetectionClass = () => {
    if (isNormal) {
      return "normal";
    }

    return "threat";
  };


  /* =========================================================
     RENDER
  ========================================================= */

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
          justifyContent: "center",
          gap: "12px",
          marginBottom: "22px",
        }}
      >

        <FaBrain
          style={{
            color: "#f5f5f5",
            fontSize: "25px",
          }}
        />

        <h3
          style={{
            margin: 0,
            fontSize: "24px",
            fontWeight: "700",
            letterSpacing: ".3px",
          }}
        >
          AI Explanation
        </h3>

      </div>


      {/* =====================================================
          FINAL DETECTION
      ===================================================== */}

      <div
        style={{
          padding: "22px 24px",
          borderRadius: "13px",
          background: "#111111",
          border: "1px solid #303030",
          textAlign: "center",
        }}
      >

        <div
          style={{
            color: "#9ca3af",
            fontSize: "13px",
            fontWeight: "700",
            letterSpacing: "1.2px",
            textTransform: "uppercase",
            marginBottom: "8px",
          }}
        >
          Final Detection
        </div>


        <div
          className={getDetectionClass()}
          style={{
            fontSize: "34px",
            lineHeight: "1.15",
            fontWeight: "800",
            color: isNormal
              ? "#22b9ff"
              : "#ef4444",
          }}
        >
          {prediction || "Unknown"}
        </div>


        <p
          style={{
            margin: "12px auto 0",
            maxWidth: "900px",
            color: "#d1d5db",
            fontSize: "15px",
            lineHeight: "1.65",
          }}
        >
          {getDecisionSummary()}
        </p>

      </div>


      {/* =====================================================
          NEURO-SYMBOLIC EVIDENCE
      ===================================================== */}

      <div
        style={{
          display: "grid",
          gridTemplateColumns:
            "repeat(2, minmax(0, 1fr))",
          gap: "16px",
          marginTop: "16px",
        }}
      >

        {/* ---------------------------------------------------
            NEURAL NETWORK
        --------------------------------------------------- */}

        <div
          style={{
            minHeight: "145px",
            padding: "22px",
            borderRadius: "13px",
            background: "#151515",
            border: "1px solid #303030",
            textAlign: "center",
            display: "flex",
            flexDirection: "column",
            justifyContent: "center",
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

            <FaBrain
              style={{
                color: "#38bdf8",
                fontSize: "18px",
              }}
            />

            Neural Network Evidence

          </div>


          <div
            style={{
              marginTop: "12px",
              color: "#38bdf8",
              fontSize: "30px",
              lineHeight: "1",
              fontWeight: "800",
            }}
          >
            {mlConfidence.toFixed(2)}%
          </div>


          <div
            style={{
              marginTop: "8px",
              color: "#9ca3af",
              fontSize: "12px",
            }}
          >
            Model confidence
          </div>

        </div>


        {/* ---------------------------------------------------
            SYMBOLIC RULES
        --------------------------------------------------- */}

        <div
          style={{
            minHeight: "145px",
            padding: "22px",
            borderRadius: "13px",
            background: "#151515",
            border: "1px solid #303030",
            textAlign: "center",
            display: "flex",
            flexDirection: "column",
            justifyContent: "center",
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

            <FaProjectDiagram
              style={{
                color: "#facc15",
                fontSize: "18px",
              }}
            />

            Symbolic Rule Evidence

          </div>


          <div
            style={{
              marginTop: "12px",
              color: "#facc15",
              fontSize: "30px",
              lineHeight: "1",
              fontWeight: "800",
            }}
          >
            {symbolicEvidence.toFixed(2)}%
          </div>


          <div
            style={{
              marginTop: "8px",
              color: "#9ca3af",
              fontSize: "12px",
            }}
          >
            Behavioural rule evidence
          </div>

        </div>

      </div>


      {/* =====================================================
          REASONING + DECISION
      ===================================================== */}

      {(symbolicExplanation || message) && (
        <div
          style={{
            display: "grid",
            gridTemplateColumns:
              symbolicExplanation && message
                ? "repeat(2, minmax(0, 1fr))"
                : "1fr",
            gap: "16px",
            marginTop: "16px",
          }}
        >

          {/* -------------------------------------------------
              SYMBOLIC REASONING
          ------------------------------------------------- */}

          {symbolicExplanation && (
            <div
              style={{
                minHeight: "150px",
                padding: "22px",
                borderRadius: "13px",
                background: "#111111",
                border: "1px solid #303030",
                display: "flex",
                flexDirection: "column",
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

                <FaProjectDiagram
                  style={{
                    color: "#facc15",
                    fontSize: "18px",
                  }}
                />

                Symbolic Reasoning

              </div>


              <p
                style={{
                  margin: "14px 0 0",
                  color: "#d1d5db",
                  fontSize: "14px",
                  lineHeight: "1.7",
                  textAlign: "center",
                }}
              >
                {symbolicExplanation}
              </p>

            </div>
          )}


          {/* -------------------------------------------------
              NEURO-SYMBOLIC DECISION
          ------------------------------------------------- */}

          {message && (
            <div
              style={{
                minHeight: "150px",
                padding: "22px",
                borderRadius: "13px",
                background: "#111111",
                border: "1px solid #303030",
                display: "flex",
                flexDirection: "column",
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

                <FaInfoCircle
                  style={{
                    color: "#38bdf8",
                    fontSize: "18px",
                  }}
                />

                Neuro-Symbolic Decision

              </div>


              <p
                style={{
                  margin: "14px 0 0",
                  color: "#d1d5db",
                  fontSize: "14px",
                  lineHeight: "1.7",
                  textAlign: "center",
                }}
              >
                {message}
              </p>

            </div>
          )}

        </div>
      )}


      {/* =====================================================
          EXPLANATION FOOTER
      ===================================================== */}

      <div
        style={{
          marginTop: "16px",
          padding: "13px 16px",
          borderRadius: "10px",
          background: "#151515",
          border: "1px solid #292929",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          gap: "9px",
          color: "#9ca3af",
          fontSize: "12px",
          lineHeight: "1.5",
          textAlign: "center",
        }}
      >

        <FaCheckCircle
          style={{
            color: "#22c55e",
            flexShrink: 0,
          }}
        />

        AEGIS-NSAI combines learned neural patterns with
        symbolic behavioural reasoning to support the final
        network-traffic classification.

      </div>

    </div>
  );
}


export default ExplanationCard;