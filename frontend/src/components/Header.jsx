import { useEffect, useState } from "react";
import {
  FaShieldAlt,
  FaServer,
  FaBrain,
} from "react-icons/fa";

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

        <div
          className="status"
          style={{
            display: "flex",
            alignItems: "center",
            gap: "15px",
          }}
        >
          <span className="status-dot"></span>

          <div>
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: "8px",
                fontWeight: "700",
                color: "#ffffff",
                fontSize: "16px",
              }}
            >
              <FaServer />
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
          style={{
            display: "flex",
            gap: "30px",
            alignItems: "center",
          }}
        >
          <div
            style={{
              textAlign: "center",
            }}
          >
            <div
              style={{
                color: "#9ca3af",
                fontSize: "12px",
              }}
            >
              AI ENGINE
            </div>

            <div
              style={{
                color: "#22c55e",
                fontWeight: "700",
              }}
            >
              <FaBrain
                style={{
                  marginRight: "6px",
                }}
              />
              ACTIVE
            </div>
          </div>

          <div
            className="time"
            style={{
              textAlign: "right",
            }}
          >
            <div
              style={{
                color: "#9ca3af",
                fontSize: "13px",
              }}
            >
              {time.toLocaleDateString()}
            </div>

            <div
              style={{
                fontSize: "18px",
                fontWeight: "700",
                color: "#ffffff",
                marginTop: "4px",
              }}
            >
              {time.toLocaleTimeString()}
            </div>
          </div>
        </div>

      </div>

      <header className="header">

        <div
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: "12px",
          }}
        >
          <FaShieldAlt
            size={40}
            color="#38bdf8"
          />

          <h1>AEGIS-NSAI</h1>
        </div>

        <p className="subtitle">
          Neuro-Symbolic Intrusion Detection System
        </p>

        <div
          style={{
            marginTop: "18px",
            display: "inline-block",
            background: "#171717",
            border: "1px solid #2b2b2b",
            borderRadius: "20px",
            padding: "8px 18px",
            color: "#22c55e",
            fontSize: "14px",
            fontWeight: "600",
          }}
        >
          Version 1.0 • AI Detection Dashboard
        </div>

      </header>
    </>
  );
}

export default Header;