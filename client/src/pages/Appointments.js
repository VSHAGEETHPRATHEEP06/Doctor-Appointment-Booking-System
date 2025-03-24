// Appointments.js
import React, { useState, useEffect } from "react";
import axios from "../config/axiosConfig";
import Layout from "./../components/Layout";
import moment from "moment";
import "../styles/Appointments.css";
import "../styles/AdminStyles.css";
import "../styles/CustomDatePicker.css";

// Media query handled via CSS instead of React hooks
import { Table, Tag, Button, Tooltip, Spin, Empty, Modal, Form, message, Space, DatePicker, TimePicker } from "antd";
// import DatePicker from "react-datepicker"; // Using Ant Design DatePicker instead
import "react-datepicker/dist/react-datepicker.css";
import { 
  CalendarOutlined, 
  UserOutlined, 
  PhoneOutlined, 
  CheckCircleOutlined,
  ReloadOutlined,
  MailOutlined,
  MedicineBoxOutlined,
  EditOutlined,
  DeleteOutlined,
  ExclamationCircleOutlined,
  ClockCircleOutlined
} from "@ant-design/icons";

const Appointments = () => {
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedAppointment, setSelectedAppointment] = useState(null);
  const [isEditModalVisible, setIsEditModalVisible] = useState(false);
  const [isDeleteModalVisible, setIsDeleteModalVisible] = useState(false);
  const [editForm] = Form.useForm();
  const [submitting, setSubmitting] = useState(false);
  const [selectedDate, setSelectedDate] = useState(null);
  const [selectedTime, setSelectedTime] = useState(null);
  const [availableTimeSlots, setAvailableTimeSlots] = useState([]);
  const [checkingAvailability, setCheckingAvailability] = useState(false);
  
  // Responsiveness is handled through CSS media queries and Ant Design's responsive props

  const getAppointments = async () => {
    try {
      setLoading(true);
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
      message.error("Failed to fetch appointments");
    } finally {
      setLoading(false);
    }
  };
  
  // Show edit modal with appointment data
  // Function to check doctor's available times for a selected date
  const checkDoctorAvailability = async (date, doctorId, time) => {
    if (!date || !doctorId) return;
    
    try {
      setCheckingAvailability(true);
      const formattedDate = moment(date).format('DD-MM-YYYY');
      
      const res = await axios.post(
        '/api/v1/user/booking-availability', 
        {
          doctorId: doctorId,
          date: formattedDate,
          time: time ? moment(time).format('HH:mm') : null,
        },
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
      );
      
      setCheckingAvailability(false);
      if (res.data.success) {
        // Get the available times from the response
        // If no specific slots returned but success is true, create default slots based on doctor hours
        if (res.data.data && res.data.data.length > 0) {
          setAvailableTimeSlots(res.data.data);
          return res.data.data;
        } else if (res.data.startTime && res.data.endTime) {
          // If backend doesn't return specific slots but gives hours range
          const startTime = moment(res.data.startTime, "HH:mm");
          const endTime = moment(res.data.endTime, "HH:mm");
          const slots = [];
          
          // Generate slots every 15 minutes between start and end
          let currentSlot = startTime.clone();
          while (currentSlot.isBefore(endTime)) {
            slots.push(currentSlot.format("HH:mm"));
            currentSlot.add(15, 'minutes');
          }
          
          setAvailableTimeSlots(slots);
          return slots;
        } else {
          // Default behavior in case no specific slot info
          setAvailableTimeSlots(['09:00', '09:15', '09:30', '09:45', '10:00', '10:15', '10:30', '10:45', '11:00']);
          return ['09:00', '09:15', '09:30', '09:45', '10:00', '10:15', '10:30', '10:45', '11:00'];
        }
      } else {
        message.error(res.data.message || "Failed to get available time slots");
        setAvailableTimeSlots([]);
        return [];
      }
      
    } catch (error) {
      setCheckingAvailability(false);
      console.error("Error checking availability:", error);
      message.error("Failed to fetch available time slots");
      // Set some default slots so the time picker isn't permanently disabled
      setAvailableTimeSlots(['09:00', '09:15', '09:30', '09:45', '10:00', '10:15', '10:30', '10:45', '11:00']);
      return ['09:00', '09:15', '09:30', '09:45', '10:00', '10:15', '10:30', '10:45', '11:00'];
    }
  };

  const showEditModal = (appointment) => {
    setSelectedAppointment(appointment);
    setIsEditModalVisible(true);
    
    // Parse the date and time for react-datepicker
    const dateObj = appointment.date ? moment(appointment.date, "DD-MM-YYYY") : moment();
    const timeObj = appointment.time ? moment(appointment.time, "HH:mm") : moment();
    
    // Set the datepicker state
    setSelectedDate(dateObj);
    setSelectedTime(timeObj);
    
    // Check doctor availability for the current date
    if (appointment.doctorId) {
      checkDoctorAvailability(dateObj, appointment.doctorId, timeObj);
    }
    
    // Use setTimeout to ensure the form is properly mounted before setting values
    setTimeout(() => {
      editForm.setFieldsValue({
        date: moment(appointment.date, "DD-MM-YYYY"),
        time: moment(appointment.time, "HH:mm"),
      });
    }, 0);
  };
  
  // Show delete confirmation modal
  const showDeleteModal = (appointment) => {
    setSelectedAppointment(appointment);
    setIsDeleteModalVisible(true);
  };
  
  // Handle appointment update
  const handleUpdateAppointment = async (values) => {
    if (!selectedAppointment) return;
    
    try {
      setSubmitting(true);
      
      // Check if date and time are valid
      if (!selectedDate || !selectedTime) {
        message.error("Please select both date and time");
        setSubmitting(false);
        return;
      }
      
      // Format the date and time from the react-datepicker state
      const formattedDate = values.date.format('DD-MM-YYYY');
      const formattedTime = values.time.format('HH:mm');
      
      const res = await axios.post(
        "/api/v1/user/reschedule-appointment",
        {
          appointmentId: selectedAppointment._id,
          date: formattedDate,
          time: formattedTime,
          doctorId: selectedAppointment.doctorId,
          doctorInfo: selectedAppointment.doctorInfo,
          userInfo: selectedAppointment.userInfo,
          sendNotification: true  // Add this parameter to indicate notification should be sent
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
  
  // Handle appointment deletion
  const handleDeleteAppointment = async () => {
    if (!selectedAppointment) return;
    
    try {
      setSubmitting(true);
      
      const res = await axios.delete(
        `/api/v1/user/delete-appointment/${selectedAppointment._id}`,
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

  useEffect(() => {
    getAppointments();
  }, []);

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
      title: <div className="column-header"><UserOutlined /> Doctor</div>,
      dataIndex: "name",
      responsive: ['md'],
      render: (text, record) => (
        <div className="table-cell-content">
          <div className="info-row">
            <UserOutlined className="cell-icon" />
            <span className="primary-text">{record.doctorInfo && `${record.doctorInfo.firstName || ''} ${record.doctorInfo.lastName || ''}`}</span>
          </div>
          <div className="info-row">
            <MedicineBoxOutlined className="cell-icon" />
            <span className="secondary-text">{(record.doctorInfo && record.doctorInfo.specialization) || 'General Practitioner'}</span>
          </div>
        </div>
      ),
    },
    {
      title: <div className="column-header"><PhoneOutlined /> Contact</div>,
      dataIndex: "phone",
      responsive: ['lg'],
      render: (text, record) => (
        <div className="table-cell-content">
          <div className="info-row">
            <PhoneOutlined className="cell-icon" />
            <span className="primary-text">{(record.doctorInfo && record.doctorInfo.phone) || 'N/A'}</span>
          </div>
          <div className="info-row">
            <MailOutlined className="cell-icon" />
            <span className="secondary-text">{(record.doctorInfo && record.doctorInfo.email) || 'N/A'}</span>
          </div>
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
                  borderRadius: '4px',
                  minWidth: '100px',
                  textAlign: 'center',
                  fontWeight: '600',
                  padding: '6px 12px',
                  boxShadow: '0 1px 2px rgba(0,0,0,0.1)',
                  letterSpacing: '0.5px',
                  fontSize: '12px',
                  display: 'inline-flex',
                  justifyContent: 'center',
                  alignItems: 'center'
                }}
              >
                {statusKey === 'reject' ? 'REJECTED' : status.toUpperCase()}
              </Tag>
            </div>
            
            {isRescheduled && (
              <div className="info-row" style={{ textAlign: 'center' }}>
                <span className="secondary-text" style={{ fontSize: '12px', marginTop: '4px' }}>
                  Waiting for doctor approval
                </span>
              </div>
            )}
          </div>
        );
      },
    },
    {
      title: <div className="column-header">Actions</div>,
      dataIndex: "actions",
      render: (text, record) => {
        // Allow editing and deleting for all appointments except rejected ones
        const canModify = record.status.toLowerCase() !== 'rejected';
        
        return (
          <div className="table-cell-content">
            <div className="info-row">
              {canModify ? (
                <Space size={12}>
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
                        transition: 'all 0.2s ease'
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
                </Space>
              ) : (
                <span className="secondary-text">No actions available</span>
              )}
            </div>
          </div>
        );
      },
    },
  ];

  return (
    <Layout>
      <div className="appointments-container">
        <div className="appointments-header">
          <div className="header-top">
            <h1 className="page-title">My Appointments</h1>
            <Button 
              type="primary" 
              icon={<ReloadOutlined />} 
              onClick={getAppointments}
              loading={loading}
              style={{ 
                backgroundColor: '#000000', 
                borderColor: '#000000', 
                color: '#ffffff'
              }}
              className="refresh-button"
            >
              Refresh
            </Button>
          </div>
          <p className="page-subtitle">View and manage your medical appointments</p>
        </div>
        
        {loading ? (
          <div className="loading-container">
            <Spin size="large" />
            <p>Loading your appointments...</p>
          </div>
        ) : appointments.length === 0 ? (
          <Empty 
            description="No appointments found" 
            image={Empty.PRESENTED_IMAGE_SIMPLE} 
            className="empty-appointments"
          />
        ) : (
          <div className="responsive-table-wrapper">
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
              scroll={{ x: 800 }}
              responsive
              size="small"
              rowClassName="appointment-row"
            />
          </div>
        )}
        
        {/* Edit Appointment Modal */}
        <Modal
          title={
            <div className="admin-popup-title" style={{ 
              display: 'flex', 
              alignItems: 'center', 
              borderBottom: '2px solid #f0f0f0', 
              paddingBottom: '12px',
              marginBottom: '5px' 
            }}>
              <EditOutlined className="admin-popup-icon" style={{ 
                fontSize: '22px', 
                marginRight: '12px', 
                color: '#1a1a1a',
                backgroundColor: '#f5f5f5',
                padding: '8px',
                borderRadius: '50%',
              }} />
              <span style={{ fontSize: '18px', fontWeight: '600' }}>Modify Appointment</span>
            </div>
          }
          open={isEditModalVisible}
          onCancel={handleCancelEdit}
          footer={null}
          centered
          maskClosable={false}
          width={520}
          destroyOnClose={true}
          modalRender={(node) => <div onMouseDown={(e) => e.stopPropagation()}>{node}</div>}
          styles={{ body: { padding: '24px', paddingTop: '12px' } }}
          style={{ borderRadius: '8px', overflow: 'hidden' }}
        >
          <div className="admin-popup-content">
            <p className="admin-popup-message" style={{ 
              fontSize: '14px', 
              lineHeight: '1.5', 
              color: '#595959',
              backgroundColor: '#f9f9f9',
              padding: '12px',
              borderRadius: '6px',
              borderLeft: '4px solid #000000',
              marginBottom: '20px' 
            }}>
              <span style={{ display: 'block', fontWeight: '600', marginBottom: '4px', color: '#000000' }}>Important:</span>
              You can modify the date and time of your appointment below. The doctor will be notified of your changes and will need to approve the new schedule. You can modify appointments even if they are already confirmed.
            </p>
            
            {selectedAppointment && (
              <div
                style={{
                  padding: '15px',
                  backgroundColor: '#f9f9f9',
                  borderRadius: '5px',
                  marginBottom: '20px',
                  border: '1px solid #eaeaea'
                }}>
                <div style={{ marginBottom: '15px' }}>
                  <div style={{ display: 'flex', alignItems: 'center' }}>
                    <MedicineBoxOutlined style={{ fontSize: '16px', marginRight: '10px', color: '#1a1a1a' }} />
                    <div>
                      <strong style={{ fontSize: '15px' }}>Dr. {selectedAppointment?.doctorInfo?.firstName} {selectedAppointment?.doctorInfo?.lastName}</strong>
                      <div style={{ fontSize: '13px', color: '#595959', marginTop: '2px' }}>{selectedAppointment?.doctorInfo?.specialization}</div>
                    </div>
                  </div>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', marginBottom: '10px' }}>
                  <CalendarOutlined style={{ fontSize: '16px', marginRight: '10px', color: '#1a1a1a' }} />
                  <div>
                    <strong style={{ fontSize: '15px' }}>Original Appointment</strong>
                    <div style={{ fontSize: '13px', color: '#595959', marginTop: '2px' }}>
                      {moment(selectedAppointment?.date, "DD-MM-YYYY").format("DD MMM YYYY")} at {moment(selectedAppointment?.time, "HH:mm").format("hh:mm A")}
                    </div>
                  </div>
                </div>
              </div>
            )}
            
            <Form
              form={editForm}
              layout="vertical"
              onFinish={handleUpdateAppointment}
            >
              <Form.Item
                name="date"
                label={<span style={{ fontWeight: 500, fontSize: '15px' }}>Appointment Date</span>}
                rules={[{ required: true, message: 'Please select a date' }]}
                style={{ marginBottom: '24px' }}
              >
                <div className="custom-datepicker-container">
                  <DatePicker
                    format="DD-MM-YYYY"
                    className="ant-picker-custom custom-picker-wrapper"
                    placeholder="Select date"
                    suffixIcon={<CalendarOutlined style={{ color: '#000000' }} />}
                    showToday={true}
                    disabledDate={(current) => {
                      return current && current < moment().startOf('day');
                    }}
                    onChange={(value) => {
                      setSelectedDate(value ? value.toDate() : null);
                      editForm.setFieldsValue({ date: value });
                      // Clear selected time when date changes
                      editForm.setFieldsValue({ time: null });
                      setSelectedTime(null);
                      
                      // Check availability for the new date
                      if (value && selectedAppointment?.doctorId) {
                        checkDoctorAvailability(value.toDate(), selectedAppointment.doctorId, null);
                      }
                    }}
                  />
                </div>
              </Form.Item>
              
              <Form.Item
                name="time"
                label={<span style={{ fontWeight: 500, fontSize: '15px' }}>Appointment Time</span>}
                rules={[{ required: true, message: 'Please select appointment time' }]}
                style={{ marginBottom: '24px' }}
              >
                <div className="custom-datepicker-container">
                  <TimePicker
                    format="HH:mm"
                    placeholder="Select time"
                    suffixIcon={<ClockCircleOutlined style={{ color: '#000000' }} />}
                    minuteStep={15}
                    use12Hours={false}
                    allowClear={true}
                    loading={checkingAvailability}
                    disabled={checkingAvailability || !selectedDate}
                    onChange={(value) => {
                      setSelectedTime(value ? value.toDate() : null);
                      editForm.setFieldsValue({ time: value });
                    }}
                    disabledTime={() => {
                      // Create a set of disabled hours and minutes based on available slots
                      const disabledHours = [];
                      const disabledMinutes = {};
                      
                      // Populate all hours first (0-23)
                      for (let i = 0; i < 24; i++) {
                        disabledHours.push(i);
                      }
                      
                      // Now remove hours that are in available slots
                      if (availableTimeSlots && availableTimeSlots.length > 0) {
                        availableTimeSlots.forEach(slot => {
                          const timeObj = moment(slot, "HH:mm");
                          const hour = timeObj.hour();
                          const minute = timeObj.minute();
                          
                          // Remove this hour from disabled list
                          const hourIndex = disabledHours.indexOf(hour);
                          if (hourIndex > -1) {
                            disabledHours.splice(hourIndex, 1);
                          }
                          
                          // Add specific minutes for this hour that are NOT available
                          if (!disabledMinutes[hour]) {
                            disabledMinutes[hour] = [];
                            for (let i = 0; i < 60; i += 15) {
                              if (i !== minute) {
                                disabledMinutes[hour].push(i);
                              }
                            }
                          } else {
                            // Remove this specific minute from the disabled list for this hour
                            const minuteIndex = disabledMinutes[hour].indexOf(minute);
                            if (minuteIndex > -1) {
                              disabledMinutes[hour].splice(minuteIndex, 1);
                            }
                          }
                        });
                      }
                      
                      return {
                        disabledHours: () => disabledHours,
                        disabledMinutes: (hour) => disabledMinutes[hour] || []
                      };
                    }}
                  />
                </div>
              </Form.Item>
              
              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px', marginTop: '24px' }}>
                <Button 
                  onClick={handleCancelEdit} 
                  style={{ 
                    borderColor: '#000000', 
                    color: '#000000',
                    height: '40px',
                    borderRadius: '4px',
                    width: '180px',
                    fontSize: '14px',
                    boxShadow: '0 2px 0 rgba(0,0,0,0.02)',
                  }}
                >
                  <span>Cancel</span>
                </Button>
                <Button 
                  type="primary" 
                  htmlType="submit" 
                  loading={submitting}
                  style={{ 
                    backgroundColor: '#000', 
                    borderColor: '#000',
                    width: '280px',
                    height: '40px',
                    borderRadius: '4px',
                    boxShadow: '0 2px 0 rgba(0,0,0,0.045)',
                    fontSize: '14px',
                    fontWeight: '500'
                  }}
                  icon={<EditOutlined style={{ fontSize: '14px' }} />}
                >
                  <span style={{ marginLeft: '8px' }}>Update Appointment</span>
                </Button>
              </div>
            </Form>
          </div>
        </Modal>
        
        {/* Delete Appointment Confirmation Modal */}
        <Modal
          title={
            <div className="admin-popup-title" style={{ 
              display: 'flex', 
              alignItems: 'center', 
              borderBottom: '2px solid #f0f0f0', 
              paddingBottom: '12px',
              marginBottom: '5px' 
            }}>
              <ExclamationCircleOutlined className="admin-popup-icon" style={{ 
                fontSize: '22px', 
                marginRight: '12px', 
                color: '#000000',
                backgroundColor: '#f5f5f5',
                padding: '8px',
                borderRadius: '50%',
              }} />
              <span style={{ fontSize: '18px', fontWeight: '600', color: '#000000' }}>Cancel Appointment</span>
            </div>
          }
          open={isDeleteModalVisible}
          onCancel={handleCancelDelete}
          footer={null}
          centered
          maskClosable={false}
          width={520}
          destroyOnClose={true}
          modalRender={(node) => <div onMouseDown={(e) => e.stopPropagation()}>{node}</div>}
          styles={{ body: { padding: '24px', paddingTop: '12px' } }}
          style={{ borderRadius: '8px', overflow: 'hidden' }}
        >
          <div className="admin-popup-content">
            <p className="admin-popup-message" style={{ 
              fontSize: '14px', 
              lineHeight: '1.5', 
              color: '#595959',
              backgroundColor: '#f9f9f9',
              padding: '12px',
              borderRadius: '6px',
              borderLeft: '4px solid #000000',
              marginBottom: '20px' 
            }}>
              <span style={{ display: 'block', fontWeight: '600', marginBottom: '4px', color: '#000000' }}>Warning:</span>
              Are you sure you want to cancel this appointment? This action cannot be undone. You can cancel appointments even if they are already confirmed.
            </p>
            
            {selectedAppointment && (
              <div className="admin-popup-details" role="complementary" aria-label="Appointment details" style={{ 
                backgroundColor: '#f9f9f9', 
                padding: '15px', 
                borderRadius: '6px',
                marginBottom: '20px',
                border: '1px solid #eaeaea'
              }}>
                <div style={{ display: 'flex', alignItems: 'center', marginBottom: '10px' }}>
                  <MedicineBoxOutlined style={{ fontSize: '16px', marginRight: '10px', color: '#1a1a1a' }} />
                  <div>
                    <strong style={{ fontSize: '15px' }}>Dr. {selectedAppointment?.doctorInfo?.firstName} {selectedAppointment?.doctorInfo?.lastName}</strong>
                    <div style={{ fontSize: '13px', color: '#595959', marginTop: '2px' }}>{selectedAppointment?.doctorInfo?.specialization}</div>
                  </div>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', marginBottom: '10px' }}>
                  <CalendarOutlined style={{ fontSize: '16px', marginRight: '10px', color: '#1a1a1a' }} />
                  <div>
                    <strong style={{ fontSize: '15px' }}>Date</strong>
                    <div style={{ fontSize: '13px', color: '#595959', marginTop: '2px' }}>
                      {moment(selectedAppointment.date, "DD-MM-YYYY").format("DD MMM YYYY")}
                    </div>
                  </div>
                </div>
                <div style={{ display: 'flex', alignItems: 'center' }}>
                  <ClockCircleOutlined style={{ fontSize: '16px', marginRight: '10px', color: '#1a1a1a' }} />
                  <div>
                    <strong style={{ fontSize: '15px' }}>Time</strong>
                    <div style={{ fontSize: '13px', color: '#595959', marginTop: '2px' }}>
                      {moment(selectedAppointment.time, "HH:mm").format("hh:mm A")}
                    </div>
                  </div>
                </div>
              </div>
            )}
            
            <div style={{ display: 'flex', justifyContent: 'space-between', gap: '12px', marginTop: '24px' }}>
              <Button 
                onClick={handleCancelDelete} 
                style={{ 
                  borderColor: '#000000', 
                  color: '#000000',
                  height: '40px',
                  borderRadius: '4px',
                  width: '220px',
                  fontSize: '14px',
                  boxShadow: '0 2px 0 rgba(0,0,0,0.02)'
                }}
              >
                <span>No, Keep Appointment</span>
              </Button>
              <Button 
                danger 
                onClick={handleDeleteAppointment} 
                loading={submitting}
                style={{ 
                  backgroundColor: '#000000', 
                  borderColor: '#000000',
                  color: '#fff',
                  width: '240px',
                  height: '40px',
                  borderRadius: '4px',
                  boxShadow: '0 2px 0 rgba(0,0,0,0.045)',
                  fontSize: '14px',
                  fontWeight: '500'
                }}
                icon={<DeleteOutlined style={{ fontSize: '14px' }} />}
              >
                <span style={{ marginLeft: '8px' }}>Yes, Cancel Appointment</span>
              </Button>
            </div>
          </div>
        </Modal>
      </div>
    </Layout>
  );
};

export default Appointments;