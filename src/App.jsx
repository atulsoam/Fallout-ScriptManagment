import { Routes, Route, useLocation } from 'react-router-dom';
import { useState } from 'react';
import LoginPage from './Auth/Login';
import Navbar from './Components/Navbar';
import Sidebar from './Components/Sidebar';
import Dashboard from './Pages/Dashboard';
import FalloutDashboard from './Pages/FalloutDashboard';

function App() {
  const location = useLocation();
  const isLoginPage = location.pathname === '/login';

  const [sidebarOpen, setSidebarOpen] = useState(true);

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <Navbar sidebarOpen={sidebarOpen} toggleSidebar={() => setSidebarOpen(!sidebarOpen)} />

      <div className="flex flex-1 overflow-hidden">
        {!isLoginPage && (
          <Sidebar isOpen={sidebarOpen} toggleSidebar={() => setSidebarOpen(!sidebarOpen)} />
        )}

        <main
          className="flex-1 overflow-y-auto pt-14 px-3 pb-3 text-sm transition-all duration-300"
          style={{
            marginLeft: !isLoginPage ? (sidebarOpen ? '256px' : '64px') : 0,
          }}
        >


          <Routes>
            <Route path="/login" element={<LoginPage />} />
            <Route path="/" element={<FalloutDashboard />} />
            {/* Add other routes here */}
          </Routes>
        </main>
      </div>
    </div>
  );
}


export default App;
