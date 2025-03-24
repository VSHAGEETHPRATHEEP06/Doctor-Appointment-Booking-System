import React, { useState } from 'react';
import { Form, Input, Button, message } from 'antd';
import RatingStars from './RatingStars';
import axios from 'axios';
import '../styles/Rating.css';

const { TextArea } = Input;

const RatingForm = ({ doctorId, appointmentId, onSuccess }) => {
  const [rating, setRating] = useState(0);
  const [review, setReview] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    if (rating === 0) {
      message.error('Please select a rating');
      return;
    }

    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      
      const response = await axios.post(
        '/api/v1/ratings/add-rating',
        {
          doctorId,
          appointmentId,
          rating,
          review
        },
        {
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      );

      if (response.data.success) {
        message.success('Rating submitted successfully');
        setRating(0);
        setReview('');
        if (onSuccess) {
          onSuccess(response.data.data);
        }
      }
    } catch (error) {
      console.error('Error submitting rating:', error);
      const errorMsg = error.response?.data?.message || 'Failed to submit rating';
      message.error(errorMsg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="rating-form">
      <h3 className="rating-form-header">Rate Your Experience</h3>
      
      <div className="rating-form-stars">
        <RatingStars 
          initialRating={rating} 
          editable={true} 
          size="large"
          onRatingChange={(value) => setRating(value)}
          showRatingValue={false}
        />
      </div>
      
      <div className="rating-form-review">
        <TextArea
          placeholder="Share your experience with this doctor (optional)"
          rows={4}
          value={review}
          onChange={(e) => setReview(e.target.value)}
        />
      </div>
      
      <div className="rating-form-buttons">
        <Button onClick={() => {
          setRating(0);
          setReview('');
        }}>
          Cancel
        </Button>
        <Button 
          type="primary" 
          onClick={handleSubmit}
          loading={loading}
          disabled={rating === 0}
        >
          Submit Rating
        </Button>
      </div>
    </div>
  );
};

export default RatingForm;
