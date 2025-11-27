import { useEffect, useState } from "react";
import { FiCheck, FiX, FiClock, FiUser, FiBook, FiEye, FiMessageSquare } from "react-icons/fi";
import "../styles/adminRequests.css";

const DisplayAdminRequest = () => {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filter, setFilter] = useState("pending");
  const [selectedRequest, setSelectedRequest] = useState(null);
  const [adminNotes, setAdminNotes] = useState("");
  const [processing, setProcessing] = useState(false);

  useEffect(() => {
    fetchRequests();
  }, [filter]);

  const fetchRequests = async () => {
    try {
      setLoading(true);
      const response = await fetch("http://localhost:3000/api/requests");

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      setRequests(Array.isArray(data.requests) ? data.requests : []);
    } catch (err) {
      console.error("Fetch error:", err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const updateBookStatus = async (requestId, bookId, status, notes = "") => {
    try {
      setProcessing(true);
      const endpoint = status === "approved" 
        ? `http://localhost:3000/api/requests/${requestId}/books/${bookId}/approve`
        : `http://localhost:3000/api/requests/${requestId}/books/${bookId}/reject`;

      const response = await fetch(endpoint, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ adminNotes: notes }),
      });

      if (!response.ok) throw new Error(`Failed to ${status} book`);

      const result = await response.json();
      fetchRequests();
      
      // Update selected request if it's the one being viewed
      if (selectedRequest && selectedRequest.id === requestId) {
        setSelectedRequest(result.request);
      }
      
      setAdminNotes("");
    } catch (err) {
      console.error("Status update error:", err);
      setError(err.message);
    } finally {
      setProcessing(false);
    }
  };

  const updateRequestStatus = async (requestId, status, notes = "") => {
    try {
      setProcessing(true);
      const endpoint = status === "approved" 
        ? `http://localhost:3000/api/requests/${requestId}/approve`
        : `http://localhost:3000/api/requests/${requestId}/reject`;

      const response = await fetch(endpoint, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ adminNotes: notes }),
      });

      if (!response.ok) throw new Error(`Failed to ${status} request`);

      const result = await response.json();
      fetchRequests();
      
      if (selectedRequest && selectedRequest.id === requestId) {
        setSelectedRequest(result.request);
      }
      
      setAdminNotes("");
    } catch (err) {
      console.error("Status update error:", err);
      setError(err.message);
    } finally {
      setProcessing(false);
    }
  };

  const viewRequestDetails = (request) => {
    setSelectedRequest(request);
    setAdminNotes("");
  };

  const closeRequestDetails = () => {
    setSelectedRequest(null);
    setAdminNotes("");
  };

  const getStatusBadge = (status) => {
    const statusClasses = {
      pending: "status-badge-pending",
      approved: "status-badge-approved",
      rejected: "status-badge-rejected",
      partially_approved: "status-badge-partial",
    };

    return (
      <span className={`status-badge ${statusClasses[status] || ""}`}>
        {status?.charAt(0)?.toUpperCase() + status?.slice(1).replace('_', ' ')}
      </span>
    );
  };

  const getBookStatusBadge = (status) => {
    const statusClasses = {
      pending: "book-status-pending",
      approved: "book-status-approved",
      rejected: "book-status-rejected",
      in_cart: "book-status-in-cart",
    };

    return (
      <span className={`book-status-badge ${statusClasses[status] || ""}`}>
        {status?.charAt(0)?.toUpperCase() + status?.slice(1).replace('_', ' ')}
      </span>
    );
  };

  const getRequestStats = (request) => {
    const books = request.books || [];
    const total = books.length;
    const approved = books.filter(book => book.status === 'approved').length;
    const rejected = books.filter(book => book.status === 'rejected').length;
    const pending = books.filter(book => book.status === 'pending').length;

    return { total, approved, rejected, pending };
  };

  if (loading) return <div className="loading-spinner">Loading requests...</div>;
  if (error) return <div className="error-message">Error: {error}</div>;

  return (
    <div className="admin-requests-container">
      <div className="requests-header">
        <h2>Book Loan Requests Management</h2>
        <div className="filter-controls">
          <button
            className={`filter-btn ${filter === "pending" ? "active" : ""}`}
            onClick={() => setFilter("pending")}
          >
            Pending
          </button>
          <button
            className={`filter-btn ${filter === "partially_approved" ? "active" : ""}`}
            onClick={() => setFilter("partially_approved")}
          >
            Partially Approved
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
        </div>
      </div>

      {/* Request Details Modal */}
      {selectedRequest && (
        <div className="request-details-modal">
          <div className="modal-content">
            <div className="modal-header">
              <h3>Request Details</h3>
              <button className="close-btn" onClick={closeRequestDetails}>×</button>
            </div>
            
            <div className="request-info">
              <div className="info-row">
                <span className="info-label">User ID:</span>
                <span className="info-value">{selectedRequest.userId}</span>
              </div>
              <div className="info-row">
                <span className="info-label">Registration Number:</span>
                <span className="info-value">{selectedRequest.registrationNumber}</span>
              </div>
              <div className="info-row">
                <span className="info-label">Request Date:</span>
                <span className="info-value">{new Date(selectedRequest.createdAt).toLocaleString()}</span>
              </div>
              <div className="info-row">
                <span className="info-label">Overall Status:</span>
                <span className="info-value">{getStatusBadge(selectedRequest.status)}</span>
              </div>
            </div>

            <div className="books-section">
              <h4>Requested Books ({selectedRequest.books?.length || 0})</h4>
              
              <div className="books-grid">
                {selectedRequest.books?.map((book, index) => (
                  <div key={book.id} className="book-card">
                    <div className="book-header">
                      <h5>{book.title}</h5>
                      {getBookStatusBadge(book.status)}
                    </div>
                    
                    <div className="book-details">
                      <p><strong>Author:</strong> {book.author}</p>
                      <p><strong>ISBN:</strong> {book.isbn}</p>
                      <p><strong>Section:</strong> {book.section}</p>
                      <p><strong>Quantity:</strong> {book.quantity || 1}</p>
                      
                      {book.adminNotes && (
                        <div className="admin-notes">
                          <FiMessageSquare />
                          <strong>Admin Notes:</strong> {book.adminNotes}
                        </div>
                      )}
                      
                      {book.processedAt && (
                        <p className="processed-date">
                          Processed: {new Date(book.processedAt).toLocaleString()}
                        </p>
                      )}
                    </div>

                    {book.status === "pending" && (
                      <div className="book-actions">
                        <textarea
                          placeholder="Add notes for approval/rejection (optional)"
                          value={adminNotes}
                          onChange={(e) => setAdminNotes(e.target.value)}
                          className="notes-textarea"
                          rows="2"
                        />
                        <div className="action-buttons">
                          <button
                            className="approve-book-btn"
                            onClick={() => updateBookStatus(selectedRequest.id, book.id, "approved", adminNotes)}
                            disabled={processing}
                          >
                            <FiCheck /> Approve
                          </button>
                          <button
                            className="reject-book-btn"
                            onClick={() => updateBookStatus(selectedRequest.id, book.id, "rejected", adminNotes)}
                            disabled={processing}
                          >
                            <FiX /> Reject
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>

            <div className="bulk-actions-section">
              <h4>Bulk Actions</h4>
              <textarea
                placeholder="Add notes for bulk approval/rejection (optional)"
                value={adminNotes}
                onChange={(e) => setAdminNotes(e.target.value)}
                className="bulk-notes-textarea"
                rows="3"
              />
              <div className="bulk-action-buttons">
                <button
                  className="bulk-approve-btn"
                  onClick={() => updateRequestStatus(selectedRequest.id, "approved", adminNotes)}
                  disabled={processing}
                >
                  <FiCheck /> Approve All Books
                </button>
                <button
                  className="bulk-reject-btn"
                  onClick={() => updateRequestStatus(selectedRequest.id, "rejected", adminNotes)}
                  disabled={processing}
                >
                  <FiX /> Reject All Books
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {requests.filter((r) => r.status === filter).length === 0 ? (
        <div className="no-requests">
          <p>No {filter.replace('_', ' ')} requests found</p>
        </div>
      ) : (
        <div className="requests-table-container">
          <table className="requests-table">
            <thead>
              <tr>
                <th>User ID</th>
                <th>Registration Number</th>
                <th>Books Requested</th>
                <th>Status Summary</th>
                <th>
                  <FiClock /> Date Created
                </th>
                <th>Overall Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {requests
                .filter((request) => request.status === filter)
                .map((request) => {
                  const stats = getRequestStats(request);
                  
                  return (
                    <tr key={`request-${request.id}`}>
                      <td>{request.userId}</td>
                      <td>{request.registrationNumber}</td>
                      <td>
                        <div className="books-summary">
                          <strong>{stats.total} books</strong>
                          <div className="stats-breakdown">
                            {stats.approved > 0 && <span className="stat-approved">✓{stats.approved}</span>}
                            {stats.pending > 0 && <span className="stat-pending">⏳{stats.pending}</span>}
                            {stats.rejected > 0 && <span className="stat-rejected">✗{stats.rejected}</span>}
                          </div>
                        </div>
                      </td>
                      <td>
                        <div className="progress-summary">
                          <div className="progress-bar">
                            <div 
                              className="progress-approved" 
                              style={{ width: `${(stats.approved / stats.total) * 100}%` }}
                            ></div>
                            <div 
                              className="progress-rejected" 
                              style={{ width: `${(stats.rejected / stats.total) * 100}%` }}
                            ></div>
                          </div>
                          <div className="progress-text">
                            {stats.approved}/{stats.total} approved
                          </div>
                        </div>
                      </td>
                      <td>{new Date(request.createdAt).toLocaleString()}</td>
                      <td>{getStatusBadge(request.status)}</td>
                      <td className="actions">
                        <button
                          className="view-details-btn"
                          onClick={() => viewRequestDetails(request)}
                        >
                          <FiEye /> View Details
                        </button>
                      </td>
                    </tr>
                  );
                })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default DisplayAdminRequest;