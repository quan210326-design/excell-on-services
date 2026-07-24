// Khai báo tất cả models và quan hệ giữa chúng
const Service = require('./Service');
const Department = require('./Department');
const Employee = require('./Employee');
const Client = require('./Client');
const ClientService = require('./ClientService');
const ClientProduct = require('./ClientProduct');
const Payment = require('./Payment');
const CallLog = require('./CallLog');
const User = require('./User');
const ClientProcedure = require('./ClientProcedure');

// ── Employee relationships ──────────────────────────
Employee.belongsTo(Department, { foreignKey: 'dept_id', as: 'department' });
Department.hasMany(Employee, { foreignKey: 'dept_id', as: 'employees' });

Employee.belongsTo(Service, { foreignKey: 'service_id', as: 'service' });
Service.hasMany(Employee, { foreignKey: 'service_id', as: 'employees' });

// ── ClientService relationships ──────────────────────
ClientService.belongsTo(Client, { foreignKey: 'client_id', as: 'client' });
Client.hasMany(ClientService, { foreignKey: 'client_id', as: 'clientServices' });

ClientService.belongsTo(Service, { foreignKey: 'service_id', as: 'service' });
Service.hasMany(ClientService, { foreignKey: 'service_id', as: 'clientServices' });

// ── ClientProduct relationships ──────────────────────
ClientProduct.belongsTo(Client, { foreignKey: 'client_id', as: 'client' });
Client.hasMany(ClientProduct, { foreignKey: 'client_id', as: 'products' });

// ── ClientProcedure relationships ─────────────────────
ClientProcedure.belongsTo(Client, { foreignKey: 'client_id', as: 'client' });
Client.hasMany(ClientProcedure, { foreignKey: 'client_id', as: 'procedures' });

// ── Payment relationships ──────────────────────────
Payment.belongsTo(Client, { foreignKey: 'client_id', as: 'client' });
Client.hasMany(Payment, { foreignKey: 'client_id', as: 'payments' });

Payment.belongsTo(ClientService, { foreignKey: 'client_service_id', as: 'clientService' });
ClientService.hasMany(Payment, { foreignKey: 'client_service_id', as: 'payments' });

// ── CallLog relationships ──────────────────────────
CallLog.belongsTo(Client, { foreignKey: 'client_id', as: 'client' });
Client.hasMany(CallLog, { foreignKey: 'client_id', as: 'callLogs' });

CallLog.belongsTo(Employee, { foreignKey: 'employee_id', as: 'employee' });
Employee.hasMany(CallLog, { foreignKey: 'employee_id', as: 'callLogs' });

// ── User relationships ──────────────────────────────
User.belongsTo(Employee, { foreignKey: 'employee_id', as: 'employee' });
Employee.hasOne(User, { foreignKey: 'employee_id', as: 'user' });

module.exports = {
  Service, Department, Employee, Client,
  ClientService, ClientProduct, ClientProcedure, Payment, CallLog, User
};

