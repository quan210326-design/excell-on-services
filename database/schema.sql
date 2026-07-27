-- ============================================================
-- Excell-On Consulting Services (ECS) - Database Schema
-- Database: MySQL 8.0+
-- ============================================================

CREATE DATABASE IF NOT EXISTS ecs_db CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE ecs_db;

-- ============================================================
-- 1. SERVICES TABLE
-- Lưu thông tin các dịch vụ: In-bound, Out-bound, Tele Marketing
-- ============================================================
CREATE TABLE IF NOT EXISTS services (
    id          INT AUTO_INCREMENT PRIMARY KEY,
    name        VARCHAR(100) NOT NULL,                          -- Tên dịch vụ
    type        ENUM('inbound','outbound','telemarketing') NOT NULL, -- Loại dịch vụ
    description TEXT,                                          -- Mô tả dịch vụ
    charge_per_day DECIMAL(10,2) NOT NULL,                     -- Phí/ngày/nhân viên ($)
    is_active   TINYINT(1) DEFAULT 1,
    created_at  TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at  TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- ============================================================
-- 2. DEPARTMENTS TABLE
-- Lưu thông tin phòng ban: HR, Admin, Service, Training, IT Security, Auditors
-- ============================================================
CREATE TABLE IF NOT EXISTS departments (
    id          INT AUTO_INCREMENT PRIMARY KEY,
    name        VARCHAR(100) NOT NULL,          -- Tên phòng ban
    code        VARCHAR(20) NOT NULL UNIQUE,    -- Mã phòng ban (VD: HR, IT, ADM)
    description TEXT,                           -- Mô tả phòng ban
    manager_name VARCHAR(100),                 -- Tên trưởng phòng
    is_active   TINYINT(1) DEFAULT 1,
    created_at  TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at  TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- ============================================================
-- 3. EMPLOYEES TABLE
-- Lưu thông tin nhân viên theo designation và service
-- ============================================================
CREATE TABLE IF NOT EXISTS employees (
    id              INT AUTO_INCREMENT PRIMARY KEY,
    emp_code        VARCHAR(20) NOT NULL UNIQUE,    -- Mã nhân viên
    first_name      VARCHAR(50) NOT NULL,
    last_name       VARCHAR(50) NOT NULL,
    email           VARCHAR(100) NOT NULL UNIQUE,
    phone           VARCHAR(20),
    designation     VARCHAR(100) NOT NULL,           -- Chức danh
    dept_id         INT NOT NULL,                    -- FK phòng ban
    service_id      INT,                             -- FK dịch vụ phụ trách (nullable)
    salary          DECIMAL(10,2),
    join_date       DATE,
    status          ENUM('active','inactive','on_leave') DEFAULT 'active',
    created_at      TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at      TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (dept_id) REFERENCES departments(id) ON DELETE RESTRICT,
    FOREIGN KEY (service_id) REFERENCES services(id) ON DELETE SET NULL
);

-- ============================================================
-- 4. CLIENTS TABLE
-- Lưu thông tin khách hàng (tổ chức sử dụng dịch vụ ECS)
-- ============================================================
CREATE TABLE IF NOT EXISTS clients (
    id              INT AUTO_INCREMENT PRIMARY KEY,
    client_code     VARCHAR(20) NOT NULL UNIQUE,    -- Mã khách hàng
    company_name    VARCHAR(150) NOT NULL,           -- Tên công ty
    contact_person  VARCHAR(100) NOT NULL,           -- Người liên hệ
    email           VARCHAR(100) NOT NULL,
    phone           VARCHAR(20),
    address         TEXT,
    city            VARCHAR(100),
    country         VARCHAR(100) DEFAULT 'Vietnam',
    industry        VARCHAR(100),                    -- Ngành nghề
    status          ENUM('active','inactive','suspended') DEFAULT 'active',
    notes           TEXT,
    created_at      TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at      TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- ============================================================
-- 5. CLIENT_SERVICES TABLE
-- Dịch vụ mà client đã đăng ký sử dụng
-- ============================================================
CREATE TABLE IF NOT EXISTS client_services (
    id              INT AUTO_INCREMENT PRIMARY KEY,
    client_id       INT NOT NULL,
    service_id      INT NOT NULL,
    num_employees   INT NOT NULL DEFAULT 1,          -- Số nhân viên ECS phục vụ
    start_date      DATE NOT NULL,
    end_date        DATE,
    total_days      INT,                             -- Tổng số ngày
    total_charge    DECIMAL(12,2),                   -- Tổng phí = charge_per_day × num_employees × total_days
    status          ENUM('active','completed','cancelled') DEFAULT 'active',
    notes           TEXT,
    created_at      TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at      TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (client_id) REFERENCES clients(id) ON DELETE CASCADE,
    FOREIGN KEY (service_id) REFERENCES services(id) ON DELETE RESTRICT
);

-- ============================================================
-- 6. CLIENT_PRODUCTS TABLE
-- Sản phẩm/dịch vụ mà chính client cung cấp (vd: tủ lạnh, gói ISP...)
-- ============================================================
CREATE TABLE IF NOT EXISTS client_products (
    id              INT AUTO_INCREMENT PRIMARY KEY,
    client_id       INT NOT NULL,
    product_name    VARCHAR(150) NOT NULL,           -- Tên sản phẩm/dịch vụ
    category        VARCHAR(100),                    -- Danh mục
    description     TEXT,
    price           DECIMAL(10,2),                   -- Giá sản phẩm
    is_active       TINYINT(1) DEFAULT 1,
    created_at      TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at      TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (client_id) REFERENCES clients(id) ON DELETE CASCADE
);

-- ============================================================
-- 7. PAYMENTS TABLE
-- Thanh toán của client cho ECS
-- ============================================================
CREATE TABLE IF NOT EXISTS payments (
    id              INT AUTO_INCREMENT PRIMARY KEY,
    client_id       INT NOT NULL,
    client_service_id INT,                           -- Thanh toán cho dịch vụ nào
    invoice_no      VARCHAR(50) NOT NULL UNIQUE,     -- Số hóa đơn
    amount          DECIMAL(12,2) NOT NULL,           -- Số tiền
    due_date        DATE NOT NULL,                   -- Hạn thanh toán
    paid_date       DATE,                            -- Ngày đã thanh toán
    payment_method  ENUM('bank_transfer','cash','cheque','online') DEFAULT 'bank_transfer',
    status          ENUM('pending','paid','overdue','partial') DEFAULT 'pending',
    notes           TEXT,
    created_at      TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at      TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (client_id) REFERENCES clients(id) ON DELETE CASCADE,
    FOREIGN KEY (client_service_id) REFERENCES client_services(id) ON DELETE SET NULL
);

-- ============================================================
-- 8. CALL_LOGS TABLE
-- Lịch sử cuộc gọi (in-bound / out-bound)
-- ============================================================
CREATE TABLE IF NOT EXISTS call_logs (
    id              INT AUTO_INCREMENT PRIMARY KEY,
    client_id       INT,
    employee_id     INT NOT NULL,
    call_type       ENUM('inbound','outbound','telemarketing') NOT NULL,
    call_datetime   DATETIME NOT NULL,
    duration_minutes INT DEFAULT 0,                  -- Thời lượng (phút)
    purpose         VARCHAR(200),                    -- Mục đích cuộc gọi
    outcome         ENUM('resolved','callback','no_answer','escalated','completed') DEFAULT 'resolved',
    notes           TEXT,
    recording_url   VARCHAR(500),                    -- Đường dẫn/URL file ghi âm MP3
    recording_sid   VARCHAR(100),                    -- Twilio Recording SID
    created_at      TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (client_id) REFERENCES clients(id) ON DELETE SET NULL,
    FOREIGN KEY (employee_id) REFERENCES employees(id) ON DELETE RESTRICT
);

-- ============================================================
-- 9. USERS TABLE
-- Tài khoản đăng nhập hệ thống
-- ============================================================
CREATE TABLE IF NOT EXISTS users (
    id              INT AUTO_INCREMENT PRIMARY KEY,
    username        VARCHAR(50) NOT NULL UNIQUE,
    password_hash   VARCHAR(255) NOT NULL,
    email           VARCHAR(100) NOT NULL UNIQUE,
    full_name       VARCHAR(100),
    role            ENUM('admin','manager','staff') DEFAULT 'staff',
    employee_id     INT,                             -- Liên kết với nhân viên
    is_active       TINYINT(1) DEFAULT 1,
    last_login      TIMESTAMP,
    created_at      TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at      TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (employee_id) REFERENCES employees(id) ON DELETE SET NULL
);

-- ============================================================
-- 10. AI_ANALYSES TABLE
-- Lưu kết quả phân tích AI cho từng cuộc gọi (Sentiment, Điểm số kỹ năng, Transcript & Khuyến nghị)
-- ============================================================
CREATE TABLE IF NOT EXISTS ai_analyses (
    id                      INT AUTO_INCREMENT PRIMARY KEY,
    call_id                 INT NOT NULL UNIQUE,             -- FK cuộc gọi
    sentiment_positive      INT DEFAULT 0,                   -- % Phấn khởi / Tích cực
    sentiment_neutral       INT DEFAULT 0,                   -- % Trung tính
    sentiment_negative      INT DEFAULT 0,                   -- % Tiêu cực / Thất vọng
    customer_tone_tags      JSON,                            -- Tag cảm xúc (vd: ["Cởi mở", "Hào hứng"])
    closing_probability     INT DEFAULT 0,                   -- % Khả năng chốt hợp đồng
    buy_potential           ENUM('Cao', 'Trung bình', 'Thấp') DEFAULT 'Trung bình',
    score_greeting          INT DEFAULT 8,                   -- Lời chào & thái độ (/10)
    score_listening         INT DEFAULT 8,                   -- Lắng nghe & nắm bắt nhu cầu (/10)
    score_consulting        INT DEFAULT 7,                   -- Tư vấn giải pháp (/10)
    score_closing_skill     INT DEFAULT 7,                   -- Kỹ năng chốt hợp đồng (/10)
    overall_score           INT DEFAULT 75,                  -- Điểm tổng kết dịch vụ (/100)
    transcript              TEXT,                            -- Văn bản ghi âm cuộc gọi
    summary                 TEXT,                            -- Tóm tắt cuộc gọi
    recommendations         JSON,                            -- Khuyến nghị cải thiện
    created_at              TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at              TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (call_id) REFERENCES call_logs(id) ON DELETE CASCADE
);

-- ============================================================
-- INDEXES để tăng hiệu suất tìm kiếm
-- ============================================================
CREATE INDEX idx_employees_dept ON employees(dept_id);
CREATE INDEX idx_employees_service ON employees(service_id);
CREATE INDEX idx_client_services_client ON client_services(client_id);
CREATE INDEX idx_client_services_service ON client_services(service_id);
CREATE INDEX idx_client_products_client ON client_products(client_id);
CREATE INDEX idx_payments_client ON payments(client_id);
CREATE INDEX idx_payments_status ON payments(status);
CREATE INDEX idx_payments_due_date ON payments(due_date);
CREATE INDEX idx_call_logs_client ON call_logs(client_id);
CREATE INDEX idx_call_logs_employee ON call_logs(employee_id);
CREATE INDEX idx_call_logs_datetime ON call_logs(call_datetime);
CREATE INDEX idx_ai_analyses_call ON ai_analyses(call_id);

