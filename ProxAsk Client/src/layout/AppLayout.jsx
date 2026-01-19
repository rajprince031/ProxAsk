import { useState } from "react";
import { Outlet } from "react-router-dom";
import Navbar from "../components/Navbar/Navbar";
import Sidebar from "../components/Sidebar/Sidebar";
import AskQuestionModal from "../components/AskQuestionModal/AskQuestionModal";
import "./AppLayout.css";

const AppLayout = () => {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);
  const [showAskModal, setShowAskModal] = useState(false);

  return (
    <div className="dashboardRoot">
      <Navbar onMenuClick={() => setMobileSidebarOpen(prev => !prev)} />

      <Sidebar
        collapsed={sidebarCollapsed}
        onToggle={() => setSidebarCollapsed(!sidebarCollapsed)}
        mobileOpen={mobileSidebarOpen}
        onMobileClose={() => setMobileSidebarOpen(false)}
        onAskQuestion={() => setShowAskModal(true)}
      />

      <main
        className={`dashboardContent ${
          sidebarCollapsed ? "collapsed" : ""
        }`}
      >
        <Outlet />
      </main>

      <AskQuestionModal
        isOpen={showAskModal}
        onClose={() => setShowAskModal(false)}
      />
    </div>
  );
};

export default AppLayout;
