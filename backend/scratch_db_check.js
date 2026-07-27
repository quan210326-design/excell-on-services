const { sequelize } = require('./src/config/database');
require('./src/models');

const checkDB = async () => {
  try {
    await sequelize.authenticate();
    console.log('Database connected.');
    
    const tables = ['services', 'departments', 'employees', 'clients', 'client_services', 'client_products', 'payments', 'call_logs', 'users', 'client_procedures'];
    for (const table of tables) {
      try {
        const [results] = await sequelize.query(`SELECT COUNT(*) as count FROM ${table}`);
        console.log(`Table ${table}: ${results[0].count} rows`);
      } catch (err) {
        console.log(`Table ${table}: Error - ${err.message}`);
      }
    }
    
    // Check one client's full details
    const [clientRes] = await sequelize.query(`SELECT id, company_name FROM clients LIMIT 5`);
    console.log('\nClients in database:', clientRes);
    
    process.exit(0);
  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
};

checkDB();
