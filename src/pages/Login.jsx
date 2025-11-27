import React, { useState } from "react";
import "../styles/login.css";
import { Link, useNavigate } from "react-router-dom";
import { toast } from "react-toastify";

const BASE_API_URL = "http://localhost:3000/api/auth/login";

export default function Login() {
  const [userLogin, setUserLogin] = useState({
    email: "",
    password: "",
  });
  const navigate = useNavigate();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setUserLogin((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleFormLogin = async (e) => {
    e.preventDefault();

    // Basic validation
    if (!userLogin.email || !userLogin.password) {
      toast.error("Please enter both email and password");
      return;
    }

    try {
      const response = await fetch(BASE_API_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(userLogin),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Login failed");
      }

      // Store user data in localStorage
      localStorage.setItem("dear-user", JSON.stringify(data.user));

      toast.success(data.message || "Login successful!");

      // Redirect to home after successful login
      navigate("/home");
    } catch (err) {
      toast.error(err.message);
    }
  };

  return (
    <div className="home">
      <div className="container">
        <form className="myform" onSubmit={handleFormLogin}>
          <h3>
            Welcome back <em>👋</em>
          </h3>
          <div>
            <input
              type="email"
              name="email"
              placeholder="Email"
              value={userLogin.email}
              onChange={handleChange}
              required
            />
            <input
              type="password"
              name="password"
              placeholder="Password"
              value={userLogin.password}
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
