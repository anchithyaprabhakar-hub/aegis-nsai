import React, { useEffect, useMemo, useState } from "react";

import {
  FaShieldAlt,
  FaBrain,
  FaProjectDiagram,
  FaClock,
  FaExclamationTriangle,
  FaDatabase,
  FaNetworkWired,
} from "react-icons/fa";

import FileUpload from "./components/FileUpload";
import PredictionCard from "./components/PredictionCard";
import ConfidenceBar from "./components/ConfidenceBar";
import ExplanationCard from "./components/ExplanationCard";
import KnowledgeGraph from "./components/KnowledgeGraph";
import ThreatRecommendation from "./components/ThreatRecommendation";
import DownloadReport from "./components/DownloadReport";
import AttackAnalytics from "./components/AttackAnalytics";
import AttackChart from "./components/AttackChart";
import ConfidenceChart from "./components/ConfidenceChart";
import RecentLogs from "./components/RecentLogs";

import "./App.css";

function App() {
  const [data, setData] = useState(null);
  const [analysisHistory, setAnalysisHistory] = useState([]);

  /* =========================================================
     LOAD HISTORY
     ========================================================= */

  useEffect(() => {
    try {
      const savedHistory = localStorage.getItem(
        "aegis-analysis-history"
      );

      if (savedHistory) {
        setAnalysisHistory(JSON.parse(savedHistory));
      }
    } catch (error) {
      console.error(
        "Failed to load analysis history:",
        error
      );
    }
  }, []);

  /* =========================================================
     SAVE HISTORY
     ========================================================= */

  useEffect(() => {
    try {
      localStorage.setItem(
        "aegis-analysis-history",
        JSON.stringify(analysisHistory)
      );
    } catch (error) {
      console.error(
        "Failed to save analysis history:",
        error
      );
    }
  }, [analysisHistory]);

  /* =========================================================
     HANDLE PREDICTION
     ========================================================= */

  const handlePrediction = (result) => {
    const analysisTimestamp = new Date();

    const detectionTime =
      analysisTimestamp.toLocaleTimeString("en-GB", {
        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit",
        hour12: false,
      });

    const analysisResult = {
      ...result,
      detection_time:
        result?.detection_time ||
        result?.analysis_time ||
        detectionTime,
    };

    setData(analysisResult);

    const historyItem = {
      id: `DET-${String(
        analysisHistory.length + 1
      ).padStart(3, "0")}`,

      prediction:
        analysisResult?.prediction ||
        analysisResult?.final_prediction ||
        "Unknown",

      confidence:
        analysisResult?.confidence ??
        analysisResult?.ml_confidence ??
        0,

      source:
        analysisResult?.filename ||
        analysisResult?.file_name ||
        "CSV Upload",

      time: detectionTime,

      timestamp:
        analysisTimestamp.toISOString(),

      result: analysisResult,
    };

    setAnalysisHistory((previous) => [
      ...previous,
      historyItem,
    ]);
  };

  /* =========================================================
     RESET
     ========================================================= */

  const handleReset = () => {
    setData(null);
  };

  /* =========================================================
     DERIVED VALUES
     ========================================================= */

  const prediction =
    data?.prediction ||
    data?.final_prediction ||
    data?.classification ||
    "No Analysis";

  const confidence =
    Number(
      data?.confidence ??
        data?.ml_confidence ??
        data?.prediction_confidence ??
        0
    ) || 0;

  const isNormal =
    String(prediction).trim().toLowerCase() === "normal" ||
    String(prediction).trim().toLowerCase() === "benign";

  const totalAnalyses =
    analysisHistory.length;

  const threatLevel = useMemo(() => {
    if (!data || isNormal) {
      return "Low";
    }

    if (confidence >= 90) {
      return "Critical";
    }

    if (confidence >= 70) {
      return "High";
    }

    return "Medium";
  }, [data, isNormal, confidence]);

  const riskScore = isNormal
    ? 0
    : Math.min(
        100,
        Math.max(0, Math.round(confidence))
      );

  const attackDescription =
    data?.attack_description ||
    data?.description ||
    (isNormal
      ? "The analyzed network traffic does not show strong evidence of a known intrusion pattern."
      : `The system detected traffic associated with ${prediction}. The result combines machine-learning prediction with symbolic security evidence.`);

  const detectionTime =
    data?.detection_time ||
    data?.analysis_time ||
    "--:--:--";

  /*
   * Overall symbolic support shown in the summary card.
   *
   * This represents behavioural/rule-engine support and is
   * not treated as statistical model confidence.
   */
  const symbolicConfidence =
    Number(
      data?.symbolic_support ??
        data?.symbolic_confidence ??
        data?.rule_support ??
        0
    ) || 0;

  /*
   * Attack-rule evidence shown inside the AI Explanation.
   *
   * If the symbolic engine did not identify an attack rule,
   * there is no direct attack-rule evidence to display.
   */
  const symbolicRulePrediction =
    String(
      data?.rule_prediction ??
        data?.symbolic_prediction ??
        "Normal"
    ).trim();

  const attackRuleSupport =
    symbolicRulePrediction.toLowerCase() === "normal" ||
    symbolicRulePrediction.toLowerCase() === "benign"
      ? 0
      : symbolicConfidence;

  const explanation =
    data?.explanation ||
    data?.ai_explanation ||
    "The prediction is generated using the neuro-symbolic detection pipeline.";

  const symbolicExplanation =
    data?.symbolic_explanation ||
    data?.rule_explanation ||
    data?.symbolic_reasoning ||
    "";

  const decisionMessage =
    data?.decision_message ||
    data?.fusion_explanation ||
    data?.neuro_symbolic_decision ||
    "";

  /* =========================================================
     KNOWLEDGE GRAPH
     ========================================================= */

  const knowledgeGraph =
    Array.isArray(data?.knowledge_graph) &&
    data.knowledge_graph.length > 0
      ? data.knowledge_graph
      : isNormal
      ? [
          "Network Traffic",
          "Normal Behaviour",
          "No Strong Attack Pattern",
          "Security Context",
        ]
      : [
          "Network Traffic",
          prediction,
          "Behavioural Indicators",
          "Security Context",
        ];

  /* =========================================================
     ANALYSIS INFORMATION
     ========================================================= */

  const rowsProcessed =
    data?.rows_processed ??
    data?.total_rows ??
    data?.rows ??
    0;

  const analysisType =
    data?.analysis_type ||
    data?.analysis_mode ||
    "CSV Network Traffic Analysis";

  /* =========================================================
     ATTACK DISTRIBUTION
     ========================================================= */

  const historyDistribution = useMemo(() => {
    const counts = {};

    analysisHistory.forEach((item) => {
      const label =
        item?.prediction ||
        item?.final_prediction ||
        item?.label ||
        "Unknown";

      counts[label] =
        (counts[label] || 0) + 1;
    });

    return Object.entries(counts).map(
      ([name, value]) => ({
        name,
        value,
      })
    );
  }, [analysisHistory]);

  const backendDistribution =
    data?.attack_distribution ||
    data?.prediction_distribution ||
    data?.classification_distribution ||
    data?.label_distribution ||
    data?.distribution ||
    [];

  const attackDistribution =
    Array.isArray(backendDistribution) &&
    backendDistribution.length > 0
      ? backendDistribution
      : historyDistribution;

  /* =========================================================
     RENDER
     ========================================================= */

  return (
    <div className="app">
      <main className="main-content">

        {/* =====================================================
            SYSTEM STATUS
            ===================================================== */}

        <section className="system-status-card">

          <div className="system-status-left">

            <div className="system-online-dot"></div>

            <div>

              <div className="system-title">
                <FaDatabase />
                <span>System Online</span>
              </div>

              <div className="system-analysis-count">
                Total Analyses:
                <strong>
                  {totalAnalyses}
                </strong>
              </div>

            </div>

          </div>

          <div className="system-status-right">

            <div className="ai-engine-label">
              AI ENGINE
            </div>

            <div className="ai-engine-status">
              <FaBrain />
              <span>ACTIVE</span>
            </div>

          </div>

          <div className="system-time">

            <div className="system-date">
              {new Date().toLocaleDateString(
                "en-GB"
              )}
            </div>

            <div className="system-clock">
              {new Date().toLocaleTimeString(
                "en-GB",
                {
                  hour12: false,
                }
              )}
            </div>

          </div>

        </section>

        {/* =====================================================
            HERO
            ===================================================== */}

        <section className="hero">

          <div className="hero-icon">
            <FaShieldAlt />
          </div>

          <h1>
            AEGIS-NSAI
          </h1>

          <p>
            Neuro-Symbolic Intrusion Detection System
          </p>

          <span>
            Version 1.0 · CSV Network Analysis
          </span>

        </section>

        {/* =====================================================
            FILE UPLOAD
            ===================================================== */}

        <FileUpload
          onPrediction={handlePrediction}
          onReset={handleReset}
        />

        {/* =====================================================
            RESULTS
            ===================================================== */}

        {data && (
          <>

            {/* CURRENT ANALYSIS */}

            <section className="current-analysis-card">

              <div className="current-analysis-header">

                <div>

                  <div className="section-eyebrow">
                    CURRENT ANALYSIS
                  </div>

                  <h2>
                    <FaNetworkWired />
                    Network Traffic Assessment
                  </h2>

                </div>

                <div className="analysis-status">

                  <span className="status-dot"></span>

                  ANALYSIS COMPLETE

                </div>

              </div>

              <div className="analysis-meta">

                <span>
                  <FaClock />
                  {detectionTime}
                </span>

                <span>
                  <FaDatabase />
                  {Number(
                    rowsProcessed
                  ).toLocaleString()}{" "}
                  rows
                </span>

                <span>
                  <FaProjectDiagram />
                  {analysisType}
                </span>

              </div>

            </section>

            {/* SUMMARY CARDS */}

            <section className="summary-grid">

              <div className="summary-card">

                <div className="summary-card-icon">
                  <FaShieldAlt />
                </div>

                <div>
                  <div className="summary-card-label">
                    DETECTION
                  </div>

                  <div className="summary-card-value">
                    {prediction}
                  </div>
                </div>

              </div>

              <div className="summary-card">

                <div className="summary-card-icon">
                  <FaBrain />
                </div>

                <div>
                  <div className="summary-card-label">
                    CONFIDENCE
                  </div>

                  <div className="summary-card-value">
                    {confidence.toFixed(2)}%
                  </div>
                </div>

              </div>

              <div className="summary-card">

                <div className="summary-card-icon">
                  <FaExclamationTriangle />
                </div>

                <div>
                  <div className="summary-card-label">
                    THREAT LEVEL
                  </div>

                  <div className="summary-card-value">
                    {threatLevel}
                  </div>
                </div>

              </div>

              <div className="summary-card">

                <div className="summary-card-icon">
                  <FaProjectDiagram />
                </div>

                <div>
                  <div className="summary-card-label">
                    RISK SCORE
                  </div>

                  <div className="summary-card-value">
                    {riskScore}/100
                  </div>
                </div>

              </div>

              <div className="summary-card">

                <div className="summary-card-icon">
                  <FaBrain />
                </div>

                <div>
                  <div className="summary-card-label">
                    SYMBOLIC SUPPORT
                  </div>

                  <div className="summary-card-value">
                    {symbolicConfidence.toFixed(2)}%
                  </div>
                </div>

              </div>

              <div className="summary-card">

                <div className="summary-card-icon">
                  <FaDatabase />
                </div>

                <div>
                  <div className="summary-card-label">
                    ROWS PROCESSED
                  </div>

                  <div className="summary-card-value">
                    {Number(
                      rowsProcessed
                    ).toLocaleString()}
                  </div>
                </div>

              </div>

            </section>

            {/* PREDICTION + CONFIDENCE */}

            <section className="result-two-column">

              <PredictionCard
                prediction={prediction}
                confidence={confidence}
              />

              <ConfidenceBar
                confidence={confidence}
                prediction={prediction}
              />

            </section>

            {/* AI EXPLANATION */}

            <ExplanationCard
              prediction={prediction}
              confidence={confidence}
              explanation={explanation}
              symbolicSupport={attackRuleSupport}
              symbolicConfidence={attackRuleSupport}
              symbolicExplanation={symbolicExplanation}
              message={decisionMessage}
              data={data}
            />

            {/* KNOWLEDGE GRAPH */}

            <KnowledgeGraph
              graph={knowledgeGraph}
              prediction={prediction}
            />

            {/* ATTACK DESCRIPTION */}

            <section className="info-card attack-description-card">

              <div className="info-card-header">

                <div className="info-card-icon">
                  <FaExclamationTriangle />
                </div>

                <div>

                  <div className="section-eyebrow">
                    ATTACK DESCRIPTION
                  </div>

                  <h2>
                    {prediction}
                  </h2>

                </div>

              </div>

              <p>
                {attackDescription}
              </p>

            </section>

            {/* RECOMMENDATIONS */}

            <ThreatRecommendation
              prediction={prediction}
              confidence={confidence}
              data={data}
            />

            {/* REPORT */}

            <DownloadReport
              data={data}
            />

            {/* ANALYTICS */}

            <AttackAnalytics
              logs={analysisHistory}
              analysisHistory={analysisHistory}
            />

            {/* ATTACK DISTRIBUTION */}

            <AttackChart
              data={attackDistribution}
            />

            {/* CONFIDENCE HISTORY */}

            <ConfidenceChart
              data={analysisHistory}
            />

            {/* RECENT DETECTIONS */}

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