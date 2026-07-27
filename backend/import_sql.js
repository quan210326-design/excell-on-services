const fs = require('fs');
const path = require('path');
const { Sequelize } = require('sequelize');
require('dotenv').config();

const sequelize = new Sequelize(
  process.env.DB_NAME || 'ecs_db',
  process.env.DB_USER || 'root',
  process.env.DB_PASSWORD || '12345678',
  {
    host: process.env.DB_HOST || 'localhost',
    port: process.env.DB_PORT || 3306,
    dialect: 'mysql',
    logging: false
  }
);

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

const run = async () => {
  try {
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

    console.log('Enabling foreign key checks...');
    await sequelize.query('SET FOREIGN_KEY_CHECKS = 1');

    console.log('✅ Database initialized successfully without extra tables!');
    process.exit(0);
  } catch (error) {
    console.error('❌ Failed:', error);
    process.exit(1);
  }
};

run();
