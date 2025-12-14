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
      const response = await fetch('https://circulation-system-server-ql2i.onrender.com/api/user-recommendations', {
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

// Sample books data for each genre
const sampleBooksByGenre = {
  'Fiction': [
    { id: 1, title: "The Great Gatsby", author: "F. Scott Fitzgerald", genre: "Fiction", description: "A classic novel of the Jazz Age", year: 1925, averageRating: 4.5, totalRatings: 120 },
    { id: 2, title: "To Kill a Mockingbird", author: "Harper Lee", genre: "Fiction", description: "A gripping tale of racial injustice", year: 1960, averageRating: 4.8, totalRatings: 95 },
    { id: 3, title: "1984", author: "George Orwell", genre: "Fiction", description: "A dystopian social science fiction novel", year: 1949, averageRating: 4.7, totalRatings: 110 },
    { id: 4, title: "Pride and Prejudice", author: "Jane Austen", genre: "Fiction", description: "A romantic novel of manners", year: 1813, averageRating: 4.6, totalRatings: 88 },
    { id: 5, title: "The Catcher in the Rye", author: "J.D. Salinger", genre: "Fiction", description: "A controversial coming-of-age story", year: 1951, averageRating: 4.2, totalRatings: 75 },
    { id: 6, title: "The Lord of the Flies", author: "William Golding", genre: "Fiction", description: "A story of stranded schoolboys", year: 1954, averageRating: 4.3, totalRatings: 82 },
    { id: 7, title: "The Kite Runner", author: "Khaled Hosseini", genre: "Fiction", description: "A story of friendship and redemption", year: 2003, averageRating: 4.7, totalRatings: 105 },
    { id: 8, title: "The Alchemist", author: "Paulo Coelho", genre: "Fiction", description: "A philosophical novel about destiny", year: 1988, averageRating: 4.5, totalRatings: 150 },
    { id: 9, title: "Life of Pi", author: "Yann Martel", genre: "Fiction", description: "A survival story with a Bengal tiger", year: 2001, averageRating: 4.4, totalRatings: 92 },
    { id: 10, title: "The Book Thief", author: "Markus Zusak", genre: "Fiction", description: "A story set in Nazi Germany", year: 2005, averageRating: 4.8, totalRatings: 115 }
  ],
  'Non-Fiction': [
    { id: 11, title: "Sapiens", author: "Yuval Noah Harari", genre: "Non-Fiction", description: "A brief history of humankind", year: 2011, averageRating: 4.7, totalRatings: 95 },
    { id: 12, title: "Educated", author: "Tara Westover", genre: "Non-Fiction", description: "A memoir about self-education", year: 2018, averageRating: 4.8, totalRatings: 88 },
    { id: 13, title: "The Diary of a Young Girl", author: "Anne Frank", genre: "Non-Fiction", description: "The diary of a Jewish girl in hiding", year: 1947, averageRating: 4.9, totalRatings: 120 },
    { id: 14, title: "Into the Wild", author: "Jon Krakauer", genre: "Non-Fiction", description: "The story of Christopher McCandless", year: 1996, averageRating: 4.4, totalRatings: 78 },
    { id: 15, title: "The Immortal Life of Henrietta Lacks", author: "Rebecca Skloot", genre: "Non-Fiction", description: "Medical ethics and HeLa cells", year: 2010, averageRating: 4.6, totalRatings: 85 },
    { id: 16, title: "Quiet", author: "Susan Cain", genre: "Non-Fiction", description: "The power of introverts", year: 2012, averageRating: 4.5, totalRatings: 72 },
    { id: 17, title: "The Sixth Extinction", author: "Elizabeth Kolbert", genre: "Non-Fiction", description: "An unnatural history of extinction", year: 2014, averageRating: 4.4, totalRatings: 65 },
    { id: 18, title: "Bad Blood", author: "John Carreyrou", genre: "Non-Fiction", description: "Secrets and lies in a Silicon Valley startup", year: 2018, averageRating: 4.7, totalRatings: 90 },
    { id: 19, title: "Thinking, Fast and Slow", author: "Daniel Kahneman", genre: "Non-Fiction", description: "Psychology of decision making", year: 2011, averageRating: 4.6, totalRatings: 82 },
    { id: 20, title: "The Power of Habit", author: "Charles Duhigg", genre: "Non-Fiction", description: "Why we do what we do", year: 2012, averageRating: 4.5, totalRatings: 75 }
  ],
  'Science Fiction': [
    { id: 21, title: "Dune", author: "Frank Herbert", genre: "Science Fiction", description: "Epic space opera on desert planet", year: 1965, averageRating: 4.8, totalRatings: 110 },
    { id: 22, title: "Foundation", author: "Isaac Asimov", genre: "Science Fiction", description: "Galactic empire psychohistory", year: 1951, averageRating: 4.6, totalRatings: 95 },
    { id: 23, title: "Neuromancer", author: "William Gibson", genre: "Science Fiction", description: "Cyberpunk classic", year: 1984, averageRating: 4.4, totalRatings: 88 },
    { id: 24, title: "The Martian", author: "Andy Weir", genre: "Science Fiction", description: "An astronaut stranded on Mars", year: 2011, averageRating: 4.7, totalRatings: 105 },
    { id: 25, title: "Snow Crash", author: "Neal Stephenson", genre: "Science Fiction", description: "Cyberpunk and information virus", year: 1992, averageRating: 4.3, totalRatings: 78 },
    { id: 26, title: "The Left Hand of Darkness", author: "Ursula K. Le Guin", genre: "Science Fiction", description: "Gender and diplomacy", year: 1969, averageRating: 4.5, totalRatings: 82 },
    { id: 27, title: "Ender's Game", author: "Orson Scott Card", genre: "Science Fiction", description: "Child soldiers in space", year: 1985, averageRating: 4.6, totalRatings: 120 },
    { id: 28, title: "The Three-Body Problem", author: "Liu Cixin", genre: "Science Fiction", description: "Chinese science fiction epic", year: 2008, averageRating: 4.4, totalRatings: 85 },
    { id: 29, title: "Ready Player One", author: "Ernest Cline", genre: "Science Fiction", description: "Virtual reality treasure hunt", year: 2011, averageRating: 4.3, totalRatings: 95 },
    { id: 30, title: "Altered Carbon", author: "Richard K. Morgan", genre: "Science Fiction", description: "Consciousness and immortality", year: 2002, averageRating: 4.2, totalRatings: 70 }
  ],
  'Fantasy': [
    { id: 31, title: "The Hobbit", author: "J.R.R. Tolkien", genre: "Fantasy", description: "There and back again", year: 1937, averageRating: 4.9, totalRatings: 150 },
    { id: 32, title: "A Game of Thrones", author: "George R.R. Martin", genre: "Fantasy", description: "First in Song of Ice and Fire", year: 1996, averageRating: 4.7, totalRatings: 130 },
    { id: 33, title: "The Name of the Wind", author: "Patrick Rothfuss", genre: "Fantasy", description: "A hero's journey", year: 2007, averageRating: 4.8, totalRatings: 115 },
    { id: 34, title: "Mistborn: The Final Empire", author: "Brandon Sanderson", genre: "Fantasy", description: "Allomantic magic system", year: 2006, averageRating: 4.6, totalRatings: 95 },
    { id: 35, title: "The Lies of Locke Lamora", author: "Scott Lynch", genre: "Fantasy", description: "Gentleman bastards series", year: 2006, averageRating: 4.5, totalRatings: 88 },
    { id: 36, title: "American Gods", author: "Neil Gaiman", genre: "Fantasy", description: "Old gods vs new gods", year: 2001, averageRating: 4.4, totalRatings: 105 },
    { id: 37, title: "The Way of Kings", author: "Brandon Sanderson", genre: "Fantasy", description: "Stormlight Archive beginning", year: 2010, averageRating: 4.8, totalRatings: 120 },
    { id: 38, title: "The Fifth Season", author: "N.K. Jemisin", genre: "Fantasy", description: "Broken Earth trilogy start", year: 2015, averageRating: 4.6, totalRatings: 85 },
    { id: 39, title: "The Priory of the Orange Tree", author: "Samantha Shannon", genre: "Fantasy", description: "Epic feminist fantasy", year: 2019, averageRating: 4.5, totalRatings: 75 },
    { id: 40, title: "The City of Brass", author: "S.A. Chakraborty", genre: "Fantasy", description: "Middle Eastern fantasy", year: 2017, averageRating: 4.4, totalRatings: 68 }
  ],
  'Mystery': [
    { id: 41, title: "The Girl with the Dragon Tattoo", author: "Stieg Larsson", genre: "Mystery", description: "Swedish crime thriller", year: 2005, averageRating: 4.5, totalRatings: 110 },
    { id: 42, title: "Gone Girl", author: "Gillian Flynn", genre: "Mystery", description: "Psychological thriller", year: 2012, averageRating: 4.6, totalRatings: 125 },
    { id: 43, title: "The Da Vinci Code", author: "Dan Brown", genre: "Mystery", description: "Religious conspiracy thriller", year: 2003, averageRating: 4.3, totalRatings: 150 },
    { id: 44, title: "The Hound of the Baskervilles", author: "Arthur Conan Doyle", genre: "Mystery", description: "Sherlock Holmes classic", year: 1902, averageRating: 4.7, totalRatings: 95 },
    { id: 45, title: "Big Little Lies", author: "Liane Moriarty", genre: "Mystery", description: "Suburban secrets", year: 2014, averageRating: 4.4, totalRatings: 88 },
    { id: 46, title: "The Silent Patient", author: "Alex Michaelides", genre: "Mystery", description: "Psychological thriller", year: 2019, averageRating: 4.5, totalRatings: 105 },
    { id: 47, title: "In the Woods", author: "Tana French", genre: "Mystery", description: "Dublin Murder Squad", year: 2007, averageRating: 4.3, totalRatings: 82 },
    { id: 48, title: "The No. 1 Ladies' Detective Agency", author: "Alexander McCall Smith", genre: "Mystery", description: "Botswana detective stories", year: 1998, averageRating: 4.4, totalRatings: 75 },
    { id: 49, title: "Sharp Objects", author: "Gillian Flynn", genre: "Mystery", description: "Dark psychological mystery", year: 2006, averageRating: 4.2, totalRatings: 70 },
    { id: 50, title: "The Cuckoo's Calling", author: "Robert Galbraith", genre: "Mystery", description: "Cormoran Strike series", year: 2013, averageRating: 4.3, totalRatings: 90 }
  ],
  'Science': [
    { id: 51, title: "A Brief History of Time", author: "Stephen Hawking", genre: "Science", description: "Cosmology for the general reader", year: 1988, averageRating: 4.7, totalRatings: 95, shortLink: "https://amzn.to/3example1" },
    { id: 52, title: "The Selfish Gene", author: "Richard Dawkins", genre: "Science", description: "Evolutionary biology and genetics", year: 1976, averageRating: 4.6, totalRatings: 88, shortLink: "https://amzn.to/3example2" },
    { id: 53, title: "Cosmos", author: "Carl Sagan", genre: "Science", description: "The evolution of human knowledge", year: 1980, averageRating: 4.8, totalRatings: 105, shortLink: "https://amzn.to/3example3" },
    { id: 54, title: "The Double Helix", author: "James D. Watson", genre: "Science", description: "Personal account of DNA discovery", year: 1968, averageRating: 4.4, totalRatings: 75, shortLink: "https://amzn.to/3example4" },
    { id: 55, title: "The Elegant Universe", author: "Brian Greene", genre: "Science", description: "Superstrings and hidden dimensions", year: 1999, averageRating: 4.5, totalRatings: 82, shortLink: "https://amzn.to/3example5" }
  ],
  'Technology': [
    { id: 56, title: "The Innovators", author: "Walter Isaacson", genre: "Technology", description: "History of the digital revolution", year: 2014, averageRating: 4.6, totalRatings: 90, shortLink: "https://amzn.to/3example6" },
    { id: 57, title: "Clean Code", author: "Robert C. Martin", genre: "Technology", description: "Handbook of agile software craftsmanship", year: 2008, averageRating: 4.7, totalRatings: 120, shortLink: "https://amzn.to/3example7" },
    { id: 58, title: "The Phoenix Project", author: "Gene Kim", genre: "Technology", description: "A novel about IT and DevOps", year: 2013, averageRating: 4.5, totalRatings: 85, shortLink: "https://amzn.to/3example8" },
    { id: 59, title: "Hackers & Painters", author: "Paul Graham", genre: "Technology", description: "Big ideas from computer science", year: 2004, averageRating: 4.4, totalRatings: 78, shortLink: "https://amzn.to/3example9" },
    { id: 60, title: "The Soul of a New Machine", author: "Tracy Kidder", genre: "Technology", description: "Pulitzer-winning tech journalism", year: 1981, averageRating: 4.3, totalRatings: 65, shortLink: "https://amzn.to/3example10" }
  ],
  'Self-Help': [
    { id: 61, title: "Atomic Habits", author: "James Clear", genre: "Self-Help", description: "Tiny changes, remarkable results", year: 2018, averageRating: 4.8, totalRatings: 150, shortLink: "https://amzn.to/3example11" },
    { id: 62, title: "The 7 Habits of Highly Effective People", author: "Stephen R. Covey", genre: "Self-Help", description: "Powerful lessons in personal change", year: 1989, averageRating: 4.6, totalRatings: 130, shortLink: "https://amzn.to/3example12" },
    { id: 63, title: "How to Win Friends and Influence People", author: "Dale Carnegie", genre: "Self-Help", description: "Classic guide to social skills", year: 1936, averageRating: 4.7, totalRatings: 140, shortLink: "https://amzn.to/3example13" },
    { id: 64, title: "The Subtle Art of Not Giving a F*ck", author: "Mark Manson", genre: "Self-Help", description: "Counterintuitive approach to living", year: 2016, averageRating: 4.5, totalRatings: 125, shortLink: "https://amzn.to/3example14" },
    { id: 65, title: "Daring Greatly", author: "Brené Brown", genre: "Self-Help", description: "How courage transforms lives", year: 2012, averageRating: 4.6, totalRatings: 95, shortLink: "https://amzn.to/3example15" }
  ],
  'Romance': [
    { id: 66, title: "The Notebook", author: "Nicholas Sparks", genre: "Romance", description: "Enduring love story", year: 1996, averageRating: 4.5, totalRatings: 110, shortLink: "https://amzn.to/3example16" },
    { id: 67, title: "Pride and Prejudice", author: "Jane Austen", genre: "Romance", description: "Classic romantic novel", year: 1813, averageRating: 4.8, totalRatings: 135, shortLink: "https://amzn.to/3example17" },
    { id: 68, title: "Outlander", author: "Diana Gabaldon", genre: "Romance", description: "Time-travel romance epic", year: 1991, averageRating: 4.7, totalRatings: 120, shortLink: "https://amzn.to/3example18" },
    { id: 69, title: "The Hating Game", author: "Sally Thorne", genre: "Romance", description: "Office romance comedy", year: 2016, averageRating: 4.4, totalRatings: 95, shortLink: "https://amzn.to/3example19" },
    { id: 70, title: "Me Before You", author: "Jojo Moyes", genre: "Romance", description: "Emotional love story", year: 2012, averageRating: 4.6, totalRatings: 105, shortLink: "https://amzn.to/3example20" }
  ],
  'Thriller': [
    { id: 71, title: "The Silent Patient", author: "Alex Michaelides", genre: "Thriller", description: "Psychological thriller", year: 2019, averageRating: 4.5, totalRatings: 115, shortLink: "https://amzn.to/3example21" },
    { id: 72, title: "The Girl on the Train", author: "Paula Hawkins", genre: "Thriller", description: "Suspenseful mystery", year: 2015, averageRating: 4.4, totalRatings: 125, shortLink: "https://amzn.to/3example22" },
    { id: 73, title: "Gone Girl", author: "Gillian Flynn", genre: "Thriller", description: "Dark psychological thriller", year: 2012, averageRating: 4.6, totalRatings: 140, shortLink: "https://amzn.to/3example23" },
    { id: 74, title: "The Da Vinci Code", author: "Dan Brown", genre: "Thriller", description: "Religious conspiracy thriller", year: 2003, averageRating: 4.3, totalRatings: 155, shortLink: "https://amzn.to/3example24" },
    { id: 75, title: "The Reversal", author: "Michael Connelly", genre: "Thriller", description: "Legal thriller", year: 2010, averageRating: 4.5, totalRatings: 90, shortLink: "https://amzn.to/3example25" }
  ],
  'Biography': [
    { id: 76, title: "Steve Jobs", author: "Walter Isaacson", genre: "Biography", description: "Apple founder's biography", year: 2011, averageRating: 4.7, totalRatings: 120, shortLink: "https://amzn.to/3example26" },
    { id: 77, title: "The Diary of a Young Girl", author: "Anne Frank", genre: "Biography", description: "Holocaust diary", year: 1947, averageRating: 4.9, totalRatings: 145, shortLink: "https://amzn.to/3example27" },
    { id: 78, title: "Educated", author: "Tara Westover", genre: "Biography", description: "Memoir of self-education", year: 2018, averageRating: 4.8, totalRatings: 110, shortLink: "https://amzn.to/3example28" },
    { id: 79, title: "Long Walk to Freedom", author: "Nelson Mandela", genre: "Biography", description: "Autobiography of Nelson Mandela", year: 1994, averageRating: 4.7, totalRatings: 95, shortLink: "https://amzn.to/3example29" },
    { id: 80, title: "I Know Why the Caged Bird Sings", author: "Maya Angelou", genre: "Biography", description: "Autobiographical novel", year: 1969, averageRating: 4.6, totalRatings: 85, shortLink: "https://amzn.to/3example30" }
  ],
  'History': [
    { id: 81, title: "A People's History of the United States", author: "Howard Zinn", genre: "History", description: "American history from below", year: 1980, averageRating: 4.6, totalRatings: 95, shortLink: "https://amzn.to/3example31" },
    { id: 82, title: "Guns, Germs, and Steel", author: "Jared Diamond", genre: "History", description: "Fates of human societies", year: 1997, averageRating: 4.5, totalRatings: 105, shortLink: "https://amzn.to/3example32" },
    { id: 83, title: "The Rise and Fall of the Third Reich", author: "William L. Shirer", genre: "History", description: "Nazi Germany history", year: 1960, averageRating: 4.7, totalRatings: 85, shortLink: "https://amzn.to/3example33" },
    { id: 84, title: "Sapiens", author: "Yuval Noah Harari", genre: "History", description: "Brief history of humankind", year: 2011, averageRating: 4.7, totalRatings: 130, shortLink: "https://amzn.to/3example34" },
    { id: 85, title: "1776", author: "David McCullough", genre: "History", description: "American Revolution history", year: 2005, averageRating: 4.6, totalRatings: 90, shortLink: "https://amzn.to/3example35" }
  ]
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
  const [activeTab, setActiveTab] = useState("genres");
  const [selectedGenre, setSelectedGenre] = useState("");
  
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
      const response = await fetch('https://circulation-system-server-ql2i.onrender.com/api/recommendations');
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
      const response = await fetch('https://circulation-system-server-ql2i.onrender.com/api/user-recommendations');
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
      const response = await fetch(`https://circulation-system-server-ql2i.onrender.com/api/recommendations/rate/${bookId}`, {
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

  // Get books based on selected genre
  const getBooksByGenre = () => {
    if (!selectedGenre) return [];
    return sampleBooksByGenre[selectedGenre] || [];
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
        <div className="book-cover">{generateBookCover(book.genre, book.title)}</div>
        <div className="book-basic-info">
          <h3>{book.title}</h3>
          <p className="book-author">by {book.author}</p>
          <StarRatingDisplay 
            rating={book.averageRating || 0}
            totalRatings={book.totalRatings || 0}
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
            <span>🏷️ {book.genre || 'General'}</span>
          </div>
          <p className="book-description">{book.description || 'No description available.'}</p>
          
          {book.recommendationReason && (
            <div className="recommendation-reason">
              <strong>Why we recommend it:</strong> {book.recommendationReason}
            </div>
          )}
          
          {/* Short link in collapsible section */}
          {book.shortLink && (
            <div className="short-link-section">
              <a 
                href={book.shortLink} 
                target="_blank" 
                rel="noopener noreferrer"
                className="short-link"
              >
                🔗 Get this book
              </a>
            </div>
          )}
          
          <StarRatingDisplay 
            rating={book.averageRating || 0}
            totalRatings={book.totalRatings || 0}
            bookId={book.id}
            showInput={true}
          />
          
          <div className="book-actions">
            {/* Add to selections button can be re-enabled if needed */}
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
          {/* <button 
            className={`tab-button ${activeTab === 'recommended' ? 'active' : ''}`}
            onClick={() => setActiveTab('recommended')}
          >
            Recommended For You
          </button> */}
          {/* <button 
            className={`tab-button ${activeTab === 'popular' ? 'active' : ''}`}
            onClick={() => setActiveTab('popular')}
          >
            Popular Books
          </button> */}
          {/* <button 
            className={`tab-button ${activeTab === 'recent' ? 'active' : ''}`}
            onClick={() => setActiveTab('recent')}
          >
            Recently Added
          </button> */}
          {/* <button 
            className={`tab-button ${activeTab === 'student' ? 'active' : ''}`}
            onClick={() => setActiveTab('student')}
          >
            Student Recommendations
          </button> */}
          {/* <button 
            className={`tab-button ${activeTab === 'all' ? 'active' : ''}`}
            onClick={() => setActiveTab('all')}
          >
            All Books
          </button> */}
          {/* <button 
            className={`tab-button ${activeTab === 'genres' ? 'active' : ''}`}
            onClick={() => setActiveTab('genres')}
          >
            Browse by Genre
          </button> */}
        </div>

        {/* {userData && (
          <div className="recommend-button-container">
            <button 
              onClick={() => setShowRecommendationForm(!showRecommendationForm)}
              className={`recommend-book-btn ${showRecommendationForm ? 'active' : ''}`}
            >
              📚 Recommend a Book
            </button>
          </div>
        )} */}
      </div>

      {/* User Recommendation Form */}
      {/* {showRecommendationForm && (
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
      )} */}

      {/* Tab Content */}
      <div className="tab-content">
        {activeTab === 'recommended' && (
          <section className="books-section">
            {/* <h2>Recommended For You</h2> */}
            {/* {recommendedBooks.length > 0 ? (
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
            )} */}
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

        {activeTab === 'genres' && (
          <section className="books-section">
            <h2>Browse by Genre</h2>
            <div className="genre-selector">
              <select
                value={selectedGenre}
                onChange={(e) => setSelectedGenre(e.target.value)}
                className="genre-dropdown"
              >
               <option value="">Select a genre to explore</option>
<option value="Self-Help">Self-Help</option>
<option value="Technology">Technology</option>
<option value="Science">Science</option>
<option value="History">History</option>
<option value="Biography">Biography</option>
<option value="Thriller">Thriller</option>
<option value="Romance">Romance</option>
<option value="Mystery">Mystery</option>
<option value="Fantasy">Fantasy</option>
<option value="Science Fiction">Science Fiction</option>
<option value="Non-Fiction">Non-Fiction</option>
<option value="Fiction">Fiction</option>
              </select>
            </div>

            {selectedGenre ? (
              <div className="genre-books-section">
                <h3>{selectedGenre} Books ({getBooksByGenre().length})</h3>
                {getBooksByGenre().length > 0 ? (
                  <div className="books-grid">
                    {getBooksByGenre().map(renderBookCard)}
                  </div>
                ) : (
                  <div className="no-books-message">
                    <p>No books found in the {selectedGenre} category.</p>
                  </div>
                )}
              </div>
            ) : (
              <div className="genre-placeholder">
                <p>Select a genre from the dropdown to explore books in that category.</p>
                <div className="genre-categories">
                  <div className="genre-category">
                    <h4>📖 Fiction</h4>
                    <p>Classic and contemporary novels</p>
                  </div>
                  <div className="genre-category">
                    <h4>📚 Non-Fiction</h4>
                    <p>Real stories and factual content</p>
                  </div>
                  <div className="genre-category">
                    <h4>🚀 Science Fiction</h4>
                    <p>Futuristic and space adventures</p>
                  </div>
                  <div className="genre-category">
                    <h4>🐉 Fantasy</h4>
                    <p>Magical worlds and epic quests</p>
                  </div>
                  <div className="genre-category">
                    <h4>🕵️ Mystery</h4>
                    <p>Crime, suspense, and detective stories</p>
                  </div>
                  <div className="genre-category">
                    <h4>🔬 Science</h4>
                    <p>Scientific discoveries and theories</p>
                  </div>
                  <div className="genre-category">
                    <h4>💻 Technology</h4>
                    <p>Tech innovations and digital world</p>
                  </div>
                  <div className="genre-category">
                    <h4>💪 Self-Help</h4>
                    <p>Personal growth and development</p>
                  </div>
                </div>
              </div>
            )}
          </section>
        )}
      </div>
    </div>
  );
}