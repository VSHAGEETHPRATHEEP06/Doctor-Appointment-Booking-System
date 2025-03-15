import React, { useState, useEffect } from "react";
import Layout from "../components/Layout";
import { useParams } from "react-router-dom";
import axios from "axios";
import { DatePicker, message, TimePicker } from "antd";
import moment from "moment";
import "../styles/BookingPage.css"
import { useDispatch, useSelector } from "react-redux";
import { showLoading, hideLoading } from "../redux/features/alertSlice";
import { UserOutlined, CalendarOutlined, ClockCircleOutlined, DollarOutlined, MedicineBoxOutlined } from '@ant-design/icons';

const BookingPage = () => {
  const { user } = useSelector((state) => state.user);
  const params = useParams();
  const [doctors, setDoctors] = useState([]);
  const [date, setDate] = useState("");
  const [time, setTime] = useState();
  const [isAvailable, setIsAvailable] = useState(false);
  const dispatch = useDispatch();
  // login user data
  const getUserData = async () => {
    try {
      const res = await axios.post(
        "/api/v1/doctor/getDoctorById",
        { doctorId: params.doctorId },
        {
          headers: {
            Authorization: "Bearer " + localStorage.getItem("token"),
          },
        }
      );
      if (res.data.success) {
        setDoctors(res.data.data);
      }
    } catch (error) {
      console.log(error);
    }
  };
  // ============ handle availability
  const handleAvailability = async () => {
    try {
      dispatch(showLoading());
      const res = await axios.post(
        "/api/v1/user/booking-availability",
        { doctorId: params.doctorId, date, time },
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
      );
      dispatch(hideLoading());
      if (res.data.success) {
        setIsAvailable(true);
        console.log(isAvailable);
        message.success(res.data.message);
      } else {
        message.error(res.data.message);
      }
    } catch (error) {
      dispatch(hideLoading());
      console.log(error);
    }
  };
  // =============== booking function
  const handleBooking = async () => {
    try {
      setIsAvailable(true);
      if (!date && !time) {
        return alert("Date & Time Required");
      }
      dispatch(showLoading());
      const res = await axios.post(
        "/api/v1/user/book-appointment",
        {
          doctorId: params.doctorId,
          userId: user._id,
          doctorInfo: doctors,
          userInfo: user,
          date: date,
          time: time,
        },
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
      );
      dispatch(hideLoading());
      if (res.data.success) {
        message.success(res.data.message);
      }
    } catch (error) {
      dispatch(hideLoading());
      console.log(error);
    }
  };

  useEffect(() => {
    getUserData();
    //eslint-disable-next-line
  }, []);
  return (
    <Layout>
      <div className="booking-container">
        <div className="booking-card">
          {doctors && (
            <>
              <div className="doctor-header">
                <div className="doctor-info">
                  <h2 className="doctor-name">
                    <UserOutlined /> Dr. {doctors.firstName} {doctors.lastName}
                  </h2>
                  <div className="doctor-specialty">
                    <MedicineBoxOutlined /> {doctors.specialization}
                  </div>
                </div>
                
                <div className="doctor-meta">
                  <div className="meta-item">
                    <DollarOutlined className="meta-icon" />
                    <span className="meta-label">Consultation Fee</span>
                    <span className="meta-value">${doctors.feesPerConsultation}</span>
                  </div>
                  <div className="meta-item">
                    <ClockCircleOutlined className="meta-icon" />
                    <span className="meta-label">Available Hours</span>
                    <span className="meta-value">
                      {doctors.timings?.[0]} - {doctors.timings?.[1]}
                    </span>
                  </div>
                </div>
              </div>

              <div className="booking-form">
                <div className="datetime-selection">
                  <div className="date-picker-container">
                    <label className="form-label">
                      <CalendarOutlined /> Select Date
                    </label>
                    <DatePicker
                      className="custom-date-picker"
                      format="DD-MM-YYYY"
                      onChange={(value) => {
                        setDate(moment(value).format("DD-MM-YYYY"));
                      }}
                    />
                  </div>

                  <div className="time-picker-container">
                    <label className="form-label">
                      <ClockCircleOutlined /> Select Time
                    </label>
                    <TimePicker
                      className="custom-time-picker"
                      format="HH:mm"
                      onChange={(value) => {
                        setTime(moment(value).format("HH:mm"));
                      }}
                    />
                  </div>
                </div>

                <div className="action-buttons">
                  <button
                    className="availability-btn"
                    onClick={handleAvailability}
                  >
                    Check Availability
                  </button>
                  <button 
                    className="book-now-btn"
                    onClick={handleBooking}
                  >
                    Confirm Appointment
                  </button>
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </Layout>
  );
};

export default BookingPage;