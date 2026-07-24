const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { User, Employee, Department, Service } = require('../models');

// POST /api/auth/login
const login = async (req, res) => {
  try {
    const { username, password } = req.body;
    if (!username || !password) {
      return res.status(400).json({ message: 'Username và password là bắt buộc' });
    }

    const user = await User.findOne({
      where: { username, is_active: 1 },
      include: [{ model: Employee, as: 'employee' }]
    });

    if (!user) return res.status(401).json({ message: 'Tài khoản không tồn tại hoặc đã bị khóa' });

    // So sánh password
    const isMatch = await bcrypt.compare(password, user.password_hash);
    if (!isMatch) return res.status(401).json({ message: 'Sai mật khẩu' });

    // Cập nhật thời gian đăng nhập cuối
    await user.update({ last_login: new Date() });

    // Tạo JWT token
    const token = jwt.sign(
      { id: user.id, username: user.username, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRES_IN }
    );

    res.json({
      message: 'Đăng nhập thành công',
      token,
      user: {
        id: user.id, username: user.username,
        full_name: user.full_name, role: user.role, email: user.email,
        employee_id: user.employee_id
      }
    });
  } catch (err) {
    res.status(500).json({ message: 'Lỗi server', error: err.message });
  }
};

// GET /api/auth/me
const getMe = async (req, res) => {
  try {
    const user = await User.findByPk(req.user.id, {
      attributes: { exclude: ['password_hash'] },
      include: [{
        model: Employee,
        as: 'employee',
        include: [
          { model: Department, as: 'department', attributes: ['id', 'name', 'code'] },
          { model: Service, as: 'service', attributes: ['id', 'name', 'type'] }
        ]
      }]
    });
    res.json(user);
  } catch (err) {
    res.status(500).json({ message: 'Lỗi server', error: err.message });
  }
};

// POST /api/auth/change-password
const changePassword = async (req, res) => {
  try {
    const { old_password, new_password } = req.body;
    const user = await User.findByPk(req.user.id);
    const isMatch = await bcrypt.compare(old_password, user.password_hash);
    if (!isMatch) return res.status(400).json({ message: 'Mật khẩu cũ không đúng' });
    const hash = await bcrypt.hash(new_password, 10);
    await user.update({ password_hash: hash });
    res.json({ message: 'Đổi mật khẩu thành công' });
  } catch (err) {
    res.status(500).json({ message: 'Lỗi server', error: err.message });
  }
};

// PUT /api/auth/profile
const updateProfile = async (req, res) => {
  try {
    const { full_name, email } = req.body;
    const user = await User.findByPk(req.user.id);
    if (!user) return res.status(404).json({ message: 'Không tìm thấy người dùng' });

    // Kiểm tra trùng email nếu email thay đổi
    if (email && email !== user.email) {
      const existing = await User.findOne({ where: { email } });
      if (existing) return res.status(400).json({ message: 'Email đã được sử dụng' });
    }

    await user.update({
      full_name: full_name || user.full_name,
      email: email || user.email,
    });

    res.json({
      message: 'Cập nhật thông tin thành công',
      user: {
        id: user.id,
        username: user.username,
        full_name: user.full_name,
        email: user.email,
        role: user.role,
      }
    });
  } catch (err) {
    res.status(500).json({ message: 'Lỗi server', error: err.message });
  }
};

module.exports = { login, getMe, changePassword, updateProfile };
