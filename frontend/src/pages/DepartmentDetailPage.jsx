import React, { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { departmentsApi } from '../api';
import { Badge, Loading } from '../components/UI';
import { ArrowLeft, Building2, User, Calendar, Briefcase, Mail } from 'lucide-react';
import toast from 'react-hot-toast';

export default function DepartmentDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [dept, setDept] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchDepartment = async () => {
    try {
      const res = await departmentsApi.getById(id);
      setDept(res.data);
    } catch {
      toast.error('Lỗi tải dữ liệu phòng ban');
    }
  };

  useEffect(() => {
    const initFetch = async () => {
      setLoading(true);
      await fetchDepartment();
      setLoading(false);
    };
    initFetch();
  }, [id]);

  if (loading) return <Loading />;
  if (!dept) return <div style={{ padding: 40, color: 'var(--danger)' }}>Không tìm thấy phòng ban.</div>;

  const employees = dept.employees || [];

  return (
    <div>
      {/* Back button */}
      <div style={{ marginBottom: 16 }}>
        <button className="btn btn-secondary" onClick={() => navigate('/departments')}>
          <ArrowLeft size={15} /> Quay lại danh sách
        </button>
      </div>

      {/* Department Header Card */}
      <div className="detail-header-card" style={{ marginBottom: 24 }}>
        <div className="detail-avatar" style={{ background: 'var(--accent)', color: '#fff' }}>
          <Building2 size={24} />
        </div>
        <div style={{ flex: 1 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 4 }}>
            <h2 style={{ fontSize: 22, fontWeight: 800 }}>{dept.name}</h2>
            <Badge status={dept.is_active ? 'active' : 'inactive'} />
          </div>
          <div style={{ color: 'var(--text-muted)', fontSize: 13, marginBottom: 12 }}>
            Mã phòng ban: <strong>{dept.code}</strong>
          </div>
          <div className="detail-meta">
            <div className="detail-meta-item">
              <label><User size={11} style={{ display: 'inline', marginRight: 3 }} />Trưởng phòng</label>
              <span>{dept.manager_name || 'Chưa bổ nhiệm'}</span>
            </div>
            <div className="detail-meta-item">
              <label><Calendar size={11} style={{ display: 'inline', marginRight: 3 }} />Ngày thành lập</label>
              <span>{new Date(dept.created_at).toLocaleDateString('vi-VN')}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Overview & Description Cards */}
      <div className="grid-2" style={{ marginBottom: 24 }}>
        <div className="card">
          <h3 style={{ marginBottom: 12, fontSize: 14, fontWeight: 600 }}>📋 Thông Tin Chung</h3>
          {[
            { label: 'Tên phòng ban', value: dept.name },
            { label: 'Mã phòng ban', value: dept.code },
            { label: 'Trưởng phòng', value: dept.manager_name || '-' },
            { label: 'Số lượng nhân viên', value: `${employees.length} nhân viên` },
            { label: 'Trạng thái', value: <Badge status={dept.is_active ? 'active' : 'inactive'} /> },
            { label: 'Thời gian tạo', value: new Date(dept.created_at).toLocaleString('vi-VN') },
          ].map(({ label, value }) => (
            <div key={label} style={{ display: 'flex', justifyContent: 'space-between', padding: '10px 0', borderBottom: '1px solid var(--border)' }}>
              <span style={{ color: 'var(--text-muted)', fontSize: 13 }}>{label}</span>
              <span style={{ fontWeight: 500, fontSize: 13 }}>{value}</span>
            </div>
          ))}
        </div>

        <div className="card">
          <h3 style={{ marginBottom: 12, fontSize: 14, fontWeight: 600 }}>📝 Mô Tả Chức Năng</h3>
          <p style={{ color: 'var(--text-secondary)', fontSize: 13, lineHeight: 1.8, whiteSpace: 'pre-wrap' }}>
            {dept.description || 'Không có mô tả cho phòng ban này.'}
          </p>
        </div>
      </div>

      {/* Member Employees Table */}
      <div className="table-container">
        <div className="table-header"><h3>Thành Viên Thuộc Phòng Ban ({employees.length})</h3></div>
        <table>
          <thead>
            <tr><th>Mã NV</th><th>Họ Tên</th><th>Chức Danh</th><th>Email</th><th>Điện Thoại</th><th>Trạng Thái</th></tr>
          </thead>
          <tbody>
            {employees.length === 0 ? (
              <tr><td colSpan="6" style={{ textAlign: 'center', padding: 40, color: 'var(--text-muted)' }}>Phòng ban chưa có nhân viên nào</td></tr>
            ) : employees.map(e => (
              <tr key={e.id}>
                <td><strong>{e.emp_code}</strong></td>
                <td style={{ whiteSpace: 'nowrap' }}>
                  <Link to={`/employees/${e.id}`} style={{ color: 'var(--accent)', textDecoration: 'none', fontWeight: 700 }} className="hover-underline">
                    {e.last_name} {e.first_name}
                  </Link>
                </td>
                <td>{e.designation}</td>
                <td style={{ fontSize: 12 }}>{e.email}</td>
                <td>{e.phone || '-'}</td>
                <td><Badge status={e.status} /></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
