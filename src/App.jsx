import { Routes, Route, useLocation } from 'react-router-dom';
import { useState } from 'react';
import LoginPage from './Auth/Login';
import Navbar from './Components/Navbar';
import Sidebar from './Components/Sidebar';
import FalloutDashboard from './Pages/FalloutDashboard';
import ScriptHistory from './Pages/ScriptHistory';
import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import ScriptUploader from './Pages/ScriptUploader';
import ScriptRunner from './Pages/ScriptRunner';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import SchedulerPage from "./Pages/ScriptScheduler"

function App() {
  const location = useLocation();
  const isLoginPage = location.pathname === '/login';
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem('authToken'); // or 'isLoggedIn'
    const isLoginPage = location.pathname === '/login';

    if (!token && !isLoginPage) {
      navigate('/login');
    }
  }, [location, navigate]);

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      {!isLoginPage && (
        <Navbar
          sidebarOpen={sidebarOpen}
          toggleSidebar={() => setSidebarOpen(!sidebarOpen)}
        />
      )}

      <div className="flex flex-1 overflow-hidden">
        {!isLoginPage && (
          <Sidebar
            isOpen={sidebarOpen}
            toggleSidebar={() => setSidebarOpen(!sidebarOpen)}
          />
        )}

        <main
          className="flex-1 overflow-y-auto pt-14 px-3 pb-3 text-sm transition-all duration-300"
          style={{
            marginLeft: !isLoginPage ? (sidebarOpen ? '256px' : '64px') : 0,
          }}
        >
          {/* ⛳️ Always render routes, even on login page */}
          <Routes>
            <Route path="/login" element={<LoginPage />} />
            <Route path="/" element={<FalloutDashboard />} />
            <Route path="/history" element={<ScriptHistory />} />
            <Route path="/upload" element={<ScriptUploader />} />
            <Route path="/scriptRunner" element={<ScriptRunner />} />
            <Route path="/SchedulerPage" element={<SchedulerPage />} />

          </Routes>
        </main>
      </div>
      <ToastContainer
        position="bottom-right"
        autoClose={3000}
        hideProgressBar={false}
        newestOnTop={true}
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
