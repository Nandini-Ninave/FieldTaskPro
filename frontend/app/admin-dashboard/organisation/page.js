"use client";

import { useState, useEffect } from "react";
import axios from "axios";
import { useRouter } from "next/navigation";
import "./organization.css"

function Organization() {
  const router = useRouter();
  const [orgs, setOrgs] = useState([]);
  const [name, setName] = useState("");
  const [attendanceMode, setAttendanceMode] = useState("A");
  const [editId, setEditId] = useState(null);

  const loadOrgs = async () => {
    const res = await axios.get("http://localhost:5000/admin/getOrganizations");
    setOrgs(res.data);
  };

  const createOrg = async () => {
    await axios.post("http://localhost:5000/admin/createOrganization", {name, attendanceMode});
    resetForm();
    loadOrgs();
  };

  const updateOrg = async () => {
    await axios.put(`http://localhost:5000/admin/updateOrganization/${editId}`, {name, attendanceMode})
    resetForm();
    loadOrgs();
  };

  const deleteOrg = async (id) => {
    await axios.delete(`http://localhost:5000/admin/deleteOrganization/${id}`);
    loadOrgs();
  };

  const editOrg = (org) => {
    setEditId(org._id);
    setName(org.name);
    setAttendanceMode(org.attendanceMode);
  };

  const resetForm = () => {
    setName("");
    setAttendanceMode("A");
    setEditId(null);
  };

  useEffect(() => {
    loadOrgs();
  }, []);

  return (
    <div className="dashboard">
      <div className="sidebar">
        <h1 className="logo">FieldTrack</h1>
        <div className="menu">
          <p onClick={() => router.push("/admin-dashboard")}>Dashboard</p>
          <p onClick={() => router.push("/admin-dashboard/organisation")}>Organization</p>
          <p onClick={() => router.push("/admin-dashboard/user-management")}>User Management</p>
          <p onClick={() => router.push("/admin-dashboard/attendance")}>Attendance</p>
          <p onClick={() => router.push("/admin-dashboard/geo-fenced")}>Geo Fence</p>
          <p onClick={() => router.push("/admin-dashboard/live-tracking")}>Live Tracking</p>
          <p onClick={() => router.push("/admin-dashboard/audit")}>Audit Logs</p>
        </div>
      </div>

      <div className="main">
        <div className="topbar">
          <div>
            <h1>Organizations</h1>
            <p>Manage all organizations</p>
          </div>
          <div className="role">Admin</div>
        </div>

        <div>
          <div style={{ display: "flex", gap: "20px" }}>
            <p onClick={() => router.push("/admin-dashboard/organisation/plans")}>Plans</p>
            <p onClick={() => router.push("/admin-dashboard/organisation/subscription")}>Subscription</p>
            <p onClick={() => router.push("/admin-dashboard/organisation/billing")}>Billing</p>
          </div>
          <br />
          <input value={name} onChange={(e) => setName(e.target.value)} placeholder="Organization Name"/>
          <br /><br />
          <select value={attendanceMode} onChange={(e) => setAttendanceMode(e.target.value)}>
            <option value="A">A - Geo-fenced</option>
            <option value="B">B - Remote tracking</option>
          </select>
          <br /><br />
          {editId ? (
          <button className="btn update" onClick={updateOrg}>
            Update Organization
          </button>
        ) : (
          <button className="btn create" onClick={createOrg}>
            Create Organization
          </button>
        )}

        {editId && (
          <button className="btn cancel" onClick={resetForm}>
            Cancel
          </button>
        )}

        <hr className="divider" />

        <ul className="org-list">
          {orgs.map((o) => (
            <li key={o._id} className="org-item">
              <div className="org-info">
                <strong>{o.name}</strong>
                <span>Mode: {o.attendanceMode}</span>
              </div>

              <div className="org-actions">
                <button className="btn edit" onClick={() => editOrg(o)}>
                  Edit
                </button>
                <button className="btn delete" onClick={() => deleteOrg(o._id)}>
                  Delete
                </button>
              </div>
            </li>
          ))}
        </ul>
        </div>
      </div>
    </div>
  );
}

export default Organization;