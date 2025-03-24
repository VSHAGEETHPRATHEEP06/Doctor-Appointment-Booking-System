import React from 'react';
import { Alert, Space, Typography, Badge, Tag } from 'antd';
import { BellOutlined, HistoryOutlined, ClockCircleOutlined, CalendarOutlined, UserOutlined, MedicineBoxOutlined } from '@ant-design/icons';
import moment from 'moment';

const { Text, Paragraph } = Typography;

/**
 * Component to display detailed appointment notifications with modification details
 * @param {Object} props - Component props
 * @param {Object} props.notification - Notification object containing message and details
 * @param {string} props.type - Type of notification (success, info, warning, error)
 */
const AppointmentNotification = ({ notification, type = 'info' }) => {
  if (!notification) return null;

  // Extract notification details if present
  const { message, appointmentInfo, modificationDetails } = notification;
  
  // Handle different types of notifications
  const getNotificationIcon = () => {
    switch (type) {
      case 'success':
        return <BellOutlined style={{ color: '#52c41a' }} />;
      case 'warning':
        return <BellOutlined style={{ color: '#faad14' }} />;
      case 'error':
        return <BellOutlined style={{ color: '#f5222d' }} />;
      default:
        return <BellOutlined style={{ color: '#1890ff' }} />;
    }
  };

  // Get status display for an appointment
  const getStatusDisplay = (status) => {
    const statusMap = {
      pending: { color: '#f59e0b', text: 'PENDING' },
      approved: { color: '#000000', text: 'APPROVED' },
      rejected: { color: '#800000', text: 'REJECTED' },
      completed: { color: '#3182ce', text: 'COMPLETED' },
      rescheduled: { color: '#3498db', text: 'RESCHEDULED' },
      'updated-by-doctor': { color: '#8e44ad', text: 'UPDATED BY DOCTOR' },
      reject: { color: '#800000', text: 'REJECTED' },
    };
    
    const statusInfo = statusMap[status?.toLowerCase()] || { color: '#888', text: status?.toUpperCase() };
    
    return (
      <Tag color={statusInfo.color} style={{ margin: 0 }}>
        {statusInfo.text}
      </Tag>
    );
  };

  return (
    <Alert
      type={type}
      showIcon
      icon={getNotificationIcon()}
      message={
        <div style={{ fontWeight: 600 }}>
          {message}
        </div>
      }
      description={
        <Space direction="vertical" style={{ width: '100%' }}>
          {appointmentInfo && (
            <div style={{ 
              background: '#f9f9f9', 
              padding: '10px 15px', 
              borderRadius: '6px',
              marginTop: '5px',
              marginBottom: '5px',
              border: '1px solid #eee'
            }}>
              <Space direction="vertical" size={2} style={{ width: '100%' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <Space>
                    <MedicineBoxOutlined />
                    <Text strong>
                      Dr. {appointmentInfo.doctorName}
                    </Text>
                  </Space>
                  {appointmentInfo.status && (
                    <div>{getStatusDisplay(appointmentInfo.status)}</div>
                  )}
                </div>
                
                <Space>
                  <CalendarOutlined />
                  <Text>{appointmentInfo.date && moment(appointmentInfo.date, "DD-MM-YYYY").format("DD MMM YYYY")}</Text>
                  <ClockCircleOutlined />
                  <Text>{appointmentInfo.time && moment(appointmentInfo.time, "HH:mm").format("hh:mm A")}</Text>
                </Space>
                
                {appointmentInfo.modifiedBy && (
                  <Space>
                    <UserOutlined />
                    <Text type="secondary">
                      Last modified by {appointmentInfo.modifiedBy === 'doctor' ? 'doctor' : 'you'}
                    </Text>
                  </Space>
                )}
              </Space>
            </div>
          )}
          
          {modificationDetails && (
            <div style={{ 
              background: '#f9f9f9', 
              padding: '12px 15px', 
              borderRadius: '6px',
              marginTop: '5px',
              border: '1px solid #eee'
            }}>
              <Space style={{ marginBottom: '8px' }}>
                <HistoryOutlined />
                <Text strong>Modification Details</Text>
              </Space>
              
              <div style={{ display: 'flex', justifyContent: 'space-between', gap: '10px', flexWrap: 'wrap' }}>
                <div style={{ flex: 1, minWidth: '45%' }}>
                  <Text type="secondary">Previous</Text>
                  <div style={{ background: '#f5f5f5', padding: '8px', borderRadius: '4px', marginTop: '4px' }}>
                    <div><CalendarOutlined /> <Text>{modificationDetails.previousDate}</Text></div>
                    <div><ClockCircleOutlined /> <Text>{modificationDetails.previousTime && moment(modificationDetails.previousTime, "HH:mm").format("hh:mm A")}</Text></div>
                    <div>{getStatusDisplay(modificationDetails.previousStatus)}</div>
                  </div>
                </div>
                
                <div style={{ flex: 1, minWidth: '45%' }}>
                  <Text type="secondary">Updated</Text>
                  <div style={{ background: '#f5f5f5', padding: '8px', borderRadius: '4px', marginTop: '4px' }}>
                    <div><CalendarOutlined /> <Text>{modificationDetails.newDate}</Text></div>
                    <div><ClockCircleOutlined /> <Text>{modificationDetails.newTime && moment(modificationDetails.newTime, "HH:mm").format("hh:mm A")}</Text></div>
                    <div>{getStatusDisplay(modificationDetails.newStatus)}</div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </Space>
      }
      style={{ 
        marginBottom: '16px',
        borderRadius: '8px',
        boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
      }}
    />
  );
};

export default AppointmentNotification;