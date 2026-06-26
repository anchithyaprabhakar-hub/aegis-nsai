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

import {
  FaShieldAlt,
  FaBrain,
  FaChartLine,
  FaNetworkWired,
  FaClock,
} from "react-icons/fa";

function App() {
  const [data, setData] = useState(null);

  const handlePrediction = (result) => {
    setData(result);
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
    <span
      style={{
        color:
          data.confidence >= 70
            ? "#ef4444"
            : data.confidence >= 40
            ? "#f59e0b"
            : "#22c55e",
        fontWeight: "bold",
      }}
    >
      {data.confidence >= 70
        ? "HIGH"
        : data.confidence >= 40
        ? "MEDIUM"
        : "LOW"}
    </span>
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
    </div>
  );
}

export default App;