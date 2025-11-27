import { useState } from "react";
import "../styles/loan.css";

const POST_URL = "http://localhost:3000/api/loan";

export default function PostLoanTrack({ onSuccess, onCancel }) {
  const [formData, setFormData] = useState({
    id: "",
    firstname: "",
    lastname: "",
    registration_number: "",
    book_name: "",
    returning_date: "",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState(null);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);

    try {
      const response = await fetch(POST_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Failed to create loan");
      }

      const data = await response.json();
      onSuccess();
    } catch (err) {
      setError(err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="loan-form-container">
      <h2>Add New Loan Record</h2>
      {error && <div className="form-error">{error}</div>}

      <form onSubmit={handleSubmit} className="loan-form">
        <div className="form-grid">
          <div className="form-group">
            <label>User ID</label>
            <input
              type="text"
              name="id"
              value={formData.id}
              onChange={handleChange}
              required
            />
          </div>

          <div className="form-group">
            <label>First Name</label>
            <input
              type="text"
              name="firstname"
              value={formData.firstname}
              onChange={handleChange}
              required
            />
          </div>

          <div className="form-group">
            <label>Last Name</label>
            <input
              type="text"
              name="lastname"
              value={formData.lastname}
              onChange={handleChange}
              required
            />
          </div>

          {/* <div className="form-group">
            <label>Username</label>
            <input
              type="text"
              name="username"
              value={formData.username}
              onChange={handleChange}
              required
            />
          </div> */}

          <div className="form-group">
            <label>Matric Number</label>
            <input
              type="text"
              name="registration_number"
              value={formData.registration_number}
              onChange={handleChange}
              required
            />
          </div>

          <div className="form-group">
            <label>Book Name</label>
            <input
              type="text"
              name="book_name"
              value={formData.book_name}
              onChange={handleChange}
              required
            />
          </div>

          <div className="form-group">
            <label>Return Date</label>
            <input
              type="date"
              name="returning_date"
              value={formData.returning_date}
              onChange={handleChange}
            />
          </div>
        </div>

        <div className="form-actions">
          <button
            type="button"
            className="cancel-btn"
            onClick={onCancel}
            disabled={isSubmitting}
          >
            Cancel
          </button>
          <button type="submit" className="submit-btn" disabled={isSubmitting}>
            {isSubmitting ? "Submitting..." : "Submit"}
          </button>
        </div>
      </form>
    </div>
  );
}
