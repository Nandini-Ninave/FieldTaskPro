"use client";

import { useState, useEffect } from "react";
import axios from "axios";
import "./billing.css"
function Billing() {
  const [records, setRecords] = useState([]);
  const [subscriptions, setSubscriptions] = useState([]);

  const [subscription, setSubscription] = useState("");
  const [amount, setAmount] = useState("");
  const [paymentStatus, setPaymentStatus] = useState("PENDING");
  const [paymentDate, setPaymentDate] = useState("");

  const [editId, setEditId] = useState(null);

  // Fix 1: wrong URL — was pointing to getAllSubscriptions instead of getAllBillingRecords
  const loadRecords = async () => {
    const res = await axios.get("${process.env.NEXT_PUBLIC_API_URL}/admin/getAllBillingRecords");
    setRecords(res.data.data || []);
  };

  // Fix 2: loadSubscriptions was missing entirely
  const loadSubscriptions = async () => {
    const res = await axios.get("${process.env.NEXT_PUBLIC_API_URL}/admin/getAllSubscriptions");
    setSubscriptions(res.data.data || []);
  };

  const createRecord = async () => {
    await axios.post("${process.env.NEXT_PUBLIC_API_URL}/admin/createBillingRecord", {
      subscription,
      amount,
      paymentStatus,
      paymentDate,
    });
    resetForm();
    loadRecords();
  };

  const updateRecord = async () => {
    await axios.put(`${process.env.NEXT_PUBLIC_API_URL}/admin/updateBillingRecord/${editId}`, {
      subscription,
      amount,
      paymentStatus,
      paymentDate,
    });
    resetForm();
    loadRecords();
  };

  const deleteRecord = async (id) => {
    await axios.delete(`${process.env.NEXT_PUBLIC_API_URL}/admin/deleteBillingRecord/${id}`);
    loadRecords();
  };

  const editRecord = (record) => {
    setEditId(record._id);
    setSubscription(record.subscription?._id || record.subscription || "");
    setAmount(record.amount || "");
    setPaymentStatus(record.paymentStatus || "PENDING");
    // Fix 3: paymentDate was undefined when null, causing controlled/uncontrolled warning
    setPaymentDate(record.paymentDate ? record.paymentDate.slice(0, 10) : "");
  };

  const resetForm = () => {
    setSubscription("");
    setAmount("");
    setPaymentStatus("PENDING");
    setPaymentDate("");
    setEditId(null);
  };

  const subLabel = (sub) => {
    if (!sub) return "—";
    return `${sub.organization?.name || "?"} / ${sub.plan?.name || "?"}`;
  };

  // Fix 2: call loadSubscriptions on mount
  useEffect(() => {
    loadRecords();
    loadSubscriptions();
  }, []);

  return (
    <div>
      <h2>Billing</h2>

      <select value={subscription} onChange={(e) => setSubscription(e.target.value)}>
        <option value="">Select Subscription</option>
        {subscriptions.map((s) => (
          <option key={s._id} value={s._id}>
            {subLabel(s)}
          </option>
        ))}
      </select>

      <br />
      <br />

      <input
        type="number"
        placeholder="Amount"
        value={amount}
        onChange={(e) => setAmount(e.target.value)}
      />

      <br />
      <br />

      <select value={paymentStatus} onChange={(e) => setPaymentStatus(e.target.value)}>
        <option value="PENDING">PENDING</option>
        <option value="PAID">PAID</option>
        <option value="FAILED">FAILED</option>
      </select>

      <br />
      <br />

      <input
        type="date"
        value={paymentDate}
        onChange={(e) => setPaymentDate(e.target.value)}
      />

      <br />
      <br />

      {editId ? (
        <button onClick={updateRecord}>Update Record</button>
      ) : (
        <button onClick={createRecord}>Create Record</button>
      )}

      {editId && (
        <button onClick={resetForm} style={{ marginLeft: "10px" }}>
          Cancel
        </button>
      )}

      <hr />

      <ul>
        {records.map((r) => (
          <li key={r._id}>
            <h4>{r.invoiceId}</h4>
            <p>Subscription: {subLabel(r.subscription)}</p>
            <p>Amount: ₹{r.amount}</p>
            <p>Status: {r.paymentStatus}</p>
            <p>Payment Date: {r.paymentDate ? new Date(r.paymentDate).toLocaleDateString() : "—"}</p>

            <button onClick={() => editRecord(r)}>Edit</button>
            <button onClick={() => deleteRecord(r._id)} style={{ marginLeft: "10px" }}>
              Delete
            </button>

            <hr />
          </li>
        ))}
      </ul>
    </div>
  );
}

export default Billing;