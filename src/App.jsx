import { Routes, Route, useLocation, useNavigate } from 'react-router-dom';
import { useEffect, useState } from 'react';
import LoginPage from './Auth/Login';
import Navbar from './Components/Navbar';
import Sidebar from './Components/Sidebar';
import FalloutDashboard from './Pages/FalloutDashboard';
import ScriptHistory from './Pages/ScriptHistory';
import ScriptManagerPage from './Pages/ScriptManagerPage';
import ScriptRunner from './Pages/ScriptRunner';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import SchedulerPage from "./Pages/ScriptScheduler";
import Dashboard from './Pages/Dashboard';
import AdminDashboard from './Pages/AdminDashboard';
import Logout from './Auth/Logout';
import { checkIfAdmin } from './services/auth/authServices';
import PendingApprovals from './Pages/PendingApprovals';
import Footer from '../src/Components/UI/Footer';

function App() {
  const location = useLocation();
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(true);

  const isLoginPage = location.pathname === '/login';

  useEffect(() => {
    const token = localStorage.getItem('authToken');
    if (!token && !isLoginPage) {
      navigate('/login');
    }
  }, [location, navigate]);

  useEffect(() => {
    const currentPath = location.pathname;
    const authToken = localStorage.getItem('authToken');

    if (!authToken) return;

    const parsed = JSON.parse(authToken);
    const cuid = parsed?.cuid;

    const isAdminRoute = currentPath.startsWith('/admin');

    if (isAdminRoute && cuid) {
      checkIfAdmin(cuid)
        .then((updatedUser) => {
          if (!updatedUser.isAdmin) {
            localStorage.setItem('authToken', JSON.stringify(updatedUser));
            navigate("/");
          } else {
            localStorage.setItem('authToken', JSON.stringify(updatedUser));
          }
        })
        .catch((err) => {
          console.error('Admin validation failed', err);
        });
    }
  }, [location.pathname, navigate]);

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      {/* Navbar */}
      {!isLoginPage && (
        <Navbar
          sidebarOpen={sidebarOpen}
          toggleSidebar={() => setSidebarOpen(!sidebarOpen)}
        />
      )}

      <div className="flex flex-1 overflow-hidden">
        {/* Sidebar */}
        {!isLoginPage && (
          <Sidebar
            isOpen={sidebarOpen}
            toggleSidebar={() => setSidebarOpen(!sidebarOpen)}
          />
        )}

        {/* Page Content */}
        <main
          className="flex-1 overflow-y-auto pt-14 px-3 pb-3 text-sm transition-all duration-300"
          style={{
            marginLeft: !isLoginPage ? (sidebarOpen ? '256px' : '64px') : 0,
          }}
        >
          <Routes>
            <Route path="/login" element={<LoginPage />} />
            <Route path="/" element={<Dashboard />} />
            <Route path="/history" element={<ScriptHistory />} />
            <Route path="/upload" element={<ScriptManagerPage />} />
            <Route path="/scriptRunner" element={<ScriptRunner />} />
            <Route path="/SchedulerPage" element={<SchedulerPage />} />
            <Route path="/admin" element={<AdminDashboard />} />
            <Route path="/adminRequests" element={<PendingApprovals />} />
            <Route path="/logout" element={<Logout />} />
          </Routes>
        </main>
      </div>

      {/* Footer - Not on login page */}
      {!isLoginPage && <Footer sidebarOpen={sidebarOpen} />
      }

      {/* Toast Notifications */}
      <ToastContainer
        position="bottom-right"
        autoClose={3000}
        hideProgressBar={false}
        newestOnTop
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
        theme="colored"
      />
    </div>
  );
}

export default App;
