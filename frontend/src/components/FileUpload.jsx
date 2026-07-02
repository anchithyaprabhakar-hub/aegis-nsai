import { useState } from "react";
import {
  FaUpload,
  FaFileCsv,
  FaCheckCircle,
  FaExclamationTriangle,
  FaSpinner,
  FaTrash,
} from "react-icons/fa";

function FileUpload({ onPrediction }) {
  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState("Waiting for file");

  const handleFileChange = (event) => {
    const selectedFile = event.target.files[0];

    if (selectedFile) {
      setFile(selectedFile);
      setStatus("Ready for Analysis");
    }
  };

  const handleReset = () => {
    setFile(null);
    setStatus("Waiting for file");

    const input = document.getElementById("csv-upload");
    if (input) input.value = "";
  };

  const handleUpload = async () => {
    if (!file) {
      alert("Please select a CSV file first.");
      return;
    }

    setLoading(true);
    setStatus("Analyzing...");

    const formData = new FormData();
    formData.append("file", file);

    try {
      const response = await fetch("http://127.0.0.1:8000/predict", {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        throw new Error("Server Error");
      }

      const result = await response.json();

      onPrediction(result);

      setStatus("Analysis Complete");
    } catch (error) {
      console.error(error);
      setStatus("Upload Failed");
      alert("Upload failed.");
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = () => {
    switch (status) {
      case "Ready for Analysis":
        return "#38bdf8";

      case "Analyzing...":
        return "#facc15";

      case "Analysis Complete":
        return "#22c55e";

      case "Upload Failed":
        return "#ef4444";

      default:
        return "#9ca3af";
    }
  };

  const getStatusIcon = () => {
    switch (status) {
      case "Analysis Complete":
        return <FaCheckCircle />;

      case "Upload Failed":
        return <FaExclamationTriangle />;

      case "Analyzing...":
        return <FaSpinner className="spin" />;

      default:
        return <FaUpload />;
    }
  };

  return (
    <div className="info-card" style={{ textAlign: "center" }}>

      <h3>Upload Network Traffic CSV</h3>

      <input
        id="csv-upload"
        type="file"
        accept=".csv"
        onChange={handleFileChange}
        style={{ display: "none" }}
      />

      <div
        style={{
          display: "flex",
          justifyContent: "center",
          gap: "18px",
          marginTop: "25px",
          flexWrap: "wrap",
        }}
      >
        <label
          htmlFor="csv-upload"
          style={{
            padding: "12px 24px",
            background: "#fff",
            color: "#000",
            borderRadius: "10px",
            cursor: loading ? "not-allowed" : "pointer",
            fontWeight: "600",
          }}
        >
          Choose File
        </label>

        <button
          onClick={handleUpload}
          disabled={loading || !file}
          style={{
            padding: "12px 24px",
            border: "none",
            borderRadius: "10px",
            background: "#fff",
            color: "#000",
            fontWeight: "600",
            cursor: loading ? "not-allowed" : "pointer",
            opacity: loading ? 0.7 : 1,
          }}
        >
          {loading ? "Analyzing..." : "Analyze CSV"}
        </button>

        <button
          onClick={handleReset}
          disabled={loading}
          style={{
            padding: "12px 20px",
            border: "1px solid #444",
            borderRadius: "10px",
            background: "#1c1c1c",
            color: "#fff",
            cursor: loading ? "not-allowed" : "pointer",
          }}
        >
          <FaTrash />
        </button>
      </div>

      {file && (
        <div
          style={{
            marginTop: "30px",
            background: "#111",
            border: "1px solid #2c2c2c",
            borderRadius: "14px",
            padding: "18px",
          }}
        >
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: "10px",
              color: "#38bdf8",
              fontSize: "18px",
            }}
          >
            <FaFileCsv />

            <strong>{file.name}</strong>
          </div>

          <p
            style={{
              marginTop: "12px",
              color: "#9ca3af",
            }}
          >
            Size: {(file.size / 1024).toFixed(2)} KB
          </p>

          <p
            style={{
              color: "#9ca3af",
            }}
          >
            Type: {file.type || "text/csv"}
          </p>

          <div
            style={{
              marginTop: "18px",
              display: "inline-flex",
              alignItems: "center",
              gap: "8px",
              padding: "8px 16px",
              borderRadius: "20px",
              background: "#222",
              color: getStatusColor(),
              fontWeight: "700",
            }}
          >
            {getStatusIcon()}
            {status}
          </div>
        </div>
      )}

    </div>
  );
}

export default FileUpload;