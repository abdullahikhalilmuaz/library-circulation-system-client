import React, { useState } from "react";
import "../styles/login.css";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";

const BASE_ADMIN_API_URL =
  "https://circulation-system-server-1.onrender.com/api/admin/auth/login";

export default function AdminLogin() {
  const [adminLogin, setAdminLogin] = useState({
    email: "",
    password: "",
  });
  const navigate = useNavigate();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setAdminLogin((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleFormLogin = async (e) => {
    e.preventDefault();

    if (!adminLogin.email || !adminLogin.password) {
      toast.error("Please enter both email and password");
      return;
    }

    try {
      const response = await fetch(BASE_ADMIN_API_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(adminLogin),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Admin login failed");
      }

      // Store admin data in localStorage
      localStorage.setItem("dear-user", JSON.stringify(data.admin));
      localStorage.setItem("user-role", "admin"); // Add role for easy checking

      toast.success(data.message || "Admin login successful!");
      navigate("/home");
    } catch (err) {
      toast.error(err.message);
    }
  };

  return (
    <div className="home admin-form">
      <div className="container">
        <form className="myform" onSubmit={handleFormLogin}>
          <h3>
            Admin Login <em>👋</em>
          </h3>
          <div>
            <input
              type="email"
              name="email"
              placeholder="Admin Email"
              value={adminLogin.email}
              onChange={handleChange}
              required
            />
            <input
              type="password"
              name="password"
              placeholder="Admin Password"
              value={adminLogin.password}
              onChange={handleChange}
              required
            />
            <button type="submit">Login</button>
          </div>
        </form>
      </div>
    </div>
  );
}
