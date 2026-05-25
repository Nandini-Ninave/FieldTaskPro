"use client";

import { useContext, useEffect, useState } from "react";
import axios from "axios";
import Ct from "../../Ct";
import "./attendance.css";

export default function AttendanceAdmin() {
  const { state } = useContext(Ct);
  const userId = state._id;
  const { token } = state;
  const [lat, setLat] = useState("");
  const [lng, setLng] = useState("");
  const [records, setRecords] = useState([]);
  const [loading, setLoading] = useState(false);
  const [editRow, setEditRow] = useState(null);
  const [summary, setSummary] = useState({ present: 0, absent: 0, totalHours: 0});

 
  const fetchAttendance = async () => {
    if (!token) return;
    setLoading(true);
    try {
      const res = await axios.get(
        "http://localhost:5000/editor/all",
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const data = res.data || [];
      setRecords(data);

      let present = 0;
      let absent = 0;
      let totalMinutes = 0;

      data.forEach((rec) => {
        const hasIn = rec.punchInTime;
        const hasOut = rec.punchOutTime;

        if (hasIn && hasOut) {
          present++;
          totalMinutes +=
            (new Date(hasOut) - new Date(hasIn)) /
            (1000 * 60);
        } else {
          absent++;
        }
      });

      setSummary({
        present,
        absent,
        totalHours: (totalMinutes / 60).toFixed(2),
      });
    } catch (err) {
      console.log(err.message);
    }

    setLoading(false);
  };

  useEffect(() => {
    if (token) fetchAttendance();
  }, [token]);

  const updateAttendance = async (id, payload) => {
    try {
      await axios.put(
        `http://localhost:5000/editor/update/${id}`,
        payload,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      setEditRow(null);
      fetchAttendance();
    } catch (err) {
      console.log(err.message);
    }
  };

  const downloadCSV = (id) =>
    window.open(
      `http://localhost:5000/editor/attendance/csv/${id}`,
      "_blank"
    );

  const downloadPDF = (id) =>
    window.open(
      `http://localhost:5000/editor/attendance/pdf/${id}`,
      "_blank"
    );

  const punchIn = async () => {
    try {
      const res = await axios.post(
        "http://localhost:5000/editor/punch",
        {
          userId,
          action: "in",
          lat: Number(lat),
          lng: Number(lng),
        }
      );

      alert(res.data.message);
      fetchAttendance();
    } catch (err) {
      alert(err.response?.data?.message);
    }
  };

  const punchOut = async () => {
    try {
      const res = await axios.post(
        "http://localhost:5000/editor/punch",
        {
          userId,
          action: "out",
          lat: Number(lat),
          lng: Number(lng),
        }
      );

      alert(res.data.message);
      fetchAttendance();
    } catch (err) {
      alert(err.response?.data?.message);
    }
  };

  return (
    <div className="page">

      <div className="header">
        <h1 className="title">Attendance Management</h1>
        <p className="subtitle">
          Manage attendance records
        </p>
      </div>

      {/* SUMMARY */}
      <div className="summaryBox">
        <div className="card">
          <div className="cardLabel">Present</div>
          <div className="cardValue">✔ {summary.present}</div>
        </div>

        <div className="card">
          <div className="cardLabel">Absent</div>
          <div className="cardValue">❌ {summary.absent}</div>
        </div>

        <div className="card">
          <div className="cardLabel">Total Hours</div>
          <div className="cardValue">⏱ {summary.totalHours}</div>
        </div>
      </div>

      {/* FORM */}
      <div className="formBox">
        <input
          className="input"
          placeholder="Latitude"
          value={lat}
          onChange={(e) => setLat(e.target.value)}
        />

        <input
          className="input"
          placeholder="Longitude"
          value={lng}
          onChange={(e) => setLng(e.target.value)}
        />

        <button className="button primaryBtn" onClick={punchIn}>
          Punch In
        </button>

        <button className="button dangerBtn" onClick={punchOut}>
          Punch Out
        </button>
      </div>

      {/* TABLE */}
      {loading ? (
        <p>Loading...</p>
      ) : (
        <div className="tableWrap">
          <table className="table">
            <thead>
              <tr>
                <th>Name</th>
                <th>Mode</th>
                <th>Date</th>
                <th>Status</th>
                <th>In</th>
                <th>Out</th>
                <th>Zone</th>
                <th>Actions</th>
              </tr>
            </thead>

            <tbody>
              {records.map((rec) => (
                <tr key={rec._id}>
                  <td>{rec.userId?.name || "-"}</td>
                  <td>{rec.mode}</td>
                  <td>{rec.date}</td>
                  <td>{rec.status}</td>
                  <td>
                    {rec.punchInTime
                      ? new Date(rec.punchInTime).toLocaleTimeString()
                      : "-"}
                  </td>
                  <td>
                    {rec.punchOutTime
                      ? new Date(rec.punchOutTime).toLocaleTimeString()
                      : "-"}
                  </td>
                  <td>{rec.zoneName?.name || "-"}</td>

                  <td>
                    <div className="actions">
                      <button
                        className="button primaryBtn"
                        onClick={() => setEditRow(rec)}
                      >
                        Edit
                      </button>

                      <button
                        className="button warningBtn"
                        onClick={() => downloadCSV(rec._id)}
                      >
                        CSV
                      </button>

                      <button
                        className="button grayBtn"
                        onClick={() => downloadPDF(rec._id)}
                      >
                        PDF
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* MODAL */}
      {editRow && (
        <div className="modalOverlay">
          <div className="modal">
            <h2 className="modalTitle">Edit Attendance</h2>

            <input
              className="input"
              value={editRow.status || ""}
              onChange={(e) =>
                setEditRow({
                  ...editRow,
                  status: e.target.value,
                })
              }
            />

            <div className="modalActions">
              <button
                className="button successBtn"
                onClick={() =>
                  updateAttendance(editRow._id, editRow)
                }
              >
                Save
              </button>

              <button
                className="button dangerBtn"
                onClick={() => setEditRow(null)}
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}