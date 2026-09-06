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

  /*
   * =========================================================
   * RECEIVE BACKEND RESULT
   * =========================================================
   */

  const handlePrediction = (result) => {
    if (!result) {
      return;
    }

    setData(result);

    setAnalysisHistory((previous) => [
      ...previous,
      {
        ...result,
        timestamp: new Date().toLocaleTimeString(),
      },
    ]);
  };


  /*
   * =========================================================
   * SAFE ANALYSIS VALUES
   * =========================================================
   */

  const prediction = String(
    data?.prediction || "Unknown"
  ).trim();

  const rawConfidence = Number(data?.confidence);

  const confidence = Number.isFinite(rawConfidence)
    ? Math.max(0, Math.min(100, rawConfidence))
    : 0;

  const rawSymbolicConfidence = Number(
    data?.symbolic_confidence ??
      data?.symbolic_support ??
      0
  );

  const symbolicConfidence = Number.isFinite(
    rawSymbolicConfidence
  )
    ? Math.max(0, Math.min(100, rawSymbolicConfidence))
    : 0;


  /*
   * =========================================================
   * NORMAL / MALICIOUS CLASSIFICATION
   * =========================================================
   */

  const isNormal =
    prediction.toLowerCase() === "normal" ||
    prediction.toLowerCase() === "benign";


  /*
   * =========================================================
   * THREAT LEVEL
   *
   * Confidence alone must NOT determine threat level.
   * A 99% confidence Normal prediction is LOW risk.
   * =========================================================
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
   * =========================================================
   * RISK SCORE
   * =========================================================
   */

  const riskScore = isNormal
    ? 0
    : Math.round(confidence);


  /*
   * =========================================================
   * ANALYSIS METADATA
   * =========================================================
   */

  const filename =
    data?.filename || "Network traffic analysis";

  const rowsProcessed =
    Number(data?.rows_processed) ||
    Number(data?.symbolic_rows_evaluated) ||
    0;

  const detectionTime =
    new Date().toLocaleTimeString();


  /*
   * =========================================================
   * ANALYSIS HISTORY STATISTICS
   * =========================================================
   */

  const totalAnalyses =
    analysisHistory.length;

  const maliciousAnalyses =
    analysisHistory.filter(
      (item) =>
        String(item?.prediction || "")
          .toLowerCase() !== "normal"
    ).length;

  const normalAnalyses =
    totalAnalyses - maliciousAnalyses;

  const highRiskAnalyses =
    analysisHistory.filter((item) => {
      const itemPrediction =
        String(item?.prediction || "").toLowerCase();

      const itemConfidence =
        Number(item?.confidence) || 0;

      return (
        itemPrediction !== "normal" &&
        itemConfidence >= 80
      );
    }).length;

  const averageConfidence =
    totalAnalyses > 0
      ? analysisHistory.reduce(
          (sum, item) =>
            sum + (Number(item?.confidence) || 0),
          0
        ) / totalAnalyses
      : 0;

  const maliciousRate =
    totalAnalyses > 0
      ? (maliciousAnalyses / totalAnalyses) * 100
      : 0;


  /*
   * =========================================================
   * ATTACK DISTRIBUTION
   * =========================================================
   */

  const attackDistribution =
    analysisHistory.reduce(
      (distribution, item) => {
        const label =
          item?.prediction || "Unknown";

        distribution[label] =
          (distribution[label] || 0) + 1;

        return distribution;
      },
      {}
    );


  /*
   * =========================================================
   * CONFIDENCE HISTORY
   * =========================================================
   */

  const confidenceHistory =
    analysisHistory.map((item) => ({
      prediction:
        item?.prediction || "Unknown",

      confidence:
        Number(item?.confidence) || 0,
    }));


  /*
   * =========================================================
   * RENDER
   * =========================================================
   */

  return (
    <div className="app">

      {/* Header already contains the System Online
          and AEGIS-NSAI hero sections. */}

      <Header />

      <main className="dashboard-container">

        {/* =================================================
            FILE UPLOAD
        ================================================= */}

        <FileUpload
          onPrediction={handlePrediction}
        />


        {/* =================================================
            ANALYSIS RESULTS
        ================================================= */}

        {data && (
          <>

            {/* =================================================
                CURRENT ANALYSIS
            ================================================= */}

            <section className="current-analysis">

              <h2>CURRENT ANALYSIS</h2>

              <h3>
                {filename}
              </h3>

              <p>
                {rowsProcessed.toLocaleString()}
                {" "}
                network-flow rows analyzed
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
              symbolicConfidence={
                symbolicConfidence
              }
              symbolicSupport={
                symbolicConfidence
              }
              symbolicExplanation={
                data?.symbolic_explanation
              }
            />


            {/* =================================================
                KNOWLEDGE GRAPH
            ================================================= */}

            <KnowledgeGraph
              prediction={prediction}
              nodes={
                data?.knowledge_graph || []
              }
              symbolicExplanation={
                data?.symbolic_explanation
              }
            />


            {/* =================================================
                ATTACK DESCRIPTION
            ================================================= */}

            <section className="attack-description">

              <h2>
                ATTACK DESCRIPTION
              </h2>

              <p>
                {isNormal
                  ? "Normal network activity with no malicious behaviour detected."
                  : (
                      data?.symbolic_explanation ||
                      `The network traffic was classified as ${prediction}. Further investigation is recommended.`
                    )}
              </p>

            </section>


            {/* =================================================
                RECOMMENDED ACTIONS
            ================================================= */}

            <ThreatRecommendation
              prediction={prediction}
              confidence={confidence}
              threatLevel={threatLevel}
              symbolicConfidence={
                symbolicConfidence
              }
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
              totalAnalyses={
                totalAnalyses
              }
              highRisk={
                highRiskAnalyses
              }
              maliciousDetections={
                maliciousAnalyses
              }
              normalDetections={
                normalAnalyses
              }
              averageConfidence={
                averageConfidence
              }
              maliciousDetectionRate={
                maliciousRate
              }
              latestDetection={
                prediction
              }
              latestConfidence={
                confidence
              }
            />


            {/* =================================================
                ATTACK DISTRIBUTION
            ================================================= */}

            <AttackChart
              data={attackDistribution}
              prediction={prediction}
            />


            {/* =================================================
                CONFIDENCE CHART
            ================================================= */}

            <ConfidenceChart
              prediction={prediction}
              confidence={confidence}
              data={confidenceHistory}
            />


            {/* =================================================
                RECENT DETECTIONS
            ================================================= */}

            <RecentLogs
              logs={analysisHistory}
            />

          </>
        )}

      </main>
    </div>
  );
}

export default App;