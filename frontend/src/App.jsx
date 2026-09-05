import { useState } from "react";
import "./App.css";

import Header from "./components/Header";
import FileUpload from "./components/FileUpload";
import SummaryCard from "./components/SummaryCard";
import DashboardGrid from "./components/DashboardGrid";
import PredictionCard from "./components/PredictionCard";
import ConfidenceBar from "./components/ConfidenceBar";
import ExplanationCard from "./components/ExplanationCard";
import KnowledgeGraph from "./components/KnowledgeGraph";
import AttackChart from "./components/AttackChart";
import ConfidenceChart from "./components/ConfidenceChart";
import ThreatRecommendation from "./components/ThreatRecommendation";
import AttackAnalytics from "./components/AttackAnalytics";
import RecentLogs from "./components/RecentLogs";
import DownloadReport from "./components/DownloadReport";

import {
  FaShieldAlt,
  FaBrain,
  FaChartLine,
  FaNetworkWired,
  FaClock,
} from "react-icons/fa";

function App() {
  const [data, setData] = useState(null);
  const [logs, setLogs] = useState([]);
  const [analysisCount, setAnalysisCount] = useState(0);

  // ============================================================
  // HANDLE COMPLETED ANALYSIS
  // ============================================================

  const handlePrediction = (result) => {
    const analyzedAt = new Date().toISOString();

    const analysisResult = {
      ...result,
      analyzedAt,
    };

    setData(analysisResult);

    setAnalysisCount((count) => count + 1);

    const newLog = {
      id: `DET-${String(analysisCount + 1).padStart(3, "0")}`,
      prediction: result.prediction,
      confidence: result.confidence,
      filename:
        result.filename ||
        "Uploaded network dataset",
      time: new Date(analyzedAt).toLocaleTimeString(),
    };

    setLogs((previousLogs) => [
      newLog,
      ...previousLogs.slice(0, 9),
    ]);
  };

  // ============================================================
  // THREAT LEVEL
  // ============================================================

  let threatLevel = "Low";

  if (data) {
    if (data.confidence >= 80) {
      threatLevel = "Critical";
    } else if (data.confidence >= 60) {
      threatLevel = "High";
    } else if (data.confidence >= 30) {
      threatLevel = "Medium";
    }
  }

  // ============================================================
  // ATTACK DESCRIPTIONS
  // ============================================================

  const attackDescriptions = {
    PortScan:
      "Attempts to discover open ports and running services on the target system.",

    DDoS:
      "Floods the target with excessive traffic to disrupt service availability.",

    BruteForce:
      "Repeated login attempts to gain unauthorized system access.",

    "Web Attack - Brute Force":
      "Attempts to gain unauthorized access through repeated web authentication requests.",

    "Web Attack - Sql Injection":
      "Attempts to manipulate database queries through malicious SQL input.",

    "Web Attack - XSS":
      "Attempts to inject malicious client-side scripts into web content.",

    "DoS GoldenEye":
      "Attempts to exhaust server resources through repeated HTTP requests.",

    "DoS Hulk":
      "Generates large volumes of HTTP traffic to exhaust target resources.",

    "DoS Slowhttptest":
      "Uses slow HTTP request techniques to consume server connections.",

    "DoS slowloris":
      "Maintains many partial HTTP connections to exhaust server resources.",

    "FTP-Patator":
      "Attempts repeated authentication requests against an FTP service.",

    "SSH-Patator":
      "Attempts repeated authentication requests against an SSH service.",

    Bot:
      "Network behaviour associated with automated or bot-controlled activity.",

    Heartbleed:
      "Traffic associated with attempts to exploit the Heartbleed vulnerability.",

    Infiltration:
      "Network behaviour associated with unauthorized system infiltration.",

    Normal:
      "Normal network activity with no malicious behaviour detected.",

    Benign:
      "Normal network activity with no malicious behaviour detected.",
  };

  // ============================================================
  // CURRENT ANALYSIS TIME
  // ============================================================

  const detectionTime = data?.analyzedAt
    ? new Date(data.analyzedAt).toLocaleTimeString()
    : "N/A";

  // ============================================================
  // CURRENT DATASET
  // ============================================================

  const currentFilename =
    data?.filename ||
    "Uploaded network dataset";

  const rowsProcessed =
    Number(data?.rows_processed) || 0;

  return (
    <div className="container">

      {/* ======================================================
          HEADER
      ====================================================== */}

      <Header
        analysisCount={analysisCount}
      />

      {/* ======================================================
          FILE UPLOAD
      ====================================================== */}

      <FileUpload
        onPrediction={handlePrediction}
      />

      {/* ======================================================
          EMPTY STATE
      ====================================================== */}

      {!data ? (
        <div className="loading">
          Upload a CSV file to begin analysis.
        </div>
      ) : (
        <>

          {/* ==================================================
              CURRENT ANALYSIS
          ================================================== */}

          <div
            className="info-card"
            style={{
              textAlign: "center",
              marginTop: "18px",
            }}
          >
            <h3>Current Analysis</h3>

            <p
              style={{
                marginTop: "12px",
                color: "#38bdf8",
                fontWeight: "600",
                wordBreak: "break-word",
              }}
            >
              {currentFilename}
            </p>

            <p
              style={{
                marginTop: "8px",
                color: "#9ca3af",
                fontSize: "14px",
              }}
            >
              {rowsProcessed > 0
                ? `${rowsProcessed.toLocaleString()} network-flow rows analyzed`
                : "Dataset-level network-flow analysis"}
            </p>
          </div>

          <br />

          {/* ==================================================
              SUMMARY CARDS
          ================================================== */}

          <DashboardGrid>

            <SummaryCard
              icon={<FaShieldAlt />}
              title="Prediction"
              value={data.prediction}
            />

            <SummaryCard
              icon={<FaChartLine />}
              title="Confidence"
              value={`${Number(data.confidence).toFixed(2)}%`}
            />

            <SummaryCard
              icon={<FaBrain />}
              title="AI Engine"
              value="Neuro-Symbolic"
            />

            <SummaryCard
              icon={<FaNetworkWired />}
              title="Risk Score"
              value={`${Math.round(data.confidence)}/100`}
            />

            <SummaryCard
              icon={<FaClock />}
              title="Detection Time"
              value={detectionTime}
            />

            <SummaryCard
              icon={<FaShieldAlt />}
              title="Threat Level"
              value={threatLevel}
            />

          </DashboardGrid>

          <br />

          {/* ==================================================
              ANALYSIS DASHBOARD
          ================================================== */}

          <DashboardGrid>

            <PredictionCard
              prediction={data.prediction}
              confidence={data.confidence}
            />

            <ConfidenceBar
              confidence={data.confidence}
            />

            <ExplanationCard
              prediction={data.prediction}
              confidence={data.confidence}
              message={data.message}
            />

          </DashboardGrid>

          <br />

          {/* ==================================================
              KNOWLEDGE GRAPH
          ================================================== */}

          {data.knowledge_graph && (
            <>
              <KnowledgeGraph
                graph={data.knowledge_graph}
              />

              <br />
            </>
          )}

          {/* ==================================================
              ATTACK DESCRIPTION
          ================================================== */}

          <div
            className="info-card"
            style={{
              textAlign: "center",
            }}
          >

            <h3>Attack Description</h3>

            <p
              style={{
                marginTop: "20px",
                fontSize: "17px",
                lineHeight: "1.8",
              }}
            >
              {attackDescriptions[data.prediction] ??
                "Unknown network behaviour detected."}
            </p>

          </div>

          <br />

          {/* ==================================================
              RECOMMENDATIONS
          ================================================== */}

          <ThreatRecommendation
            prediction={data.prediction}
          />

          <br />

          {/* ==================================================
              PDF REPORT
          ================================================== */}

          <DownloadReport
            data={data}
          />

          <br />

          {/* ==================================================
              ATTACK ANALYTICS SUMMARY
          ================================================== */}

          <AttackAnalytics
            logs={logs}
          />

          <br />

          {/* ==================================================
              ATTACK DISTRIBUTION
          ================================================== */}

          <AttackChart
            logs={logs}
          />

          <br />

          {/* ==================================================
              CONFIDENCE HISTORY
          ================================================== */}

          <ConfidenceChart
            logs={logs}
          />

          <br />

          {/* ==================================================
              DETECTION HISTORY
          ================================================== */}

          <RecentLogs
            logs={logs}
          />

        </>
      )}

    </div>
  );
}

export default App;
