"use client";

import { createContext, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
const Ct = createContext();

export const CtProvider = ({ children }) => {
  const router = useRouter();
  const [state, setState] = useState({
    token: "",
    _id: "",
    name: "",
    role: ""
  });

  // 🔥 AUTO LOGIN ON PAGE LOAD
  useEffect(() => {
    const token = localStorage.getItem("token");
    const name = localStorage.getItem("name");
    const role = localStorage.getItem("role");
    const _id = localStorage.getItem("_id");
    if (token) {
      setState({ token, name, role, _id });
    }
  }, []);

  const update = (data) => {
    setState((prev) => ({ ...prev, ...data }));

    // 🔥 SAVE TO LOCALSTORAGE
    if (data.token) {localStorage.setItem("token", data.token)};
     if (data._id) {localStorage.setItem("_id", data._id)}
    if (data.name) {localStorage.setItem("name", data.name)};
    if (data.role) {localStorage.setItem("role", data.role)};
  };

  const logout = () => {
    localStorage.clear();
    setState({ token: "", _id: "", name: "", role: "" });
    router.push("/login");
  };

  return (
    <Ct.Provider value={{ state, update, logout }}>
      {children}
    </Ct.Provider>
  );
};

export default Ct;