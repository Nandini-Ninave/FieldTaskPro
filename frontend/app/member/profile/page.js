"use client";

import axios from "axios";
import { useContext, useEffect, useState } from "react";
import Ct from "../../Ct";
import "./profile.css";

function Profile() {
  const { state } = useContext(Ct);
  const userId = state?._id;

  const [profile, setProfile] = useState(null);

  const getProfile = async () => {
    try {
      const res = await axios.get(
        `http://localhost:5000/member/profile/${userId}`
      );

      setProfile(res.data);
    } catch (error) {
      console.log(error);
    }
  };

  useEffect(() => {
    if (userId) {
      getProfile();
    }
  }, [userId]);

  return (
    <div className="page">

      <h1>Profile</h1>

      {profile && (
        <div className="card">

          <h2>Profile Details</h2>

          <p>
            Name: {profile.user.name}
          </p>

          <p>
            Email: {profile.user.email}
          </p>

          <p>
            Role: {profile.user.role}
          </p>

          <p>
            Attendance Mode: {profile.user.attendanceMode}
          </p>

        </div>
      )}

    </div>
  );
}

export default Profile;