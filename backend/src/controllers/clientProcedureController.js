const { ClientProcedure, Client, User, Employee, ClientService } = require('../models');
const { Op } = require('sequelize');

// GET /api/client-procedures?client_id=&search=
const getAll = async (req, res) => {
  try {
    const { client_id, search } = req.query;
    const where = {};
    if (client_id) where.client_id = client_id;
    if (search) {
      where.title = { [Op.like]: `%${search}%` };
    }

    let includeClause = [{ model: Client, as: 'client', attributes: ['id', 'company_name'] }];

    if (req.user.role === 'staff') {
      const userRecord = await User.findByPk(req.user.id);
      if (userRecord && userRecord.employee_id) {
        const emp = await Employee.findByPk(userRecord.employee_id);
        if (emp && emp.service_id) {
          includeClause[0].required = true;
          includeClause[0].include = [{
            model: ClientService,
            as: 'clientServices',
            where: { service_id: emp.service_id },
            required: true
          }];
        }
      }
    }

    const procedures = await ClientProcedure.findAll({
      where,
      include: includeClause,
      order: [['title', 'ASC']]
    });
    res.json(procedures);
  } catch (err) {
    if (err.name === 'SequelizeDatabaseError' && (err.parent?.code === 'ER_NO_SUCH_TABLE' || err.message.includes("doesn't exist"))) {
      return res.json([]);
    }
    res.status(500).json({ message: 'Lỗi server', error: err.message });
  }
};

// POST /api/client-procedures
const create = async (req, res) => {
  try {
    const proc = await ClientProcedure.create(req.body);
    res.status(201).json({ message: 'Thêm quy trình thành công', proc });
  } catch (err) {
    res.status(500).json({ message: 'Lỗi server', error: err.message });
  }
};

// PUT /api/client-procedures/:id
const update = async (req, res) => {
  try {
    const proc = await ClientProcedure.findByPk(req.params.id);
    if (!proc) return res.status(404).json({ message: 'Không tìm thấy quy trình' });
    await proc.update(req.body);
    res.json({ message: 'Cập nhật thành công', proc });
  } catch (err) {
    res.status(500).json({ message: 'Lỗi server', error: err.message });
  }
};

// DELETE /api/client-procedures/:id
const remove = async (req, res) => {
  try {
    const proc = await ClientProcedure.findByPk(req.params.id);
    if (!proc) return res.status(404).json({ message: 'Không tìm thấy quy trình' });
    await proc.destroy();
    res.json({ message: 'Xóa thành công' });
  } catch (err) {
    res.status(500).json({ message: 'Lỗi server', error: err.message });
  }
};

module.exports = { getAll, create, update, remove };
