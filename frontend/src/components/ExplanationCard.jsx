import {
  FaBrain,
  FaProjectDiagram,
  FaInfoCircle,
} from "react-icons/fa";


function ExplanationCard({
  prediction,
  confidence,
  message,
  symbolicConfidence,
  symbolicSupport,
  symbolicExplanation,
}) {
  const mlConfidence = Number(confidence) || 0;

  /*
   * Symbolic support represents behavioural/rule evidence.
   * It is not a statistical probability.
   */
  const symbolicEvidence =
    Number(symbolicSupport ?? symbolicConfidence) || 0;


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


  /* =========================================================
     RENDER
  ========================================================= */

  return (
    <div
      className="info-card"
      style={{
        gridColumn: "1 / span 2",
        padding: "22px 24px",
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
          gap: "10px",
          marginBottom: "16px",
        }}
      >

        <FaBrain
          style={{
            color: "#f5f5f5",
            fontSize: "21px",
          }}
        />

        <h3
          style={{
            margin: 0,
            fontSize: "22px",
            fontWeight: "700",
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
          padding: "14px 18px",
          borderRadius: "11px",
          background: "#111111",
          border: "1px solid #2c2c2c",
          textAlign: "center",
        }}
      >

        <div
          style={{
            fontSize: "16px",
            fontWeight: "700",
          }}
        >

          Final Detection:{" "}

          <span
            style={{
              color: "#38bdf8",
            }}
          >
            {prediction || "Unknown"}
          </span>

        </div>


        <p
          style={{
            margin: "9px 0 0",
            color: "#d1d5db",
            fontSize: "15px",
            lineHeight: "1.55",
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
          gridTemplateColumns: "repeat(2, minmax(0, 1fr))",
          gap: "12px",
          marginTop: "12px",
        }}
      >

        {/* ---------------------------------------------------
            NEURAL CONFIDENCE
        --------------------------------------------------- */}

        <div
          style={{
            minHeight: "105px",
            padding: "14px 16px",
            borderRadius: "11px",
            background: "#151515",
            border: "1px solid #2c2c2c",
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
              gap: "8px",
              fontSize: "16px",
              fontWeight: "700",
            }}
          >

            <FaBrain
              style={{
                color: "#38bdf8",
              }}
            />

            Neural Confidence

          </div>


          <div
            style={{
              marginTop: "7px",
              fontSize: "22px",
              fontWeight: "700",
            }}
          >
            {mlConfidence.toFixed(2)}%
          </div>

        </div>


        {/* ---------------------------------------------------
            SYMBOLIC SUPPORT
        --------------------------------------------------- */}

        <div
          style={{
            minHeight: "105px",
            padding: "14px 16px",
            borderRadius: "11px",
            background: "#151515",
            border: "1px solid #2c2c2c",
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
              gap: "8px",
              fontSize: "16px",
              fontWeight: "700",
            }}
          >

            <FaProjectDiagram
              style={{
                color: "#facc15",
              }}
            />

            Symbolic Rule Support

          </div>


          <div
            style={{
              marginTop: "7px",
              fontSize: "22px",
              fontWeight: "700",
            }}
          >
            {symbolicEvidence.toFixed(2)}%
          </div>


          <div
            style={{
              marginTop: "3px",
              color: "#8f8f8f",
              fontSize: "11px",
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
            gap: "12px",
            marginTop: "12px",
          }}
        >

          {/* -------------------------------------------------
              SYMBOLIC REASONING
          ------------------------------------------------- */}

          {symbolicExplanation && (
            <div
              style={{
                minHeight: "120px",
                padding: "15px 17px",
                borderRadius: "11px",
                background: "#111111",
                border: "1px solid #2c2c2c",
              }}
            >

              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: "8px",
                  fontSize: "16px",
                  fontWeight: "700",
                }}
              >

                <FaProjectDiagram
                  style={{
                    color: "#facc15",
                  }}
                />

                Symbolic Reasoning

              </div>


              <p
                style={{
                  margin: "10px 0 0",
                  color: "#d1d5db",
                  fontSize: "14px",
                  lineHeight: "1.55",
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
                minHeight: "120px",
                padding: "15px 17px",
                borderRadius: "11px",
                background: "#111111",
                border: "1px solid #2c2c2c",
              }}
            >

              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: "8px",
                  fontSize: "16px",
                  fontWeight: "700",
                }}
              >

                <FaInfoCircle
                  style={{
                    color: "#38bdf8",
                  }}
                />

                Neuro-Symbolic Decision

              </div>


              <p
                style={{
                  margin: "10px 0 0",
                  color: "#d1d5db",
                  fontSize: "14px",
                  lineHeight: "1.55",
                  textAlign: "center",
                }}
              >
                {message}
              </p>

            </div>
          )}

        </div>
      )}

    </div>
  );
}


export default ExplanationCard;