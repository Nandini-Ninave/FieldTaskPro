  "use client";

  import "./user-management.css";
  import axios from "axios";
  import { useEffect, useState, useContext } from "react";
  import Ct from "../../Ct";

  export default function UserManagement() {
    const { state } = useContext(Ct);
    const token = state.token;
    const [users, setUsers] = useState([]);
    const [organizations, setOrganizations] = useState([]);
    const [zones, setZones] = useState([]);
    const [editId, setEditId] = useState("");
    const [formData, setFormData] =
      useState({
        name: "",
        email: "",
        password: "",
        role: "member",
        organizationId: "",
        attendanceMode: "A",
        gpsEnabled: true,
        locationConsent: false,
        assignedZones: [],
        shiftStart: "09:00",
        shiftEnd: "18:00",
        isActive: true,
      });



    // ====================================
    // LOAD DATA
    // ====================================

    useEffect(() => {

      fetchUsers();

      fetchOrganizations();

      fetchZones();

    }, []);



    // ====================================
    // USERS
    // ====================================

    const fetchUsers = async () => {

      try {

        const res = await axios.get(
          "http://localhost:5000/editor/users",
          {
            headers: {
              Authorization:
                `Bearer ${token}`,
            },
          }
        );

        setUsers(res.data);

      } catch (err) {

        console.log(err);
      }
    };



    // ====================================
    // ORGANIZATIONS
    // ====================================

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



    // ====================================
    // HANDLE INPUT
    // ====================================

    const handleChange = (e) => {

      const value =
        e.target.type === "checkbox"
          ? e.target.checked
          : e.target.value;

      setFormData({
        ...formData,
        [e.target.name]: value,
      });
    };

    const handleZoneChange = (e) => {

      const selectedZones = [...e.target.options]
        .filter((option) => option.selected)
        .map((option) => option.value);

      console.log(selectedZones);

      setFormData({
        ...formData,
        assignedZones: selectedZones,
      });
};



    // ====================================
    // ADD USER
    // ====================================

    const addUser = async () => {

      try {

        let payload = {
          ...formData,
        };

        // MODE B → REMOVE ZONES
        if (
          formData.attendanceMode ===
          "B"
        ) {
          payload.assignedZones = [];
        }

        await axios.post(
          "http://localhost:5000/editor/userReg",

          payload,

          {
            headers: {
              Authorization:
                `Bearer ${token}`,
            },
          }
        );

        fetchUsers();

        resetForm();

      } catch (err) {

        alert(
          err.response?.data?.message
        );
      }
    };



    // ====================================
    // DELETE USER
    // ====================================

    const deleteUser = async (id) => {

      try {

        await axios.delete(
          `http://localhost:5000/editor/delete-user/${id}`,
          {
            headers: {
              Authorization:
                `Bearer ${token}`,
            },
          }
        );

        fetchUsers();

      } catch (err) {

        console.log(err);
      }
    };



    // ====================================
    // EDIT USER
    // ====================================

    const editUser = (user) => {

      setEditId(user._id);

      setFormData({

        name: user.name,

        email: user.email,

        password: "",

        role: user.role,

        organizationId:
          user.organizationId?._id ||
          "",

        attendanceMode:
          user.attendanceMode,

        gpsEnabled:
          user.gpsEnabled,

        locationConsent:
          user.locationConsent,

        assignedZones:
          user.assignedZones?.map(
            (z) => z._id
          ) || [],

        shiftStart:
          user.shiftStart,

        shiftEnd:
          user.shiftEnd,

        isActive:
          user.isActive,
      });
    };



    // ====================================
    // UPDATE USER
    // ====================================

    const updateUser = async () => {

      try {

        let payload = {
          ...formData,
        };

        if (
          formData.attendanceMode ===
          "B"
        ) {
          payload.assignedZones = [];
        }

        await axios.put(
          `http://localhost:5000/editor/update-user/${editId}`,

          payload,

          {
            headers: {
              Authorization:
                `Bearer ${token}`,
            },
          }
        );

        fetchUsers();

        resetForm();

        setEditId("");

      } catch (err) {

        console.log(err);
      }
    };



    // ====================================
    // RESET FORM
    // ====================================

    const resetForm = () => {

      setFormData({

        name: "",

        email: "",

        password: "",

        role: "member",

        organizationId: "",

        attendanceMode: "A",

        gpsEnabled: true,

        locationConsent: false,

        assignedZones: [],

        shiftStart: "09:00",

        shiftEnd: "18:00",

        isActive: true,
      });
    };



    return (

      <div className="userPage">

        {/* FORM */}

        <div className="formBox">

          <h1>
            User Management
          </h1>



          <input
            type="text"
            name="name"
            placeholder="Name"
            value={formData.name}
            onChange={handleChange}
          />



          <input
            type="email"
            name="email"
            placeholder="Email"
            value={formData.email}
            onChange={handleChange}
          />



          {
            !editId && (

              <input
                type="password"
                name="password"
                placeholder="Password"
                value={formData.password}
                onChange={handleChange}
              />
            )
          }



          {/* ROLE */}

          <select
            name="role"
            value={formData.role}
            onChange={handleChange}
          >

            <option value="member">
              Member
            </option>

            <option value="editor">
              Editor
            </option>

          </select>



          {/* ORGANIZATION */}

          <select
            name="organizationId"
            value={
              formData.organizationId
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



          {/* ATTENDANCE MODE */}

          <select
            name="attendanceMode"
            value={
              formData.attendanceMode
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



         {/* ZONES ONLY FOR MODE A */}

{
  formData.attendanceMode === "A" && (

    <select
      multiple
      name="assignedZones"
      value={formData.assignedZones}
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
              String(formData.organizationId)
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

              {/* // </select> */}
            {/* ) */}
          {/* } */}



          {/* SHIFT */}

          <input
            type="time"
            name="shiftStart"
            value={formData.shiftStart}
            onChange={handleChange}
          />



          <input
            type="time"
            name="shiftEnd"
            value={formData.shiftEnd}
            onChange={handleChange}
          />



          {/* CHECKBOXES */}

          <div className="checkRow">

            <label>

              <input
                type="checkbox"
                name="gpsEnabled"
                checked={
                  formData.gpsEnabled
                }
                onChange={
                  handleChange
                }
              />

              GPS Enabled

            </label>



            <label>

              <input
                type="checkbox"
                name="locationConsent"
                checked={
                  formData.locationConsent
                }
                onChange={
                  handleChange
                }
              />

              Location Consent

            </label>



            <label>

              <input
                type="checkbox"
                name="isActive"
                checked={
                  formData.isActive
                }
                onChange={
                  handleChange
                }
              />

              Active

            </label>

          </div>



          {/* BUTTON */}

          {
            editId ? (

              <button
                onClick={
                  updateUser
                }
              >
                Update User
              </button>

            ) : (

              <button
                onClick={addUser}
              >
                Add User
              </button>
            )
          }

        </div>



        {/* TABLE */}

        <div className="tableBox">

          <table>

            <thead>

              <tr>

                <th>Name</th>

                <th>Email</th>

                <th>Role</th>

                <th>Organization</th>

                <th>Mode</th>

                <th>Zones</th>

                <th>Status</th>

                <th>Actions</th>

              </tr>

            </thead>

            <tbody>

              {
                users.map((user) => (

                  <tr key={user._id}>

                    <td>
                      {user.name}
                    </td>

                    <td>
                      {user.email}
                    </td>

                    <td>
                      {user.role}
                    </td>

                    <td>
                      {
                        user.organizationId?.name
                      }
                    </td>

                    <td>
                      {
                        user.attendanceMode
                      }
                    </td>

                    <td>

                      {
                        user.assignedZones
                          ?.map(
                            (z) => z.name
                          )
                          .join(", ")
                      }

                    </td>

                    <td>

                      {
                        user.isActive
                          ? "Active"
                          : "Inactive"
                      }

                    </td>

                    <td>

                      <button
                        className="editBtn"
                        onClick={() =>
                          editUser(user)
                        }
                      >
                        Edit
                      </button>

                      <button
                        className="deleteBtn"
                        onClick={() =>
                          deleteUser(
                            user._id
                          )
                        }
                      >
                        Delete
                      </button>

                    </td>

                  </tr>
                ))
              }

            </tbody>

          </table>

        </div>

      </div>
    );
  }