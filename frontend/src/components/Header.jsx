function Header() {
  const now = new Date();

  return (
    <>
      <div className="topbar">

        <div className="status">
          <span className="status-dot"></span>
          System Online
        </div>

        <div className="time">
          {now.toLocaleString()}
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