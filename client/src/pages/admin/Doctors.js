import React, { useState, useEffect } from "react";
import Layout from "./../../components/Layout";
import axios from "../../config/axiosConfig";
import { message, Table, Button, Modal, Tag } from "antd";
import { DeleteOutlined, CheckCircleOutlined, CloseCircleOutlined, UserOutlined, PhoneOutlined, MedicineBoxOutlined } from "@ant-design/icons";
import { useDispatch } from "react-redux";
import { showLoading, hideLoading } from "../../redux/features/alertSlice";
import "../../styles/AdminStyles.css";
import "../../styles/DoctorAppointment.css";

const Doctors = () => {
  const [doctors, setDoctors] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedDoctor, setSelectedDoctor] = useState(null);
  const [isDeleteModalVisible, setIsDeleteModalVisible] = useState(false);
  const dispatch = useDispatch();

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

  // Show delete confirmation modal
  const showDeleteModal = (doctor) => {
    setSelectedDoctor(doctor);
    setIsDeleteModalVisible(true);
  };

  // Handle modal cancel
  const handleCancelDelete = () => {
    setIsDeleteModalVisible(false);
    setSelectedDoctor(null);
  };

  // Handle doctor rejection/deletion
  const handleRejectDoctor = async () => {
    if (!selectedDoctor) return;
    
    try {
      dispatch(showLoading());
      setLoading(true);
      
      const res = await axios.delete(
        `/api/v1/admin/deleteDoctor/${selectedDoctor._id}`,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
      );
      
      if (res.data.success) {
        setIsDeleteModalVisible(false);
        message.success(res.data.message);
        setDoctors(prev => prev.filter(d => d._id !== selectedDoctor._id));
      }
    } catch (error) {
      const errorMessage = error.response?.data?.message || 
                          error.response?.data?.error || 
                          "Failed to reject doctor application";
      message.error(errorMessage);
      console.error("Rejection Error:", error.response?.data);
    } finally {
      setLoading(false);
      dispatch(hideLoading());
      setSelectedDoctor(null);
    }
  };

  const handleAccountStatus = async (record, status) => {
    try {
      dispatch(showLoading());
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
      dispatch(hideLoading());
    }
  };

  useEffect(() => {
    getDoctors();
  }, []);

  const columns = [
    {
      title: <div className="column-header"><UserOutlined /> Name</div>,
      dataIndex: "name",
      key: "name",
      render: (text, record) => (
        <div className="table-cell-content">
          <div className="info-row">
            <UserOutlined className="cell-icon" />
            <span className="primary-text">{record.firstName} {record.lastName}</span>
          </div>
          <div className="info-row">
            <MedicineBoxOutlined className="cell-icon" />
            <span className="secondary-text">{record.specialization || 'General Practitioner'}</span>
          </div>
        </div>
      ),
    },
    {
      title: <div className="column-header"><CheckCircleOutlined /> Status</div>,
      dataIndex: "status",
      key: "status",
      render: (status) => {
        const statusKey = status.toLowerCase();
        const statusColors = {
          approved: { bg: "#000000", text: "white" },
          pending: { bg: "#f59e0b", text: "white" },
          rejected: { bg: "#800000", text: "white" },
        };
        const colorInfo = statusColors[statusKey] || statusColors.pending;
        
        return (
          <div className="table-cell-content">
            <div className="info-row">
              <Tag 
                color={colorInfo.bg}
                className="status-tag"
                style={{ 
                  color: colorInfo.text,
                  padding: '2px 12px',
                  fontSize: '14px',
                  fontWeight: '500',
                  textAlign: 'center',
                  minWidth: '100px',
                  display: 'inline-block',
                }}
              >
                {status.toUpperCase()}
              </Tag>
            </div>
          </div>
        );
      }
    },
    {
      title: <div className="column-header"><PhoneOutlined /> Contact</div>,
      dataIndex: "phone",
      key: "phone",
      render: (text, record) => (
        <div className="table-cell-content">
          <div className="info-row">
            <PhoneOutlined className="cell-icon" />
            <span className="primary-text">{record.phone || 'N/A'}</span>
          </div>
          {record.email && (
            <div className="info-row">
              <span className="secondary-text">{record.email}</span>
            </div>
          )}
        </div>
      ),
    },
    {
      title: <div className="column-header">Actions</div>,
      dataIndex: "actions",
      key: "actions",
      render: (text, record) => {
        return (
          <div className="table-cell-content">
            <div className="doctor-action-btns">
              {record.status === "pending" && (
                <Button
                  className="action-btn approve-btn"
                  icon={<CheckCircleOutlined />}
                  onClick={() => handleAccountStatus(record, "approved")}
                >
                  Approve
                </Button>
              )}
              
              {record.status === "pending" ? (
                <Button 
                  className="action-btn reject-btn"
                  icon={<CloseCircleOutlined />}
                  onClick={() => showDeleteModal(record)}
                >
                  Reject
                </Button>
              ) : (
                <Button 
                  className="action-btn reject-btn"
                  icon={<DeleteOutlined />}
                  onClick={() => showDeleteModal(record)}
                >
                  Delete
                </Button>
              )}
            </div>
          </div>
        );
      },
    },
  ];

  return (
    <Layout>
      <h1 className="text-center m-3">All Doctors</h1>
      <div className="card no-border">
        <Table 
          columns={columns} 
          dataSource={doctors}
          rowKey="_id"
          loading={loading}
          pagination={{ pageSize: 10 }}
        />
      </div>
      
      {/* Custom Delete Modal */}
      <Modal
        title={
          <div className="admin-popup-title">
            {selectedDoctor?.status === 'pending' ? 
              <CloseCircleOutlined className="admin-popup-icon" style={{ color: '#000' }} /> : 
              <DeleteOutlined className="admin-popup-icon" style={{ color: '#000' }} />
            }
            {selectedDoctor?.status === 'pending' ? 'Reject Doctor Application' : 'Remove Doctor from System'}
          </div>
        }
        open={isDeleteModalVisible}
        onOk={handleRejectDoctor}
        onCancel={handleCancelDelete}
        okText="Confirm"
        cancelText="Cancel"
        className="admin-modal"
        centered
        footer={
          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px' }}>
            <Button key="cancel" onClick={handleCancelDelete} className="admin-btn-secondary">
              Cancel
            </Button>
            <Button 
              key="submit" 
              onClick={handleRejectDoctor} 
              className="admin-btn-primary admin-btn-with-icon"
              icon={selectedDoctor?.status === 'pending' ? <CloseCircleOutlined /> : <DeleteOutlined />}
            >
              <span style={{ color: '#fff' }}>{selectedDoctor?.status === 'pending' ? 'Reject Application' : 'Remove Doctor'}</span>
            </Button>
          </div>
        }
      >
        <div className="admin-popup-content">
          {selectedDoctor && (
            <>
              <p className="admin-popup-message">
                {selectedDoctor.status === 'pending' ?
                  `Are you sure you want to reject the application from Dr. ${selectedDoctor.firstName} ${selectedDoctor.lastName}? This action cannot be reversed.` :
                  `Are you sure you want to remove Dr. ${selectedDoctor.firstName} ${selectedDoctor.lastName} from the system? This is a permanent action.`
                }
              </p>
              
              <div className="admin-popup-details">
                <p><strong>Name:</strong> Dr. {selectedDoctor.firstName} {selectedDoctor.lastName}</p>
                <p><strong>Email:</strong> {selectedDoctor.email}</p>
                <p><strong>Phone:</strong> {selectedDoctor.phone}</p>
                <p><strong>Specialty:</strong> {selectedDoctor.specialization}</p>
                <p>
                  <strong>Status:</strong> 
                  <span 
                    className={`admin-status-tag ${selectedDoctor.status === 'approved' ? 'admin-status-tag-active' : selectedDoctor.status === 'pending' ? 'admin-status-tag-pending' : 'admin-status-tag-inactive'}`}
                    style={{marginLeft: '10px'}}
                  >
                    {selectedDoctor.status.toUpperCase()}
                  </span>
                </p>
              </div>
              
              <p className="admin-popup-warning">
                {selectedDoctor.status === 'pending' ?
                  "This action will reject the doctor's application and send an automatic notification to the applicant. Once rejected, they would need to submit a new application to be considered again." :
                  "This action will permanently remove the doctor from the system, including all their profile information and associations. Any scheduled appointments with this doctor will need to be reassigned."}
              </p>
            </>
          )}
        </div>
      </Modal>
    </Layout>
  );
};

export default Doctors;