const { Op } = require('sequelize');
const { Employee, Department, Service, User } = require('../models');

// GET /api/employees?dept_id=&service_id=&status=&search=
const getAll = async (req, res) => {
  try {
    const { dept_id, service_id, status, search } = req.query;
    const where = {};
    if (dept_id) where.dept_id = dept_id;
    if (service_id) where.service_id = service_id;
    if (status) where.status = status;
    if (search) {
      where[Op.or] = [
        { first_name: { [Op.like]: `%${search}%` } },
        { last_name: { [Op.like]: `%${search}%` } },
        { emp_code: { [Op.like]: `%${search}%` } },
        { email: { [Op.like]: `%${search}%` } },
        { designation: { [Op.like]: `%${search}%` } }
      ];
    }
    const employees = await Employee.findAll({
      where,
      include: [
        { model: Department, as: 'department', attributes: ['id', 'name', 'code'] },
        { model: Service, as: 'service', attributes: ['id', 'name', 'type'] }
      ],
      order: [['emp_code', 'ASC']]
    });
    res.json(employees);
  } catch (err) {
    res.status(500).json({ message: 'Lỗi server', error: err.message });
  }
};

// GET /api/employees/:id
const getById = async (req, res) => {
  try {
    const emp = await Employee.findByPk(req.params.id, {
      include: [
        { model: Department, as: 'department' },
        { model: Service, as: 'service' },
        { model: User, as: 'user', attributes: ['id', 'username', 'role', 'is_active', 'last_login'] }
      ]
    });
    if (!emp) return res.status(404).json({ message: 'Không tìm thấy nhân viên' });
    res.json(emp);
  } catch (err) {
    res.status(500).json({ message: 'Lỗi server', error: err.message });
  }
};

// POST /api/employees
const create = async (req, res) => {
  try {
    const emp = await Employee.create(req.body);
    res.status(201).json({ message: 'Thêm nhân viên thành công', emp });
  } catch (err) {
    console.error('Error in create employee:', err);
    if (err.name === 'SequelizeUniqueConstraintError') {
      const field = err.errors[0]?.path;
      if (field === 'emp_code') {
        return res.status(400).json({ message: 'Mã nhân viên đã tồn tại trong hệ thống' });
      }
      if (field === 'email') {
        return res.status(400).json({ message: 'Email này đã được sử dụng bởi nhân viên khác' });
      }
      return res.status(400).json({ message: 'Trường thông tin bị trùng lặp' });
    }
    if (err.name === 'SequelizeValidationError') {
      return res.status(400).json({ message: err.errors[0].message });
    }
    res.status(500).json({ message: 'Lỗi server', error: err.message });
  }
};

// PUT /api/employees/:id
const update = async (req, res) => {
  try {
    const emp = await Employee.findByPk(req.params.id);
    if (!emp) return res.status(404).json({ message: 'Không tìm thấy nhân viên' });
    await emp.update(req.body);
    res.json({ message: 'Cập nhật thành công', emp });
  } catch (err) {
    console.error('Error in update employee:', err);
    if (err.name === 'SequelizeUniqueConstraintError') {
      const field = err.errors[0]?.path;
      if (field === 'emp_code') {
        return res.status(400).json({ message: 'Mã nhân viên đã tồn tại trong hệ thống' });
      }
      if (field === 'email') {
        return res.status(400).json({ message: 'Email này đã được sử dụng bởi nhân viên khác' });
      }
      return res.status(400).json({ message: 'Trường thông tin bị trùng lặp' });
    }
    if (err.name === 'SequelizeValidationError') {
      return res.status(400).json({ message: err.errors[0].message });
    }
    res.status(500).json({ message: 'Lỗi server', error: err.message });
  }
};

// DELETE /api/employees/:id
const remove = async (req, res) => {
  try {
    const emp = await Employee.findByPk(req.params.id);
    if (!emp) return res.status(404).json({ message: 'Không tìm thấy nhân viên' });
    await emp.destroy();
    res.json({ message: 'Xóa nhân viên thành công' });
  } catch (err) {
    console.error('Error in remove employee:', err);
    res.status(500).json({ message: 'Lỗi server', error: err.message });
  }
};

module.exports = { getAll, getById, create, update, remove };

