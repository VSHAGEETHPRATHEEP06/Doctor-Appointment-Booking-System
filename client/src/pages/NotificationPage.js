// import React from "react";
// import Layout from "./../components/Layout";
// import { message, Tabs } from "antd";
// import { useSelector, useDispatch } from "react-redux";
// import { showLoading, hideLoading } from "../redux/features/alertSlice";
// import { useNavigate } from "react-router-dom";
// import axios from "axios";

// const NotificationPage = () => {
//   const dispatch = useDispatch();
//   const navigate = useNavigate();
//   const { user } = useSelector((state) => state.user);
//   //   handle read notification
//   const handleMarkAllRead = async () => {
//     try {
//       dispatch(showLoading());
//       const res = await axios.post(
//         "/api/v1/user/get-all-notification",
//         {
//           userId: user._id,
//         },
//         {
//           headers: {
//             Authorization: `Bearer ${localStorage.getItem("token")}`,
//           },
//         }
//       );
//       dispatch(hideLoading());
//       if (res.data.success) {
//         message.success(res.data.message);
//       } else {
//         message.error(res.data.message);
//       }
//     } catch (error) {
//       dispatch(hideLoading());
//       console.log(error);
//       message.error("something went wrong");
//     }
//   };

//   // delete notifications
//   const handleDeleteAllRead = async () => {
//     try {
//       dispatch(showLoading());
//       const res = await axios.post(
//         "/api/v1/user/delete-all-notification",
//         { userId: user._id },
//         {
//           headers: {
//             Authorization: `Bearer ${localStorage.getItem("token")}`,
//           },
//         }
//       );
//       dispatch(hideLoading());
//       if (res.data.success) {
//         message.success(res.data.message);
//       } else {
//         message.error(res.data.message);
//       }
//     } catch (error) {
//       dispatch(hideLoading());
//       console.log(error);
//       message.error("Something Went Wrong In Notifications");
//     }
//   };
//   return (
//     <Layout>
//       <h4 className="p-3 text-center">Notification Page</h4>
//       <Tabs>
//         <Tabs.TabPane tab="unRead" key={0}>
//           <div className="d-flex justify-content-end">
//             <h4 className="p-2" onClick={handleMarkAllRead}>
//               Mark All Read
//             </h4>
//           </div>
//           {user?.notification.map((notificationMgs) => (
//             <div className="card" style={{ cursor: "pointer" }}>
//               <div
//                 className="card-text"
//                 onClick={() => navigate(notificationMgs.onClickPath)}
//               >
//                 {notificationMgs.message}
//               </div>
//             </div>
//           ))}
//         </Tabs.TabPane>
//         <Tabs.TabPane tab="Read" key={1}>
//           <div className="d-flex justify-content-end">
//             <h4
//               className="p-2 text-primary"
//               style={{ cursor: "pointer" }}
//               onClick={handleDeleteAllRead}
//             >
//               Delete All Read
//             </h4>
//           </div>
//           {user?.seen_notification.map((notificationMgs) => (
//             <div className="card" style={{ cursor: "pointer" }}>
//               <div
//                 className="card-text"
//                 onClick={() => navigate(notificationMgs.onClickPath)}
//               >
//                 {notificationMgs.message}
//               </div>
//             </div>
//           ))}
//         </Tabs.TabPane>
//       </Tabs>
//     </Layout>
//   );
// };

// export default NotificationPage;


import "../styles/Notification.css"
import React from "react";
import Layout from "./../components/Layout";
import { message, Tabs, List, Button, Tag, Card } from "antd";
import { useSelector, useDispatch } from "react-redux";
import { showLoading, hideLoading } from "../redux/features/alertSlice";
import { useNavigate } from "react-router-dom";
import "../styles/Notification.css";
import axios from "axios";
import { 
  BellOutlined, 
  CheckCircleOutlined, 
  DeleteOutlined, 
  CheckOutlined 
} from "@ant-design/icons";

const NotificationPage = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { user } = useSelector((state) => state.user);

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
                onClick={() => navigate(notification.onClickPath)}
              >
                <List.Item.Meta
                  avatar={<BellOutlined className="notification-icon" />}
                  title={
                    <span className="notification-message">
                      {notification.message}
                    </span>
                  }
                  description={
                    <span className="notification-time">
                      {new Date(notification.createdAt).toLocaleString()}
                    </span>
                  }
                />
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
                onClick={() => navigate(notification.onClickPath)}
              >
                <List.Item.Meta
                  avatar={<CheckCircleOutlined className="notification-icon" />}
                  title={
                    <span className="notification-message">
                      {notification.message}
                    </span>
                  }
                  description={
                    <span className="notification-time">
                      {new Date(notification.createdAt).toLocaleString()}
                    </span>
                  }
                />
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
    </Layout>
  );
};

export default NotificationPage;