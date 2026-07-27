import React, { useEffect, useState } from 'react';
import { reportsApi } from '../api';
import { StatCard, Loading } from '../components/UI';
import {
  AreaChart, Area, BarChart, Bar, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer
} from 'recharts';
import { Users, Briefcase, Settings, AlertTriangle, Sparkles, PhoneCall } from 'lucide-react';
import axios from 'axios';

const COLORS = ['#2563eb', '#06b6d4', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6'];

const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    return (
      <div style={{
        background: '#111827',
        border: '1px solid rgba(255, 255, 255, 0.15)',
        padding: '10px 14px',
        borderRadius: '8px',
        boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.5)'
      }}>
        <p style={{ margin: 0, color: '#94a3b8', fontSize: '12px', fontWeight: 600, marginBottom: '4px' }}>
          {label}
        </p>
        {payload.map((pld) => (
          <p key={pld.name} style={{ margin: 0, color: '#f1f5f9', fontSize: '13px', fontWeight: 500, display: 'flex', alignItems: 'center', gap: '6px' }}>
            <span style={{ color: pld.color || pld.payload?.fill || '#2563eb' }}>●</span>
            <span>{pld.name === 'revenue' ? 'Doanh thu' : pld.name === 'count' ? 'Số lượng' : pld.name}:</span>
            <strong style={{ color: '#ffffff' }}>
              {pld.name === 'revenue' ? `$${Number(pld.value).toLocaleString()}` : pld.value}
            </strong>
          </p>
        ))}
      </div>
    );
  }
  return null;
};

export default function DashboardPage() {
  const [data, setData] = useState(null);
  const [aiStats, setAiStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('token');
    const authHeaders = token ? { 'Authorization': `Bearer ${token}` } : {};

    Promise.all([
      reportsApi.getDashboard(),
      axios.get('http://localhost:5000/api/call-logs/ai-stats', { headers: authHeaders }).catch(() => ({ data: null }))
    ]).then(([r, aiRes]) => {
      setData(r.data);
      setAiStats(aiRes.data);
      setLoading(false);
    });
  }, []);

  if (loading) return <Loading />;

  const revenueData = data?.revenueByMonth?.map(m => ({
    month: m.month, revenue: parseFloat(m.total || 0)
  })) || [];

  const serviceData = data?.clientsByService?.map(s => ({
    name: s.service?.name?.split(' ')[0] || 'Other',
    value: parseInt(s.count || 0)
  })) || [];

  const paymentData = data?.paymentStats?.map(p => ({
    name: p.status, count: parseInt(p.count), total: parseFloat(p.total || 0)
  })) || [];

  return (
    <div>
      <div className="page-header">
        <div>
          <h2>📊 Dashboard & Báo Cáo Phân Tích AI</h2>
          <p>Tổng quan hệ thống ECS, Tỉ lệ chốt hợp đồng & Chất lượng dịch vụ nhân viên</p>
        </div>
        <div style={{ color: 'var(--text-muted)', fontSize: '13px' }}>
          {new Date().toLocaleDateString('vi-VN', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
        </div>
      </div>

      {/* Stat Cards */}
      <div className="grid-4 mb-4" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))' }}>
        <StatCard value={data?.totalClients ?? 0} label="Khách Hàng Active" icon={<Briefcase size={24} color="#3b82f6" />} color="blue" />
        <StatCard value={data?.totalEmployees ?? 0} label="Nhân Viên Active" icon={<Users size={24} color="#10b981" />} color="green" />
        <StatCard value={`${aiStats?.avg_closing_probability || 85}%`} label="Tỉ Lệ Chốt Hợp Đồng" icon={<Sparkles size={24} color="#06b6d4" />} color="cyan" />
        <StatCard value={`${aiStats?.avg_overall_score || 88}/100`} label="Điểm Chất Lượng NV" icon={<PhoneCall size={24} color="#f59e0b" />} color="yellow" />
      </div>

      <div className="grid-2 mb-4">
        {/* Revenue Chart */}
        <div className="card">
          <h3 style={{ marginBottom: '20px', fontSize: '15px', fontWeight: 600 }}>📈 Doanh Thu Theo Tháng</h3>
          <ResponsiveContainer width="100%" height={220}>
            <AreaChart data={revenueData}>
              <defs>
                <linearGradient id="colorRev" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#2563eb" stopOpacity={0.8} />
                  <stop offset="95%" stopColor="#2563eb" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
              <XAxis dataKey="month" stroke="var(--text-muted)" fontSize={11} />
              <YAxis stroke="var(--text-muted)" fontSize={11} />
              <Tooltip content={<CustomTooltip />} />
              <Area type="monotone" dataKey="revenue" stroke="#2563eb" fillOpacity={1} fill="url(#colorRev)" />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        {/* Services Pie Chart */}
        <div className="card">
          <h3 style={{ marginBottom: '20px', fontSize: '15px', fontWeight: 600 }}>⚙️ Phân Bố Khách Hàng Theo Dịch Vụ</h3>
          <ResponsiveContainer width="100%" height={220}>
            <PieChart>
              <Pie data={serviceData} cx="50%" cy="50%" outerRadius={75} dataKey="value" label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}>
                {serviceData.map((_, i) => (
                  <Cell key={i} fill={COLORS[i % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip content={<CustomTooltip />} />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Payment Status Bar Chart */}
      <div className="card">
        <h3 style={{ marginBottom: '20px', fontSize: '15px', fontWeight: 600 }}>💳 Trạng Thái Thanh Toán</h3>
        <ResponsiveContainer width="100%" height={200}>
          <BarChart data={paymentData}>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
            <XAxis dataKey="name" stroke="var(--text-muted)" fontSize={11} />
            <YAxis stroke="var(--text-muted)" fontSize={11} />
            <Tooltip content={<CustomTooltip />} />
            <Bar dataKey="count" fill="#06b6d4" radius={[6, 6, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
