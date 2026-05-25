"use client";

import { useContext, useEffect, useState } from "react";
import axios from "axios";
import Ct from "../../Ct";
import "./attendanceAdmin.css";

export default function AttendanceAdmin() {
  const { state } = useContext(Ct);
  const userId = state._id;
  const { token, role } = state;

  const [lat, setLat] = useState("");
  const [lng, setLng] = useState("");
  const [records, setRecords] = useState([]);
  const [loading, setLoading] = useState(false);
  const [editRow, setEditRow] = useState(null);
  const [summary, setSummary] = useState({
    present: 0,
    absent: 0,
    totalHours: 0,
  });

  const fetchAttendance = async () => {
    if (!token) return;

    setLoading(true);
    try {
      const res = await axios.get(`${process.env.NEXT_PUBLIC_API_URL}/admin/all`, {
        headers: { Authorization: `Bearer ${token}` },
      });

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
          totalMinutes += (new Date(hasOut) - new Date(hasIn)) / (1000 * 60);
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
    fetchAttendance();
  }, [token]);

  const updateAttendance = async (id, payload) => {
    try {
      await axios.put(
        `${process.env.NEXT_PUBLIC_API_URL}/admin/update/${id}`,
        payload,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      fetchAttendance();
      setEditRow(null);
    } catch (err) {
      console.log(err.message);
    }
  };

  const downloadCSV = (id) => {
    window.open(`${process.env.NEXT_PUBLIC_API_URL}/admin/attendance/csv/${id}`, "_blank");
  };

  const downloadPDF = (id) => {
    window.open(`${process.env.NEXT_PUBLIC_API_URL}/admin/attendance/pdf/${id}`, "_blank");
  };

  const punchIn = async () => {
    try {
      const res = await axios.post(`${process.env.NEXT_PUBLIC_API_URL}/member/punch`, {
        userId,
        action: "in",
        lat: Number(lat),
        lng: Number(lng),
      });
      alert(res.data.message);
    } catch (err) {
      alert(err.response?.data?.message);
    }
  };

  const punchOut = async () => {
    try {
      const res = await axios.post(`${process.env.NEXT_PUBLIC_API_URL}/member/punch`, {
        userId,
        action: "out",
        lat: Number(lat),
        lng: Number(lng),
      });
      alert(res.data.message);
    } catch (err) {
      alert(err.response?.data?.message);
    }
  };

  return (
    <div className="attendance-admin-page">
      <h1 className="attendance-admin-title">Admin Attendance Panel</h1>

      <div className="attendance-admin-summary">
        <div className="attendance-admin-card">✔ Present: {summary.present}</div>
        <div className="attendance-admin-card">❌ Absent: {summary.absent}</div>
        <div className="attendance-admin-card">⏱ Total Hours: {summary.totalHours}</div>
      </div>

      <div className="attendance-admin-inputs">
        <input value={lat} onChange={(e) => setLat(e.target.value)} placeholder="Latitude" />
        <input value={lng} onChange={(e) => setLng(e.target.value)} placeholder="Longitude" />
      </div>

      <div className="attendance-admin-actions">
        <button onClick={punchIn}>Punch In</button>
        <button onClick={punchOut}>Punch Out</button>
      </div>

      {loading ? (
        <p>Loading...</p>
      ) : (
        <div className="attendance-admin-table-wrap">
          <table className="attendance-admin-table">
            <thead>
              <tr>
                <th>Name</th>
                <th>Mode</th>
                <th>Date</th>
                <th>Status</th>
                <th>Punch In</th>
                <th>Punch Out</th>
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
                  <td>{rec.punchInTime ? new Date(rec.punchInTime).toLocaleTimeString() : "-"}</td>
                  <td>{rec.punchOutTime ? new Date(rec.punchOutTime).toLocaleTimeString() : "-"}</td>
                  <td>{rec.zoneName?.name || "-"}</td>

                  <td className="attendance-admin-actions-cell">
                    <button onClick={() => setEditRow(rec)}>Edit</button>
                    <button onClick={() => downloadCSV(rec._id)}>CSV</button>
                    <button onClick={() => downloadPDF(rec._id)}>PDF</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {editRow && (
        <div className="attendance-admin-modal">
          <h3>Edit Attendance</h3>

          <input
            value={editRow.status}
            onChange={(e) =>
              setEditRow({ ...editRow, status: e.target.value })
            }
          />

          <button onClick={() => updateAttendance(editRow._id, editRow)}>
            Save
          </button>

          <button onClick={() => setEditRow(null)}>Cancel</button>
        </div>
      )}
    </div>
  );
}