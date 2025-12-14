// DisplayAdminRequest.js - Corrected
import { useEffect, useState } from "react";
import { FiCheck, FiX, FiClock, FiUser, FiBook, FiEye, FiMessageSquare, FiPlus, FiShoppingCart } from "react-icons/fi";
import "../styles/adminRequests.css";

const DisplayAdminRequest = () => {
  const [requests, setRequests] = useState([]);
  const [newBookRequests, setNewBookRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filter, setFilter] = useState("loan_pending");
  const [selectedRequest, setSelectedRequest] = useState(null);
  const [selectedNewBookRequest, setSelectedNewBookRequest] = useState(null);
  const [adminNotes, setAdminNotes] = useState("");
  const [processing, setProcessing] = useState(false);
  const [activeTab, setActiveTab] = useState("loan"); // 'loan' or 'newBook'

  useEffect(() => {
    fetchAllRequests();
  }, []);

  const fetchAllRequests = async () => {
    try {
      setLoading(true);
      
      // Fetch both types of requests in parallel
      const [loanResponse, newBookResponse] = await Promise.all([
        fetch("https://circulation-system-server-ql2i.onrender.com/api/requests"),
        fetch("https://circulation-system-server-ql2i.onrender.com/api/newBookRequest")
      ]);

      if (!loanResponse.ok) {
        const errorText = await loanResponse.text();
        throw new Error(`Loan requests error: ${loanResponse.status} - ${errorText}`);
      }
      if (!newBookResponse.ok) {
        const errorText = await newBookResponse.text();
        throw new Error(`New book requests error: ${newBookResponse.status} - ${errorText}`);
      }

      const loanData = await loanResponse.json();
      const newBookData = await newBookResponse.json();

      // Handle loan requests
      let loanRequests = [];
      if (loanData && Array.isArray(loanData)) {
        loanRequests = loanData;
      } else if (loanData && Array.isArray(loanData.requests)) {
        loanRequests = loanData.requests;
      } else if (loanData && Array.isArray(loanData.data)) {
        loanRequests = loanData.data;
      }

      // Handle new book requests
      let newRequests = [];
      if (newBookData && Array.isArray(newBookData)) {
        newRequests = newBookData;
      } else if (newBookData && Array.isArray(newBookData.requests)) {
        newRequests = newBookData.requests;
      } else if (newBookData && Array.isArray(newBookData.data)) {
        newRequests = newBookData.data;
      }

      setRequests(loanRequests);
      setNewBookRequests(newRequests);
      
      console.log("Loan requests:", loanRequests);
      console.log("New book requests:", newRequests);

    } catch (err) {
      console.error("Fetch error:", err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // Update Loan Book Status
  const updateBookStatus = async (requestId, bookId, status, notes = "") => {
    try {
      setProcessing(true);
      const endpoint = status === "approved" 
        ? `https://circulation-system-server-ql2i.onrender.com/api/requests/${requestId}/books/${bookId}/approve`
        : `https://circulation-system-server-ql2i.onrender.com/api/requests/${requestId}/books/${bookId}/reject`;

      const response = await fetch(endpoint, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ adminNotes: notes }),
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Failed to ${status} book: ${response.status} - ${errorText}`);
      }

      const result = await response.json();
      await fetchAllRequests();
      
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

  // Update Loan Request Status
  const updateRequestStatus = async (requestId, status, notes = "") => {
    try {
      setProcessing(true);
      const endpoint = status === "approved" 
        ? `https://circulation-system-server-ql2i.onrender.com/api/requests/${requestId}/approve`
        : `https://circulation-system-server-ql2i.onrender.com/api/requests/${requestId}/reject`;

      const response = await fetch(endpoint, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ adminNotes: notes }),
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Failed to ${status} request: ${response.status} - ${errorText}`);
      }

      const result = await response.json();
      await fetchAllRequests();
      
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

  // Update New Book Request Status - FIXED ENDPOINT
  const updateNewBookRequestStatus = async (requestId, status, notes = "") => {
    try {
      setProcessing(true);
      
      // FIXED: Added the full correct endpoint path
      const endpoint = `https://circulation-system-server-ql2i.onrender.com/api/newBookRequest/${requestId}/status`;
      
      console.log("Updating new book request:", endpoint);
      console.log("Request data:", { status, adminNotes: notes });
      
      const response = await fetch(endpoint, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ 
          status: status,
          adminNotes: notes,
          processedBy: "admin",
          processedAt: new Date().toISOString()
        }),
      });

      // Check if response is HTML (error page) instead of JSON
      const contentType = response.headers.get("content-type");
      if (!contentType || !contentType.includes("application/json")) {
        const text = await response.text();
        console.error("Non-JSON response:", text.substring(0, 500));
        throw new Error(`Server returned HTML instead of JSON. Status: ${response.status}`);
      }

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || `Failed to update status: ${response.status}`);
      }

      const result = await response.json();
      console.log("Update successful:", result);
      
      await fetchAllRequests();
      
      if (selectedNewBookRequest && selectedNewBookRequest._id === requestId) {
        setSelectedNewBookRequest(result.request || result.data || result);
      }
      
      setAdminNotes("");
      alert(`Request ${status} successfully!`);
      
    } catch (err) {
      console.error("Status update error:", err);
      setError(err.message);
      alert(`Error: ${err.message}`);
    } finally {
      setProcessing(false);
    }
  };

  const viewRequestDetails = (request) => {
    if (activeTab === "loan") {
      setSelectedRequest(request);
    } else {
      setSelectedNewBookRequest(request);
    }
    setAdminNotes("");
  };

  const closeRequestDetails = () => {
    if (activeTab === "loan") {
      setSelectedRequest(null);
    } else {
      setSelectedNewBookRequest(null);
    }
    setAdminNotes("");
  };

  const getStatusBadge = (status) => {
    const statusClasses = {
      pending: "status-badge-pending",
      approved: "status-badge-approved",
      rejected: "status-badge-rejected",
      partially_approved: "status-badge-partial",
      processing: "status-badge-partial",
      completed: "status-badge-approved",
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

  const getUrgencyBadge = (urgency) => {
    const urgencyClasses = {
      low: "urgency-low",
      normal: "urgency-normal",
      high: "urgency-high",
    };

    return (
      <span className={`urgency-badge ${urgencyClasses[urgency] || ""}`}>
        {urgency?.charAt(0)?.toUpperCase() + urgency?.slice(1)}
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

  const getFilteredRequests = () => {
    if (activeTab === "loan") {
      return requests.filter(request => {
        if (filter === "loan_pending") return request.status === "pending";
        if (filter === "loan_approved") return request.status === "approved";
        if (filter === "loan_rejected") return request.status === "rejected";
        if (filter === "loan_partial") return request.status === "partially_approved";
        return true;
      });
    } else {
      return newBookRequests.filter(request => {
        if (filter === "newbook_pending") return request.status === "pending";
        if (filter === "newbook_approved") return request.status === "approved";
        if (filter === "newbook_rejected") return request.status === "rejected";
        if (filter === "newbook_processing") return request.status === "processing";
        return true;
      });
    }
  };

  if (loading) return <div className="loading-spinner">Loading requests...</div>;
  if (error) return <div className="error-message">Error: {error}</div>;

  return (
    <div className="admin-requests-container">
      <div className="requests-header">
        <h2>📋 Request Management Dashboard</h2>
        
        {/* Tab Navigation */}
        <div className="request-type-tabs">
          <button
            className={`tab-btn ${activeTab === "loan" ? "active" : ""}`}
            onClick={() => {
              setActiveTab("loan");
              setFilter("loan_pending");
              setSelectedRequest(null);
              setSelectedNewBookRequest(null);
            }}
          >
            <FiShoppingCart /> Book Loan Requests
          </button>
          <button
            className={`tab-btn ${activeTab === "newBook" ? "active" : ""}`}
            onClick={() => {
              setActiveTab("newBook");
              setFilter("newbook_pending");
              setSelectedRequest(null);
              setSelectedNewBookRequest(null);
            }}
          >
            <FiPlus /> New Book Requests
          </button>
        </div>
        
        {/* Filter Controls */}
        <div className="filter-controls">
          {activeTab === "loan" ? (
            <>
              <button
                className={`filter-btn ${filter === "loan_pending" ? "active" : ""}`}
                onClick={() => setFilter("loan_pending")}
              >
                Pending
              </button>
              <button
                className={`filter-btn ${filter === "loan_partial" ? "active" : ""}`}
                onClick={() => setFilter("loan_partial")}
              >
                Partially Approved
              </button>
              <button
                className={`filter-btn ${filter === "loan_approved" ? "active" : ""}`}
                onClick={() => setFilter("loan_approved")}
              >
                Approved
              </button>
              <button
                className={`filter-btn ${filter === "loan_rejected" ? "active" : ""}`}
                onClick={() => setFilter("loan_rejected")}
              >
                Rejected
              </button>
            </>
          ) : (
            <>
              <button
                className={`filter-btn ${filter === "newbook_pending" ? "active" : ""}`}
                onClick={() => setFilter("newbook_pending")}
              >
                Pending
              </button>
              <button
                className={`filter-btn ${filter === "newbook_processing" ? "active" : ""}`}
                onClick={() => setFilter("newbook_processing")}
              >
                Processing
              </button>
              <button
                className={`filter-btn ${filter === "newbook_approved" ? "active" : ""}`}
                onClick={() => setFilter("newbook_approved")}
              >
                Approved
              </button>
              <button
                className={`filter-btn ${filter === "newbook_rejected" ? "active" : ""}`}
                onClick={() => setFilter("newbook_rejected")}
              >
                Rejected
              </button>
            </>
          )}
        </div>
      </div>

      {/* Loan Request Details Modal */}
      {selectedRequest && activeTab === "loan" && (
        <div className="request-details-modal">
          <div className="modal-content">
            <div className="modal-header">
              <h3>Book Loan Request Details</h3>
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
                {selectedRequest.books?.map((book) => (
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
                    </div>

                    {book.status === "pending" && (
                      <div className="book-actions">
                        <textarea
                          placeholder="Add notes (optional)"
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
                placeholder="Add notes for bulk actions (optional)"
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

      {/* New Book Request Details Modal */}
      {selectedNewBookRequest && activeTab === "newBook" && (
        <div className="request-details-modal">
          <div className="modal-content">
            <div className="modal-header">
              <h3>New Book Request Details</h3>
              <button className="close-btn" onClick={closeRequestDetails}>×</button>
            </div>
            
            <div className="request-info">
              <div className="info-row">
                <span className="info-label">User ID:</span>
                <span className="info-value">{selectedNewBookRequest.userId}</span>
              </div>
              <div className="info-row">
                <span className="info-label">Username:</span>
                <span className="info-value">{selectedNewBookRequest.username}</span>
              </div>
              <div className="info-row">
                <span className="info-label">Book Title:</span>
                <span className="info-value">{selectedNewBookRequest.bookTitle}</span>
              </div>
              <div className="info-row">
                <span className="info-label">Author:</span>
                <span className="info-value">{selectedNewBookRequest.author}</span>
              </div>
              <div className="info-row">
                <span className="info-label">ISBN:</span>
                <span className="info-value">{selectedNewBookRequest.isbn || "Not provided"}</span>
              </div>
              <div className="info-row">
                <span className="info-label">Request Date:</span>
                <span className="info-value">{new Date(selectedNewBookRequest.createdAt).toLocaleString()}</span>
              </div>
              <div className="info-row">
                <span className="info-label">Urgency:</span>
                <span className="info-value">{getUrgencyBadge(selectedNewBookRequest.urgency)}</span>
              </div>
              <div className="info-row">
                <span className="info-label">Reason:</span>
                <span className="info-value reason-text">{selectedNewBookRequest.reason}</span>
              </div>
              <div className="info-row">
                <span className="info-label">Status:</span>
                <span className="info-value">{getStatusBadge(selectedNewBookRequest.status)}</span>
              </div>
              
              {selectedNewBookRequest.adminNotes && (
                <div className="info-row">
                  <span className="info-label">Admin Notes:</span>
                  <span className="info-value">{selectedNewBookRequest.adminNotes}</span>
                </div>
              )}
            </div>

            {selectedNewBookRequest.status === "pending" && (
              <div className="bulk-actions-section">
                <h4>Admin Actions</h4>
                <textarea
                  placeholder="Add notes for approval/rejection (optional)"
                  value={adminNotes}
                  onChange={(e) => setAdminNotes(e.target.value)}
                  className="bulk-notes-textarea"
                  rows="3"
                />
                <div className="bulk-action-buttons">
                  <button
                    className="bulk-approve-btn"
                    onClick={() => updateNewBookRequestStatus(selectedNewBookRequest._id, "approved", adminNotes)}
                    disabled={processing}
                  >
                    <FiCheck /> Approve Request
                  </button>
                  <button
                    className="bulk-approve-btn processing"
                    onClick={() => updateNewBookRequestStatus(selectedNewBookRequest._id, "processing", adminNotes)}
                    disabled={processing}
                  >
                    ⚙️ Mark as Processing
                  </button>
                  <button
                    className="bulk-reject-btn"
                    onClick={() => updateNewBookRequestStatus(selectedNewBookRequest._id, "rejected", adminNotes)}
                    disabled={processing}
                  >
                    <FiX /> Reject Request
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Requests Table */}
      {getFilteredRequests().length === 0 ? (
        <div className="no-requests">
          <p>No {activeTab === "loan" ? "book loan" : "new book"} requests found</p>
        </div>
      ) : (
        <div className="requests-table-container">
          <table className="requests-table">
            <thead>
              <tr>
                {activeTab === "loan" ? (
                  <>
                    <th>User ID</th>
                    <th>Registration Number</th>
                    <th>Books Requested</th>
                    <th>Status Summary</th>
                    <th><FiClock /> Date Created</th>
                    <th>Overall Status</th>
                  </>
                ) : (
                  <>
                    <th>User ID</th>
                    <th>Username</th>
                    <th>Book Title</th>
                    <th>Author</th>
                    <th>Urgency</th>
                    <th><FiClock /> Date Created</th>
                    <th>Status</th>
                  </>
                )}
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {getFilteredRequests().map((request) => {
                if (activeTab === "loan") {
                  const stats = getRequestStats(request);
                  return (
                    <tr key={`loan-${request.id}`}>
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
                } else {
                  return (
                    <tr key={`newbook-${request._id}`}>
                      <td>{request.userId}</td>
                      <td>{request.username}</td>
                      <td>{request.bookTitle}</td>
                      <td>{request.author}</td>
                      <td>{getUrgencyBadge(request.urgency)}</td>
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
                }
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default DisplayAdminRequest;