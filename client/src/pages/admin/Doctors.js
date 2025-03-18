import React, { useState, useEffect } from "react";
import Layout from "./../../components/Layout";
import axios from "axios";
import { message, Table, Button, Popconfirm } from "antd";

const Doctors = () => {
  const [doctors, setDoctors] = useState([]);
  const [loading, setLoading] = useState(false);

  const getDoctors = async () => {
    try {
      setLoading(true);
      const res = await axios.get("/api/v1/admin/getAllDoctors", {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      });
      if (res.data.success) {
        setDoctors(res.data.data);
      }
    } catch (error) {
      message.error("Failed to fetch doctors");
      console.log(error);
    } finally {
      setLoading(false);
    }
  };

  // Handle doctor rejection
  const handleRejectDoctor = async (doctorId) => {
    try {
      setLoading(true);
      const res = await axios.delete(
        `/api/v1/admin/deleteDoctor/${doctorId}`,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
      );
      
      if (res.data.success) {
        message.success(res.data.message);
        setDoctors(prev => prev.filter(d => d._id !== doctorId));
      }
    } catch (error) {
      const errorMessage = error.response?.data?.message || 
                          error.response?.data?.error || 
                          "Failed to reject doctor application";
      message.error(errorMessage);
      console.error("Rejection Error:", error.response?.data);
    } finally {
      setLoading(false);
    }
  };

  const handleAccountStatus = async (record, status) => {
    try {
      setLoading(true);
      const res = await axios.post(
        "/api/v1/admin/changeAccountStatus",
        { doctorId: record._id, userId: record.userId, status: status },
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
      );
      if (res.data.success) {
        message.success(res.data.message);
        // Update the local state instead of reloading
        const updatedDoctors = doctors.map(doctor => {
          if (doctor._id === record._id) {
            return { ...doctor, status: status };
          }
          return doctor;
        });
        setDoctors(updatedDoctors);
      }
    } catch (error) {
      message.error("Something went wrong while updating status");
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    getDoctors();
  }, []);

  const columns = [
    {
      title: "Name",
      dataIndex: "name",
      key: "name",
      render: (text, record) => (
        <span>
          {record.firstName} {record.lastName}
        </span>
      ),
    },
    {
      title: "Status",
      dataIndex: "status",
      key: "status",
      render: (status) => (
        <span className={`badge ${status === 'approved' ? 'bg-success' : status === 'pending' ? 'bg-warning' : 'bg-danger'}`}>
          {status}
        </span>
      )
    },
    {
      title: "Phone",
      dataIndex: "phone",
      key: "phone",
    },
    {
      title: "Actions",
      dataIndex: "actions",
      key: "actions",
      render: (text, record) => (
        <div className="d-flex gap-2">
          {record.status === "pending" && (
            <Button
              type="primary"
              className="btn btn-success"
              onClick={() => handleAccountStatus(record, "approved")}
            >
              Approve
            </Button>
          )}
          
          {record.status === "pending" ? (
            <Popconfirm
              title="Reject Doctor Application"
              description="Are you sure you want to reject this doctor application? The user will be notified."
              onConfirm={() => handleRejectDoctor(record._id)}
              okText="Yes"
              cancelText="No"
              okButtonProps={{ danger: true }}
            >
              <Button danger type="primary">Reject</Button>
            </Popconfirm>
          ) : (
            <Popconfirm
              title="Delete Doctor"
              description="Are you sure you want to delete this doctor?"
              onConfirm={() => handleRejectDoctor(record._id)}
              okText="Yes"
              cancelText="No"
              okButtonProps={{ danger: true }}
            >
              <Button danger>Delete</Button>
            </Popconfirm>
          )}
        </div>
      ),
    },
  ];

  return (
    <Layout>
      <h1 className="text-center m-3">All Doctors</h1>
      <Table 
        columns={columns} 
        dataSource={doctors}
        rowKey="_id"
        loading={loading}
        pagination={{ pageSize: 10 }}
      />
    </Layout>
  );
};

export default Doctors;