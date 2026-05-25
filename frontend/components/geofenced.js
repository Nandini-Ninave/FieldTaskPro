"use client";

import {
  MapContainer,
  TileLayer,
  Marker,
  Circle,
  useMapEvents
} from "react-leaflet";

import {
  useState,
  useContext,
  useEffect
} from "react";

import axios from "axios";

import Ct from "../app/Ct";

import L from "leaflet";

import "leaflet/dist/leaflet.css";

delete L.Icon.Default.prototype._getIconUrl;

L.Icon.Default.mergeOptions({

  iconRetinaUrl:
    "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",

  iconUrl:
    "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",

  shadowUrl:
    "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png"
});

function LocationMarker({
  position,
  setPosition
}) {

  useMapEvents({

    click(e) {

      setPosition(e.latlng);
    }
  });

  return position
    ? <Marker position={position} />
    : null;
}

export default function GeoFenceMap() {

  const { state } =
    useContext(Ct);

  const [position, setPosition] =
    useState(null);

  const [radius, setRadius] =
    useState(100);

  const [name, setName] =
    useState("");

  const [organizations,
    setOrganizations] =
    useState([]);

  const [organizationId,
    setOrganizationId] =
    useState("");

  // LOAD ORGANIZATIONS

  useEffect(() => {

    fetchOrganizations();

  }, []);

  const fetchOrganizations =
    async () => {

      try {

        const res =
          await axios.get(
            "${process.env.NEXT_PUBLIC_API_URL}/admin/getOrganizations"
          );

        setOrganizations(
          res.data
        );

      } catch (err) {

        console.log(err);
      }
    };

  // CREATE ZONE

  const createZone = async () => {

    try {

      if (!position) {

        return alert(
          "Select location on map"
        );
      }

      if (!organizationId) {

        return alert(
          "Select organization"
        );
      }

      await axios.post(

        "${process.env.NEXT_PUBLIC_API_URL}/admin/create-zone",

        {
          name,
          organizationId,
          lat: position.lat,
          lng: position.lng,
          radius
        },

        {
          headers: {
            Authorization:
              `Bearer ${state.token}`
          }
        }
      );

      alert("Zone created");

      setName("");

      setRadius(100);

      setPosition(null);

      setOrganizationId("");

    } catch (err) {

      alert(
        err.response?.data?.message
      );
    }
  };

  return (

    <div>

      <input
        placeholder="Zone Name"
        value={name}
        onChange={(e) =>
          setName(e.target.value)
        }
      />

      <br />
      <br />

      {/* ORGANIZATION */}

      <select
        value={organizationId}
        onChange={(e) =>
          setOrganizationId(
            e.target.value
          )
        }
      >

        <option value="">
          Select Organization
        </option>

        {
          organizations.map((org) => (

            <option
              key={org._id}
              value={org._id}
            >
              {org.name}
            </option>
          ))
        }

      </select>

      <br />
      <br />

      {/* RADIUS */}

      <input
        type="range"
        min="50"
        max="5000"
        value={radius}
        onChange={(e) =>
          setRadius(e.target.value)
        }
      />

      <p>
        Radius: {radius} meters
      </p>

      {/* MAP */}

      <MapContainer
        center={[17.385044, 78.486671]}
        zoom={13}
        style={{
          height: "500px",
          width: "100%"
        }}
      >

        <TileLayer
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />

        <LocationMarker
          position={position}
          setPosition={setPosition}
        />

        {
          position && (

            <Circle
              center={position}
              radius={radius}
            />
          )
        }

      </MapContainer>

      <br />

      <button onClick={createZone}>
        Save Zone
      </button>

    </div>
  );
}