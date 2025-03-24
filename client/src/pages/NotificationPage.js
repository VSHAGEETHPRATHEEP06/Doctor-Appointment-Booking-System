import "../styles/Notification.css"
import React, { useState } from "react";
import Layout from "./../components/Layout";
import { message, Tabs, List, Button, Tag, Card, Modal, Tooltip } from "antd";
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
  InfoCircleOutlined
} from "@ant-design/icons";

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
      <Card className="notification-card">
        <h3 className="page-title">
          <BellOutlined /> Notifications
        </h3>
        <Tabs
          defaultActiveKey="unread"
          items={tabItems}
          tabBarStyle={{ padding: '0 24px' }}
          className="notification-tabs"
        />
      </Card>
      
      {/* Notification Preview Modal */}
      <Modal
        title={
          <div className="notification-modal-title">
            <BellOutlined style={{ marginRight: '8px' }} />
            Notification Details
          </div>
        }
        open={previewModalVisible}
        onCancel={handleClosePreview}
        footer={
          <div className="notification-modal-footer">
            <Button key="close" onClick={handleClosePreview} className="cancel-btn">
              Close
            </Button>
            <Button 
              key="navigate" 
              type="primary" 
              onClick={() => {
                handleClosePreview();
                handleNotificationClick(previewNotification);
              }}
              className="action-btn"
            >
              Go to Related Page
            </Button>
          </div>
        }
        width={500}
        centered
      >
        {previewNotification && (
          <div className="notification-detail">
            <div className="notification-detail-message">
              {previewNotification.message}
            </div>
            
            <div className="notification-detail-meta">
              <div className="meta-item">
                <ClockCircleOutlined className="meta-icon" /> 
                <span className="meta-label">Received:</span>
                <span className="meta-value">{moment(previewNotification.createdAt).format('MMMM Do YYYY, h:mm A')}</span>
              </div>
              <div className="meta-item">
                <CalendarOutlined className="meta-icon" /> 
                <span className="meta-label">Status:</span>
                <span className="meta-value status-badge">
                  {user?.seen_notification?.some(n => n._id === previewNotification._id) ? 
                    <span className="status-read">Read</span> : 
                    <span className="status-unread">Unread</span>
                  }
                </span>
              </div>
            </div>
          </div>
        )}
      </Modal>
    </Layout>
  );
};

export default NotificationPage;