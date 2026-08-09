import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { clientsApi, clientServicesApi, paymentsApi, clientProductsApi, callLogsApi, clientProceduresApi } from '../api';
import { Badge, Loading, TabNav } from '../components/UI';
import { ArrowLeft, Mail, Phone, MapPin, Globe, Briefcase, AlertTriangle, Sparkles, Volume2, Eye } from 'lucide-react';
import toast from 'react-hot-toast';
import { useAuth } from '../context/AuthContext';
import VirtualCallModal from '../components/VirtualCallModal';
import CallAIDetailModal from '../components/CallAIDetailModal';
import CallLogDetailModal from '../components/CallLogDetailModal';

export default function ClientDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();

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

  // AI & Call Log Detail Modal States
  const [isAICallOpen, setIsAICallOpen] = useState(false);
  const [selectedAICallId, setSelectedAICallId] = useState(null);
  const [selectedDetailCallLog, setSelectedDetailCallLog] = useState(null);

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
    { key: 'calllogs', label: 'Call Logs & AI', icon: '📞', count: callLogs.length },
  ];

  const handleAICallCompleted = (newCallId) => {
    fetchAll();
    setSelectedAICallId(newCallId);
  };

  const getAudioUrl = (url) => {
    if (!url) return null;
    return url.startsWith('http') ? url : `http://localhost:5000${url}`;
  };

  return (
    <div>
      {/* Back button & Action Header */}
      <div style={{ marginBottom: 16, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <button className="btn btn-secondary" onClick={() => navigate('/clients')}>
          <ArrowLeft size={15} /> Quay lại danh sách
        </button>

        {/* Integrated AI Call Button for this Client */}
        <button
          className="btn btn-primary btn-ai-call"
          style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}
          onClick={() => setIsAICallOpen(true)}
        >
          <Sparkles size={16} /> 🤖 Gọi Điện AI & Phân Tích Chốt Đơn
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
                <button 
                  className="btn btn-sm btn-primary btn-ai-call" 
                  style={{ padding: '2px 10px', fontSize: '11px', borderRadius: '6px', display: 'inline-flex', alignItems: 'center', gap: '4px', height: '24px' }}
                  onClick={() => setIsAICallOpen(true)}
                >
                  <Sparkles size={11} /> Gọi AI
                </button>
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
        <div className="card">
          <h3>Ghi Chú Khách Hàng</h3>
          {isEditingNotes ? (
            <div style={{ marginTop: 12 }}>
              <textarea className="form-control" rows={4} value={notesText} onChange={e => setNotesText(e.target.value)} />
              <div style={{ display: 'flex', gap: 8, marginTop: 8 }}>
                <button className="btn btn-primary" onClick={handleSaveNotes} disabled={savingNotes}>Lưu</button>
                <button className="btn btn-secondary" onClick={() => setIsEditingNotes(false)}>Hủy</button>
              </div>
            </div>
          ) : (
            <div style={{ marginTop: 12 }}>
              <p style={{ color: 'var(--text-muted)', fontSize: 14 }}>{client.notes || 'Chưa có ghi chú nào.'}</p>
              <button className="btn btn-sm btn-secondary" style={{ marginTop: 8 }} onClick={() => { setNotesText(client.notes || ''); setIsEditingNotes(true); }}>Sửa ghi chú</button>
            </div>
          )}
        </div>
      )}

      {/* Tab: Services */}
      {activeTab === 'services' && (
        <div className="table-container">
          <table>
            <thead>
              <tr><th>Mã DV</th><th>Tên Dịch Vụ</th><th>Loại</th><th>Trạng Thái</th><th>Tổng Phí</th></tr>
            </thead>
            <tbody>
              {services.length === 0 ? (
                <tr><td colSpan={5} style={{ textAlign: 'center', padding: 20 }}>Chưa có dịch vụ nào</td></tr>
              ) : services.map(cs => (
                <tr key={cs.id}>
                  <td>{cs.id}</td>
                  <td><strong>{cs.service?.name}</strong></td>
                  <td><Badge type={cs.service?.type} /></td>
                  <td><Badge status={cs.status} /></td>
                  <td>${parseFloat(cs.total_charge || 0).toLocaleString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Tab: Payments */}
      {activeTab === 'payments' && (
        <div className="table-container">
          <table>
            <thead>
              <tr>
                <th>Số Hóa Đơn</th>
                <th>Dịch Vụ Liên Quan</th>
                <th>Số Tiền</th>
                <th>Hạn Thanh Toán</th>
                <th>Ngày Trả</th>
                <th>Phương Thức</th>
                <th>Trạng Thái</th>
              </tr>
            </thead>
            <tbody>
              {payments.length === 0 ? (
                <tr><td colSpan={7} style={{ textAlign: 'center', padding: 20 }}>Chưa có hóa đơn thanh toán nào</td></tr>
              ) : payments.map(p => (
                <tr key={p.id}>
                  <td><strong>{p.invoice_no}</strong></td>
                  <td>{p.clientService?.service?.name || '-'}</td>
                  <td>${parseFloat(p.amount || 0).toLocaleString()}</td>
                  <td>{p.due_date ? new Date(p.due_date).toLocaleDateString('vi-VN') : '-'}</td>
                  <td>{p.paid_date ? new Date(p.paid_date).toLocaleDateString('vi-VN') : '-'}</td>
                  <td>{p.payment_method || '-'}</td>
                  <td><Badge status={p.status} /></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Tab: Products */}
      {activeTab === 'products' && (
        <div className="table-container">
          <table>
            <thead>
              <tr>
                <th>Tên Sản Phẩm</th>
                <th>Danh Mục</th>
                <th>Giá</th>
                <th>Mô Tả</th>
                <th>Trạng Thái</th>
              </tr>
            </thead>
            <tbody>
              {products.length === 0 ? (
                <tr><td colSpan={5} style={{ textAlign: 'center', padding: 20 }}>Chưa có sản phẩm nào</td></tr>
              ) : products.map(pr => (
                <tr key={pr.id}>
                  <td><strong>{pr.product_name}</strong></td>
                  <td>{pr.category || '-'}</td>
                  <td>{pr.price ? `$${parseFloat(pr.price).toLocaleString()}` : '-'}</td>
                  <td style={{ maxWidth: '300px', fontSize: '12px' }}>{pr.description || '-'}</td>
                  <td><Badge status={pr.is_active ? 'active' : 'inactive'} /></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Tab: Procedures */}
      {activeTab === 'procedures' && (
        <div className="table-container">
          <table>
            <thead>
              <tr>
                <th>Tên Quy Trình</th>
                <th>Chi Tiết Các Bước Xử Lý</th>
                <th>Trạng Thái</th>
              </tr>
            </thead>
            <tbody>
              {procedures.length === 0 ? (
                <tr><td colSpan={3} style={{ textAlign: 'center', padding: 20 }}>Chưa có quy trình nào</td></tr>
              ) : procedures.map(proc => (
                <tr key={proc.id}>
                  <td><strong>{proc.title}</strong></td>
                  <td style={{ maxWidth: '450px', fontSize: '12px', whiteSpace: 'pre-wrap', lineHeight: '1.6' }}>{proc.steps || '-'}</td>
                  <td><Badge status={proc.is_active ? 'active' : 'inactive'} /></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Tab: Call Logs & AI Reports */}
      {activeTab === 'calllogs' && (
        <div className="table-container">
          <table>
            <thead>
              <tr>
                <th>Thời Gian</th>
                <th>Nhân Viên</th>
                <th>Loại</th>
                <th>Thời Lượng</th>
                <th>Thao Tác</th>
              </tr>
            </thead>
            <tbody>
              {callLogs.length === 0 ? (
                <tr><td colSpan={5} style={{ textAlign: 'center', padding: 20 }}>Chưa có cuộc gọi nào</td></tr>
              ) : callLogs.map(cl => (
                <tr key={cl.id}>
                  <td>{new Date(cl.call_datetime).toLocaleString('vi-VN')}</td>
                  <td>{cl.employee ? `${cl.employee.last_name} ${cl.employee.first_name}` : '-'}</td>
                  <td><Badge type={cl.call_type} /></td>
                  <td>{cl.duration_minutes} phút</td>
                  <td>
                    <div className="action-btns" style={{ display: 'flex', gap: '4px' }}>
                      <button
                        className="btn btn-sm btn-secondary"
                        style={{ padding: '4px 8px', fontSize: 11, display: 'inline-flex', alignItems: 'center', gap: 4 }}
                        onClick={() => setSelectedDetailCallLog(cl)}
                        title="Xem Chi Tiết Lịch Sử Cuộc Gọi (Kèm Ghi Âm & Mục Đích)"
                      >
                        <Eye size={13} /> Chi Tiết
                      </button>
                      <button
                        className="btn btn-sm btn-info btn-ai-call"
                        style={{ padding: '4px 8px', fontSize: 11, display: 'inline-flex', alignItems: 'center', gap: 4 }}
                        onClick={() => setSelectedAICallId(cl.id)}
                        title="Xem Báo Cáo AI Chi Tiết"
                      >
                        <Sparkles size={13} /> Phân Tích AI
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Virtual Call AI Modal */}
      <VirtualCallModal
        isOpen={isAICallOpen}
        onClose={() => setIsAICallOpen(false)}
        onCallCompleted={handleAICallCompleted}
        initialClient={client}
      />

      {/* Call Log Detail Modal */}
      <CallLogDetailModal
        callLog={selectedDetailCallLog}
        onClose={() => setSelectedDetailCallLog(null)}
        onOpenAIReport={(callId) => setSelectedAICallId(callId)}
      />

      {/* AI Analysis Detail Report Modal */}
      <CallAIDetailModal
        callId={selectedAICallId}
        onClose={() => setSelectedAICallId(null)}
      />

    </div>
  );
}
