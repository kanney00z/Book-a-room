/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { DataProvider, useData } from './lib/DataContext';
import { useState } from 'react';
import AdminLayout from './components/AdminLayout';
import PublicBooking from './pages/PublicBooking';
import AdminDashboard from './pages/AdminDashboard';
import AdminRooms from './pages/AdminRooms';
import AdminBilling from './pages/AdminBilling';
import AdminMaintenance from './pages/AdminMaintenance';
import Login from './pages/Login';
import TenantLogin from './pages/TenantLogin';
import TenantDashboard from './pages/TenantDashboard';

function ConfigWarning() {
  const { isConfigured } = useData();
  if (isConfigured) return null;
  return (
    <div className="bg-rose-500 text-white p-3 text-center text-sm font-medium z-50 fixed bottom-0 left-0 w-full shadow-lg">
      ⚠️ ระบบยังไม่ได้เชื่อมต่อฐานข้อมูล กรุณาตั้งค่า VITE_SUPABASE_URL และ VITE_SUPABASE_ANON_KEY ใน Secrets 
    </div>
  );
}

export default function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(localStorage.getItem('isAdminAuth') === 'true');

  const handleLogin = () => {
    localStorage.setItem('isAdminAuth', 'true');
    setIsLoggedIn(true);
  };

  const handleLogout = () => {
    localStorage.removeItem('isAdminAuth');
    setIsLoggedIn(false);
  };

  return (
    <DataProvider>
      <ConfigWarning />
      <Router>
        <Routes>
          <Route path="/" element={<PublicBooking />} />
          <Route path="/login" element={isLoggedIn ? <Navigate to="/admin" replace /> : <Login onLogin={handleLogin} />} />
          
          <Route path="/tenant/login" element={<TenantLogin onLogin={(roomId) => localStorage.setItem('tenantRoomId', roomId)} />} />
          <Route path="/tenant/dashboard" element={<TenantDashboard />} />

          <Route path="/admin" element={isLoggedIn ? <AdminLayout onLogout={handleLogout} /> : <Navigate to="/login" replace />}>
            <Route index element={<Navigate to="/admin/dashboard" replace />} />
            <Route path="dashboard" element={<AdminDashboard />} />
            <Route path="rooms" element={<AdminRooms />} />
            <Route path="billing" element={<AdminBilling />} />
            <Route path="maintenance" element={<AdminMaintenance />} />
          </Route>
        </Routes>
      </Router>
    </DataProvider>
  );
}
