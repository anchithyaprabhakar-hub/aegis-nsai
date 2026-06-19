import { useEffect, useState } from "react";
import "./App.css";

function App() {
  const [data, setData] =useState(null);

  useEffect(() => {
    fetch("http://127.0.0.1:8000/predict")
      .then((res) => res.json())
      .then((result) => setData(result))
      .catch((err) => console.log(err));
  }, []);

  return (
    <div className="container">
      <h1>AEGIS-NSAI</h1>
      <h2>Neuro-Symbolic Intrusion Detection System</h2>

      {data ? (
        <div className="card">

          <h3>Prediction</h3>
          <p><strong>{data.prediction}</strong></p>

          <h3>Confidence</h3>
          <p><strong>{data.confidence}%</strong></p>

          <h3>Explanation</h3>
          <p>{data.message}</p>

          <h3>Knowledge Graph</h3>

          <ul>
            {data.knowledge_graph.map((item, index) => (
              <li key={index}>{item}</li>
            ))}
          </ul>

        </div>
      ) : (
        <div className="loading">
          Initializing AI Engine...
        </div>
      )}
    </div>
  );
}

export default App;