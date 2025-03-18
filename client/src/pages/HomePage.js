// HomePage.js
import React, { useEffect, useState } from "react";
import axios from "axios";
import Layout from "./../components/Layout";
import { Row, Col } from "antd";
import DoctorList from "../components/DoctorList";
import { 
  UserOutlined, 
  MedicineBoxOutlined, 
  ClockCircleOutlined,
  SafetyCertificateOutlined,
  HeartOutlined
} from '@ant-design/icons';
import "../styles/HomePage.css";

const HomePage = () => {
  const [doctors, setDoctors] = useState([]);

  const getUserData = async () => {
    try {
      const res = await axios.get("/api/v1/user/getAllDoctors", {
        headers: {
          Authorization: "Bearer " + localStorage.getItem("token"),
        },
      });
      if (res.data.success) {
        setDoctors(res.data.data);
      }
    } catch (error) {
      console.log(error);
    }
  };

  useEffect(() => {
    getUserData();
  }, []);

  return (
    <Layout>
      <div className="home-container">
        <div className="medical-hero">
          <div className="hero-content">
            <div className="logo-wrapper">
              <div className="medical-logo-icon">
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M12 2a9 9 0 0 1 6.894 14.786l1.51 1.51A10.96 10.96 0 0 0 23 13c0-6.075-4.925-11-11-11S1 6.925 1 13c0 2.409.786 4.635 2.115 6.434l1.516-1.516A9 9 0 0 1 12 2zm7 10a1 1 0 0 0-1 1 6 6 0 0 1-6 6 1 1 0 1 0 0 2 8 8 0 0 0 8-8 1 1 0 0 0-1-1zm-9.5-5a4.5 4.5 0 1 0 0 9 4.5 4.5 0 0 0 0-9z"/>
                </svg>
              </div>
              <h1 className="medical-logo-text">DOC APP</h1>
            </div>
            <p className="hero-subtitle">
              Your Trusted Partner in Professional Healthcare Services
            </p>
          </div>
        </div>

        <div className="medical-features">
          <Row gutter={[24, 24]} justify="center">
            <Col xs={24} sm={12} md={8} lg={6}>
              <div className="feature-card">
                <SafetyCertificateOutlined className="feature-icon" />
                <h3>Certified Specialists</h3>
                <p>Verified medical professionals with top qualifications</p>
              </div>
            </Col>
            <Col xs={24} sm={12} md={8} lg={6}>
              <div className="feature-card">
                <ClockCircleOutlined className="feature-icon" />
                <h3>24/7 Availability</h3>
                <p>Round-the-clock consultation services</p>
              </div>
            </Col>
            <Col xs={24} sm={12} md={8} lg={6}>
              <div className="feature-card">
                <HeartOutlined className="feature-icon" />
                <h3>Patient Care</h3>
                <p>Personalized healthcare solutions for everyone</p>
              </div>
            </Col>
          </Row>
        </div>

        <div className="specialists-section">
          <div className="section-header">
            <h2 className="section-title">
              <UserOutlined className="section-icon" />
              Meet Our Specialists
            </h2>
            <p className="section-subtitle">
              Experienced professionals ready to assist you
            </p>
          </div>
          
          <div className="doctors-container">
            {doctors.map((doctor) => (
              <div className="doctor-wrapper" key={doctor._id}>
                <DoctorList doctor={doctor} />
              </div>
            ))}
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default HomePage;