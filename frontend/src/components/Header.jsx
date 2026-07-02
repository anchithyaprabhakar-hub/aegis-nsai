import { useEffect, useState } from "react";

function Header({ analysisCount }) {
  const [time, setTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => {
      setTime(new Date());
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  return (
    <>
      <div className="topbar">

        <div className="status">
          <span className="status-dot"></span>

          <div>
            <div
              style={{
                fontWeight: "700",
                color: "#ffffff",
              }}
            >
              System Online
            </div>

            <small
              style={{
                color: "#9ca3af",
                fontSize: "13px",
              }}
            >
              Total Analyses : {analysisCount}
            </small>
          </div>
        </div>

        <div
          className="time"
          style={{
            textAlign: "right",
          }}
        >
          <div>{time.toLocaleDateString()}</div>

          <div
            style={{
              fontSize: "18px",
              fontWeight: "600",
              marginTop: "4px",
            }}
          >
            {time.toLocaleTimeString()}
          </div>
        </div>

      </div>

      <header className="header">

        <h1>AEGIS-NSAI</h1>

        <p className="subtitle">
          Neuro-Symbolic Intrusion Detection System
        </p>

      </header>
    </>
  );
}

export default Header;