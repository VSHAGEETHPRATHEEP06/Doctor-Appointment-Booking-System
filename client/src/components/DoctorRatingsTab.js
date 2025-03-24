import React, { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import { Row, Col, Tabs, Divider, message, Alert, Card, Spin } from 'antd';
import axios from 'axios';
import RatingForm from './RatingForm';
import RatingsList from './RatingsList';

const DoctorRatingsTab = ({ doctorId }) => {
  const { user } = useSelector(state => state.user);
  const [appointments, setAppointments] = useState([]);
  const [canRate, setCanRate] = useState(false);
  const [loading, setLoading] = useState(true);
  const [selectedAppointment, setSelectedAppointment] = useState(null);

  useEffect(() => {
    if (user?._id && doctorId) {
      checkIfCanRate();
    } else {
      setLoading(false);
    }
  }, [user, doctorId]);

  const checkIfCanRate = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      
      // Get completed appointments with this doctor
      const response = await axios.get(
        '/api/v1/patient/appointments-by-doctor',
        {
          params: { doctorId },
          headers: { Authorization: `Bearer ${token}` }
        }
      );

      if (response.data.success) {
        // Filter to only completed appointments that haven't been rated yet
        const completedAppointments = response.data.data.filter(
          app => app.status === 'completed'
        );
        
        if (completedAppointments.length > 0) {
          setAppointments(completedAppointments);
          setSelectedAppointment(completedAppointments[0]._id);
          setCanRate(true);
        }
      }
    } catch (error) {
      console.error('Error checking rating eligibility:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleRatingSuccess = () => {
    message.success('Thank you for your feedback!');
    // Refresh the ratings list
    checkIfCanRate();
  };

  if (loading) {
    return (
      <div className="ratings-loader">
        <Spin size="large" />
      </div>
    );
  }

  return (
    <div className="doctor-ratings-tab">
      <Row gutter={[24, 24]}>
        <Col xs={24} lg={14}>
          <RatingsList doctorId={doctorId} />
        </Col>
        
        <Col xs={24} lg={10}>
          {canRate && user && selectedAppointment ? (
            <Card 
              title="Share Your Experience" 
              className="rating-card"
              bordered={false}
              headStyle={{ 
                backgroundColor: '#000', 
                color: '#fff',
                borderTopLeftRadius: '8px',
                borderTopRightRadius: '8px',
                fontWeight: '600'
              }}
            >
              <Alert
                message="You've had an appointment with this doctor"
                description="Your feedback helps other patients make informed decisions."
                type="info"
                showIcon
                style={{ marginBottom: '20px' }}
              />
              <RatingForm 
                doctorId={doctorId} 
                appointmentId={selectedAppointment}
                onSuccess={handleRatingSuccess}
              />
            </Card>
          ) : user ? (
            <Card 
              className="no-appointment-card"
              bordered={false}
            >
              <Alert
                message="Want to leave a review?"
                description="You can rate this doctor after completing an appointment with them."
                type="info"
                showIcon
              />
            </Card>
          ) : (
            <Card 
              className="login-to-rate-card"
              bordered={false}
            >
              <Alert
                message="Log in to rate this doctor"
                description="Please log in to view your appointment history and leave reviews."
                type="warning"
                showIcon
              />
            </Card>
          )}
        </Col>
      </Row>
    </div>
  );
};

export default DoctorRatingsTab;
