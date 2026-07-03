import { FaFilePdf, FaFileCode } from "react-icons/fa";

function DownloadReport({ data }) {
  const downloadJSON = () => {
    const blob = new Blob(
      [JSON.stringify(data, null, 2)],
      { type: "application/json" }
    );

    const url = URL.createObjectURL(blob);

    const a = document.createElement("a");
    a.href = url;
    a.download = "analysis-report.json";
    a.click();

    URL.revokeObjectURL(url);
  };

  const downloadPDF = () => {
    window.print();
  };

  return (
    <div className="info-card">
      <h3>Export Report</h3>

      <div
        style={{
          display: "flex",
          gap: "15px",
          flexWrap: "wrap",
          marginTop: "20px",
        }}
      >
        <button onClick={downloadPDF}>
          <FaFilePdf /> Download PDF
        </button>

        <button onClick={downloadJSON}>
          <FaFileCode /> Export JSON
        </button>
      </div>
    </div>
  );
}

export default DownloadReport;