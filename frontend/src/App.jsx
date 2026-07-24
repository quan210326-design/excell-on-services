import React, { useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider, useAuth } from './context/AuthContext';
import { CallProvider, useCall } from './context/CallContext';
import Sidebar from './components/Sidebar';
import VirtualCallWidget from './components/VirtualCallWidget';
import LoginPage from './pages/LoginPage';
import DashboardPage from './pages/DashboardPage';
import ServicesPage from './pages/ServicesPage';
import DepartmentsPage from './pages/DepartmentsPage';
import EmployeesPage from './pages/EmployeesPage';
import ClientsPage from './pages/ClientsPage';
import ClientDetailPage from './pages/ClientDetailPage';
import ClientServicesPage from './pages/ClientServicesPage';
import ClientProductsPage from './pages/ClientProductsPage';
import ClientProceduresPage from './pages/ClientProceduresPage';
import PaymentsPage from './pages/PaymentsPage';
import CallLogsPage from './pages/CallLogsPage';
import ReportsPage from './pages/ReportsPage';
import ProfilePage from './pages/ProfilePage';
import EmployeeDetailPage from './pages/EmployeeDetailPage';
import DepartmentDetailPage from './pages/DepartmentDetailPage';


function ProtectedLayout({ children }) {
  const { user, loading } = useAuth();

  if (loading) return <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100vh', fontSize: '18px' }}>Đang tải...</div>;
  if (!user) return <Navigate to="/login" replace />;
  return (
    <div className="app-layout">
      <Sidebar />
      <div className="main-content" style={{ marginLeft: '260px' }}>
        <div className="page-body">{children}</div>
      </div>
      <VirtualCallWidget />
    </div>
  );
}

function RoleProtectedRoute({ children, allowedRoles }) {
  const { user } = useAuth();
  if (!user) return <Navigate to="/login" replace />;
  if (!allowedRoles.includes(user.role)) {
    return (
      <div style={{ padding: '40px', textAlign: 'center', color: '#ef4444', background: '#1e293b', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.1)', marginTop: '40px' }}>
        <h3 style={{ fontSize: '20px', marginBottom: '10px', fontWeight: 600 }}>Access Denied</h3>
        <p style={{ color: '#94a3b8' }}>Bạn không có quyền truy cập trang này.</p>
      </div>
    );
  }
  return children;
}

function AppRoutes() {
  const { user } = useAuth();
  return (
    <Routes>
      <Route path="/login" element={user ? <Navigate to="/" /> : <LoginPage />} />
      <Route path="/" element={<ProtectedLayout><DashboardPage /></ProtectedLayout>} />
      <Route path="/services" element={<ProtectedLayout><RoleProtectedRoute allowedRoles={['admin', 'manager']}><ServicesPage /></RoleProtectedRoute></ProtectedLayout>} />
      <Route path="/departments" element={<ProtectedLayout><RoleProtectedRoute allowedRoles={['admin', 'manager']}><DepartmentsPage /></RoleProtectedRoute></ProtectedLayout>} />
      <Route path="/departments/:id" element={<ProtectedLayout><RoleProtectedRoute allowedRoles={['admin', 'manager']}><DepartmentDetailPage /></RoleProtectedRoute></ProtectedLayout>} />
      <Route path="/employees" element={<ProtectedLayout><RoleProtectedRoute allowedRoles={['admin', 'manager']}><EmployeesPage /></RoleProtectedRoute></ProtectedLayout>} />
      <Route path="/employees/:id" element={<ProtectedLayout><RoleProtectedRoute allowedRoles={['admin', 'manager']}><EmployeeDetailPage /></RoleProtectedRoute></ProtectedLayout>} />
      <Route path="/clients" element={<ProtectedLayout><RoleProtectedRoute allowedRoles={['admin', 'manager', 'staff']}><ClientsPage /></RoleProtectedRoute></ProtectedLayout>} />
      <Route path="/clients/:id" element={<ProtectedLayout><RoleProtectedRoute allowedRoles={['admin', 'manager', 'staff']}><ClientDetailPage /></RoleProtectedRoute></ProtectedLayout>} />
      <Route path="/client-services" element={<ProtectedLayout><RoleProtectedRoute allowedRoles={['admin', 'manager', 'staff']}><ClientServicesPage /></RoleProtectedRoute></ProtectedLayout>} />
      <Route path="/client-products" element={<ProtectedLayout><RoleProtectedRoute allowedRoles={['admin', 'manager', 'staff']}><ClientProductsPage /></RoleProtectedRoute></ProtectedLayout>} />
      <Route path="/client-procedures" element={<ProtectedLayout><RoleProtectedRoute allowedRoles={['admin', 'manager', 'staff']}><ClientProceduresPage /></RoleProtectedRoute></ProtectedLayout>} />
      <Route path="/payments" element={<ProtectedLayout><RoleProtectedRoute allowedRoles={['admin', 'manager']}><PaymentsPage /></RoleProtectedRoute></ProtectedLayout>} />
      <Route path="/call-logs" element={<ProtectedLayout><RoleProtectedRoute allowedRoles={['admin', 'manager', 'staff']}><CallLogsPage /></RoleProtectedRoute></ProtectedLayout>} />
      <Route path="/reports" element={<ProtectedLayout><RoleProtectedRoute allowedRoles={['admin', 'manager']}><ReportsPage /></RoleProtectedRoute></ProtectedLayout>} />
      <Route path="/profile" element={<ProtectedLayout><ProfilePage /></ProtectedLayout>} />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <CallProvider>
          <AppRoutes />
          <Toaster position="top-right" toastOptions={{
            style: { background: '#1e293b', color: '#f1f5f9', border: '1px solid rgba(255,255,255,0.1)' },
            success: { iconTheme: { primary: '#10b981', secondary: '#fff' } },
            error: { iconTheme: { primary: '#ef4444', secondary: '#fff' } }
          }} />
        </CallProvider>
      </BrowserRouter>
    </AuthProvider>
  );
}
