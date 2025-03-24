import React, { useState } from 'react';
import { FaStar } from 'react-icons/fa';
import '../styles/Rating.css';

const RatingStars = ({ 
  initialRating = 0, 
  totalStars = 5, 
  editable = false, 
  size = "normal", 
  onRatingChange,
  showRatingValue = true,
  totalRatings = 0
}) => {
  const [rating, setRating] = useState(initialRating);
  const [hover, setHover] = useState(0);

  // Determine the CSS class based on size
  const sizeClass = size === "small" ? "star-small" : 
                  size === "large" ? "star-large" : "star-normal";

  // Handle click on a star
  const handleClick = (selectedRating) => {
    if (editable) {
      setRating(selectedRating);
      if (onRatingChange) {
        onRatingChange(selectedRating);
      }
    }
  };

  return (
    <div className="rating-container">
      <div className="stars-container">
        {[...Array(totalStars)].map((_, index) => {
          const starValue = index + 1;
          return (
            <span
              key={index}
              className={`star-wrapper ${editable ? 'clickable' : ''}`}
              onClick={() => handleClick(starValue)}
              onMouseEnter={() => editable && setHover(starValue)}
              onMouseLeave={() => editable && setHover(0)}
            >
              <FaStar
                className={`${sizeClass} ${
                  (hover || rating) >= starValue
                    ? 'star-filled'
                    : 'star-empty'
                }`}
              />
            </span>
          );
        })}
      </div>
      
      {showRatingValue && (
        <div className="rating-info">
          <span className="rating-value">{rating.toFixed(1)}</span>
          {totalRatings > 0 && (
            <span className="rating-count">({totalRatings})</span>
          )}
        </div>
      )}
    </div>
  );
};

export default RatingStars;
