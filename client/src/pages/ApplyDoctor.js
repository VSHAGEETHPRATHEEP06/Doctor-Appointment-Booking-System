import React from "react";
import Layout from "./../components/Layout";
import { Col, Form, Input, Row, TimePicker, message } from "antd";
import { useSelector, useDispatch } from "react-redux";
import { useNavigate } from "react-router-dom";
import { showLoading, hideLoading } from "../redux/features/alertSlice";
import axios from "axios";
import moment from "moment";
import { UserOutlined, PhoneOutlined, MailOutlined, GlobalOutlined, MedicineBoxOutlined, ScheduleOutlined, WalletOutlined } from '@ant-design/icons';
import "../styles/ApplyDoctor.css";
import "../styles/CustomDatePicker.css";

const ApplyDoctor = () => {
  const { user } = useSelector((state) => state.user);

  const dispatch = useDispatch();
  const navigate = useNavigate();
  //handle form
  const handleFinish = async (values) => {
    try {
      dispatch(showLoading());
      const res = await axios.post(
        "/api/v1/user/apply-doctor",
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
      console.log(error);
      message.error("Something Went Wrong ");
    }
  };
  return (
    <Layout>
      <div className="apply-doctor-container">
        <div className="form-header">
        <h1 className="form-main-title">DOC APP - Doctor Registration</h1>
        <p className="form-subtitle">Join Our Medical Network</p>
      </div>
        <Form layout="vertical" onFinish={handleFinish} className="doctor-form">
          <div className="form-section">
            <h3 className="section-title"><UserOutlined /> Personal Information</h3>
            <Row gutter={[24, 16]}>
              <Col xs={24} md={12} lg={8}>
                <Form.Item
                  label="First Name"
                  name="firstName"
                  rules={[{ required: true, message: 'Please enter your first name' }]}
                >
                  <Input 
                    prefix={<UserOutlined className="form-input-icon" />}
                    placeholder="John"
                    className="form-input"
                  />
                </Form.Item>
              </Col>
              <Col xs={24} md={12} lg={8}>
                <Form.Item
                  label="Last Name"
                  name="lastName"
                  rules={[{ required: true, message: 'Please enter your last name' }]}
                >
                  <Input 
                    prefix={<UserOutlined className="form-input-icon" />}
                    placeholder="Doe"
                    className="form-input"
                  />
                </Form.Item>
              </Col>
              <Col xs={24} md={12} lg={8}>
                <Form.Item
                  label="Phone Number"
                  name="phone"
                  rules={[{ required: true, message: 'Please enter your phone number' }]}
                >
                  <Input 
                    prefix={<PhoneOutlined className="form-input-icon" />}
                    placeholder="+1 234 567 890"
                    className="form-input"
                  />
                </Form.Item>
              </Col>
              <Col xs={24} md={12} lg={8}>
                <Form.Item
                  label="Email"
                  name="email"
                  rules={[{ 
                    required: true, 
                    type: 'email',
                    message: 'Please enter a valid email address' 
                  }]}
                >
                  <Input 
                    prefix={<MailOutlined className="form-input-icon" />}
                    placeholder="john.doe@example.com"
                    className="form-input"
                  />
                </Form.Item>
              </Col>
              <Col xs={24} md={12} lg={8}>
                <Form.Item label="Website" name="website">
                  <Input 
                    prefix={<GlobalOutlined className="form-input-icon" />}
                    placeholder="www.example.com"
                    className="form-input"
                  />
                </Form.Item>
              </Col>
              <Col xs={24} md={12} lg={8}>
                <Form.Item
                  label="Clinic Address"
                  name="address"
                  rules={[{ required: true, message: 'Please enter your clinic address' }]}
                >
                  <Input 
                    placeholder="123 Medical Street, Health City"
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
                  rules={[{ required: true, message: 'Please enter your specialization' }]}
                >
                  <Input 
                    prefix={<MedicineBoxOutlined className="form-input-icon" />}
                    placeholder="Cardiology"
                    className="form-input"
                  />
                </Form.Item>
              </Col>
              <Col xs={24} md={12} lg={8}>
                <Form.Item
                  label="Experience"
                  name="experience"
                  rules={[{ required: true, message: 'Please enter your experience' }]}
                >
                  <Input 
                    placeholder="5 years"
                    className="form-input"
                  />
                </Form.Item>
              </Col>
              <Col xs={24} md={12} lg={8}>
                <Form.Item
                  label="Consultation Fee"
                  name="feesPerConsultation"
                  rules={[{ required: true, message: 'Please enter consultation fee' }]}
                >
                  <Input 
                    prefix={<WalletOutlined className="form-input-icon" />}
                    placeholder="$100"
                    className="form-input"
                  />
                </Form.Item>
              </Col>
              <Col xs={24} md={12} lg={8}>
                <Form.Item
                  label="Availability"
                  name="timings"
                  rules={[{ required: true, message: 'Please select availability timings' }]}
                >
                  <TimePicker.RangePicker 
                    format="HH:mm"
                    className="time-picker custom-picker-wrapper"
                    suffixIcon={<ScheduleOutlined style={{ color: '#000000' }} />}
                    placeholder={['Start Time', 'End Time']}
                    style={{ borderColor: '#000000' }}
                    popupStyle={{ borderRadius: '6px' }}
                    minuteStep={15}
                  />
                </Form.Item>
              </Col>
              <Col xs={24} md={24} lg={24}>
                <div className="form-submit">
                  <button className="submit-button" type="submit">
                    Submit Application
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

export default ApplyDoctor;