import { useState } from "react";

function FileUpload({ onPrediction }) {
  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleFileChange = (event) => {
    const selectedFile = event.target.files[0];

    if (selectedFile) {
      setFile(selectedFile);
    }
  };

  const handleUpload = async () => {
    if (!file) {
      alert("Please select a CSV file first.");
      return;
    }

    setLoading(true);

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
    } catch (error) {
      console.error(error);
      alert("Upload failed.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="info-card">
      <h3>Upload Network Traffic CSV</h3>

      <input
        id="csv-upload"
        type="file"
        accept=".csv"
        onChange={handleFileChange}
        style={{ display: "none" }}
      />

      <label
        htmlFor="csv-upload"
        style={{
          display: "inline-block",
          marginTop: "20px",
          padding: "12px 22px",
          background: "#ffffff",
          color: "#000",
          borderRadius: "10px",
          cursor: "pointer",
          fontWeight: "600",
        }}
      >
        Choose File
      </label>

      {file && (
        <p
          style={{
            marginTop: "25px",
            textAlign: "center",
            color: "#d1d5db",
            fontSize: "18px",
            fontWeight: "500",
          }}
        >
          📄 {file.name}
        </p>
      )}

      <button
        onClick={handleUpload}
        disabled={loading}
        style={{
          marginTop: "20px",
          padding: "12px 22px",
          cursor: loading ? "not-allowed" : "pointer",
          border: "none",
          borderRadius: "10px",
          background: "#ffffff",
          color: "#000000",
          fontWeight: "600",
          opacity: loading ? 0.7 : 1,
          transition: "0.3s",
        }}
      >
        {loading ? "Analyzing..." : "Analyze CSV"}
      </button>
    </div>
  );
}

export default FileUpload;