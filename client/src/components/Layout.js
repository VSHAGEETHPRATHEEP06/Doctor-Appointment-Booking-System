import React from "react";
import "../styles/LayoutStyles.css";
import { adminMenu, userMenu } from "./../Data/data";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";
import { Badge, message } from "antd";

const Layout = ({ children }) => {
  const { user } = useSelector((state) => state.user);
  const location = useLocation();
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.clear();
    message.success("Logout Successfully");
    navigate("/login");
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
      path: `/doctor/profile/${user?._id}`,
      icon: "fa-solid fa-user",
    },
  ];

  const SidebarMenu = user?.isAdmin
    ? adminMenu
    : user?.isDoctor
    ? doctorMenu
    : userMenu;

    return (
      <div className="main">
        <div className="layout">
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
          <div className="content">
            <div className="header">
              <div className="header-content">
                <Badge
                  count={user && user.notification.length}
                  onClick={() => navigate("/notification")}
                  className="notification-badge"
                >
                  <i className="fa-solid fa-bell notification-icon"></i>
                </Badge>
                <div className="user-profile">
                  <span className="user-avatar">👤</span>
                  <Link to="/profile" className="user-name">{user?.name}</Link>
                </div>
              </div>
            </div>
            <div className="body">{children}</div>
          </div>
        </div>
      </div>
    );
  };
  
  export default Layout;