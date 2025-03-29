import { toast } from "react-toastify";

export default function UserDashboard() {
  const admin = JSON.parse(localStorage.getItem("dear-admin"));

  return (
    <div className="admin-dashboard">
      <h1>User Dashboard</h1>
    </div>
  );
}
