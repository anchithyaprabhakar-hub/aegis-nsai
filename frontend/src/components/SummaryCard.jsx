import { IconContext } from "react-icons";

function SummaryCard({ icon, title, value }) {
  return (
    <div className="info-card">

      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: "20px"
        }}
      >
        <h3>{title}</h3>

        <IconContext.Provider value={{ size: "24px", color: "#ffffff" }}>
          {icon}
        </IconContext.Provider>
      </div>

      <h2>{value}</h2>

    </div>
  );
}

export default SummaryCard;