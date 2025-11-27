import { useState, useEffect } from "react";
import { toast } from "react-toastify";
import "../styles/newBookRequest.css";

const API_BASE = "https://circulation-system-server-1.onrender.com/api";
const NEW_BOOK_REQUEST_URL = `${API_BASE}/newBookRequest`;

export default function NewBookRequest() {
  const user = JSON.parse(localStorage.getItem("dear-user"));
  const [requestForm, setRequestForm] = useState({
    userId: user.id,
    username: `${user.firstname} ${user.lastname}`,
    bookTitle: "",
    author: "",
    isbn: "",
    reason: "",
    urgency: "normal",
  });
  const [requests, setRequests] = useState([]);
  const [isLoading, setIsLoading] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setRequestForm((prev) => ({ ...prev, [name]: value }));
  };

  const fetchUserRequests = async () => {
    try {
      const res = await fetch(`${NEW_BOOK_REQUEST_URL}?userId=${user.id}`);
      if (!res.ok) throw new Error("Failed to fetch requests");
      const data = await res.json();
      setRequests(data.requests || []);
    } catch (error) {
      toast.error(error.message);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const res = await fetch(NEW_BOOK_REQUEST_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(requestForm),
      });

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.message || "Request failed");
      }

      toast.success("New book request submitted!");
      setRequestForm({
        userId: user.id,
        username: `${user.firstname} ${user.lastname}`,
        bookTitle: "",
        author: "",
        isbn: "",
        reason: "",
        urgency: "normal",
      });
      fetchUserRequests();
    } catch (error) {
      toast.error(error.message);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchUserRequests();
  }, []);

  return (
    <div className="new-book-request-container">
      <h2>📖 Request New Book Acquisition</h2>

      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label>Book Title *</label>
          <input
            name="bookTitle"
            value={requestForm.bookTitle}
            onChange={handleChange}
            required
          />
        </div>

        <div className="form-group">
          <label>Author *</label>
          <input
            name="author"
            value={requestForm.author}
            onChange={handleChange}
            required
          />
        </div>

        <div className="form-group">
          <label>ISBN (if known)</label>
          <input name="isbn" value={requestForm.isbn} onChange={handleChange} />
        </div>

        <div className="form-group">
          <label>Reason for Request *</label>
          <textarea
            name="reason"
            value={requestForm.reason}
            onChange={handleChange}
            required
          />
        </div>

        <div className="form-group">
          <label>Urgency</label>
          <select
            name="urgency"
            value={requestForm.urgency}
            onChange={handleChange}
          >
            <option value="low">Low</option>
            <option value="normal">Normal</option>
            <option value="high">High</option>
          </select>
        </div>

        <button type="submit" disabled={isLoading}>
          {isLoading ? "Submitting..." : "Submit Request"}
        </button>
      </form>

      {requests.length > 0 && (
        <div className="requests-list">
          <h3>Previous Requests</h3>
          <table>
            <thead>
              <tr>
                <th>Book Title</th>
                <th>Status</th>
                <th>Date Requested</th>
              </tr>
            </thead>
            <tbody>
              {requests.map((request) => (
                <tr key={request._id}>
                  <td>{request.bookTitle}</td>
                  <td className={`status-${request.status}`}>
                    {request.status}
                  </td>
                  <td>{new Date(request.createdAt).toLocaleDateString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
