import React from "react";
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
      className="doctor-card m-4 bg-white"
      onClick={() => navigate(`/doctor/book-appointment/${doctor._id}`)}
    >
      <div className="card-header">
        <FaUserMd className="header-icon" />
        <h6 className="doctor-name">
          Dr. {doctor.firstName || ""} {doctor.lastName || ""}
        </h6>
      </div>
      
      <div className="card-body">
        <div className="details-container">
          <div className="detail-item">
            <span className="icon-wrapper">
              <FaBriefcase className="icon specialization-icon" />
            </span>
            <div className="text-wrapper">
              <p className="detail-label">Specialization</p>
              <p className="detail-content">
                {doctor.specialization || "Not specified"}
              </p>
            </div>
          </div>

          <div className="detail-item">
            <span className="icon-wrapper">
              <FaBriefcase className="icon experience-icon" />
            </span>
            <div className="text-wrapper">
              <p className="detail-label">Experience</p>
              <p className="detail-content">
                {doctor.experience ? `${doctor.experience} years` : "N/A"}
              </p>
            </div>
          </div>

          <div className="detail-item">
            <span className="icon-wrapper">
              <FaMoneyBillAlt className="icon fee-icon" />
            </span>
            <div className="text-wrapper">
              <p className="detail-label">Consultation Fee</p>
              <p className="detail-content">
                ${doctor.feesPerConsultation || "00.00"}
              </p>
            </div>
          </div>

          <div className="detail-item">
            <span className="icon-wrapper">
              <FaClock className="icon availability-icon" />
            </span>
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