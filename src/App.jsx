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
import EditorLayout from './Pages/CoderEditor';
import EmailDashboardPage from './Pages/EmailHistoryPage';
import AdminSendEmail from "./Pages/SendEmail"
import ScriptStructure from "./Pages/ScriptStructure"

function App() {
  const location = useLocation();
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [isAdmin, setisAdmin] = useState(false)
  const [isApprover, setisApprover] = useState(false)
  const isLoginPage = location.pathname === '/login';
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
          const isAdminUser = updatedUser?.isAdmin;
          const isApproverUser = updatedUser?.isApprover;

          setisAdmin(isAdminUser);
          setisApprover(isApproverUser);

          // Save updated user roles
          localStorage.setItem('authToken', JSON.stringify(updatedUser));

          // Redirect unauthorized users trying to access /admin routes
          if (!isAdminUser && !isApproverUser) {
            navigate('/');
          }
        })
        .catch((err) => {
          console.error('Admin/Approver validation failed', err);
          // navigate('/'); // fallback redirect
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
            // isAdmin={isAdmin}
            // isApprover={isApprover}
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
            <Route path="/Code" element={<EditorLayout />} />
            <Route path="/admin" element={<AdminDashboard />} />
            <Route path="/adminRequests" element={<PendingApprovals />} />
            <Route path="/EmailHistory" element={<EmailDashboardPage />} />
            <Route path="/SendEmail" element={<AdminSendEmail />} />
            <Route path="/ScriptStructure" element={<ScriptStructure />} />
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
