function RecentLogs() {

  const logs = [
    "12:21:03  PortScan detected",
    "12:20:54  Symbolic rules verified",
    "12:20:52  Knowledge graph updated",
    "12:20:49  Neural model inference complete",
    "12:20:47  Threat score calculated"
  ];

  return (

    <div
      className="info-card"
      style={{ gridColumn: "1 / span 2" }}
    >

      <h3>Recent Detection Logs</h3>

      <div className="logs">

        {logs.map((log, index) => (
          <p key={index}>{log}</p>
        ))}

      </div>

    </div>

  );

}

export default RecentLogs;