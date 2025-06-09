const GET_ALL_BOOKS_URL =
  "https://circulation-system-server-1.onrender.com/api/books/all";
const GET_RECENT_USERS =
  "https://circulation-system-server-1.onrender.com/api/dashboard/stats";
const GET_POPULAR_BOOKS =
  "https://circulation-system-server-1.onrender.com/api/books/popular";

import { useEffect, useState } from "react";
import {
  FiUsers,
  FiBook,
  FiCheckCircle,
  FiClock,
  FiAlertCircle,
  FiTrendingUp,
  FiUser,
  FiCalendar,
} from "react-icons/fi";
import {
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import "../styles/dashboard.css";

const COLORS = ["#0088FE", "#00C49F", "#FFBB28", "#FF8042", "#8884D8"];

const HomeComponent = () => {
  const [dashboardData, setDashboardData] = useState({
    totalBooks: 5,
    availableBooks: 6,
    checkedOutBooks: 7,
    totalUsers: 542,
    pendingApprovals: 2,
    overdueBooks: 5,
    recentUsers: [],
    popularBooks: [],
    bookStatusData: [
      { name: "Available", value: 876 },
      { name: "Checked Out", value: 367 },
      { name: "Overdue", value: 15 },
    ],
    monthlyCheckouts: [
      { name: "Jan", checkouts: 120 },
      { name: "Feb", checkouts: 98 },
      { name: "Mar", checkouts: 150 },
      { name: "Apr", checkouts: 110 },
      { name: "May", checkouts: 180 },
      { name: "Jun", checkouts: 210 },
    ],
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const userData = JSON.parse(localStorage.getItem("dear-user"));

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);

        // Fetch recent users data
        const usersRes = await fetch(GET_RECENT_USERS);
        if (!usersRes.ok) throw new Error("Failed to fetch users data");
        const usersData = await usersRes.json();

        // Fetch popular books data
        const booksRes = await fetch(GET_POPULAR_BOOKS);
        if (!booksRes.ok) throw new Error("Failed to fetch books data");
        const booksData = await booksRes.json();

        setDashboardData((prev) => ({
          ...prev,
          recentUsers: usersData.recentUsers.map((user) => ({
            id: user.id,
            name: `${user.firstname} ${user.lastname}`,
            email: user.email,
            lastLogin: user.lastLogin,
          })),
          totalUsers: usersData.totalUsers,
          popularBooks: booksData,
        }));
      } catch (err) {
        console.error("Error fetching dashboard data:", err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  if (loading) {
    return <div className="dashboard-loading">Loading dashboard data...</div>;
  }

  if (error) {
    return <div className="dashboard-error">Error: {error}</div>;
  }

  // User view (simpler dashboard)
  if (userData.role === "user") {
    return (
      <div className="user-dashboard">
        <h2>Welcome back, {userData.firstname}!</h2>

        <div className="user-stats">
          <div className="stat-card">
            <FiBook className="stat-icon" />
            <div>
              <h3>Books Checked Out</h3>
              <p>5</p>
            </div>
          </div>

          <div className="stat-card">
            <FiClock className="stat-icon" />
            <div>
              <h3>Pending Requests</h3>
              <p>2</p>
            </div>
          </div>

          <div className="stat-card">
            <FiCheckCircle className="stat-icon" />
            <div>
              <h3>Approved Requests</h3>
              <p>3</p>
            </div>
          </div>
        </div>

        <div className="user-recent-activity">
          <h3>Your Recent Activity</h3>
          <ul>
            <li>
              <FiBook /> Checked out "The Great Gatsby" on June 10
            </li>
            <li>
              <FiClock /> Requested "1984" on June 8
            </li>
            <li>
              <FiCheckCircle /> "To Kill a Mockingbird" approved on June 5
            </li>
          </ul>
        </div>
      </div>
    );
  }

  // Admin/Librarian view (full dashboard)
  return (
    <div className="admin-dashboard">
      <h2>Library Dashboard</h2>
      <p className="dashboard-subtitle">
        Overview of library activities and metrics
      </p>

      {/* Quick Stats Row */}
      <div className="stats-row">
        <div className="stat-card">
          <div className="stat-icon-container">
            <FiBook className="stat-icon" />
          </div>
          <div className="stat-content">
            <h3>Total Books</h3>
            <p>{dashboardData.totalBooks}</p>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon-container">
            <FiUsers className="stat-icon" />
          </div>
          <div className="stat-content">
            <h3>Total Users</h3>
            <p>{dashboardData.totalUsers}</p>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon-container">
            <FiCheckCircle className="stat-icon" />
          </div>
          <div className="stat-content">
            <h3>Pending Approvals</h3>
            <p>{dashboardData.pendingApprovals}</p>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon-container">
            <FiAlertCircle className="stat-icon" />
          </div>
          <div className="stat-content">
            <h3>Overdue Books</h3>
            <p>{dashboardData.overdueBooks}</p>
          </div>
        </div>
      </div>

      {/* Charts Row */}
      <div className="charts-row">
        <div className="chart-container">
          <h3>Book Status</h3>
          <div className="chart-wrapper">
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={dashboardData.bookStatusData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                  label={({ name, percent }) =>
                    `${name}: ${(percent * 100).toFixed(0)}%`
                  }
                >
                  {dashboardData.bookStatusData.map((entry, index) => (
                    <Cell
                      key={`cell-${index}`}
                      fill={COLORS[index % COLORS.length]}
                    />
                  ))}
                </Pie>
                <Tooltip />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="chart-container">
          <h3>Monthly Checkouts</h3>
          <div className="chart-wrapper">
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={dashboardData.monthlyCheckouts}>
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="checkouts" fill="#8884d8" name="Checkouts" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Recent Activity Row */}
      <div className="activity-row">
        <div className="recent-card">
          <h3>
            <FiUser /> Recent Users
          </h3>
          <ul className="recent-list">
            {dashboardData.recentUsers.map((user, index) => (
              <li key={index}>
                <div className="user-info">
                  <strong>{user.name}</strong>
                  <span>{user.email}</span>
                </div>
                <div className="user-meta">
                  <FiCalendar /> {new Date(user.lastLogin).toLocaleDateString()}
                </div>
              </li>
            ))}
          </ul>
        </div>

        <div className="recent-card">
          <h3>
            <FiTrendingUp /> Top 3 Popular Books
          </h3>
          <ul className="recent-list">
            {dashboardData.popularBooks.map((book, index) => (
              <li key={index}>
                <div className="book-info">
                  <strong>{book.title}</strong>
                  <span>{book.author}</span>
                </div>
                <div className="book-meta">{book.checkouts} checkouts</div>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
};

export default HomeComponent;
