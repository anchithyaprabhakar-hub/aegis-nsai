import {
  FaShieldAlt,
  FaCheckCircle,
  FaExclamationTriangle,
  FaInfoCircle,
} from "react-icons/fa";

function ThreatRecommendation({ prediction }) {
  const normalizedPrediction = String(prediction || "").trim();

  const recommendations = {
    PortScan: {
      priority: "Medium",
      summary:
        "The detected traffic is consistent with reconnaissance activity that may indicate attempts to discover accessible network services.",
      immediate: [
        "Monitor suspicious source IP addresses",
        "Close unnecessary exposed ports",
        "Review firewall and access-control rules",
      ],
      followUp: [
        "Enable IDS/IPS logging for reconnaissance events",
        "Review recent connection attempts to exposed services",
      ],
    },

    DDoS: {
      priority: "Critical",
      summary:
        "The detected traffic is consistent with high-volume service disruption activity and requires immediate investigation.",
      immediate: [
        "Enable available DDoS protection controls",
        "Apply appropriate traffic rate limiting",
        "Monitor server and network resource usage",
      ],
      followUp: [
        "Identify and block confirmed malicious sources where appropriate",
        "Contact the ISP or upstream provider if the attack persists",
      ],
    },

    "DoS Hulk": {
      priority: "Critical",
      summary:
        "The traffic pattern is consistent with aggressive denial-of-service activity targeting service availability.",
      immediate: [
        "Apply traffic rate limiting",
        "Monitor server resource utilization",
        "Block confirmed malicious source IPs where appropriate",
      ],
      followUp: [
        "Review firewall and IDS logs",
        "Investigate affected services and endpoints",
      ],
    },

    "DoS GoldenEye": {
      priority: "High",
      summary:
        "The detected traffic resembles application-layer denial-of-service activity involving abnormal HTTP behaviour.",
      immediate: [
        "Monitor abnormal HTTP traffic",
        "Apply appropriate request rate limiting",
        "Block confirmed malicious source IPs where appropriate",
      ],
      followUp: [
        "Review web-server logs",
        "Investigate affected HTTP endpoints",
      ],
    },

    "DoS Slowhttptest": {
      priority: "High",
      summary:
        "The traffic pattern is consistent with slow HTTP request behaviour that can consume server connection resources.",
      immediate: [
        "Configure appropriate connection timeouts",
        "Apply request rate limiting",
        "Monitor long-lived connections",
      ],
      followUp: [
        "Review firewall and web-server logs",
        "Investigate abnormal connection-duration patterns",
      ],
    },

    "DoS slowloris": {
      priority: "High",
      summary:
        "The detected behaviour resembles slow HTTP connection activity that may exhaust available server connections.",
      immediate: [
        "Limit excessive concurrent connections",
        "Configure appropriate connection timeouts",
        "Monitor slow HTTP requests",
      ],
      followUp: [
        "Review web-server logs",
        "Investigate repeated long-lived connections",
      ],
    },

    "SSH-Patator": {
      priority: "High",
      summary:
        "The detected traffic is consistent with repeated SSH authentication attempts that may indicate credential-guessing activity.",
      immediate: [
        "Block or rate-limit repeated SSH attempts",
        "Enable multi-factor authentication where available",
        "Disable unnecessary external SSH access",
      ],
      followUp: [
        "Monitor SSH authentication logs",
        "Review accounts targeted by repeated attempts",
      ],
    },

    "FTP-Patator": {
      priority: "High",
      summary:
        "The detected traffic resembles repeated FTP authentication attempts that may indicate credential-guessing activity.",
      immediate: [
        "Block or rate-limit repeated FTP login attempts",
        "Apply stronger authentication controls",
        "Restrict FTP access to authorized sources",
      ],
      followUp: [
        "Monitor authentication logs",
        "Review accounts targeted by repeated attempts",
      ],
    },

    "Web Attack Brute Force": {
      priority: "High",
      summary:
        "The traffic pattern is consistent with repeated web authentication attempts that may indicate credential-guessing activity.",
      immediate: [
        "Enable multi-factor authentication",
        "Rate-limit repeated login attempts",
        "Block confirmed malicious requests where appropriate",
      ],
      followUp: [
        "Review authentication logs",
        "Investigate targeted accounts and endpoints",
      ],
    },

    "Web Attack - Brute Force": {
      priority: "High",
      summary:
        "The traffic pattern is consistent with repeated web authentication attempts that may indicate credential-guessing activity.",
      immediate: [
        "Enable multi-factor authentication",
        "Rate-limit repeated login attempts",
        "Block confirmed malicious requests where appropriate",
      ],
      followUp: [
        "Review authentication logs",
        "Investigate targeted accounts and endpoints",
      ],
    },

    "Web Attack XSS": {
      priority: "High",
      summary:
        "The detected traffic is consistent with requests that may attempt to inject executable content into a web application.",
      immediate: [
        "Apply appropriate input validation",
        "Use context-appropriate output encoding",
        "Review affected web-application requests",
      ],
      followUp: [
        "Review web-application security logs",
        "Apply appropriate application security controls",
      ],
    },

    "Web Attack - XSS": {
      priority: "High",
      summary:
        "The detected traffic is consistent with requests that may attempt to inject executable content into a web application.",
      immediate: [
        "Apply appropriate input validation",
        "Use context-appropriate output encoding",
        "Review affected web-application requests",
      ],
      followUp: [
        "Review web-application security logs",
        "Apply appropriate application security controls",
      ],
    },

    "Web Attack Sql Injection": {
      priority: "Critical",
      summary:
        "The detected traffic resembles SQL injection activity, which can potentially compromise application or database security.",
      immediate: [
        "Use parameterized database queries",
        "Validate and appropriately handle application inputs",
        "Inspect affected application endpoints",
      ],
      followUp: [
        "Review database and application access logs",
        "Investigate potentially affected database operations",
      ],
    },

    "Web Attack - Sql Injection": {
      priority: "Critical",
      summary:
        "The detected traffic resembles SQL injection activity, which can potentially compromise application or database security.",
      immediate: [
        "Use parameterized database queries",
        "Validate and appropriately handle application inputs",
        "Inspect affected application endpoints",
      ],
      followUp: [
        "Review database and application access logs",
        "Investigate potentially affected database operations",
      ],
    },

    Heartbleed: {
      priority: "Critical",
      summary:
        "The detected traffic is associated with a Heartbleed-class vulnerability and requires immediate vulnerability assessment.",
      immediate: [
        "Patch vulnerable TLS libraries",
        "Review potentially affected systems",
        "Rotate potentially exposed credentials where appropriate",
      ],
      followUp: [
        "Review relevant security logs",
        "Monitor for possible exploitation attempts",
      ],
    },

    Infiltration: {
      priority: "Critical",
      summary:
        "The detected traffic may indicate activity associated with system compromise and requires immediate investigation.",
      immediate: [
        "Isolate affected systems where appropriate",
        "Review authentication and access logs",
        "Investigate suspicious processes and connections",
      ],
      followUp: [
        "Preserve relevant evidence for further analysis",
        "Investigate the affected hosts and accounts",
      ],
    },

    BruteForce: {
      priority: "High",
      summary:
        "The detected traffic is consistent with repeated authentication attempts that may indicate credential-guessing activity.",
      immediate: [
        "Temporarily restrict suspicious accounts where appropriate",
        "Enable multi-factor authentication",
        "Block or rate-limit repeated login attempts",
      ],
      followUp: [
        "Monitor authentication logs",
        "Review accounts targeted by repeated attempts",
      ],
    },

    Normal: {
      priority: "Low",
      summary:
        "The uploaded traffic was classified as normal network behaviour with no dominant malicious classification.",
      immediate: [
        "Continue normal network monitoring",
        "Maintain current security policies",
      ],
      followUp: [
        "Review logs periodically",
        "Investigate future anomalous activity if detected",
      ],
    },

    Benign: {
      priority: "Low",
      summary:
        "The uploaded traffic was classified as benign network activity with no dominant malicious classification.",
      immediate: [
        "Continue normal network monitoring",
        "Maintain current security policies",
      ],
      followUp: [
        "Review logs periodically",
        "Investigate future anomalous activity if detected",
      ],
    },
  };

  const data =
    recommendations[normalizedPrediction] || {
      priority: "Review",
      summary:
        "The detection result does not have a predefined response profile. Further investigation is recommended.",
      immediate: [
        "Review the detection result and supporting evidence",
        "Inspect relevant network and security logs",
      ],
      followUp: [
        "Monitor the affected traffic",
        "Investigate the detected behaviour before taking disruptive action",
      ],
    };

  const getPriorityClass = () => {
    switch (data.priority) {
      case "Critical":
        return "priority-critical";
      case "High":
        return "priority-high";
      case "Medium":
        return "priority-medium";
      case "Low":
        return "priority-low";
      default:
        return "priority-review";
    }
  };

  return (
    <div className="info-card recommendation-card">
      <div className="recommendation-header">
        <div>
          <div className="recommendation-title">
            <FaShieldAlt />
            <h3>Recommended Actions</h3>
          </div>

          <p className="recommendation-subtitle">
            Response guidance based on the detected network behaviour.
          </p>
        </div>

        <div className={`priority-badge ${getPriorityClass()}`}>
          {data.priority} Priority
        </div>
      </div>

      <div className="recommendation-summary">
        <div className="recommendation-summary-icon">
          <FaInfoCircle />
        </div>

        <div>
          <span>Threat Assessment</span>
          <p>{data.summary}</p>
        </div>
      </div>

      <div className="recommendation-columns">
        <div className="recommendation-section">
          <div className="recommendation-section-title">
            <FaExclamationTriangle />
            <h4>Immediate Actions</h4>
          </div>

          <div className="recommendation-list">
            {data.immediate.map((action, index) => (
              <div
                className="recommendation-item"
                key={`immediate-${index}`}
              >
                <FaCheckCircle />
                <span>{action}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="recommendation-section">
          <div className="recommendation-section-title">
            <FaInfoCircle />
            <h4>Monitoring & Follow-up</h4>
          </div>

          <div className="recommendation-list">
            {data.followUp.map((action, index) => (
              <div
                className="recommendation-item"
                key={`followup-${index}`}
              >
                <FaCheckCircle />
                <span>{action}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

export default ThreatRecommendation;