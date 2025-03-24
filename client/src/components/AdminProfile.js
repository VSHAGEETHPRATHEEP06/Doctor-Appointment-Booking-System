import React, { useEffect, useState } from "react";
import Layout from "../components/Layout";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { Col, Form, Input, Row, message, Spin, Button } from "antd";
import { useSelector, useDispatch } from "react-redux";
import { showLoading, hideLoading } from "../redux/features/alertSlice";
import { 
  UserOutlined, 
  PhoneOutlined, 
  MailOutlined,
  EnvironmentOutlined,
  SafetyOutlined,
  GlobalOutlined,
  SaveOutlined
} from '@ant-design/icons';
import "../styles/Profile.css";
import "../styles/AdminStyles.css";

const AdminProfile = () => {
  const { user } = useSelector((state) => state.user);
  const [adminData, setAdminData] = useState(null);
  const [loading, setLoading] = useState(true);
  const dispatch = useDispatch();
  const navigate = useNavigate();

  useEffect(() => {
    if (!user) {
      return; // Wait for user data to load
    }
    
    // Check if user is admin based on isAdmin property
    if (!user.isAdmin) {
      navigate("/");
      message.error("Unauthorized access: Only admins can access this page");
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
      // Only attempt to fetch admin info if user is logged in and is an admin
      if (!user || !user._id) {
        setLoading(false);
        return;
      }

      if (!user.isAdmin) {
        message.error("Only admins can access this page");
        navigate("/");
        setLoading(false);
        return;
      }

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
        if (res.data.message) {
          // Show any messages from the server
          message.info(res.data.message);
        }
      } else {
        message.error(res.data.message || "Failed to load admin information");
      }
    } catch (error) {
      console.error("Fetch error:", error);
      
      // Handle different error types
      if (error.response) {
        // The request was made and the server responded with a status code
        // that falls out of the range of 2xx
        if (error.response.status === 403) {
          message.error("Unauthorized: Only admins can access this page");
          navigate("/");
        } else {
          message.error(error.response.data?.message || "Failed to load admin information");
        }
      } else if (error.request) {
        // The request was made but no response was received
        message.error("No response from server. Please check your connection.");
      } else {
        // Something happened in setting up the request that triggered an Error
        message.error("Error setting up request: " + error.message);
      }
    } finally {
      setLoading(false);
    }
  };

  // Use useEffect with proper dependencies to avoid infinite loops
  useEffect(() => {
    if (user?._id) {
      getAdminInfo();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user?._id]); // Only depend on user ID, not the function itself

  if (loading || !user) {
    return (
      <Layout>
        <div className="container">
          <div className="d-flex justify-content-center align-items-center" style={{ minHeight: '60vh' }}>
            <Spin size="large" />
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="container">
        <div className="card mt-4 mb-4">
          <div className="card-header bg-white">
            <h1 className="text-center mb-0">Admin Profile Management</h1>
            <p className="text-center text-muted mb-0 mt-2">Update your administrative details</p>
          </div>
          
          <div className="card-body">
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

                </Row>
              </div>
              
              <div className="admin-btn-container mt-4">
                <Button 
                  className="admin-btn-primary" 
                  icon={<SaveOutlined />}
                  htmlType="submit"
                >
                  Update Administrative Profile
                </Button>
              </div>
            </Form>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default AdminProfile;