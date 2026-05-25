"use client";

import axios from "axios";
import { useContext, useEffect, useState } from "react";
import Ct from "../../Ct";
import "./attendance.css";
function Attendance() {
    const { state } = useContext(Ct);
    const userId = state?._id;
    const [attendance, setAttendance] = useState([]);
    const [locations, setLocations] = useState([]);
    const [shiftReminder, setShiftReminder] = useState("");
    const [punchReminder, setPunchReminder] = useState("");
    const [activeSession, setActiveSession] = useState(null);
    const [summary, setSummary] = useState(null);
    const [message, setMessage] = useState("");
    const [lat, setLat] = useState("");
    const [lng, setLng] = useState("");
    const getLocationHistory =
    async () => {
      try {
        const res = await axios.get(`${process.env.NEXT_PUBLIC_API_URL}/member/locationHistory/${userId}`);
        setLocations(res.data);
      } catch (error) {
        console.log(error);
      }
    };
    const getAttendance = async () => {
    try {
        const res = await axios.get(`${process.env.NEXT_PUBLIC_API_URL}/member/attendance/${userId}`);
        setAttendance(res.data);
    } catch (error) {
        console.log(error);
    }
    };

    const getSummary = async () => {
    try {
      const res = await axios.get(`${process.env.NEXT_PUBLIC_API_URL}/member/attendanceSummary/${userId}`);
      setSummary(res.data);
    } catch (error) {
      console.log(error);
    }
  };
  const getShiftReminder =
    async () => {
      try {
        const res = await axios.get(`${process.env.NEXT_PUBLIC_API_URL}/member/shiftReminder/${userId}`)
        setShiftReminder(res.data.message)
      } catch (error) {
        console.log(error);
      }
    };

  const getPunchReminder =
    async () => {
      try {
        const res = await axios.get(`${process.env.NEXT_PUBLIC_API_URL}/member/punchOutReminder/${userId}`)
        setPunchReminder(res.data.message)
      } catch (error) {
        console.log(error);
      }
    };
  const getActiveSession =
    async () => {
      try {
        const res = await axios.get(`${process.env.NEXT_PUBLIC_API_URL}/member/attendance/active/${userId}`);
        setActiveSession(res.data.attendance)
      } catch (error) {
        console.log(error);
      }
    };
    const getCurrentLocation = () => {
        navigator.geolocation.getCurrentPosition(
        (position) => {
            setLat(position.coords.latitude);
            setLng(position.coords.longitude);
        },
        (error) => {
            console.log(error);
        }
        );
    };
  const sendLocation = () => {
    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const lat = position.coords.latitude;
        const lng = position.coords.longitude;
        try {
          const res =
            await axios.post(`${process.env.NEXT_PUBLIC_API_URL}/member/attendance/location-ping`,
              {
                userId,
                lat,
                lng,
              }
            );
          setMessage(res.data.message)
          alert("send")
        } catch (error) {
          console.log(error)
        }
      }
    );
  };

  const punchIn = async () => {
    try {
      const res = await axios.post(`${process.env.NEXT_PUBLIC_API_URL}/member/punch`,
        {
          userId,
          action: "in",
          lat: Number(lat),
          lng: Number(lng),
        }
      )
      alert(res.data.message);
      getActiveSession();
      sendLocation();
    } catch (err) {
      console.log(err.response?.data)
      alert(err.response?.data?.message)
    }
  };

  const punchOut = async () => {
    try {
      const res = await axios.post(`${process.env.NEXT_PUBLIC_API_URL}/member/punch`,
        {
          userId,
          action: "out",
          lat: Number(lat),
          lng: Number(lng),
        }
      )
      alert(res.data.message)
      setActiveSession(null);
    } catch (err) {
      console.log(err.response?.data)
      alert(err.response?.data?.message)
    }
  };

  useEffect(() => {
    if (!userId) return;
    getActiveSession();
    // getLocationHistory()
    const interval =
  setInterval(() => {
    if (activeSession) {
      sendLocation();
    }
  }, 5000);
    return () =>
      clearInterval(interval);
  }, [userId]);


return(
    <div className="container">

      <h1>
        Member Dashboard
      </h1>

      {/* LIVE TRACKING */}

      {
        activeSession && (

          <div className="card">

            <h2>
              Live Tracking
            </h2>

            <p>
              Status:
              {activeSession.status}
            </p>

            <p>
              Mode:
              {activeSession.mode}
            </p>

            <p>
              {message}
            </p>

            <button
              onClick={sendLocation}
            >
              Send Current Location
            </button>
           

          </div>
        )
      }

      <input
        type="text"
        placeholder="Latitude"
        value={lat}
        onChange={(e) =>
          setLat(e.target.value)
        }
      />

      <input
        type="text"
        placeholder="Longitude"
        value={lng}
        onChange={(e) =>
          setLng(e.target.value)
        }
      />

      <div className="buttonBox">

        <button onClick={getCurrentLocation}>
          Get Current Location
        </button>

        <button onClick={punchIn}>
          Punch In
        </button>

        <button onClick={punchOut}>
          Punch Out
        </button>

        <button onClick={getAttendance}>
          Attendance
        </button>

         <button
              onClick={getLocationHistory}
            >
              get Location History
            </button>
        <button onClick={getSummary}>
          Summary
        </button>

        <button
          onClick={
            getShiftReminder
          }
        >
          Shift Reminder
        </button>

        <button
          onClick={
            getPunchReminder
          }
        >
          Punch Reminder
        </button>

      </div>
      {
        summary && (

          <div className="card">

            <h2>
              Attendance Summary
            </h2>

            <p>
              Total Days:
              {
                summary.totalDays
              }
            </p>

            <p>
              Present Days:
              {
                summary.presentDays
              }
            </p>

            <p>
              Total Minutes:
              {
                summary.totalMinutes
              }
            </p>

          </div>
        )
      }
        {
          locations.map((loc, i) => (
            <div
              key={i}
              className="card"
            >
                <h2>
              Location History
            </h2>
              <p>
                Date:
                {loc.date}
              </p>

              {
                loc.breadcrumb.map(
                  (b, index) => (

                    <div
                      key={index}
                    >

                      <p>
                        Lat:
                        {b.lat}
                      </p>

                      <p>
                        Lng:
                        {b.lng}
                      </p>

                    </div>
                  )
                )
              }
            </div>
          ))
        }
      {/* SHIFT */}

      {
        shiftReminder && (

          <div className="card">

            <h2>
              Shift Reminder
            </h2>

            <p>
              {
                shiftReminder
              }
            </p>

          </div>
        )
      }

      {/* PUNCH REMINDER */}

      {
        punchReminder && (

          <div className="card">

            <h2>
              Punch Reminder
            </h2>

            <p>
              {
                punchReminder
              }
            </p>

          </div>
        )
      }

      {/* ATTENDANCE */}

      <div className="card">

        <h2>
          Attendance Records
        </h2>

        {
          attendance.map((a) => (

            <div
              key={a._id}
              className="item"
            >

              <p>
                Date:
                {a.date}
              </p>

              <p>
                Status:
                {a.status}
              </p>

              <p>
                Duration:
                {a.duration}
              </p>

            </div>
          ))
        }

      </div>
      </div>
)
}
export default Attendance