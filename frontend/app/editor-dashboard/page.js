"use client";

const { useState, useEffect, useContext } = require("react");
const Link = require("next/link");
const axios = require("axios");
import Ct from "../Ct";
import "./dashboard.css";

/* DATA */

const navItems = [
  { href: "/editor-dashboard", label: "Dashboard", icon: "🏠" },
  { href: "/editor-dashboard/user-management", label: "User Management", icon: "👥" },
  { href: "/editor-dashboard/attendance", label: "Attendance", icon: "📋" },
  { href: "/editor-dashboard/live-map", label: "Live Tracking", icon: "🗺️" },
];

/* SIDEBAR */

function Sidebar() {
  const { logout } = useContext(Ct);

  return (
    <aside className="sidebar">

      <h2 className="logo">FieldTrack</h2>

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

/* MAIN */

export default function EditorDashboard() {

  return (
    <div className="layout">

      <Sidebar />

      <main className="main">

        {/* HEADER */}
        <div className="header">
          <h1 className="title">Editor Dashboard</h1>
          <p className="subtitle">Welcome back 👋</p>
        </div>

        {/* CARDS */}
        <div className="grid">

          {navItems.map((item) => (
            <Link key={item.href} href={item.href} className="card">

              <div className="cardTop">
                <span className="icon">{item.icon}</span>
                <span className="arrow">→</span>
              </div>

              <h3 className="cardTitle">{item.label}</h3>

              <p className="cardText">
                Open {item.label} section
              </p>

            </Link>
          ))}

        </div>

      </main>

    </div>
  );
}