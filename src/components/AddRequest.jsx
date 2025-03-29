import { useState, useEffect } from "react";
import { toast } from "react-toastify";
import "../styles/addRequest.css";

// const role = JSON.parse(localStorage.getItem("dear-user"));
const URL = "https://circulation-system-server-ql2i.onrender.com/api/makerequest";

const role = JSON.parse(localStorage.getItem("dear-user"));
export default function AddRequest() {
  const [requestForm, setRequestForm] = useState({
    username: role.firstname + " " + role.lastname,
    role: role.role,
    bookname: "",
    matric_no: "",
    color: "red",
  });

  const [requests, setRequests] = useState([]);
  const [isLoading, setIsLoading] = useState(false);

  function handleChange(e) {
    const { name, value } = e.target;
    setRequestForm((prev) => ({
      ...prev,
      [name]: value,
    }));
  }

  async function sendData(e) {
    e.preventDefault();
    setIsLoading(true);

    try {
      const res = await fetch(URL, {
        headers: { "Content-Type": "application/json" },
        method: "POST",
        body: JSON.stringify(requestForm),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.message || "Failed to submit request");
      }

      toast.success(data.message || "Request submitted successfully!");
      setRequests([...requests, data.data]);
      setRequestForm({
        ...requestForm,
        bookname: "",
        matric_no: "",
        color: "red",
      });
    } catch (error) {
      console.error("Error submitting request:", error);
      toast.error(
        error.message || "An error occurred while submitting the request"
      );
    } finally {
      setIsLoading(false);
    }
  }

  // Function to fetch requests
  const fetchRequests = async () => {
    try {
      const res = await fetch("https://circulation-system-server-ql2i.onrender.com/api/makerequest/get");
      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.message || "Failed to fetch requests");
      }

      setRequests(data.data || []);
    } catch (error) {
      console.error("Error fetching requests:", error);
      toast.error(error.message || "Failed to load requests");
    }
  };

  // Load requests on component mount
  useEffect(() => {
    fetchRequests();
  }, []);

  return (
    <div className="request-container">
      <div className="request-card">
        <h2 className="request-title">📚 Make Request To Admins</h2>

        <form onSubmit={sendData} className="request-form">
          <div className="form-group">
            <label htmlFor="bookname" className="form-label">
              Book Name
            </label>
            <input
              type="text"
              id="bookname"
              name="bookname"
              placeholder="Enter book name"
              value={requestForm.bookname}
              onChange={handleChange}
              className="form-input"
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="matric_no" className="form-label">
              Matric Number
            </label>
            <input
              type="text"
              id="matric_no"
              name="matric_no"
              placeholder="Enter matric number"
              value={requestForm.matric_no}
              onChange={handleChange}
              className="form-input"
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="color" className="form-label">
              Select Color
            </label>
            <select
              id="color"
              name="color"
              value={requestForm.color}
              onChange={handleChange}
              className="form-select"
            >
              <option value="red">🔴 Red</option>
              <option value="blue">🔵 Blue</option>
              <option value="orange">🟠 Orange</option>
              <option value="purple">🟣 Purple</option>
              <option value="green">🟢 Green</option>
            </select>
          </div>

          <button type="submit" className="submit-btn">
            Submit Request
          </button>
        </form>
      </div>

      {requests.length > 0 && (
        <div className="requests-table-container">
          <h3 className="table-title">Your Requests</h3>
          <div className="table-wrapper">
            <table className="requests-table">
              <thead>
                <tr>
                  <th>Username</th>
                  <th>Role</th>
                  <th>Book Name</th>
                  <th>Matric Number</th>
                  <th>Color</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {requests.map((req, index) => (
                  <tr key={index}>
                    <td>{req.username}</td>
                    <td>{req.role}</td>
                    <td>{req.bookname}</td>
                    <td>{req.matric_no}</td>
                    <td>
                      <span
                        className="color-badge"
                        style={{ backgroundColor: req.color }}
                      ></span>
                    </td>
                    <td>{req.status}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
