import React from 'react';
import { X, Phone, User, Building, Calendar, Clock, FileText, Volume2, Sparkles, ShieldCheck, CheckCircle2 } from 'lucide-react';
import { Badge } from './UI';

export default function CallLogDetailModal({ callLog, onClose, onOpenAIReport }) {
  if (!callLog) return null;

  const audioUrl = callLog.recording_url
    ? (callLog.recording_url.startsWith('http') ? callLog.recording_url : `http://localhost:5000${callLog.recording_url}`)
    : null;

  return (
    <div 
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 99999,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '16px',
        backgroundColor: 'rgba(3, 7, 18, 0.85)',
        backdropFilter: 'blur(16px)'
      }}
    >
      <div 
        style={{
          position: 'relative',
          width: '100%',
          maxWidth: '680px',
          maxHeight: '90vh',
          background: 'linear-gradient(145deg, #090d16 0%, #0f172a 100%)',
          border: '1px solid rgba(56, 189, 248, 0.35)',
          borderRadius: '24px',
          boxShadow: '0 25px 60px rgba(0, 0, 0, 0.9), 0 0 35px rgba(2, 132, 199, 0.25)',
          overflow: 'hidden',
          display: 'flex',
          flexDirection: 'column',
          color: '#f8fafc',
          fontFamily: 'Inter, sans-serif'
        }}
      >
        {/* Header Bar */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '16px 20px', background: '#060a12', borderBottom: '1px solid rgba(255, 255, 255, 0.08)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div style={{ padding: '8px', borderRadius: '12px', background: 'rgba(56, 189, 248, 0.15)', color: '#38bdf8', border: '1px solid rgba(56, 189, 248, 0.3)' }}>
              <Phone size={20} />
            </div>
            <div>
              <h2 style={{ fontSize: '16px', fontWeight: 800, color: '#ffffff', display: 'flex', alignItems: 'center', gap: '8px', margin: 0 }}>
                📄 Chi Tiết Lịch Sử Cuộc Gọi #{callLog.id}
              </h2>
              <p style={{ fontSize: '12px', color: '#94a3b8', margin: '2px 0 0 0' }}>
                Thời gian: {new Date(callLog.call_datetime).toLocaleString('vi-VN')}
              </p>
            </div>
          </div>

          <button onClick={onClose} style={{ background: 'none', border: 'none', color: '#94a3b8', cursor: 'pointer', padding: '6px' }}>
            <X size={20} />
          </button>
        </div>

        {/* Content Body */}
        <div style={{ padding: '20px', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '16px', flex: 1 }}>
          
          {/* Top Badges Status Row */}
          <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: '10px', padding: '12px 16px', background: '#040711', borderRadius: '14px', border: '1px solid rgba(255,255,255,0.08)' }}>
            <div style={{ fontSize: '12px', color: '#94a3b8' }}>Loại cuộc gọi:</div>
            <Badge type={callLog.call_type} />
            
            <div style={{ fontSize: '12px', color: '#94a3b8', marginLeft: '12px' }}>Thời lượng:</div>
            <span style={{ fontSize: '12px', fontWeight: 800, color: '#38bdf8', fontFamily: 'monospace' }}>
              <Clock size={12} style={{ display: 'inline', marginRight: 4 }} />
              {callLog.duration_minutes} phút
            </span>

            <div style={{ fontSize: '12px', color: '#94a3b8', marginLeft: '12px' }}>Kết quả:</div>
            <span style={{ fontSize: '12px', fontWeight: 800, color: '#34d399' }}>
              <CheckCircle2 size={12} style={{ display: 'inline', marginRight: 4 }} />
              {callLog.outcome || 'Hoàn thành'}
            </span>
          </div>

          {/* Customer & Employee Information Cards */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '14px' }}>
            
            {/* Customer Info Card */}
            <div style={{ padding: '16px', background: 'rgba(15, 23, 42, 0.7)', border: '1px solid rgba(56, 189, 248, 0.2)', borderRadius: '16px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <div style={{ fontSize: '12px', fontWeight: 800, textTransform: 'uppercase', color: '#38bdf8', display: 'flex', alignItems: 'center', gap: '6px' }}>
                <Building size={16} /> Thông Tin Khách Hàng
              </div>
              <div style={{ fontSize: '14px', fontWeight: 800, color: '#ffffff' }}>
                {callLog.client?.company_name || 'Khách Hàng ECS'}
              </div>
              <div style={{ fontSize: '12px', color: '#cbd5e1' }}>
                👤 Người liên hệ: {callLog.client?.contact_person || '-'}
              </div>
              <div style={{ fontSize: '12px', color: '#38bdf8', fontFamily: 'monospace' }}>
                📞 SĐT: {callLog.client?.phone || '-'}
              </div>
              <div style={{ fontSize: '12px', color: '#94a3b8' }}>
                ✉️ Email: {callLog.client?.email || '-'}
              </div>
            </div>

            {/* Employee Info Card */}
            <div style={{ padding: '16px', background: 'rgba(15, 23, 42, 0.7)', border: '1px solid rgba(245, 158, 11, 0.2)', borderRadius: '16px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <div style={{ fontSize: '12px', fontWeight: 800, textTransform: 'uppercase', color: '#fbbf24', display: 'flex', alignItems: 'center', gap: '6px' }}>
                <User size={16} /> Nhân Viên Thực Hiện
              </div>
              <div style={{ fontSize: '14px', fontWeight: 800, color: '#ffffff' }}>
                {callLog.employee ? `${callLog.employee.last_name} ${callLog.employee.first_name}` : 'Hệ Thống ECS'}
              </div>
              <div style={{ fontSize: '12px', color: '#cbd5e1' }}>
                🆔 Mã NV: {callLog.employee?.emp_code || callLog.employee?.employee_code || '-'}
              </div>
              <div style={{ fontSize: '12px', color: '#94a3b8' }}>
                🏢 Phòng ban: {callLog.employee?.department?.name || 'Dịch Vụ Khách Hàng'}
              </div>
            </div>

          </div>

          {/* Call Purpose & Notes */}
          <div style={{ padding: '16px', background: '#040711', borderRadius: '16px', border: '1px solid rgba(255, 255, 255, 0.08)', display: 'flex', flexDirection: 'column', gap: '10px' }}>
            <div>
              <div style={{ fontSize: '12px', fontWeight: 700, color: '#94a3b8', marginBottom: '4px' }}>Mục Đích Cuộc Gọi:</div>
              <div style={{ fontSize: '13px', fontWeight: 700, color: '#ffffff' }}>{callLog.purpose || 'Tư vấn giải pháp và hỗ trợ dịch vụ ECS'}</div>
            </div>
            
            {callLog.notes && (
              <div style={{ borderTop: '1px solid rgba(255,255,255,0.06)', paddingTop: '8px' }}>
                <div style={{ fontSize: '12px', fontWeight: 700, color: '#94a3b8', marginBottom: '4px' }}>Ghi Chú Nối Tiếp:</div>
                <div style={{ fontSize: '12px', color: '#cbd5e1' }}>{callLog.notes}</div>
              </div>
            )}
          </div>

          {/* Audio Recording Player Bar */}
          {audioUrl ? (
            <div style={{ padding: '14px 16px', background: '#040711', borderRadius: '16px', border: '1px solid rgba(56, 189, 248, 0.3)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '12px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '13px', fontWeight: 800, color: '#38bdf8' }}>
                <Volume2 size={18} /> File Ghi Âm Cuộc Gọi Thoại:
              </div>
              <audio controls src={audioUrl} style={{ height: '36px', maxWidth: '320px', flex: 1 }} />
            </div>
          ) : (
            <div style={{ padding: '12px', background: '#040711', borderRadius: '12px', color: '#94a3b8', fontSize: '12px', textAlign: 'center' }}>
              Chưa có file ghi âm âm thanh cho cuộc gọi này.
            </div>
          )}

          {/* AI Analysis Summary Banner */}
          <div style={{ padding: '14px 16px', background: 'linear-gradient(135deg, rgba(2, 132, 199, 0.15) 0%, rgba(139, 92, 246, 0.15) 100%)', borderRadius: '16px', border: '1px solid rgba(56, 189, 248, 0.3)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '12px' }}>
            <div>
              <div style={{ fontSize: '13px', fontWeight: 800, color: '#ffffff', display: 'flex', alignItems: 'center', gap: '6px' }}>
                <Sparkles size={16} color="#fbbf24" /> Kết Quả Phân Tích AI Giọng Điệu & Chất Lượng
              </div>
              <div style={{ fontSize: '12px', color: '#cbd5e1', marginTop: '2px' }}>
                Tỉ lệ chốt HĐ: <strong style={{ color: '#34d399' }}>{callLog.aiAnalysis?.closing_probability || 85}%</strong> · Điểm NV: <strong style={{ color: '#fbbf24' }}>{callLog.aiAnalysis?.overall_score || 88}/100</strong>
              </div>
            </div>

            <button
              onClick={() => {
                onClose();
                if (onOpenAIReport) onOpenAIReport(callLog.id);
              }}
              style={{
                padding: '8px 16px',
                fontSize: '12px',
                fontWeight: 800,
                color: '#ffffff',
                background: 'linear-gradient(135deg, #0284c7 0%, #2563eb 100%)',
                border: 'none',
                borderRadius: '10px',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                boxShadow: '0 4px 12px rgba(2, 132, 199, 0.4)'
              }}
            >
              <Sparkles size={14} /> Mở Báo Cáo AI Đầy Đủ
            </button>
          </div>

        </div>

        {/* Footer Bar */}
        <div style={{ padding: '12px 20px', background: '#060a12', borderTop: '1px solid rgba(255, 255, 255, 0.08)', display: 'flex', justifyContent: 'flex-end' }}>
          <button onClick={onClose} style={{ padding: '8px 20px', fontSize: '12px', fontWeight: 800, color: '#f8fafc', background: '#1e293b', border: '1px solid rgba(255, 255, 255, 0.15)', borderRadius: '12px', cursor: 'pointer' }}>
            Đóng Chi Tiết
          </button>
        </div>

      </div>
    </div>
  );
}
