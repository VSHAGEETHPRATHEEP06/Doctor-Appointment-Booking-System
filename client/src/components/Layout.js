// Layout.js
import React, { useState, useEffect } from "react";
import "../styles/LayoutStyles.css";
import { adminMenu, userMenu } from "./../Data/data";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";
import { Badge, message, Drawer, notification } from "antd";
import { MenuOutlined, CloseOutlined, BellOutlined } from "@ant-design/icons";
import AppointmentNotification from "./AppointmentNotification";

const Layout = ({ children }) => {
  const { user } = useSelector((state) => state.user);
  const location = useLocation();
  const navigate = useNavigate();
  const [isMobile, setIsMobile] = useState(false);
  const [sidebarVisible, setSidebarVisible] = useState(false);
  const [api, contextHolder] = notification.useNotification();

  const handleLogout = () => {
    localStorage.clear();
    message.success("Logout Successfully");
    navigate("/login");
  };

  // Function to handle notification clicks and display enhanced notification details
  const openNotification = (notificationItem) => {
    const { message, data } = notificationItem;
    
    // Determine notification type based on the message content
    let notificationType = 'info';
    if (message.toLowerCase().includes('approved')) notificationType = 'success';
    if (message.toLowerCase().includes('cancel') || message.toLowerCase().includes('reject')) notificationType = 'error';
    if (message.toLowerCase().includes('update') || message.toLowerCase().includes('reschedul')) notificationType = 'warning';
    
    // Prepare appointment info from notification data
    const appointmentInfo = data?.appointmentInfo ? {
      doctorName: `${data.appointmentInfo.doctorName || 'Unknown'}`,
      date: data.appointmentInfo.date,
      time: data.appointmentInfo.time,
      status: data.appointmentInfo.status,
      modifiedBy: data.appointmentInfo.modifiedBy
    } : null;
    
    // Prepare modification details if available
    const modificationDetails = data?.modificationDetails ? {
      previousDate: data.modificationDetails.previousDate,
      previousTime: data.modificationDetails.previousTime,
      previousStatus: data.modificationDetails.previousStatus,
      newDate: data.modificationDetails.newDate,
      newTime: data.modificationDetails.newTime,
      newStatus: data.modificationDetails.newStatus
    } : null;
    
    api.open({
      message: notificationItem.message,
      description: (
        <AppointmentNotification 
          notification={{
            message: notificationItem.message,
            appointmentInfo,
            modificationDetails
          }}
          type={notificationType}
        />
      ),
      placement: 'topRight',
      duration: 5,
      icon: <BellOutlined style={{ color: notificationType === 'success' ? '#52c41a' : 
                                  notificationType === 'warning' ? '#faad14' : 
                                  notificationType === 'error' ? '#f5222d' : '#1890ff' }} />,
      style: {
        borderRadius: '8px',
        boxShadow: '0 3px 6px rgba(0,0,0,0.1)'
      }
    });
  };

  const doctorMenu = [
    {
      name: "Home",
      path: "/",
      icon: "fa-solid fa-house",
    },
    {
      name: "Appointments",
      path: "/doctor-appointments",
      icon: "fa-solid fa-list",
    },
    {
      name: "Profile",
      path: "/doctor/profile",
      icon: "fa-solid fa-user",
    },
  ];

  const SidebarMenu = user?.isAdmin
    ? adminMenu
    : user?.isDoctor
    ? doctorMenu
    : userMenu;

  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth <= 768);
    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  const toggleSidebar = () => setSidebarVisible(!sidebarVisible);

  const getProfilePath = () => {
    if (user?.isAdmin) return "/admin/profile";
    if (user?.isDoctor) return "/doctor/profile";
    return "/user/profile";
  };

  const getUserRole = () => {
    if (user?.isAdmin) return "Admin";
    if (user?.isDoctor) return "Doctor";
    return "User";
  };

  return (
    <div className="main">
      <div className="layout">
        {/* Mobile Header */}
        {isMobile && (
          <div className="mobile-header">
            <MenuOutlined className="hamburger-icon" onClick={toggleSidebar} />
            <div className="mobile-logo">DOC APP</div>
            <div className="mobile-user">
              <Badge
                count={user?.notification?.length || 0}
                onClick={() => navigate("/notification")}
              >
                <i className="fa-solid fa-bell notification-icon"></i>
              </Badge>
            </div>
          </div>
        )}

        {/* Mobile Sidebar Drawer */}
        {isMobile && (
          <Drawer
            placement="left"
            closable={false}
            onClose={toggleSidebar}
            open={sidebarVisible}
            styles={{ body: { padding: 0, background: '#000' } }}
            width="280px"
          >
            <div className="sidebar-mobile">
              <div className="mobile-sidebar-header">
                <CloseOutlined onClick={toggleSidebar} className="close-icon" />
              </div>
              <div className="menu">
                {SidebarMenu.map((menu) => {
                  const isActive = location.pathname === menu.path;
                  return (
                    <div 
                      className={`menu-item ${isActive && "active"}`} 
                      key={menu.path}
                      onClick={toggleSidebar}
                    >
                      <i className={menu.icon}></i>
                      <Link to={menu.path}>{menu.name}</Link>
                      {isActive && <div className="active-indicator"></div>}
                    </div>
                  );
                })}
                <div className="menu-item logout-item" onClick={handleLogout}>
                  <i className="fa-solid fa-right-from-bracket"></i>
                  <Link to="/login">Logout</Link>
                </div>
              </div>
            </div>
          </Drawer>
        )}

        {/* Desktop Sidebar */}
        {!isMobile && (
          <div className="sidebar">
            <div className="logo">
              <div className="logo-container">
                <span className="logo-icon">🏥</span>
                <h6 className="logo-text">DOC APP</h6>
              </div>
              <hr className="divider" />
            </div>
            <div className="menu">
              {SidebarMenu.map((menu) => {
                const isActive = location.pathname === menu.path;
                return (
                  <div 
                    className={`menu-item ${isActive && "active"}`} 
                    key={menu.path}
                  >
                    <i className={menu.icon}></i>
                    <Link to={menu.path}>{menu.name}</Link>
                    {isActive && <div className="active-indicator"></div>}
                  </div>
                );
              })}
              <div className="menu-item logout-item" onClick={handleLogout}>
                <i className="fa-solid fa-right-from-bracket"></i>
                <Link to="/login">Logout</Link>
              </div>
            </div>
          </div>
        )}

        <div className="content">
          {/* Desktop Header */}
          {!isMobile && (
            <div className="header">
              <div className="header-content">
                <Badge
                  count={user?.notification?.length || 0}
                  onClick={() => navigate("/notification")}
                  className="notification-badge"
                >
                  <i className="fa-solid fa-bell notification-icon"></i>
                </Badge>
                <div className="user-profile">
                  <span className="user-avatar">👤</span>
                  <Link 
                    to={getProfilePath()}
                    className="user-name"
                  >
                    {user?.name} 
                    <span 
                      className={`user-role ${
                        user?.isAdmin 
                          ? 'role-admin' 
                          : user?.isDoctor 
                          ? 'role-doctor' 
                          : 'role-user'
                      }`}
                    >
                      ({getUserRole()})
                    </span>
                  </Link>
                </div>
              </div>
            </div>
          )}

          <div className="body">{children}</div>
        </div>
      </div>
      {contextHolder}
    </div>
  );
};

export default Layout;