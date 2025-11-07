import { useEffect, useState } from "react";
import { FiCheck, FiX, FiRefreshCw } from "react-icons/fi";
import { toast } from "react-toastify";
import "../styles/adminRequest.css";

export default function RequestApproval() {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState({
    fetch: true, // Start with true since we load immediately
    approve: null,
    reject: null,
  });

  useEffect(() => {
    fetchRequests();
  }, []);

  const fetchRequests = async () => {
    try {
      setLoading((prev) => ({ ...prev, fetch: true }));
      const response = await fetch("https://circulation-system-server-1.onrender.com/api/requests");

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      // Ensure we always have an array, even if empty
      setRequests(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error("Failed to fetch requests:", error);
      toast.error("Failed to load requests");
      setRequests([]); // Set to empty array on error
    } finally {
      setLoading((prev) => ({ ...prev, fetch: false }));
    }
  };

  const handleApprove = async (requestId) => {
    try {
      setLoading((prev) => ({ ...prev, approve: requestId }));
      const response = await fetch(
        `https://circulation-system-server-1.onrender.com/api/requests/${requestId}/approve`,
        { method: "PUT" }
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Approval failed");
      }

      const result = await response.json();
      toast.success(result.message);
      fetchRequests(); // Refresh the list
    } catch (error) {
      console.error("Approval error:", error);
      toast.error(error.message);
    } finally {
      setLoading((prev) => ({ ...prev, approve: null }));
    }
  };

  const handleReject = async (requestId) => {
    try {
      setLoading((prev) => ({ ...prev, reject: requestId }));
      const response = await fetch(
        `https://circulation-system-server-1.onrender.com/api/requests/${requestId}/reject`,
        { method: "PUT" }
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Rejection failed");
      }

      const result = await response.json();
      toast.success(result.message);
      fetchRequests(); // Refresh the list
    } catch (error) {
      console.error("Rejection error:", error);
      toast.error(error.message);
    } finally {
      setLoading((prev) => ({ ...prev, reject: null }));
    }
  };

  // Render loading state
  if (loading.fetch) {
    return (
      <div className="admin-container">
        <h2>Pending Book Requests</h2>
        <p>Loading requests...</p>
      </div>
    );
  }

  // Render empty state
  if (requests.length === 0) {
    return (
      <div className="admin-container">
        <div className="admin-header">
          <h2>Pending Book Requests</h2>
          <button onClick={fetchRequests} className="refresh-btn">
            <FiRefreshCw /> Refresh
          </button>
        </div>
        <p>No pending requests found</p>
      </div>
    );
  }

  // Render the requests table
  return (
    <div className="admin-container">
      <div className="admin-header">
        <h2>Pending Book Requests</h2>
        <button
          onClick={fetchRequests}
          disabled={loading.fetch}
          className="refresh-btn"
        >
          {loading.fetch ? (
            "Refreshing..."
          ) : (
            <>
              <FiRefreshCw /> Refresh
            </>
          )}
        </button>
      </div>

      <div className="requests-table-container">
        <table className="requests-table">
          <thead>
            <tr>
              <th>User ID</th>
              <th>Registration</th>
              <th>Books</th>
              <th>Date</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {requests.map((request) => (
              <tr key={request._id || request.checkoutDate}>
                <td>{request.userId}</td>
                <td>{request.registrationNumber}</td>
                <td>
                  <ul className="book-list">
                    {request.books?.map((book) => (
                      <li key={book.id}>
                        {book.title} (Qty: {book.quantity || 1})
                      </li>
                    ))}
                  </ul>
                </td>
                <td>{new Date(request.checkoutDate).toLocaleDateString()}</td>
                <td>
                  <span className={`status-badge ${request.status}`}>
                    {request.status}
                  </span>
                </td>
                <td>
                  {request.status === "pending" && (
                    <div className="action-buttons">
                      <button
                        onClick={() =>
                          handleApprove(request._id || request.checkoutDate)
                        }
                        disabled={
                          loading.approve ===
                          (request._id || request.checkoutDate)
                        }
                        className="approve-btn"
                      >
                        {loading.approve ===
                        (request._id || request.checkoutDate) ? (
                          "Approving..."
                        ) : (
                          <>
                            <FiCheck /> Approve
                          </>
                        )}
                      </button>
                      <button
                        onClick={() =>
                          handleReject(request._id || request.checkoutDate)
                        }
                        disabled={
                          loading.reject ===
                          (request._id || request.checkoutDate)
                        }
                        className="reject-btn"
                      >
                        {loading.reject ===
                        (request._id || request.checkoutDate) ? (
                          "Rejecting..."
                        ) : (
                          <>
                            <FiX /> Reject
                          </>
                        )}
                      </button>
                    </div>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
