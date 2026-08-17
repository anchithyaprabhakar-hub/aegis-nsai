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

  const API_URL = "http://127.0.0.1:8000/predict";

  // ============================
  // FILE SELECTION
  // ============================

  const handleFileChange = (event) => {
    const selectedFile = event.target.files?.[0];

    if (!selectedFile) {
      return;
    }

    if (!selectedFile.name.toLowerCase().endsWith(".csv")) {
      alert("Please select a CSV file.");
      return;
    }

    setFile(selectedFile);
    setStatus("Ready for Analysis");

    console.log("Selected file:", {
      name: selectedFile.name,
      size: selectedFile.size,
      type: selectedFile.type,
    });
  };

  // ============================
  // RESET
  // ============================

  const handleReset = () => {
    if (loading) return;

    setFile(null);
    setStatus("Waiting for file");

    const input = document.getElementById("csv-upload");

    if (input) {
      input.value = "";
    }
  };

  // ============================
  // UPLOAD / ANALYZE
  // ============================

  const handleUpload = async () => {
    if (!file) {
      alert("Please select a CSV file first.");
      return;
    }

    setLoading(true);
    setStatus("Analyzing...");

    const formData = new FormData();
    formData.append("file", file);

    console.log("=================================");
    console.log("AEGIS-NSAI ANALYSIS STARTED");
    console.log("=================================");
    console.log("Backend URL:", API_URL);
    console.log("File:", file.name);
    console.log("File size:", file.size, "bytes");
    console.log("Sending request...");

    try {
      const response = await fetch(API_URL, {
        method: "POST",
        body: formData,
      });

      console.log("Backend response received.");
      console.log("HTTP status:", response.status);
      console.log("HTTP status text:", response.statusText);

      // ============================
      // HTTP ERROR
      // ============================

      if (!response.ok) {
        const errorText = await response.text();

        console.error("Backend returned an error:");
        console.error(errorText);

        throw new Error(
          `Backend error ${response.status}: ${errorText}`
        );
      }

      // ============================
      // PARSE RESPONSE
      // ============================

      const result = await response.json();

      console.log("=================================");
      console.log("AEGIS-NSAI BACKEND RESULT");
      console.log("=================================");
      console.log(result);

      // ============================
      // VALIDATE RESPONSE
      // ============================

      if (!result.prediction) {
        console.error("Unexpected backend response:", result);

        throw new Error(
          "Backend response does not contain a prediction."
        );
      }

      // ============================
      // SEND RESULT TO APP
      // ============================

      onPrediction(result);

      setStatus("Analysis Complete");

      console.log("Analysis completed successfully.");
    } catch (error) {
      console.error("=================================");
      console.error("AEGIS-NSAI ANALYSIS FAILED");
      console.error("=================================");
      console.error(error);

      setStatus("Upload Failed");

      if (
        error instanceof TypeError &&
        error.message.includes("fetch")
      ) {
        alert(
          "Cannot connect to the AEGIS-NSAI backend.\n\n" +
          "Make sure FastAPI is running on port 8000."
        );
      } else {
        alert(
          `Analysis failed.\n\n${error.message}\n\n` +
          "Check the browser Console and backend terminal."
        );
      }
    } finally {
      setLoading(false);
    }
  };

  // ============================
  // STATUS COLOR
  // ============================

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

  // ============================
  // STATUS ICON
  // ============================

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

  // ============================
  // FORMAT FILE SIZE
  // ============================

  const formatFileSize = (bytes) => {
    if (bytes < 1024) {
      return `${bytes} B`;
    }

    if (bytes < 1024 * 1024) {
      return `${(bytes / 1024).toFixed(2)} KB`;
    }

    if (bytes < 1024 * 1024 * 1024) {
      return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
    }

    return `${(bytes / (1024 * 1024 * 1024)).toFixed(2)} GB`;
  };

  return (
    <div
      className="info-card"
      style={{
        textAlign: "center",
      }}
    >
      <h3>Upload Network Traffic CSV</h3>

      {/* ============================
          FILE INPUT
      ============================ */}

      <input
        id="csv-upload"
        type="file"
        accept=".csv,text/csv"
        onChange={handleFileChange}
        style={{
          display: "none",
        }}
      />

      {/* ============================
          BUTTONS
      ============================ */}

      <div
        style={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          gap: "18px",
          marginTop: "25px",
          flexWrap: "wrap",
        }}
      >
        <label
          htmlFor="csv-upload"
          style={{
            padding: "12px 24px",
            background: "#ffffff",
            color: "#000000",
            borderRadius: "10px",
            cursor: loading ? "not-allowed" : "pointer",
            fontWeight: "600",
            opacity: loading ? 0.6 : 1,
          }}
        >
          Choose File
        </label>

        <button
          type="button"
          onClick={handleUpload}
          disabled={loading || !file}
          style={{
            padding: "12px 24px",
            border: "none",
            borderRadius: "10px",
            background: "#ffffff",
            color: "#000000",
            fontWeight: "600",
            cursor:
              loading || !file
                ? "not-allowed"
                : "pointer",
            opacity:
              loading || !file
                ? 0.6
                : 1,
          }}
        >
          {loading ? (
            <>
              <FaSpinner
                className="spin"
                style={{ marginRight: "8px" }}
              />
              Analyzing...
            </>
          ) : (
            "Analyze CSV"
          )}
        </button>

        <button
          type="button"
          onClick={handleReset}
          disabled={loading}
          style={{
            width: "64px",
            height: "48px",
            border: "1px solid #444",
            borderRadius: "10px",
            background: "#1c1c1c",
            color: "#ffffff",
            cursor: loading
              ? "not-allowed"
              : "pointer",
            opacity: loading ? 0.6 : 1,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <FaTrash />
        </button>
      </div>

      {/* ============================
          FILE INFORMATION
      ============================ */}

      {file && (
        <div
          style={{
            marginTop: "30px",
            background: "#111111",
            border: "1px solid #2c2c2c",
            borderRadius: "14px",
            padding: "18px",
          }}
        >
          {/* File name */}

          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: "10px",
              color: "#38bdf8",
              fontSize: "18px",
              wordBreak: "break-word",
            }}
          >
            <FaFileCsv />

            <strong>{file.name}</strong>
          </div>

          {/* File size */}

          <p
            style={{
              marginTop: "12px",
              color: "#9ca3af",
            }}
          >
            Size: {formatFileSize(file.size)}
          </p>

          {/* File type */}

          <p
            style={{
              color: "#9ca3af",
            }}
          >
            Type: {file.type || "text/csv"}
          </p>

          {/* Status */}

          <div
            style={{
              marginTop: "18px",
              display: "inline-flex",
              alignItems: "center",
              gap: "8px",
              padding: "8px 16px",
              borderRadius: "20px",
              background: "#222222",
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