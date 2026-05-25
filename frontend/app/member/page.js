"use client";

import Link from "next/link";
import { useContext } from "react";
import Ct from "../Ct";
import "./member.css";

const navItems = [
  { href: "/member", label: "Dashboard", icon: "🏠" },
  { href: "/member/profile", label: "Profile", icon: "👤" },
  { href: "/member/attendance", label: "Attendance", icon: "📋" },
  { href: "/member/logs", label: "Logs", icon: "📜" },
  { href: "/member/location", label: "Live Location", icon: "📍" },
];

function Sidebar() {
  const { logout } = useContext(Ct);

  return (
    <aside className="sidebar">

      <h2 className="logo">Member Panel</h2>

      <div className="nav">
        {navItems.map((item) => (
          <Link key={item.href} href={item.href} className="navLink">
            {item.icon} {item.label}
          </Link>
        ))}
      </div>

      <button className="logoutBtn" onClick={logout}>
        Logout
      </button>

    </aside>
  );
}

export default function MemberDashboard() {
  return (
    <div className="layout">

      <Sidebar />

      <main className="main">

        <div className="header">
          <h1 className="title">Member Dashboard</h1>
          <p className="subtitle">Welcome 👋 Track everything in one place</p>
        </div>

        <div className="grid">

          <Link href="/member/profile" className="card">
            <div className="cardTop">
              <span className="icon">👤</span>
              <span className="arrow">→</span>
            </div>
            <h3 className="cardTitle">Profile</h3>
            <p className="cardText">View your details</p>
          </Link>

          <Link href="/member/attendance" className="card">
            <div className="cardTop">
              <span className="icon">📋</span>
              <span className="arrow">→</span>
            </div>
            <h3 className="cardTitle">Attendance</h3>
            <p className="cardText">Check punch history</p>
          </Link>

          <Link href="/member/logs" className="card">
            <div className="cardTop">
              <span className="icon">📜</span>
              <span className="arrow">→</span>
            </div>
            <h3 className="cardTitle">Logs</h3>
            <p className="cardText">Audit activity</p>
          </Link>

          <Link href="/member/locations" className="card">
            <div className="cardTop">
              <span className="icon">📍</span>
              <span className="arrow">→</span>
            </div>
            <h3 className="cardTitle">Live Location</h3>
            <p className="cardText">Track movement</p>
          </Link>
        </div>
      </main>
    </div>
  );
}