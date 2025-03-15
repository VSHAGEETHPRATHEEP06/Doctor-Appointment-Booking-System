import React, { useState, useEffect } from "react";
import Layout from "./../../components/Layout";
import axios from "axios";
import { message, Table } from "antd";

const Doctors = () => {
  const [doctors, setDoctors] = useState([]);

  const getDoctors = async () => {
    try {
      const res = await axios.get("/api/v1/admin/getAllDoctors", {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      });
      if (res.data.success) {
        setDoctors(res.data.data);
      }
    } catch (error) {
      console.log(error);
    }
  };

  // Handle doctor rejection (delete)
  const handleRejectDoctor = async (doctorId) => {
    try {
      if (!window.confirm("Are you sure you want to delete this doctor?")) return;
  
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
                          "Failed to delete doctor";
      message.error(errorMessage);
      console.error("Delete Error:", error.response?.data);
    }
  };

  const handleAccountStatus = async (record, status) => {
    try {
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
      message.error("Something Went Wrong");
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
            <button
              className="btn btn-success"
              onClick={() => handleAccountStatus(record, "approved")}
            >
              Approve
            </button>
          )}
          <button
            className="btn btn-danger"
            onClick={() => {
              if (window.confirm("Are you sure you want to delete this doctor?")) {
                handleRejectDoctor(record._id);
              }
            }}
          >
            {record.status === "pending" ? "Reject" : "Delete"}
          </button>
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
      />
    </Layout>
  );
};

export default Doctors;