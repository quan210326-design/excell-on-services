require('dotenv').config();
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const { sequelize, testConnection } = require('./src/config/database');
require('./src/models'); // Khởi tạo models và associations

const app = express();

// ── Security Middleware ────────────────────────────
app.use(helmet());
app.use(cors({
  origin: (origin, callback) => {
    // Cho phép: Twilio webhooks (không có origin), localhost variants, ngrok
    if (!origin
      || origin.includes('localhost')
      || origin.includes('127.0.0.1')
      || origin.includes('[::1]')
      || origin.includes('.ngrok')
    ) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true
}));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// Middleware chuẩn hóa chuỗi rỗng thành null trước khi lưu vào DB
app.use((req, res, next) => {
  if (req.body && typeof req.body === 'object') {
    for (const key in req.body) {
      if (req.body[key] === '') {
        req.body[key] = null;
      }
    }
  }
  next();
});

// Rate limiting (Tăng giới hạn max để tránh lỗi 429 khi tự động sync Call Logs hoặc gọi WebRTC nhiều tab)
const limiter = rateLimit({ windowMs: 15 * 60 * 1000, max: 3000 });
app.use('/api/', limiter);

// ── Routes ─────────────────────────────────────────
app.use('/api/auth', require('./src/routes/auth'));
app.use('/api/services', require('./src/routes/services'));
app.use('/api/departments', require('./src/routes/departments'));
app.use('/api/employees', require('./src/routes/employees'));
app.use('/api/clients', require('./src/routes/clients'));
app.use('/api/client-services', require('./src/routes/clientServices'));
app.use('/api/client-products', require('./src/routes/clientProducts'));
app.use('/api/client-procedures', require('./src/routes/clientProcedures'));
app.use('/api/payments', require('./src/routes/payments'));
app.use('/api/call-logs', require('./src/routes/callLogs'));
app.use('/api/reports', require('./src/routes/reports'));
app.use('/api/twilio', require('./src/routes/twilio'));

// ── Health check ───────────────────────────────────
app.get('/health', (req, res) => res.json({ status: 'OK', timestamp: new Date() }));

// ── 404 Handler ────────────────────────────────────
app.use((req, res) => res.status(404).json({ message: 'Endpoint không tồn tại' }));

// ── Global Error Handler ───────────────────────────
app.use((err, req, res, next) => {
  console.error('❌ Error:', err);
  res.status(err.status || 500).json({ message: err.message || 'Lỗi server' });
});

// ── Start Server ───────────────────────────────────
const PORT = process.env.PORT || 5000;
const startServer = async () => {
  await testConnection();
  app.listen(PORT, () => {
    console.log(`🚀 ECS Backend running at http://localhost:${PORT}`);
    console.log(`📖 API base: http://localhost:${PORT}/api`);
  });
};

startServer();

