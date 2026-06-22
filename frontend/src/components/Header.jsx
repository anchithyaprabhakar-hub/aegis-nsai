import { useEffect, useState } from "react";

function Header() {

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
          System Online
        </div>

        <div className="time">
          {time.toLocaleString()}
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