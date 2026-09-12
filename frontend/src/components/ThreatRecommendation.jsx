import {
  FaShieldAlt,
  FaCheckCircle,
  FaExclamationTriangle,
  FaInfoCircle,
} from "react-icons/fa";


function ThreatRecommendation({ prediction }) {
  /* =========================================================
     NORMALIZE PREDICTION
  ========================================================= */

  const normalizedPrediction =
    String(prediction || "")
      .trim();


  /* =========================================================
     RECOMMENDATION PROFILES
  ========================================================= */

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


    /*
     * Backend label:
     * Web Attack Brute Force
     */
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


    /*
     * Backward-compatible label.
     */
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


    /*
     * Backend label:
     * Web Attack XSS
     */
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


    /*
     * Backward-compatible label.
     */
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


    /*
     * Backend label:
     * Web Attack Sql Injection
     */
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


    /*
     * Backward-compatible label.
     */
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


  /* =========================================================
     SELECT PROFILE
  ========================================================= */

  const data =
    recommendations[
      normalizedPrediction
    ] || {
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


  /* =========================================================
     RENDER
  ========================================================= */

  return (
    <div className="info-card">

      <h3>
        <FaShieldAlt /> Recommended Actions
      </h3>


      {/* =====================================================
          PRIORITY + SUMMARY
      ===================================================== */}

      <div
        style={{
          marginTop: "18px",
          padding: "14px",
          borderRadius: "12px",
          background: "#111111",
          border: "1px solid #2c2c2c",
        }}
      >

        <p
          style={{
            margin: 0,
            fontSize: "16px",
          }}
        >

          <strong>
            Priority:
          </strong>{" "}

          <span
            style={{
              fontWeight: "700",
            }}
          >
            {data.priority}
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

          <FaInfoCircle
            style={{
              marginRight: "8px",
            }}
          />

          {data.summary}

        </p>

      </div>


      {/* =====================================================
          IMMEDIATE ACTIONS
      ===================================================== */}

      <div
        style={{
          marginTop: "22px",
        }}
      >

        <h4
          style={{
            marginBottom: "12px",
          }}
        >

          <FaExclamationTriangle
            style={{
              marginRight: "8px",
            }}
          />

          Immediate Actions

        </h4>


        {data.immediate.map(
          (action, index) => (
            <p
              key={`immediate-${index}`}
              style={{
                lineHeight: "1.6",
              }}
            >

              <FaCheckCircle
                style={{
                  marginRight: "10px",
                }}
              />

              {action}

            </p>
          )
        )}

      </div>


      {/* =====================================================
          MONITORING & FOLLOW-UP
      ===================================================== */}

      <div
        style={{
          marginTop: "22px",
        }}
      >

        <h4
          style={{
            marginBottom: "12px",
          }}
        >

          <FaInfoCircle
            style={{
              marginRight: "8px",
            }}
          />

          Monitoring & Follow-up

        </h4>


        {data.followUp.map(
          (action, index) => (
            <p
              key={`followup-${index}`}
              style={{
                lineHeight: "1.6",
              }}
            >

              <FaCheckCircle
                style={{
                  marginRight: "10px",
                }}
              />

              {action}

            </p>
          )
        )}

      </div>

    </div>
  );
}


export default ThreatRecommendation;