import { useEffect, useState } from "react";
import { FiCheck, FiX, FiClock, FiUser, FiBook } from "react-icons/fi";
import "../styles/adminRequests.css";

const DisplayAdminRequest = () => {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filter, setFilter] = useState("pending");
  const [selectedRequests, setSelectedRequests] = useState([]);

  useEffect(() => {
    fetchRequests();
  }, [filter]);

  const fetchRequests = async () => {
    try {
      setLoading(true);
      const response = await fetch("https://circulation-system-server-1.onrender.com/api/newBookRequest");

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      setRequests(Array.isArray(data.requests) ? data.requests : []);
      setSelectedRequests([]);
    } catch (err) {
      console.error("Fetch error:", err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const updateRequestStatus = async (requestId, status) => {
    try {
      const response = await fetch(
        `https://circulation-system-server-1.onrender.com/api/newBookRequest/${requestId}/status`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ status }),
        }
      );

      if (!response.ok) throw new Error(`Failed to update status to ${status}`);

      fetchRequests();
    } catch (err) {
      console.error("Status update error:", err);
      setError(err.message);
    }
  };

  const handleBulkApprove = async () => {
    try {
      // Process each selected request individually
      for (const requestId of selectedRequests) {
        await updateRequestStatus(requestId, "approved");
      }
    } catch (err) {
      console.error("Bulk approve error:", err);
      setError(err.message);
    }
  };

  const toggleRequestSelection = (requestId) => {
    setSelectedRequests((prev) =>
      prev.includes(requestId)
        ? prev.filter((id) => id !== requestId)
        : [...prev, requestId]
    );
  };

  const getStatusBadge = (status) => {
    const statusClasses = {
      pending: "status-badge-pending",
      approved: "status-badge-approved",
      rejected: "status-badge-rejected",
      completed: "status-badge-completed",
    };

    return (
      <span className={`status-badge ${statusClasses[status] || ""}`}>
        {status?.charAt(0)?.toUpperCase() + status?.slice(1)}
      </span>
    );
  };

  if (loading)
    return <div className="loading-spinner">Loading requests...</div>;
  if (error) return <div className="error-message">Error: {error}</div>;

  return (
    <div className="admin-requests-container">
      <div className="requests-header">
        <h2>New Book Requests Management</h2>
        <div className="filter-controls">
          <button
            className={`filter-btn ${filter === "pending" ? "active" : ""}`}
            onClick={() => setFilter("pending")}
          >
            Pending
          </button>
          <button
            className={`filter-btn ${filter === "approved" ? "active" : ""}`}
            onClick={() => setFilter("approved")}
          >
            Approved
          </button>
          <button
            className={`filter-btn ${filter === "rejected" ? "active" : ""}`}
            onClick={() => setFilter("rejected")}
          >
            Rejected
          </button>
          <button
            className={`filter-btn ${filter === "completed" ? "active" : ""}`}
            onClick={() => setFilter("completed")}
          >
            Completed
          </button>
        </div>
      </div>

      {filter === "pending" && selectedRequests.length > 0 && (
        <div className="bulk-actions">
          <button className="bulk-approve-btn" onClick={handleBulkApprove}>
            Approve Selected ({selectedRequests.length})
          </button>
        </div>
      )}

      {requests.filter((r) => r.status === filter).length === 0 ? (
        <div className="no-requests">
          <p>No {filter} requests found</p>
        </div>
      ) : (
        <div className="requests-table-container">
          <table className="requests-table">
            <thead>
              <tr>
                {filter === "pending" && <th>Select</th>}
                <th>
                  <FiUser /> User
                </th>
                <th>User ID</th>
                <th>
                  <FiBook /> Book Requested
                </th>
                <th>Author</th>
                <th>ISBN</th>
                <th>Reason</th>
                <th>Urgency</th>
                <th>Type</th>
                <th>
                  <FiClock /> Date Created
                </th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {requests
                .filter((request) => request.status === filter)
                .map((request) => (
                  <tr key={`request-${request._id}`}>
                    {filter === "pending" && (
                      <td>
                        <input
                          type="checkbox"
                          checked={selectedRequests.includes(request._id)}
                          onChange={() => toggleRequestSelection(request._id)}
                        />
                      </td>
                    )}
                    <td>{request.username}</td>
                    <td>{request.userId}</td>
                    <td>{request.bookTitle}</td>
                    <td>{request.author}</td>
                    <td>{request.isbn}</td>
                    <td>{request.reason}</td>
                    <td className={`urgency-${request.urgency}`}>
                      {request.urgency}
                    </td>
                    <td>{request.type}</td>
                    <td>{new Date(request.createdAt).toLocaleString()}</td>
                    <td>{getStatusBadge(request.status)}</td>
                    <td className="actions">
                      {request.status === "pending" && (
                        <>
                          <button
                            className="approve-btn"
                            onClick={() =>
                              updateRequestStatus(request._id, "approved")
                            }
                          >
                            Approve
                          </button>
                          <button
                            className="reject-btn"
                            onClick={() =>
                              updateRequestStatus(request._id, "rejected")
                            }
                          >
                            Reject
                          </button>
                        </>
                      )}
                      {request.status === "approved" && (
                        <button
                          className="complete-btn"
                          onClick={() =>
                            updateRequestStatus(request._id, "completed")
                          }
                        >
                          Mark as Arrived
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default DisplayAdminRequest;
