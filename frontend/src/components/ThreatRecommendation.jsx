import { FaShieldAlt, FaCheckCircle } from "react-icons/fa";

function ThreatRecommendation({ prediction }) {
  const recommendations = {
    PortScan: {
      priority: "Medium",
      actions: [
        "Monitor suspicious IP addresses",
        "Close unnecessary open ports",
        "Review firewall configuration",
        "Enable IDS/IPS logging",
      ],
    },

    DDoS: {
      priority: "Critical",
      actions: [
        "Enable DDoS protection",
        "Rate-limit incoming traffic",
        "Monitor server resources",
        "Contact ISP if attack persists",
      ],
    },

    BruteForce: {
      priority: "High",
      actions: [
        "Lock suspicious accounts",
        "Enable multi-factor authentication",
        "Monitor authentication logs",
        "Block repeated login attempts",
      ],
    },

    Benign: {
      priority: "Low",
      actions: [
        "Continue monitoring network activity",
        "Maintain current security policies",
        "Review logs periodically",
      ],
    },
  };

  const data =
    recommendations[prediction] || recommendations.Benign;

  return (
    <div className="info-card">
      <h3>
        <FaShieldAlt /> Recommended Actions
      </h3>

      <p>
        <strong>Priority:</strong> {data.priority}
      </p>

      <div style={{ marginTop: "20px" }}>
        {data.actions.map((action, index) => (
          <p key={index}>
            <FaCheckCircle
              color="#22c55e"
              style={{ marginRight: "10px" }}
            />
            {action}
          </p>
        ))}
      </div>
    </div>
  );
}

export default ThreatRecommendation;