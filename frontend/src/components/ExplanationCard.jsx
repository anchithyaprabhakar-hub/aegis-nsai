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
  const symbolicEvidence =
    Number(symbolicSupport ?? symbolicConfidence) || 0;

  const getDecisionSummary = () => {
    if (
      symbolicEvidence > 0 &&
      prediction !== "Normal" &&
      prediction !== "Benign"
    ) {
      return "The neural network identified the dominant attack pattern, while symbolic rules provided supporting behavioural evidence.";
    }

    if (
      prediction === "Normal" ||
      prediction === "Benign"
    ) {
      return "The uploaded traffic was classified as normal network behaviour. Symbolic rules did not provide sufficient attack support to override the neural prediction.";
    }

    return "The final classification is based on the combined neural prediction and symbolic reasoning components.";
  };

  return (
    <div
      className="info-card"
      style={{
        gridColumn: "1 / span 2",
      }}
    >
      <h3>
        <FaBrain /> AI Explanation
      </h3>

      {/* ======================================================
          DETECTION SUMMARY
      ====================================================== */}

      <div
        style={{
          marginTop: "22px",
          padding: "16px",
          borderRadius: "12px",
          background: "#111111",
          border: "1px solid #2c2c2c",
        }}
      >
        <p
          style={{
            margin: 0,
            fontSize: "16px",
            lineHeight: "1.7",
          }}
        >
          <strong>Final Detection:</strong>{" "}
          <span
            style={{
              color: "#38bdf8",
              fontWeight: "700",
            }}
          >
            {prediction || "Unknown"}
          </span>
        </p>

        <p
          style={{
            marginTop: "10px",
            marginBottom: 0,
            color: "#d1d5db",
            lineHeight: "1.7",
          }}
        >
          {getDecisionSummary()}
        </p>
      </div>

      {/* ======================================================
          NEURO-SYMBOLIC EVIDENCE
      ====================================================== */}

      <div
        style={{
          display: "grid",
          gridTemplateColumns:
            "repeat(auto-fit, minmax(190px, 1fr))",
          gap: "12px",
          marginTop: "16px",
        }}
      >
        <div
          style={{
            padding: "14px",
            borderRadius: "10px",
            background: "#151515",
            border: "1px solid #2c2c2c",
          }}
        >
          <FaBrain
            style={{
              marginRight: "8px",
              color: "#38bdf8",
            }}
          />

          <strong>Neural Confidence</strong>

          <div
            style={{
              marginTop: "8px",
              fontSize: "20px",
              fontWeight: "700",
            }}
          >
            {mlConfidence.toFixed(2)}%
          </div>
        </div>

        <div
          style={{
            padding: "14px",
            borderRadius: "10px",
            background: "#151515",
            border: "1px solid #2c2c2c",
          }}
        >
          <FaProjectDiagram
            style={{
              marginRight: "8px",
              color: "#facc15",
            }}
          />

          <strong>Symbolic Evidence</strong>

          <div
            style={{
              marginTop: "8px",
              fontSize: "20px",
              fontWeight: "700",
            }}
          >
            {symbolicEvidence.toFixed(2)}%
          </div>
        </div>
      </div>

      {/* ======================================================
          SYMBOLIC EXPLANATION
      ====================================================== */}

      {symbolicExplanation && (
        <div
          style={{
            marginTop: "18px",
            padding: "16px",
            borderRadius: "12px",
            background: "#111111",
            border: "1px solid #2c2c2c",
          }}
        >
          <p
            style={{
              margin: 0,
              fontWeight: "700",
            }}
          >
            <FaProjectDiagram
              style={{
                marginRight: "8px",
                color: "#facc15",
              }}
            />
            Symbolic Reasoning
          </p>

          <p
            style={{
              marginTop: "10px",
              marginBottom: 0,
              lineHeight: "1.8",
              color: "#d1d5db",
              fontSize: "16px",
            }}
          >
            {symbolicExplanation}
          </p>
        </div>
      )}

      {/* ======================================================
          MODEL MESSAGE
      ====================================================== */}

      {message && (
        <div
          style={{
            marginTop: "18px",
            padding: "16px",
            borderRadius: "12px",
            background: "#111111",
            border: "1px solid #2c2c2c",
          }}
        >
          <p
            style={{
              margin: 0,
              fontWeight: "700",
            }}
          >
            <FaInfoCircle
              style={{
                marginRight: "8px",
                color: "#38bdf8",
              }}
            />
            Neuro-Symbolic Decision
          </p>

          <p
            style={{
              marginTop: "10px",
              marginBottom: 0,
              lineHeight: "1.8",
              color: "#d1d5db",
              fontSize: "16px",
            }}
          >
            {message}
          </p>
        </div>
      )}
    </div>
  );
}

export default ExplanationCard;
