import React, { useEffect, useState } from 'react';
import { callLogsApi, clientsApi, employeesApi } from '../api';
import Modal from '../components/Modal';
import { Badge, Loading, ConfirmModal } from '../components/UI';
import { Plus, Edit2, Trash2, Volume2, Sparkles, Eye } from 'lucide-react';
import toast from 'react-hot-toast';
import { useAuth } from '../context/AuthContext';
import VirtualCallModal from '../components/VirtualCallModal';
import CallAIDetailModal from '../components/CallAIDetailModal';
import CallLogDetailModal from '../components/CallLogDetailModal';

const EMPTY_FORM = {
  client_id: '', employee_id: '', call_datetime: '', call_type: 'inbound',
  duration_minutes: 0, purpose: '', outcome: 'completed', notes: ''
};

export default function CallLogsPage() {
  const { user } = useAuth();
  const isStaff = user?.role === 'staff';

  const [logs, setLogs] = useState([]);
  const [clients, setClients] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(true);
  const [typeFilter, setTypeFilter] = useState('');
  const [employeeFilter, setEmployeeFilter] = useState('');
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');

  const [modal, setModal] = useState({ open: false, mode: '', data: null });
  const [confirmId, setConfirmId] = useState(null);
  const [form, setForm] = useState(EMPTY_FORM);
  const [saving, setSaving] = useState(false);

  // Virtual Call, Call Log Detail & AI Analysis Modal states
  const [isVirtualCallOpen, setIsVirtualCallOpen] = useState(false);
  const [selectedAICallId, setSelectedAICallId] = useState(null);
  const [selectedDetailCallLog, setSelectedDetailCallLog] = useState(null);

  const fetchData = async () => {
    setLoading(true);
    try {
      const params = {};
      if (typeFilter) params.call_type = typeFilter;
      if (employeeFilter) params.employee_id = employeeFilter;
      if (dateFrom) params.from = dateFrom;
      if (dateTo) params.to = dateTo;

      const [clRes, cRes, eRes] = await Promise.all([
        callLogsApi.getAll(params),
        clientsApi.getAll(),
        employeesApi.getAll()
      ]);
      setLogs(clRes.data);
      setClients(cRes.data);
      setEmployees(eRes.data);
    } catch { toast.error('Lỗi tải dữ liệu'); }
    finally { setLoading(false); }
  };

  useEffect(() => { fetchData(); }, [typeFilter, employeeFilter, dateFrom, dateTo]);

  const openAdd = () => {
    setForm({
      ...EMPTY_FORM,
      employee_id: isStaff ? (user?.employee_id || user?.id || '') : '',
      call_datetime: new Date().toISOString().slice(0, 16)
    });
    setModal({ open: true, mode: 'add', data: null });
  };

  const openEdit = (l) => {
    setForm({
      ...l,
      call_datetime: l.call_datetime ? new Date(l.call_datetime).toISOString().slice(0, 16) : ''
    });
    setModal({ open: true, mode: 'edit', data: l });
  };

  const closeModal = () => setModal({ open: false, mode: '', data: null });

  const handleSave = async () => {
    setSaving(true);
    try {
      if (modal.mode === 'add') {
        await callLogsApi.create(form);
        toast.success('Thêm cuộc gọi thành công!');
      } else {
        await callLogsApi.update(modal.data.id, form);
        toast.success('Cập nhật thành công!');
      }
      fetchData(); closeModal();
    } catch (err) { toast.error(err.response?.data?.message || 'Có lỗi xảy ra'); }
    finally { setSaving(false); }
  };

  const handleDelete = async () => {
    try {
      await callLogsApi.delete(confirmId);
      toast.success('Đã xóa cuộc gọi');
      setConfirmId(null); fetchData();
    } catch { toast.error('Không thể xóa'); }
  };

  const getAudioUrl = (url) => {
    if (!url) return null;
    return url.startsWith('http') ? url : `http://localhost:5000${url}`;
  };

  const handleVirtualCallCompleted = (newCallId) => {
    fetchData();
    setSelectedAICallId(newCallId);
  };

  return (
    <div>
      <div className="page-header">
        <div><h2>📞 Call Logs & Ghi Âm Hội Thoại AI</h2><p>Lịch sử cuộc gọi, nghe lại ghi âm thoại giữa nhân viên & khách hàng, phân tích chốt đơn</p></div>
      </div>

      <div className="filters-bar" style={{ flexWrap: 'wrap', gap: '8px' }}>
        <select id="calltype-filter" className="filter-select" value={typeFilter} onChange={e => setTypeFilter(e.target.value)}>
          <option value="">Tất cả loại</option>
          <option value="inbound">In-bound</option>
          <option value="outbound">Out-bound</option>
          <option value="telemarketing">Tele Marketing</option>
        </select>
        {!isStaff && (
          <select id="calllog-employee-filter" className="filter-select" value={employeeFilter} onChange={e => setEmployeeFilter(e.target.value)}>
            <option value="">Tất cả nhân viên</option>
            {employees.map(e => <option key={e.id} value={e.id}>{e.last_name} {e.first_name}</option>)}
          </select>
        )}
        <div className="date-range-group">
          <label>Từ</label>
          <input type="date" value={dateFrom} onChange={e => setDateFrom(e.target.value)} />
          <label style={{ marginLeft: 4 }}>Đến</label>
          <input type="date" value={dateTo} onChange={e => setDateTo(e.target.value)} />
          {(dateFrom || dateTo) && (
            <button className="btn btn-sm btn-secondary" style={{ padding: '2px 8px', fontSize: '11px' }}
              onClick={() => { setDateFrom(''); setDateTo(''); }}>✕</button>
          )}
        </div>
      </div>

      <div className="table-container">
        <div className="table-header"><h3>Lịch Sử Cuộc Gọi & Nghe Lại Ghi Âm ({logs.length})</h3></div>
        {loading ? <Loading /> : (
          <table>
            <thead>
              <tr>
                <th>Thời Gian</th>
                <th>Khách Hàng</th>
                <th>Nhân Viên</th>
                <th>Loại</th>
                <th>Thời Lượng</th>
                <th>Thao Tác</th>
              </tr>
            </thead>
            <tbody>
              {logs.length === 0 ? (
                <tr><td colSpan={6} style={{ textAlign: 'center', padding: '40px', color: 'var(--text-muted)' }}>Không có dữ liệu</td></tr>
              ) : logs.map(l => (
                <tr key={l.id}>
                  <td style={{ fontSize: '12px' }}>{new Date(l.call_datetime).toLocaleString('vi-VN')}</td>
                  <td><strong>{l.client?.company_name || '-'}</strong></td>
                  <td>{l.employee ? `${l.employee.last_name} ${l.employee.first_name}` : '-'}</td>
                  <td><Badge type={l.call_type} /></td>
                  <td>{l.duration_minutes} phút</td>
                  <td>
                    <div className="action-btns" style={{ display: 'flex', gap: '4px' }}>
                      <button
                        className="btn btn-sm btn-secondary"
                        style={{ padding: '4px 10px', fontSize: 11, display: 'inline-flex', alignItems: 'center', gap: 4 }}
                        onClick={() => setSelectedDetailCallLog(l)}
                        title="Xem Chi Tiết Lịch Sử Cuộc Gọi (Kèm Ghi Âm & Mục Đích)"
                      >
                        <Eye size={13} /> Chi Tiết
                      </button>
                      <button
                        className="btn btn-sm btn-info btn-ai-call"
                        style={{ padding: '4px 10px', fontSize: 11, display: 'inline-flex', alignItems: 'center', gap: 4 }}
                        onClick={() => setSelectedAICallId(l.id)}
                        title="Xem Báo Cáo AI Chi Tiết"
                      >
                        <Sparkles size={13} /> Phân Tích AI
                      </button>
                      {!isStaff && (
                        <button id={`delete-calllog-${l.id}`} className="btn btn-sm btn-danger" onClick={() => setConfirmId(l.id)} title="Xóa"><Trash2 size={13} /></button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* Add/Edit Modal */}
      <Modal isOpen={modal.open} onClose={closeModal}
        title={modal.mode === 'add' ? '➕ Thêm Call Log' : '✏️ Sửa Call Log'}
        footer={<>
          <button className="btn btn-secondary" onClick={closeModal}>Hủy</button>
          <button id="save-calllog-btn" className="btn btn-primary" onClick={handleSave} disabled={saving}>
            {saving ? 'Đang lưu...' : 'Lưu'}
          </button>
        </>}>
        <div className="form-group">
          <label className="form-label">Khách Hàng *</label>
          <select className="form-control" value={form.client_id} onChange={e => setForm({ ...form, client_id: e.target.value })}>
            <option value="">-- Chọn khách hàng --</option>
            {clients.map(c => <option key={c.id} value={c.id}>{c.company_name} ({c.client_code})</option>)}
          </select>
        </div>
        {!isStaff && (
          <div className="form-group">
            <label className="form-label">Nhân Viên *</label>
            <select className="form-control" value={form.employee_id} onChange={e => setForm({ ...form, employee_id: e.target.value })}>
              <option value="">-- Chọn nhân viên --</option>
              {employees.map(e => <option key={e.id} value={e.id}>{e.last_name} {e.first_name} ({e.emp_code || e.employee_code})</option>)}
            </select>
          </div>
        )}
        <div className="form-row">
          <div className="form-group">
            <label className="form-label">Thời Gian *</label>
            <input className="form-control" type="datetime-local" value={form.call_datetime} onChange={e => setForm({ ...form, call_datetime: e.target.value })} />
          </div>
          <div className="form-group">
            <label className="form-label">Loại Cuộc Gọi</label>
            <select className="form-control" value={form.call_type} onChange={e => setForm({ ...form, call_type: e.target.value })}>
              <option value="inbound">In-bound</option>
              <option value="outbound">Out-bound</option>
              <option value="telemarketing">Tele Marketing</option>
            </select>
          </div>
        </div>
        <div className="form-row">
          <div className="form-group">
            <label className="form-label">Thời Lượng (Phút)</label>
            <input className="form-control" type="number" value={form.duration_minutes} onChange={e => setForm({ ...form, duration_minutes: parseInt(e.target.value) || 0 })} />
          </div>
          <div className="form-group">
            <label className="form-label">Kết Quả</label>
            <select className="form-control" value={form.outcome} onChange={e => setForm({ ...form, outcome: e.target.value })}>
              <option value="completed">Hoàn Thành</option>
              <option value="resolved">Đã Giải Quyết</option>
              <option value="callback">Hẹn Gọi Lại</option>
              <option value="no_answer">Không Nhấc Máy</option>
              <option value="escalated">Chuyển Cấp Trên</option>
            </select>
          </div>
        </div>
        <div className="form-group">
          <label className="form-label">Mục Đích Cuộc Gọi</label>
          <input className="form-control" value={form.purpose} onChange={e => setForm({ ...form, purpose: e.target.value })} placeholder="VD: Hỗ trợ kỹ thuật, Báo giá..." />
        </div>
        <div className="form-group">
          <label className="form-label">Ghi Chú</label>
          <textarea className="form-control" rows={3} value={form.notes} onChange={e => setForm({ ...form, notes: e.target.value })} />
        </div>
      </Modal>

      <ConfirmModal isOpen={!!confirmId} onClose={() => setConfirmId(null)}
        onConfirm={handleDelete} message="Bạn có chắc muốn xóa cuộc gọi này không?" />

      {/* Virtual Call AI Simulator Widget */}
      <VirtualCallModal
        isOpen={isVirtualCallOpen}
        onClose={() => setIsVirtualCallOpen(false)}
        onCallCompleted={handleVirtualCallCompleted}
      />

      {/* Call Log Detail Modal */}
      <CallLogDetailModal
        callLog={selectedDetailCallLog}
        onClose={() => setSelectedDetailCallLog(null)}
        onOpenAIReport={(callId) => setSelectedAICallId(callId)}
      />

      {/* Call AI Detail Report Modal */}
      <CallAIDetailModal
        callId={selectedAICallId}
        onClose={() => setSelectedAICallId(null)}
      />

    </div>
  );
}
