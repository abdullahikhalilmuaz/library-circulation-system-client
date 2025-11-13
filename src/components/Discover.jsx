import { useState, useEffect } from "react";
import "../styles/discover.css";

// Move UserRecommendationForm outside of the main component
const UserRecommendationForm = ({ 
  userRecommendation, 
  setUserRecommendation, 
  submitting, 
  setSubmitting, 
  setShowRecommendationForm,
  userData,
  fetchStudentRecommendations 
}) => {
  const submitUserRecommendation = async () => {
    if (!userData || !userData.id) {
      alert('Please log in to recommend books');
      return;
    }

    if (!userRecommendation.title.trim() || !userRecommendation.author.trim() || !userRecommendation.reason.trim()) {
      alert('Please fill in all required fields: Title, Author, and Reason');
      return;
    }

    if (userRecommendation.bookLink && !isValidUrl(userRecommendation.bookLink)) {
      alert('Please enter a valid URL (starting with http:// or https://)');
      return;
    }

    setSubmitting(true);
    try {
      const response = await fetch('https://circulation-system-server-1.onrender.com/api/user-recommendations', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...userRecommendation,
          userId: userData.id,
          userName: `${userData.firstname} ${userData.lastname}`
        })
      });

      const result = await response.json();

      if (result.success) {
        alert('Thank you for your recommendation! Our librarians will review it.');
        setUserRecommendation({
          title: "",
          author: "",
          reason: "",
          genre: "",
          bookLink: ""
        });
        setShowRecommendationForm(false);
        // Refresh student recommendations
        fetchStudentRecommendations();
      } else {
        alert(result.message || 'Failed to submit recommendation. Please try again.');
      }
    } catch (error) {
      console.error('Error submitting recommendation:', error);
      alert('Error submitting recommendation');
    } finally {
      setSubmitting(false);
    }
  };

  // URL validation function
  const isValidUrl = (string) => {
    try {
      new URL(string);
      return true;
    } catch (_) {
      return false;
    }
  };

  return (
    <div className="user-recommendation-form">
      <h3>Recommend a Book</h3>
      <p>Suggest books you'd love to see in our library!</p>
      
      <div className="form-group">
        <label>Book Title *</label>
        <input
          type="text"
          value={userRecommendation.title}
          onChange={(e) => setUserRecommendation(prev => ({...prev, title: e.target.value}))}
          placeholder="Enter book title"
          className="form-input"
        />
      </div>

      <div className="form-group">
        <label>Author *</label>
        <input
          type="text"
          value={userRecommendation.author}
          onChange={(e) => setUserRecommendation(prev => ({...prev, author: e.target.value}))}
          placeholder="Enter author name"
          className="form-input"
        />
      </div>

      <div className="form-group">
        <label>Genre</label>
        <select
          value={userRecommendation.genre}
          onChange={(e) => setUserRecommendation(prev => ({...prev, genre: e.target.value}))}
          className="form-select"
        >
          <option value="">Select Genre</option>
          <option value="Fiction">Fiction</option>
          <option value="Non-Fiction">Non-Fiction</option>
          <option value="Science Fiction">Science Fiction</option>
          <option value="Fantasy">Fantasy</option>
          <option value="Mystery">Mystery</option>
          <option value="Romance">Romance</option>
          <option value="Thriller">Thriller</option>
          <option value="Biography">Biography</option>
          <option value="History">History</option>
          <option value="Science">Science</option>
          <option value="Technology">Technology</option>
          <option value="Self-Help">Self-Help</option>
          <option value="Other">Other</option>
        </select>
      </div>

      <div className="form-group">
        <label>Book Link (Optional)</label>
        <input
          type="url"
          value={userRecommendation.bookLink}
          onChange={(e) => setUserRecommendation(prev => ({...prev, bookLink: e.target.value}))}
          placeholder="https://example.com/book-info"
          className="form-input"
        />
        <small className="field-hint">
          Add a link to the book's website, Amazon, Goodreads, or publisher page
        </small>
      </div>

      <div className="form-group">
        <label>Why do you recommend this book? *</label>
        <textarea
          value={userRecommendation.reason}
          onChange={(e) => setUserRecommendation(prev => ({...prev, reason: e.target.value}))}
          placeholder="Tell us why this book would be great for our library..."
          rows="4"
          className="form-textarea"
        />
      </div>

      <div className="form-actions">
        <button 
          onClick={() => setShowRecommendationForm(false)}
          className="cancel-btn"
        >
          Cancel
        </button>
        <button 
          onClick={submitUserRecommendation}
          disabled={submitting || !userRecommendation.title.trim() || !userRecommendation.author.trim() || !userRecommendation.reason.trim()}
          className="submit-recommendation-btn"
        >
          {submitting ? 'Submitting...' : 'Submit Recommendation'}
        </button>
      </div>
    </div>
  );
};

// Also move StudentRecommendationCard outside
const StudentRecommendationCard = ({ recommendation }) => {
  // Generate book cover based on genre
  const generateBookCover = (genre, title) => {
    const genreIcons = {
      'Fiction': '📖',
      'Non-Fiction': '📚',
      'Science Fiction': '🚀',
      'Fantasy': '🐉',
      'Mystery': '🕵️',
      'Romance': '💖',
      'Thriller': '🔪',
      'Biography': '👤',
      'History': '🏛️',
      'Science': '🔬',
      'Technology': '💻',
      'Self-Help': '💪',
      'Other': '📕'
    };
    
    return genreIcons[genre] || '📚';
  };

  return (
    <div className="student-recommendation-card">
      <div className="recommendation-header">
        <div className="book-cover">
          {generateBookCover(recommendation.genre, recommendation.title)}
        </div>
        <div className="recommendation-basic-info">
          <h3>{recommendation.title}</h3>
          <p className="recommendation-author">by {recommendation.author}</p>
          <div className="recommendation-meta">
            <span className="genre-badge">{recommendation.genre || 'General'}</span>
            {/* <span className="status-badge">{recommendation.status}</span> */}
          </div>
          <p className="recommended-by">Recommended by {recommendation.userName}</p>
        </div>
      </div>

      <div className="recommendation-details">
        <div className="recommendation-reason">
          <strong>Why they recommend it:</strong>
          <p>{recommendation.reason}</p>
        </div>

        {recommendation.bookLink && (
          <div className="book-link-section">
            <a 
              href={recommendation.bookLink} 
              target="_blank" 
              rel="noopener noreferrer"
              className="book-link"
            >
              🔗 View Book Details
            </a>
          </div>
        )}

        <div className="recommendation-footer">
          <span className="recommendation-date">
            Suggested on {new Date(recommendation.createdAt).toLocaleDateString()}
          </span>
          {recommendation.status === 'approved' && (
            <span className="approved-badge">✅ Approved by Library</span>
          )}
          {recommendation.status === 'rejected' && (
            <span className="rejected-badge">❌ Not Selected</span>
          )}
        </div>
      </div>
    </div>
  );
};

// Main Discover Component
export default function Discover() {
  const [recommendedBooks, setRecommendedBooks] = useState([]);
  const [popularBooks, setPopularBooks] = useState([]);
  const [recentBooks, setRecentBooks] = useState([]);
  const [studentRecommendations, setStudentRecommendations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [expandedBook, setExpandedBook] = useState(null);
  const [userRating, setUserRating] = useState({});
  const [activeTab, setActiveTab] = useState("recommended");
  
  // User recommendation states
  const [showRecommendationForm, setShowRecommendationForm] = useState(false);
  const [userRecommendation, setUserRecommendation] = useState({
    title: "",
    author: "",
    reason: "",
    genre: "",
    bookLink: ""
  });
  const [submitting, setSubmitting] = useState(false);

  // Get user data from localStorage
  const userData = JSON.parse(localStorage.getItem("dear-user"));

  // Fetch recommendations from backend
  const fetchRecommendations = async () => {
    try {
      const response = await fetch('https://circulation-system-server-1.onrender.com/api/recommendations');
      const data = await response.json();
      
      if (data.success) {
        setRecommendedBooks(data.recommended || []);
        setPopularBooks(data.popular || []);
        setRecentBooks(data.recent || []);
      }
    } catch (error) {
      console.error('Error fetching recommendations:', error);
      setRecommendedBooks([]);
      setPopularBooks([]);
      setRecentBooks([]);
    } finally {
      setLoading(false);
    }
  };

  // Fetch student recommendations
  const fetchStudentRecommendations = async () => {
    try {
      const response = await fetch('https://circulation-system-server-1.onrender.com/api/user-recommendations');
      const data = await response.json();
      
      if (data.success) {
        setStudentRecommendations(data.recommendations || []);
      }
    } catch (error) {
      console.error('Error fetching student recommendations:', error);
      setStudentRecommendations([]);
    }
  };

  useEffect(() => {
    fetchRecommendations();
    fetchStudentRecommendations();
  }, []);

  // Rate a book
  const rateBook = async (bookId, stars) => {
    if (!userData || !userData.id) {
      alert('Please log in to rate books');
      return;
    }

    try {
      const response = await fetch(`https://circulation-system-server-1.onrender.com/api/recommendations/rate/${bookId}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId: userData.id,
          stars: stars
        })
      });

      const result = await response.json();
      
      if (result.success) {
        setUserRating(prev => ({
          ...prev,
          [bookId]: stars
        }));
        fetchRecommendations();
        alert('Rating submitted successfully!');
      } else {
        alert('Failed to submit rating');
      }
    } catch (error) {
      console.error('Error rating book:', error);
      alert('Error submitting rating');
    }
  };

  const toggleExpand = (bookId) => {
    setExpandedBook(expandedBook === bookId ? null : bookId);
  };

  const addToSelections = (book) => {
    console.log("Adding to selections:", book);
    alert(`Added "${book.title}" to your selections!`);
  };

  // Generate book cover based on genre (for regular books)
  const generateBookCover = (genre, title) => {
    const genreIcons = {
      'Fiction': '📖',
      'Non-Fiction': '📚',
      'Science Fiction': '🚀',
      'Fantasy': '🐉',
      'Mystery': '🕵️',
      'Romance': '💖',
      'Thriller': '🔪',
      'Biography': '👤',
      'History': '🏛️',
      'Science': '🔬',
      'Technology': '💻',
      'Self-Help': '💪',
      'Other': '📕'
    };
    
    return genreIcons[genre] || '📚';
  };

  // Star Rating Component (keep this inside since it uses state)
  const StarRatingDisplay = ({ rating, totalRatings, bookId, showInput = false }) => {
    const fullStars = Math.floor(rating);
    const hasHalfStar = rating % 1 >= 0.5;
    const currentUserRating = userRating[bookId];

    return (
      <div className="star-rating-section">
        <div className="stars-display">
          {[...Array(5)].map((_, index) => {
            const starValue = index + 1;
            let starClass = "star";
            
            if (starValue <= fullStars) {
              starClass += " full";
            } else if (starValue === fullStars + 1 && hasHalfStar) {
              starClass += " half";
            } else {
              starClass += " empty";
            }

            return (
              <span key={index} className={starClass}>
                {starClass.includes('empty') ? '☆' : '⭐'}
              </span>
            );
          })}
          <span className="rating-text">
            {rating ? rating.toFixed(1) : 'No ratings'} ({totalRatings || 0})
          </span>
        </div>

        {showInput && userData && (
          <div className="rate-book-section">
            <p>Rate this book:</p>
            <div className="rating-stars-input">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  className={`star-input ${currentUserRating >= star ? 'active' : ''}`}
                  onClick={() => rateBook(bookId, star)}
                >
                  {currentUserRating >= star ? '⭐' : '☆'}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>
    );
  };

  if (loading) {
    return <div className="discover-loading">Discovering great books for you...</div>;
  }

  const allBooks = [...recommendedBooks, ...popularBooks, ...recentBooks];
  const uniqueBooks = allBooks.filter((book, index, self) => 
    index === self.findIndex(b => b.id === book.id)
  );

  const renderBookCard = (book) => (
    <div 
      key={book.id} 
      className={`book-card ${expandedBook === book.id ? 'expanded' : ''}`}
    >
      <div className="book-header">
        <div className="book-cover">{book.cover || '📚'}</div>
        <div className="book-basic-info">
          <h3>{book.title}</h3>
          <p className="book-author">by {book.author}</p>
          <StarRatingDisplay 
            rating={book.averageRating || book.starRating?.average || 0}
            totalRatings={book.totalRatings || book.starRating?.totalRatings || 0}
            bookId={book.id}
          />
        </div>
      </div>
      
      <button 
        className="expand-button"
        onClick={() => toggleExpand(book.id)}
      >
        {expandedBook === book.id ? '▲ Show Less' : '▼ Learn More'}
      </button>

      {expandedBook === book.id && (
        <div className="book-details">
          <div className="book-meta">
            <span>📅 {book.year || 'N/A'}</span>
            {/* <span>📄 {book.pages || 'N/A'} pages</span> */}
            <span>🏷️ {book.genre || 'General'}</span>
            {book.checkoutCount && <span>📊 {book.checkoutCount} checkouts</span>}
          </div>
          <p className="book-description">{book.description || 'No description available.'}</p>
          
          {book.recommendationReason && (
            <div className="recommendation-reason">
              <strong>Why we recommend it:</strong> {book.recommendationReason}
            </div>
          )}
          
          <StarRatingDisplay 
            rating={book.averageRating || book.starRating?.average || 0}
            totalRatings={book.totalRatings || book.starRating?.totalRatings || 0}
            bookId={book.id}
            showInput={true}
          />
          
          <div className="book-actions">
            {/* <button 
              className="add-to-selections-btn"
              onClick={() => addToSelections(book)}
            >
              + Add to My Selections
            </button> */}
          </div>
        </div>
      )}
    </div>
  );

  return (
    <div className="discover-container">
      <div className="discover-header">
        <h1>Discover Your Next Read</h1>
        <p>Books curated just for you based on your interests</p>
      </div>

      {/* Tab Navigation with Recommend Button */}
      <div className="discover-tabs-container">
        <div className="discover-tabs">
          <button 
            className={`tab-button ${activeTab === 'recommended' ? 'active' : ''}`}
            onClick={() => setActiveTab('recommended')}
          >
            Recommended For You
          </button>
          <button 
            className={`tab-button ${activeTab === 'popular' ? 'active' : ''}`}
            onClick={() => setActiveTab('popular')}
          >
            Popular Books
          </button>
          <button 
            className={`tab-button ${activeTab === 'recent' ? 'active' : ''}`}
            onClick={() => setActiveTab('recent')}
          >
            Recently Added
          </button>
          <button 
            className={`tab-button ${activeTab === 'student' ? 'active' : ''}`}
            onClick={() => setActiveTab('student')}
          >
            Student Recommendations
          </button>
          <button 
            className={`tab-button ${activeTab === 'all' ? 'active' : ''}`}
            onClick={() => setActiveTab('all')}
          >
            All Books
          </button>
        </div>

        {userData && (
          <div className="recommend-button-container">
            <button 
              onClick={() => setShowRecommendationForm(!showRecommendationForm)}
              className={`recommend-book-btn ${showRecommendationForm ? 'active' : ''}`}
            >
              📚 Recommend a Book
            </button>
          </div>
        )}
      </div>

      {/* User Recommendation Form */}
      {showRecommendationForm && (
        <div className="user-recommendation-section">
          <UserRecommendationForm 
            userRecommendation={userRecommendation}
            setUserRecommendation={setUserRecommendation}
            submitting={submitting}
            setSubmitting={setSubmitting}
            setShowRecommendationForm={setShowRecommendationForm}
            userData={userData}
            fetchStudentRecommendations={fetchStudentRecommendations}
          />
        </div>
      )}

      {/* Tab Content */}
      <div className="tab-content">
        {activeTab === 'recommended' && (
          <section className="books-section">
            <h2>Recommended For You</h2>
            {recommendedBooks.length > 0 ? (
              <div className="books-grid">
                {recommendedBooks.map(renderBookCard)}
              </div>
            ) : (
              <div className="no-books-message">
                <p>No recommendations available yet. Check out our popular books!</p>
                {userData && !showRecommendationForm && (
                  <button 
                    onClick={() => setShowRecommendationForm(true)}
                    className="suggest-books-btn"
                  >
                    Suggest Books You'd Like to See
                  </button>
                )}
              </div>
            )}
          </section>
        )}

        {activeTab === 'popular' && (
          <section className="books-section">
            <h2>Popular in Library</h2>
            {popularBooks.length > 0 ? (
              <div className="books-grid">
                {popularBooks.map(renderBookCard)}
              </div>
            ) : (
              <div className="no-books-message">
                <p>No popular books data available.</p>
              </div>
            )}
          </section>
        )}

        {activeTab === 'recent' && (
          <section className="books-section">
            <h2>Recently Added</h2>
            {recentBooks.length > 0 ? (
              <div className="books-grid">
                {recentBooks.map(renderBookCard)}
              </div>
            ) : (
              <div className="no-books-message">
                <p>No recently added books.</p>
              </div>
            )}
          </section>
        )}

        {activeTab === 'student' && (
          <section className="books-section">
            <h2>Student Recommendations ({studentRecommendations.length})</h2>
            {studentRecommendations.length > 0 ? (
              <div className="student-recommendations-grid">
                {studentRecommendations.map((recommendation) => (
                  <StudentRecommendationCard 
                    key={recommendation.id} 
                    recommendation={recommendation} 
                  />
                ))}
              </div>
            ) : (
              <div className="no-books-message">
                <p>No student recommendations yet. Be the first to suggest a book!</p>
                {userData && !showRecommendationForm && (
                  <button 
                    onClick={() => setShowRecommendationForm(true)}
                    className="suggest-books-btn"
                  >
                    Recommend a Book
                  </button>
                )}
              </div>
            )}
          </section>
        )}

        {activeTab === 'all' && (
          <section className="books-section">
            <h2>All Available Books</h2>
            {uniqueBooks.length > 0 ? (
              <div className="books-grid">
                {uniqueBooks.map(renderBookCard)}
              </div>
            ) : (
              <div className="no-books-message">
                <p>No books available in the library.</p>
              </div>
            )}
          </section>
        )}
      </div>
    </div>
  );
}