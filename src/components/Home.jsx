import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import "../styles/home.css";
import UserMakeRequest from "../components/UserMakeRequest";
import ManageUser from "../components/ManageUser";
import HomeComponent from "../components/HomeComponent";
import Cart from "../components/Cart";
import AddBook from "./AddBook";
import ViewBooks from "./ViewBooks";
import Manage from "../components/Manage";
import RequestApproval from "../components/RequestApproval";
import Loan from "../components/Loan";
import {
  FiBarChart2,
  FiBook,
  FiBriefcase,
  FiCheckCircle,
  FiHome,
  FiUser,
  FiLogOut,
  FiGitPullRequest,
  FiShoppingCart,
} from "react-icons/fi";

export default function Home() {
  const [activeComponent, setActiveComponent] = useState("home");
  const [showComponent, setShowComponent] = useState(false);
  const navigate = useNavigate();
  const [userData, setUserData] = useState(null);
  const [userRole, setUserRole] = useState("");

  useEffect(() => {
    const storedUser = JSON.parse(localStorage.getItem("dear-user"));

    if (!storedUser) {
      navigate("/register");
      return;
    }

    setUserData(storedUser);
    setUserRole(storedUser.role || "");
  }, [navigate]);

  const handleLogout = () => {
    localStorage.removeItem("dear-user");
    localStorage.removeItem("user-role");
    toast.success("Logged out successfully");
    navigate("/register");
  };

  const renderComponent = () => {
    switch (activeComponent) {
      case "request":
        return <UserMakeRequest />;
      case "books":
        return userRole === "admin" || userRole === "librarian" ? (
          <AddBook />
        ) : (
          <ViewBooks />
        );
      case "users":
        return <ManageUser />;
      case "stats":
        return <Manage />;
      case "approvals":
        return <RequestApproval />;
      case "work":
        return <Loan />;
      case "cart":
        return <Cart />;
      default:
        return <HomeComponent />;
    }
  };

  if (!userData) {
    return <div>Loading...</div>;
  }

  return (
    <div className="home-container">
      <div className="home-container-header">
        <div className="nav1" style={{ display: "flex", alignItems: "center" }}>
          <FiUser style={{ fontSize: "20px" }} />
          <h5
            style={{
              marginLeft: "10px",
              fontFamily: "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif",
              fontWeight: "500",
            }}
          >
            {userData.firstname} {userData.lastname}
            {userData.role === "admin" && " (Admin)"}
            {userData.role === "librarian" && " (Librarian)"}
          </h5>
        </div>
        <div className="nav2">
          <FiLogOut
            onClick={handleLogout}
            style={{ color: "red", cursor: "pointer" }}
          />
        </div>
      </div>

      <div className="home-container-content-container">
        {renderComponent()}
      </div>

      <div className="home-container-bottom-nav">
        {/* Home */}
        <div className="nav-item" onClick={() => setActiveComponent("home")}>
          <div className="nav-icon">
            <FiHome />
          </div>
          <div className="nav-label">Home</div>
        </div>

        {/* Request (for users) */}
        {userRole === "user" && (
          <div
            className="nav-item"
            onClick={() => setActiveComponent("request")}
          >
            <div className="nav-icon">
              <FiGitPullRequest />
            </div>
            <div className="nav-label">Request</div>
          </div>
        )}

        {/* Books (visible to all) */}
        <div className="nav-item" onClick={() => setActiveComponent("books")}>
          <div className="nav-icon">
            <FiBook />
          </div>
          <div className="nav-label">
            {userRole === "admin" || userRole === "librarian"
              ? "Add Books"
              : "View Books"}
          </div>
        </div>

        {/* Approvals (for admins/librarians) */}
        {(userRole === "admin" || userRole === "librarian") && (
          <div
            className="nav-item"
            onClick={() => setActiveComponent("approvals")}
          >
            <div className="nav-icon">
              <FiCheckCircle />
            </div>
            <div className="nav-label">Approve</div>
          </div>
        )}

        {/* Manage (only for admin) */}
        {userRole === "admin" && (
          <div className="nav-item" onClick={() => setActiveComponent("stats")}>
            <div className="nav-icon">
              <FiBarChart2 />
            </div>
            <div className="nav-label">Manage</div>
          </div>
        )}

        {/* Conditional bottom nav item - Cart for users, Loans for others */}
        {userRole === "user" ? (
          <div className="nav-item" onClick={() => setActiveComponent("cart")}>
            <div className="nav-icon">
              <FiShoppingCart />
            </div>
            <div className="nav-label">Cart</div>
          </div>
        ) : (
          <div className="nav-item" onClick={() => setActiveComponent("work")}>
            <div className="nav-icon">
              <FiBriefcase />
            </div>
            <div className="nav-label">Loans</div>
          </div>
        )}
      </div>
    </div>
  );
}
