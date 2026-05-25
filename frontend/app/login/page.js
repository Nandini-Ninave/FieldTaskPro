"use client";
import { useState,useContext } from "react";
import axios from "axios";
import { useRouter } from "next/navigation";
import Ct from "../Ct";
export default function Login() {
  const router = useRouter();
  const { update } = useContext(Ct);
  const [formData, setFormData] = useState({email: "", password: ""});
  const handleChange = (e) => {
    setFormData({...formData, [e.target.name]: e.target.value})
  }
  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await axios.post(`${process.env.NEXT_PUBLIC_API_URL}/admin/login`, {email: formData.email, password:formData.password});
      update(res.data);
      if (res.data.role === "admin") {
        router.push("/admin-dashboard");
      } else if (
        res.data.role === "editor"
      ) {
        router.push("/editor-dashboard");
      } else {
        router.push("/member");
      }
    }
    catch (err) {
      alert(err.response?.data?.message)
    }
  };

  return (
    <div className="min-h-screen flex justify-center items-center bg-gray-100">
      <form onSubmit={handleSubmit} className="bg-white p-8 rounded-2xl shadow-xl w-[400px] space-y-4">
        <h1 className="text-3xl font-bold text-center text-blue-700">Login</h1>
        <input type="email" name="email" placeholder="Enter Email" className="w-full border p-3 rounded-lg text-blue-700" onChange={handleChange}/>
        <input type="password" name="password" placeholder="Enter Password" className="w-full border p-3 rounded-lg text-blue-700" onChange={handleChange}/>
        <button className="w-full bg-blue-600 text-white py-3 rounded-lg"> Login</button>
      </form>
    </div>
  );
}