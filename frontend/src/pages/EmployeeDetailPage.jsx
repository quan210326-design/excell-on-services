import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { employeesApi, callLogsApi } from '../api';
import { Badge, Loading, TabNav } from '../components/UI';
import { ArrowLeft, Mail, Phone, Calendar, Shield, DollarSign, Clock, Briefcase, PhoneCall, User, Activity } from 'lucide-react';
import toast from 'react-hot-toast';

export default function EmployeeDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [activeTab, setActiveTab] = useState('overview');
  const [employee, setEmployee] = useState(null);
  const [callLogs, setCallLogs] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchAll = async () => {
    try {
      const [eRes, clRes] = await Promise.all([
        employeesApi.getById(id),
        callLogsApi.getAll({ employee_id: id }).catch(err => { console.error(err); return { data: [] }; })
      ]);
      setEmployee(eRes.data);
      setCallLogs(clRes.data);
    } catch {
      toast.error('Lỗi tải dữ liệu nhân viên');
    }
  };

  useEffect(() => {
    const initFetch = async () => {
      setLoading(true);
      await fetchAll();
      setLoading(false);
    };
    initFetch();
  }, [id]);

  if (loading) return <Loading />;
  if (!employee) return <div style={{ padding: 40, color: 'var(--danger)' }}>Không tìm thấy nhân viên.</div>;

  const tabs = [
    { key: 'overview', label: 'Tổng Quan', icon: '📋' },
    { key: 'calllogs', label: 'Call Logs', icon: '📞', count: callLogs.length },
  ];

  return (
    <div>
      {/* Back button */}
      <div style={{ marginBottom: 16 }}>
        <button className="btn btn-secondary" onClick={() => navigate('/employees')}>
          <ArrowLeft size={15} /> Quay lại danh sách
        </button>
      </div>

      {/* Employee Header Card */}
      <div className="detail-header-card" style={{ marginBottom: 24 }}>
        <div className="detail-avatar" style={{ background: 'var(--accent)', color: '#fff' }}>
          {employee.first_name?.charAt(0)?.toUpperCase()}
        </div>
        <div style={{ flex: 1 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 4 }}>
            <h2 style={{ fontSize: 22, fontWeight: 800 }}>{employee.last_name} {employee.first_name}</h2>
            <Badge status={employee.status} />
          </div>
          <div style={{ color: 'var(--text-muted)', fontSize: 13, marginBottom: 12 }}>
            {employee.emp_code} · {employee.designation}
          </div>
          <div className="detail-meta">
            <div className="detail-meta-item">
              <label><Mail size={11} style={{ display: 'inline', marginRight: 3 }} />Email</label>
              <span>{employee.email}</span>
            </div>
            <div className="detail-meta-item">
              <label><Phone size={11} style={{ display: 'inline', marginRight: 3 }} />Điện Thoại</label>
              <span>{employee.phone || '-'}</span>
            </div>
            <div className="detail-meta-item">
              <label><Briefcase size={11} style={{ display: 'inline', marginRight: 3 }} />Phòng Ban</label>
              <span>{employee.department?.name || '-'}</span>
            </div>
            {employee.service && (
              <div className="detail-meta-item">
                <label><Activity size={11} style={{ display: 'inline', marginRight: 3 }} />Dịch Vụ Phụ Trách</label>
                <span>{employee.service.name}</span>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Stats Row */}
      <div className="stats-row" style={{ marginBottom: 24 }}>
        <div className="mini-stat blue">
          <div className="ms-value">{employee.designation}</div>
          <div className="ms-label">Chức Danh</div>
        </div>
        <div className="mini-stat green">
          <div className="ms-value">{employee.salary ? `$${Number(employee.salary).toLocaleString()}` : '-'}</div>
          <div className="ms-label">Lương Tháng</div>
        </div>
        <div className="mini-stat cyan">
          <div className="ms-value">{callLogs.length}</div>
          <div className="ms-label">Cuộc Gọi Đã Thực Hiện</div>
        </div>
        <div className="mini-stat yellow">
          <div className="ms-value">{employee.join_date ? new Date(employee.join_date).toLocaleDateString('vi-VN') : '-'}</div>
          <div className="ms-label">Ngày Vào Làm</div>
        </div>
      </div>

      {/* Tabs */}
      <TabNav tabs={tabs} active={activeTab} onChange={setActiveTab} />

      {/* Tab: Overview */}
      {activeTab === 'overview' && (
        <div className="grid-2">
          {/* Personal & Work info */}
          <div className="card">
            <h3 style={{ marginBottom: 16, fontSize: 14, fontWeight: 600 }}>📋 Thông Tin Chi Tiết Hồ Sơ</h3>
            {[
              { label: 'Mã Nhân Viên', value: employee.emp_code },
              { label: 'Họ Tên', value: `${employee.last_name} ${employee.first_name}` },
              { label: 'Chức Danh', value: employee.designation },
              { label: 'Phòng Ban', value: employee.department?.name ? `${employee.department.name} (${employee.department.code})` : '-' },
              { label: 'Dịch Vụ Phụ Trách', value: employee.service?.name ? `${employee.service.name} (${employee.service.type})` : 'Không có' },
              { label: 'Email', value: employee.email },
              { label: 'Điện Thoại', value: employee.phone || '-' },
              { label: 'Lương', value: employee.salary ? `$${Number(employee.salary).toLocaleString()}` : '-' },
              { label: 'Ngày Vào Làm', value: employee.join_date ? new Date(employee.join_date).toLocaleDateString('vi-VN') : '-' },
              { label: 'Trạng Thái Nhân Sự', value: <Badge status={employee.status} /> },
            ].map(({ label, value }) => (
              <div key={label} style={{ display: 'flex', justifyContent: 'space-between', padding: '10px 0', borderBottom: '1px solid var(--border)' }}>
                <span style={{ color: 'var(--text-muted)', fontSize: 13 }}>{label}</span>
                <span style={{ fontWeight: 500, fontSize: 13 }}>{value}</span>
              </div>
            ))}
          </div>

          {/* User Account info */}
          <div className="card">
            <h3 style={{ marginBottom: 16, fontSize: 14, fontWeight: 600 }}>🔑 Tài Khoản Hệ Thống</h3>
            {employee.user ? (
              <div>
                {[
                  { label: 'ID Tài Khoản', value: employee.user.id },
                  { label: 'Tên Đăng Nhập', value: <strong>@{employee.user.username}</strong> },
                  { label: 'Vai Trò', value: <Badge status={employee.user.role} /> },
                  { label: 'Trạng Thái Tài Khoản', value: employee.user.is_active ? <span style={{ color: 'var(--success)', fontWeight: 600 }}>Active</span> : <span style={{ color: 'var(--danger)', fontWeight: 600 }}>Locked</span> },
                  { label: 'Đăng nhập cuối', value: employee.user.last_login ? new Date(employee.user.last_login).toLocaleString('vi-VN') : 'Chưa từng đăng nhập' },
                ].map(({ label, value }) => (
                  <div key={label} style={{ display: 'flex', justifyContent: 'space-between', padding: '10px 0', borderBottom: '1px solid var(--border)' }}>
                    <span style={{ color: 'var(--text-muted)', fontSize: 13 }}>{label}</span>
                    <span style={{ fontWeight: 500, fontSize: 13 }}>{value}</span>
                  </div>
                ))}
              </div>
            ) : (
              <div style={{ textAlign: 'center', padding: '40px 0', color: 'var(--text-secondary)', fontSize: 13 }}>
                <User size={32} style={{ opacity: 0.3, marginBottom: 8 }} />
                <p>Nhân viên này chưa được cấp tài khoản đăng nhập hệ thống.</p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Tab: Call Logs */}
      {activeTab === 'calllogs' && (
        <div className="table-container">
          <div className="table-header"><h3>Lịch Sử Cuộc Gọi Đã Xử Lý ({callLogs.length})</h3></div>
          <table>
            <thead>
              <tr><th>Thời Gian</th><th>Khách Hàng</th><th>Loại</th><th>Thời Lượng</th><th>Mục Đích</th><th>Kết Quả</th></tr>
            </thead>
            <tbody>
              {callLogs.length === 0 ? (
                <tr><td colSpan="6" style={{ textAlign: 'center', padding: 40, color: 'var(--text-muted)' }}>Chưa thực hiện cuộc gọi nào</td></tr>
              ) : callLogs.map(l => (
                <tr key={l.id}>
                  <td style={{ fontSize: 12 }}>{new Date(l.call_datetime).toLocaleString('vi-VN')}</td>
                  <td>{l.client ? <strong>{l.client.company_name}</strong> : <span className="text-muted">Không xác định</span>}</td>
                  <td><Badge type={l.call_type} /></td>
                  <td>{l.duration_minutes} phút</td>
                  <td style={{ maxWidth: 220, fontSize: 12 }}>{l.purpose || '-'}</td>
                  <td>
                    <span className={`text-${{ resolved: 'success', callback: 'warning', no_answer: 'danger', escalated: 'danger', completed: 'success' }[l.outcome] || 'muted'}`}
                      style={{ fontSize: 12, fontWeight: 600 }}>
                      {l.outcome}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
