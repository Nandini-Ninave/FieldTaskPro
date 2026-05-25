"use client";

import axios from "axios";
import { useContext, useEffect, useState } from "react";
import Ct from "../../Ct";
import "./logs.css"
function Logs() {
  const [logs, setLogs] = useState([]);
  const { state } = useContext(Ct);
  const userId = state?._id;

  const getLogs = async () => {
    try {
      const res = await axios.get(
        `${process.env.NEXT_PUBLIC_API_URL}/member/auditLogs/${userId}`
      );

      setLogs(res.data || []);
    } catch (error) {
      console.log(error);
    }
  };

  // ✅ FIX: call API on load
  useEffect(() => {
    if (!userId) return;
    getLogs();
  }, [userId]);

  return (
    <div className="card">
      <h2>Audit Logs</h2>

      {logs.length === 0 ? (
        <p>No logs found</p>
      ) : (
        logs.map((l) => (
          <div key={l._id} className="item">
            <p>Action: {l.actionType}</p>
            <p>Category: {l.category}</p>
          </div>
        ))
      )}
    </div>
  );
}

export default Logs;