"use client";

import "./admin.css";
import { useRouter } from "next/navigation";

export default function AdminDashboard() {
const router = useRouter();
  return (
    <div className="dashboard">
      <div className="sidebar">
        <h1 className="logo">
          FieldTrack
        </h1>
        <div className="menu">
          <p>Dashboard</p>
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
            <h1>Admin Dashboard</h1>
            <p>Welcome Admin</p>
          </div>
          <div className="role">Admin</div>
        </div>
        
        <div className="maincards">
          <div className="card" onClick={() => router.push("/admin-dashboard/organisation")}>
            <h2>Organization</h2>
            <p>Create & manage organization</p>
          </div>
          <div className="maincard" onClick={() => router.push("/admin-dashboard/user-management")}>
            <h2>User Management</h2>
            <p>Create Editors & Members</p>
          </div>
          <div className="maincard" onClick={() => router.push("/admin-dashboard/attendance")}>
            <h2>Attendance</h2>
            <p>Manage attendance system</p>
          </div>
          <div className="maincard" onClick={() => router.push("/admin-dashboard/geo-fenced")}>
            <h2>Geo Fence</h2>
            <p>Configure geo-fence zones</p>
          </div>
          <div className="maincard">
            <h2>Live Tracking</h2>
            <p>Track employees in real time</p>
          </div>
        </div>
      </div>
    </div>
  );
}