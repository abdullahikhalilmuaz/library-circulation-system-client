import { useState } from "react";
import { toast } from "react-toastify";
import "../styles/addBook.css"; // You'll need to create this CSS file

export default function AddBook() {
  const [bookData, setBookData] = useState({
    title: "",
    author: "",
    isbn: "",
    issn: "",
    dateAdded: "",
    quantity: "",
    section: "circulation",
    description: "",
  });

  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setBookData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const response = await fetch("https://circulation-system-server-1.onrender.com/api/admin/books", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(bookData),
      });

      if (!response.ok) {
        throw new Error("Failed to add book");
      }

      const data = await response.json();
      toast.success("Book added successfully!");
      setBookData({
        title: "",
        author: "",
        isbn: "",
        issn: "",
        dateAdded: "",
        quantity: "",
        section: "circulation",
        description: "",
      });
    } catch (error) {
      toast.error(error.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="add-book-container">
      <h2 className="add-book-title">Add New Book</h2>
      <form onSubmit={handleSubmit} className="add-book-form">
        <div className="form-grid">
          <div className="form-group">
            <label htmlFor="title">Book Title*</label>
            <input
              type="text"
              id="title"
              name="title"
              value={bookData.title}
              onChange={handleChange}
              required
              placeholder="Enter book title"
            />
          </div>

          <div className="form-group">
            <label htmlFor="author">Author*</label>
            <input
              type="text"
              id="author"
              name="author"
              value={bookData.author}
              onChange={handleChange}
              required
              placeholder="Enter author name"
            />
          </div>

          <div className="form-group">
            <label htmlFor="isbn">ISBN*</label>
            <input
              type="text"
              id="isbn"
              name="isbn"
              value={bookData.isbn}
              onChange={handleChange}
              required
              placeholder="Enter ISBN"
            />
          </div>

          <div className="form-group">
            <label htmlFor="issn">ISSN</label>
            <input
              type="text"
              id="issn"
              name="issn"
              value={bookData.issn}
              onChange={handleChange}
              placeholder="Enter ISSN (if applicable)"
            />
          </div>

          <div className="form-group">
            <label htmlFor="dateAdded">Date Added*</label>
            <input
              type="date"
              id="dateAdded"
              name="dateAdded"
              value={bookData.dateAdded}
              onChange={handleChange}
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="quantity">Quantity*</label>
            <input
              type="number"
              id="quantity"
              name="quantity"
              value={bookData.quantity}
              onChange={handleChange}
              required
              min="1"
              placeholder="Number of copies"
            />
          </div>

          <div className="form-group">
            <label htmlFor="section">Section*</label>
            <select
              id="section"
              name="section"
              value={bookData.section}
              onChange={handleChange}
              required
            >
              <option value="circulation">Circulation Section</option>
              <option value="reserve">Reserve Section</option>
              <option value="reference">Reference Section</option>
            </select>
          </div>
        </div>

        <div className="form-group full-width">
          <label htmlFor="description">Description</label>
          <textarea
            id="description"
            name="description"
            value={bookData.description}
            onChange={handleChange}
            rows="4"
            placeholder="Enter book description (optional)"
          ></textarea>
        </div>

        <button type="submit" className="submit-btn" disabled={isSubmitting}>
          {isSubmitting ? "Adding Book..." : "Add Book"}
        </button>
      </form>
    </div>
  );
}
