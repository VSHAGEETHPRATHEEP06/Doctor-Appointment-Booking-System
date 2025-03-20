import React, { useEffect, useState } from "react";
import Layout from "../components/Layout";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { Col, Form, Input, Row, message, Spin } from "antd";
import { useSelector, useDispatch } from "react-redux";
import { showLoading, hideLoading } from "../redux/features/alertSlice";
import { 
  UserOutlined, 
  PhoneOutlined, 
  MailOutlined,
  EnvironmentOutlined,
  SafetyOutlined,
  GlobalOutlined
} from '@ant-design/icons';
import "../styles/Profile.css";

const AdminProfile = () => {
  const { user } = useSelector((state) => state.user);
  const [adminData, setAdminData] = useState(null);
  const [loading, setLoading] = useState(true);
  const dispatch = useDispatch();
  const navigate = useNavigate();

  useEffect(() => {
    if (!user || user.role !== "admin") {
      navigate("/login");
      message.error("Unauthorized access");
    }
  }, [user, navigate]);

  const handleFinish = async (values) => {
    try {
      dispatch(showLoading());
      const res = await axios.post(
        "/api/v1/admin/updateProfile",
        {
          ...values,
          userId: user._id
        },
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
      );
      dispatch(hideLoading());
      if (res.data.success) {
        message.success("Profile updated successfully");
        setAdminData(res.data.data);
      } else {
        message.error(res.data.message);
      }
    } catch (error) {
      dispatch(hideLoading());
      console.error("Update error:", error);
      message.error("Failed to update profile");
    }
  };

  const getAdminInfo = async () => {
    try {
      const res = await axios.post(
        "/api/v1/admin/getAdminInfo",
        { userId: user._id },
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
      );
      if (res.data.success) {
        setAdminData(res.data.data);
      }
    } catch (error) {
      console.error("Fetch error:", error);
      message.error("Failed to load admin information");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user?._id) {
      getAdminInfo();
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

  return (
    <Layout>
      <div className="profile-container">
        <div className="form-header">
          <h1 className="form-main-title">Admin Profile Management</h1>
          <p className="form-subtitle">Update your administrative details</p>
        </div>
        
        <Form
          layout="vertical"
          onFinish={handleFinish}
          className="admin-form"
          initialValues={{
            name: user.name,
            email: user.email,
            ...adminData
          }}
        >
          <div className="form-section">
            <h3 className="section-title"><UserOutlined /> Basic Information</h3>
            <Row gutter={[24, 16]}>
              <Col xs={24} md={12} lg={8}>
                <Form.Item
                  label="Full Name"
                  name="name"
                  rules={[{ 
                    required: true, 
                    message: "Please enter your full name",
                    min: 3,
                    max: 50 
                  }]}
                >
                  <Input 
                    prefix={<UserOutlined className="form-input-icon" />}
                    placeholder="Enter your full name"
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
                    className="form-input"
                    disabled
                  />
                </Form.Item>
              </Col>

              <Col xs={24} md={12} lg={8}>
                <Form.Item
                  label="Phone Number"
                  name="phone"
                  rules={[
                    { required: true, message: "Please enter phone number" },
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
            </Row>
          </div>

          <div className="form-section">
            <h3 className="section-title"><SafetyOutlined /> Administrative Details</h3>
            <Row gutter={[24, 16]}>
              <Col xs={24} md={12} lg={8}>
                <Form.Item
                  label="Office Address"
                  name="officeAddress"
                  rules={[{ 
                    required: true, 
                    message: "Please enter office address",
                    min: 5,
                    max: 100 
                  }]}
                >
                  <Input 
                    prefix={<EnvironmentOutlined className="form-input-icon" />}
                    placeholder="Enter official office address"
                    className="form-input"
                  />
                </Form.Item>
              </Col>

              <Col xs={24} md={12} lg={8}>
                <Form.Item
                  label="Emergency Contact"
                  name="emergencyContact"
                  rules={[
                    { required: true, message: "Please enter emergency contact" },
                    { pattern: /^[0-9]{10}$/, message: "Invalid phone number" }
                  ]}
                >
                  <Input 
                    prefix={<PhoneOutlined className="form-input-icon" />}
                    placeholder="Enter emergency contact number"
                    className="form-input"
                    maxLength={10}
                  />
                </Form.Item>
              </Col>

              <Col xs={24} md={12} lg={8}>
                <Form.Item
                  label="Administrative ID"
                  name="adminId"
                  rules={[{ 
                    required: true, 
                    message: "Please enter your administrative ID",
                    min: 5,
                    max: 20 
                  }]}
                >
                  <Input 
                    prefix={<SafetyOutlined className="form-input-icon" />}
                    placeholder="Enter your official admin ID"
                    className="form-input"
                  />
                </Form.Item>
              </Col>

              <Col xs={24} md={12} lg={8}>
                <Form.Item
                  label="Department"
                  name="department"
                  rules={[{ 
                    required: true, 
                    message: "Please enter your department",
                    min: 3,
                    max: 50 
                  }]}
                >
                  <Input 
                    prefix={<GlobalOutlined className="form-input-icon" />}
                    placeholder="Enter your department"
                    className="form-input"
                  />
                </Form.Item>
              </Col>

              <Col xs={24} md={24} lg={24}>
                <div className="form-submit">
                  <button className="submit-button" type="submit">
                    Update Administrative Profile
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

export default AdminProfile;