import React, { useState, useEffect, useRef } from "react";
import Layout from "../components/Layout";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import { DatePicker, message, TimePicker, Spin, Button, Tabs } from "antd";
import moment from "moment";
import "../styles/BookingPage.css";
import "../styles/CustomDatePicker.css";
import { useDispatch, useSelector } from "react-redux";
import { showLoading, hideLoading } from "../redux/features/alertSlice";
import { UserOutlined, CalendarOutlined, ClockCircleOutlined, DollarOutlined, MedicineBoxOutlined } from '@ant-design/icons';
import DoctorRatingsTab from "../components/DoctorRatingsTab";

const { TabPane } = Tabs;

const BookingPage = () => {
  const { user } = useSelector((state) => state.user);
  const params = useParams();
  const navigate = useNavigate();
  const [doctors, setDoctors] = useState(null);
  const [date, setDate] = useState("");
  const [time, setTime] = useState("");
  const [isAvailable, setIsAvailable] = useState(false);
  const [loading, setLoading] = useState(true);
  const [bookingLoading, setBookingLoading] = useState(false);
  const [availabilityChecking, setAvailabilityChecking] = useState(false);
  const dispatch = useDispatch();
  const dataFetchedRef = useRef(false);
  const isAvailableRef = useRef(false);
  
  // Debug effect to track isAvailable changes
  useEffect(() => {
    console.log("isAvailable state changed to:", isAvailable);
    isAvailableRef.current = isAvailable;
  }, [isAvailable]);
  
  // Get auth token from localStorage
  const getToken = () => {
    return localStorage.getItem("token");
  };
  
  // fetch doctor data
  const getUserData = async () => {
    try {
      if (dataFetchedRef.current) return;
      dataFetchedRef.current = true;
      
      setLoading(true);
      const token = getToken();
      if (!token) {
        message.error("You must be logged in");
        navigate('/login');
        return;
      }
      
      if (!params.doctorId) {
        message.error("Invalid doctor ID");
        navigate('/');
        return;
      }
      
      console.log("Fetching doctor with ID:", params.doctorId);
      
      const res = await axios.post(
        "/api/v1/doctor/getDoctorById",
        { doctorId: params.doctorId },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      
      setLoading(false);
      if (res.data.success) {
        setDoctors(res.data.data);
        console.log("Doctor data fetched:", res.data.data);
      } else {
        message.error(res.data.message || "Failed to fetch doctor information");
      }
    } catch (error) {
      setLoading(false);
      console.log("Error fetching doctor data:", error);
      if (error.response && error.response.data && error.response.data.message) {
        message.error(error.response.data.message);
      } else {
        message.error("Error connecting to server. Please try again later.");
      }
    }
  };
  
  // handle availability check
  const handleAvailability = async () => {
    try {
      // Validate required fields
      if (!date) {
        message.error("Please select a date");
        return;
      }
      if (!time) {
        message.error("Please select a time");
        return;
      }
      if (!doctors || !doctors._id) {
        message.error("Doctor information not available");
        return;
      }
      
      const token = getToken();
      if (!token) {
        message.error("You must be logged in");
        navigate('/login');
        return;
      }
      
      // Check if selected time is within doctor's working hours
      if (doctors && doctors.timings) {
        // Handle both array and object formats of timings
        let startTime, endTime;
        
        if (Array.isArray(doctors.timings) && doctors.timings.length === 2) {
          startTime = doctors.timings[0];
          endTime = doctors.timings[1];
        } else if (typeof doctors.timings === 'object') {
          startTime = doctors.timings.start || doctors.timings[0];
          endTime = doctors.timings.end || doctors.timings[1];
        }
        
        if (startTime && endTime) {
          // Create moment objects for comparison
          const doctorStart = moment(startTime, "HH:mm");
          const doctorEnd = moment(endTime, "HH:mm");
          const selectedTime = moment(time, "HH:mm");
          
          console.log("Frontend - Doctor hours:", { startTime, endTime, type: typeof doctors.timings });
          console.log("Frontend - Selected time:", time);
          console.log("Frontend - Selected time (moment):", selectedTime.format("HH:mm"));
          console.log("Frontend - Time comparisons:", {
            isBefore: selectedTime.isBefore(doctorStart),
            isAfter: selectedTime.isAfter(doctorEnd),
            doctorStart: doctorStart.format("HH:mm"),
            doctorEnd: doctorEnd.format("HH:mm")
          });
          
          if (selectedTime.isBefore(doctorStart) || selectedTime.isAfter(doctorEnd)) {
            message.error(`Selected time is outside doctor's working hours (${startTime} - ${endTime})`);
            setIsAvailable(false);
            return;
          }
        } else {
          console.log("Frontend - Doctor timings not properly formatted:", doctors.timings);
        }
      }
      
      setAvailabilityChecking(true);
      setIsAvailable(false); // Reset availability state when checking
      dispatch(showLoading());
      
      // Format date consistently
      const formattedDate = moment(date, "DD-MM-YYYY").format("DD-MM-YYYY");
      console.log("Checking availability for:", { 
        doctorId: doctors._id, 
        date: formattedDate,
        time 
      });
      
      try {
        const res = await axios.post(
          "/api/v1/user/booking-availability",
          { 
            doctorId: doctors._id, 
            date: formattedDate,
            time 
          },
          {
            headers: {
              Authorization: `Bearer ${token}`,
              'Content-Type': 'application/json'
            },
          }
        );
        
        console.log("Availability response:", res.data);
        dispatch(hideLoading());
        setAvailabilityChecking(false);
        
        if (res.data.success) {
          console.log("Setting isAvailable to TRUE");
          setIsAvailable(true);
          isAvailableRef.current = true; // Update the ref immediately
          message.success(res.data.message || "Time slot is available!");
          
          // Force re-render to update button state
          setTimeout(() => {
            // This will force a component update
            setIsAvailable(isAvailableRef.current);
            console.log("Is appointment available now?", isAvailableRef.current);
          }, 100);
        } else {
          console.log("Setting isAvailable to FALSE due to failed availability check");
          setIsAvailable(false);
          message.error(res.data.message || "This time slot is not available");
        }
      } catch (error) {
        console.error("Availability check error:", error);
        setIsAvailable(false);
        dispatch(hideLoading());
        setAvailabilityChecking(false);
        
        // Detailed error messaging based on the error type
        if (error.response) {
          // The server responded with a status code outside the 2xx range
          console.log("Error response data:", error.response.data);
          console.log("Error response status:", error.response.status);
          
          const errorMessage = error.response.data?.message || 
                             `Server error (${error.response.status}). Please try again.`;
          message.error(errorMessage);
        } else if (error.request) {
          // The request was made but no response was received
          message.error("No response from server. Please check your connection and try again.");
        } else {
          // Something happened in setting up the request that triggered an Error
          message.error("Error checking availability: " + error.message);
        }
      } finally {
        dispatch(hideLoading());
        setAvailabilityChecking(false);
      }
    } catch (error) {
      dispatch(hideLoading());
      setAvailabilityChecking(false);
      setIsAvailable(false);
      console.log("Availability check error:", error);
      if (error.response && error.response.data && error.response.data.message) {
        message.error(error.response.data.message);
      } else {
        message.error("Error checking availability. Please try again.");
      }
    }
  };
  
  // booking function
  const handleBooking = async () => {
    if (!time || !date || !doctors || !user) {
      message.error("Please select date, time, and doctor");
      return;
    }

    if (moment(date, "DD-MM-YYYY").isBefore(moment(), 'day')) {
      message.error("You cannot book appointments for past dates");
      return;
    }

    // First, check if the time is available
    if (!isAvailableRef.current) {
      try {
        // Format the date consistently
        const formattedDate = moment(date, "DD-MM-YYYY").format("DD-MM-YYYY");
        
        const res = await axios.post(
          "/api/v1/user/booking-availability",
          {
            doctorId: doctors._id,
            date: formattedDate,
            time: time,
          },
          {
            headers: {
              Authorization: `Bearer ${token}`,
              'Content-Type': 'application/json'
            },
          }
        );
        
        if (!res.data.success) {
          message.error(res.data.message || "This time slot is not available for the doctor. Please select a different time.");
          return;
        }
        
        // If we got here, the time is available
        isAvailableRef.current = true;
      } catch (error) {
        console.error("Error checking availability:", error);
        message.error("Could not verify appointment availability. Please try again.");
        return;
      }
    }

    const token = getToken();
    if (!token) {
      message.error("You must be logged in");
      navigate('/login');
      return;
    }

    setBookingLoading(true);
    dispatch(showLoading());
    
    // Format date consistently
    const formattedDate = moment(date, "DD-MM-YYYY").format("DD-MM-YYYY");
    
    // The backend will now fetch and use complete user information from the patient profile
    // We just need to provide the minimum required data
    const appointmentData = {
      doctorId: doctors._id,
      userId: user._id,
      doctorInfo: {
        _id: doctors._id,
        firstName: doctors.firstName,
        lastName: doctors.lastName,
        phone: doctors.phone,
        email: doctors.email,
        specialization: doctors.specialization,
        feesPerConsultation: doctors.feesPerConsultation,
        // Ensure timings are correctly formatted regardless of original format
        timings: Array.isArray(doctors.timings) ? doctors.timings : 
                [doctors.timings.start || doctors.timings[0], doctors.timings.end || doctors.timings[1]]
      },
      userInfo: {
        _id: user._id,
        name: user.name,
        email: user.email
      },
      date: formattedDate,
      time: time,
    };
    
    console.log("Complete appointment data being sent:", JSON.stringify(appointmentData, null, 2));
    
    try {
      // Make sure we're sending a clean request with proper headers
      const res = await axios.post(
        "/api/v1/user/book-appointment",
        appointmentData,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json'
          },
        }
      );
      
      console.log("Booking response:", res.data);
      
      if (res.data.success) {
        // Make sure we show the success message long enough
        message.success(res.data.message || "Appointment booked successfully!");
        
        // Increased timeout to ensure the success message is visible
        setTimeout(() => {
          // Store appointment success in session storage as a backup
          sessionStorage.setItem('appointmentBooked', 'true');
          navigate("/appointments");
        }, 2500); // Increased from 1500ms to 2500ms
      } else {
        // Clear any stale success state
        sessionStorage.removeItem('appointmentBooked');
        message.error(res.data.message || "Failed to book appointment. Please try again.");
      }
    } catch (error) {
      console.error("Appointment booking error:", error);
      sessionStorage.removeItem('appointmentBooked');
      
      // Detailed error messaging based on the error type
      if (error.response) {
        console.log("Error response data:", error.response.data);
        console.log("Error response status:", error.response.status);
        message.error(error.response.data.message || "Server error when booking appointment");
      } else if (error.request) {
        message.error("No response from server. Please check your internet connection and try again.");
      } else {
        message.error("Error preparing appointment request");
      }
    } finally {
      setBookingLoading(false);
      dispatch(hideLoading());
      isAvailableRef.current = false; // Reset the availability status
    }
  };

  // Reset availability when date or time changes
  useEffect(() => {
    if (date || time) {
      setIsAvailable(false);
    }
  }, [date, time]);
  
  // Check if we've just redirected from a successful booking
  useEffect(() => {
    // If there was a successful booking in session storage and a redirect flag is also set
    const wasBookingSuccessful = sessionStorage.getItem('appointmentBooked') === 'true';
    const shouldRedirect = sessionStorage.getItem('redirectAfterBooking') === 'true';
    
    if (wasBookingSuccessful && shouldRedirect) {
      // Redirect only if this is the first booking (shouldRedirect flag is true)
      message.info("Redirecting to appointments page...");
      setTimeout(() => {
        navigate('/appointments');
        sessionStorage.removeItem('appointmentBooked');
        sessionStorage.removeItem('redirectAfterBooking');
      }, 1000);
    } else if (wasBookingSuccessful) {
      // Clear the booking flag but don't redirect if this is a repeat booking
      sessionStorage.removeItem('appointmentBooked');
      // Reset the form for a new booking
      setDate("");
      setTime("");
      setIsAvailable(false);
    }
  }, [navigate]);

  useEffect(() => {
    getUserData();
    // Keep this as is to prevent infinite loops
    //eslint-disable-next-line
  }, []);
  
  return (
    <Layout>
      <div className="booking-container">
        {loading ? (
          <div className="loading-spinner">
            <Spin size="large" />
          </div>
        ) : !doctors ? (
          <div className="error-message">
            Doctor information not available
          </div>
        ) : (
          <div className="booking-card">
            <div className="doctor-header">
              <div className="doctor-info">
                <h2 className="booking-page-doctor-name" style={{ 
                  fontSize: '28px', 
                  fontWeight: 'bold', 
                  letterSpacing: '-0.5px',
                  color: '#ffffff',
                  marginBottom: '0.8rem',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.8rem'
                }}>
                  <UserOutlined /> Dr. {doctors.firstName} {doctors.lastName}
                </h2>
                <div className="doctor-specialty" style={{
                  color: '#ffffff',
                  fontSize: '16px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.5rem'
                }}>
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
                    {(() => {
                      // Format times for better display
                      let startTime = doctors.timings?.[0] || "09:00";
                      let endTime = doctors.timings?.[1] || "17:00";
                      
                      const formatDisplayTime = (timeStr) => {
                        try {
                          return moment(timeStr, ["HH:mm", "h:mm A", "hh:mm A"]).format("h:mm A");
                        } catch (e) {
                          return timeStr; // Return original if parsing fails
                        }
                      };
                      
                      return `${formatDisplayTime(startTime)} - ${formatDisplayTime(endTime)}`;
                    })()}
                  </span>
                </div>
              </div>
            </div>

            <div className="booking-container">
              <Tabs 
                defaultActiveKey="1" 
                className="booking-tabs"
                type="card"
                size="large"
                animated={{ inkBar: true, tabPane: true }}
                style={{ 
                  marginTop: '20px',
                  backgroundColor: '#ffffff',
                  borderRadius: '8px',
                  overflow: 'hidden',
                  boxShadow: '0px 2px 8px rgba(0, 0, 0, 0.08)'
                }}
              >
                <TabPane 
                  tab={
                    <span style={{ padding: '0 10px', fontWeight: '500' }}>
                      <CalendarOutlined style={{ marginRight: '8px' }} />
                      Book Appointment
                    </span>
                  } 
                  key="1"
                >
                  <div className="booking-form">
                    <div className="datetime-selection">
                      <div className="date-picker-container">
                        <label className="form-label">
                          <CalendarOutlined /> Select Date
                        </label>
                        <DatePicker
                          className="custom-date-picker custom-picker-wrapper"
                          format="DD-MM-YYYY"
                          placeholder="Select date"
                          suffixIcon={<CalendarOutlined style={{ color: '#000000' }} />}
                          disabledDate={(current) => {
                            // Disable past dates
                            if (current && current < moment().startOf('day')) {
                              return true;
                            }
                            
                            // Disable dates more than 30 days in the future
                            return current && current > moment().add(30, 'days');
                          }}
                          onChange={(value) => {
                            console.log("Selected date value:", value);
                            setDate(value ? moment(value).format("DD-MM-YYYY") : "");
                            // Reset time and availability when date changes
                            setTime("");
                            setIsAvailable(false);
                          }}
                          showToday={true}
                          popupClassName="custom-date-picker-dropdown"
                          renderExtraFooter={() => (
                            <div className="date-picker-footer">
                              <p>Select a date within the next 30 days</p>
                            </div>
                          )}
                        />
                      </div>

                      <div className="time-picker-container">
                        <label className="form-label">
                          <ClockCircleOutlined /> Select Time
                        </label>
                        <TimePicker
                          className="custom-time-picker custom-picker-wrapper"
                          format="HH:mm"
                          minuteStep={30}
                          use12Hours={false}
                          placeholder="Select time"
                          allowClear={true}
                          suffixIcon={<ClockCircleOutlined style={{ color: '#000000' }} />}
                          value={time ? moment(time, 'HH:mm') : null}
                          popupClassName="custom-time-picker-dropdown"
                          renderExtraFooter={() => {
                            // Format doctor timings for display
                            let startTime = "09:00";
                            let endTime = "17:00";
                            
                            if (doctors && doctors.timings) {
                              // Handle various formats of timings data
                              if (Array.isArray(doctors.timings) && doctors.timings.length >= 2) {
                                startTime = doctors.timings[0];
                                endTime = doctors.timings[1];
                              } else if (doctors.timings.start && doctors.timings.end) {
                                startTime = doctors.timings.start;
                                endTime = doctors.timings.end;
                              }
                            }
                            
                            // Format times for better display
                            const formatDisplayTime = (timeStr) => {
                              try {
                                return moment(timeStr, ["HH:mm", "h:mm A", "hh:mm A"]).format("h:mm A");
                              } catch (e) {
                                return timeStr; // Return original if parsing fails
                              }
                            };
                            
                            return (
                              <div className="time-picker-footer">
                                <p>Select a time during doctor's working hours: {formatDisplayTime(startTime)} - {formatDisplayTime(endTime)}</p>
                              </div>
                            );
                          }}
                          disabledTime={() => {
                            // Extract doctor's working hours safely
                            let startHour = 9; // Default start hour
                            let endHour = 17; // Default end hour
                            let startMinute = 0;
                            let endMinute = 0;

                            try {
                              if (doctors && doctors.timings) {
                                // Handle both array and object formats
                                let startTime, endTime;
                                
                                if (Array.isArray(doctors.timings) && doctors.timings.length >= 2) {
                                  startTime = doctors.timings[0];
                                  endTime = doctors.timings[1];
                                } else if (typeof doctors.timings === 'object') {
                                  startTime = doctors.timings.start || doctors.timings[0] || "09:00";
                                  endTime = doctors.timings.end || doctors.timings[1] || "17:00";
                                }
                                
                                if (startTime && endTime) {
                                  // Parse hours and minutes safely
                                  const startParts = startTime.split(':');
                                  const endParts = endTime.split(':');
                                  
                                  if (startParts.length >= 1) {
                                    startHour = parseInt(startParts[0], 10) || 9;
                                    startMinute = startParts.length >= 2 ? parseInt(startParts[1], 10) || 0 : 0;
                                  }
                                  
                                  if (endParts.length >= 1) {
                                    endHour = parseInt(endParts[0], 10) || 17;
                                    endMinute = endParts.length >= 2 ? parseInt(endParts[1], 10) || 0 : 0;
                                  }
                                }
                              }
                            } catch (error) {
                              console.error("Error parsing doctor timings:", error);
                            }
                            
                            return {
                              disabledHours: () => {
                                const disabledHours = [];
                                for (let i = 0; i < 24; i++) {
                                  if (i < startHour || i > endHour) {
                                    disabledHours.push(i);
                                  }
                                }
                                return disabledHours;
                              },
                              disabledMinutes: (selectedHour) => {
                                const disabledMinutes = [];
                                
                                // If at boundary hours, disable minutes outside the range
                                if (selectedHour === startHour) {
                                  for (let i = 0; i < startMinute; i++) {
                                    disabledMinutes.push(i);
                                  }
                                }
                                
                                if (selectedHour === endHour) {
                                  for (let i = endMinute + 1; i < 60; i++) {
                                    disabledMinutes.push(i);
                                  }
                                }
                                
                                // Always disable minutes that aren't multiples of 30
                                for (let i = 0; i < 60; i++) {
                                  if (i % 30 !== 0) {
                                    disabledMinutes.push(i);
                                  }
                                }
                                
                                return disabledMinutes;
                              }
                            };
                          }}
                          onChange={(value, timeString) => {
                            console.log("Selected time:", value, "Time string:", timeString);
                            // Ensure we're setting the time in the correct format
                            setTime(timeString || "");
                            // Reset availability if time changes
                            setIsAvailable(false);
                          }}
                        />
                      </div>
                    </div>

                    <div className="action-buttons">
                      <Button
                        className="availability-btn"
                        onClick={handleAvailability}
                        disabled={!date || !time || !doctors}
                        loading={availabilityChecking}
                        icon={<ClockCircleOutlined />}
                        size="large"
                        style={{ 
                          backgroundColor: '#ffffff',
                          borderColor: '#000000',
                          color: '#000000',
                          height: '50px',
                          borderRadius: '6px',
                          width: '100%',
                          fontWeight: '600',
                          fontSize: '17px',
                          boxShadow: '0 2px 8px rgba(0, 0, 0, 0.08)',
                          marginBottom: '10px'
                        }}
                      >
                        Check Availability
                      </Button>
                      <Button 
                        className="book-now-btn"
                        type="primary"
                        onClick={handleBooking}
                        disabled={!doctors || !date || !time || bookingLoading} 
                        loading={bookingLoading}
                        icon={<CalendarOutlined />}
                        size="large"
                        style={{ 
                          backgroundColor: '#000000',
                          borderColor: '#000000',
                          height: '50px',
                          borderRadius: '6px',
                          width: '100%',
                          fontWeight: '600',
                          fontSize: '17px',
                          boxShadow: '0 2px 8px rgba(0, 0, 0, 0.08)',
                          marginBottom: '10px'
                        }}
                      >
                        Book Appointment
                      </Button>
                    </div>
                    
                    {date && time && (
                      <div className="selected-time-info">
                        <p>
                          <strong>Selected Date:</strong> {moment(date, "DD-MM-YYYY").format("dddd, MMMM Do, YYYY")}
                        </p>
                        <p>
                          <strong>Selected Time:</strong> {moment(time, "HH:mm").format("h:mm A")}
                        </p>
                      </div>
                    )}
                  </div>
                </TabPane>
                
                <TabPane 
                  tab={
                    <span style={{ padding: '0 10px', fontWeight: '500' }}>
                      <UserOutlined style={{ marginRight: '8px' }} />
                      Ratings & Reviews
                    </span>
                  } 
                  key="2"
                >
                  {doctors && doctors._id && (
                    <DoctorRatingsTab doctorId={params.doctorId} />
                  )}
                </TabPane>
              </Tabs>
            </div>
          </div>
        )}
      </div>
    </Layout>
  );
};

export default BookingPage;