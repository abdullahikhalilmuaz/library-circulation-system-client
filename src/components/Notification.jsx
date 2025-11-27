import { useEffect, useState } from "react";
import {
  FiBell,
  FiCheck,
  FiSearch,
  FiUser,
  FiBook,
  FiShoppingCart,
  FiClock,
} from "react-icons/fi";
import { toast } from "react-toastify";
import "../styles/notification.css";

export default function Notification() {
  const [allNotifications, setAllNotifications] = useState([]);
  const [filteredNotifications, setFilteredNotifications] = useState([]);
  const [searchInput, setSearchInput] = useState("");
  const [loading, setLoading] = useState(true);
  const userData = JSON.parse(localStorage.getItem("dear-user"));

  useEffect(() => {
    fetchAllNotifications();
  }, []);

  const fetchAllNotifications = async () => {
    try {
      setLoading(true);
      const response = await fetch("http://localhost:3000/api/notifications");

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      setAllNotifications(data.notifications || []);
      setFilteredNotifications(data.notifications || []);
    } catch (error) {
      console.error("Failed to fetch notifications:", error);
      toast.error("Failed to load notifications");
      setAllNotifications([]);
      setFilteredNotifications([]);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = () => {
    if (!searchInput.trim()) {
      setFilteredNotifications(allNotifications);
      return;
    }

    const filtered = allNotifications.filter(
      (notification) =>
        notification.registrationNumber
          ?.toLowerCase()
          .includes(searchInput.toLowerCase()) ||
        notification.userId?.toString().includes(searchInput)
    );

    setFilteredNotifications(filtered);
  };

  const markAsRead = async (notificationId) => {
    try {
      const response = await fetch(
        `http://localhost:3000/api/notifications/${notificationId}/read`,
        { method: "PUT" }
      );

      if (!response.ok) {
        throw new Error("Failed to mark as read");
      }

      // Update local state
      setAllNotifications((prev) =>
        prev.map((n) => (n._id === notificationId ? { ...n, read: true } : n))
      );
      setFilteredNotifications((prev) =>
        prev.map((n) => (n._id === notificationId ? { ...n, read: true } : n))
      );
    } catch (error) {
      toast.error(error.message);
    }
  };

  const getNotificationIcon = (type) => {
    switch (type) {
      case "book":
        return <FiBook className="notification-icon" />;
      case "cart":
        return <FiShoppingCart className="notification-icon" />;
      case "request":
        return <FiClock className="notification-icon" />;
      default:
        return <FiBell className="notification-icon" />;
    }
  };

  if (loading) {
    return (
      <div className="notification-container">
        <h2>All Notifications</h2>
        <p>Loading notifications...</p>
      </div>
    );
  }

  return (
    <div className="notification-container">
      <div className="notification-header">
        <h2>All Notifications</h2>
        <div className="search-container">
          <input
            type="text"
            placeholder="Search by registration number or user ID"
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
          />
          <button onClick={handleSearch} className="search-btn">
            <FiSearch /> Search
          </button>
        </div>
      </div>

      {filteredNotifications.length === 0 ? (
        <div className="no-notifications">
          <p>
            {searchInput.trim()
              ? `No notifications found for "${searchInput}"`
              : "No notifications available"}
          </p>
        </div>
      ) : (
        <ul className="notification-list">
          {filteredNotifications.map((notification) => (
            <li
              key={notification._id}
              className={`notification-item ${
                notification.read ? "" : "unread"
              }`}
            >
              <div className="notification-content">
                {getNotificationIcon(notification.type)}
                <div>
                  <div className="notification-meta">
                    <span className="user-id">
                      <FiUser /> {notification.userId}
                    </span>
                    {notification.registrationNumber && (
                      <span className="reg-number">
                        {notification.registrationNumber}
                      </span>
                    )}
                  </div>
                  <p className="notification-message">{notification.message}</p>
                  <small className="notification-time">
                    {new Date(notification.createdAt).toLocaleString()}
                  </small>
                </div>
              </div>
              {!notification.read && (
                <button
                  onClick={() => markAsRead(notification._id)}
                  className="mark-read-btn"
                >
                  <FiCheck />
                </button>
              )}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
