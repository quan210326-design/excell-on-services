require('dotenv').config();
const { sequelize } = require('./src/config/database');
const { CallLog, Client } = require('./src/models');

async function runTests() {
  console.log('\x1b[36m%s\x1b[0m', '🧪 Starting Call Log and Employee Fallback Backend Tests...');
  try {
    // 1. Test database connection
    await sequelize.authenticate();
    console.log('✅ Database connection authenticated successfully.');

    // 2. Fetch existing call logs count
    const initialCount = await CallLog.count();
    console.log(`📊 Initial call logs count: ${initialCount}`);

    // 3. Find a client to use for test
    const client = await Client.findOne();
    if (!client) {
      throw new Error('No clients found in the database. Please seed the database first.');
    }
    console.log(`👤 Using test client: ${client.company_name} (ID: ${client.id})`);

    // 4. Test call log creation with employee fallback
    // Import the controller to test the actual create function we modified.
    const callLogController = require('./src/controllers/callLogController');
    
    let createdLogId = null;
    const mockReq = {
      user: { id: 1, role: 'admin' }, // admin role has no automatic staff mapping, tests our fallback
      body: {
        client_id: client.id,
        call_type: 'outbound',
        call_datetime: new Date(),
        duration_minutes: 3,
        purpose: 'Test cuộc gọi ảo tự động',
        outcome: 'completed',
        notes: 'Ghi chú kiểm thử tích hợp tự động.'
      }
    };
    
    const mockRes = {
      statusCode: 200,
      jsonData: null,
      status: function(code) {
        this.statusCode = code;
        return this;
      },
      json: function(data) {
        this.jsonData = data;
        return this;
      }
    };

    console.log('🔄 Executing callLogController.create with mocked request (no employee_id)...');
    await callLogController.create(mockReq, mockRes);

    if (mockRes.statusCode === 201 || (mockRes.jsonData && mockRes.jsonData.log)) {
      const log = mockRes.jsonData.log;
      createdLogId = log.id;
      console.log('\x1b[32m%s\x1b[0m', `✅ Success! Call log created with ID: ${log.id}`);
      console.log(`   Fallback assigned Employee ID: ${log.employee_id}`);
    } else {
      throw new Error(`Failed to create call log. Status: ${mockRes.statusCode}, Data: ${JSON.stringify(mockRes.jsonData)}`);
    }

    // 5. Verify database record exists
    const verifiedLog = await CallLog.findByPk(createdLogId);
    if (!verifiedLog) {
      throw new Error(`Created call log ID ${createdLogId} could not be retrieved from DB.`);
    }
    console.log('✅ Call log verified in database.');

    // 6. Clean up: delete test log
    await verifiedLog.destroy();
    console.log('🗑️ Test call log cleaned up successfully.');

    console.log('\x1b[32m%s\x1b[0m', '\n🎉 ALL BACKEND TESTS PASSED SUCCESSFULLY!');
    process.exit(0);
  } catch (err) {
    console.error('\x1b[31m%s\x1b[0m', '❌ Integration Test Failed:', err.message || err);
    process.exit(1);
  }
}

runTests();
