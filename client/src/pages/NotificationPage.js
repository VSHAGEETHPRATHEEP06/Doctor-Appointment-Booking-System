import "../styles/Notification.css"
import React, { useState } from "react";
import Layout from "./../components/Layout";
import { message, Tabs, List, Button, Tag, Card, Modal, Tooltip, Space, Typography, Divider } from "antd";
import { useSelector, useDispatch } from "react-redux";
import { showLoading, hideLoading } from "../redux/features/alertSlice";
import { useNavigate } from "react-router-dom";
import "../styles/Notification.css";
import axios from "axios";
import moment from "moment";
import { 
  BellOutlined, 
  CheckCircleOutlined, 
  DeleteOutlined, 
  CheckOutlined,
  CalendarOutlined,
  ClockCircleOutlined,
  UserOutlined,
  InfoCircleOutlined,
  HistoryOutlined
} from "@ant-design/icons";
import AppointmentNotification from "../components/AppointmentNotification";

const { Text } = Typography;

const NotificationPage = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { user } = useSelector((state) => state.user);
  const [previewNotification, setPreviewNotification] = useState(null);
  const [previewModalVisible, setPreviewModalVisible] = useState(false);

  // Helper to determine where to navigate based on notification type
  const getNavigationPath = (notification) => {
    // Default path if none is specified
    if (!notification) return "/";
    
    // If the notification has a specific path, use it
    if (notification.onClickPath) return notification.onClickPath;
    
    // Otherwise try to determine from the message content
    const message = notification.message.toLowerCase();
    
    if (message.includes("appointment") && message.includes("approved")) {
      return "/appointments";
    } else if (message.includes("appointment") && message.includes("booked")) {
      return "/appointments";
    } else if (message.includes("profile")) {
      return "/profile";
    } else if (message.includes("doctor") && message.includes("applied")) {
      return "/admin/doctors";
    } else {
      // Default fallback
      return "/";
    }
  };
  
  // Preview notification details
  const showNotificationPreview = (notification) => {
    setPreviewNotification(notification);
    setPreviewModalVisible(true);
  };
  
  // Close preview modal
  const handleClosePreview = () => {
    setPreviewModalVisible(false);
  };
  
  // Navigate to relevant page
  const handleNotificationClick = (notification) => {
    const path = getNavigationPath(notification);
    navigate(path);
  };

  // Format timestamp
  const formatTimestamp = (timestamp) => {
    if (!timestamp) return "";
    
    const notificationTime = moment(timestamp);
    const now = moment();
    
    if (now.diff(notificationTime, 'days') < 1) {
      return notificationTime.fromNow(); // e.g. "2 hours ago"
    } else if (now.diff(notificationTime, 'days') < 7) {
      return notificationTime.format('dddd [at] h:mm A'); // e.g. "Monday at 2:30 PM"
    } else {
      return notificationTime.format('MMM D, YYYY [at] h:mm A'); // e.g. "Jan 5, 2023 at 2:30 PM"
    }
  };

  // Handle marking all notifications as read
  const handleMarkAllRead = async () => {
    try {
      dispatch(showLoading());
      const res = await axios.post(
        "/api/v1/user/notifications",
        { userId: user._id },
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
      );
      dispatch(hideLoading());
      if (res.data.success) {
        message.success(res.data.message);
      } else {
        message.error(res.data.message || "Failed to mark notifications as read");
      }
    } catch (error) {
      dispatch(hideLoading());
      console.error("Error marking notifications as read:", error);
      if (error.response) {
        message.error(
          error.response.data.message || "Failed to mark notifications as read"
        );
      } else if (error.request) {
        message.error("No response from the server. Please try again.");
      } else {
        message.error("Something went wrong. Please try again.");
      }
    }
  };

  // Handle deleting all read notifications
  const handleDeleteAllRead = async () => {
    try {
      dispatch(showLoading());
      const res = await axios.post(
        "/api/v1/user/delete-all-notification",
        { userId: user._id },
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
      );
      dispatch(hideLoading());
      if (res.data.success) {
        message.success(res.data.message);
      } else {
        message.error(res.data.message || "Failed to delete read notifications");
      }
    } catch (error) {
      dispatch(hideLoading());
      console.error("Error deleting read notifications:", error);
      if (error.response) {
        message.error(
          error.response.data.message || "Failed to delete read notifications"
        );
      } else if (error.request) {
        message.error("No response from the server. Please try again.");
      } else {
        message.error("Something went wrong. Please try again.");
      }
    }
  };

  // Prepare appointment data for notification component
  const prepareAppointmentData = (notification) => {
    if (!notification || !notification.data) return null;
    
    const { data } = notification;

    // Extract appointment info if available
    const appointmentInfo = data.appointmentInfo ? {
      doctorName: data.appointmentInfo.doctorName || 'Unknown Doctor',
      date: data.appointmentInfo.date,
      time: data.appointmentInfo.time,
      status: data.appointmentInfo.status,
      modifiedBy: data.appointmentInfo.modifiedBy
    } : null;
    
    // Extract modification details if available
    const modificationDetails = data.modificationDetails ? {
      previousDate: data.modificationDetails.previousDate,
      previousTime: data.modificationDetails.previousTime,
      previousStatus: data.modificationDetails.previousStatus,
      newDate: data.modificationDetails.newDate,
      newTime: data.modificationDetails.newTime,
      newStatus: data.modificationDetails.newStatus
    } : null;
    
    return {
      message: notification.message,
      appointmentInfo,
      modificationDetails
    };
  };

  // Determine notification type based on content
  const getNotificationType = (message) => {
    if (!message) return 'info';
    
    const msgLower = message.toLowerCase();
    if (msgLower.includes('approved')) return 'success';
    if (msgLower.includes('cancel') || msgLower.includes('reject')) return 'error';
    if (msgLower.includes('update') || msgLower.includes('reschedul')) return 'warning';
    return 'info';
  };

  // Tab items with black and white UI
  const tabItems = [
    {
      key: "unread",
      label: (
        <span className="tab-label">
          <BellOutlined /> Unread
          {user?.notification.length > 0 && (
            <Tag className="notification-count-tag">
              {user.notification.length}
            </Tag>
          )}
        </span>
      ),
      children: (
        <div className="notification-container">
          <div className="action-header">
            <Button
              className="mark-all-read-btn"
              icon={<CheckOutlined />}
              onClick={handleMarkAllRead}
            >
              Mark All as Read
            </Button>
          </div>
          <List
            itemLayout="horizontal"
            dataSource={user?.notification}
            locale={{ emptyText: "No new notifications" }}
            renderItem={(notification) => (
              <List.Item
                className="notification-item unread"
                actions={[
                  <Button 
                    type="text" 
                    icon={<InfoCircleOutlined />} 
                    onClick={(e) => {
                      e.stopPropagation();
                      showNotificationPreview(notification);
                    }}
                  />
                ]}
              >
                <div 
                  className="notification-content" 
                  onClick={() => handleNotificationClick(notification)}
                >
                  <List.Item.Meta
                    avatar={<BellOutlined className="notification-icon" />}
                    title={
                      <span className="notification-message">
                        {notification.message}
                      </span>
                    }
                    description={
                      <div className="notification-meta">
                        <span className="notification-time">
                          <ClockCircleOutlined /> {formatTimestamp(notification.createdAt)}
                        </span>
                        <span className="notification-date">
                          <CalendarOutlined /> {moment(notification.createdAt).format('MMM DD, YYYY')} {moment(notification.createdAt).format('hh:mm A')}
                        </span>
                      </div>
                    }
                  />
                </div>
              </List.Item>
            )}
          />
        </div>
      ),
    },
    {
      key: "read",
      label: (
        <span className="tab-label">
          <CheckCircleOutlined /> Read
        </span>
      ),
      children: (
        <div className="notification-container">
          <div className="action-header">
            <Button
              className="clear-all-btn"
              icon={<DeleteOutlined />}
              onClick={handleDeleteAllRead}
            >
              Clear All Read Notifications
            </Button>
          </div>
          <List
            itemLayout="horizontal"
            dataSource={user?.seen_notification}
            locale={{ emptyText: "No read notifications" }}
            renderItem={(notification) => (
              <List.Item
                className="notification-item read"
                actions={[
                  <Button 
                    type="text" 
                    icon={<InfoCircleOutlined />} 
                    onClick={(e) => {
                      e.stopPropagation();
                      showNotificationPreview(notification);
                    }}
                  />
                ]}
              >
                <div 
                  className="notification-content" 
                  onClick={() => handleNotificationClick(notification)}
                >
                  <List.Item.Meta
                    avatar={<CheckCircleOutlined className="notification-icon" />}
                    title={
                      <span className="notification-message">
                        {notification.message}
                      </span>
                    }
                    description={
                      <div className="notification-meta">
                        <span className="notification-time">
                          <ClockCircleOutlined /> {formatTimestamp(notification.createdAt)}
                        </span>
                        <span className="notification-date">
                          <CalendarOutlined /> {moment(notification.createdAt).format('MMM DD, YYYY')} {moment(notification.createdAt).format('hh:mm A')}
                        </span>
                      </div>
                    }
                  />
                </div>
              </List.Item>
            )}
          />
        </div>
      ),
    },
  ];

  return (
    <Layout>
      <div className="notification-page">
        <h4 className="notification-page-title">
          <BellOutlined className="notification-title-icon" /> Notifications
        </h4>
        <div className="notification-main">
          <Tabs 
            items={tabItems} 
            defaultActiveKey="unread"
            className="notification-tabs"
          />
        </div>
      </div>
      
      {/* Enhanced Notification Preview Modal */}
      <Modal
        title={
          <div style={{ display: 'flex', alignItems: 'center', borderBottom: '1px solid #f0f0f0', paddingBottom: '10px' }}>
            <BellOutlined style={{ fontSize: '20px', marginRight: '10px' }} />
            <span style={{ fontSize: '16px', fontWeight: '600' }}>Notification Details</span>
          </div>
        }
        open={previewModalVisible}
        onCancel={handleClosePreview}
        footer={[
          <Button key="close" type="primary" onClick={handleClosePreview}>
            Close
          </Button>
        ]}
        width={600}
        destroyOnClose
        centered
      >
        {previewNotification && (
          <div style={{ padding: '10px 0' }}>
            <Space direction="vertical" style={{ width: '100%' }} size="large">
              {/* Notification timestamp */}
              <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
                <Text type="secondary" style={{ fontSize: '12px' }}>
                  {formatTimestamp(previewNotification.time)}
                </Text>
              </div>
              
              {/* Use our enhanced AppointmentNotification component */}
              <AppointmentNotification 
                notification={prepareAppointmentData(previewNotification)}
                type={getNotificationType(previewNotification.message)}
              />
              
              {/* Show notification message */}
              <div style={{ margin: '10px 0' }}>
                <Text style={{ fontSize: '15px', lineHeight: '1.5' }}>
                  {previewNotification.message}
                </Text>
              </div>
              
              {/* Action buttons */}
              <div style={{ marginTop: '20px', display: 'flex', justifyContent: 'space-between' }}>
                <Button 
                  onClick={() => handleNotificationClick(previewNotification)}
                  icon={<InfoCircleOutlined />}
                >
                  View Details
                </Button>
                
                {previewNotification.data?.appointmentInfo?.status && (
                  <Tag color={
                    previewNotification.data.appointmentInfo.status.toLowerCase() === 'approved' ? 'green' :
                    previewNotification.data.appointmentInfo.status.toLowerCase() === 'rejected' ? 'red' :
                    previewNotification.data.appointmentInfo.status.toLowerCase() === 'pending' ? 'orange' :
                    previewNotification.data.appointmentInfo.status.toLowerCase() === 'rescheduled' ? 'blue' :
                    previewNotification.data.appointmentInfo.status.toLowerCase() === 'updated-by-doctor' ? 'purple' : 'default'
                  }>
                    {previewNotification.data.appointmentInfo.status.toUpperCase()}
                  </Tag>
                )}
              </div>
            </Space>
          </div>
        )}
      </Modal>
    </Layout>
  );
};

export default NotificationPage;