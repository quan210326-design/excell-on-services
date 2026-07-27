import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
  LayoutDashboard, Settings, Users, Briefcase, Building2,
  CreditCard, PhoneCall, BarChart3, Package, LogOut, Activity, FileText
} from 'lucide-react';

const navItems = [
  { section: 'Tổng Quan', items: [
    { to: '/', label: 'Dashboard', icon: LayoutDashboard, allowedRoles: ['admin'] },
  ]},
  { section: 'Quản Lý', items: [
    { to: '/services', label: 'Dịch Vụ', icon: Settings, allowedRoles: ['admin', 'manager'] },
    { to: '/departments', label: 'Phòng Ban', icon: Building2, allowedRoles: ['admin', 'manager'] },
    { to: '/employees', label: 'Nhân Viên', icon: Users, allowedRoles: ['admin', 'manager'] },
  ]},
  { section: 'Khách Hàng', items: [
    { to: '/clients', label: 'Khách Hàng', icon: Briefcase, allowedRoles: ['admin', 'manager', 'staff'] },
    { to: '/client-services', label: 'Đăng Ký Dịch Vụ', icon: Activity, allowedRoles: ['admin', 'manager', 'staff'] },
    { to: '/client-products', label: 'Sản Phẩm Client', icon: Package, allowedRoles: ['admin', 'manager', 'staff'] },
    { to: '/client-procedures', label: 'Quy Trình Hỗ Trợ', icon: FileText, allowedRoles: ['admin', 'manager', 'staff'] },
  ]},

  { section: 'Tài Chính', items: [
    { to: '/payments', label: 'Thanh Toán', icon: CreditCard, allowedRoles: ['admin', 'manager'] },
    { to: '/call-logs', label: 'Call Logs', icon: PhoneCall, allowedRoles: ['admin', 'manager', 'staff'] },
    { to: '/reports', label: 'Báo Cáo', icon: BarChart3, allowedRoles: ['admin', 'manager'] },
  ]},
];

export default function Sidebar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => { logout(); navigate('/login'); };

  const filteredNavItems = navItems.map(group => {
    const items = group.items.filter(item => item.allowedRoles.includes(user?.role));
    return { ...group, items };
  }).filter(group => group.items.length > 0);

  return (
    <aside className="sidebar">
      <div className="sidebar-logo">
        <h1>⚡ ECS</h1>
        <p>Excell-On Consulting Services</p>
      </div>

      <nav className="sidebar-nav">
        {filteredNavItems.map(({ section, items }) => (
          <div key={section}>
            <div className="nav-section-title">{section}</div>
            {items.map(({ to, label, icon: Icon }) => (
              <NavLink
                key={to}
                to={to}
                end={to === '/'}
                className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}
              >
                <Icon size={18} />
                {label}
              </NavLink>
            ))}
          </div>
        ))}
      </nav>

      <div className="sidebar-footer">
        <div className="user-info">
          <div
            onClick={() => navigate('/profile')}
            style={{ display: 'flex', alignItems: 'center', gap: 10, flex: 1, cursor: 'pointer', minWidth: 0 }}
            title="Xem hồ sơ cá nhân"
          >
            <div className="user-avatar" style={{ transition: 'transform 0.15s' }}>
              {user?.full_name?.charAt(0) || 'U'}
            </div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div className="user-name" style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                {user?.full_name}
              </div>
              <div className="user-role" style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                <span>{user?.role}</span>
                <span style={{ fontSize: 10, opacity: 0.7 }}>• Profile ⚙️</span>
              </div>
            </div>
          </div>
          <button onClick={handleLogout} className="btn btn-icon btn-secondary" title="Đăng xuất">
            <LogOut size={15} />
          </button>
        </div>
      </div>
    </aside>
  );
}
