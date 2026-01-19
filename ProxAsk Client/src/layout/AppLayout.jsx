import Navbar from "../components/Navbar/Navbar";
import Sidebar from "../components/Sidebar/Sidebar";
import { Outlet } from "react-router-dom";
import "./AppLayout.css";

const AppLayout = () => {
  return (
    <div className="appLayout">
      <Navbar />

      <div className="appBody">
        <Sidebar />
        <main className="appContent">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default AppLayout;
