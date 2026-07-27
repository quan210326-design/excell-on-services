const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const AIAnalysis = sequelize.define('AIAnalysis', {
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  call_id: { type: DataTypes.INTEGER, allowNull: false, unique: true },
  
  // Voice & Tone Analysis for Customer
  sentiment_positive: { type: DataTypes.INTEGER, defaultValue: 0 }, // %
  sentiment_neutral: { type: DataTypes.INTEGER, defaultValue: 0 },  // %
  sentiment_negative: { type: DataTypes.INTEGER, defaultValue: 0 }, // %
  customer_tone_tags: { type: DataTypes.JSON, defaultValue: [] },  // e.g. ["Cởi mở", "Hào hứng", "Quan tâm giá"]

  // Deal Closing Evaluation
  closing_probability: { type: DataTypes.INTEGER, defaultValue: 0 }, // %
  buy_potential: { type: DataTypes.ENUM('Cao', 'Trung bình', 'Thấp'), defaultValue: 'Trung bình' },

  // Staff Service Quality Competency Ratings (1-10 & Score/100)
  score_greeting: { type: DataTypes.INTEGER, defaultValue: 8 },      // Thái độ & Lời chào (/10)
  score_listening: { type: DataTypes.INTEGER, defaultValue: 8 },     // Lắng nghe & Nắm bắt nhu cầu (/10)
  score_consulting: { type: DataTypes.INTEGER, defaultValue: 7 },    // Tư vấn giải pháp (/10)
  score_closing_skill: { type: DataTypes.INTEGER, defaultValue: 7 }, // Kỹ năng chốt hợp đồng (/10)
  overall_score: { type: DataTypes.INTEGER, defaultValue: 75 },      // Điểm tổng kết chất lượng dịch vụ (/100)

  // Speech-to-Text Transcript & Insights
  transcript: { type: DataTypes.TEXT },
  summary: { type: DataTypes.TEXT },
  recommendations: { type: DataTypes.JSON, defaultValue: [] }
}, { tableName: 'ai_analyses' });

module.exports = AIAnalysis;
