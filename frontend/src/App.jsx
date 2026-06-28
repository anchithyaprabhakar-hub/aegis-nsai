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
import RecentLogs from "./components/RecentLogs";

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

  const handlePrediction = (result) => {
    setData(result);

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

  if (!data) {
    return (
      <div className="container">
        <Header />

        <FileUpload onPrediction={handlePrediction} />

        <div className="loading">
          Upload a CSV file to begin analysis.
        </div>
      </div>
    );
  }

  return (
    <div className="container">
      <Header />

      <FileUpload onPrediction={handlePrediction} />

      <DashboardGrid>
        <SummaryCard
          icon={<FaShieldAlt />}
          title="Prediction"
          value={data.prediction}
        />

        <SummaryCard
          icon={<FaChartLine />}
          title="Confidence"
          value={`${data.confidence}%`}
        />

        <SummaryCard
          icon={<FaBrain />}
          title="AI Engine"
          value="Neuro-Symbolic"
        />

        <SummaryCard
          icon={<FaNetworkWired />}
          title="Risk Score"
          value={`${Math.round(data.confidence * 8)} / 100`}
        />

        <SummaryCard
          icon={<FaClock />}
          title="Detection Time"
          value={new Date().toLocaleTimeString()}
        />

        <SummaryCard
          icon={<FaShieldAlt />}
          title="Threat Level"
          value={
            data.confidence >= 70
              ? "High"
              : data.confidence >= 40
              ? "Medium"
              : "Low"
          }
        />
      </DashboardGrid>

      <br />

      <DashboardGrid>
        <PredictionCard prediction={data.prediction} />

        <ConfidenceBar confidence={data.confidence} />

        <ExplanationCard message={data.message} />

        <KnowledgeGraph graph={data.knowledge_graph} />
      </DashboardGrid>

      <br />

      <RecentLogs logs={logs} />
    </div>
  );
}

export default App;