import React, { useEffect, useState } from "react";
import Layout from "./../../components/Layout";
import axios from "../../config/axiosConfig";
import { Table, Button, message, Popconfirm, Tag } from "antd";
import { LockOutlined, UnlockOutlined, UserOutlined, MailOutlined, MedicineBoxOutlined, CheckCircleOutlined } from "@ant-design/icons";
import { useDispatch } from "react-redux";
import { showLoading, hideLoading } from "../../redux/features/alertSlice";
import "../../styles/AdminStyles.css";
import "../../styles/DoctorAppointment.css";

const Users = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const dispatch = useDispatch();

  //getUsers
  const getUsers = async () => {
    try {
      setLoading(true);
      const res = await axios.get("/api/v1/admin/getAllUsers", {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      });
      if (res.data.success) {
        setUsers(res.data.data);
      }
    } catch (error) {
      console.log(error);
      message.error("Failed to fetch users");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    getUsers();
  }, []);

  // Handle toggle user block status
  const handleToggleBlockStatus = async (userId, currentStatus) => {
    try {
      // Prevent blocking admin users
      const userToToggle = users.find(user => user._id === userId);
      if (userToToggle && userToToggle.isAdmin) {
        message.error("Admin users cannot be blocked");
        return;
      }

      dispatch(showLoading());
      const res = await axios.post(
        "/api/v1/admin/toggleUserBlockStatus",
        { targetUserId: userId },
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
      );
      
      if (res.data.success) {
        message.success(res.data.message);
        // Update the local state instead of reloading
        const updatedUsers = users.map(user => {
          if (user._id === userId) {
            return { ...user, isBlocked: !currentStatus };
          }
          return user;
        });
        setUsers(updatedUsers);
      }
    } catch (error) {
      console.error("Block/Unblock Error:", error);
      message.error(error.response?.data?.message || "Failed to update user status");
    } finally {
      dispatch(hideLoading());
    }
  };

  // antD table col
  const columns = [
    {
      title: <div className="column-header"><UserOutlined /> Name</div>,
      dataIndex: "name",
      render: (text, record) => (
        <div className="table-cell-content">
          <div className="info-row">
            <UserOutlined className="cell-icon" />
            <span className="primary-text">{record.name || 'N/A'}</span>
          </div>
        </div>
      ),
    },
    {
      title: <div className="column-header"><MailOutlined /> Email</div>,
      dataIndex: "email",
      render: (text, record) => (
        <div className="table-cell-content">
          <div className="info-row">
            <MailOutlined className="cell-icon" />
            <span className="secondary-text">{record.email || 'N/A'}</span>
          </div>
        </div>
      ),
    },
    {
      title: <div className="column-header"><MedicineBoxOutlined /> Doctor</div>,
      dataIndex: "isDoctor",
      render: (text, record) => (
        <div className="table-cell-content">
          <div className="info-row">
            <MedicineBoxOutlined className="cell-icon" />
            <span className="primary-text">{record.isDoctor ? "Yes" : "No"}</span>
          </div>
        </div>
      ),
    },
    {
      title: <div className="column-header"><CheckCircleOutlined /> Status</div>,
      dataIndex: "isBlocked",
      render: (isBlocked) => {
        const statusKey = isBlocked ? "blocked" : "active";
        const statusColors = {
          active: { bg: "#000000", text: "white" },
          blocked: { bg: "#800000", text: "white" },
        };
        const colorInfo = statusColors[statusKey];
        
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
                {isBlocked ? "BLOCKED" : "ACTIVE"}
              </Tag>
            </div>
          </div>
        );
      },
    },
    {
      title: <div className="column-header">Actions</div>,
      dataIndex: "actions",
      render: (text, record) => {
        // Disable block/unblock for admin users
        const isAdmin = record.isAdmin;
        
        return (
          <div className="table-cell-content">
            <div className="doctor-action-btns">
              {isAdmin ? (
                <Button 
                  className="action-btn"
                  icon={<LockOutlined />}
                  size="middle"
                  disabled
                  title="Admin users cannot be blocked"
                >
                  Admin User
                </Button>
              ) : (
                <Popconfirm
                  title={
                    <div className="admin-popup-title">
                      {record.isBlocked ? 
                        <UnlockOutlined className="admin-popup-icon" /> : 
                        <LockOutlined className="admin-popup-icon" />
                      }
                      {record.isBlocked ? "Unblock User Access" : "Block User Access"}
                    </div>
                  }
                  description={
                    <div className="admin-popup-content">
                      <p className="admin-popup-message">
                        {record.isBlocked ? 
                          `Are you sure you want to restore system access for ${record.name}? This will allow them to log in and use all authorized features.` : 
                          `Are you sure you want to block system access for ${record.name}? This will prevent them from logging in to the system.`}
                      </p>
                      <div className="admin-popup-details">
                        <p><strong>Name:</strong> {record.name}</p>
                        <p><strong>Email:</strong> {record.email}</p>
                        <p><strong>Role:</strong> {record.isDoctor ? "Doctor" : "Patient"}</p>
                        <p><strong>Status:</strong> 
                          <span className={`status-tag`} style={{
                            marginLeft: '10px',
                            backgroundColor: record.isBlocked ? '#800000' : '#000000',
                            color: 'white'
                          }}>
                            {record.isBlocked ? "BLOCKED" : "ACTIVE"}
                          </span>
                        </p>
                      </div>
                      <p className="admin-popup-warning">
                        {record.isBlocked ? 
                          "This action will immediately restore user access. They will be able to log in to the system again." : 
                          "This action will immediately revoke user access. They will be automatically logged out and unable to log in again until unblocked."}
                      </p>
                    </div>
                  }
                  onConfirm={() => handleToggleBlockStatus(record._id, record.isBlocked)}
                  okText={record.isBlocked ? "Unblock" : "Block"}
                  cancelText="Cancel"
                  okButtonProps={{ 
                    className: "action-btn approve-btn",
                    icon: record.isBlocked ? <UnlockOutlined /> : <LockOutlined />
                  }}
                  cancelButtonProps={{ className: "action-btn" }}
                  placement="topRight"
                  overlayClassName="admin-modal"
                  destroyTooltipOnHide
                >
                  <Button 
                    className={record.isBlocked ? "action-btn approve-btn" : "action-btn reject-btn"}
                    icon={record.isBlocked ? <UnlockOutlined /> : <LockOutlined />}
                    size="middle"
                  >
                    <span>{record.isBlocked ? "Unblock Access" : "Block Access"}</span>
                  </Button>
                </Popconfirm>
              )}
            </div>
          </div>
        );
      },
    },
  ];

  return (
    <Layout>
      <h1 className="text-center m-2">Users List</h1>
      <div className="card no-border">
        <Table 
          columns={columns} 
          dataSource={users} 
          rowKey="_id" 
          loading={loading}
          pagination={{ pageSize: 10 }}
          bordered
          className="mt-4"
        />
      </div>
    </Layout>
  );
};

export default Users;