import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { clientsApi, clientServicesApi, paymentsApi, clientProductsApi, callLogsApi, clientProceduresApi } from '../api';
import { Badge, Loading, TabNav } from '../components/UI';
import { ArrowLeft, Mail, Phone, MapPin, Globe, Briefcase, AlertTriangle } from 'lucide-react';
import toast from 'react-hot-toast';
import { useCall } from '../context/CallContext';
import { useAuth } from '../context/AuthContext';

export default function ClientDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { startCall } = useCall();
  const { user } = useAuth();
  const isAdminOrManager = user?.role === 'admin' || user?.role === 'manager';

  const [activeTab, setActiveTab] = useState('overview');
  const [client, setClient] = useState(null);
  const [services, setServices] = useState([]);
  const [payments, setPayments] = useState([]);
  const [products, setProducts] = useState([]);
  const [callLogs, setCallLogs] = useState([]);
  const [procedures, setProcedures] = useState([]);
  const [loading, setLoading] = useState(true);

  const [isEditingNotes, setIsEditingNotes] = useState(false);
  const [notesText, setNotesText] = useState('');
  const [savingNotes, setSavingNotes] = useState(false);

  const handleSaveNotes = async () => {
    setSavingNotes(true);
    try {
      await clientsApi.update(id, { ...client, notes: notesText });
      toast.success('Cập nhật ghi chú thành công');
      setClient({ ...client, notes: notesText });
      setIsEditingNotes(false);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Không thể lưu ghi chú');
    } finally {
      setSavingNotes(false);
    }
  };

  const fetchAll = async () => {
    try {
      const [cRes, csRes, pRes, prRes, clRes, cpRes] = await Promise.all([
        clientsApi.getById(id),
        clientServicesApi.getAll({ client_id: id }).catch(err => { console.error(err); return { data: [] }; }),
        paymentsApi.getAll({ client_id: id }).catch(err => { console.error(err); return { data: [] }; }),
        clientProductsApi.getAll({ client_id: id }).catch(err => { console.error(err); return { data: [] }; }),
        callLogsApi.getAll({ client_id: id }).catch(err => { console.error(err); return { data: [] }; }),
        clientProceduresApi.getAll({ client_id: id }).catch(err => { console.error(err); return { data: [] }; })
      ]);
      setClient(cRes.data);
      setServices(csRes.data);
      setPayments(pRes.data);
      setProducts(prRes.data);
      setCallLogs(clRes.data);
      setProcedures(cpRes.data);
    } catch (err) {
      console.error(err);
      toast.error('Lỗi tải dữ liệu client');
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

  useEffect(() => {
    const handleCallLogSaved = (e) => {
      if (Number(e.detail?.clientId) === Number(id)) {
        fetchAll();
      }
    };
    window.addEventListener('call-log-saved', handleCallLogSaved);
    return () => window.removeEventListener('call-log-saved', handleCallLogSaved);
  }, [id]);


  if (loading) return <Loading />;
  if (!client) return <div style={{ padding: 40, color: 'var(--danger)' }}>Không tìm thấy khách hàng.</div>;

  const totalCharge = services.reduce((s, cs) => s + parseFloat(cs.total_charge || 0), 0);
  const totalPaid = payments.filter(p => p.status === 'paid').reduce((s, p) => s + parseFloat(p.amount || 0), 0);
  const overdueCount = payments.filter(p => p.status === 'overdue').length;
  const activeServices = services.filter(s => s.status === 'active').length;

  const tabs = [
    { key: 'overview', label: 'Tổng Quan', icon: '📊' },
    { key: 'services', label: 'Dịch Vụ', icon: '⚙️', count: services.length },
    { key: 'payments', label: 'Thanh Toán', icon: '💳', count: payments.length },
    { key: 'products', label: 'Sản Phẩm', icon: '📦', count: products.length },
    { key: 'procedures', label: 'Quy Trình', icon: '📝', count: procedures.length },
    { key: 'calllogs', label: 'Call Logs', icon: '📞', count: callLogs.length },
  ];


  return (
    <div>
      {/* Back button */}
      <div style={{ marginBottom: 16 }}>
        <button className="btn btn-secondary" onClick={() => navigate('/clients')}>
          <ArrowLeft size={15} /> Quay lại danh sách
        </button>
      </div>

      {/* Client Header Card */}
      <div className="detail-header-card">
        <div className="detail-avatar">{client.company_name?.charAt(0)?.toUpperCase()}</div>
        <div style={{ flex: 1 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 4 }}>
            <h2 style={{ fontSize: 22, fontWeight: 800 }}>{client.company_name}</h2>
            <Badge status={client.status} />
          </div>
          <div style={{ color: 'var(--text-muted)', fontSize: 13, marginBottom: 12 }}>
            {client.client_code} · {client.industry || 'N/A'}
          </div>
          <div className="detail-meta">
            <div className="detail-meta-item">
              <label><Mail size={11} style={{ display: 'inline', marginRight: 3 }} />Email</label>
              <span>{client.email}</span>
            </div>
            <div className="detail-meta-item">
              <label><Phone size={11} style={{ display: 'inline', marginRight: 3 }} />Điện Thoại</label>
              <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                <span>{client.phone || '-'}</span>
                {client.phone && (
                  <button 
                    className="btn btn-sm btn-success" 
                    style={{ padding: '2px 8px', fontSize: '11px', borderRadius: '4px', display: 'inline-flex', alignItems: 'center', gap: '4px', height: '22px' }}
                    onClick={() => startCall(client)}
                  >
                    <Phone size={10} /> Gọi ảo
                  </button>
                )}
              </div>
            </div>
            <div className="detail-meta-item">
              <label><MapPin size={11} style={{ display: 'inline', marginRight: 3 }} />Thành Phố</label>
              <span>{client.city || '-'}</span>
            </div>
            <div className="detail-meta-item">
              <label><Globe size={11} style={{ display: 'inline', marginRight: 3 }} />Quốc Gia</label>
              <span>{client.country || '-'}</span>
            </div>
            <div className="detail-meta-item">
              <label><Briefcase size={11} style={{ display: 'inline', marginRight: 3 }} />Người Liên Hệ</label>
              <span>{client.contact_person}</span>
            </div>
            <div className="detail-meta-item">
              <label>Địa Chỉ</label>
              <span>{client.address || '-'}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Stats Row */}
      <div className="stats-row">
        <div className="mini-stat blue">
          <div className="ms-value">{activeServices}</div>
          <div className="ms-label">Dịch Vụ Đang Chạy</div>
        </div>
        <div className="mini-stat cyan">
          <div className="ms-value">${totalCharge.toLocaleString()}</div>
          <div className="ms-label">Tổng Phí Dịch Vụ</div>
        </div>
        <div className="mini-stat green">
          <div className="ms-value">${totalPaid.toLocaleString()}</div>
          <div className="ms-label">Đã Thanh Toán</div>
        </div>
        <div className="mini-stat red">
          <div className="ms-value">{overdueCount}</div>
          <div className="ms-label">HĐ Quá Hạn</div>
        </div>
        <div className="mini-stat yellow">
          <div className="ms-value">{products.length}</div>
          <div className="ms-label">Sản Phẩm</div>
        </div>
      </div>

      {/* Overdue Alert */}
      {overdueCount > 0 && (
        <div className="alert-banner danger" style={{ marginBottom: 16 }}>
          <AlertTriangle size={18} />
          <span>{overdueCount} hóa đơn quá hạn thanh toán! Tổng nợ: <strong>${payments.filter(p => p.status === 'overdue').reduce((s, p) => s + parseFloat(p.amount), 0).toLocaleString()}</strong></span>
        </div>
      )}

      {/* Tabs */}
      <TabNav tabs={tabs} active={activeTab} onChange={setActiveTab} />

      {/* Tab: Overview */}
      {activeTab === 'overview' && (
        <div className="grid-2">
          <div className="card">
            <h3 style={{ marginBottom: 16, fontSize: 14, fontWeight: 600 }}>📋 Thông Tin Chi Tiết</h3>
            {[
              { label: 'Mã Khách Hàng', value: client.client_code },
              { label: 'Tên Công Ty', value: client.company_name },
              { label: 'Người Liên Hệ', value: client.contact_person },
              { label: 'Email', value: client.email },
              { label: 'Điện Thoại', value: client.phone || '-' },
              { label: 'Ngành Nghề', value: client.industry || '-' },
              { label: 'Thành Phố', value: client.city || '-' },
              { label: 'Quốc Gia', value: client.country || '-' },
              { label: 'Địa Chỉ', value: client.address || '-' },
              { label: 'Trạng Thái', value: <Badge status={client.status} /> },
              { label: 'Ngày Tạo', value: new Date(client.created_at).toLocaleDateString('vi-VN') },
            ].map(({ label, value }) => (
              <div key={label} style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 0', borderBottom: '1px solid var(--border)' }}>
                <span style={{ color: 'var(--text-muted)', fontSize: 13 }}>{label}</span>
                <span style={{ fontWeight: 500, fontSize: 13 }}>{value}</span>
              </div>
            ))}
          </div>
          <div className="card">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
              <h3 style={{ fontSize: 14, fontWeight: 600, margin: 0 }}>📝 Ghi Chú</h3>
              {isAdminOrManager && !isEditingNotes && (
                <button 
                  className="btn btn-sm btn-secondary" 
                  style={{ padding: '2px 8px', fontSize: 11 }}
                  onClick={() => {
                    setNotesText(client.notes || '');
                    setIsEditingNotes(true);
                  }}
                >
                  Sửa ghi chú
                </button>
              )}
            </div>
            {isEditingNotes ? (
              <div>
                <textarea 
                  className="form-control" 
                  rows={4} 
                  value={notesText} 
                  onChange={e => setNotesText(e.target.value)}
                  style={{ width: '100%', marginBottom: 8, fontSize: 13, background: 'var(--bg)', color: 'var(--text)', border: '1px solid var(--border)' }}
                  placeholder="Nhập ghi chú khách hàng..."
                />
                <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end' }}>
                  <button 
                    className="btn btn-sm btn-secondary" 
                    onClick={() => setIsEditingNotes(false)}
                    disabled={savingNotes}
                  >
                    Hủy
                  </button>
                  <button 
                    className="btn btn-sm btn-primary" 
                    onClick={handleSaveNotes}
                    disabled={savingNotes}
                  >
                    {savingNotes ? 'Đang lưu...' : 'Lưu'}
                  </button>
                </div>
              </div>
            ) : (
              <p style={{ color: 'var(--text-secondary)', fontSize: 13, lineHeight: 1.8, whiteSpace: 'pre-wrap' }}>
                {client.notes || 'Không có ghi chú.'}
              </p>
            )}
            <h3 style={{ margin: '20px 0 12px', fontSize: 14, fontWeight: 600 }}>📈 Tóm Tắt Hoạt Động</h3>
            {[
              { label: 'Tổng đăng ký dịch vụ', value: services.length },
              { label: 'Dịch vụ đang chạy', value: activeServices },
              { label: 'Tổng hóa đơn', value: payments.length },
              { label: 'Đã thanh toán', value: payments.filter(p => p.status === 'paid').length },
              { label: 'Quá hạn', value: overdueCount },
              { label: 'Tổng cuộc gọi', value: callLogs.length },
              { label: 'Sản phẩm đang bán', value: products.filter(p => p.is_active).length },
            ].map(({ label, value }) => (
              <div key={label} style={{ display: 'flex', justifyContent: 'space-between', padding: '6px 0', borderBottom: '1px solid var(--border)' }}>
                <span style={{ color: 'var(--text-muted)', fontSize: 13 }}>{label}</span>
                <span style={{ fontWeight: 700, fontSize: 13 }}>{value}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Tab: Services */}
      {activeTab === 'services' && (
        <div className="table-container">
          <div className="table-header"><h3>Dịch Vụ Đã Đăng Ký ({services.length})</h3></div>
          <table>
            <thead>
              <tr><th>Dịch Vụ</th><th>Loại</th><th>Số NV</th><th>Bắt Đầu</th><th>Kết Thúc</th><th>Tổng Ngày</th><th>Tổng Phí</th><th>Trạng Thái</th></tr>
            </thead>
            <tbody>
              {services.length === 0 ? (
                <tr><td colSpan="8" style={{ textAlign: 'center', padding: 40, color: 'var(--text-muted)' }}>Chưa đăng ký dịch vụ nào</td></tr>
              ) : services.map(cs => (
                <tr key={cs.id}>
                  <td><strong>{cs.service?.name}</strong></td>
                  <td><Badge type={cs.service?.type} /></td>
                  <td>{cs.num_employees} NV</td>
                  <td>{cs.start_date ? new Date(cs.start_date).toLocaleDateString('vi-VN') : '-'}</td>
                  <td>{cs.end_date ? new Date(cs.end_date).toLocaleDateString('vi-VN') : <span style={{ color: 'var(--success)' }}>Đang chạy</span>}</td>
                  <td>{cs.total_days || '-'} ngày</td>
                  <td><strong style={{ color: 'var(--accent)' }}>{cs.total_charge ? `$${Number(cs.total_charge).toLocaleString()}` : '-'}</strong></td>
                  <td><Badge status={cs.status} /></td>
                </tr>
              ))}
            </tbody>
          </table>
          {services.length > 0 && (
            <div style={{ padding: '12px 20px', borderTop: '1px solid var(--border)', display: 'flex', justifyContent: 'flex-end', gap: 20, fontSize: 13 }}>
              <span style={{ color: 'var(--text-muted)' }}>Tổng phí dịch vụ:</span>
              <strong style={{ color: 'var(--accent)', fontSize: 16 }}>${totalCharge.toLocaleString()}</strong>
            </div>
          )}
        </div>
      )}

      {/* Tab: Payments */}
      {activeTab === 'payments' && (
        <div className="table-container">
          <div className="table-header"><h3>Lịch Sử Thanh Toán ({payments.length})</h3></div>
          <table>
            <thead>
              <tr><th>Số HĐ</th><th>Số Tiền</th><th>Hạn TT</th><th>Ngày TT</th><th>Phương Thức</th><th>Trạng Thái</th></tr>
            </thead>
            <tbody>
              {payments.length === 0 ? (
                <tr><td colSpan="6" style={{ textAlign: 'center', padding: 40, color: 'var(--text-muted)' }}>Không có hóa đơn</td></tr>
              ) : payments.map(p => (
                <tr key={p.id}>
                  <td><strong>{p.invoice_no}</strong></td>
                  <td><strong style={{ color: 'var(--success)' }}>${Number(p.amount).toLocaleString()}</strong></td>
                  <td style={{ color: p.status === 'overdue' ? 'var(--danger)' : 'inherit' }}>
                    {new Date(p.due_date).toLocaleDateString('vi-VN')}
                  </td>
                  <td>{p.paid_date ? new Date(p.paid_date).toLocaleDateString('vi-VN') : <span className="text-muted">-</span>}</td>
                  <td style={{ fontSize: 12 }}>{p.payment_method}</td>
                  <td><Badge status={p.status} /></td>
                </tr>
              ))}
            </tbody>
          </table>
          {payments.length > 0 && (
            <div style={{ padding: '12px 20px', borderTop: '1px solid var(--border)', display: 'flex', gap: 24, fontSize: 13 }}>
              <span>Đã thanh toán: <strong style={{ color: 'var(--success)' }}>${totalPaid.toLocaleString()}</strong></span>
              <span>Chưa thanh toán: <strong style={{ color: 'var(--warning)' }}>
                ${payments.filter(p => p.status === 'pending').reduce((s, p) => s + parseFloat(p.amount), 0).toLocaleString()}
              </strong></span>
              {overdueCount > 0 && (
                <span>Quá hạn: <strong style={{ color: 'var(--danger)' }}>
                  ${payments.filter(p => p.status === 'overdue').reduce((s, p) => s + parseFloat(p.amount), 0).toLocaleString()}
                </strong></span>
              )}
            </div>
          )}
        </div>
      )}

      {/* Tab: Products */}
      {activeTab === 'products' && (
        <div className="table-container">
          <div className="table-header"><h3>Sản Phẩm / Dịch Vụ Client Cung Cấp ({products.length})</h3></div>
          <table>
            <thead>
              <tr><th>Tên Sản Phẩm</th><th>Danh Mục</th><th>Mô Tả</th><th>Giá</th><th>Trạng Thái</th></tr>
            </thead>
            <tbody>
              {products.length === 0 ? (
                <tr><td colSpan="5" style={{ textAlign: 'center', padding: 40, color: 'var(--text-muted)' }}>Chưa có sản phẩm</td></tr>
              ) : products.map(p => (
                <tr key={p.id}>
                  <td><strong>{p.product_name}</strong></td>
                  <td>{p.category || '-'}</td>
                  <td style={{ maxWidth: 250, fontSize: 12 }}>{p.description || '-'}</td>
                  <td>{p.price ? <strong style={{ color: 'var(--success)' }}>${Number(p.price).toLocaleString()}</strong> : '-'}</td>
                  <td><Badge status={p.is_active ? 'active' : 'inactive'} /></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Tab: Procedures */}
      {activeTab === 'procedures' && (
        <div className="table-container">
          <div className="table-header"><h3>Quy Trình Hỗ Trợ Của Khách Hàng ({procedures.length})</h3></div>
          <table>
            <thead>
              <tr><th>Tên Quy Trình</th><th>Chi Tiết Các Bước Xử Lý</th><th>Trạng Thái</th></tr>
            </thead>
            <tbody>
              {procedures.length === 0 ? (
                <tr><td colSpan="3" style={{ textAlign: 'center', padding: 40, color: 'var(--text-muted)' }}>Chưa có quy trình nào</td></tr>
              ) : procedures.map(p => (
                <tr key={p.id}>
                  <td style={{ minWidth: 200 }}><strong>{p.title}</strong></td>
                  <td style={{ fontSize: 12, whiteSpace: 'pre-wrap', lineHeight: '1.6', padding: '12px 8px' }}>{p.steps || '-'}</td>
                  <td><Badge status={p.is_active ? 'active' : 'inactive'} /></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Tab: Call Logs */}
      {activeTab === 'calllogs' && (
        <div className="table-container">
          <div className="table-header"><h3>Lịch Sử Cuộc Gọi ({callLogs.length})</h3></div>
          <table>
            <thead>
              <tr><th>Thời Gian</th><th>Nhân Viên</th><th>Loại</th><th>Thời Lượng</th><th>Mục Đích</th><th>Kết Quả</th></tr>
            </thead>
            <tbody>
              {callLogs.length === 0 ? (
                <tr><td colSpan="6" style={{ textAlign: 'center', padding: 40, color: 'var(--text-muted)' }}>Chưa có cuộc gọi</td></tr>
              ) : callLogs.map(l => (
                <tr key={l.id}>
                  <td style={{ fontSize: 12 }}>{new Date(l.call_datetime).toLocaleString('vi-VN')}</td>
                  <td>{l.employee ? `${l.employee.last_name} ${l.employee.first_name}` : '-'}</td>
                  <td><Badge type={l.call_type} /></td>
                  <td>{l.duration_minutes} phút</td>
                  <td style={{ maxWidth: 200, fontSize: 12 }}>{l.purpose || '-'}</td>
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

