function FileUpload() {

  return (

    <div className="info-card">

      <h3>Upload Network Traffic CSV</h3>

      <input
        type="file"
        accept=".csv"
      />

    </div>

  );

}

export default FileUpload;