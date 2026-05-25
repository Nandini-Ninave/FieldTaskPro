"use client";
import { useState,  useContext, useEffect} from "react";
import axios from "axios"
import Ct from "../Ct";
import { useRouter } from "next/navigation";
export default function AdminRegister() {
   const router = useRouter();
    const { state } = useContext(Ct);
    const token = state.token;
  const [form, setForm] = useState({name: "", email: "", password: "", organizationId: "",
        attendanceMode: "A",
        gpsEnabled: true,
        locationConsent: false,
        assignedZones: [],
        shiftStart: "09:00",
        shiftEnd: "18:00",
        isActive: true,});
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
   const [organizations, setOrganizations] = useState([]);
    const [zones, setZones] = useState([]);
  useEffect(()=>{
      fetchOrganizations();
      fetchZones();
  },[])
   const fetchOrganizations =
      async () => {

        try {

          const res =
            await axios.get(
              "http://localhost:5000/admin/getOrganizations"
            );

          setOrganizations(
            res.data
          );

        } catch (err) {

          console.log(err);
        }
      };



    // ====================================
    // ZONES
    // ====================================

    const fetchZones = async () => {
      try {
        const res = await axios.get(
          "http://localhost:5000/admin/getzones"
        );
        setZones(res.data);
      } catch (err) {
        console.log(err);
      }
    };

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async () => {
  try {
    // console.log(state.token);
    const res = await axios.post(
      "http://localhost:5000/admin/adminreg",
      form,
      {
        headers: {
          Authorization: `Bearer ${state.token}`,
        },
      }
    );
    router.push("/login");
  } catch (err) {
    console.log(err)
  }
};
const handleZoneChange = (e) => {

      const selectedZones = [...e.target.options]
        .filter((option) => option.selected)
        .map((option) => option.value);

      console.log(selectedZones);

      setForm({
        ...form,
        assignedZones: selectedZones,
      });
};

  return (
    <div className="container">
      <h2>Admin Registration</h2>

      <form onSubmit={handleSubmit}>
        <input
          name="name"
          placeholder="Name"
          value={form.name}
          onChange={handleChange}
        />

        <input
          name="email"
          placeholder="Email"
          value={form.email}
          onChange={handleChange}
        />

        <input
          name="password"
          type="password"
          placeholder="Password"
          value={form.password}
          onChange={handleChange}
        />
        {/* ORGANIZATION */}

          <select
            name="organizationId"
            value={
              form.organizationId
            }
            onChange={handleChange}
          >

            <option value="">
              Select Organization
            </option>

            {
              organizations.map(
                (org) => (

                  <option
                    key={org._id}
                    value={org._id}
                  >
                    {org.name}
                  </option>
                )
              )
            }

          </select>
          <select
            name="attendanceMode"
            value={
              form.attendanceMode
            }
            onChange={handleChange}
          >

            <option value="A">
              Mode A
            </option>

            <option value="B">
              Mode B
            </option>

          </select>
          {
  form.attendanceMode === "A" && (

    <select
      multiple
      name="assignedZones"
      value={form.assignedZones}
      onChange={handleZoneChange}
      className="zoneSelect"
    >

      {
        zones
          .filter((z) => {

            const orgId =
              typeof z.organizationId === "object"
                ? z.organizationId._id
                : z.organizationId;

            return (
              String(orgId) ===
              String(form.organizationId)
            );
          })

          .map((zone) => (

            <option
              key={zone._id}
              value={zone._id}
            >
              {zone.name}
            </option>
          ))
      }

    </select>
  )
}
        <button type="submit" disabled={loading}>
          {loading ? "Creating..." : "Register Admin"}
        </button>
      </form>

      {message && <p>{message}</p>}

      <style jsx>{`
        .container {
          max-width: 400px;
          margin: 80px auto;
          padding: 25px;
          background: white;
          border-radius: 12px;
          box-shadow: 0 5px 20px rgba(0,0,0,0.1);
          color:black
        }

        h2 {
          text-align: center;
          margin-bottom: 20px;
        }

        input {
          width: 100%;
          padding: 10px;
          margin-bottom: 12px;
          border-radius: 8px;
          border: 1px solid #ccc;
        }

        button {
          width: 100%;
          padding: 10px;
          background: #4f46e5;
          color: white;
          border: none;
          border-radius: 8px;
          cursor: pointer;
        }

        button:disabled {
          background: gray;
        }

        p {
          text-align: center;
          margin-top: 10px;
        }
      `}</style>
    </div>
  );
}