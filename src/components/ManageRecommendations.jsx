import { useState, useEffect } from "react";
import { toast } from "react-toastify";
import "../styles/manage-recommendations.css";

export default function ManageRecommendations() {
  const [books, setBooks] = useState([]);
  const [recommendations, setRecommendations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedBook, setSelectedBook] = useState("");
  const [recommendationReason, setRecommendationReason] = useState("");
  const [searchTerm, setSearchTerm] = useState("");

  // Fetch all books and current recommendations
  const fetchData = async () => {
    try {
      setLoading(true);
      
      // Fetch all books
      const booksResponse = await fetch('https://circulation-system-server-ql2i.onrender.com/api/books/all');
      const booksData = await booksResponse.json();
      
      // Fetch current recommendations
      const recResponse = await fetch('https://circulation-system-server-ql2i.onrender.com/api/recommendations');
      const recData = await recResponse.json();

      if (booksData.message) {
        setBooks(booksData.message);
      }

      if (recData.success) {
        // Extract recommended book IDs
        const recommendedBookIds = recData.recommended.map(book => book.id);
        setRecommendations(recommendedBookIds);
      }
    } catch (error) {
      console.error('Error fetching data:', error);
      toast.error('Failed to load data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // Add book to recommendations
  const addRecommendation = async () => {
    if (!selectedBook) {
      toast.error('Please select a book');
      return;
    }

    if (!recommendationReason.trim()) {
      toast.error('Please provide a recommendation reason');
      return;
    }

    try {
      const response = await fetch('https://circulation-system-server-ql2i.onrender.com/api/recommendations/add', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          bookId: selectedBook,
          reason: recommendationReason
        })
      });

      const result = await response.json();

      if (result.success) {
        toast.success('Book added to recommendations!');
        setSelectedBook("");
        setRecommendationReason("");
        fetchData(); // Refresh data
      } else {
        toast.error(result.message || 'Failed to add recommendation');
      }
    } catch (error) {
      console.error('Error adding recommendation:', error);
      toast.error('Failed to add recommendation');
    }
  };

  // Remove book from recommendations
  const removeRecommendation = async (bookId) => {
    if (!window.confirm('Are you sure you want to remove this book from recommendations?')) {
      return;
    }

    try {
      const response = await fetch(`https://circulation-system-server-ql2i.onrender.com/api/recommendations/remove/${bookId}`, {
        method: 'DELETE'
      });

      const result = await response.json();

      if (result.success) {
        toast.success('Book removed from recommendations!');
        fetchData(); // Refresh data
      } else {
        toast.error(result.message || 'Failed to remove recommendation');
      }
    } catch (error) {
      console.error('Error removing recommendation:', error);
      toast.error('Failed to remove recommendation');
    }
  };

  // Filter books based on search
  const filteredBooks = books.filter(book => 
    book.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    book.author?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    book.genre?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Get recommended books
  const recommendedBooks = books.filter(book => 
    recommendations.includes(book.id)
  );

  if (loading) {
    return <div className="manage-recommendations-loading">Loading recommendations...</div>;
  }

  return (
    <div className="manage-recommendations-container">
      <div className="manage-recommendations-header">
        <h1>Manage Book Recommendations</h1>
        <p>Curate featured books for users to discover</p>
      </div>

      <div className="recommendations-layout">
        {/* Add Recommendation Section */}
        <div className="add-recommendation-section">
          <h2>Add New Recommendation</h2>
          <div className="add-recommendation-form">
            <div className="form-group">
              <label>Select Book:</label>
              <select 
                value={selectedBook} 
                onChange={(e) => setSelectedBook(e.target.value)}
                className="book-select"
              >
                <option value="">Choose a book...</option>
                {filteredBooks
                  .filter(book => !recommendations.includes(book.id))
                  .map(book => (
                    <option key={book.id} value={book.id}>
                      {book.title} by {book.author} ({book.genre})
                    </option>
                  ))
                }
              </select>
            </div>

            <div className="form-group">
              <label>Recommendation Reason:</label>
              <textarea
                value={recommendationReason}
                onChange={(e) => setRecommendationReason(e.target.value)}
                placeholder="Why are you recommending this book? (e.g., 'Great for fantasy lovers', 'Award-winning classic', etc.)"
                rows="4"
                className="reason-textarea"
              />
            </div>

            <button 
              onClick={addRecommendation}
              className="add-recommendation-btn"
              disabled={!selectedBook || !recommendationReason.trim()}
            >
              Add to Recommendations
            </button>
          </div>
        </div>

        {/* Current Recommendations Section */}
        <div className="current-recommendations-section">
          <h2>Current Recommendations ({recommendedBooks.length})</h2>
          
          {recommendedBooks.length === 0 ? (
            <div className="no-recommendations">
              <p>No books are currently recommended.</p>
              <p>Add some books to help users discover great reads!</p>
            </div>
          ) : (
            <div className="recommendations-grid">
              {recommendedBooks.map(book => (
                <div key={book.id} className="recommendation-card">
                  <div className="recommendation-header">
                    <div className="book-cover">📚</div>
                    <div className="book-info">
                      <h3>{book.title}</h3>
                      <p className="book-author">by {book.author}</p>
                      <p className="book-genre">{book.genre}</p>
                      {book.averageRating && (
                        <div className="book-rating">
                          ⭐ {book.averageRating.toFixed(1)} 
                          {book.totalRatings && ` (${book.totalRatings})`}
                        </div>
                      )}
                    </div>
                  </div>
                  
                  <div className="recommendation-actions">
                    <button 
                      onClick={() => removeRecommendation(book.id)}
                      className="remove-recommendation-btn"
                    >
                      Remove Recommendation
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* All Books Section for Reference */}
      <div className="all-books-section">
        <h2>All Available Books ({books.length})</h2>
        <div className="search-box">
          <input
            type="text"
            placeholder="Search books by title, author, or genre..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="search-input"
          />
        </div>
        
        <div className="books-reference-list">
          {filteredBooks.slice(0, 20).map(book => (
            <div 
              key={book.id} 
              className={`book-reference-item ${recommendations.includes(book.id) ? 'recommended' : ''}`}
            >
              <div className="book-ref-info">
                <h4>{book.title}</h4>
                <p>by {book.author} • {book.genre}</p>
                {book.averageRating && (
                  <span className="ref-rating">⭐ {book.averageRating.toFixed(1)}</span>
                )}
              </div>
              <div className="book-ref-status">
                {recommendations.includes(book.id) ? (
                  <span className="status-badge recommended-badge">Recommended</span>
                ) : (
                  <span className="status-badge available-badge">Available</span>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}