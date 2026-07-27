const { CallLog, AIAnalysis } = require('./src/models');
const { analyzeCallAudioAndTranscript } = require('./src/services/aiService');
const { sequelize } = require('./src/config/database');

const seed = async () => {
  try {
    await sequelize.authenticate();
    console.log('✅ Database connected.');

    await AIAnalysis.sync({ alter: true });
    console.log('✅ Bảng ai_analyses ready.');

    const logs = await CallLog.findAll();
    console.log(`Found ${logs.length} call logs. Seeding AI analysis data...`);

    for (const log of logs) {
      const existing = await AIAnalysis.findOne({ where: { call_id: log.id } });
      if (!existing) {
        const sampleText = log.purpose 
          ? `Nhân viên tư vấn về ${log.purpose}. Khách hàng phản hồi và muốn tìm hiểu thêm về giá và thời gian hỗ trợ.` 
          : `Nhân viên: Xin chào, em gọi hỗ trợ dịch vụ ECS.\nKhách hàng: Anh muốn tìm hiểu thêm chi tiết gói dịch vụ.`;

        const aiData = analyzeCallAudioAndTranscript(sampleText, log.duration_minutes || 3, log.purpose || "Tư vấn ECS");
        await AIAnalysis.create({
          call_id: log.id,
          ...aiData
        });
      }
    }

    console.log('🎉 Seeded AI Analyses successfully!');
    process.exit(0);
  } catch (err) {
    console.error('❌ Error seeding AI Analyses:', err);
    process.exit(1);
  }
};

seed();
