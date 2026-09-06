import React, { useEffect, useState } from "react";
import {
  FaServer,
  FaBrain,
} from "react-icons/fa";

function Header({ totalAnalyses = 0 }) {
  const [currentTime, setCurrentTime] = useState(
    new Date()
  );

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  const formattedDate =
    currentTime.toLocaleDateString("en-GB", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    });

  const formattedTime =
    currentTime.toLocaleTimeString("en-GB", {
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
      hour12: false,
    });

  return (
    <header
      style={{
        width: "100%",
        boxSizing: "border-box",
        padding: "28px 38px",
        marginBottom: "55px",
      }}
    >
      <div
        style={{
          width: "100%",
          minHeight: "125px",
          boxSizing: "border-box",

          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",

          padding: "26px 42px",

          background:
            "linear-gradient(135deg, #171717 0%, #141414 100%)",

          border:
            "1px solid rgba(255,255,255,0.14)",

          borderRadius: "24px",

          boxShadow:
            "0 12px 35px rgba(0,0,0,0.30)",
        }}
      >

        {/* =====================================================
            LEFT SIDE — SYSTEM STATUS
        ===================================================== */}

        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "24px",
            minWidth: "300px",
          }}
        >

          {/* Status indicator */}

          <div
            style={{
              width: "18px",
              height: "18px",
              minWidth: "18px",
              borderRadius: "50%",
              background: "#22c55e",

              boxShadow:
                "0 0 22px rgba(34,197,94,0.75)",
            }}
          />

          <div
            style={{
              display: "flex",
              flexDirection: "column",
              gap: "8px",
            }}
          >

            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: "12px",

                fontSize: "22px",
                fontWeight: "700",
                color: "#f5f5f5",
                letterSpacing: "0.2px",
              }}
            >
              <FaServer
                size={21}
              />

              <span>
                System Online
              </span>
            </div>

            <div
              style={{
                fontSize: "16px",
                fontWeight: "600",
                color: "#9ca3af",
                letterSpacing: "0.3px",
              }}
            >
              Total Analyses :{" "}
              <span
                style={{
                  color: "#f5f5f5",
                  fontWeight: "700",
                  marginLeft: "5px",
                }}
              >
                {Number(totalAnalyses) || 0}
              </span>
            </div>

          </div>
        </div>


        {/* =====================================================
            RIGHT SIDE — AI ENGINE + DATE + TIME
        ===================================================== */}

        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "48px",
          }}
        >

          {/* AI ENGINE */}

          <div
            style={{
              display: "flex",
              flexDirection: "column",
              alignItems: "flex-end",
              gap: "7px",
            }}
          >

            <div
              style={{
                fontSize: "14px",
                color: "#9ca3af",
                fontWeight: "500",
                letterSpacing: "0.5px",
                textTransform: "uppercase",
              }}
            >
              AI Engine
            </div>

            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: "9px",

                color: "#22c55e",
                fontSize: "20px",
                fontWeight: "700",
              }}
            >
              <FaBrain size={19} />

              <span>
                ACTIVE
              </span>
            </div>

          </div>


          {/* DATE */}

          <div
            style={{
              display: "flex",
              flexDirection: "column",
              alignItems: "flex-end",
              gap: "7px",
            }}
          >

            <div
              style={{
                fontSize: "14px",
                color: "#9ca3af",
                fontWeight: "500",
              }}
            >
              {formattedDate}
            </div>

            <div
              style={{
                fontSize: "21px",
                color: "#f5f5f5",
                fontWeight: "700",
                fontVariantNumeric:
                  "tabular-nums",
              }}
            >
              {formattedTime}
            </div>

          </div>

        </div>

      </div>
    </header>
  );
}

export default Header;