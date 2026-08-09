# ⚡ Excell-On Services (ECS) - Hệ Thống Quản Lý Dịch Vụ Khách Hàng & Phân Tích Cuộc Gọi AI

Dự án **Hệ thống Quản lý Dịch vụ Khách hàng (ECS Consulting Management Portal)** là giải pháp Web App toàn diện giúp quản lý các phòng ban, nhân sự phụ trách dịch vụ, thông tin khách hàng, đăng ký dịch vụ/sản phẩm, tính toán hóa đơn, tích hợp tổng đài gọi điện thật (Twilio Voice) / cuộc gọi ảo (Virtual Call Recorder) và **Engine AI tự động phân tích cảm xúc khách hàng & đánh giá chất lượng nhân viên**.

---

## 🛠️ Công Nghệ Sử Dụng (Tech Stack)

- **Frontend**: React 19 (Vite), TailwindCSS / Glassmorphism UI, Lucide Icons, Recharts (Biểu đồ), Axios, `@twilio/voice-sdk`, Web Speech API (Chuyển giọng nói thành văn bản).
- **Backend**: Node.js, Express.js, Sequelize ORM, JWT Authentication, ExcelJS (Xuất báo cáo Excel), Puppeteer-core (Xuất báo cáo PDF), Twilio Voice SDK, Multer.
- **AI Engine (Built-in)**: Thuật toán xử lý ngôn ngữ tự nhiên (NLP) phân tích cảm xúc (Sentiment Analysis), đánh giá tiêu chí kỹ năng nhân viên, ước tính xác suất chốt hợp đồng và đề xuất khuyến nghị hành động tự động.
- **Database**: MySQL 8.0 với Sequelize ORM.
- **Containerization**: Docker & Docker Compose.

---

## 🤖 1. Phân Tích & Chấm Điểm Cuộc Gọi Bằng AI (AI Analysis Engine)

Ngay sau khi cuộc gọi kết thúc (hoặc sau khi tải cuộc gọi ảo lên), hệ thống AI tự động xử lý và trích xuất các chỉ số chuyên sâu:

1. **Phân Tích Cảm Xúc (Sentiment Analysis)**: Tỷ lệ % Tích cực (Positive), Trung tính (Neutral), Tiêu cực (Negative).
2. **Gán Nhãn Thái Độ Khách Hàng (Customer Tone Tags)**: Nhận diện thái độ tự động (*"Cởi mở"*, *"Hợp tác"*, *"Băn khoăn giá"*, *"Từ chối"*, v.v.).
3. **Dự Đoán Tiềm Năng Chốt Đơn (Closing Probability %)**: Tính toán tỉ lệ % chốt hợp đồng (10% - 95%) và cấp độ tiềm năng (*Cao*, *Trung bình*, *Thấp*).
4. **Bảng Điểm Kỹ Năng Nhân Viên (Quality Score Card /100)**:
   - **Chào hỏi (Greeting Score)** (/10)
   - **Lắng nghe & Thấu hiểu (Listening Score)** (/10)
   - **Tư vấn giải pháp (Consulting Score)** (/10)
   - **Kỹ năng Chốt sales (Closing Skill Score)** (/10)
   - **Điểm Tổng Thể (Overall Score)** quy đổi ra thang điểm 100.
5. **Tóm Tắt AI & Đề Xuất Hành Động (AI Summary & Recommendations)**: Tóm tắt nội dung hội thoại và gợi ý các bước xử lý tiếp theo cho nhân viên (VD: *"Gửi báo giá trong 2h"*, *"Lên lịch gọi lại sau 24-48h"*).

---

## 📞 2. Tính Năng Cuộc Gọi (Twilio Voice & Virtual Call Recorder)

### A. Gọi Điện Thật Qua Trình Duyệt (Twilio Voice)
Nhân viên có thể **gọi ra số điện thoại thật** và **nhận cuộc gọi đến** ngay trên trình duyệt mà không cần cài phần mềm riêng.
- **Access Token API**: `/api/twilio/token`
- **Webhooks Backend**: `/api/twilio/voice`, `/api/twilio/incoming`, `/api/twilio/status`
- **Status Callback**: Tự động tạo `CallLog` và lưu thời lượng thực tế khi cuộc gọi kết thúc.

#### Chạy localtunnel cho Twilio Webhook (Development):
```bash
lt --port 5000 --subdomain ecs-backend-twilio
# → URL: https://ecs-backend-twilio.loca.lt
```

### B. Cuộc Gọi Ảo & Thu Âm Trực Tiếp (Virtual Call Recorder)
Dành cho việc test trực tiếp qua micro hoặc ghi âm cuộc gọi tư vấn:
- **Speech-to-Text**: Nhận diện giọng nói tiếng Việt trực tiếp qua `Web Speech API`.
- **Audio Recording**: Thu âm định dạng WAV/WebM với `MediaRecorder`.
- Tự động đẩy lên API `/api/call-logs/upload-virtual` để AI phân tích tức thì.

---

## 🔐 Tài Khoản Đăng Nhập Mẫu (Mật khẩu mặc định: `Admin@123`)

| Tài Khoản | Mật Khẩu | Vai Trò (Role) | Nhân Viên Liên Kết |
|---|---|---|---|
| `admin` | `Admin@123` | **Admin** | Quản trị viên hệ thống |
| `manager` | `Admin@123` | **Manager** | Quản lý dịch vụ |
| `staff1` | `Admin@123` | **Staff** | Nguyễn Minh (`EMP001` - Call Center Agent) |
| `staff2` | `Admin@123` | **Staff** | Trần Lần (`EMP002` - Senior Agent) |
| `staff3` | `Admin@123` | **Staff** | Lê Hùng (`EMP003` - Outbound Specialist) |
| `staff4` | `Admin@123` | **Staff** | Phạm Thu (`EMP004` - Tele Marketer) |
| `staff5` | `Admin@123` | **Staff** | Võ Đức (`EMP005` - HR Officer) |
| `staff6` | `Admin@123` | **Staff** | Hoàng Mai (`EMP006` - IT Technician) |
| `staff7` | `Admin@123` | **Staff** | Đặng Tuấn (`EMP007` - Team Leader) |
| `staff8` | `Admin@123` | **Staff** | Bùi Hoa (`EMP008` - Training Coordinator) |

---

## 📥 Bước 1: Clone mã nguồn dự án

```bash
git clone https://github.com/quan210326-design/excell-on-services.git 
cd ECS
```

---

## 🚀 Cách Chạy Dự Án

### 🐳 Cách 1: Chạy Bằng Docker (Khuyên dùng – Một lệnh duy nhất)

> Phù hợp khi muốn **chạy nhanh** mà không cần cài Node.js hay MySQL riêng.

**Yêu cầu:** Chỉ cần cài **[Docker Desktop](https://www.docker.com/products/docker-desktop/)**

```bash
# Đứng tại thư mục gốc của dự án (ECS) và chạy:
docker compose up -d --build
```

Sau khi Docker khởi chạy xong:
- **Frontend App**: http://localhost:5173 (hoặc port được map trong docker-compose)
- **Backend API**: http://localhost:5000
- **MySQL**: port `3306` hoặc `3307`

---

### 💻 Cách 2: Chạy Local (Để Code & Phát Triển)

**Yêu cầu:**
- [Node.js](https://nodejs.org) >= v18.0
- MySQL Server >= 8.0

#### Bước 1: Khởi Tạo Database & Khởi Tạo Dữ Liệu Mẫu

**Cách A – Khởi tạo qua MySQL Command / Client:**
```bash
mysql -u root -p12345678 -e "CREATE DATABASE IF NOT EXISTS ecs_db;"
mysql -u root -p12345678 ecs_db < database/schema.sql
mysql -u root -p12345678 ecs_db < database/seed.sql
```

**Cách B – Dùng Scripts có sẵn trong Backend:**
```bash
cd backend
npm install
npm run db:migrate
npm run db:seed
# Hoặc chạy script reseed dữ liệu đầy đủ:
node reseed.js
```

#### Bước 2: Cấu hình Backend
```bash
cd backend
copy .env.example .env   # Windows
# cp .env.example .env   # Mac/Linux

npm install
```

File `backend/.env`:
```env
PORT=5000
NODE_ENV=development
DB_HOST=localhost
DB_PORT=3306
DB_NAME=ecs_db
DB_USER=root
DB_PASSWORD=YOUR_MYSQL_PASSWORD
JWT_SECRET=supersecretkey12345!
JWT_EXPIRES_IN=24h
FRONTEND_URL=http://localhost:5173
```

#### Bước 3: Cấu hình Frontend
```bash
cd frontend
copy .env.example .env   # Windows
# cp .env.example .env   # Mac/Linux

npm install
```

File `frontend/.env`:
```env
VITE_API_URL=http://localhost:5000/api
```

#### Bước 4: Chạy song song 2 terminal

**Terminal 1 – Backend:**
```bash
cd backend
npm run dev
# ✅ API chạy tại http://localhost:5000
```

**Terminal 2 – Frontend:**
```bash
cd frontend
npm run dev
# ✅ Web chạy tại http://localhost:5173
```

---

### 🌐 Cách 3: Chạy Từ Docker Hub (Không cần tải mã nguồn)

1. Tải duy nhất file `docker-compose-hub.yml` và thư mục `database/` về máy.
2. Chạy lệnh:
```bash
docker compose -f docker-compose-hub.yml up -d
```

---

## 📊 Biểu Phí Dịch Vụ Mẫu
- **In-bound**: $4,500 / ngày / nhân viên
- **Out-bound**: $6,000 / ngày / nhân viên
- **Tele Marketing**: $5,500 / ngày / nhân viên

---

## 🗂️ Cấu Trúc Thư Mục Dự Án

```
ECS/
├── backend/                # Node.js + Express API & AI Engine
│   ├── src/
│   │   ├── controllers/    # Xử lý logic nghiệp vụ & AI Analytics
│   │   ├── models/         # Sequelize ORM models (CallLog, AIAnalysis, Client...)
│   │   ├── routes/         # Định nghĩa API routes
│   │   ├── services/       # AI Processing Service & PDF Service
│   │   └── config/         # Sequelize Migration & Seeder
│   ├── reseed.js           # Script làm mới dữ liệu & mẫu AI cuộc gọi
│   ├── server.js           # Server Entry point
│   ├── .env.example        # Template biến môi trường
│   └── Dockerfile
│
├── frontend/               # React + Vite Application
│   ├── src/
│   │   ├── components/     # UI Components (CallWidget, VirtualCallWidget, CallAIDetailModal...)
│   │   ├── pages/          # Các trang chính (Dashboard, CallLogs, Clients, Employees...)
│   │   ├── api/            # Axios API Services
│   │   └── context/        # React Context (AuthContext...)
│   ├── .env.example        # Template biến môi trường
│   └── Dockerfile
│
├── database/
│   ├── schema.sql          # Cấu trúc bảng MySQL (DDL)
│   └── seed.sql            # Dữ liệu mẫu ban đầu (DML)
│
├── docker-compose.yml      # Chạy local bằng Docker
└── docker-compose-hub.yml  # Chạy từ Docker Hub images
```
