const fs = require('fs');
const path = require('path');
const { Sequelize } = require('sequelize');
const { sequelize } = require('./src/config/database');
const { ClientProcedure } = require('./src/models');

const procedures = [
  {
    client_id: 1,
    title: 'Quy trình xử lý lỗi màn hình điện thoại Samsung',
    steps: '1. Tiếp nhận cuộc gọi hỗ trợ từ khách hàng sử dụng điện thoại Samsung.\n2. Hỏi khách hàng về hiện tượng lỗi (sọc màn hình, nhấp nháy, tối đen).\n3. Kiểm tra thông tin kích hoạt bảo hành điện tử thông qua IMEI.\n4. Hướng dẫn khách hàng thử khởi động lại máy bằng cách giữ phím Nguồn + Giảm âm lượng trong 10 giây.\n5. Nếu vẫn lỗi, tư vấn khách hàng mang máy đến trung tâm bảo hành Samsung gần nhất.\n6. Ghi lại kết quả cuộc gọi vào hệ thống.',
    is_active: true
  },
  {
    client_id: 2,
    title: 'Quy trình xử lý phản ánh sóng yếu mạng Viettel',
    steps: '1. Chào khách hàng và tiếp nhận phản ánh về chất lượng sóng điện thoại/data.\n2. Hỏi vị trí cụ thể khách hàng đang gặp sự cố (trong nhà, ngoài trời, tầng cao, tầng hầm).\n3. Hướng dẫn khách hàng kiểm tra lại chế độ mạng trên điện thoại (chuyển đổi LTE/3G/2G) hoặc bật/tắt chế độ máy bay.\n4. Tra cứu vị trí trạm BTS gần nhất trên hệ thống kỹ thuật để xem có sự cố diện rộng hay không.\n5. Nếu trạm hoạt động bình thường, ghi nhận sự cố để chuyển tiếp tổ kỹ thuật khu vực kiểm tra thực địa.\n6. Hẹn khách hàng phản hồi kết quả xử lý trong vòng 24 giờ.',
    is_active: true
  },
  {
    client_id: 3,
    title: 'Quy trình đổi trả sữa bột Vinamilk bị vón cục',
    steps: '1. Hỏi thăm tình trạng sức khỏe của bé và khách hàng.\n2. Ghi nhận thông tin chi tiết: Tên sản phẩm, Lô sản xuất (Lot), Hạn sử dụng (EXP).\n3. Hỏi khách hàng về điều kiện bảo quản sữa tại nhà.\n4. Thông báo bộ phận kiểm định chất lượng của Vinamilk sẽ liên hệ thu hồi mẫu sữa trong vòng 24 giờ.\n5. Hướng dẫn đại lý hoặc siêu thị nơi khách hàng mua tiến hành đổi hộp mới cho khách hàng miễn phí.\n6. Cảm ơn khách hàng đã phản hồi đóng góp ý kiến.',
    is_active: true
  },
  {
    client_id: 5,
    title: 'Quy trình tiếp nhận sửa chữa Điều hòa Panasonic tại nhà',
    steps: '1. Chào hỏi theo đúng quy chuẩn Panasonic Care.\n2. Ghi nhận lỗi thiết bị (không mát, chảy nước, báo lỗi đèn đỏ).\n3. Tra cứu thông tin bảo hành của sản phẩm dựa trên số serial.\n4. Xác nhận chi phí: Miễn phí nếu còn trong thời gian bảo hành, Báo giá theo bảng phí hãng nếu ngoài bảo hành.\n5. Lên lịch hẹn với kỹ thuật viên khu vực và thông báo thời gian hẹn cụ thể cho khách hàng.\n6. Ghi nhận cuộc gọi hoàn tất.',
    is_active: true
  },
  {
    client_id: 4,
    title: 'Quy trình kích hoạt dùng thử FPT Cloud Services',
    steps: '1. Chào khách hàng và hỏi nhu cầu trải nghiệm dịch vụ Cloud (VM, Storage, Database).\n2. Hướng dẫn khách hàng truy cập portal portal.fptcloud.com.\n3. Hướng dẫn nhập thông tin đăng ký doanh nghiệp và số điện thoại xác thực.\n4. Hỗ trợ kích hoạt gói credit dùng thử trị giá $100 sử dụng trong 30 ngày.\n5. Gửi tài liệu hướng dẫn sử dụng nhanh qua email khách hàng đăng ký.\n6. Đặt lịch cuộc gọi chăm sóc sau 3 ngày.',
    is_active: true
  }
];

const parseAndExecuteSql = async (filePath, description) => {
  console.log(`Reading ${description}...`);
  const sql = fs.readFileSync(filePath, 'utf8');
  const lines = sql.split('\n');
  const cleanLines = [];
  for (const line of lines) {
    const cleanLine = line.trim();
    if (cleanLine.startsWith('--') || cleanLine.length === 0) {
      continue;
    }
    cleanLines.push(line);
  }
  const cleanSql = cleanLines.join('\n');
  const statements = cleanSql
    .split(';')
    .map(s => s.trim())
    .filter(s => s.length > 0 && !s.toUpperCase().startsWith('USE'));

  console.log(`Executing ${statements.length} SQL statements for ${description}...`);
  for (let i = 0; i < statements.length; i++) {
    const stmt = statements[i];
    if (stmt) {
      await sequelize.query(stmt);
    }
  }
  console.log(`Finished ${description}.`);
};

const reseed = async () => {
  try {
    console.log('Ensuring database ecs_db exists...');
    const tempSequelize = new Sequelize(
      'mysql',
      process.env.DB_USER || 'root',
      process.env.DB_PASSWORD || '12345678',
      {
        host: process.env.DB_HOST || 'localhost',
        port: process.env.DB_PORT || 3306,
        dialect: 'mysql',
        logging: false
      }
    );
    await tempSequelize.query('CREATE DATABASE IF NOT EXISTS ecs_db CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci');
    await tempSequelize.close();
    console.log('Database ecs_db is ready.');

    await sequelize.authenticate();
    console.log('Database connected.');

    console.log('Disabling foreign key checks...');
    await sequelize.query('SET FOREIGN_KEY_CHECKS = 0');

    console.log('Dropping existing tables...');
    const tables = [
      'client_procedures',
      'call_logs',
      'payments',
      'client_products',
      'client_services',
      'users',
      'employees',
      'clients',
      'departments',
      'services'
    ];
    for (const table of tables) {
      await sequelize.query(`DROP TABLE IF EXISTS ${table}`);
      console.log(`Dropped ${table}`);
    }

    console.log('Executing raw schema.sql...');
    const schemaSqlPath = path.join(__dirname, '../database/schema.sql');
    await parseAndExecuteSql(schemaSqlPath, 'schema.sql');

    console.log('Executing raw seed.sql...');
    const seedSqlPath = path.join(__dirname, '../database/seed.sql');
    await parseAndExecuteSql(seedSqlPath, 'seed.sql');

    console.log('Syncing models with Sequelize (alter: true)...');
    require('./src/models');
    await sequelize.sync({ alter: true });
    console.log('Models synced.');

    console.log('Seeding client procedures...');
    for (const proc of procedures) {
      await ClientProcedure.create({
        ...proc,
        created_at: new Date(),
        updated_at: new Date()
      });
    }
    console.log('Client procedures seeded.');

    console.log('Enabling foreign key checks...');
    await sequelize.query('SET FOREIGN_KEY_CHECKS = 1');

    console.log('✅ Reseed completed successfully!');
    process.exit(0);
  } catch (error) {
    console.error('❌ Reseed failed:', error);
    process.exit(1);
  }
};

reseed();
