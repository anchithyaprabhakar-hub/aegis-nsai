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

    "DoS Hulk": {
      priority: "Critical",
      actions: [
        "Apply traffic rate limiting",
        "Monitor server resource usage",
        "Block malicious source IPs",
        "Review firewall and IDS logs",
      ],
    },

    "DoS GoldenEye": {
      priority: "High",
      actions: [
        "Monitor abnormal HTTP traffic",
        "Apply rate limiting",
        "Block suspicious source IPs",
        "Review web server logs",
      ],
    },

    "DoS Slowhttptest": {
      priority: "High",
      actions: [
        "Enable connection timeouts",
        "Apply request rate limiting",
        "Monitor long-lived connections",
        "Review firewall logs",
      ],
    },

    "DoS slowloris": {
      priority: "High",
      actions: [
        "Limit concurrent connections",
        "Configure connection timeouts",
        "Monitor slow HTTP requests",
        "Review web server logs",
      ],
    },

    "SSH-Patator": {
      priority: "High",
      actions: [
        "Block repeated SSH attempts",
        "Enable multi-factor authentication",
        "Disable unnecessary SSH access",
        "Monitor authentication logs",
      ],
    },

    "FTP-Patator": {
      priority: "High",
      actions: [
        "Block repeated FTP login attempts",
        "Enable stronger authentication",
        "Restrict FTP access",
        "Monitor authentication logs",
      ],
    },

    "Web Attack - Brute Force": {
      priority: "High",
      actions: [
        "Enable multi-factor authentication",
        "Rate-limit login attempts",
        "Block repeated malicious requests",
        "Review authentication logs",
      ],
    },

    "Web Attack - XSS": {
      priority: "High",
      actions: [
        "Apply input validation",
        "Enable output encoding",
        "Review web application logs",
        "Deploy appropriate web security controls",
      ],
    },

    "Web Attack - Sql Injection": {
      priority: "Critical",
      actions: [
        "Use parameterized database queries",
        "Validate and sanitize inputs",
        "Review database access logs",
        "Inspect affected application endpoints",
      ],
    },

    Heartbleed: {
      priority: "Critical",
      actions: [
        "Patch vulnerable TLS libraries",
        "Rotate potentially exposed credentials",
        "Review affected systems",
        "Monitor for exploitation attempts",
      ],
    },

    Infiltration: {
      priority: "Critical",
      actions: [
        "Isolate affected systems",
        "Review authentication and access logs",
        "Investigate suspicious processes",
        "Preserve evidence for further analysis",
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

    Normal: {
      priority: "Low",
      actions: [
        "Continue monitoring network activity",
        "Maintain current security policies",
        "Review logs periodically",
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