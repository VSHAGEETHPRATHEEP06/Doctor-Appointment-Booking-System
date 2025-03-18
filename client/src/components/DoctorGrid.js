import React from "react";
import "../styles/HomePage.css";
import { useNavigate } from "react-router-dom";
import { 
  FaUserMd, 
  FaBriefcase, 
  FaMoneyBillAlt, 
  FaClock 
} from "react-icons/fa";

// Individual Doctor Card Component
const DoctorCard = ({ doctor }) => {
  const navigate = useNavigate();

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
          {doctor.profileImage ? (
            <img src={doctor.profileImage} alt={doctor.firstName} className="avatar-image" />
          ) : (
            <div className="avatar-placeholder">
              <FaUserMd className="avatar-icon" />
            </div>
          )}
        </div>
        <div className="doctor-info">
          <h3 className="doctor-name">
            Dr. {doctor.firstName || ""} {doctor.lastName || ""}
          </h3>
          <div className="doctor-rating">
            {[...Array(5)].map((_, i) => (
              <span key={i} className={i < (doctor.rating || 4) ? "star-filled" : "star-empty"}>
                ★
              </span>
            ))}
            <span className="rating-count">({doctor.ratingCount || 42})</span>
          </div>
        </div>
      </div>
      
      <div className="card-body">
        <div className="doctor-specialization">
          <span className="specialization-badge">{doctor.specialization || "General Medicine"}</span>
          {doctor.availability && <span className="availability-badge">Available Today</span>}
        </div>
        
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
              <FaBriefcase className="icon" />
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
                {doctor.timings?.[0] || "09:00 AM"} - {doctor.timings?.[1] || "05:00 PM"}
              </p>
            </div>
          </div>
        </div>
        
        <div className="card-footer">
          <button className="book-button">Book Appointment</button>
        </div>
      </div>
    </div>
  );
};

// Doctor Grid Container Component
const DoctorGrid = ({ doctors }) => {
  if (!doctors || doctors.length === 0) {
    return <div className="text-center p-4">No doctors available at the moment.</div>;
  }

  return (
    <div className="doctors-grid">
      {doctors.map((doctor) => (
        <DoctorCard key={doctor._id} doctor={doctor} />
      ))}
    </div>
  );
};

export default DoctorGrid;