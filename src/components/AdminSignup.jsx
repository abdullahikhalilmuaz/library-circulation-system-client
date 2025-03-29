import React, { useState } from "react";
import "../styles/login.css";
import { toast } from "react-toastify";

const BASE_ADMIN_API_URL =
  "https://circulation-system-server-ql2i.onrender.com/api/admin/auth/signup";

export default function AdminSignup() {
  const [adminSignup, setAdminSignup] = useState({
    firstname: "",
    lastname: "",
    username: "",
    email: "",
    password: "",
    confirmPassword: "",
    role: "admin", // Force admin role
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setAdminSignup((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleFormSignup = async (e) => {
    e.preventDefault();

    if (adminSignup.password !== adminSignup.confirmPassword) {
      toast.error("Passwords don't match!");
      return;
    }

    try {
      const { confirmPassword, ...adminData } = adminSignup;
      const res = await fetch(BASE_ADMIN_API_URL, {
        headers: {
          "Content-Type": "application/json",
        },
        method: "POST",
        body: JSON.stringify(adminData),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.message || "Admin registration failed");
      }

      toast.success(data.message || "Admin registered successfully!");

      // Clear form
      setAdminSignup({
        firstname: "",
        lastname: "",
        username: "",
        email: "",
        password: "",
        confirmPassword: "",
        role: "admin",
      });
    } catch (err) {
      toast.error(err.message);
    }
  };

  return (
    <div className="home admin-form">
      <div className="container">
        <form className="myform" onSubmit={handleFormSignup}>
          <h3>
            Admin Registration <em>👋</em>
          </h3>
          <div>
            <input
              type="text"
              name="firstname"
              placeholder="First Name"
              value={adminSignup.firstname}
              onChange={handleChange}
              required
            />
            <input
              type="text"
              name="lastname"
              placeholder="Last Name"
              value={adminSignup.lastname}
              onChange={handleChange}
              required
            />
            <input
              type="text"
              name="username"
              placeholder="Username"
              value={adminSignup.username}
              onChange={handleChange}
              required
            />
            <input
              type="email"
              name="email"
              placeholder="Email"
              value={adminSignup.email}
              onChange={handleChange}
              required
            />
            <input
              type="password"
              name="password"
              placeholder="Password"
              value={adminSignup.password}
              onChange={handleChange}
              required
            />
            <input
              type="password"
              name="confirmPassword"
              placeholder="Confirm Password"
              value={adminSignup.confirmPassword}
              onChange={handleChange}
              required
            />
            <button type="submit">Register Admin</button>
          </div>
        </form>
      </div>
    </div>
  );
}
