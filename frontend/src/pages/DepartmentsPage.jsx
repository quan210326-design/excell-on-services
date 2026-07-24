import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { departmentsApi } from '../api';
import Modal from '../components/Modal';
import { Badge, Loading, ConfirmModal } from '../components/UI';
import { Plus, Edit2, Trash2 } from 'lucide-react';
import toast from 'react-hot-toast';
import { useAuth } from '../context/AuthContext';

const EMPTY = { name: '', code: '', description: '', manager_name: '', is_active: 1 };

export default function DepartmentsPage() {
  const { user } = useAuth();
  const isAdmin = user?.role === 'admin';

  const [depts, setDepts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modal, setModal] = useState({ open: false, mode: '', data: null });
  const [confirmId, setConfirmId] = useState(null);
  const [form, setForm] = useState(EMPTY);
  const [saving, setSaving] = useState(false);

  const fetch = async () => {
    setLoading(true);
    try { const res = await departmentsApi.getAll(); setDepts(res.data); }
    catch { toast.error('Lỗi tải dữ liệu'); }
    finally { setLoading(false); }
  };

  useEffect(() => { fetch(); }, []);

  const openAdd = () => { setForm(EMPTY); setModal({ open: true, mode: 'add' }); };
  const openEdit = (d) => { setForm({ ...d }); setModal({ open: true, mode: 'edit', data: d }); };
  const closeModal = () => setModal({ open: false, mode: '', data: null });

  const handleSave = async () => {
    setSaving(true);
    try {
      if (modal.mode === 'add') { await departmentsApi.create(form); toast.success('Thêm phòng ban thành công!'); }
      else { await departmentsApi.update(modal.data.id, form); toast.success('Cập nhật thành công!'); }
      fetch(); closeModal();
    } catch (err) { toast.error(err.response?.data?.message || 'Có lỗi xảy ra'); }
    finally { setSaving(false); }
  };

  const handleDelete = async () => {
    try { await departmentsApi.delete(confirmId); toast.success('Đã xóa'); setConfirmId(null); fetch(); }
    catch { toast.error('Không thể xóa phòng ban đang có nhân viên'); }
  };

  return (
    <div>
      <div className="page-header">
        <div><h2>🏛️ Phòng Ban</h2><p>Quản lý các phòng ban của ECS</p></div>
        {isAdmin && (
          <button id="add-dept-btn" className="btn btn-primary" onClick={openAdd}><Plus size={16} />Thêm Phòng Ban</button>
        )}
      </div>
      <div className="table-container">
        <div className="table-header"><h3>Danh Sách Phòng Ban ({depts.length})</h3></div>
        {loading ? <Loading /> : (
          <table>
            <thead><tr><th>Mã</th><th>Tên Phòng Ban</th><th>Trưởng Phòng</th><th>Mô Tả</th><th>Trạng Thái</th>{isAdmin && <th>Hành Động</th>}</tr></thead>
            <tbody>
              {depts.map(d => (
                <tr key={d.id}>
                  <td><strong>{d.code}</strong></td>
                  <td>
                    <Link to={`/departments/${d.id}`} style={{ color: 'var(--accent)', textDecoration: 'none', fontWeight: 700 }} className="hover-underline">
                      {d.name}
                    </Link>
                  </td>
                  <td>{d.manager_name || '-'}</td>
                  <td style={{ maxWidth: '350px', fontSize: '12px' }}>{d.description || '-'}</td>
                  <td><Badge status={d.is_active ? 'active' : 'inactive'} /></td>
                  {isAdmin && (
                    <td>
                      <div className="action-btns">
                        <button id={`edit-dept-${d.id}`} className="btn btn-sm btn-secondary" onClick={() => openEdit(d)}><Edit2 size={13} /></button>
                        <button id={`delete-dept-${d.id}`} className="btn btn-sm btn-danger" onClick={() => setConfirmId(d.id)}><Trash2 size={13} /></button>
                      </div>
                    </td>
                  )}
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
      <Modal isOpen={modal.open} onClose={closeModal}
        title={modal.mode === 'add' ? '➕ Thêm Phòng Ban' : '✏️ Sửa Phòng Ban'}
        footer={<><button className="btn btn-secondary" onClick={closeModal}>Hủy</button>
          <button id="save-dept-btn" className="btn btn-primary" onClick={handleSave} disabled={saving}>{saving ? 'Đang lưu...' : 'Lưu'}</button></>}>
        <div className="form-row">
          <div className="form-group">
            <label className="form-label">Tên Phòng Ban *</label>
            <input className="form-control" value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} />
          </div>
          <div className="form-group">
            <label className="form-label">Mã Phòng Ban *</label>
            <input className="form-control" value={form.code} onChange={e => setForm({ ...form, code: e.target.value })} placeholder="VD: HR, IT, ADM" />
          </div>
        </div>
        <div className="form-group">
          <label className="form-label">Trưởng Phòng</label>
          <input className="form-control" value={form.manager_name} onChange={e => setForm({ ...form, manager_name: e.target.value })} />
        </div>
        <div className="form-group">
          <label className="form-label">Mô Tả</label>
          <textarea className="form-control" rows={3} value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} />
        </div>
        <div className="form-group">
          <label className="form-label">Trạng Thái</label>
          <select className="form-control" value={form.is_active} onChange={e => setForm({ ...form, is_active: e.target.value })}>
            <option value={1}>Active</option><option value={0}>Inactive</option>
          </select>
        </div>
      </Modal>
      <ConfirmModal isOpen={!!confirmId} onClose={() => setConfirmId(null)} onConfirm={handleDelete} message="Xóa phòng ban này?" />
    </div>
  );
}
