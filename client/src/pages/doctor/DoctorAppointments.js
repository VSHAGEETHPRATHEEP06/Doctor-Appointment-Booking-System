import React, { useState, useEffect } from "react";
import Layout from "./../../components/Layout";
import axios from "axios";
import moment from "moment";
import "../../styles/DoctorAppointment.css"
import { message, Table, Tag, Button, Tooltip, Modal, Form, DatePicker, TimePicker } from "antd";
import { 
  UserOutlined, 
  MailOutlined, 
  PhoneOutlined, 
  CheckCircleOutlined,
  CalendarOutlined,
  ClockCircleOutlined,
  EditOutlined,
  DeleteOutlined,
  ExclamationCircleOutlined,
  CheckOutlined,
  CloseOutlined
} from "@ant-design/icons";
import "../../styles/Appointments.css";

const DoctorAppointments = () => {
  const [appointments, setAppointments] = useState([]);
  const [selectedAppointment, setSelectedAppointment] = useState(null);
  const [isEditModalVisible, setIsEditModalVisible] = useState(false);
  const [isDeleteModalVisible, setIsDeleteModalVisible] = useState(false);
  const [editForm] = Form.useForm();
  const [submitting, setSubmitting] = useState(false);

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
  
  // Show edit modal with appointment data
  const showEditModal = (appointment) => {
    setSelectedAppointment(appointment);
    setIsEditModalVisible(true);
    
    // Set form values with correct date/time format
    const dateObj = appointment.date ? moment(appointment.date, "DD-MM-YYYY") : moment();
    const timeObj = appointment.time ? moment(appointment.time, "HH:mm") : moment();
    
    editForm.setFieldsValue({
      date: dateObj,
      time: timeObj,
    });
  };
  
  // Show delete confirmation modal
  const showDeleteModal = (appointment) => {
    setSelectedAppointment(appointment);
    setIsDeleteModalVisible(true);
  };
  
  // Handle appointment update by doctor
  const handleUpdateAppointment = async (values) => {
    if (!selectedAppointment) return;
    
    try {
      setSubmitting(true);
      
      const formattedDate = values.date.format('DD-MM-YYYY');
      const formattedTime = values.time.format('HH:mm');
      
      const res = await axios.put(
        `/api/v1/doctor/update-appointment/${selectedAppointment._id}`,
        {
          date: formattedDate,
          time: formattedTime,
        },
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
      );
      
      if (res.data.success) {
        message.success(res.data.message);
        setIsEditModalVisible(false);
        getAppointments(); // Refresh the appointments list
      }
    } catch (error) {
      console.log(error);
      message.error("Failed to update appointment");
    } finally {
      setSubmitting(false);
    }
  };
  
  // Handle appointment deletion by doctor
  const handleDeleteAppointment = async () => {
    if (!selectedAppointment) return;
    
    try {
      setSubmitting(true);
      
      const res = await axios.delete(
        `/api/v1/doctor/delete-appointment/${selectedAppointment._id}`,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
      );
      
      if (res.data.success) {
        message.success(res.data.message);
        setIsDeleteModalVisible(false);
        getAppointments(); // Refresh the appointments list
      }
    } catch (error) {
      console.log(error);
      message.error("Failed to delete appointment");
    } finally {
      setSubmitting(false);
    }
  };
  
  // Handle modal cancellations
  const handleCancelEdit = () => {
    setIsEditModalVisible(false);
    setSelectedAppointment(null);
  };
  
  const handleCancelDelete = () => {
    setIsDeleteModalVisible(false);
    setSelectedAppointment(null);
  };

  const statusColors = {
    pending: { bg: "#f59e0b", text: "white" },
    approved: { bg: "#000000", text: "white" },
    rejected: { bg: "#800000", text: "white" },
    completed: { bg: "#3182ce", text: "white" },
    rescheduled: { bg: "#3498db", text: "white" },
    reject: { bg: "#800000", text: "white" }, // For consistency with backend naming
  };

  const columns = [
    {
      title: <div className="column-header"><UserOutlined /> Patient</div>,
      dataIndex: "userInfo",
      render: (text, record) => (
        <div className="table-cell-content">
          <div className="info-row">
            <UserOutlined className="cell-icon" />
            <span className="primary-text">{record.userInfo?.name || 'N/A'}</span>
          </div>
          <div className="info-row">
            <MailOutlined className="cell-icon" />
            <span className="secondary-text">{record.userInfo?.email || 'N/A'}</span>
          </div>
        </div>
      ),
    },
    {
      title: <div className="column-header"><PhoneOutlined /> Contact</div>,
      dataIndex: "phone",
      render: (text, record) => (
        <div className="table-cell-content">
          <div className="info-row">
            <PhoneOutlined className="cell-icon" />
            <span className="primary-text">{record.userInfo?.phone || 'N/A'}</span>
          </div>
          {record.userInfo?.bloodGroup && (
            <div className="info-row">
              <span className="label">Blood Group:</span>
              <span className="secondary-text">{record.userInfo.bloodGroup}</span>
            </div>
          )}
          {record.userInfo?.medicalProblem && (
            <div className="info-row">
              <span className="label">Medical Issue:</span>
              <span className="secondary-text">{record.userInfo.medicalProblem}</span>
            </div>
          )}
        </div>
      ),
    },
    {
      title: <div className="column-header"><CalendarOutlined /> Date & Time</div>,
      dataIndex: "date",
      render: (text, record) => (
        <div className="table-cell-content">
          <div className="info-row">
            <CalendarOutlined className="cell-icon" />
            <span className="primary-text">{record.date ? moment(record.date, "DD-MM-YYYY").format("DD MMM YYYY") : 'N/A'}</span>
          </div>
          <div className="info-row">
            <ClockCircleOutlined className="cell-icon" />
            <span className="secondary-text" style={{ fontWeight: 500 }}>{record.time ? moment(record.time, "HH:mm").format("hh:mm A") : 'N/A'}</span>
          </div>
        </div>
      ),
    },
    {
      title: <div className="column-header"><CheckCircleOutlined /> Status</div>,
      dataIndex: "status",
      render: (status, record) => {
        // Get the appropriate color for the status
        const statusKey = status.toLowerCase();
        const colorInfo = statusColors[statusKey] || statusColors.pending;
        
        // Determine if we need to show additional info for rescheduled appointments
        const isRescheduled = statusKey === 'rescheduled';
        
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
                {status.charAt(0).toUpperCase() + status.slice(1)}
              </Tag>
            </div>
            {isRescheduled && record.rescheduleDate && record.rescheduleTime && (
              <div className="info-row" style={{ marginTop: '5px' }}>
                <span className="secondary-text">
                  New: {moment(record.rescheduleDate, "DD-MM-YYYY").format("MMM DD")} at {moment(record.rescheduleTime, "HH:mm").format("hh:mm A")}
                </span>
              </div>
            )}
          </div>
        );
      },
    },
    {
      title: "Actions",
      dataIndex: "actions",
      render: (text, record) => (
        <div className="actions-container">
          <div className="action-buttons">
            {/* Conditional buttons based on status */}
            {/* For Pending/Rescheduled: Show Approve and Reject buttons */}
            {(record.status === "pending" || record.status === "rescheduled") && (
              <div className="status-action-buttons">
                <Button
                  className="action-button approve-button"
                  size="middle"
                  icon={<CheckOutlined />}
                  onClick={() => handleStatus(record, "approved")}
                  style={{ 
                    backgroundColor: '#fff', 
                    borderColor: '#000', 
                    color: '#000',
                    width: '36px',
                    height: '36px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    padding: 0,
                    minWidth: '36px',
                    boxShadow: '0 1px 2px rgba(0,0,0,0.1)',
                    borderRadius: '4px',
                    marginRight: '8px'
                  }}
                />
                
                <Button
                  className="action-button reject-button"
                  size="middle"
                  icon={<CloseOutlined />}
                  onClick={() => handleStatus(record, "reject")}
                  style={{ 
                    backgroundColor: '#fff', 
                    borderColor: '#ff4d4f', 
                    color: '#ff4d4f',
                    width: '36px',
                    height: '36px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    padding: 0,
                    minWidth: '36px',
                    boxShadow: '0 1px 2px rgba(0,0,0,0.1)',
                    borderRadius: '4px'
                  }}
                />
              </div>
            )}
            
            {/* For Approved: Show Modify and Delete buttons */}
            {record.status === "approved" && (
              <div className="status-action-buttons">
                <Tooltip title="Modify Appointment" placement="top">
                  <Button 
                    icon={<EditOutlined style={{ fontSize: '16px' }} />} 
                    size="middle"
                    onClick={() => showEditModal(record)}
                    className="action-button edit-button"
                    style={{ 
                      backgroundColor: '#fff', 
                      borderColor: '#000', 
                      color: '#000',
                      width: '36px',
                      height: '36px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      padding: 0,
                      minWidth: '36px',
                      boxShadow: '0 1px 2px rgba(0,0,0,0.1)',
                      transition: 'all 0.2s ease',
                      marginRight: '8px'
                    }}
                  />
                </Tooltip>
                
                <Tooltip title="Cancel Appointment" placement="top">
                  <Button 
                    icon={<DeleteOutlined style={{ fontSize: '16px' }} />} 
                    size="middle"
                    onClick={() => showDeleteModal(record)}
                    className="action-button delete-button"
                    style={{ 
                      backgroundColor: '#fff', 
                      borderColor: '#800000', 
                      color: '#800000',
                      width: '36px',
                      height: '36px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      padding: 0,
                      minWidth: '36px',
                      boxShadow: '0 1px 2px rgba(0,0,0,0.1)',
                      transition: 'all 0.2s ease'
                    }}
                  />
                </Tooltip>
              </div>
            )}
          </div>
          
          {/* Rescheduled notification */}
          {record.status === "rescheduled" && (
            <div className="reschedule-note">
              <span>This appointment has been rescheduled by the patient</span>
            </div>
          )}
        </div>
      ),
    },
  ];

  return (
    <Layout>
      <div className="appointments-container">
        <div className="appointments-header">
          <div className="header-top">
            <h1 className="page-title">Appointment Requests</h1>
            <Button 
              type="primary" 
              onClick={getAppointments}
              className="refresh-button"
            >
              Refresh
            </Button>
          </div>
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
            position: ['bottomCenter']
          }}
          scroll={{ x: true }}
        />
        
        {/* Edit Appointment Modal */}
        <Modal
          title={
            <div className="admin-popup-title">
              <EditOutlined className="admin-popup-icon" />
              Modify Appointment
            </div>
          }
          open={isEditModalVisible}
          onCancel={handleCancelEdit}
          footer={null}
          centered
          maskClosable={false}
          width={500}
          styles={{ body: { padding: '24px', paddingTop: '12px' } }}
        >
          <div className="admin-popup-content">
            <p className="admin-popup-message">
              You can modify the date and time of this appointment. The patient will be notified of your changes.
            </p>
            
            {selectedAppointment && (
              <div className="admin-popup-details">
                <p>
                  <strong>Patient:</strong> {selectedAppointment.userInfo?.name}
                </p>
                <p>
                  <strong>Contact:</strong> {selectedAppointment.userInfo?.phone}
                </p>
              </div>
            )}
            
            <Form
              form={editForm}
              layout="vertical"
              onFinish={handleUpdateAppointment}
            >
              <Form.Item
                name="date"
                label="Date"
                rules={[{ required: true, message: 'Please select a date' }]}
              >
                <DatePicker 
                  className="custom-datepicker" 
                  format="DD-MM-YYYY"
                  style={{ 
                    width: '100%', 
                    borderColor: '#000', 
                    borderRadius: '2px'
                  }}
                />
              </Form.Item>
              
              <Form.Item
                name="time"
                label="Time"
                rules={[{ required: true, message: 'Please select a time' }]}
              >
                <TimePicker 
                  format="HH:mm" 
                  className="custom-timepicker" 
                  style={{ 
                    width: '100%', 
                    borderColor: '#000', 
                    borderRadius: '2px'
                  }}
                />
              </Form.Item>
              
              <div className="form-actions">
                <Button onClick={handleCancelEdit} style={{ marginRight: 8 }}>
                  Cancel
                </Button>
                <Button 
                  type="primary" 
                  htmlType="submit" 
                  loading={submitting}
                  style={{ backgroundColor: '#000', borderColor: '#000' }}
                >
                  Update Appointment
                </Button>
              </div>
            </Form>
          </div>
        </Modal>
        
        {/* Delete Appointment Modal */}
        <Modal
          title={
            <div className="admin-popup-title">
              <DeleteOutlined className="admin-popup-icon" />
              Cancel Appointment
            </div>
          }
          open={isDeleteModalVisible}
          onCancel={handleCancelDelete}
          footer={null}
          centered
          maskClosable={false}
          width={500}
          styles={{ body: { padding: '24px', paddingTop: '12px' } }}
        >
          <div className="admin-popup-content">
            <p className="admin-popup-message">
              Are you sure you want to cancel this appointment? This action cannot be undone. The patient will be notified.
            </p>
            
            {selectedAppointment && (
              <div className="admin-popup-details">
                <p>
                  <strong>Patient:</strong> {selectedAppointment.userInfo?.name}
                </p>
                <p>
                  <strong>Date:</strong> {selectedAppointment.date ? moment(selectedAppointment.date, "DD-MM-YYYY").format("DD MMM YYYY") : 'N/A'}
                </p>
                <p>
                  <strong>Time:</strong> {selectedAppointment.time ? moment(selectedAppointment.time, "HH:mm").format("hh:mm A") : 'N/A'}
                </p>
              </div>
            )}
            
            <div className="form-actions">
              <Button onClick={handleCancelDelete} style={{ marginRight: 8 }}>
                No, Keep Appointment
              </Button>
              <Button 
                danger 
                onClick={handleDeleteAppointment} 
                loading={submitting}
              >
                Yes, Cancel Appointment
              </Button>
            </div>
          </div>
        </Modal>
      </div>
    </Layout>
  );
};

export default DoctorAppointments;