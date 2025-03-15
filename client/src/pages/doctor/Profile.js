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
  const [loading, setLoading] = useState(true);
  const dispatch = useDispatch();
  const navigate = useNavigate();

  useEffect(() => {
    if (!user) {
      navigate("/login");
      message.error("Please login first");
    }
  }, [user, navigate]);

  const handleFinish = async (values) => {
    try {
      if (!user?._id) return;
      
      dispatch(showLoading());
      const res = await axios.post(
        "/api/v1/doctor/updateProfile",
        {
          ...values,
          userId: user._id,
          timings: [
            moment(values.timings[0]).format("HH:mm"),
            moment(values.timings[1]).format("HH:mm"),
          ],
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
          layout="vertical"
          onFinish={handleFinish}
          className="doctor-form"
          initialValues={{
            ...doctor,
            timings: [
              moment(doctor.timings[0], "HH:mm"),
              moment(doctor.timings[1], "HH:mm"),
            ],
          }}
        >
          <div className="form-section">
            <h3 className="section-title"><UserOutlined /> Personal Information</h3>
            <Row gutter={[24, 16]}>
              <Col xs={24} md={12} lg={8}>
                <Form.Item
                  label="First Name"
                  name="firstName"
                  rules={[{ required: true, message: "Please enter your first name" }]}
                >
                  <Input 
                    prefix={<UserOutlined className="form-input-icon" />}
                    placeholder="Enter first name"
                    className="form-input"
                  />
                </Form.Item>
              </Col>
              <Col xs={24} md={12} lg={8}>
                <Form.Item
                  label="Last Name"
                  name="lastName"
                  rules={[{ required: true, message: "Please enter your last name" }]}
                >
                  <Input 
                    prefix={<UserOutlined className="form-input-icon" />}
                    placeholder="Enter last name"
                    className="form-input"
                  />
                </Form.Item>
              </Col>
              <Col xs={24} md={12} lg={8}>
                <Form.Item
                  label="Phone Number"
                  name="phone"
                  rules={[{ required: true, message: "Please enter your phone number" }]}
                >
                  <Input 
                    prefix={<PhoneOutlined className="form-input-icon" />}
                    placeholder="Enter phone number"
                    className="form-input"
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
                <Form.Item label="Website" name="website">
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
                  rules={[{ required: true, message: "Please enter your clinic address" }]}
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
                  rules={[{ required: true, message: "Please enter your specialization" }]}
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
                  rules={[{ required: true, message: "Please enter your experience" }]}
                >
                  <Input 
                    prefix={<CalendarOutlined className="form-input-icon" />}
                    placeholder="Enter years of experience"
                    className="form-input"
                  />
                </Form.Item>
              </Col>
              <Col xs={24} md={12} lg={8}>
                <Form.Item
                  label="Consultation Fee"
                  name="feesPerConsultation"
                  rules={[{ required: true, message: "Please enter consultation fee" }]}
                >
                  <Input 
                    prefix={<WalletOutlined className="form-input-icon" />}
                    placeholder="Enter fee amount"
                    className="form-input"
                  />
                </Form.Item>
              </Col>
              <Col xs={24} md={12} lg={8}>
                <Form.Item
                  label="Availability"
                  name="timings"
                  rules={[{ required: true, message: "Please set availability hours" }]}
                >
                  <TimePicker.RangePicker
                    format="HH:mm"
                    className="time-picker"
                    suffixIcon={<ScheduleOutlined />}
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