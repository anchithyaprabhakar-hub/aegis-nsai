import { useState } from "react";

function FileUpload({ onPrediction }) {
  const [file, setFile] = useState(null);

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

    alert(JSON.stringify(result));

    console.log(result);

    onPrediction(result);
    } catch (error) {
      console.error(error);
      alert("Upload failed.");
    }
  };

  return (
    <div className="info-card">
      <h3>Upload Network Traffic CSV</h3>

      <input
        type="file"
        accept=".csv"
        onChange={handleFileChange}
      />

      {file && (
        <p style={{ marginTop: "15px" }}>
          Selected: {file.name}
        </p>
      )}

      <button
        onClick={handleUpload}
        style={{
          marginTop: "20px",
          padding: "10px 20px",
          cursor: "pointer",
          border: "none",
          borderRadius: "8px",
          background: "#ffffff",
          color: "#000000",
          fontWeight: "600",
        }}
      >
        Analyze CSV
      </button>
    </div>
  );
}

export default FileUpload;