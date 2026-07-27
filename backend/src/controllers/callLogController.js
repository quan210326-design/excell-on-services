const { Op } = require('sequelize');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const { CallLog, Client, Employee, User, AIAnalysis } = require('../models');
const { analyzeCallAudioAndTranscript } = require('../services/aiService');

// Multer storage setup for Virtual Calls audio
const uploadsDir = path.join(__dirname, '../../public/uploads/calls');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, uploadsDir),
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    const ext = path.extname(file.originalname) || '.wav';
    cb(null, `call_${uniqueSuffix}${ext}`);
  }
});

const upload = multer({ storage });
const uploadMiddleware = upload.single('audio');

// GET /api/call-logs
const getAll = async (req, res) => {
  try {
    const { client_id, employee_id, call_type, from, to } = req.query;
    const where = {};
    if (client_id) where.client_id = client_id;
    if (employee_id) where.employee_id = employee_id;
    if (call_type) where.call_type = call_type;
    if (from && to) where.call_datetime = { [Op.between]: [from, to] };

    if (req.user && req.user.role === 'staff') {
      const userRecord = await User.findByPk(req.user.id);
      if (userRecord && userRecord.employee_id) {
        where.employee_id = userRecord.employee_id;
      }
    }

    const logs = await CallLog.findAll({
      where,
      include: [
        { model: Client, as: 'client', attributes: ['id', 'company_name', 'phone', 'contact_person'] },
        { model: Employee, as: 'employee', attributes: ['id', 'first_name', 'last_name', 'emp_code'] },
        { model: AIAnalysis, as: 'aiAnalysis' }
      ],
      order: [['call_datetime', 'DESC']]
    });

    res.json(logs);
  } catch (err) {
    res.status(500).json({ message: 'Lỗi server', error: err.message });
  }
};

// GET /api/call-logs/:id
const getById = async (req, res) => {
  try {
    const log = await CallLog.findByPk(req.params.id, {
      include: [
        { model: Client, as: 'client' },
        { model: Employee, as: 'employee' },
        { model: AIAnalysis, as: 'aiAnalysis' }
      ]
    });
    if (!log) return res.status(404).json({ message: 'Không tìm thấy cuộc gọi' });
    res.json(log);
  } catch (err) {
    res.status(500).json({ message: 'Lỗi server', error: err.message });
  }
};

// POST /api/call-logs/upload-virtual
const uploadVirtualCall = async (req, res) => {
  try {
    const {
      client_name = "Khách Hàng Mới",
      client_phone = "0901234567",
      duration_minutes = 3,
      purpose = "Tư vấn gói dịch vụ ECS Doanh nghiệp",
      transcript_text = ""
    } = req.body;

    let employee_id = req.user ? req.user.employee_id : null;
    if (!employee_id && req.user) {
      const userRecord = await User.findByPk(req.user.id);
      if (userRecord) employee_id = userRecord.employee_id;
    }
    if (!employee_id) {
      const fallbackEmp = await Employee.findOne();
      if (fallbackEmp) employee_id = fallbackEmp.id;
    }

    // Find or create Client
    let client = await Client.findOne({ where: { phone: client_phone } });
    if (!client) {
      client = await Client.create({
        client_code: `CLI${Math.floor(100 + Math.random() * 900)}`,
        company_name: client_name,
        contact_person: client_name,
        phone: client_phone,
        email: `client_${Date.now()}@ecs.com`,
        status: 'active'
      });
    }

    const audio_file = req.file ? req.file.filename : `call_${Date.now()}.wav`;
    const recording_url = `/uploads/calls/${audio_file}`;

    // Create CallLog
    const callLog = await CallLog.create({
      client_id: client.id,
      employee_id: employee_id,
      call_type: 'outbound',
      call_datetime: new Date(),
      duration_minutes: parseInt(duration_minutes) || 3,
      purpose,
      outcome: 'completed',
      recording_url
    });

    // Run AI Engine Analysis
    const aiData = analyzeCallAudioAndTranscript(transcript_text, duration_minutes, purpose);

    const aiAnalysis = await AIAnalysis.create({
      call_id: callLog.id,
      ...aiData
    });

    res.status(201).json({
      message: 'Tải cuộc gọi ảo và xử lý AI thành công!',
      callLog,
      aiAnalysis
    });
  } catch (err) {
    console.error("Error in uploadVirtualCall:", err);
    res.status(500).json({ message: 'Lỗi xử lý cuộc gọi ảo', error: err.message });
  }
};

// GET /api/call-logs/:id/ai-analysis
const getAIAnalysis = async (req, res) => {
  try {
    let aiAnalysis = await AIAnalysis.findOne({ where: { call_id: req.params.id } });
    if (!aiAnalysis) {
      const callLog = await CallLog.findByPk(req.params.id);
      if (!callLog) return res.status(404).json({ message: 'Không tìm thấy cuộc gọi' });

      const aiData = analyzeCallAudioAndTranscript(
        "Nhân viên: Chào anh/chị, em gọi từ ECS tư vấn giải pháp quy trình doanh nghiệp.\nKhách hàng: Chào em, anh quan tâm tới phần ghi âm và phân tích chốt đơn AI.",
        callLog.duration_minutes,
        callLog.purpose
      );
      aiAnalysis = await AIAnalysis.create({
        call_id: callLog.id,
        ...aiData
      });
    }

    res.json(aiAnalysis);
  } catch (err) {
    res.status(500).json({ message: 'Lỗi server', error: err.message });
  }
};

// GET /api/call-logs/ai-stats
const getAIStats = async (req, res) => {
  try {
    const totalCalls = await CallLog.count();
    const analyses = await AIAnalysis.findAll();

    const analyzedCallsCount = analyses.length;
    const avgClosingProb = analyzedCallsCount > 0
      ? Math.round(analyses.reduce((sum, a) => sum + (a.closing_probability || 0), 0) / analyzedCallsCount)
      : 85;

    const avgOverallScore = analyzedCallsCount > 0
      ? Math.round(analyses.reduce((sum, a) => sum + (a.overall_score || 0), 0) / analyzedCallsCount)
      : 88;

    const highPotential = analyses.filter(a => a.buy_potential === 'Cao').length;
    const mediumPotential = analyses.filter(a => a.buy_potential === 'Trung bình').length;
    const lowPotential = analyses.filter(a => a.buy_potential === 'Thấp').length;

    res.json({
      total_calls: totalCalls,
      analyzed_calls: analyzedCallsCount,
      avg_closing_probability: avgClosingProb,
      avg_overall_score: avgOverallScore,
      high_potential_count: highPotential,
      medium_potential_count: mediumPotential,
      low_potential_count: lowPotential
    });
  } catch (err) {
    res.status(500).json({ message: 'Lỗi server', error: err.message });
  }
};

// POST /api/call-logs
const create = async (req, res) => {
  try {
    const { client_id, employee_id, call_datetime, call_type, duration_minutes, purpose, outcome, notes, recording_url } = req.body;
    let empId = employee_id;
    if (req.user && req.user.role === 'staff') {
      const userRecord = await User.findByPk(req.user.id);
      if (userRecord && userRecord.employee_id) empId = userRecord.employee_id;
    }

    const log = await CallLog.create({
      client_id, employee_id: empId, call_datetime, call_type,
      duration_minutes, purpose, outcome, notes, recording_url
    });
    res.status(201).json(log);
  } catch (err) {
    res.status(500).json({ message: 'Lỗi server', error: err.message });
  }
};

// PUT /api/call-logs/:id
const update = async (req, res) => {
  try {
    const log = await CallLog.findByPk(req.params.id);
    if (!log) return res.status(404).json({ message: 'Không tìm thấy cuộc gọi' });

    await log.update(req.body);
    res.json(log);
  } catch (err) {
    res.status(500).json({ message: 'Lỗi server', error: err.message });
  }
};

// DELETE /api/call-logs/:id
const remove = async (req, res) => {
  try {
    const log = await CallLog.findByPk(req.params.id);
    if (!log) return res.status(404).json({ message: 'Không tìm thấy cuộc gọi' });

    await log.destroy();
    res.json({ message: 'Đã xóa cuộc gọi' });
  } catch (err) {
    res.status(500).json({ message: 'Lỗi server', error: err.message });
  }
};

module.exports = {
  getAll, getById, create, update, remove,
  uploadMiddleware, uploadVirtualCall, getAIAnalysis, getAIStats
};
