const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User');

const userService = {
  register: async (userData) => {
    const existingUser = User.findByEmail(userData.email);
    if (existingUser) {
      const err = new Error('User with this email already exists');
      err.status = 400;
      err.code = 'USER_EXISTS';
      throw err;
    }

    const salt = await bcrypt.genSalt(10);
    const password_hash = await bcrypt.hash(userData.password, salt);

    return User.create({
      name: userData.name,
      email: userData.email,
      password_hash,
      role: 'viewer',
      status: 'active',
    });
  },

  login: async (email, password) => {
    const user = User.findByEmail(email);
    if (!user) {
      const err = new Error('Invalid email or password');
      err.status = 401;
      err.code = 'INVALID_CREDENTIALS';
      throw err;
    }

    if (user.status !== 'active') {
      const err = new Error('User account is inactive');
      err.status = 403;
      err.code = 'ACCOUNT_INACTIVE';
      throw err;
    }

    const isMatch = await bcrypt.compare(password, user.password_hash);
    if (!isMatch) {
      const err = new Error('Invalid email or password');
      err.status = 401;
      err.code = 'INVALID_CREDENTIALS';
      throw err;
    }

    const token = jwt.sign(
      { id: user.id, email: user.email, role: user.role, status: user.status },
      process.env.JWT_SECRET || 'your_super_secret_key_min_32_chars',
      { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }
    );

    return {
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        status: user.status,
      },
    };
  },

  getProfile: (userId) => {
    const user = User.findById(userId);
    if (!user) {
      const err = new Error('User not found');
      err.status = 404;
      err.code = 'USER_NOT_FOUND';
      throw err;
    }
    return user;
  },

  getAllUsers: () => {
    return User.findAll();
  },

  updateRole: (userId, role) => {
    const updated = User.updateRole(userId, role);
    if (!updated) {
      const err = new Error('User not found');
      err.status = 404;
      err.code = 'USER_NOT_FOUND';
      throw err;
    }
    return true;
  },

  updateStatus: (userId, status) => {
    const updated = User.updateStatus(userId, status);
    if (!updated) {
      const err = new Error('User not found');
      err.status = 404;
      err.code = 'USER_NOT_FOUND';
      throw err;
    }
    return true;
  },

  deleteUser: (userId) => {
    const deleted = User.delete(userId);
    if (!deleted) {
      const err = new Error('User not found');
      err.status = 404;
      err.code = 'USER_NOT_FOUND';
      throw err;
    }
    return true;
  }
};

module.exports = userService;
