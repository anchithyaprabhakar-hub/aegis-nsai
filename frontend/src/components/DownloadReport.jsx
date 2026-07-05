import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

function DownloadReport({ data }) {
  const generatePDF = () => {
    if (!data) return;

    const doc = new jsPDF();

    doc.setFontSize(22);
    doc.text("AEGIS-NSAI", 14, 20);

    doc.setFontSize(12);
    doc.text("Neuro-Symbolic Intrusion Detection Report", 14, 30);

    autoTable(doc, {
      startY: 40,
      head: [["Field", "Value"]],
      body: [
        ["Prediction", data.prediction],
        ["Confidence", `${Number(data.confidence).toFixed(2)}%`],
        ["Explanation", data.message],
        [
          "Knowledge Graph",
          Array.isArray(data.knowledge_graph)
            ? data.knowledge_graph.join(", ")
            : "N/A",
        ],
        ["Generated", new Date().toLocaleString()],
      ],
    });

    doc.save("AEGIS-NSAI-Report.pdf");
  };

  return (
    <div
      className="info-card"
      style={{
        textAlign: "center",
      }}
    >
      <h3>Export Report</h3>

      <button
        onClick={generatePDF}
        style={{
          marginTop: "20px",
          padding: "14px 30px",
          border: "none",
          borderRadius: "10px",
          background: "#22c55e",
          color: "#fff",
          fontWeight: "700",
          cursor: "pointer",
          fontSize: "16px",
        }}
      >
        Download PDF Report
      </button>
    </div>
  );
}

export default DownloadReport;