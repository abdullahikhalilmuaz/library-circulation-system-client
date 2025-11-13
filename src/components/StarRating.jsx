const StarRating = ({ rating, totalRatings }) => {
  const fullStars = Math.floor(rating);
  const hasHalfStar = rating % 1 >= 0.5;
  
  return (
    <div className="star-rating">
      <div className="stars">
        {[...Array(fullStars)].map((_, i) => (
          <span key={i} className="star full">⭐</span>
        ))}
        {hasHalfStar && <span className="star half">⭐</span>}
        {[...Array(5 - fullStars - (hasHalfStar ? 1 : 0))].map((_, i) => (
          <span key={i} className="star empty">☆</span>
        ))}
      </div>
      <span className="rating-text">
        {rating.toFixed(1)} ({totalRatings} ratings)
      </span>
    </div>
  );
};

export default StarRating;