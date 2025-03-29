import { toast } from "react-toastify";

export default function AdminDashboard() {
  const navigate = useNavigate();
  const admin = JSON.parse(localStorage.getItem("dear-admin"));

  return (
    <div className="admin-dashboard">
      <h1>Admin Dashboard</h1>
    </div>
  );
}
