import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { message, Spin, Empty } from 'antd';
import moment from 'moment';
import RatingStars from './RatingStars';
import '../styles/Rating.css';

const RatingsList = ({ doctorId }) => {
  const [ratings, setRatings] = useState([]);
  const [averageRating, setAverageRating] = useState(0);
  const [totalRatings, setTotalRatings] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (doctorId) {
      fetchRatings();
    }
  }, [doctorId]);

  const fetchRatings = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`/api/v1/ratings/doctor/${doctorId}`);
      
      if (response.data.success) {
        setRatings(response.data.data.ratings);
        setAverageRating(response.data.data.averageRating);
        setTotalRatings(response.data.data.totalRatings);
      }
    } catch (error) {
      console.error('Error fetching ratings:', error);
      message.error('Failed to load ratings');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <Spin size="large" className="ratings-loader" />;
  }

  return (
    <div className="ratings-section">
      <div className="ratings-summary">
        <h3>Patient Reviews</h3>
        <div className="ratings-average">
          <RatingStars 
            initialRating={averageRating} 
            size="large" 
            totalRatings={totalRatings}
          />
          <p className="total-ratings">Based on {totalRatings} {totalRatings === 1 ? 'rating' : 'ratings'}</p>
        </div>
      </div>

      <div className="ratings-list">
        {ratings.length > 0 ? (
          ratings.map((rating) => (
            <div key={rating._id} className="rating-item">
              <div className="rating-item-header">
                <span className="rating-user">
                  {rating.userId?.name || 'Anonymous User'}
                </span>
                <span className="rating-date">
                  {moment(rating.createdAt).format('MMM DD, YYYY')}
                </span>
              </div>
              <RatingStars 
                initialRating={rating.rating} 
                size="small" 
                showRatingValue={false}
              />
              {rating.review && (
                <div className="rating-item-body">
                  {rating.review}
                </div>
              )}
            </div>
          ))
        ) : (
          <div className="no-ratings">
            <Empty description="No ratings yet" />
          </div>
        )}
      </div>
    </div>
  );
};

export default RatingsList;
