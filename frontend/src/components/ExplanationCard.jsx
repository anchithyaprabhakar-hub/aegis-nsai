function ExplanationCard({ prediction, confidence, message }) {

  const getExplanation = () => {

    if (prediction === "PortScan") {
      return `The uploaded network traffic exhibits characteristics commonly associated with a Port Scan attack. The AI model detected reconnaissance behaviour used to identify open ports and available network services. Confidence is ${confidence.toFixed(2)}%, indicating ${
        confidence >= 70
          ? "strong evidence of malicious activity."
          : confidence >= 40
          ? "moderate evidence. Further investigation is recommended."
          : "low confidence. Additional monitoring is recommended before confirming the attack."
      }`;
    }

    if (prediction === "DDoS") {
      return `The network traffic shows patterns consistent with a Distributed Denial-of-Service (DDoS) attack. This type of attack attempts to overwhelm a target with excessive requests, reducing or preventing service availability. Confidence is ${confidence.toFixed(2)}%.`;
    }

    if (prediction === "BruteForce") {
      return `The AI model detected repeated authentication attempts that resemble a Brute Force attack. This behaviour may indicate an attempt to gain unauthorized access through repeated login attempts. Confidence is ${confidence.toFixed(2)}%.`;
    }

    if (prediction === "Benign") {
      return `No significant malicious activity was detected. The uploaded traffic appears to represent normal network behaviour.`;
    }

    return message;
  };

  return (
    <div
      className="info-card"
      style={{ gridColumn: "1 / span 2" }}
    >
      <h3>AI Explanation</h3>

      <p
        style={{
          lineHeight: "1.8",
          color: "#d1d5db",
          fontSize: "17px",
        }}
      >
        {getExplanation()}
      </p>
    </div>
  );
}

export default ExplanationCard;