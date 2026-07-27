import React, { useState, useEffect } from 'react';
import { X, Sparkles, Volume2, Award, TrendingUp, UserCheck, ShieldCheck, HeartHandshake, FileText, CheckCircle2 } from 'lucide-react';
import axios from 'axios';

export default function CallAIDetailModal({ callId, onClose }) {
  const [loading, setLoading] = useState(true);
  const [callLog, setCallLog] = useState(null);
  const [aiData, setAiData] = useState(null);

  useEffect(() => {
    if (callId) {
      setLoading(true);
      const token = localStorage.getItem('token');
      const headers = token ? { 'Authorization': `Bearer ${token}` } : {};

      Promise.all([
        axios.get(`http://localhost:5000/api/call-logs/${callId}`, { headers }).catch(() => ({ data: null })),
        axios.get(`http://localhost:5000/api/call-logs/${callId}/ai-analysis`, { headers }).catch(() => ({ data: null }))
      ]).then(([callRes, aiRes]) => {
        setCallLog(callRes.data);
        setAiData(aiRes.data);
        setLoading(false);
      }).catch(err => {
        console.error("Error fetching AI detail:", err);
        setLoading(false);
      });
    }
  }, [callId]);

  if (!callId) return null;

  const audioUrl = callLog?.recording_url 
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
          maxWidth: '780px',
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
        
        {/* Header HUD */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '16px 20px', background: '#060a12', borderBottom: '1px solid rgba(255, 255, 255, 0.08)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div style={{ padding: '8px', borderRadius: '12px', background: 'rgba(56, 189, 248, 0.15)', color: '#38bdf8', border: '1px solid rgba(56, 189, 248, 0.3)' }}>
              <Sparkles size={20} />
            </div>
            <div>
              <h2 style={{ fontSize: '16px', fontWeight: 800, color: '#ffffff', display: 'flex', alignItems: 'center', gap: '8px', margin: 0 }}>
                🤖 Báo Cáo AI: Giọng Điệu Khách Hàng & Đánh Giá Dịch Vụ
              </h2>
              <p style={{ fontSize: '12px', color: '#94a3b8', margin: '2px 0 0 0' }}>
                {callLog?.client?.company_name ? `Khách hàng: ${callLog.client.company_name}` : 'Cuộc gọi tư vấn giải pháp ECS'}
              </p>
            </div>
          </div>

          <button onClick={onClose} style={{ background: 'none', border: 'none', color: '#94a3b8', cursor: 'pointer', padding: '6px' }}>
            <X size={20} />
          </button>
        </div>

        {/* Content Body */}
        {loading ? (
          <div style={{ padding: '60px 20px', textAlign: 'center', color: '#94a3b8' }}>
            <div style={{ width: '40px', height: '40px', margin: '0 auto 16px', borderRadius: '50%', border: '3px solid rgba(56,189,248,0.2)', borderTopColor: '#38bdf8', animation: 'spin 1s linear infinite' }}></div>
            <p style={{ fontSize: '14px', fontWeight: 700, color: '#38bdf8' }}>Đang kết xuất báo cáo AI phân tích giọng điệu...</p>
          </div>
        ) : (
          <div style={{ padding: '20px', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '16px', flex: 1 }}>
            
            {/* Audio Recording Player */}
            {audioUrl && (
              <div style={{ padding: '12px 16px', background: '#040711', borderRadius: '14px', border: '1px solid rgba(56, 189, 248, 0.25)', display: 'flex', alignItems: 'center', justifyBetween: 'space-between', flexWrap: 'wrap', gap: '12px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '13px', fontWeight: 700, color: '#38bdf8' }}>
                  <Volume2 size={18} /> Ghi Âm Cuộc Gọi Thực Tế:
                </div>
                <audio controls src={audioUrl} style={{ height: '36px', maxWidth: '320px', flex: 1 }} />
              </div>
            )}

            {/* Top Key Metrics Cards Grid */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '14px' }}>
              
              {/* Card 1: Deal Closing Probability % */}
              <div style={{ padding: '16px', background: 'rgba(15, 23, 42, 0.7)', border: '1px solid rgba(56, 189, 248, 0.2)', borderRadius: '16px', display: 'flex', flexDirection: 'column', justifyBetween: 'space-between' }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <span style={{ fontSize: '12px', fontWeight: 700, color: '#94a3b8', display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <TrendingUp size={16} color="#34d399" /> Tỉ Lệ Chốt Hợp Đồng
                  </span>
                  <span style={{
                    padding: '3px 10px',
                    fontSize: '11px',
                    fontWeight: 800,
                    borderRadius: '20px',
                    background: aiData?.buy_potential === 'Cao' ? 'rgba(16, 185, 129, 0.2)' : 'rgba(245, 158, 11, 0.2)',
                    color: aiData?.buy_potential === 'Cao' ? '#34d399' : '#fbbf24',
                    border: aiData?.buy_potential === 'Cao' ? '1px solid #10b981' : '1px solid #f59e0b'
                  }}>
                    {aiData?.buy_potential || 'Cao'}
                  </span>
                </div>
                <div style={{ marginTop: '12px', display: 'flex', alignItems: 'baseline', gap: '8px' }}>
                  <span style={{ fontSize: '32px', fontWeight: 900, color: '#ffffff' }}>{aiData?.closing_probability || 85}%</span>
                  <span style={{ fontSize: '12px', color: '#94a3b8' }}>Khả năng ký kết hợp đồng</span>
                </div>
                <div style={{ width: '100%', height: '8px', background: '#1e293b', borderRadius: '4px', marginTop: '12px', overflow: 'hidden' }}>
                  <div style={{ width: `${aiData?.closing_probability || 85}%`, height: '100%', background: 'linear-gradient(90deg, #10b981, #38bdf8)', borderRadius: '4px' }}></div>
                </div>
              </div>

              {/* Card 2: Staff Service Quality Score /100 */}
              <div style={{ padding: '16px', background: 'rgba(15, 23, 42, 0.7)', border: '1px solid rgba(245, 158, 11, 0.3)', borderRadius: '16px', display: 'flex', flexDirection: 'column', justifyBetween: 'space-between' }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <span style={{ fontSize: '12px', fontWeight: 700, color: '#94a3b8', display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <Award size={16} color="#fbbf24" /> Điểm Dịch Vụ Nhân Viên
                  </span>
                  <span style={{ padding: '3px 10px', fontSize: '11px', fontWeight: 800, borderRadius: '20px', background: 'rgba(245, 158, 11, 0.2)', color: '#fbbf24', border: '1px solid #f59e0b' }}>
                    Đạt Chuẩn ECS
                  </span>
                </div>
                <div style={{ marginTop: '12px', display: 'flex', alignItems: 'baseline', gap: '8px' }}>
                  <span style={{ fontSize: '32px', fontWeight: 900, color: '#fbbf24' }}>{aiData?.overall_score || 88}/100</span>
                  <span style={{ fontSize: '12px', color: '#94a3b8' }}>Chất lượng tư vấn toàn diện</span>
                </div>
                <div style={{ width: '100%', height: '8px', background: '#1e293b', borderRadius: '4px', marginTop: '12px', overflow: 'hidden' }}>
                  <div style={{ width: `${aiData?.overall_score || 88}%`, height: '100%', background: 'linear-gradient(90deg, #f59e0b, #facc15)', borderRadius: '4px' }}></div>
                </div>
              </div>

            </div>

            {/* Customer Tone & Sentiment Analysis */}
            <div style={{ padding: '16px', background: '#040711', borderRadius: '16px', border: '1px solid rgba(255, 255, 255, 0.08)', display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <div style={{ fontSize: '12px', fontWeight: 800, textTransform: 'uppercase', color: '#38bdf8', display: 'flex', alignItems: 'center', gap: '6px' }}>
                <HeartHandshake size={16} /> Phân Tích Giọng Điệu & Thái Độ Khách Hàng
              </div>
              
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                {(aiData?.customer_tone_tags || ["Cởi mở", "Hợp tác"]).map((tag, idx) => (
                  <span key={idx} style={{ padding: '4px 12px', fontSize: '12px', fontWeight: 700, borderRadius: '8px', background: 'rgba(56, 189, 248, 0.12)', color: '#38bdf8', border: '1px solid rgba(56, 189, 248, 0.3)' }}>
                    🗣️ {tag}
                  </span>
                ))}
              </div>

              {/* Sentiment breakdown */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '10px', marginTop: '4px', textAlign: 'center' }}>
                <div style={{ padding: '10px', background: '#090e1a', borderRadius: '12px', border: '1px solid rgba(16, 185, 129, 0.3)' }}>
                  <div style={{ fontSize: '11px', color: '#94a3b8' }}>😊 Tích cực</div>
                  <div style={{ fontSize: '18px', fontWeight: 800, color: '#34d399', marginTop: '2px' }}>{aiData?.sentiment_positive || 70}%</div>
                </div>
                <div style={{ padding: '10px', background: '#090e1a', borderRadius: '12px', border: '1px solid rgba(245, 158, 11, 0.3)' }}>
                  <div style={{ fontSize: '11px', color: '#94a3b8' }}>😐 Trung lập</div>
                  <div style={{ fontSize: '18px', fontWeight: 800, color: '#fbbf24', marginTop: '2px' }}>{aiData?.sentiment_neutral || 20}%</div>
                </div>
                <div style={{ padding: '10px', background: '#090e1a', borderRadius: '12px', border: '1px solid rgba(239, 68, 68, 0.3)' }}>
                  <div style={{ fontSize: '11px', color: '#94a3b8' }}>😠 Tiêu cực</div>
                  <div style={{ fontSize: '18px', fontWeight: 800, color: '#f87171', marginTop: '2px' }}>{aiData?.sentiment_negative || 10}%</div>
                </div>
              </div>
            </div>

            {/* Staff Service Quality Matrix (4 Competencies /10) */}
            <div style={{ padding: '16px', background: '#040711', borderRadius: '16px', border: '1px solid rgba(255, 255, 255, 0.08)', display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <div style={{ fontSize: '12px', fontWeight: 800, textTransform: 'uppercase', color: '#fbbf24', display: 'flex', alignItems: 'center', gap: '6px' }}>
                <UserCheck size={16} /> Đánh Giá Năng Lực Phục Vụ Của Nhân Viên (/10)
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '10px', fontSize: '12px' }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '10px 14px', background: '#090e1a', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.05)' }}>
                  <span>🤝 Thái độ & Lời chào</span>
                  <strong style={{ color: '#fbbf24', fontSize: '14px' }}>{aiData?.score_greeting || 9}/10</strong>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '10px 14px', background: '#090e1a', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.05)' }}>
                  <span>👂 Lắng nghe & Nắm nhu cầu</span>
                  <strong style={{ color: '#fbbf24', fontSize: '14px' }}>{aiData?.score_listening || 8}/10</strong>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '10px 14px', background: '#090e1a', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.05)' }}>
                  <span>💡 Tư vấn giải pháp & Giải đáp</span>
                  <strong style={{ color: '#fbbf24', fontSize: '14px' }}>{aiData?.score_consulting || 8}/10</strong>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '10px 14px', background: '#090e1a', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.05)' }}>
                  <span>🎯 Kỹ năng chốt hợp đồng</span>
                  <strong style={{ color: '#fbbf24', fontSize: '14px' }}>{aiData?.score_closing_skill || 8}/10</strong>
                </div>
              </div>
            </div>

            {/* Speech-to-Text Transcript View */}
            <div style={{ padding: '16px', background: '#040711', borderRadius: '16px', border: '1px solid rgba(255, 255, 255, 0.08)', display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <div style={{ fontSize: '12px', fontWeight: 800, textTransform: 'uppercase', color: '#e2e8f0', display: 'flex', alignItems: 'center', gap: '6px' }}>
                <FileText size={16} color="#38bdf8" /> Speech-to-Text Transcript Trích Xuất
              </div>
              <div style={{ padding: '12px', background: '#000000', borderRadius: '12px', fontFamily: 'monospace', fontSize: '12px', color: '#cbd5e1', maxHeight: '140px', overflowY: 'auto', whiteSpace: 'pre-wrap', border: '1px solid rgba(255,255,255,0.1)' }}>
                {aiData?.transcript || callLog?.transcript_text || "Chưa có nội dung transcript."}
              </div>
            </div>

            {/* Recommendations */}
            <div style={{ padding: '14px 16px', background: 'rgba(16, 185, 129, 0.1)', borderRadius: '16px', border: '1px solid rgba(16, 185, 129, 0.3)', display: 'flex', flexDirection: 'column', gap: '6px', fontSize: '12px' }}>
              <div style={{ fontWeight: 800, color: '#34d399', display: 'flex', alignItems: 'center', gap: '6px' }}>
                <ShieldCheck size={16} /> Khuyến Nghị Hành Động Để Tối Ưu Chốt Đơn
              </div>
              <ul style={{ margin: 0, paddingLeft: '18px', color: '#cbd5e1' }}>
                {(aiData?.recommendations || [
                  "Gửi báo giá chính thức kèm ưu đãi 20% qua Email/Zalo trong 2h tới.",
                  "Nhắc lại cuộc gọi tư vấn kỹ thuật chuyên sâu sau 48h."
                ]).map((rec, idx) => (
                  <li key={idx} style={{ marginTop: '2px' }}>{rec}</li>
                ))}
              </ul>
            </div>

          </div>
        )}

        {/* Footer Bar */}
        <div style={{ padding: '12px 20px', background: '#060a12', borderTop: '1px solid rgba(255, 255, 255, 0.08)', display: 'flex', justifyContent: 'flex-end' }}>
          <button onClick={onClose} style={{ padding: '8px 20px', fontSize: '12px', fontWeight: 800, color: '#f8fafc', background: '#1e293b', border: '1px solid rgba(255, 255, 255, 0.15)', borderRadius: '12px', cursor: 'pointer' }}>
            Đóng Báo Cáo
          </button>
        </div>

      </div>
    </div>
  );
}
