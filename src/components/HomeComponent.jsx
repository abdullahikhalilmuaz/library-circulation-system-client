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
  const [dashboardData, setDashboardData] = useState(null);
  const [loading, setLoading] = useState(true);
  const userData = JSON.parse(localStorage.getItem("dear-user"));

  useEffect(() => {
    // Simulate API call to fetch dashboard data
    const fetchDashboardData = async () => {
      try {
        // In a real app, you would fetch this from your backend
        const mockData = {
          totalBooks: 1243,
          availableBooks: 876,
          checkedOutBooks: 367,
          totalUsers: 542,
          activeUsers: 328,
          pendingApprovals: 23,
          overdueBooks: 15,
          recentUsers: [
            {
              id: 1,
              name: "John Doe",
              email: "john@example.com",
              lastLogin: "2023-06-15T10:30:00",
            },
            {
              id: 2,
              name: "Jane Smith",
              email: "jane@example.com",
              lastLogin: "2023-06-15T09:15:00",
            },
            {
              id: 3,
              name: "Robert Johnson",
              email: "robert@example.com",
              lastLogin: "2023-06-14T16:45:00",
            },
            {
              id: 4,
              name: "Emily Davis",
              email: "emily@example.com",
              lastLogin: "2023-06-14T14:20:00",
            },
            {
              id: 5,
              name: "Michael Wilson",
              email: "michael@example.com",
              lastLogin: "2023-06-14T11:10:00",
            },
          ],
          popularBooks: [
            {
              id: 1,
              title: "The Great Gatsby",
              author: "F. Scott Fitzgerald",
              checkouts: 42,
            },
            {
              id: 2,
              title: "To Kill a Mockingbird",
              author: "Harper Lee",
              checkouts: 38,
            },
            { id: 3, title: "1984", author: "George Orwell", checkouts: 35 },
            {
              id: 4,
              title: "Pride and Prejudice",
              author: "Jane Austen",
              checkouts: 31,
            },
            {
              id: 5,
              title: "The Hobbit",
              author: "J.R.R. Tolkien",
              checkouts: 28,
            },
          ],
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
        };

        setDashboardData(mockData);
      } catch (error) {
        console.error("Error fetching dashboard data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  if (loading) {
    return <div className="dashboard-loading">Loading dashboard data...</div>;
  }

  if (!dashboardData) {
    return <div className="dashboard-error">Failed to load dashboard data</div>;
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
            {dashboardData.recentUsers.map((user) => (
              <li key={user.id}>
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
            <FiTrendingUp /> Popular Books
          </h3>
          <ul className="recent-list">
            {dashboardData.popularBooks.map((book) => (
              <li key={book.id}>
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
