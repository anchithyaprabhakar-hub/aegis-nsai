import { useState } from "react";

function FileUpload() {

  const [fileName, setFileName] = useState("");

  const handleFileChange = (event) => {

    const file = event.target.files[0];

    if (file) {
      setFileName(file.name);
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

      {fileName && (
        <p style={{ marginTop: "15px" }}>
          Selected: {fileName}
        </p>
      )}

    </div>

  );

}

export default FileUpload;