"use client";

import { useState, useEffect } from "react";
import axios from "axios";
import "./plan.css"
function Plans() {
  const [plans, setPlans] = useState([]);
  const [name, setName] = useState("");
  const [pricePerMonth, setPricePerMonth] = useState("");
  const [maxUsers, setMaxUsers] = useState("");
  const [description, setDescription] = useState("");

  const [editId, setEditId] = useState(null);

  const loadPlans = async () => {
    const res = await axios.get(
      `${process.env.NEXT_PUBLIC_API_URL}/admin/getAllPlans`
    );

    setPlans(res.data.data);
  };

  const createPlan = async () => {
    await axios.post(
      `${process.env.NEXT_PUBLIC_API_URL}/admin/createPlan`,
      {
        name,
        pricePerMonth,
        maxUsers,
        description,
      }
    );

    resetForm();
    loadPlans();
  };

  const updatePlan = async () => {
    await axios.put(
      `${process.env.NEXT_PUBLIC_API_URL}/admin/updatePlan/${editId}`,
      {
        name,
        pricePerMonth,
        maxUsers,
        description,
      }
    );

    resetForm();
    loadPlans();
  };

  const deletePlan = async (id) => {
    await axios.delete(
      `${process.env.NEXT_PUBLIC_API_URL}/admin/deletePlan/${id}`
    );

    loadPlans();
  };

  const editPlan = (plan) => {
    setEditId(plan._id);
    setName(plan.name);
    setPricePerMonth(plan.pricePerMonth);
    setMaxUsers(plan.maxUsers);
    setDescription(plan.description || "");
  };

  const resetForm = () => {
    setName("");
    setPricePerMonth("");
    setMaxUsers("");
    setDescription("");
    setEditId(null);
  };

  useEffect(() => {
    loadPlans();
  }, []);

  return (
    <div>
      <h2>Plans</h2>

      <input
        type="text"
        placeholder="Plan Name"
        value={name}
        onChange={(e) => setName(e.target.value)}
      />

      <br />
      <br />

      <input
        type="number"
        placeholder="Price Per Month"
        value={pricePerMonth}
        onChange={(e) =>
          setPricePerMonth(e.target.value)
        }
      />

      <br />
      <br />

      <input
        type="number"
        placeholder="Max Users"
        value={maxUsers}
        onChange={(e) => setMaxUsers(e.target.value)}
      />

      <br />
      <br />

      <textarea
        placeholder="Description"
        value={description}
        onChange={(e) =>
          setDescription(e.target.value)
        }
      />

      <br />
      <br />

      {editId ? (
        <button onClick={updatePlan}>
          Update Plan
        </button>
      ) : (
        <button onClick={createPlan}>
          Create Plan
        </button>
      )}

      {editId && (
        <button
          onClick={resetForm}
          style={{ marginLeft: "10px" }}
        >
          Cancel
        </button>
      )}

      <hr />

      <ul>
        {plans.map((p) => (
          <li key={p._id}>
            <h4>{p.name}</h4>

            <p>
              Price: {p.pricePerMonth}
            </p>

            <p>
              Max Users: {p.maxUsers}
            </p>

            <p>
              Description: {p.description}
            </p>

            <button onClick={() => editPlan(p)}>
              Edit
            </button>

            <button
              onClick={() => deletePlan(p._id)}
              style={{ marginLeft: "10px" }}
            >
              Delete
            </button>

            <hr />
          </li>
        ))}
      </ul>
    </div>
  );
}

export default Plans;