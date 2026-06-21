import { useEffect, useState } from "react";

import "./App.css";

import Header from "./components/Header";
import PredictionCard from "./components/PredictionCard";
import ConfidenceBar from "./components/ConfidenceBar";
import ExplanationCard from "./components/ExplanationCard";
import KnowledgeGraph from "./components/KnowledgeGraph";
import Footer from "./components/Footer";

function App() {
  const [data, setData] = useState(null);

  useEffect(() => {
    fetch("http://127.0.0.1:8000/predict")
      .then((res) => res.json())
      .then((result) => setData(result))
      .catch((err) => console.log(err));
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

      <div className="dashboard">

        <PredictionCard prediction={data.prediction} />

        <ConfidenceBar confidence={data.confidence} />

        <ExplanationCard message={data.message} />

        <KnowledgeGraph graph={data.knowledge_graph} />

      </div>

      <Footer />

    </div>
  );
}

export default App;