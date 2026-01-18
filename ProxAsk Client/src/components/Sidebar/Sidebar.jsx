import React from "react";
import {
  FaHome,
  FaCompass,
  FaEnvelope,
  FaBell,
  FaUsers,
  FaUser,
  FaCog,
  FaShieldAlt,
  FaQuestionCircle,
} from "react-icons/fa";
import "./Sidebar.css";

const Sidebar = ({
  collapsed,
  onToggle,
  mobileOpen,
  onMobileClose,
}) => {
  const isAdmin = true; // role-based later

  return (
    <>
      {/* Overlay for mobile */}
      {mobileOpen && <div className="sidebarOverlay" onClick={onMobileClose} />}

      <aside
        className={`sidebarContainer
          ${collapsed ? "collapsed" : ""}
          ${mobileOpen ? "mobileOpen" : ""}
        `}
      >
        {/* Collapse button */}
        <div className="sidebarTop">
          <button className="collapseBtn" onClick={onToggle}>
            ⇄
          </button>
        </div>

        {/* Navigation */}
        <nav className="sidebarNav">
          <SidebarItem icon={<FaHome />} label="Home" collapsed={collapsed} />
          <SidebarItem icon={<FaCompass />} label="Explore" collapsed={collapsed} />
          <SidebarItem icon={<FaEnvelope />} label="Messages" collapsed={collapsed} />
          <SidebarItem icon={<FaBell />} label="Notifications" collapsed={collapsed} />
          <SidebarItem icon={<FaUsers />} label="Followers" collapsed={collapsed} />
          <SidebarItem icon={<FaUser />} label="Profile" collapsed={collapsed} />
          <SidebarItem icon={<FaCog />} label="Settings" collapsed={collapsed} />
          {isAdmin && (
            <SidebarItem
              icon={<FaShieldAlt />}
              label="Admin"
              collapsed={collapsed}
              admin
            />
          )}
        </nav>

        {/* Ask Question */}
        <div className="sidebarFooter">
          <button className="askQuestionBtn">
            <FaQuestionCircle />
            {!collapsed && <span>Ask Question</span>}
          </button>
        </div>
      </aside>
    </>
  );
};

const SidebarItem = ({ icon, label, collapsed, admin }) => {
  return (
    <div className={`sidebarItem ${admin ? "adminItem" : ""}`}>
      <div className="sidebarIcon">{icon}</div>
      {!collapsed && <span className="sidebarLabel">{label}</span>}
    </div>
  );
};

export default Sidebar;
