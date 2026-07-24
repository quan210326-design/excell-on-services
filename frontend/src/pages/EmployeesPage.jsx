import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { employeesApi, departmentsApi, servicesApi } from '../api';
import Modal from '../components/Modal';
import { Badge, Loading, ConfirmModal } from '../components/UI';
import { Search, Plus, Edit2, Trash2 } from 'lucide-react';
import toast from 'react-hot-toast';
import { useAuth } from '../context/AuthContext';

const EMPTY = { emp_code: '', first_name: '', last_name: '', email: '', phone: '', designation: '', dept_id: '', service_id: '', salary: '', join_date: '', status: 'active' };

export default function EmployeesPage() {
  const { user } = useAuth();
  const isAdmin = user?.role === 'admin';

  const [employees, setEmployees] = useState([]);
  const [depts, setDepts] = useState([]);
  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [deptFilter, setDeptFilter] = useState('');
  const [serviceFilter, setServiceFilter] = useState('');
  const [modal, setModal] = useState({ open: false, mode: '', data: null });
  const [confirmId, setConfirmId] = useState(null);
  const [form, setForm] = useState(EMPTY);
  const [saving, setSaving] = useState(false);

  const fetchData = async () => {
    setLoading(true);
    try {
      const params = {};
      if (search) params.search = search;
      if (statusFilter) params.status = statusFilter;
      if (deptFilter) params.dept_id = deptFilter;
      if (serviceFilter) params.service_id = serviceFilter;
      const [eRes, dRes, sRes] = await Promise.all([
        employeesApi.getAll(params), departmentsApi.getAll(), servicesApi.getAll()
      ]);
      setEmployees(eRes.data); setDepts(dRes.data); setServices(sRes.data);
    } catch { toast.error('Lỗi tải dữ liệu'); }
    finally { setLoading(false); }
  };

  useEffect(() => { fetchData(); }, [search, statusFilter, deptFilter, serviceFilter]);

  const openAdd = () => { setForm(EMPTY); setModal({ open: true, mode: 'add' }); };
  const openEdit = (e) => { setForm({ ...e, dept_id: e.dept_id || '', service_id: e.service_id || '' }); setModal({ open: true, mode: 'edit', data: e }); };
  const closeModal = () => setModal({ open: false, mode: '', data: null });

  const handleSave = async () => {
    setSaving(true);
    try {
      if (modal.mode === 'add') { await employeesApi.create(form); toast.success('Thêm nhân viên thành công!'); }
      else { await employeesApi.update(modal.data.id, form); toast.success('Cập nhật thành công!'); }
      fetchData(); closeModal();
    } catch (err) { toast.error(err.response?.data?.message || 'Có lỗi xảy ra'); }
    finally { setSaving(false); }
  };

  const handleDelete = async () => {
    try { await employeesApi.delete(confirmId); toast.success('Đã xóa'); setConfirmId(null); fetchData(); }
    catch { toast.error('Không thể xóa'); }
  };

  return (
    <div>
      <div className="page-header">
        <div><h2>👥 Nhân Viên</h2><p>Quản lý nhân viên theo phòng ban và dịch vụ</p></div>
        {isAdmin && (
          <button id="add-employee-btn" className="btn btn-primary" onClick={openAdd}><Plus size={16} />Thêm Nhân Viên</button>
        )}
      </div>
      <div className="filters-bar">
        <div className="search-input-wrap">
          <Search size={16} />
          <input id="emp-search" className="form-control search-input" placeholder="Tìm theo tên, mã NV, email..."
            value={search} onChange={e => setSearch(e.target.value)} />
        </div>
        <select id="emp-dept-filter" className="filter-select" value={deptFilter} onChange={e => setDeptFilter(e.target.value)}>
          <option value="">Tất cả phòng ban</option>
          {depts.map(d => <option key={d.id} value={d.id}>{d.name}</option>)}
        </select>
        <select id="emp-service-filter" className="filter-select" value={serviceFilter} onChange={e => setServiceFilter(e.target.value)}>
          <option value="">Tất cả dịch vụ</option>
          {services.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
        </select>
        <select id="emp-status-filter" className="filter-select" value={statusFilter} onChange={e => setStatusFilter(e.target.value)}>
          <option value="">Tất cả trạng thái</option>
          <option value="active">Active</option>
          <option value="inactive">Inactive</option>
          <option value="on_leave">On Leave</option>
        </select>
      </div>

      <div className="table-container">
        <div className="table-header"><h3>Danh Sách Nhân Viên ({employees.length})</h3></div>
        {loading ? <Loading /> : (
          <table>
            <thead><tr><th>Mã NV</th><th>Họ Tên</th><th>Email</th><th>Chức Danh</th><th>Phòng Ban</th><th>Dịch Vụ</th><th>Lương ($)</th><th>Trạng Thái</th>{isAdmin && <th>Hành Động</th>}</tr></thead>
            <tbody>
              {employees.length === 0 ? (
                <tr><td colSpan={isAdmin ? 9 : 8} style={{ textAlign: 'center', padding: '40px', color: 'var(--text-muted)' }}>Không có dữ liệu</td></tr>
              ) : employees.map(e => (
                <tr key={e.id}>
                  <td><strong>{e.emp_code}</strong></td>
                  <td style={{ whiteSpace: 'nowrap' }}>
                    <Link to={`/employees/${e.id}`} style={{ color: 'var(--accent)', textDecoration: 'none', fontWeight: 700 }} className="hover-underline">
                      {e.last_name} {e.first_name}
                    </Link>
                  </td>
                  <td style={{ fontSize: '12px' }}>{e.email}</td>
                  <td>{e.designation}</td>
                  <td>{e.department?.name || '-'}</td>
                  <td>{e.service ? <Badge type={e.service.type} /> : <span className="text-muted">-</span>}</td>
                  <td><strong style={{ color: 'var(--success)' }}>{e.salary ? `$${Number(e.salary).toLocaleString()}` : '-'}</strong></td>
                  <td><Badge status={e.status} /></td>
                  {isAdmin && (
                    <td>
                      <div className="action-btns">
                        <button id={`edit-emp-${e.id}`} className="btn btn-sm btn-secondary" onClick={() => openEdit(e)}><Edit2 size={13} /></button>
                        <button id={`delete-emp-${e.id}`} className="btn btn-sm btn-danger" onClick={() => setConfirmId(e.id)}><Trash2 size={13} /></button>
                      </div>
                    </td>
                  )}
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
      <Modal isOpen={modal.open} onClose={closeModal} size="modal-lg"
        title={modal.mode === 'add' ? '➕ Thêm Nhân Viên' : '✏️ Sửa Nhân Viên'}
        footer={<><button className="btn btn-secondary" onClick={closeModal}>Hủy</button>
          <button id="save-emp-btn" className="btn btn-primary" onClick={handleSave} disabled={saving}>{saving ? 'Đang lưu...' : 'Lưu'}</button></>}>
        <div className="form-row">
          <div className="form-group"><label className="form-label">Mã NV *</label>
            <input className="form-control" value={form.emp_code} onChange={e => setForm({ ...form, emp_code: e.target.value })} placeholder="EMP009" /></div>
          <div className="form-group"><label className="form-label">Chức Danh *</label>
            <input className="form-control" value={form.designation} onChange={e => setForm({ ...form, designation: e.target.value })} /></div>
        </div>
        <div className="form-row">
          <div className="form-group"><label className="form-label">Họ *</label>
            <input className="form-control" value={form.last_name} onChange={e => setForm({ ...form, last_name: e.target.value })} /></div>
          <div className="form-group"><label className="form-label">Tên *</label>
            <input className="form-control" value={form.first_name} onChange={e => setForm({ ...form, first_name: e.target.value })} /></div>
        </div>
        <div className="form-row">
          <div className="form-group"><label className="form-label">Email *</label>
            <input className="form-control" type="email" value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} /></div>
          <div className="form-group"><label className="form-label">Điện Thoại</label>
            <input className="form-control" value={form.phone} onChange={e => setForm({ ...form, phone: e.target.value })} /></div>
        </div>
        <div className="form-row">
          <div className="form-group"><label className="form-label">Phòng Ban *</label>
            <select className="form-control" value={form.dept_id} onChange={e => setForm({ ...form, dept_id: e.target.value })}>
              <option value="">Chọn phòng ban...</option>
              {depts.map(d => <option key={d.id} value={d.id}>{d.name}</option>)}
            </select></div>
          <div className="form-group"><label className="form-label">Dịch Vụ Phụ Trách</label>
            <select className="form-control" value={form.service_id} onChange={e => setForm({ ...form, service_id: e.target.value })}>
              <option value="">Không phụ trách dịch vụ</option>
              {services.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
            </select></div>
        </div>
        <div className="form-row">
          <div className="form-group"><label className="form-label">Lương ($)</label>
            <input className="form-control" type="number" value={form.salary} onChange={e => setForm({ ...form, salary: e.target.value })} /></div>
          <div className="form-group"><label className="form-label">Ngày Vào Làm</label>
            <input className="form-control" type="date" value={form.join_date} onChange={e => setForm({ ...form, join_date: e.target.value })} /></div>
        </div>
        <div className="form-group"><label className="form-label">Trạng Thái</label>
          <select className="form-control" value={form.status} onChange={e => setForm({ ...form, status: e.target.value })}>
            <option value="active">Active</option>
            <option value="inactive">Inactive</option>
            <option value="on_leave">On Leave</option>
          </select></div>
      </Modal>
      <ConfirmModal isOpen={!!confirmId} onClose={() => setConfirmId(null)} onConfirm={handleDelete} message="Xóa nhân viên này?" />
    </div>
  );
}
