import React from "react";
import "../styles/HomePage.css";
import { useNavigate } from "react-router-dom";
import { 
  FaUserMd, 
  FaBriefcase, 
  FaMoneyBillAlt, 
  FaClock,
  FaGraduationCap,
  FaStar 
} from "react-icons/fa";
import moment from "moment";
import RatingStars from "./RatingStars";

const DoctorList = ({ doctor }) => {
  const navigate = useNavigate();

  // Helper function to format doctor timing consistently
  const formatDoctorTiming = (timings) => {
    try {
      // Handle different timing formats
      let startTime, endTime;
      
      if (Array.isArray(timings) && timings.length >= 2) {
        startTime = timings[0];
        endTime = timings[1];
      } else if (typeof timings === 'object') {
        startTime = timings.start || timings[0] || "09:00";
        endTime = timings.end || timings[1] || "17:00";
      } else {
        return "09:00 AM - 05:00 PM"; // Default fallback
      }
      
      // Format the times for display
      const formattedStart = moment(startTime, ["HH:mm", "h:mm A"]).format("hh:mm A");
      const formattedEnd = moment(endTime, ["HH:mm", "h:mm A"]).format("hh:mm A");
      
      return `${formattedStart} - ${formattedEnd}`;
    } catch (error) {
      console.error("Error formatting doctor timing:", error);
      return "09:00 AM - 05:00 PM"; // Default fallback on error
    }
  };

  if (!doctor) {
    return <div className="text-center p-4">Loading doctor information...</div>;
  }

  return (
    <div
      className="doctor-card"
      onClick={() => navigate(`/doctor/book-appointment/${doctor._id}`)}
    >
      <div className="card-header">
        <div className="doctor-avatar">
          <div className="avatar-placeholder">
            <FaUserMd className="avatar-icon" />
          </div>
        </div>
        <div className="doctor-info">
          <h3 className="doctor-card-name">
            Dr. {doctor.firstName || ""} {doctor.lastName || ""}
          </h3>
          <div className="specialization-badge">
            {doctor.specialization || "General Medicine"}
          </div>
          <div className="star-container">
            <RatingStars 
              initialRating={doctor.averageRating || 0} 
              size="small" 
              totalRatings={doctor.totalRatings || 0}
              editable={false}
              showRatingValue={true}
            />
          </div>
        </div>
      </div>
      
      <div className="card-body">
        <div className="details-container">
          <div className="detail-item">
            <div className="icon-wrapper specialization-icon">
              <FaBriefcase className="icon" />
            </div>
            <div className="text-wrapper">
              <p className="detail-label">Specialization</p>
              <p className="detail-content">
                {doctor.specialization || "Not specified"}
              </p>
            </div>
          </div>

          <div className="detail-item">
            <div className="icon-wrapper experience-icon">
              <FaGraduationCap className="icon" />
            </div>
            <div className="text-wrapper">
              <p className="detail-label">Experience</p>
              <p className="detail-content">
                {doctor.experience ? `${doctor.experience} years` : "N/A"}
              </p>
            </div>
          </div>

          <div className="detail-item">
            <div className="icon-wrapper fee-icon">
              <FaMoneyBillAlt className="icon" />
            </div>
            <div className="text-wrapper">
              <p className="detail-label">Consultation Fee</p>
              <p className="detail-content">
                ${doctor.feesPerConsultation || "00.00"}
              </p>
            </div>
          </div>

          <div className="detail-item">
            <div className="icon-wrapper availability-icon">
              <FaClock className="icon" />
            </div>
            <div className="text-wrapper">
              <p className="detail-label">Availability</p>
              <p className="detail-content">
                {formatDoctorTiming(doctor.timings)}
              </p>
            </div>
          </div>
        </div>
        
        <div className="card-footer">
          <button className="book-button">
            Book Appointment
          </button>
        </div>
      </div>
    </div>
  );
};

export default DoctorList;