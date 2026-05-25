"use client";

import dynamic from "next/dynamic";
const GeoFenceMap = dynamic(
  () => import("../../../components/geofenced"),{ssr: false}
)
export default function Page() {
  return <GeoFenceMap />;
}