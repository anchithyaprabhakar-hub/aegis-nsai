import { useRef, useState } from "react";

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
  const [errorMessage, setErrorMessage] = useState("");

  const inputRef = useRef(null);

  const API_URL = "http://127.0.0.1:8000/predict";

  /* =========================================================
     FILE SELECTION
     ========================================================= */

  const handleFileChange = (event) => {
    const selectedFile = event.target.files?.[0];

    if (!selectedFile) {
      return;
    }

    setErrorMessage("");

    if (!selectedFile.name.toLowerCase().endsWith(".csv")) {
      setFile(null);
      setStatus("Upload Failed");
      setErrorMessage("Please select a CSV file.");
      event.target.value = "";
      return;
    }

    if (selectedFile.size === 0) {
      setFile(null);
      setStatus("Upload Failed");
      setErrorMessage("The selected CSV file is empty.");
      event.target.value = "";
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

  /* =========================================================
     RESET
     ========================================================= */

  const handleReset = () => {
    if (loading) {
      return;
    }

    setFile(null);
    setStatus("Waiting for file");
    setErrorMessage("");

    if (inputRef.current) {
      inputRef.current.value = "";
    }
  };

  /* =========================================================
     UPLOAD / ANALYZE
     ========================================================= */

  const handleUpload = async () => {
    if (!file) {
      setStatus("Upload Failed");
      setErrorMessage("Please select a CSV file first.");
      return;
    }

    setLoading(true);
    setStatus("Analyzing...");
    setErrorMessage("");

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

      let result = {};

      try {
        result = await response.json();
      } catch {
        result = {};
      }

      /* =====================================================
         HTTP ERROR
         ===================================================== */

      if (!response.ok) {
        const backendMessage =
          result?.detail ||
          `Backend returned HTTP ${response.status}.`;

        console.error(
          "AEGIS-NSAI backend error:",
          backendMessage
        );

        throw new Error(backendMessage);
      }

      /* =====================================================
         VALIDATE RESPONSE
         ===================================================== */

      console.log("=================================");
      console.log("AEGIS-NSAI BACKEND RESULT");
      console.log("=================================");
      console.log(result);

      if (!result.prediction) {
        console.error(
          "Unexpected backend response:",
          result
        );

        throw new Error(
          "The backend response did not contain a prediction."
        );
      }

      /* =====================================================
         SEND RESULT TO APP
         ===================================================== */

      onPrediction(result);

      setStatus("Analysis Complete");
      setErrorMessage("");

      console.log(
        "Analysis completed successfully."
      );
    } catch (error) {
      console.error("=================================");
      console.error("AEGIS-NSAI ANALYSIS FAILED");
      console.error("=================================");
      console.error(error);

      setStatus("Upload Failed");

      if (
        error instanceof TypeError &&
        error.message.toLowerCase().includes("fetch")
      ) {
        setErrorMessage(
          "Cannot connect to the AEGIS-NSAI backend. " +
          "Make sure FastAPI is running on port 8000."
        );
      } else {
        setErrorMessage(
          error.message ||
            "Analysis failed while processing the uploaded CSV."
        );
      }
    } finally {
      setLoading(false);
    }
  };

  /* =========================================================
     STATUS COLOR
     ========================================================= */

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

  /* =========================================================
     STATUS ICON
     ========================================================= */

  const getStatusIcon = () => {
    switch (status) {
      case "Analysis Complete":
        return <FaCheckCircle />;

      case "Upload Failed":
        return <FaExclamationTriangle />;

      case "Analyzing...":
        return (
          <FaSpinner
            className="spin"
            aria-hidden="true"
          />
        );

      default:
        return <FaUpload />;
    }
  };

  /* =========================================================
     FILE SIZE
     ========================================================= */

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
    <section className="file-upload-card">

      {/* =====================================================
          TITLE
          ===================================================== */}

      <div className="file-upload-header">

        <div className="file-upload-icon">
          <FaUpload />
        </div>

        <div>
          <h2>Upload Network Traffic CSV</h2>

          <p>
            Upload a CIC-IDS2017-compatible CSV file
            for neuro-symbolic analysis.
          </p>
        </div>

      </div>

      {/* =====================================================
          HIDDEN FILE INPUT
          ===================================================== */}

      <input
        ref={inputRef}
        id="csv-upload"
        type="file"
        accept=".csv,text/csv"
        onChange={handleFileChange}
        disabled={loading}
        className="hidden-file-input"
      />

      {/* =====================================================
          ACTION BUTTONS
          ===================================================== */}

      <div className="file-upload-actions">

        <label
          htmlFor="csv-upload"
          className={`choose-file-button ${
            loading ? "button-disabled" : ""
          }`}
        >
          <FaFileCsv />
          <span>Choose File</span>
        </label>

        <button
          type="button"
          onClick={handleUpload}
          disabled={loading || !file}
          className={`analyze-file-button ${
            loading || !file
              ? "button-disabled"
              : ""
          }`}
        >
          {loading ? (
            <>
              <FaSpinner
                className="spin"
                aria-hidden="true"
              />
              <span>Analyzing...</span>
            </>
          ) : (
            <>
              <FaUpload />
              <span>Analyze CSV</span>
            </>
          )}
        </button>

        <button
          type="button"
          onClick={handleReset}
          disabled={loading}
          className={`reset-file-button ${
            loading ? "button-disabled" : ""
          }`}
          aria-label="Clear selected file"
          title="Clear selected file"
        >
          <FaTrash />
        </button>

      </div>

      {/* =====================================================
          SELECTED FILE
          ===================================================== */}

      {file && (
        <div className="selected-file-panel">

          <div className="selected-file-main">

            <div className="selected-file-icon">
              <FaFileCsv />
            </div>

            <div className="selected-file-details">

              <strong>
                {file.name}
              </strong>

              <span>
                {formatFileSize(file.size)}
                {" · "}
                {file.type || "text/csv"}
              </span>

            </div>

          </div>

          <div
            className="upload-status"
            style={{
              color: getStatusColor(),
            }}
          >
            {getStatusIcon()}
            <span>{status}</span>
          </div>

        </div>
      )}

      {/* =====================================================
          ERROR
          ===================================================== */}

      {errorMessage && (
        <div
          className="upload-error"
          role="alert"
        >
          <FaExclamationTriangle />

          <span>
            {errorMessage}
          </span>
        </div>
      )}

    </section>
  );
}

export default FileUpload;