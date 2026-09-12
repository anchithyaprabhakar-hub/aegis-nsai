import React, { useEffect, useMemo, useState } from "react";

import {
  FaShieldAlt,
  FaChartLine,
  FaBrain,
  FaProjectDiagram,
  FaClock,
  FaExclamationTriangle,
} from "react-icons/fa";

import Header from "./components/Header";
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
  /* =========================================================
     STATE
  ========================================================= */

  const [data, setData] = useState(null);
  const [analysisHistory, setAnalysisHistory] = useState([]);
  const [currentTime, setCurrentTime] = useState(new Date());


  /* =========================================================
     CLOCK
  ========================================================= */

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);

    return () => clearInterval(timer);
  }, []);


  /* =========================================================
     LOAD PREVIOUS ANALYSIS HISTORY
  ========================================================= */

  useEffect(() => {
    try {
      const stored = localStorage.getItem(
        "aegis_analysis_history"
      );

      if (!stored) {
        return;
      }

      const parsed = JSON.parse(stored);

      if (Array.isArray(parsed)) {
        setAnalysisHistory(parsed);
      }
    } catch (error) {
      console.error(
        "Unable to load analysis history:",
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
        "aegis_analysis_history",
        JSON.stringify(analysisHistory)
      );
    } catch (error) {
      console.error(
        "Unable to save analysis history:",
        error
      );
    }
  }, [analysisHistory]);


  /* =========================================================
     HANDLE NEW ANALYSIS
  ========================================================= */

  const handlePrediction = (result) => {
    if (!result || !result.prediction) {
      console.error(
        "Invalid prediction result:",
        result
      );
      return;
    }

    const normalizedPrediction =
      String(result.prediction).trim();

    const confidence =
      Number(result.confidence) || 0;

    const timestamp =
      new Date().toLocaleTimeString("en-GB", {
        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit",
        hour12: false,
      });

    const filename =
      result.filename || "Uploaded CSV";

    const threatLevel =
      normalizedPrediction === "Normal"
        ? "Low"
        : confidence >= 80
        ? "Critical"
        : confidence >= 60
        ? "High"
        : confidence >= 30
        ? "Medium"
        : "Low";

    const historyItem = {
      id: `DET-${String(
        analysisHistory.length + 1
      ).padStart(3, "0")}`,

      prediction: normalizedPrediction,

      confidence,

      filename,

      timestamp,

      threatLevel,

      status: "ANALYZED",
    };

    setData(result);

    setAnalysisHistory((previous) => [
      ...previous,
      historyItem,
    ]);
  };


  /* =========================================================
     RESET ANALYSIS
  ========================================================= */

  const handleReset = () => {
    setData(null);
  };


  /* =========================================================
     DERIVED VALUES
  ========================================================= */

  const prediction =
    data?.prediction
      ? String(data.prediction).trim()
      : "";

  const confidence =
    Number(data?.confidence) || 0;

  const isNormal =
    prediction === "Normal";

  const totalAnalyses =
    analysisHistory.length;


  /* =========================================================
     THREAT LEVEL
  ========================================================= */

  const threatLevel = useMemo(() => {
    if (!data || isNormal) {
      return "Low";
    }

    if (confidence >= 80) {
      return "Critical";
    }

    if (confidence >= 60) {
      return "High";
    }

    if (confidence >= 30) {
      return "Medium";
    }

    return "Low";
  }, [
    data,
    isNormal,
    confidence,
  ]);


  /* =========================================================
     RISK SCORE
  ========================================================= */

  const riskScore =
    isNormal
      ? 0
      : Math.round(confidence);


  /* =========================================================
     ATTACK DESCRIPTION
  ========================================================= */

  const attackDescription =
    data?.attack_description ||
    data?.description ||
    (
      isNormal
        ? "Normal network activity with no malicious behaviour detected."
        : `The detected traffic has been classified as ${prediction} based on learned network behaviour and symbolic rule evaluation.`
    );


  /* =========================================================
     DETECTION TIME
  ========================================================= */

  const detectionTime =
    data?.detection_time ||
    data?.analysis_time ||
    currentTime.toLocaleTimeString(
      "en-GB",
      {
        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit",
        hour12: false,
      }
    );


  /* =========================================================
     SYMBOLIC VALUES
  ========================================================= */

  const symbolicConfidence =
    Number(
      data?.symbolic_confidence ??
      data?.symbolic_support ??
      0
    ) || 0;

  const symbolicSupport =
    Number(
      data?.symbolic_support ??
      data?.symbolic_confidence ??
      0
    ) || 0;

  const symbolicExplanation =
    data?.symbolic_explanation ||
    (
      isNormal
        ? "Network traffic appears normal with no strong symbolic indicators of malicious activity."
        : "Symbolic rules provide behavioural evidence associated with the detected network activity."
    );


  /* =========================================================
     KNOWLEDGE GRAPH DATA
  ========================================================= */

  const knowledgeGraph =
    Array.isArray(data?.knowledge_graph)
      ? data.knowledge_graph
      : isNormal
      ? [
          "Normal Traffic",
          "No Malicious Activity",
        ]
      : [
          "Detected Threat",
          "Suspicious Network Activity",
        ];


  /* =========================================================
     CURRENT ANALYSIS INFORMATION
  ========================================================= */

  const rowsProcessed =
    Number(
      data?.rows_processed ??
      data?.symbolic_rows_evaluated ??
      0
    ) || 0;


  /* =========================================================
     MAIN UI
  ========================================================= */

  return (
    <div className="app">

      {/* =====================================================
          SYSTEM HEADER
      ===================================================== */}

      <Header
        totalAnalyses={totalAnalyses}
      />


      {/* =====================================================
          MAIN CONTENT
      ===================================================== */}

      <main className="main-content">

        {/* ===================================================
            HERO
        =================================================== */}

        <section
          className="hero-section landing-hero"
          style={{
            minHeight: "320px",
            height: "320px",
            padding: "20px 20px 25px",
            justifyContent: "center",
          }}
        >

          <div
            className="hero-icon"
            style={{
              fontSize: "34px",
              marginBottom: "10px",
            }}
          >
            <FaShieldAlt />
          </div>

          <h1 style={{ margin: 0 }}>
            AEGIS-NSAI
          </h1>

          <p style={{ margin: "16px 0 0" }}>
            Neuro-Symbolic Intrusion Detection System
          </p>

          <div
            className="version-badge"
            style={{
              marginTop: "16px",
            }}
          >
            Version 1.0 · CSV Network Analysis
          </div>

        </section>


        {/* ===================================================
            CSV UPLOAD
        =================================================== */}

        <section
          className="dashboard-section upload-section"
          style={{
            marginTop: "0",
            marginBottom: "25px",
          }}
        >

          <FileUpload
            onPrediction={handlePrediction}
            onReset={handleReset}
          />

        </section>


        {/* ===================================================
            ANALYSIS RESULTS
        =================================================== */}

        {data && (
          <>

            {/* ===============================================
                CURRENT ANALYSIS
            =============================================== */}

            <section className="current-analysis-card">

              <div className="section-title">
                CURRENT ANALYSIS
              </div>

              <div className="current-file-name">
                {data.filename ||
                  "Uploaded Network Traffic"}
              </div>

              <div className="current-file-meta">
                {rowsProcessed.toLocaleString()}{" "}
                network-flow rows analyzed
              </div>

            </section>


            {/* ===============================================
                SUMMARY CARDS
            =============================================== */}

            <section className="summary-grid">

              <div className="summary-card">

                <div className="summary-card-header">
                  <span>PREDICTION</span>
                  <FaShieldAlt />
                </div>

                <div
                  className={`summary-value ${
                    isNormal
                      ? "normal"
                      : "danger"
                  }`}
                >
                  {prediction}
                </div>

              </div>


              <div className="summary-card">

                <div className="summary-card-header">
                  <span>CONFIDENCE</span>
                  <FaChartLine />
                </div>

                <div className="summary-value">
                  {confidence.toFixed(2)}%
                </div>

              </div>


              <div className="summary-card ai-card">

                <div className="summary-card-header">
                  <span>AI ENGINE</span>
                  <FaBrain />
                </div>

                <div className="summary-value ai-value">
                  Neuro-
                  <br />
                  Symbolic
                </div>

              </div>


              <div className="summary-card">

                <div className="summary-card-header">
                  <span>RISK SCORE</span>
                  <FaProjectDiagram />
                </div>

                <div
                  className={`summary-value ${
                    isNormal
                      ? "risk-normal"
                      : "risk-danger"
                  }`}
                >
                  {riskScore}/100
                </div>

              </div>


              <div className="summary-card">

                <div className="summary-card-header">
                  <span>DETECTION TIME</span>
                  <FaClock />
                </div>

                <div className="summary-value time-value">
                  {detectionTime}
                </div>

              </div>


              <div className="summary-card">

                <div className="summary-card-header">
                  <span>THREAT LEVEL</span>
                  <FaExclamationTriangle />
                </div>

                <div
                  className={`summary-value ${
                    threatLevel === "Low"
                      ? "threat-low"
                      : threatLevel === "Medium"
                      ? "threat-medium"
                      : threatLevel === "High"
                      ? "threat-high"
                      : "threat-critical"
                  }`}
                >
                  {threatLevel}
                </div>

              </div>

            </section>


            {/* ===============================================
                PREDICTION + CONFIDENCE
            =============================================== */}

            <section className="result-two-column">

              <PredictionCard
                prediction={prediction}
                confidence={confidence}
                threatLevel={threatLevel}
              />

              <ConfidenceBar
                confidence={confidence}
                prediction={prediction}
              />

            </section>


            {/* ===============================================
                AI EXPLANATION
            =============================================== */}

            <section className="dashboard-section">

              <ExplanationCard
                prediction={prediction}
                confidence={confidence}
                message={data.message || ""}
                symbolicConfidence={
                  symbolicConfidence
                }
                symbolicSupport={
                  symbolicSupport
                }
                symbolicExplanation={
                  symbolicExplanation
                }
              />

            </section>


            {/* ===============================================
                KNOWLEDGE GRAPH
            =============================================== */}

            <section className="dashboard-section">

              <KnowledgeGraph
                graph={
                  knowledgeGraph
                }
              />

            </section>


            {/* ===============================================
                ATTACK DESCRIPTION
            =============================================== */}

            <section className="dashboard-card attack-description">

              <h2>
                ATTACK DESCRIPTION
              </h2>

              <p>
                {attackDescription}
              </p>

            </section>


            {/* ===============================================
                RECOMMENDED ACTIONS
            =============================================== */}

            <section className="dashboard-section">

              <ThreatRecommendation
                prediction={prediction}
                confidence={confidence}
                threatLevel={threatLevel}
              />

            </section>


            {/* ===============================================
                PDF REPORT
            =============================================== */}

            <section className="dashboard-section">

              <DownloadReport
                data={data}
                prediction={prediction}
                confidence={confidence}
                threatLevel={threatLevel}
                riskScore={riskScore}
                symbolicConfidence={
                  symbolicConfidence
                }
                symbolicSupport={
                  symbolicSupport
                }
              />

            </section>


            {/* ===============================================
                ATTACK ANALYTICS
            =============================================== */}

            <section className="dashboard-section">

              <AttackAnalytics
                logs={
                  analysisHistory
                }
              />

            </section>


            {/* ===============================================
                ATTACK DISTRIBUTION
            =============================================== */}

            <section className="dashboard-section">

              <AttackChart
                logs={
                  analysisHistory
                }
              />

            </section>


            {/* ===============================================
                CONFIDENCE CHART
            =============================================== */}

            <section className="dashboard-section">

              <ConfidenceChart
                data={
                  analysisHistory
                }
              />

            </section>


            {/* ===============================================
                RECENT DETECTIONS
            =============================================== */}

            <section className="dashboard-section">

              <RecentLogs
                logs={
                  analysisHistory
                }
              />

            </section>

          </>
        )}

      </main>

    </div>
  );
}

export default App;