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

  const handlePrediction = (result) => {
    setData(result);

    setAnalysisCount((count) => count + 1);

    const newLog = {
      prediction: result.prediction,
      confidence: result.confidence,
      time: new Date().toLocaleTimeString(),
    };

    setLogs((previousLogs) => [
      newLog,
      ...previousLogs.slice(0, 9),
    ]);
  };

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

  const attackDescriptions = {
    PortScan:
      "Attempts to discover open ports and running services on the target system.",

    DDoS:
      "Floods the target with excessive traffic to disrupt service availability.",

    BruteForce:
      "Repeated login attempts to gain unauthorized system access.",

    Benign:
      "Normal network activity with no malicious behaviour detected.",
  };

  return (
    <div className="container">

      <Header analysisCount={analysisCount} />

      <FileUpload onPrediction={handlePrediction} />

      {!data ? (
        <div className="loading">
          Upload a CSV file to begin analysis.
        </div>
      ) : (
        <>

          {/* Summary Cards */}

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
              value={new Date().toLocaleTimeString()}
            />

            <SummaryCard
              icon={<FaShieldAlt />}
              title="Threat Level"
              value={threatLevel}
            />

          </DashboardGrid>

          <br />

          {/* Analysis Dashboard */}

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

            <KnowledgeGraph
              graph={data.knowledge_graph}
            />

            <AttackChart
              logs={logs}
            />

            <ConfidenceChart
              logs={logs}
            />

          </DashboardGrid>

          <br />

          {/* Attack Description */}

          <div
            className="info-card"
            style={{ textAlign: "center" }}
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

          {/* Recommendations */}

          <ThreatRecommendation
            prediction={data.prediction}
          />

          <br />

          {/* Analytics */}

          {/* Recommendations */}

<ThreatRecommendation
  prediction={data.prediction}
/>

<br />

{/* PDF Report */}

<DownloadReport
  data={data}
/>

<br />

{/* Analytics */}

<AttackAnalytics
  logs={logs}
/>

<br />

{/* Detection History */}

<RecentLogs
  logs={logs}
/>

          <AttackAnalytics
            logs={logs}
          />

          <br />

          {/* Detection History */}

          <RecentLogs
            logs={logs}
          />

        </>
      )}

    </div>
  );
}

export default App;