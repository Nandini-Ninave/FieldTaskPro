"use client";

import dynamic from "next/dynamic";

import {
  useEffect,
  useState,
  useContext,
} from "react";

import axios from "axios";

import Ct from "../../Ct";

import "leaflet/dist/leaflet.css";

// ===================================
// DYNAMIC IMPORTS
// ===================================

const MapContainer = dynamic(
  () =>
    import("react-leaflet").then(
      (mod) => mod.MapContainer
    ),
  {
    ssr: false,
  }
);

const TileLayer = dynamic(
  () =>
    import("react-leaflet").then(
      (mod) => mod.TileLayer
    ),
  {
    ssr: false,
  }
);

const Marker = dynamic(
  () =>
    import("react-leaflet").then(
      (mod) => mod.Marker
    ),
  {
    ssr: false,
  }
);

const Popup = dynamic(
  () =>
    import("react-leaflet").then(
      (mod) => mod.Popup
    ),
  {
    ssr: false,
  }
);

const Polyline = dynamic(
  () =>
    import("react-leaflet").then(
      (mod) => mod.Polyline
    ),
  {
    ssr: false,
  }
);

export default function LiveTracking() {

  // ===================================
  // CONTEXT
  // ===================================

  const { state } =
    useContext(Ct);

  const organizationId =
    state?.organizationId?._id ||
    state?.organizationId;

  // ===================================
  // STATES
  // ===================================

  const [employees,
    setEmployees] =
    useState([]);

  const [selectedTrack,
    setSelectedTrack] =
    useState([]);

  const [mounted,
    setMounted] =
    useState(false);

  // ===================================
  // FIX LEAFLET
  // ===================================

  useEffect(() => {

    setMounted(true);

    const fixLeafletIcon =
      async () => {

        const L =
          await import("leaflet");

        delete
          L.Icon.Default.prototype
            ._getIconUrl;

        L.Icon.Default.mergeOptions({

          iconRetinaUrl:
            "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",

          iconUrl:
            "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",

          shadowUrl:
            "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
        });
      };

    fixLeafletIcon();

  }, []);

  // ===================================
  // FETCH LIVE EMPLOYEES
  // ===================================

  const fetchLocations =
    async () => {

      try {

        if (!organizationId)
          return;

        const res =
          await axios.get(
            `${process.env.NEXT_PUBLIC_API_URL}/admin/live/${organizationId}`
          );

        console.log(
          "EMPLOYEES",
          res.data
        );

        setEmployees(
          res.data.employees || []
        );

      } catch (error) {

        console.log(
          "LIVE ERROR",
          error
        );
      }
    };

  // ===================================
  // FETCH TRACK
  // ===================================

  const getTrack =
    async (attendanceId) => {

      try {

        const res =
          await axios.get(
            `${process.env.NEXT_PUBLIC_API_URL}/admin/track/${attendanceId}`
          );

        console.log(
          "TRACK",
          res.data
        );

        setSelectedTrack(
          res.data.breadcrumb || []
        );

      } catch (error) {

        console.log(error);
      }
    };

  // ===================================
  // AUTO REFRESH
  // ===================================

  useEffect(() => {

    fetchLocations();

    const interval =
      setInterval(() => {

        fetchLocations();

      }, 5000);

    return () =>
      clearInterval(interval);

  }, [organizationId]);

  // ===================================
  // PREVENT SSR ISSUE
  // ===================================

  if (!mounted) {
    return null;
  }

  return (

    <div
      style={{
        height: "100vh",
        width: "100%",
      }}
    >

      <MapContainer
        center={[17.4380, 78.4472]}
        zoom={14}
        style={{
          height: "100%",
          width: "100%",
        }}
      >

        {/* MAP TILE */}

        <TileLayer
          attribution='&copy; OpenStreetMap contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />

        {/* LIVE EMPLOYEES */}

        {
          employees.map((emp) => {

            console.log(
              "EMP",
              emp
            );

            const lat =
              parseFloat(
                emp?.currentLocation?.lat
              );

            const lng =
              parseFloat(
                emp?.currentLocation?.lng
              );

            // INVALID LOCATION

            if (
              isNaN(lat) ||
              isNaN(lng)
            ) {
              return null;
            }

            return (

              <Marker
                key={emp._id}

                position={[
                  lat,
                  lng,
                ]}

                eventHandlers={{
                  click: () =>
                    getTrack(
                      emp._id
                    ),
                }}
              >

                <Popup>

                  <div>

                    <h3>
                      {
                        emp.userId?.name
                      }
                    </h3>

                    <p>
                      {
                        emp.userId?.email
                      }
                    </p>

                    <p>
                      Status:
                      {" "}
                      {
                        emp.status
                      }
                    </p>

                    <p>
                      Mode:
                      {" "}
                      {
                        emp.mode
                      }
                    </p>

                    <p>
                      Lat:
                      {" "}
                      {lat}
                    </p>

                    <p>
                      Lng:
                      {" "}
                      {lng}
                    </p>

                    <button

                      onClick={() =>
                        getTrack(
                          emp._id
                        )
                      }

                      style={{
                        padding:
                          "8px 12px",

                        background:
                          "#000f2a",

                        color:
                          "white",

                        border:
                          "none",

                        borderRadius:
                          "8px",

                        cursor:
                          "pointer",
                      }}
                    >

                      View Track

                    </button>

                  </div>

                </Popup>

              </Marker>
            );
          })
        }

        {/* TRACK LINE */}

        {
          selectedTrack.length > 0 && (

            <Polyline

              positions={

                selectedTrack

                  .filter(
                    (loc) =>

                      !isNaN(
                        parseFloat(
                          loc.lat
                        )
                      ) &&

                      !isNaN(
                        parseFloat(
                          loc.lng
                        )
                      )
                  )

                  .map((loc) => ([

                    parseFloat(
                      loc.lat
                    ),

                    parseFloat(
                      loc.lng
                    ),
                  ]))
              }

              pathOptions={{
                color: "blue",
              }}

            />
          )
        }

      </MapContainer>

    </div>
  );
}