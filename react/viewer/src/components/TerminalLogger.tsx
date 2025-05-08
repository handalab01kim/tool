// TerminalLogger.tsx
import React, { useEffect, useState } from "react";
import styled from "styled-components";
import { io, Socket } from "socket.io-client";

const TerminalWrapper = styled.div`
  background-color: black;
  color: #00ff00;
  font-family: monospace;
  padding: 1rem;
  height: 100vh;
  overflow-y: auto;
`;

const TerminalLogger: React.FC = () => {
  const [logs, setLogs] = useState<string[]>([]);
  const [sockets, setSockets] = useState<{ dio?: Socket; all?: Socket; analysis?: Socket }>({});

  const timezone = (date: Date) => {
    return date.toLocaleString("ko-KR", {
      timeZone: "Asia/Seoul",
    });
  };

  useEffect(() => {
    const ANALYSIS_IP = "172.30.1.60"; 
    const UI_SERVER_IP = "172.30.1.60"; 

    const dio = io(`ws://${ANALYSIS_IP}:4003/output`);
    const all = io(`ws://${UI_SERVER_IP}:4001/all`);
    const analysis = io(`ws://${UI_SERVER_IP}:4001/analysis`);

    dio.on("message", (data:any) => {
      appendLog(`\n\ndio - message [${timezone(new Date())}]\n${JSON.stringify(data, null, 2)}`);
    });

    all.on("event", (data:any) => {
      appendLog(`\n\nall - event [${timezone(new Date())}]\n${JSON.stringify(data, null, 2)}`);
    });

    all.on("status", (data:any) => {
      appendLog(`\n\nall - status [${timezone(new Date())}]\n${JSON.stringify(data, null, 2)}`);
    });

    analysis.on("message", (data:any) => {
      appendLog(`\n\nanalysis - message [${timezone(new Date())}]\n${JSON.stringify(data, null, 2)}`);
    });

    setSockets({ dio, all, analysis });

    return () => {
      dio.disconnect();
      all.disconnect();
      analysis.disconnect();
    };
  }, []);

  const appendLog = (text: string) => {
    setLogs((prevLogs) => [...prevLogs, text]);
  };

  return (
    <TerminalWrapper>
      {logs.map((log, idx) => (
        <div key={idx}>{log}</div>
      ))}
    </TerminalWrapper>
  );
};

export default TerminalLogger;
