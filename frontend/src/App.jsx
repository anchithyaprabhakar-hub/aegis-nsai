import { useEffect, useState } from "react";
import "./App.css";

import Header from "./components/Header";
import SummaryCard from "./components/SummaryCard";
import StatsCard from "./components/StatsCard";
import ThreatLevel from "./components/ThreatLevel";
import DashboardGrid from "./components/DashboardGrid";
import PredictionCard from "./components/PredictionCard";
import ConfidenceBar from "./components/ConfidenceBar";
import ExplanationCard from "./components/ExplanationCard";
import KnowledgeGraph from "./components/KnowledgeGraph";
import DetectionDetails from "./components/DetectionDetails";
import Footer from "./components/Footer";

import {
  FaShieldAlt,
  FaBrain,
  FaChartLine,
  FaNetworkWired,
  FaClock
} from "react-icons/fa";

function App() {

  const [data, setData] = useState(null);

  useEffect(() => {

    fetch("http://127.0.0.1:8000/predict")
      .then((res) => res.json())
      .then((result) => setData(result))
      .catch(console.error);

  }, []);

  if (!data) {
    return (
      <div className="loading">
        Loading Neuro-Symbolic AI Engine...
      </div>
    );
  }

  return (

    <div className="container">

      <Header />

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
           title="Knowledge Graph"
           value="76 / 100"
        />

        <SummaryCard
          icon={<FaClock />}
          title="Detection Time"
          value={new Date().toLocaleTimeString()}
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

      {/* <DetectionDetails /> */}

    {/* <Footer /> */}

    </div>

  );

}

export default App;