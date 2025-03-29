import React, { useState, useEffect } from "react";
import {
  FiBook,
  FiClock,
  FiUser,
  FiShoppingCart,
  FiRefreshCw,
} from "react-icons/fi";
import { toast } from "react-toastify";
import "../styles/viewBooks.css";

export default function ViewBooks() {
  const [books, setBooks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [userData, setUserData] = useState(null);
  const [refreshing, setRefreshing] = useState(false);

  const fetchBooks = async () => {
    try {
      const response = await fetch("https://circulation-system-server-ql2i.onrender.com/api/admin/books");
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const data = await response.json();
      setBooks(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error("Fetch error:", error);
      toast.error("Failed to load books");
      setBooks([]);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    const storedUser = JSON.parse(localStorage.getItem("dear-user"));
    setUserData(storedUser);
    fetchBooks();
  }, []);

  const addToCart = async (book) => {
    if (!userData) {
      toast.error("Please login to add books to cart");
      return;
    }

    try {
      const response = await fetch("https://circulation-system-server-ql2i.onrender.com/api/cart", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          userId: userData.id,
          book: {
            id: book.id,
            title: book.title,
            author: book.author,
            isbn: book.isbn,
            section: book.section,
          },
        }),
      });

      if (!response.ok) throw new Error("Failed to add to cart");

      const updatedCart = await response.json();
      toast.success(`${book.title} added to cart`);
    } catch (error) {
      toast.error(error.message);
      console.error("Cart error:", error);
    }
  };

  const handleRefresh = () => {
    setRefreshing(true);
    fetchBooks();
  };

  if (loading) {
    return (
      <div className="loading-container">
        <div className="spinner"></div>
        <p>Loading books...</p>
      </div>
    );
  }

  return (
    <div className="view-books-container">
      <div className="view-books-header">
        <div>
          <h1>
            <FiBook /> Our Book Collection
          </h1>
          <p className="subtitle">Browse and add books to your cart</p>
        </div>
        <button
          onClick={handleRefresh}
          className="refresh-btn"
          disabled={refreshing}
        >
          <FiRefreshCw className={refreshing ? "spinning" : ""} />
          {refreshing ? "Refreshing..." : "Refresh"}
        </button>
      </div>

      <div className="books-grid">
        {books.length > 0 ? (
          books.map((book) => (
            <div key={book.id} className="book-card">
              <div className="book-cover">
                <FiBook size={48} />
                {book.section && (
                  <span
                    className={`section-badge ${book.section.toLowerCase()}`}
                  >
                    {book.section}
                  </span>
                )}
              </div>
              <div className="book-details">
                <h3>{book.title}</h3>
                <p className="book-author">by {book.author}</p>

                <div className="book-meta">
                  <span>
                    <FiUser /> {book.section}
                  </span>
                  <span>
                    <FiClock /> Added:{" "}
                    {new Date(book.dateAdded).toLocaleDateString()}
                  </span>
                </div>

                <div className="book-stats">
                  <div
                    className={`availability ${
                      book.quantity > 0 ? "available" : "unavailable"
                    }`}
                  >
                    {book.quantity > 0
                      ? `${book.quantity} available`
                      : "Out of stock"}
                  </div>
                  <div className="isbn">ISBN: {book.isbn}</div>
                </div>

                {book.description && (
                  <p className="book-description">{book.description}</p>
                )}

                <button 
                  onClick={() => addToCart(book)}
                  disabled={book.quantity <= 0}
                  className={`cart-btn ${book.quantity <= 0 ? "disabled" : ""}`}
                >
                  <FiShoppingCart /> Add to Cart
                </button>
              </div>
            </div>
          ))
        ) : (
          <div className="no-books">
            <p>No books available at the moment. Please check back later.</p>
            <button onClick={handleRefresh} className="refresh-btn">
              <FiRefreshCw /> Try Again
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
