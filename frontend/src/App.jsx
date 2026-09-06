import React, { useState } from "react";

import Header from "./components/Header";
import FileUpload from "./components/FileUpload";
import PredictionCard from "./components/PredictionCard";
import ConfidenceBar from "./components/ConfidenceBar";
import ExplanationCard from "./components/ExplanationCard";
import KnowledgeGraph from "./components/KnowledgeGraph";
import ThreatRecommendation from "./components/ThreatRecommendation";
import AttackAnalytics from "./components/AttackAnalytics";
import AttackChart from "./components/AttackChart";
import ConfidenceChart from "./components/ConfidenceChart";
import RecentLogs from "./components/RecentLogs";
import DownloadReport from "./components/DownloadReport";

import {
  FaShieldAlt,
  FaNetworkWired,
  FaChartLine,
  FaBrain,
  FaClock,
  FaProjectDiagram,
} from "react-icons/fa";

import "./App.css";

function SummaryCard({ icon, title, value }) {
  return (
    <div className="summary-card">
      <div className="summary-card-header">
        <span>{title}</span>
        <span className="summary-card-icon">{icon}</span>
      </div>

      <div className="summary-card-value">{value}</div>
    </div>
  );
}

function App() {
  const [data, setData] = useState(null);
  const [analysisHistory, setAnalysisHistory] = useState([]);

  const handlePrediction = (result) => {
    if (!result) return;

    setData(result);

    setAnalysisHistory((previous) => {
      const next = [
        ...previous,
        {
          ...result,
          timestamp: new Date().toLocaleTimeString(),
        },
      ];

      return next;
    });
  };

  /*
   * ---------------------------------------------------------
   * Safe values
   * ---------------------------------------------------------
   */

  const prediction = String(data?.prediction || "Unknown").trim();

  const rawConfidence = Number(data?.confidence);

  const confidence = Number.isFinite(rawConfidence)
    ? Math.max(0, Math.min(100, rawConfidence))
    : 0;

  const symbolicConfidence = Number(
    data?.symbolic_confidence ?? data?.symbolic_support ?? 0
  );

  const safeSymbolicConfidence = Number.isFinite(symbolicConfidence)
    ? Math.max(0, Math.min(100, symbolicConfidence))
    : 0;

  /*
   * ---------------------------------------------------------
   * Normal vs malicious semantics
   * ---------------------------------------------------------
   */

  const isNormal =
    prediction.toLowerCase() === "normal" ||
    prediction.toLowerCase() === "benign";

  /*
   * Threat level must describe the security risk,
   * NOT simply the neural-network confidence.
   *
   * A highly confident Normal prediction is LOW risk.
   */

  let threatLevel = "Low";

  if (!isNormal) {
    if (confidence >= 80) {
      threatLevel = "Critical";
    } else if (confidence >= 60) {
      threatLevel = "High";
    } else if (confidence >= 30) {
      threatLevel = "Medium";
    }
  }

  /*
   * Risk score represents security risk.
   * Confidence in a Normal prediction is NOT a risk score.
   */

  const riskScore = isNormal ? 0 : Math.round(confidence);

  /*
   * ---------------------------------------------------------
   * Detection time
   * ---------------------------------------------------------
   */

  const detectionTime = new Date().toLocaleTimeString();

  /*
   * ---------------------------------------------------------
   * Current analysis metadata
   * ---------------------------------------------------------
   */

  const filename = data?.filename || "Network traffic analysis";

  const rowsProcessed =
    Number(data?.rows_processed) ||
    Number(data?.symbolic_rows_evaluated) ||
    0;

  /*
   * ---------------------------------------------------------
   * Analysis statistics
   * ---------------------------------------------------------
   */

  const totalAnalyses = analysisHistory.length;

  const maliciousAnalyses = analysisHistory.filter(
    (item) => String(item.prediction).toLowerCase() !== "normal"
  ).length;

  const normalAnalyses = totalAnalyses - maliciousAnalyses;

  const highRiskAnalyses = analysisHistory.filter((item) => {
    const itemPrediction = String(item.prediction || "").toLowerCase();
    const itemConfidence = Number(item.confidence) || 0;

    return itemPrediction !== "normal" && itemConfidence >= 80;
  }).length;

  const averageConfidence =
    totalAnalyses > 0
      ? analysisHistory.reduce(
          (sum, item) => sum + (Number(item.confidence) || 0),
          0
        ) / totalAnalyses
      : 0;

  const maliciousRate =
    totalAnalyses > 0
      ? (maliciousAnalyses / totalAnalyses) * 100
      : 0;

  /*
   * ---------------------------------------------------------
   * Attack distribution
   * ---------------------------------------------------------
   */

  const attackDistribution =
    analysisHistory.length > 0
      ? analysisHistory.reduce((distribution, item) => {
          const label = item.prediction || "Unknown";

          distribution[label] = (distribution[label] || 0) + 1;

          return distribution;
        }, {})
      : {};

  /*
   * ---------------------------------------------------------
   * Confidence history
   * ---------------------------------------------------------
   */

  const confidenceHistory = analysisHistory.map((item) => ({
    prediction: item.prediction || "Unknown",
    confidence: Number(item.confidence) || 0,
  }));

  return (
    <div className="app">
      <Header />

      <main className="dashboard-container">
        {/* =================================================
            SYSTEM STATUS
        ================================================= */}

        <section className="system-status">
          <div className="system-status-left">
            <div className="status-indicator"></div>

            <div>
              <h3>
                <FaNetworkWired /> System Online
              </h3>

              <p>Total Analyses : {totalAnalyses}</p>
            </div>
          </div>

          <div className="system-status-right">
            <div>
              <span>AI ENGINE</span>
              <strong>
                <FaBrain /> ACTIVE
              </strong>
            </div>

            <div>
              <span>{new Date().toLocaleDateString()}</span>
              <strong>{detectionTime}</strong>
            </div>
          </div>
        </section>

        {/* =================================================
            HERO
        ================================================= */}

        <section className="hero-section">
          <h1>
            <FaShieldAlt /> AEGIS-NSAI
          </h1>

          <p>Neuro-Symbolic Intrusion Detection System</p>

          <div className="version-badge">
            Version 1.0 · CSV Network Analysis
          </div>
        </section>

        {/* =================================================
            FILE UPLOAD
        ================================================= */}

        <FileUpload onPrediction={handlePrediction} />

        {/* =================================================
            ANALYSIS RESULTS
        ================================================= */}

        {data && (
          <>
            {/* Current analysis */}

            <section className="current-analysis">
              <h2>CURRENT ANALYSIS</h2>

              <h3>{filename}</h3>

              <p>
                {rowsProcessed.toLocaleString()} network-flow rows analyzed
              </p>
            </section>

            {/* =================================================
                SUMMARY CARDS
            ================================================= */}

            <section className="summary-grid">
              <SummaryCard
                icon={<FaShieldAlt />}
                title="Prediction"
                value={prediction}
              />

              <SummaryCard
                icon={<FaChartLine />}
                title="Confidence"
                value={`${confidence.toFixed(2)}%`}
              />

              <SummaryCard
                icon={<FaBrain />}
                title="AI Engine"
                value="Neuro-Symbolic"
              />

              <SummaryCard
                icon={<FaProjectDiagram />}
                title="Risk Score"
                value={`${riskScore}/100`}
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
            </section>

            {/* =================================================
                PREDICTION + CONFIDENCE
            ================================================= */}

            <section className="result-grid">
              <PredictionCard
                prediction={prediction}
                confidence={confidence}
                threatLevel={threatLevel}
                severity={threatLevel}
              />

              <ConfidenceBar
                confidence={confidence}
                prediction={prediction}
              />
            </section>

            {/* =================================================
                AI EXPLANATION
            ================================================= */}

            <ExplanationCard
              prediction={prediction}
              confidence={confidence}
              message={data?.message}
              symbolicConfidence={safeSymbolicConfidence}
              symbolicSupport={safeSymbolicConfidence}
              symbolicExplanation={data?.symbolic_explanation}
            />

            {/* =================================================
                KNOWLEDGE GRAPH
            ================================================= */}

            <KnowledgeGraph
              prediction={prediction}
              nodes={data?.knowledge_graph || []}
              symbolicExplanation={data?.symbolic_explanation}
            />

            {/* =================================================
                ATTACK DESCRIPTION
            ================================================= */}

            <section className="attack-description">
              <h2>ATTACK DESCRIPTION</h2>

              <p>
                {isNormal
                  ? "Normal network activity with no malicious behaviour detected."
                  : data?.symbolic_explanation ||
                    `The network traffic was classified as ${prediction}. Further investigation is recommended.`}
              </p>
            </section>

            {/* =================================================
                RECOMMENDATIONS
            ================================================= */}

            <ThreatRecommendation
              prediction={prediction}
              confidence={confidence}
              threatLevel={threatLevel}
              symbolicConfidence={safeSymbolicConfidence}
            />

            {/* =================================================
                EXPORT REPORT
            ================================================= */}

            <DownloadReport
              data={data}
              prediction={prediction}
              confidence={confidence}
              threatLevel={threatLevel}
              riskScore={riskScore}
            />

            {/* =================================================
                ATTACK ANALYTICS
            ================================================= */}

            <AttackAnalytics
              totalAnalyses={totalAnalyses}
              highRisk={highRiskAnalyses}
              maliciousDetections={maliciousAnalyses}
              normalDetections={normalAnalyses}
              averageConfidence={averageConfidence}
              maliciousDetectionRate={maliciousRate}
              latestDetection={prediction}
              latestConfidence={confidence}
            />

            {/* =================================================
                ATTACK DISTRIBUTION
            ================================================= */}

            <AttackChart
              data={attackDistribution}
              prediction={prediction}
            />

            {/* =================================================
                CONFIDENCE HISTORY
            ================================================= */}

            <ConfidenceChart
              prediction={prediction}
              confidence={confidence}
              data={confidenceHistory}
            />

            {/* =================================================
                RECENT DETECTIONS
            ================================================= */}

            <RecentLogs logs={analysisHistory} />
          </>
        )}
      </main>
    </div>
  );
}

export default App;