import "../styles/LoginStyles.css"
import React, { useState } from "react";
import "../styles/RegisterStyles.css";
import { Form, Input, message, Modal, Button } from "antd";
import { useDispatch } from "react-redux";
import { showLoading, hideLoading } from "../redux/features/alertSlice";
import { setUser } from "../redux/features/userSlice";
import { Link, useNavigate } from "react-router-dom";
import axios from "../../src/config/axiosConfig";
import { UserOutlined, LockOutlined, SafetyCertificateOutlined } from '@ant-design/icons';

const Login = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const [isBlockedModalVisible, setIsBlockedModalVisible] = useState(false);
  const [blockedUserEmail, setBlockedUserEmail] = useState("");
  const [requestForm] = Form.useForm();

  const onfinishHandler = async (values) => {
    try {
      dispatch(showLoading());
      const res = await axios.post("/api/v1/user/login", values);
      
      if (res.data.success) {
        // Store the token in localStorage
        localStorage.setItem("token", res.data.token);
        
        // Immediately fetch user data to update Redux store with correct role
        try {
          const userData = await axios.post(
            "/api/v1/user/getUserData",
            { token: res.data.token },
            {
              headers: {
                Authorization: `Bearer ${res.data.token}`,
              },
            }
          );
          
          if (userData.data.success) {
            // Set user data in Redux store (this will also update lastFetchTimestamp)
            dispatch(setUser(userData.data.data));
            message.success("Login Successful");
            navigate("/");
          } else {
            message.error("Could not retrieve user data");
          }
        } catch (userDataError) {
          console.error("Error fetching user data:", userDataError);
          message.error("Login successful but could not load your profile");
          navigate("/");
        }
      } else {
        // Check if user is blocked
        if (res.data.isBlocked) {
          setBlockedUserEmail(values.email);
          setIsBlockedModalVisible(true);
        } else {
          message.error(res.data.message);
        }
      }
      dispatch(hideLoading());
    } catch (error) {
      dispatch(hideLoading());
      console.log(error);
      message.error("Authentication Failed");
    }
  };
  
  const handleRequestAccess = async () => {
    try {
      const values = await requestForm.validateFields();
      dispatch(showLoading());
      
      const res = await axios.post("/api/v1/user/request-access", {
        email: blockedUserEmail,
        message: values.requestMessage
      });
      
      dispatch(hideLoading());
      
      if (res.data.success) {
        message.success(res.data.message);
        setIsBlockedModalVisible(false);
      } else {
        message.error(res.data.message);
      }
    } catch (error) {
      dispatch(hideLoading());
      console.error("Request access error:", error);
      message.error("Failed to send access request");
    }
  };

  return (
    <div className="medical-auth-container">
      {/* Left Panel - Branding */}
      <div className="medical-brand-panel">
        <div className="brand-container">
          <div className="logo-wrapper">
            <div className="medical-logo-icon">
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 2a9 9 0 0 1 6.894 14.786l1.51 1.51A10.96 10.96 0 0 0 23 13c0-6.075-4.925-11-11-11S1 6.925 1 13c0 2.409.786 4.635 2.115 6.434l1.516-1.516A9 9 0 0 1 12 2zm7 10a1 1 0 0 0-1 1 6 6 0 0 1-6 6 1 1 0 1 0 0 2 8 8 0 0 0 8-8 1 1 0 0 0-1-1zm-9.5-5a4.5 4.5 0 1 0 0 9 4.5 4.5 0 0 0 0-9z"/>
              </svg>
            </div>
            <h1 className="medical-logo-text">DOC APP</h1>
          </div>
          <div className="brand-content">
            <h2 className="brand-tagline">Smart Appointment Management System</h2>
            <p className="brand-description">
            A secure, intelligent platform for effortless doctor appointment scheduling, patient flow optimization, and clinic operations. HIPAA-compliant, AI-powered, and designed to transform healthcare delivery.
            </p>
          </div>
        </div>
      </div>
      
      {/* Blocked User Modal */}
      <Modal
        title="Account Blocked"
        open={isBlockedModalVisible}
        onCancel={() => setIsBlockedModalVisible(false)}
        footer={null}
      >
        <div style={{ marginBottom: '20px' }}>
          <p>Your account has been blocked by an administrator. Please provide a reason to request access:</p>
        </div>
        
        <Form form={requestForm} layout="vertical">
          <Form.Item
            name="requestMessage"
            rules={[{ required: true, message: 'Please provide a reason for your request' }]}
          >
            <Input.TextArea 
              rows={4} 
              placeholder="Explain why you need access to your account..."
            />
          </Form.Item>
          
          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
            <Button onClick={() => setIsBlockedModalVisible(false)}>Cancel</Button>
            <Button type="primary" onClick={handleRequestAccess}>Submit Request</Button>
          </div>
        </Form>
      </Modal>

      {/* Right Panel - Login Form */}
      <div className="medical-auth-panel">
        <div className="auth-card">
          <div className="auth-header">
            <SafetyCertificateOutlined className="auth-icon" />
            <h2 className="auth-title">Medical Portal Access</h2>
            <p className="auth-subtitle">Secure Practitioner Login</p>
          </div>

          <Form
            layout="vertical"
            onFinish={onfinishHandler}
            className="medical-auth-form"
          >
            <Form.Item
              label="Medical ID / Email"
              name="email"
              rules={[{ required: true, message: 'Required field' }]}
            >
              <Input
                prefix={<UserOutlined className="input-icon" />}
                placeholder="practitioner@healthcarepro.org"
                className="medical-form-input"
              />
            </Form.Item>

            <Form.Item
              label="Secure Password"
              name="password"
              rules={[{ required: true, message: 'Required field' }]}
            >
              <Input.Password
                prefix={<LockOutlined className="input-icon" />}
                placeholder="••••••••"
                className="medical-form-input"
              />
            </Form.Item>

            <Form.Item>
              <button className="medical-auth-btn" type="submit">
                Enter Medical Portal
              </button>
            </Form.Item>

            <div className="auth-footer">
              <span className="auth-helper">New practitioner?</span>
              <Link to="/register" className="auth-link">
                Request System Access
              </Link>
            </div>
          </Form>
        </div>
      </div>
    </div>
  );
};

export default Login;