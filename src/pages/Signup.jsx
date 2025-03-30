import React, { useState } from "react";
import "../styles/login.css";
import { Link } from "react-router-dom";
import { toast } from "react-toastify";

const BASE_API_URL =
  "https://circulation-system-server-ql2i.onrender.com/api/auth/signup";

export default function Signup({ role }) {
  const [userSignup, setUserSignup] = useState({
    firstname: "",
    lastname: "",
    username: "",
    email: "",
    password: "",
    confirmPassword: "",
    role: role,
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setUserSignup((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleFormSignup = async (e) => {
    e.preventDefault();

    // Validate passwords match
    if (userSignup.password !== userSignup.confirmPassword) {
      toast.error("Passwords don't match!");
      return;
    }

    try {
      const { confirmPassword, ...userData } = userSignup;
      const res = await fetch(BASE_API_URL, {
        headers: {
          "Content-Type": "application/json",
        },
        method: "POST",
        body: JSON.stringify(userData),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.message || "Registration failed");
      }

      toast.success(data.message || "Registration successful!");

      // Clear form on success
      setUserSignup({
        firstname: "",
        lastname: "",
        username: "",
        email: "",
        password: "",
        confirmPassword: "",
        role: role,
      });
    } catch (err) {
      toast.error(err.message);
    }
  };

  return (
    <div className="home">
      <div className="container">
        <form className="myform" onSubmit={handleFormSignup}>
          <h3>
            Hi <em>👋</em>, Welcome!
          </h3>
          <div>
            <input
              type="text"
              name="firstname"
              placeholder="First Name"
              value={userSignup.firstname}
              onChange={handleChange}
              required
            />
            <input
              type="text"
              name="lastname"
              placeholder="Last Name"
              value={userSignup.lastname}
              onChange={handleChange}
              required
            />
            <input
              type="text"
              name="username"
              placeholder="Username"
              value={userSignup.username}
              onChange={handleChange}
              required
            />
            <input
              type="email"
              name="email"
              placeholder="Email"
              value={userSignup.email}
              onChange={handleChange}
              required
            />
            <input
              type="password"
              name="password"
              placeholder="New Password"
              value={userSignup.password}
              onChange={handleChange}
              required
            />
            <input
              type="password"
              name="confirmPassword"
              placeholder="Confirm Password"
              value={userSignup.confirmPassword}
              onChange={handleChange}
              required
            />
            <button type="submit">Signup</button>
          </div>
        </form>
      </div>
    </div>
  );
}
