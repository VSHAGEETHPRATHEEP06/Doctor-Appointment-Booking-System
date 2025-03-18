// Appointments.js
import React, { useState, useEffect } from "react";
import axios from "axios";
import Layout from "./../components/Layout";
import moment from "moment";
import "../styles/Appointments.css";
import { Table, Tag } from "antd";
import { 
  CalendarOutlined, 
  UserOutlined, 
  PhoneOutlined, 
  CheckCircleOutlined 
} from "@ant-design/icons";

const Appointments = () => {
  const [appointments, setAppointments] = useState([]);

  const getAppointments = async () => {
    try {
      const res = await axios.get("/api/v1/user/user-appointments", {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      });
      if (res.data.success) {
        setAppointments(res.data.data);
      }
    } catch (error) {
      console.log(error);
    }
  };

  useEffect(() => {
    getAppointments();
  }, []);

  const statusColors = {
    pending: { bg: "#f59e0b", text: "white" },
    approved: { bg: "#000000", text: "white" },
    rejected: { bg: "#800000", text: "white" },
    completed: { bg: "#3182ce", text: "white" },
  };

  const columns = [
    {
      title: <div className="column-header"><UserOutlined /> Doctor</div>,
      dataIndex: "name",
      responsive: ['md'],
      render: (text, record) => (
        <div className="doctor-info">
          <span className="doctor-name">
            {record.doctorInfo.firstName} {record.doctorInfo.lastName}
          </span>
          <span className="doctor-specialization">
            {record.doctorInfo.specialization}
          </span>
        </div>
      ),
    },
    {
      title: <div className="column-header"><PhoneOutlined /> Contact</div>,
      dataIndex: "phone",
      responsive: ['lg'],
      render: (text, record) => (
        <div className="contact-info">
          <span>{record.doctorInfo.phone}</span>
          <span>{record.doctorInfo.email}</span>
        </div>
      ),
    },
    {
      title: <div className="column-header"><CalendarOutlined /> Date & Time</div>,
      dataIndex: "date",
      render: (text, record) => (
        <div className="datetime-info">
          <span className="date-text">
            {moment(record.date).format("DD MMM YYYY")}
          </span>
          <span className="time-text">
            {moment(record.time).format("hh:mm A")}
          </span>
        </div>
      ),
    },
    {
      title: <div className="column-header"><CheckCircleOutlined /> Status</div>,
      dataIndex: "status",
      render: (status) => (
        <Tag 
          color={statusColors[status.toLowerCase()].bg}
          className="status-tag"
          style={{ 
            color: statusColors[status.toLowerCase()].text,
            borderRadius: '4px',
            minWidth: '90px',
            textAlign: 'center'
          }}
        >
          {status.toUpperCase()}
        </Tag>
      ),
    },
  ];

  return (
    <Layout>
      <div className="appointments-container">
        <div className="appointments-header">
          <h1 className="page-title">My Appointments</h1>
          <p className="page-subtitle">View and manage your medical appointments</p>
        </div>
        
        <Table 
          columns={columns} 
          dataSource={appointments} 
          rowKey="_id"
          className="appointments-table"
          pagination={{
            pageSize: 5,
            showSizeChanger: false,
          }}
          scroll={{ x: true }}
          responsive={{
            breakpoint: 'md',
            scroll: { x: 500 },
          }}
        />
      </div>
    </Layout>
  );
};

export default Appointments;