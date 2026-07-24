import React, { useState, useEffect } from 'react';
import { useCall } from '../context/CallContext';
import { callLogsApi } from '../api';
import { Phone, PhoneOff, Clock, User, Save, X, MessageSquare, AlertCircle } from 'lucide-react';
import toast from 'react-hot-toast';

export default function VirtualCallWidget() {
  const { activeCall, endCall, cancelCall } = useCall();
  const [saving, setSaving] = useState(false);
  const [purpose, setPurpose] = useState('Tư vấn dịch vụ');
  const [outcome, setOutcome] = useState('completed');
  const [notes, setNotes] = useState('');

  // Reset form when activeCall changes or is initiated
  useEffect(() => {
    if (activeCall) {
      setPurpose('Tư vấn dịch vụ');
      // If call is ended before it was connected, set outcome to no_answer
      if (activeCall.status === 'connecting' || activeCall.status === 'ringing') {
        setOutcome('no_answer');
      } else {
        setOutcome('completed');
      }
      setNotes('');
    }
  }, [activeCall?.client?.id]);

  // If call changes to ended from ringing/connecting, default to no_answer
  useEffect(() => {
    if (activeCall?.status === 'ended') {
      if (activeCall.seconds === 0) {
        setOutcome('no_answer');
      } else {
        setOutcome('completed');
      }
    }
  }, [activeCall?.status]);

  if (!activeCall) return null;

  const { client, status, seconds } = activeCall;

  const formatTime = (totalSeconds) => {
    const mins = Math.floor(totalSeconds / 60);
    const secs = totalSeconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const handleSaveLog = async () => {
    setSaving(true);
    try {
      // Round seconds up to minutes for database storage (min 1 minute if call was connected)
      const durationMinutes = seconds > 0 ? Math.ceil(seconds / 60) : 0;

      const payload = {
        client_id: client.id,
        call_type: 'outbound',
        call_datetime: activeCall.startTime,
        duration_minutes: durationMinutes,
        purpose: purpose,
        outcome: outcome,
        notes: notes || `Cuộc gọi ảo thành công. Thời lượng thực tế: ${formatTime(seconds)}.`
      };

      await callLogsApi.create(payload);
      toast.success('Đã lưu lịch sử cuộc gọi ảo!');
      
      // Dispatch global custom event so pages can auto-refresh
      window.dispatchEvent(new CustomEvent('call-log-saved', { detail: { clientId: client.id } }));
      
      cancelCall(); // Close widget
    } catch (err) {
      console.error(err);
      toast.error(err.response?.data?.message || 'Lỗi khi lưu cuộc gọi');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="virtual-call-widget-overlay">
      <div className={`virtual-call-widget ${status === 'ended' ? 'expanded' : ''}`}>
        
        {/* Header */}
        <div className="vcall-header">
          <div className="vcall-client-info">
            <div className="vcall-avatar">
              {client.company_name?.charAt(0).toUpperCase()}
            </div>
            <div>
              <h4>{client.company_name}</h4>
              <p>{client.phone}</p>
            </div>
          </div>
          {status === 'ended' && (
            <button className="vcall-close-btn" onClick={cancelCall} disabled={saving}>
              <X size={16} />
            </button>
          )}
        </div>

        {/* Body / Calling State */}
        {status !== 'ended' && (
          <div className="vcall-body">
            <div className="vcall-pulse-wrapper">
              <div className={`vcall-pulse-circle ${status}`}>
                <Phone size={24} className="phone-icon" />
              </div>
              <div className="vcall-wave-ripple"></div>
              <div className="vcall-wave-ripple delay-1"></div>
            </div>

            <div className="vcall-status-text">
              {status === 'connecting' && <span className="status-connecting">Đang kết nối...</span>}
              {status === 'ringing' && <span className="status-ringing">Đang đổ chuông...</span>}
              {status === 'connected' && (
                <div className="status-active">
                  <span className="live-dot"></span>
                  Đang trong cuộc gọi
                </div>
              )}
            </div>

            <div className="vcall-timer">
              <Clock size={16} style={{ marginRight: 6 }} />
              {formatTime(seconds)}
            </div>

            <div className="vcall-actions">
              <button className="vcall-hangup-btn" onClick={endCall}>
                <PhoneOff size={18} /> Gác máy
              </button>
            </div>
          </div>
        )}

        {/* Ended State: Log Form */}
        {status === 'ended' && (
          <div className="vcall-form">
            <div className="vcall-summary-strip">
              <div>
                <span className="summary-label">Thời lượng cuộc gọi:</span>
                <strong className="summary-val">{formatTime(seconds)}</strong>
                {seconds > 0 && (
                  <span className="summary-db-note">
                    (Lưu vào DB: {Math.ceil(seconds / 60)} phút)
                  </span>
                )}
              </div>
            </div>

            <div className="vcall-form-group">
              <label className="vcall-form-label">Mục đích cuộc gọi</label>
              <input 
                className="vcall-form-control"
                value={purpose}
                onChange={e => setPurpose(e.target.value)}
                placeholder="VD: Tư vấn hợp đồng, hỗ trợ kỹ thuật..."
              />
            </div>

            <div className="vcall-form-group">
              <label className="vcall-form-label">Kết quả cuộc gọi</label>
              <div className="vcall-outcome-selector">
                {[
                  { value: 'completed', label: 'Đã hoàn thành', sub: 'Completed', color: '#10b981' },
                  { value: 'resolved', label: 'Đã giải quyết', sub: 'Resolved', color: '#06b6d4' },
                  { value: 'callback', label: 'Yêu cầu gọi lại', sub: 'Callback', color: '#f59e0b' },
                  { value: 'no_answer', label: 'Không trả lời', sub: 'No Answer', color: '#ef4444' },
                  { value: 'escalated', label: 'Chuyển tiếp', sub: 'Escalated', color: '#a78bfa' }
                ].map(opt => (
                  <button
                    key={opt.value}
                    type="button"
                    className={`vcall-outcome-chip ${outcome === opt.value ? 'active' : ''}`}
                    style={{
                      '--chip-color': opt.color,
                      '--chip-bg': `${opt.color}18`,
                      '--chip-border': `${opt.color}40`,
                    }}
                    onClick={() => setOutcome(opt.value)}
                  >
                    <span className="vcall-chip-label">{opt.label}</span>
                    <span className="vcall-chip-sub">{opt.sub}</span>
                  </button>
                ))}
              </div>
            </div>

            <div className="vcall-form-group">
              <label className="vcall-form-label">Ghi chú cuộc gọi</label>
              <textarea 
                className="vcall-form-control text-area"
                rows={2}
                value={notes}
                onChange={e => setNotes(e.target.value)}
                placeholder="Nhập nội dung trao đổi, lưu ý của khách hàng..."
              />
            </div>

            <div className="vcall-form-actions">
              <button className="btn btn-secondary btn-sm" onClick={cancelCall} disabled={saving}>
                Hủy bỏ
              </button>
              <button className="btn btn-primary btn-sm" onClick={handleSaveLog} disabled={saving}>
                <Save size={14} /> {saving ? 'Đang lưu...' : 'Lưu cuộc gọi'}
              </button>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
