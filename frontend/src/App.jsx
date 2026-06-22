import { useEffect, useState } from "react";
import "./App.css";

import Header from "./components/Header";
import StatsCard from "./components/StatsCard";
import ThreatLevel from "./components/ThreatLevel";
import DashboardGrid from "./components/DashboardGrid";
import PredictionCard from "./components/PredictionCard";
import ConfidenceBar from "./components/ConfidenceBar";
import ExplanationCard from "./components/ExplanationCard";
import KnowledgeGraph from "./components/KnowledgeGraph";
import DetectionDetails from "./components/DetectionDetails";
import Footer from "./components/Footer";

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
        Initializing AI Engine...
      </div>
    );
  }

  return (

    <div className="container">

      <Header />

      <DashboardGrid>

        <StatsCard
          title="Prediction"
          value={data.prediction}
        />

        <StatsCard
          title="Confidence"
          value={`${data.confidence}%`}
        />

        <StatsCard
          title="Risk Score"
          value="76 / 100"
        />

        <ThreatLevel
          level="Medium"
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