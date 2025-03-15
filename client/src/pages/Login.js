import "../styles/LoginStyles.css"
import React from "react";
import "../styles/RegisterStyles.css";
import { Form, Input, message } from "antd";
import { useDispatch } from "react-redux";
import { showLoading, hideLoading } from "../redux/features/alertSlice";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";
import { UserOutlined, LockOutlined, SafetyCertificateOutlined } from '@ant-design/icons';

const Login = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const onfinishHandler = async (values) => {
    try {
      dispatch(showLoading());
      const res = await axios.post("/api/v1/user/login", values);
      window.location.reload();
      dispatch(hideLoading());
      if (res.data.success) {
        localStorage.setItem("token", res.data.token);
        message.success("Login Successful");
        navigate("/");
      } else {
        message.error(res.data.message);
      }
    } catch (error) {
      dispatch(hideLoading());
      console.log(error);
      message.error("Authentication Failed");
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