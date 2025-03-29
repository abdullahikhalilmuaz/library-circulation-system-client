import { useState } from "react";
import "../styles/register.css";
import Login from "./Login";
import Signup from "./Signup";
import AdminLogin from "../components/AdminLogin";
import AdminSignup from "../components/AdminSignup";
import { toast } from "react-toastify";

export default function Register() {
  const [showComponent, setShowComponent] = useState("login");
  const [selectedRole, setSelectedRole] = useState("user");

  const handleAdmin = () => {
    setSelectedRole("admin");
    toast.info("Admin mode selected");
  };

  const handleUser = () => {
    setSelectedRole("user");
    toast.info("User mode selected");
  };

  const handleSignup = () => {
    setShowComponent(selectedRole === "admin" ? "adminSignup" : "signup");
  };

  const handleLogin = () => {
    setShowComponent(selectedRole === "admin" ? "adminLogin" : "login");
  };

  return (
    <div className="register-container">
      <div className="header">
        <div className="toggle-users">
          <button
            onClick={handleAdmin}
            className={selectedRole === "admin" ? "active" : ""}
          >
            admin
          </button>
          <button
            onClick={handleUser}
            className={selectedRole === "user" ? "active" : ""}
          >
            users
          </button>
        </div>
        <div className="toggle-navs">
          <button onClick={handleLogin}>login</button>
          <button onClick={handleSignup}>signup</button>
        </div>
      </div>

      <div className="content">
        {showComponent === "login" ? (
          <Login />
        ) : showComponent === "signup" ? (
          <Signup />
        ) : showComponent === "adminLogin" ? (
          <AdminLogin />
        ) : showComponent === "adminSignup" ? (
          <AdminSignup />
        ) : (
          <Login />
        )}
      </div>
    </div>
  );
}
