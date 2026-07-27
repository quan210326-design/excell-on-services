import React, { useState, useEffect, useRef } from 'react';
import { Phone, PhoneOff, Pause, Play, Mic, MicOff, User, Sparkles, X, Bot, Building, Minus, Maximize2, Radio } from 'lucide-react';
import axios from 'axios';

export default function VirtualCallModal({ isOpen, onClose, onCallCompleted, initialClient }) {
  const [clients, setClients] = useState([]);
  const [selectedClientId, setSelectedClientId] = useState("");
  const [clientName, setClientName] = useState("Khách Hàng ECS");
  const [clientPhone, setClientPhone] = useState("0901234567");
  const [purpose, setPurpose] = useState("Tư vấn giải pháp quản lý & dịch vụ ECS");
  
  const [isCalling, setIsCalling] = useState(false);
  const [isHold, setIsHold] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [elapsedSeconds, setElapsedSeconds] = useState(0);
  const [analyzing, setAnalyzing] = useState(false);

  const mediaRecorderRef = useRef(null);
  const audioChunksRef = useRef([]);
  const timerRef = useRef(null);
  const canvasRef = useRef(null);
  const animationFrameRef = useRef(null);
  const audioContextRef = useRef(null);

  useEffect(() => {
    if (isOpen) {
      if (initialClient) {
        setClientName(initialClient.company_name || initialClient.contact_person || "Khách Hàng ECS");
        setClientPhone(initialClient.phone || "0901234567");
        setSelectedClientId(initialClient.id ? String(initialClient.id) : "");
      }
      const token = localStorage.getItem('token');
      axios.get('http://localhost:5000/api/clients', {
        headers: token ? { 'Authorization': `Bearer ${token}` } : {}
      }).then(res => {
        setClients(res.data || []);
        if (!initialClient && res.data && res.data.length > 0) {
          const first = res.data[0];
          setSelectedClientId(first.id);
          setClientName(first.company_name || first.contact_person || "Khách Hàng ECS");
          setClientPhone(first.phone || "0901234567");
        }
      }).catch(err => console.warn("Could not load clients list:", err));
    }
  }, [isOpen, initialClient]);

  const handleSelectClient = (e) => {
    const val = e.target.value;
    setSelectedClientId(val);
    if (val) {
      const found = clients.find(c => String(c.id) === String(val));
      if (found) {
        setClientName(found.company_name || found.contact_person || "Khách Hàng ECS");
        setClientPhone(found.phone || "0901234567");
      }
    }
  };

  useEffect(() => {
    if (isCalling && !isHold) {
      timerRef.current = setInterval(() => {
        setElapsedSeconds(prev => prev + 1);
      }, 1000);
    } else {
      clearInterval(timerRef.current);
    }
    return () => clearInterval(timerRef.current);
  }, [isCalling, isHold]);

  if (!isOpen) return null;

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const handleStartCall = async () => {
    try {
      setIsCalling(true);
      setIsHold(false);
      setIsMuted(false);
      setElapsedSeconds(0);

      try {
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        audioChunksRef.current = [];
        const mediaRecorder = new MediaRecorder(stream);
        
        mediaRecorder.ondataavailable = (event) => {
          if (event.data.size > 0) {
            audioChunksRef.current.push(event.data);
          }
        };

        mediaRecorder.start(500);
        mediaRecorderRef.current = mediaRecorder;
        setupAudioVisualizer(stream);
      } catch (micErr) {
        console.warn("Microphone simulation active:", micErr);
      }
    } catch (err) {
      console.error("Error starting call:", err);
    }
  };

  const setupAudioVisualizer = (stream) => {
    try {
      const audioCtx = new (window.AudioContext || window.webkitAudioContext)();
      audioContextRef.current = audioCtx;
      const analyser = audioCtx.createAnalyser();
      const source = audioCtx.createMediaStreamSource(stream);
      source.connect(analyser);
      analyser.fftSize = 64;

      const bufferLength = analyser.frequencyBinCount;
      const dataArray = new Uint8Array(bufferLength);
      const canvas = canvasRef.current;
      if (!canvas) return;
      const ctx = canvas.getContext('2d');

      const draw = () => {
        if (!isCalling) return;
        animationFrameRef.current = requestAnimationFrame(draw);
        analyser.getByteFrequencyData(dataArray);

        ctx.clearRect(0, 0, canvas.width, canvas.height);
        const barWidth = (canvas.width / bufferLength) * 2;
        let x = 0;

        for (let i = 0; i < bufferLength; i++) {
          const barHeight = (dataArray[i] / 255) * canvas.height;
          const gradient = ctx.createLinearGradient(0, canvas.height, 0, 0);
          gradient.addColorStop(0, '#06b6d4');
          gradient.addColorStop(0.5, '#3b82f6');
          gradient.addColorStop(1, '#8b5cf6');

          ctx.fillStyle = gradient;
          ctx.fillRect(x, canvas.height - barHeight, barWidth - 3, barHeight);
          x += barWidth;
        }
      };
      draw();
    } catch (e) {
      console.warn("Visualizer canvas error:", e);
    }
  };

  const handleEndCall = async () => {
    setIsCalling(false);
    setAnalyzing(true);
    setIsMinimized(false);

    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
      mediaRecorderRef.current.stop();
      mediaRecorderRef.current.stream.getTracks().forEach(track => track.stop());
    }

    if (animationFrameRef.current) cancelAnimationFrame(animationFrameRef.current);
    if (audioContextRef.current) audioContextRef.current.close();

    setTimeout(async () => {
      try {
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/wav' });
        const formData = new FormData();
        formData.append('audio', audioBlob, `call_${Date.now()}.wav`);
        formData.append('client_name', clientName);
        formData.append('client_phone', clientPhone);
        formData.append('duration_minutes', Math.max(1, Math.ceil(elapsedSeconds / 60)));
        formData.append('purpose', purpose || 'Tư vấn dịch vụ ECS');
        formData.append('transcript_text', `Nhân viên gọi tư vấn cho ${clientName} (${clientPhone}) về nội dung "${purpose}". Cuộc gọi kéo dài ${elapsedSeconds}s.`);

        const token = localStorage.getItem('token');
        const response = await axios.post('http://localhost:5000/api/call-logs/upload-virtual', formData, {
          headers: {
            'Content-Type': 'multipart/form-data',
            ...(token ? { 'Authorization': `Bearer ${token}` } : {})
          }
        });

        setAnalyzing(false);
        onClose();
        if (onCallCompleted) {
          onCallCompleted(response.data.callLog.id);
        }
      } catch (err) {
        console.error("Error processing call upload:", err);
        setAnalyzing(false);
        onClose();
      }
    }, 1200);
  };

  // Minimized Pill (Bottom-Right)
  if (isMinimized) {
    return (
      <div 
        style={{
          position: 'fixed',
          bottom: '20px',
          right: '20px',
          zIndex: 9999,
          display: 'flex',
          alignItems: 'center',
          gap: '12px',
          padding: '10px 18px',
          background: 'rgba(10, 15, 30, 0.95)',
          border: '1px solid rgba(56, 189, 248, 0.5)',
          borderRadius: '30px',
          boxShadow: '0 10px 30px rgba(0, 0, 0, 0.6)',
          backdropFilter: 'blur(16px)',
          color: '#ffffff'
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <span style={{ width: '10px', height: '10px', borderRadius: '50%', background: '#10b981', display: 'inline-block', boxShadow: '0 0 10px #10b981' }}></span>
          <span style={{ fontFamily: 'monospace', fontWeight: 800, fontSize: '13px', color: '#38bdf8' }}>{formatTime(elapsedSeconds)}</span>
        </div>

        <div style={{ fontSize: '13px', fontWeight: 700, maxWidth: '120px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', borderLeft: '1px solid rgba(255, 255, 255, 0.15)', paddingLeft: '10px' }}>
          {clientName}
        </div>
        
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', borderLeft: '1px solid rgba(255, 255, 255, 0.15)', paddingLeft: '8px' }}>
          <button onClick={() => setIsMuted(!isMuted)} style={{ padding: '6px', borderRadius: '50%', border: 'none', background: isMuted ? 'rgba(245, 158, 11, 0.2)' : 'transparent', color: isMuted ? '#fbbf24' : '#cbd5e1', cursor: 'pointer' }}>
            {isMuted ? <MicOff size={14} /> : <Mic size={14} />}
          </button>

          <button onClick={() => setIsHold(!isHold)} style={{ padding: '6px', borderRadius: '50%', border: 'none', background: isHold ? '#f59e0b' : 'transparent', color: isHold ? '#0f172a' : '#cbd5e1', cursor: 'pointer' }}>
            {isHold ? <Play size={14} /> : <Pause size={14} />}
          </button>

          <button onClick={handleEndCall} style={{ padding: '6px', borderRadius: '50%', border: 'none', background: '#ef4444', color: '#ffffff', cursor: 'pointer', boxShadow: '0 0 10px rgba(239, 68, 68, 0.5)' }}>
            <PhoneOff size={14} />
          </button>

          <button onClick={() => setIsMinimized(false)} style={{ padding: '6px', borderRadius: '50%', border: 'none', background: 'transparent', color: '#94a3b8', cursor: 'pointer' }}>
            <Maximize2 size={14} />
          </button>
        </div>
      </div>
    );
  }

  return (
    <div 
      style={{
        position: 'fixed',
        bottom: '24px',
        right: '24px',
        zIndex: 9999,
        width: '380px',
        maxWidth: 'calc(100vw - 32px)',
        background: 'linear-gradient(145deg, #090d16 0%, #0f172a 100%)',
        border: '1px solid rgba(56, 189, 248, 0.35)',
        borderRadius: '20px',
        boxShadow: '0 20px 50px rgba(0, 0, 0, 0.8), 0 0 25px rgba(2, 132, 199, 0.25)',
        backdropFilter: 'blur(20px)',
        overflow: 'hidden',
        color: '#f8fafc',
        fontFamily: 'Inter, sans-serif'
      }}
    >
      {/* Header Bar */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px 16px', background: '#060a12', borderBottom: '1px solid rgba(255, 255, 255, 0.08)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <div style={{ padding: '6px', borderRadius: '10px', background: isCalling ? 'rgba(16, 185, 129, 0.2)' : 'rgba(2, 132, 199, 0.2)', color: isCalling ? '#34d399' : '#38bdf8' }}>
            <Radio size={16} />
          </div>
          <div>
            <div style={{ fontSize: '13px', fontWeight: 800, color: '#ffffff', letterSpacing: '-0.01em' }}>
              📞 Cuộc Gọi Khách Hàng (Ghi Âm Mic)
            </div>
            <div style={{ fontSize: '10.5px', color: '#94a3b8' }}>
              {isCalling ? `Đang kết nối: ${clientName}` : 'Ghi âm hội thoại thực tế & Lưu Call Log'}
            </div>
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
          {isCalling && (
            <button 
              onClick={() => setIsMinimized(true)} 
              style={{ background: 'none', border: 'none', color: '#94a3b8', cursor: 'pointer', padding: '4px' }}
              title="Thu nhỏ"
            >
              <Minus size={16} />
            </button>
          )}
          {!analyzing && (
            <button 
              onClick={onClose} 
              style={{ background: 'none', border: 'none', color: '#94a3b8', cursor: 'pointer', padding: '4px' }}
              title="Đóng"
            >
              <X size={16} />
            </button>
          )}
        </div>
      </div>

      {/* Body Area */}
      <div style={{ padding: '16px', maxHeight: '420px', overflowY: 'auto' }}>
        {!isCalling && !analyzing && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            
            {/* Dropdown Select Client */}
            <div>
              <label style={{ display: 'block', fontSize: '11px', fontWeight: 700, textTransform: 'uppercase', color: '#38bdf8', marginBottom: '6px' }}>
                🏢 Chọn Khách Hàng Gọi Điện
              </label>
              <select
                value={selectedClientId}
                onChange={handleSelectClient}
                style={{
                  width: '100%',
                  padding: '8px 12px',
                  background: '#040711',
                  border: '1px solid rgba(255, 255, 255, 0.15)',
                  borderRadius: '10px',
                  color: '#ffffff',
                  fontSize: '12px',
                  outline: 'none'
                }}
              >
                {clients.map(c => (
                  <option key={c.id} value={c.id}>
                    {c.company_name} ({c.phone || 'Chưa có SĐT'})
                  </option>
                ))}
              </select>
            </div>

            {/* Input Name */}
            <div>
              <label style={{ display: 'block', fontSize: '11px', fontWeight: 700, textTransform: 'uppercase', color: '#94a3b8', marginBottom: '4px' }}>
                Tên Khách Hàng / Công Ty
              </label>
              <input
                type="text"
                value={clientName}
                onChange={(e) => setClientName(e.target.value)}
                style={{
                  width: '100%',
                  padding: '8px 12px',
                  background: '#040711',
                  border: '1px solid rgba(255, 255, 255, 0.15)',
                  borderRadius: '10px',
                  color: '#ffffff',
                  fontSize: '12px',
                  outline: 'none'
                }}
              />
            </div>

            {/* Input Phone */}
            <div>
              <label style={{ display: 'block', fontSize: '11px', fontWeight: 700, textTransform: 'uppercase', color: '#94a3b8', marginBottom: '4px' }}>
                Số Điện Thoại
              </label>
              <input
                type="text"
                value={clientPhone}
                onChange={(e) => setClientPhone(e.target.value)}
                style={{
                  width: '100%',
                  padding: '8px 12px',
                  background: '#040711',
                  border: '1px solid rgba(255, 255, 255, 0.15)',
                  borderRadius: '10px',
                  color: '#ffffff',
                  fontSize: '12px',
                  outline: 'none'
                }}
              />
            </div>

            {/* Purpose Input */}
            <div>
              <label style={{ display: 'block', fontSize: '11px', fontWeight: 700, textTransform: 'uppercase', color: '#94a3b8', marginBottom: '4px' }}>
                Mục Đích Cuộc Gọi / Nội Dung Tư Vấn
              </label>
              <input
                type="text"
                value={purpose}
                onChange={(e) => setPurpose(e.target.value)}
                placeholder="Nội dung trao đổi..."
                style={{
                  width: '100%',
                  padding: '8px 12px',
                  background: '#040711',
                  border: '1px solid rgba(255, 255, 255, 0.15)',
                  borderRadius: '10px',
                  color: '#ffffff',
                  fontSize: '12px',
                  outline: 'none'
                }}
              />
            </div>

          </div>
        )}

        {/* Active Call HUD View */}
        {isCalling && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            <div style={{ textAlign: 'center', padding: '16px', background: '#040711', borderRadius: '16px', border: '1px solid rgba(56, 189, 248, 0.2)' }}>
              <div style={{ width: '48px', height: '48px', margin: '0 auto 8px', borderRadius: '50%', background: 'linear-gradient(135deg, #0284c7, #2563eb)', display: 'flex', alignItems: 'center', justifyCenter: 'center', color: '#ffffff', boxShadow: '0 0 15px rgba(2, 132, 199, 0.5)' }}>
                <User size={24} style={{ margin: 'auto' }} />
              </div>
              <div style={{ fontSize: '15px', fontWeight: 800, color: '#ffffff' }}>{clientName}</div>
              <div style={{ fontSize: '12px', fontFamily: 'monospace', color: '#38bdf8', marginBottom: '8px' }}>{clientPhone}</div>

              {/* Digital Timer */}
              <div style={{ display: 'inline-block', fontSize: '22px', fontFamily: 'monospace', fontWeight: 800, padding: '4px 16px', borderRadius: '10px', background: '#0f172a', color: '#34d399', border: '1px solid rgba(16, 185, 129, 0.3)' }}>
                {formatTime(elapsedSeconds)}
              </div>

              {/* Waveform Canvas */}
              <div style={{ width: '100%', height: '36px', marginTop: '12px', borderRadius: '8px', background: 'rgba(0,0,0,0.5)', overflow: 'hidden' }}>
                <canvas ref={canvasRef} width="340" height="36" style={{ width: '100%', height: '100%' }}></canvas>
              </div>
            </div>

            <div style={{ fontSize: '11px', color: '#94a3b8', textAlign: 'center' }}>
              🎙️ Đang thu âm cuộc hội thoại trực tiếp qua Microphone...
            </div>
          </div>
        )}

        {/* AI Analyzing Spinner */}
        {analyzing && (
          <div style={{ textAlign: 'center', padding: '30px 10px' }}>
            <div style={{ width: '36px', height: '36px', margin: '0 auto 12px', borderRadius: '50%', border: '3px solid rgba(56,189,248,0.2)', borderTopColor: '#38bdf8', animation: 'spin 1s linear infinite' }}></div>
            <div style={{ fontSize: '13px', fontWeight: 800, color: '#ffffff' }}>Đang Lưu Cuộc Gọi & Phân Tích AI...</div>
            <div style={{ fontSize: '11px', color: '#94a3b8', marginTop: '4px' }}>Lưu file âm thanh và đánh giá giọng điệu chốt hợp đồng...</div>
          </div>
        )}
      </div>

      {/* Footer Controls */}
      <div style={{ padding: '12px 16px', background: '#060a12', borderTop: '1px solid rgba(255, 255, 255, 0.08)', textAlign: 'center' }}>
        {!isCalling && !analyzing ? (
          <button
            onClick={handleStartCall}
            style={{
              width: '100%',
              padding: '10px 16px',
              borderRadius: '12px',
              border: 'none',
              background: 'linear-gradient(135deg, #0284c7 0%, #1d4ed8 100%)',
              color: '#ffffff',
              fontSize: '13px',
              fontWeight: 800,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '8px',
              boxShadow: '0 4px 15px rgba(2, 132, 199, 0.4)'
            }}
          >
            <Phone size={16} /> BẮT ĐẦU GỌI (BẬT MICROPHONE)
          </button>
        ) : isCalling ? (
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px' }}>
            <button
              onClick={() => setIsMuted(!isMuted)}
              style={{ padding: '8px 12px', borderRadius: '20px', border: '1px solid rgba(255,255,255,0.15)', background: isMuted ? 'rgba(245, 158, 11, 0.2)' : '#1e293b', color: isMuted ? '#fbbf24' : '#ffffff', cursor: 'pointer' }}
            >
              {isMuted ? <MicOff size={16} /> : <Mic size={16} />}
            </button>

            <button
              onClick={() => setIsHold(!isHold)}
              style={{ padding: '8px 12px', borderRadius: '20px', border: '1px solid rgba(255,255,255,0.15)', background: isHold ? '#f59e0b' : '#1e293b', color: isHold ? '#0f172a' : '#ffffff', cursor: 'pointer' }}
            >
              {isHold ? <Play size={16} /> : <Pause size={16} />}
            </button>

            <button
              onClick={handleEndCall}
              style={{ padding: '8px 20px', borderRadius: '12px', border: 'none', background: '#ef4444', color: '#ffffff', fontSize: '12px', fontWeight: 800, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px', boxShadow: '0 4px 12px rgba(239, 68, 68, 0.4)' }}
            >
              <PhoneOff size={16} /> KẾT THÚC & LƯU GHI ÂM
            </button>
          </div>
        ) : null}
      </div>
    </div>
  );
}
