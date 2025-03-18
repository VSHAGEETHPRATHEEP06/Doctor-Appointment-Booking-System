import React, { useState, useEffect } from "react";
import Layout from "./../../components/Layout";
import axios from "axios";
import moment from "moment";
import "../../styles/DoctorAppointment.css"
import { message, Table, Tag, Button } from "antd";
import { 
  CalendarOutlined, 
  UserOutlined, 
  PhoneOutlined, 
  CheckCircleOutlined,
  CheckOutlined,
  CloseOutlined 
} from "@ant-design/icons";
import "../../styles/Appointments.css";

const DoctorAppointments = () => {
  const [appointments, setAppointments] = useState([]);

  const getAppointments = async () => {
    try {
      const res = await axios.get("/api/v1/doctor/doctor-appointments", {
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

  const handleStatus = async (record, status) => {
    try {
      const res = await axios.post(
        "/api/v1/doctor/update-status",
        { appointmentsId: record._id, status },
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
      );
      if (res.data.success) {
        message.success(res.data.message);
        getAppointments();
      }
    } catch (error) {
      console.log(error);
      message.error("Something Went Wrong");
    }
  };

  const statusColors = {
    pending: "gold",
    approved: "green",
    reject: "red",
    completed: "blue",
  };

  const columns = [
    {
      title: <div className="column-header"><UserOutlined /> Patient</div>,
      dataIndex: "userInfo",
      render: (text, record) => (
        <div className="patient-info">
          <span className="patient-name">
            {record.userInfo?.name}
          </span>
          <span className="patient-id">
            ID: {record.userInfo?._id}
          </span>
        </div>
      ),
    },
    {
      title: <div className="column-header"><PhoneOutlined /> Contact</div>,
      dataIndex: "phone",
      render: (text, record) => (
        <div className="contact-info">
          <span>{record.userInfo?.phone || 'N/A'}</span>
          <span>{record.userInfo?.email}</span>
        </div>
      ),
    },
    {
      title: <div className="column-header"><CalendarOutlined /> Date & Time</div>,
      dataIndex: "date",
      render: (text, record) => (
        <div className="datetime-info">
          <div className="date-box">
            {moment(record.date).format("DD MMM YYYY")}
          </div>
          <div className="time-box">
            {moment(record.time).format("hh:mm A")}
          </div>
        </div>
      ),
    },
    {
      title: <div className="column-header"><CheckCircleOutlined /> Status</div>,
      dataIndex: "status",
      render: (status) => (
        <Tag color={statusColors[status.toLowerCase()]} className="status-tag">
          {status.toUpperCase()}
        </Tag>
      ),
    },
    {
      title: "Actions",
      dataIndex: "actions",
      render: (text, record) => (
        <div className="actions-container">
          {record.status === "pending" && (
            <>
              <Button
                type="primary"
                icon={<CheckOutlined />}
                onClick={() => handleStatus(record, "approved")}
                className="approve-btn"
              >
                Approve
              </Button>
              <Button
                // danger
                icon={<CloseOutlined />}
                onClick={() => handleStatus(record, "reject")}
                className="reject-btn"
              >
                Reject
              </Button>
            </>
          )}
        </div>
      ),
    },
  ];

  return (
    <Layout>
      <div className="appointments-container">
        <div className="appointments-header">
          <h1 className="page-title">Appointment Requests</h1>
          <p className="page-subtitle">Manage your upcoming medical appointments</p>
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
        />
      </div>
    </Layout>
  );
};

export default DoctorAppointments;