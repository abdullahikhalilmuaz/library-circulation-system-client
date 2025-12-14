import React, { useEffect, useState } from "react";
import { FiCheck, FiX, FiRefreshCw, FiChevronDown, FiChevronUp, FiBook, FiUser, FiClock, FiMessageSquare } from "react-icons/fi";
import { toast } from "react-toastify";
import "../styles/adminRequest.css";

export default function RequestApproval() {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState({
    fetch: true,
    approve: null,
    reject: null,
    bookApprove: null,
    bookReject: null,
  });
  const [expandedRequests, setExpandedRequests] = useState(new Set());
  const [bookNotes, setBookNotes] = useState({});

  useEffect(() => {
    fetchRequests();
  }, []);

  const fetchRequests = async () => {
    try {
      setLoading((prev) => ({ ...prev, fetch: true }));
      const response = await fetch("https://circulation-system-server-ql2i.onrender.com/api/requests");

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      console.log("Fetched requests:", data);
      setRequests(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error("Failed to fetch requests:", error);
      toast.error("Failed to load requests");
      setRequests([]);
    } finally {
      setLoading((prev) => ({ ...prev, fetch: false }));
    }
  };

  const toggleRequestExpansion = (requestId) => {
    const newExpanded = new Set(expandedRequests);
    if (newExpanded.has(requestId)) {
      newExpanded.delete(requestId);
    } else {
      newExpanded.add(requestId);
    }
    setExpandedRequests(newExpanded);
  };

  const handleApprove = async (requestId) => {
    try {
      setLoading((prev) => ({ ...prev, approve: requestId }));
      const response = await fetch(
        `https://circulation-system-server-ql2i.onrender.com/api/requests/${requestId}/approve`,
        { 
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ adminNotes: "All books approved" }),
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Approval failed");
      }

      const result = await response.json();
      toast.success(result.message);
      fetchRequests();
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
        `https://circulation-system-server-ql2i.onrender.com/api/requests/${requestId}/reject`,
        { 
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ adminNotes: "All books rejected" }),
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Rejection failed");
      }

      const result = await response.json();
      toast.success(result.message);
      fetchRequests();
    } catch (error) {
      console.error("Rejection error:", error);
      toast.error(error.message);
    } finally {
      setLoading((prev) => ({ ...prev, reject: null }));
    }
  };

  const handleBookApprove = async (requestId, bookId, notes = "") => {
    try {
      console.log(`=== Attempting to approve book ===`);
      console.log(`Request ID: ${requestId}`);
      console.log(`Book ID: ${bookId}`);
      console.log(`Notes: ${notes}`);

      setLoading((prev) => ({ ...prev, bookApprove: `${requestId}-${bookId}` }));
      
      const response = await fetch(
        `https://circulation-system-server-ql2i.onrender.com/api/requests/${requestId}/books/${bookId}/approve`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ adminNotes: notes }),
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        console.error("Book approval failed:", errorData);
        throw new Error(errorData.message || "Book approval failed");
      }

      const result = await response.json();
      toast.success("Book approved successfully");
      fetchRequests();
      
      // Clear the notes for this book
      setBookNotes(prev => {
        const newNotes = { ...prev };
        delete newNotes[`${requestId}-${bookId}`];
        return newNotes;
      });
    } catch (error) {
      console.error("Book approval error:", error);
      toast.error(error.message);
    } finally {
      setLoading((prev) => ({ ...prev, bookApprove: null }));
    }
  };

  const handleBookReject = async (requestId, bookId, notes = "") => {
    try {
      console.log(`=== Attempting to reject book ===`);
      console.log(`Request ID: ${requestId}`);
      console.log(`Book ID: ${bookId}`);
      console.log(`Notes: ${notes}`);

      setLoading((prev) => ({ ...prev, bookReject: `${requestId}-${bookId}` }));
      
      const response = await fetch(
        `https://circulation-system-server-ql2i.onrender.com/api/requests/${requestId}/books/${bookId}/reject`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ adminNotes: notes }),
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        console.error("Book rejection failed:", errorData);
        throw new Error(errorData.message || "Book rejection failed");
      }

      const result = await response.json();
      toast.success("Book rejected successfully");
      fetchRequests();
      
      // Clear the notes for this book
      setBookNotes(prev => {
        const newNotes = { ...prev };
        delete newNotes[`${requestId}-${bookId}`];
        return newNotes;
      });
    } catch (error) {
      console.error("Book rejection error:", error);
      toast.error(error.message);
    } finally {
      setLoading((prev) => ({ ...prev, bookReject: null }));
    }
  };

  const handleBookNoteChange = (requestId, bookId, note) => {
    setBookNotes(prev => ({
      ...prev,
      [`${requestId}-${bookId}`]: note
    }));
  };

  const getRequestId = (request) => {
    return request.id || request._id || request.checkoutDate;
  };

  const getBookStatusBadge = (status) => {
    const statusClasses = {
      pending: "book-status-pending",
      approved: "book-status-approved",
      rejected: "book-status-rejected",
    };

    return (
      <span className={`book-status-badge ${statusClasses[status] || "book-status-pending"}`}>
        {status?.charAt(0)?.toUpperCase() + status?.slice(1)}
      </span>
    );
  };

  const hasPendingBooks = (request) => {
    return request.books?.some(book => book.status === "pending");
  };

  // Show requests that have at least one pending book
  const activeRequests = requests.filter(request => 
    request.status === "pending" || 
    request.status === "partially_approved" || 
    request.status === "partially_rejected" ||
    hasPendingBooks(request)
  );

  if (loading.fetch) {
    return (
      <div className="admin-container">
        <h2>Active Book Requests</h2>
        <p>Loading requests...</p>
      </div>
    );
  }

  if (activeRequests.length === 0) {
    return (
      <div className="admin-container">
        <div className="admin-header">
          <h2>Active Book Requests</h2>
          <button onClick={fetchRequests} className="refresh-btn">
            <FiRefreshCw /> Refresh
          </button>
        </div>
        <p>No active requests found</p>
        <p>Total requests in system: {requests.length}</p>
      </div>
    );
  }

  return (
    <div className="admin-container">
      <div className="admin-header">
        <h2>Active Book Requests ({activeRequests.length})</h2>
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
            {activeRequests.map((request) => {
              const requestId = getRequestId(request);
              const isExpanded = expandedRequests.has(requestId);
              const pendingBooksCount = request.books?.filter(book => book.status === "pending").length || 0;
              const approvedBooksCount = request.books?.filter(book => book.status === "approved").length || 0;
              const rejectedBooksCount = request.books?.filter(book => book.status === "rejected").length || 0;
              
              return (
                <React.Fragment key={requestId}>
                  {/* Main Request Row */}
                  <tr className="request-row">
                    <td>
                      <div className="user-info">
                        <FiUser />
                        {request.userId}
                      </div>
                    </td>
                    <td>{request.registrationNumber}</td>
                    <td>
                      <div className="books-summary">
                        <FiBook />
                        <div className="books-count">
                          <strong>{request.books?.length || 0} books</strong>
                          <div className="books-breakdown">
                            {approvedBooksCount > 0 && <span className="approved-count">✓{approvedBooksCount}</span>}
                            {rejectedBooksCount > 0 && <span className="rejected-count">✗{rejectedBooksCount}</span>}
                            {pendingBooksCount > 0 && <span className="pending-count">⏳{pendingBooksCount}</span>}
                          </div>
                        </div>
                        <button 
                          className="expand-toggle"
                          onClick={() => toggleRequestExpansion(requestId)}
                        >
                          {isExpanded ? <FiChevronUp /> : <FiChevronDown />}
                        </button>
                      </div>
                    </td>
                    <td>
                      <div className="date-info">
                        <FiClock />
                        {new Date(request.checkoutDate).toLocaleDateString()}
                      </div>
                    </td>
                    <td>
                      <span className={`status-badge ${request.status}`}>
                        {request.status === "partially_approved" && "Partially Approved"}
                        {request.status === "partially_rejected" && "Partially Rejected"}
                        {request.status === "pending" && "Pending"}
                        {request.status === "approved" && "Approved"}
                        {request.status === "rejected" && "Rejected"}
                      </span>
                    </td>
                    <td>
                      {pendingBooksCount > 0 && (
                        <div className="action-buttons">
                          <button
                            onClick={() => handleApprove(requestId)}
                            disabled={loading.approve === requestId}
                            className="approve-btn"
                          >
                            {loading.approve === requestId ? (
                              "Approving..."
                            ) : (
                              <>
                                <FiCheck /> Approve All
                              </>
                            )}
                          </button>
                          <button
                            onClick={() => handleReject(requestId)}
                            disabled={loading.reject === requestId}
                            className="reject-btn"
                          >
                            {loading.reject === requestId ? (
                              "Rejecting..."
                            ) : (
                              <>
                                <FiX /> Reject All
                              </>
                            )}
                          </button>
                        </div>
                      )}
                      {pendingBooksCount === 0 && (
                        <span className="completed-badge">Completed</span>
                      )}
                    </td>
                  </tr>
                  
                  {/* Expanded Book Details Row */}
                  {isExpanded && (
                    <tr className="expanded-row">
                      <td colSpan="6">
                        <div className="expanded-content">
                          <h4>Books in this Request</h4>
                          <div className="request-progress">
                            <div className="progress-stats">
                              <span className="stat approved">Approved: {approvedBooksCount}</span>
                              <span className="stat rejected">Rejected: {rejectedBooksCount}</span>
                              <span className="stat pending">Pending: {pendingBooksCount}</span>
                            </div>
                          </div>
                          <div className="books-grid">
                            {request.books?.map((book, index) => (
                              <div key={book.id || index} className={`book-card ${book.status}`}>
                                <div className="book-header">
                                  <div className="book-info">
                                    <h5>{book.title}</h5>
                                    <p className="book-meta">
                                      <strong>Author:</strong> {book.author}<br />
                                      <strong>ISBN:</strong> {book.isbn}<br />
                                      <strong>Section:</strong> {book.section}<br />
                                      <strong>Quantity:</strong> {book.quantity || 1}
                                      <br />
                                      <small style={{color: '#666'}}>Book ID: {book.id}</small>
                                    </p>
                                  </div>
                                  <div className="book-actions-section">
                                    {getBookStatusBadge(book.status)}
                                    
                                    {book.status === "pending" ? (
                                      <div className="book-action-form">
                                        <textarea
                                          placeholder="Add reason for approval/rejection (optional)"
                                          value={bookNotes[`${requestId}-${book.id}`] || ""}
                                          onChange={(e) => handleBookNoteChange(requestId, book.id, e.target.value)}
                                          className="book-notes-textarea"
                                          rows="3"
                                        />
                                        <div className="book-action-buttons">
                                          <button
                                            onClick={() => handleBookApprove(
                                              requestId, 
                                              book.id, 
                                              bookNotes[`${requestId}-${book.id}`] || ""
                                            )}
                                            disabled={loading.bookApprove === `${requestId}-${book.id}`}
                                            className="approve-book-btn"
                                          >
                                            {loading.bookApprove === `${requestId}-${book.id}` ? (
                                              "Approving..."
                                            ) : (
                                              <>
                                                <FiCheck /> Approve
                                              </>
                                            )}
                                          </button>
                                          <button
                                            onClick={() => handleBookReject(
                                              requestId, 
                                              book.id, 
                                              bookNotes[`${requestId}-${book.id}`] || ""
                                            )}
                                            disabled={loading.bookReject === `${requestId}-${book.id}`}
                                            className="reject-book-btn"
                                          >
                                            {loading.bookReject === `${requestId}-${book.id}` ? (
                                              "Rejecting..."
                                            ) : (
                                              <>
                                                <FiX /> Reject
                                              </>
                                            )}
                                          </button>
                                        </div>
                                      </div>
                                    ) : (
                                      <div className="book-status-info">
                                        {book.adminNotes && (
                                          <div className="book-admin-notes">
                                            <FiMessageSquare className="notes-icon" />
                                            <div className="notes-content">
                                              <strong>Admin Notes:</strong>
                                              <p>{book.adminNotes}</p>
                                            </div>
                                          </div>
                                        )}
                                        {book.processedAt && (
                                          <div className="processed-date">
                                            Processed: {new Date(book.processedAt).toLocaleString()}
                                          </div>
                                        )}
                                      </div>
                                    )}
                                  </div>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      </td>
                    </tr>
                  )}
                </React.Fragment>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}