import { IconContext } from "react-icons";

function SummaryCard({ icon, title, value }) {

  const getValueColor = () => {

    if (title === "Threat Level") {

      if (value === "Critical") return "#ef4444";

      if (value === "High") return "#f97316";

      if (value === "Medium") return "#facc15";

      return "#22c55e";
    }

    if (title === "Prediction") {
      return "#38bdf8";
    }

    if (title === "Confidence") {
      return "#ffffff";
    }

    if (title === "Risk Score") {
      return "#a855f7";
    }

    if (title === "AI Engine") {
      return "#22c55e";
    }

    if (title === "Detection Time") {
      return "#9ca3af";
    }

    return "#ffffff";
  };

  return (
    <div className="info-card">

      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: "20px",
        }}
      >
        <h3>{title}</h3>

        <IconContext.Provider
          value={{
            size: "24px",
            color: "#ffffff",
          }}
        >
          {icon}
        </IconContext.Provider>
      </div>

      <h2
        style={{
          color: getValueColor(),
          fontWeight: "700",
          fontSize: "34px",
          transition: "0.3s",
        }}
      >
        {value}
      </h2>

    </div>
  );
}

export default SummaryCard;