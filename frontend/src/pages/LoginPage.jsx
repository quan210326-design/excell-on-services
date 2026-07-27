import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';
import { Eye, EyeOff, Zap } from 'lucide-react';

export default function LoginPage() {
  const [form, setForm] = useState({ username: '', password: '' });
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const data = await login(form.username, form.password);
      toast.success('Đăng nhập thành công!');
      navigate(data.user?.role === 'admin' ? '/' : '/clients');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Đăng nhập thất bại');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #0a0f1e 0%, #0d1526 50%, #0a0f1e 100%)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '20px',
      position: 'relative',
      overflow: 'hidden'
    }}>
      {/* Background decoration */}
      <div style={{
        position: 'absolute', width: '500px', height: '500px',
        borderRadius: '50%', background: 'radial-gradient(circle, rgba(37,99,235,0.15), transparent)',
        top: '-200px', right: '-100px', pointerEvents: 'none'
      }}/>
      <div style={{
        position: 'absolute', width: '400px', height: '400px',
        borderRadius: '50%', background: 'radial-gradient(circle, rgba(6,182,212,0.1), transparent)',
        bottom: '-150px', left: '-100px', pointerEvents: 'none'
      }}/>

      <div style={{
        background: 'var(--bg-card)',
        border: '1px solid var(--border)',
        borderRadius: '20px',
        padding: '48px',
        width: '100%',
        maxWidth: '440px',
        boxShadow: '0 40px 80px rgba(0,0,0,0.6)',
        position: 'relative',
        animation: 'slideUp 0.4s'
      }}>
        {/* Logo */}
        <div style={{ textAlign: 'center', marginBottom: '36px' }}>
          <div style={{
            width: '64px', height: '64px',
            borderRadius: '16px',
            background: 'linear-gradient(135deg, #2563eb, #06b6d4)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            margin: '0 auto 16px',
            boxShadow: '0 8px 24px rgba(37,99,235,0.4)'
          }}>
            <Zap size={32} color="white" />
          </div>
          <h1 style={{ fontSize: '26px', fontWeight: 800, background: 'linear-gradient(135deg, #2563eb, #06b6d4)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
            ECS Portal
          </h1>
          <p style={{ color: 'var(--text-muted)', fontSize: '14px', marginTop: '6px' }}>
            Excell-On Consulting Services
          </p>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label">Tên Đăng Nhập</label>
            <input
              id="username"
              className="form-control"
              type="text"
              placeholder="Nhập username..."
              value={form.username}
              onChange={(e) => setForm({ ...form, username: e.target.value })}
              required
              autoFocus
            />
          </div>

          <div className="form-group" style={{ position: 'relative' }}>
            <label className="form-label">Mật Khẩu</label>
            <input
              id="password"
              className="form-control"
              type={showPass ? 'text' : 'password'}
              placeholder="Nhập mật khẩu..."
              style={{ paddingRight: '42px' }}
              value={form.password}
              onChange={(e) => setForm({ ...form, password: e.target.value })}
              required
            />
            <button
              type="button"
              onClick={() => setShowPass(!showPass)}
              style={{
                position: 'absolute', right: '12px', bottom: '10px',
                background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)'
              }}
            >
              {showPass ? <EyeOff size={16} /> : <Eye size={16} />}
            </button>
          </div>

          <button
            id="login-btn"
            type="submit"
            className="btn btn-primary w-full"
            disabled={loading}
            style={{ marginTop: '8px', justifyContent: 'center', padding: '12px' }}
          >
            {loading ? 'Đang đăng nhập...' : ' Đăng Nhập'}
          </button>
        </form>

        {/* <div style={{
          marginTop: '24px', padding: '14px', background: 'rgba(37,99,235,0.08)',
          border: '1px solid rgba(37,99,235,0.2)', borderRadius: '8px'
        }}>
          <p style={{ fontSize: '12px', color: 'var(--text-muted)', marginBottom: '6px', fontWeight: 600 }}>
            💡 Tài khoản demo:
          </p>
          <p style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>
            Admin: <strong>admin</strong> / <strong>Admin@123</strong>
          </p>
        </div> */}
      </div>
    </div>
  );
}
