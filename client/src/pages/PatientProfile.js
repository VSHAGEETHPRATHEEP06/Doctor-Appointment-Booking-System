// PatientProfile.js
import React, { useEffect, useState } from "react";
import Layout from "../components/Layout";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { Col, Form, Input, Row, DatePicker, message, Spin, Select } from "antd";
import { useSelector, useDispatch } from "react-redux";
import { showLoading, hideLoading } from "../redux/features/alertSlice";
import moment from "moment";
import { 
  UserOutlined, 
  PhoneOutlined, 
  MailOutlined, 
  HeartOutlined,
  IdcardOutlined,
  SafetyOutlined,
  ContactsOutlined,
  CalendarOutlined,
  ExperimentOutlined,
  EnvironmentOutlined,
  DashboardOutlined,
  FileTextOutlined
} from '@ant-design/icons';
import "../styles/Profile.css";

const PatientProfile = () => {
  const { user } = useSelector((state) => state.user);
  const [loading, setLoading] = useState(false);
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
        "/api/v1/patient/createProfile",
        {
          ...values,
          userId: user._id,
          dob: moment(values.dob).format("YYYY-MM-DD"),
          address: {
            street: values.street,
            city: values.city,
            state: values.state,
            zip: values.zip
          }
        },
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
            "Content-Type": "application/json",
          },
        }
      );
      dispatch(hideLoading());
      if (res.data.success) {
        message.success("Profile completed successfully!");
        navigate("/");
      } else {
        message.error(res.data.message);
      }
    } catch (error) {
      dispatch(hideLoading());
      console.error("Submission error:", error);
      message.error("Failed to save profile");
    }
  };

  if (!user) {
    return (
      <Layout>
        <div className="text-center mt-8">
          <Spin size="large" />
        </div>
      </Layout>
    );
  }

  // Get initial name parts from user's name
  const nameParts = user.name ? user.name.split(' ') : ['', ''];

  return (
    <Layout>
      <div className="profile-container">
        <div className="form-header">
          <h1 className="form-main-title">Complete Your Medical Profile</h1>
          <p className="form-subtitle">Please provide the following details to continue</p>
        </div>
        
        <Form
          layout="vertical"
          onFinish={handleFinish}
          className="patient-form"
          initialValues={{
            firstName: nameParts[0],
            lastName: nameParts.slice(1).join(' '),
            email: user.email
          }}
        >
          {/* Personal Information Section */}
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
                  label="Date of Birth"
                  name="dob"
                  rules={[{ required: true, message: "Please select your date of birth" }]}
                >
                  <DatePicker
                    className="form-input"
                    format="YYYY-MM-DD"
                    suffixIcon={<CalendarOutlined />}
                  />
                </Form.Item>
              </Col>
              <Col xs={24} md={12} lg={8}>
                <Form.Item
                  label="Phone Number"
                  name="phone"
                  rules={[{ 
                    required: true, 
                    message: "Please enter your phone number",
                    pattern: new RegExp(/^[0-9]{10}$/),
                    message: "Please enter a valid 10-digit phone number"
                  }]}
                >
                  <Input 
                    prefix={<PhoneOutlined className="form-input-icon" />}
                    placeholder="Enter phone number"
                    className="form-input"
                    type="tel"
                  />
                </Form.Item>
              </Col>
              <Col xs={24} md={12} lg={8}>
                <Form.Item
                  label="Email"
                  name="email"
                >
                  <Input 
                    prefix={<MailOutlined className="form-input-icon" />}
                    className="form-input"
                    disabled
                  />
                </Form.Item>
              </Col>
              <Col xs={24} md={12} lg={8}>
                <Form.Item
                  label="Blood Group"
                  name="bloodGroup"
                  rules={[{ required: true, message: "Please select blood group" }]}
                >
                  <Select placeholder="Select blood group" className="form-input">
                    <Select.Option value="A+">A+</Select.Option>
                    <Select.Option value="A-">A-</Select.Option>
                    <Select.Option value="B+">B+</Select.Option>
                    <Select.Option value="B-">B-</Select.Option>
                    <Select.Option value="O+">O+</Select.Option>
                    <Select.Option value="O-">O-</Select.Option>
                    <Select.Option value="AB+">AB+</Select.Option>
                    <Select.Option value="AB-">AB-</Select.Option>
                  </Select>
                </Form.Item>
              </Col>
            </Row>
          </div>

          {/* Health Details Section */}
          <div className="form-section">
            <h3 className="section-title"><FileTextOutlined /> Health Information</h3>
            <Row gutter={[24, 16]}>
              <Col xs={24} md={12} lg={8}>
                <Form.Item
                  label="Main Health Concern"
                  name="medicalProblem"
                  rules={[{ required: true, message: "Please describe your main health concern" }]}
                >
                  <Input.TextArea 
                    placeholder="Describe your primary health issue"
                    className="form-input"
                    rows={3}
                  />
                </Form.Item>
              </Col>
              <Col xs={24} md={12} lg={8}>
                <Form.Item
                  label="Symptoms Duration"
                  name="problemDuration"
                  rules={[{ required: true, message: "Please select duration" }]}
                >
                  <Select placeholder="Select duration" className="form-input">
                    <Select.Option value="Less than 1 week">Less than 1 week</Select.Option>
                    <Select.Option value="1-4 weeks">1-4 weeks</Select.Option>
                    <Select.Option value="1-6 months">1-6 months</Select.Option>
                    <Select.Option value="More than 6 months">More than 6 months</Select.Option>
                  </Select>
                </Form.Item>
              </Col>
              <Col xs={24} md={12} lg={8}>
                <Form.Item
                  label="Height (cm)"
                  name="height"
                  rules={[{ required: true, message: "Please enter your height" }]}
                >
                  <Input 
                    type="number"
                    min={100}
                    max={250}
                    prefix={<DashboardOutlined />}
                    placeholder="Enter height in centimeters"
                    className="form-input"
                  />
                </Form.Item>
              </Col>
              <Col xs={24} md={12} lg={8}>
                <Form.Item
                  label="Weight (kg)"
                  name="weight"
                  rules={[{ required: true, message: "Please enter your weight" }]}
                >
                  <Input 
                    type="number"
                    min={30}
                    max={300}
                    prefix={<DashboardOutlined />}
                    placeholder="Enter weight in kilograms"
                    className="form-input"
                  />
                </Form.Item>
              </Col>
            </Row>
          </div>

          {/* Address Section */}
          <div className="form-section">
            <h3 className="section-title"><EnvironmentOutlined /> Address Details</h3>
            <Row gutter={[24, 16]}>
              <Col xs={24} md={12} lg={8}>
                <Form.Item
                  label="Street Address"
                  name="street"
                  rules={[{ required: true, message: "Please enter street address" }]}
                >
                  <Input 
                    prefix={<EnvironmentOutlined />}
                    placeholder="Enter street and number"
                    className="form-input"
                  />
                </Form.Item>
              </Col>
              <Col xs={24} md={12} lg={8}>
                <Form.Item
                  label="City"
                  name="city"
                  rules={[{ required: true, message: "Please enter city" }]}
                >
                  <Input 
                    placeholder="Enter city name"
                    className="form-input"
                  />
                </Form.Item>
              </Col>
              <Col xs={24} md={12} lg={8}>
                <Form.Item
                  label="State/Province"
                  name="state"
                  rules={[{ required: true, message: "Please enter state/province" }]}
                >
                  <Input 
                    placeholder="Enter state or province"
                    className="form-input"
                  />
                </Form.Item>
              </Col>
              <Col xs={24} md={12} lg={8}>
                <Form.Item
                  label="ZIP/Postal Code"
                  name="zip"
                  rules={[{ required: true, message: "Please enter ZIP/postal code" }]}
                >
                  <Input 
                    placeholder="Enter postal code"
                    className="form-input"
                  />
                </Form.Item>
              </Col>
            </Row>
          </div>

          {/* Emergency Contact Section */}
          <div className="form-section">
            <h3 className="section-title"><ContactsOutlined /> Emergency Contact</h3>
            <Row gutter={[24, 16]}>
              <Col xs={24} md={12} lg={8}>
                <Form.Item
                  label="Full Name"
                  name={["emergencyContact", "name"]}
                  rules={[{ required: true, message: "Please enter emergency contact name" }]}
                >
                  <Input 
                    prefix={<UserOutlined className="form-input-icon" />}
                    placeholder="Enter full name"
                    className="form-input"
                  />
                </Form.Item>
              </Col>
              <Col xs={24} md={12} lg={8}>
                <Form.Item
                  label="Phone Number"
                  name={["emergencyContact", "phone"]}
                  rules={[{ 
                    required: true, 
                    message: "Please enter emergency phone number",
                    pattern: new RegExp(/^[0-9]{10}$/),
                    message: "Please enter a valid 10-digit phone number"
                  }]}
                >
                  <Input 
                    prefix={<PhoneOutlined className="form-input-icon" />}
                    placeholder="Enter phone number"
                    className="form-input"
                    type="tel"
                  />
                </Form.Item>
              </Col>
              <Col xs={24} md={12} lg={8}>
                <Form.Item
                  label="Relationship"
                  name={["emergencyContact", "relation"]}
                  rules={[{ required: true, message: "Please enter relationship" }]}
                >
                  <Input 
                    prefix={<IdcardOutlined className="form-input-icon" />}
                    placeholder="E.g. Parent, Spouse"
                    className="form-input"
                  />
                </Form.Item>
              </Col>
            </Row>
          </div>

          <div className="form-submit">
            <button className="submit-button" type="submit">
              Complete Registration
            </button>
          </div>
        </Form>
      </div>
    </Layout>
  );
};

export default PatientProfile;