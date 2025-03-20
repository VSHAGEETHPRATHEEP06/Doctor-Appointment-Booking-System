import React, { useEffect, useState } from "react";
import Layout from "./../../components/Layout";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { Col, Form, Input, Row, TimePicker, message, Spin } from "antd";
import { useSelector, useDispatch } from "react-redux";
import { showLoading, hideLoading } from "../../redux/features/alertSlice";
import moment from "moment";
import { 
  UserOutlined, 
  PhoneOutlined, 
  MailOutlined, 
  GlobalOutlined, 
  MedicineBoxOutlined, 
  ScheduleOutlined, 
  WalletOutlined,
  EnvironmentOutlined,
  ExperimentOutlined,
  CalendarOutlined
} from '@ant-design/icons';
import "../../styles/Profile.css";

const Profile = () => {
  const { user } = useSelector((state) => state.user);
  const [doctor, setDoctor] = useState(null);
  const [timeRange, setTimeRange] = useState([]);
  const [loading, setLoading] = useState(true);
  const dispatch = useDispatch();
  const navigate = useNavigate();

  useEffect(() => {
    if (!user) {
      navigate("/login");
      message.error("Please login first");
    }
  }, [user, navigate]);

  const handleTimeChange = (times) => {
    if (times && times.length === 2) {
      let [start, end] = times;
      if (end.isSameOrBefore(start)) {
        end = start.clone().add(1, 'hour');
      }
      setTimeRange([start, end]);
    }
  };

  const handleFinish = async (values) => {
    try {
      if (!user?._id) return;
      
      dispatch(showLoading());
      const res = await axios.post(
        "/api/v1/doctor/updateProfile",
        {
          ...values,
          userId: user._id,
          timings: timeRange.map(t => t.format("HH:mm")),
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
        navigate("/");
      } else {
        message.error(res.data.message);
      }
    } catch (error) {
      dispatch(hideLoading());
      console.error("Update error:", error);
      message.error("Failed to update profile");
    }
  };

  const getDoctorInfo = async () => {
    try {
      if (!user?._id) return;
      
      const res = await axios.post(
        "/api/v1/doctor/getDoctorInfo",
        { userId: user._id },
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
      );
      if (res.data.success) {
        setDoctor(res.data.data);
        // Initialize time range
        const initialTimes = [
          moment(res.data.data.timings[0], "HH:mm"),
          moment(res.data.data.timings[1], "HH:mm")
        ];
        if (initialTimes.every(t => t.isValid())) {
          setTimeRange(initialTimes);
        } else {
          setTimeRange([
            moment().startOf('hour'),
            moment().startOf('hour').add(1, 'hour')
          ]);
        }
      } else {
        message.error(res.data.message);
      }
    } catch (error) {
      console.error("Fetch error:", error);
      message.error("Failed to load doctor information");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user?._id) {
      getDoctorInfo();
    }
  }, [user?._id]);

  if (loading || !user) {
    return (
      <Layout>
        <div className="text-center mt-8">
          <Spin size="large" />
        </div>
      </Layout>
    );
  }

  if (!doctor) {
    return (
      <Layout>
        <div className="text-center mt-8 text-red-500">
          Doctor profile not found
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="profile-container">
        <div className="form-header">
          <h1 className="form-main-title">DOC APP - Doctor Profile</h1>
          <p className="form-subtitle">Manage Your Professional Information</p>
        </div>
        
        <Form
          key={doctor ? 'loaded' : 'loading'}
          layout="vertical"
          onFinish={handleFinish}
          className="doctor-form"
          initialValues={doctor}
        >
          <div className="form-section">
            <h3 className="section-title"><UserOutlined /> Personal Information</h3>
            <Row gutter={[24, 16]}>
              <Col xs={24} md={12} lg={8}>
                <Form.Item
                  label="First Name"
                  name="firstName"
                  rules={[{ 
                    required: true, 
                    message: "Please enter your first name",
                    whitespace: true 
                  }]}
                >
                  <Input 
                    prefix={<UserOutlined className="form-input-icon" />}
                    placeholder="Enter first name"
                    className="form-input"
                    maxLength={50}
                  />
                </Form.Item>
              </Col>
              <Col xs={24} md={12} lg={8}>
                <Form.Item
                  label="Last Name"
                  name="lastName"
                  rules={[{ 
                    required: true, 
                    message: "Please enter your last name",
                    whitespace: true 
                  }]}
                >
                  <Input 
                    prefix={<UserOutlined className="form-input-icon" />}
                    placeholder="Enter last name"
                    className="form-input"
                    maxLength={50}
                  />
                </Form.Item>
              </Col>
              <Col xs={24} md={12} lg={8}>
                <Form.Item
                  label="Phone Number"
                  name="phone"
                  rules={[
                    { required: true, message: "Please enter your phone number" },
                    { pattern: /^[0-9]{10}$/, message: "Invalid phone number" }
                  ]}
                >
                  <Input 
                    prefix={<PhoneOutlined className="form-input-icon" />}
                    placeholder="Enter 10-digit phone number"
                    className="form-input"
                    maxLength={10}
                  />
                </Form.Item>
              </Col>
              <Col xs={24} md={12} lg={8}>
                <Form.Item
                  label="Email"
                  name="email"
                  rules={[
                    { required: true, message: "Please enter your email" },
                    { type: "email", message: "Please enter a valid email" },
                  ]}
                >
                  <Input 
                    prefix={<MailOutlined className="form-input-icon" />}
                    placeholder="Enter email address"
                    className="form-input"
                  />
                </Form.Item>
              </Col>
              <Col xs={24} md={12} lg={8}>
                <Form.Item 
                  label="Website" 
                  name="website"
                  rules={[
                    { type: "url", message: "Please enter a valid URL" }
                  ]}
                >
                  <Input 
                    prefix={<GlobalOutlined className="form-input-icon" />}
                    placeholder="Enter website URL"
                    className="form-input"
                  />
                </Form.Item>
              </Col>
              <Col xs={24} md={12} lg={8}>
                <Form.Item
                  label="Clinic Address"
                  name="address"
                  rules={[{ 
                    required: true, 
                    message: "Please enter your clinic address",
                    min: 10,
                    max: 200 
                  }]}
                >
                  <Input 
                    prefix={<EnvironmentOutlined className="form-input-icon" />}
                    placeholder="Enter clinic address"
                    className="form-input"
                  />
                </Form.Item>
              </Col>
            </Row>
          </div>

          <div className="form-section">
            <h3 className="section-title"><MedicineBoxOutlined /> Professional Details</h3>
            <Row gutter={[24, 16]}>
              <Col xs={24} md={12} lg={8}>
                <Form.Item
                  label="Specialization"
                  name="specialization"
                  rules={[{ 
                    required: true, 
                    message: "Please enter your specialization",
                    min: 3,
                    max: 50 
                  }]}
                >
                  <Input 
                    prefix={<ExperimentOutlined className="form-input-icon" />}
                    placeholder="Enter specialization"
                    className="form-input"
                  />
                </Form.Item>
              </Col>
              <Col xs={24} md={12} lg={8}>
                <Form.Item
                  label="Experience"
                  name="experience"
                  rules={[{ 
                    required: true, 
                    message: "Please enter valid number of years",
                    pattern: new RegExp(/^[0-9]+$/)
                  }]}
                >
                  <Input 
                    prefix={<CalendarOutlined className="form-input-icon" />}
                    placeholder="Enter years of experience"
                    className="form-input"
                    type="number"
                    min={0}
                    max={50}
                  />
                </Form.Item>
              </Col>
              <Col xs={24} md={12} lg={8}>
                <Form.Item
                  label="Consultation Fee"
                  name="feesPerConsultation"
                  rules={[{ 
                    required: true, 
                    message: "Please enter a valid fee amount",
                    pattern: new RegExp(/^[0-9]+$/)
                  }]}
                >
                  <Input 
                    prefix={<WalletOutlined className="form-input-icon" />}
                    placeholder="Enter fee amount"
                    className="form-input"
                    type="number"
                    min={0}
                  />
                </Form.Item>
              </Col>
              <Col xs={24} md={12} lg={8}>
                <Form.Item
                  label="Availability"
                  rules={[{ 
                    required: true, 
                    message: "Please set availability hours",
                    validator: (_, value) => {
                      if (!timeRange || timeRange.length !== 2) {
                        return Promise.reject('Please select both start and end times');
                      }
                      if (timeRange[0].isSameOrAfter(timeRange[1])) {
                        return Promise.reject('End time must be after start time');
                      }
                      return Promise.resolve();
                    }
                  }]}
                >
                  <TimePicker.RangePicker
                    value={timeRange}
                    onChange={handleTimeChange}
                    format="HH:mm"
                    className="time-picker"
                    suffixIcon={<ScheduleOutlined />}
                    minuteStep={15}
                    showNow={false}
                    disabledTime={(current, type) => ({
                      disabledMinutes: () => 
                        Array.from({ length: 60 }, (_, i) => i)
                          .filter(m => m % 15 !== 0)
                    })}
                    placeholder={['Start Time', 'End Time']}
                    allowClear={false}
                    order={false}
                  />
                </Form.Item>
              </Col>
              <Col xs={24} md={24} lg={24}>
                <div className="form-submit">
                  <button className="submit-button" type="submit">
                    Update Profile
                  </button>
                </div>
              </Col>
            </Row>
          </div>
        </Form>
      </div>
    </Layout>
  );
};

export default Profile;