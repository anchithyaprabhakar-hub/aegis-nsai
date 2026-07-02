import { useState } from "react";

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

      console.log(result);

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

  const statusColor = () => {
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
            transition: "0.3s",
            opacity: loading ? 0.7 : 1,
          }}
        >
          Choose File
        </label>

        <button
          onClick={handleUpload}
          disabled={loading}
          style={{
            padding: "12px 24px",
            border: "none",
            borderRadius: "10px",
            background: "#ffffff",
            color: "#000000",
            fontWeight: "600",
            cursor: loading ? "not-allowed" : "pointer",
            opacity: loading ? 0.7 : 1,
            transition: "0.3s",
          }}
        >
          {loading ? "Analyzing..." : "Analyze CSV"}
        </button>
      </div>

      {file && (
        <>
          <p
            style={{
              marginTop: "25px",
              color: "#d1d5db",
              fontSize: "17px",
              fontWeight: "500",
              wordBreak: "break-word",
            }}
          >
            📄 {file.name}
          </p>

          <p
            style={{
              marginTop: "10px",
              color: statusColor(),
              fontSize: "16px",
              fontWeight: "700",
            }}
          >
            {status}
          </p>
        </>
      )}
    </div>
  );
}

export default FileUpload;