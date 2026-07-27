-- ============================================================
-- ECS Database - Seed Data (Dữ liệu mẫu)
-- ============================================================
USE ecs_db;

-- ============================================================
-- 1. SERVICES
-- ============================================================
INSERT INTO services (name, type, description, charge_per_day) VALUES
('In-bound Technical Support', 'inbound', 'Hỗ trợ kỹ thuật qua điện thoại 24/7 cho khách hàng', 4500.00),
('In-bound Customer Service', 'inbound', 'Dịch vụ chăm sóc khách hàng, nhận đơn hàng, hỗ trợ không kỹ thuật', 4500.00),
('Out-bound Sales', 'outbound', 'Gọi ra cho khách hàng để promotion sản phẩm và kiểm tra sự hài lòng', 6000.00),
('Tele Marketing', 'telemarketing', 'Marketing và quảng bá sản phẩm/dịch vụ qua điện thoại', 5500.00);

-- ============================================================
-- 2. DEPARTMENTS
-- ============================================================
INSERT INTO departments (name, code, description, manager_name) VALUES
('HR Management', 'HR', 'Quản lý nhân sự, tuyển dụng, đào tạo nhân viên', 'Nguyen Van A'),
('Administration', 'ADM', 'Quản lý hành chính, văn phòng và tài sản công ty', 'Tran Thi B'),
('Service', 'SVC', 'Thực hiện các dịch vụ In-bound, Out-bound và Tele Marketing', 'Le Van C'),
('Training', 'TRN', 'Đào tạo và phát triển kỹ năng nhân viên', 'Pham Thi D'),
('Internet Security', 'IT', 'Xử lý sự cố kỹ thuật: máy tính, phần mềm, bảo mật hệ thống', 'Hoang Van E'),
('Auditors', 'AUD', 'Kiểm toán tài chính và đánh giá chất lượng dịch vụ', 'Vo Thi F');

-- ============================================================
-- 3. EMPLOYEES
-- ============================================================
INSERT INTO employees (emp_code, first_name, last_name, email, phone, designation, dept_id, service_id, salary, join_date) VALUES
('EMP001', 'Minh', 'Nguyen', 'minh.nguyen@ecs.com', '0901234567', 'Call Center Agent', 3, 1, 15000000, '2023-01-15'),
('EMP002', 'Lan', 'Tran', 'lan.tran@ecs.com', '0912345678', 'Senior Agent', 3, 2, 18000000, '2022-06-01'),
('EMP003', 'Hung', 'Le', 'hung.le@ecs.com', '0923456789', 'Outbound Specialist', 3, 3, 17000000, '2023-03-10'),
('EMP004', 'Thu', 'Pham', 'thu.pham@ecs.com', '0934567890', 'Tele Marketer', 3, 4, 16000000, '2023-05-20'),
('EMP005', 'Duc', 'Vo', 'duc.vo@ecs.com', '0945678901', 'HR Officer', 1, NULL, 20000000, '2021-09-01'),
('EMP006', 'Mai', 'Hoang', 'mai.hoang@ecs.com', '0956789012', 'IT Technician', 5, NULL, 22000000, '2022-01-15'),
('EMP007', 'Tuan', 'Dang', 'tuan.dang@ecs.com', '0967890123', 'Team Leader', 3, 1, 25000000, '2020-03-01'),
('EMP008', 'Hoa', 'Bui', 'hoa.bui@ecs.com', '0978901234', 'Training Coordinator', 4, NULL, 19000000, '2022-08-15');

-- ============================================================
-- 4. CLIENTS
-- ============================================================
INSERT INTO clients (client_code, company_name, contact_person, email, phone, address, city, country, industry) VALUES
('CLI001', 'Samsung Electronics Vietnam', 'Park Jin Ho', 'pjh@samsung.vn', '02438123456', '16 Thai Ha, Dong Da', 'Hanoi', 'Vietnam', 'Electronics'),
('CLI002', 'Viettel Telecom', 'Nguyen Quoc Cuong', 'nqc@viettel.vn', '02438234567', '15 Tran Duy Hung, Cau Giay', 'Hanoi', 'Vietnam', 'Telecommunications'),
('CLI003', 'Vinamilk Corporation', 'Le Thi Thu Ha', 'ltha@vinamilk.vn', '02838345678', '10 Tan Trao, Tan Phu', 'Ho Chi Minh', 'Vietnam', 'Food & Beverage'),
('CLI004', 'FPT Software', 'Tran Minh Tuan', 'tmt@fpt.com.vn', '02438456789', 'FPT Complex, Cau Giay', 'Hanoi', 'Vietnam', 'Information Technology'),
('CLI005', 'Panasonic Vietnam', 'Yamamoto Kenji', 'yk@panasonic.vn', '02838567890', 'Lot B1, VSIP II, Binh Duong', 'Binh Duong', 'Vietnam', 'Electronics');

-- ============================================================
-- 5. CLIENT_SERVICES
-- ============================================================
INSERT INTO client_services (client_id, service_id, num_employees, start_date, end_date, total_days, total_charge, status) VALUES
(1, 1, 5, '2024-01-01', '2024-12-31', 365, 8212500.00, 'completed'),   -- Samsung: Inbound Tech (5emp × 4500 × 365)
(1, 2, 3, '2024-01-01', '2024-12-31', 365, 4927500.00, 'completed'),   -- Samsung: Inbound CS
(2, 3, 8, '2024-03-01', '2025-02-28', 365, 17520000.00, 'active'),     -- Viettel: Outbound
(2, 4, 4, '2024-03-01', '2025-02-28', 365, 8030000.00, 'active'),      -- Viettel: TeleMarketing
(3, 2, 6, '2024-06-01', NULL, NULL, NULL, 'active'),                    -- Vinamilk: Inbound CS (đang chạy)
(4, 4, 10, '2024-07-01', NULL, NULL, NULL, 'active'),                   -- FPT: TeleMarketing
(5, 1, 4, '2024-09-01', '2025-08-31', 365, 6570000.00, 'active');      -- Panasonic: Inbound Tech

-- ============================================================
-- 6. CLIENT_PRODUCTS
-- ============================================================
INSERT INTO client_products (client_id, product_name, category, description, price) VALUES
-- Samsung products
(1, 'Samsung Galaxy S24', 'Smartphone', 'Flagship smartphone 2024', 999.00),
(1, 'Samsung 4K QLED TV 65"', 'Television', 'Smart TV 4K QLED 65 inch', 1499.00),
(1, 'Samsung Side-by-Side Refrigerator', 'Home Appliance', 'Tủ lạnh side-by-side 617L', 1299.00),
-- Viettel products
(2, 'Viettel Fiber 200Mbps', 'Internet', 'Gói internet cáp quang 200Mbps', 250000),
(2, 'Viettel Fiber 500Mbps', 'Internet', 'Gói internet cáp quang 500Mbps', 399000),
(2, 'Viettel Business Pro', 'Internet', 'Gói internet doanh nghiệp tốc độ cao', 1500000),
-- Vinamilk products
(3, 'Vinamilk Fresh Milk 1L', 'Dairy', 'Sữa tươi tiệt trùng 1 lít', 32000),
(3, 'Vinamilk Yogurt', 'Dairy', 'Sữa chua Vinamilk các vị', 15000),
-- FPT products
(4, 'FPT Cloud Services', 'Cloud', 'Dịch vụ cloud computing', 5000000),
(4, 'FPT ERP Solution', 'Software', 'Phần mềm quản trị doanh nghiệp', 50000000),
-- Panasonic products
(5, 'Panasonic Inverter AC 12000 BTU', 'Air Conditioner', 'Máy lạnh inverter tiết kiệm điện', 12500000),
(5, 'Panasonic Washing Machine 9kg', 'Home Appliance', 'Máy giặt cửa trên 9kg', 7500000);

-- ============================================================
-- 7. PAYMENTS
-- ============================================================
INSERT INTO payments (client_id, client_service_id, invoice_no, amount, due_date, paid_date, payment_method, status) VALUES
(1, 1, 'INV-2024-001', 8212500.00, '2024-12-31', '2024-12-28', 'bank_transfer', 'paid'),
(1, 2, 'INV-2024-002', 4927500.00, '2024-12-31', '2024-12-30', 'bank_transfer', 'paid'),
(2, 3, 'INV-2024-003', 17520000.00, '2025-02-28', NULL, 'bank_transfer', 'overdue'),
(2, 4, 'INV-2024-004', 8030000.00, '2025-02-28', NULL, 'bank_transfer', 'overdue'),
(3, 5, 'INV-2024-005', 3240000.00, '2024-11-30', NULL, 'online', 'overdue'),
(4, 6, 'INV-2024-006', 5500000.00, '2024-12-15', NULL, 'bank_transfer', 'overdue'),
(5, 7, 'INV-2024-007', 6570000.00, '2025-08-31', NULL, 'cheque', 'overdue');

-- ============================================================
-- 8. CALL_LOGS
-- ============================================================
INSERT INTO call_logs (client_id, employee_id, call_type, call_datetime, duration_minutes, purpose, outcome) VALUES
(1, 1, 'inbound', '2024-12-01 09:15:00', 12, 'Technical issue with Galaxy S24', 'resolved'),
(1, 2, 'inbound', '2024-12-01 10:30:00', 8, 'Order inquiry for TV', 'resolved'),
(2, 3, 'outbound', '2024-12-02 14:00:00', 15, 'Customer satisfaction survey', 'completed'),
(2, 4, 'telemarketing', '2024-12-02 15:30:00', 20, 'Promotion of new fiber package', 'callback'),
(3, 2, 'inbound', '2024-12-03 11:00:00', 5, 'Product availability inquiry', 'resolved'),
(4, 4, 'telemarketing', '2024-12-04 09:00:00', 25, 'ERP solution presentation', 'callback'),
(5, 1, 'inbound', '2024-12-05 13:45:00', 18, 'AC installation support', 'resolved'),
(1, 7, 'outbound', '2024-12-06 10:00:00', 10, 'Follow up on refrigerator complaint', 'resolved'),
(2, 3, 'outbound', '2024-12-07 14:30:00', 22, 'Upsell Business Pro package', 'no_answer'),
(4, 4, 'telemarketing', '2024-12-08 09:30:00', 30, 'Cloud services demo', 'completed');

-- ============================================================
-- 9. USERS (password là "Admin@123" đã hash bằng bcrypt)
-- ============================================================
INSERT INTO users (username, password_hash, email, full_name, role, employee_id) VALUES
('admin', '$2a$12$iVqh1cdc411By41qWhj5SeIv9kavowtQPAJdwvSbSukmKpoMO38zO', 'admin@ecs.com', 'System Administrator', 'admin', NULL),
('manager', '$2a$12$iVqh1cdc411By41qWhj5SeIv9kavowtQPAJdwvSbSukmKpoMO38zO', 'manager@ecs.com', 'Service Manager', 'manager', NULL),
('staff1', '$2a$12$iVqh1cdc411By41qWhj5SeIv9kavowtQPAJdwvSbSukmKpoMO38zO', 'minh.nguyen@ecs.com', 'Nguyen Minh', 'staff', 1),
('staff2', '$2a$12$iVqh1cdc411By41qWhj5SeIv9kavowtQPAJdwvSbSukmKpoMO38zO', 'lan.tran@ecs.com', 'Tran Lan', 'staff', 2),
('staff3', '$2a$12$iVqh1cdc411By41qWhj5SeIv9kavowtQPAJdwvSbSukmKpoMO38zO', 'hung.le@ecs.com', 'Le Hung', 'staff', 3),
('staff4', '$2a$12$iVqh1cdc411By41qWhj5SeIv9kavowtQPAJdwvSbSukmKpoMO38zO', 'thu.pham@ecs.com', 'Pham Thu', 'staff', 4),
('staff5', '$2a$12$iVqh1cdc411By41qWhj5SeIv9kavowtQPAJdwvSbSukmKpoMO38zO', 'duc.vo@ecs.com', 'Vo Duc', 'staff', 5),
('staff6', '$2a$12$iVqh1cdc411By41qWhj5SeIv9kavowtQPAJdwvSbSukmKpoMO38zO', 'mai.hoang@ecs.com', 'Hoang Mai', 'staff', 6),
('staff7', '$2a$12$iVqh1cdc411By41qWhj5SeIv9kavowtQPAJdwvSbSukmKpoMO38zO', 'tuan.dang@ecs.com', 'Dang Tuan', 'staff', 7),
('staff8', '$2a$12$iVqh1cdc411By41qWhj5SeIv9kavowtQPAJdwvSbSukmKpoMO38zO', 'hoa.bui@ecs.com', 'Bui Hoa', 'staff', 8);

-- ============================================================
-- 10. AI_ANALYSES (Dữ liệu mẫu phân tích AI)
-- ============================================================
INSERT INTO ai_analyses (call_id, sentiment_positive, sentiment_neutral, sentiment_negative, customer_tone_tags, closing_probability, buy_potential, score_greeting, score_listening, score_consulting, score_closing_skill, overall_score, transcript, summary, recommendations) VALUES
(1, 65, 25, 10, '["Cởi mở", "Hào hứng", "Quan tâm sản phẩm"]', 85, 'Cao', 9, 9, 8, 8, 88, 'Nhân viên: Chào anh Park, em hỗ trợ kỹ thuật Galaxy S24 đây ạ.\nKhách hàng: Anh bị lỗi màn hình chờ.\nNhân viên: Dạ anh vào Cài đặt -> Màn hình để reset lại giúp em nhé.', 'Hỗ trợ reset màn hình Galaxy S24 thành công, khách hàng rất hài lòng.', '["Cần phản hồi nhanh hơn trong 30 giây đầu", "Khai thác thêm nhu cầu mua phụ kiện"]'),
(2, 50, 40, 10, '["Lịch sự", "Đang cân nhắc giá"]', 60, 'Trung bình', 8, 8, 7, 7, 78, 'Nhân viên: Em chào anh ạ, em gọi từ bộ phận TV QLED.\nKhách hàng: Tivi 65 inch giá bao nhiêu vậy em?', 'Khách hàng hỏi giá Smart TV 4K QLED 65 inch.', '["Gửi báo giá qua Zalo/Email cho khách hàng", "Nhắc chương trình khuyến mãi tháng này"]');


