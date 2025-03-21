import React from "react";
import "../styles/HomePage.css";
import { useNavigate } from "react-router-dom";
import { 
  FaUserMd, 
  FaBriefcase, 
  FaMoneyBillAlt, 
  FaClock 
} from "react-icons/fa";

const DoctorList = ({ doctor }) => {
  const navigate = useNavigate();

  if (!doctor) {
    return <div className="text-center p-4">Loading doctor information...</div>;
  }

  return (
    <div
      className="doctor-card doctor-card-large"
      onClick={() => navigate(`/doctor/book-appointment/${doctor._id}`)}
    >
      <div className="card-header">
        <div className="header-icon">
          <FaUserMd />
        </div>
        <h3 className="doctor-name" style={{ color: "white" }}>
          Dr. {doctor.firstName || ""} {doctor.lastName || ""}
        </h3>
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
      </div>
    </div>
  );
};

export default DoctorList;