"use client";

import { useState, useEffect } from "react";
import axios from "axios";
import "./subscription.css"
function Subscriptions() {
  const [subscriptions, setSubscriptions] = useState([]);
  const [organizations, setOrganizations] = useState([]);
  const [plans, setPlans] = useState([]);

  const [organization, setOrganization] = useState("");
  const [plan, setPlan] = useState("");
  const [status, setStatus] = useState("TRIAL");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [autoRenew, setAutoRenew] = useState(true);

  const [editId, setEditId] = useState(null);

  const loadSubscriptions = async () => {
    const res = await axios.get("http://localhost:5000/admin/getAllSubscriptions");
    setSubscriptions(res.data.data);
  };

  const loadOrganizations = async () => {
    const res = await axios.get("http://localhost:5000/admin/getOrganizations");
    setOrganizations(res.data);
  };

  const loadPlans = async () => {
    const res = await axios.get("http://localhost:5000/admin/getAllPlans");
    setPlans(res.data.data);
  };

  const createSubscription = async () => {
    await axios.post("http://localhost:5000/admin/createSubscription", {
      organization,
      plan,
      status,
      startDate,
      endDate,
      autoRenew,
    });
    resetForm();
    loadSubscriptions();
  };

  const updateSubscription = async () => {
    await axios.put(`http://localhost:5000/admin/updateSubscription/${editId}`, {
      organization,
      plan,
      status,
      startDate,
      endDate,
      autoRenew,
    });
    resetForm();
    loadSubscriptions();
  };

  const deleteSubscription = async (id) => {
    await axios.delete(`http://localhost:5000/admin/deleteSubscription/${id}`);
    loadSubscriptions();
  };

  const editSubscription = (sub) => {
    setEditId(sub._id);
    setOrganization(sub.organization?._id || sub.organization);
    setPlan(sub.plan?._id || sub.plan);
    setStatus(sub.status);
    setStartDate(sub.startDate ? sub.startDate.slice(0, 10) : "");
    setEndDate(sub.endDate ? sub.endDate.slice(0, 10) : "");
    setAutoRenew(sub.autoRenew);
  };

  const resetForm = () => {
    setOrganization("");
    setPlan("");
    setStatus("TRIAL");
    setStartDate("");
    setEndDate("");
    setAutoRenew(true);
    setEditId(null);
  };

  useEffect(() => {
    loadSubscriptions();
    loadOrganizations();
    loadPlans();
  }, []);

  return (
    <div>
      <h2>Subscriptions</h2>

      <select value={organization} onChange={(e) => setOrganization(e.target.value)}>
        <option value="">Select Organization</option>
        {organizations.map((o) => (
          <option key={o._id} value={o._id}>
            {o.name}
          </option>
        ))}
      </select>

      <br />
      <br />

      <select value={plan} onChange={(e) => setPlan(e.target.value)}>
        <option value="">Select Plan</option>
        {plans.map((p) => (
          <option key={p._id} value={p._id}>
            {p.name} — ₹{p.pricePerMonth}/mo
          </option>
        ))}
      </select>

      <br />
      <br />

      <select value={status} onChange={(e) => setStatus(e.target.value)}>
        <option value="TRIAL">TRIAL</option>
        <option value="ACTIVE">ACTIVE</option>
        <option value="EXPIRED">EXPIRED</option>
        <option value="CANCELLED">CANCELLED</option>
      </select>

      <br />
      <br />

      <input
        type="date"
        placeholder="Start Date"
        value={startDate}
        onChange={(e) => setStartDate(e.target.value)}
      />

      <br />
      <br />

      <input
        type="date"
        placeholder="End Date"
        value={endDate}
        onChange={(e) => setEndDate(e.target.value)}
      />

      <br />
      <br />

      <label>
        <input
          type="checkbox"
          checked={autoRenew}
          onChange={(e) => setAutoRenew(e.target.checked)}
        />
        {" "}Auto Renew
      </label>

      <br />
      <br />

      {editId ? (
        <button onClick={updateSubscription}>Update Subscription</button>
      ) : (
        <button onClick={createSubscription}>Create Subscription</button>
      )}

      {editId && (
        <button onClick={resetForm} style={{ marginLeft: "10px" }}>
          Cancel
        </button>
      )}

      <hr />

      <ul>
        {subscriptions.map((s) => (
          <li key={s._id}>
            <h4>{s.organization?.name}</h4>
            <p>Plan: {s.plan?.name}</p>
            <p>Status: {s.status}</p>
            <p>Start Date: {s.startDate ? new Date(s.startDate).toLocaleDateString() : "—"}</p>
            <p>End Date: {s.endDate ? new Date(s.endDate).toLocaleDateString() : "—"}</p>
            <p>Auto Renew: {s.autoRenew ? "Yes" : "No"}</p>

            <button onClick={() => editSubscription(s)}>Edit</button>
            <button onClick={() => deleteSubscription(s._id)} style={{ marginLeft: "10px" }}>
              Delete
            </button>

            <hr />
          </li>
        ))}
      </ul>
    </div>
  );
}

export default Subscriptions;