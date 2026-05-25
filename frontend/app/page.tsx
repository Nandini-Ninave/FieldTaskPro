"use client";
import Link from "next/link";
import { useEffect, useState } from "react";
import axios from "axios";

export default function Home() {
  const [adminExists, setAdminExists] = useState(false);
  useEffect(() => {
    axios.get("${process.env.NEXT_PUBLIC_API_URL}/admin/check-admin").then((res)=>{
      setAdminExists(res.data.exists);
    }).catch ((err)=> {
      console.log(err);
    })
  }, []);
  return (
    <div className="min-h-screen flex justify-center items-center bg-gray-100">
      <div className="bg-white p-10 rounded-2xl shadow-xl w-[400px] text-center">
        <h1 className="text-4xl font-bold text-blue-700 mb-8">
          FieldTrack
        </h1>
        {
          adminExists ? (
            <Link href="/login" className="bg-green-600 text-white px-6 py-3 rounded-lg">Login</Link>) : (
              <Link href="/reg-admin" className="bg-blue-600 text-white px-6 py-3 rounded-lg">Register Admin</Link>
          )
        }
      </div>
    </div>
  );
}