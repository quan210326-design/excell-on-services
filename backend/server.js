const express = require('express');
const cors = require('cors');
const path = require('path');
const fs = require('fs');
require('dotenv').config();

const { testConnection } = require('./src/config/database');

const app = express();

// ── Middlewares ────────────────────────────────────
app.use(cors({
  origin: true,
  credentials: true
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Static serve uploads folder
const publicUploads = path.join(__dirname, 'public/uploads');
if (!fs.existsSync(publicUploads)) {
  fs.mkdirSync(publicUploads, { recursive: true });
}
app.use('/uploads', express.static(path.join(__dirname, 'public/uploads')));

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
  try {
    const { AIAnalysis } = require('./src/models');
    await AIAnalysis.sync({ alter: true });
    console.log('✅ Bảng ai_analyses đã được đồng bộ hóa thành công');
  } catch (syncErr) {
    console.warn('⚠️ Lỗi sync bảng ai_analyses:', syncErr.message);
  }
  app.listen(PORT, () => {
    console.log(`🚀 ECS Backend running at http://localhost:${PORT}`);
    console.log(`📖 API base: http://localhost:${PORT}/api`);
  });
};

startServer();
