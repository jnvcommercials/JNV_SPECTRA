const bcrypt = require('bcryptjs');
const { AppError } = require('../../utils/AppError');

class User {
  constructor(data) {
    this.id = data.id || Date.now().toString();
    this.name = data.name;
    this.email = data.email;
    this.password = data.password;
    this.role = data.role || 'user';
    this.isAdmin = data.role === 'admin';
    this.createdAt = data.createdAt || new Date().toISOString();
    this.updatedAt = data.updatedAt || new Date().toISOString();
  }

  static async create(data) {
    const user = new User(data);
    User.users.push(user);
    return { data: { user } };
  }

  static async findByEmail(email) {
    const user = User.users.find((user) => user.email === email);
    if (!user) {
      throw new AppError('User not found', 404);
    }
    return { data: { user } };
  }

  static async findById(id) {
    const user = User.users.find((user) => user.id === id);
    if (!user) {
      throw new AppError('User not found', 404);
    }
    return { data: { user } };
  }

  static async update(id, data) {
    const index = User.users.findIndex((user) => user.id === id);
    if (index === -1) {
      throw new AppError('User not found', 404);
    }
    
    const user = { ...User.users[index], ...data, updatedAt: new Date().toISOString() };
    User.users[index] = user;
    return { data: { user } };
  }

  static async delete(id) {
    const index = User.users.findIndex((user) => user.id === id);
    if (index === -1) {
      throw new AppError('User not found', 404);
    }
    
    User.users.splice(index, 1);
    return { data: null };
  }

  async correctPassword(candidatePassword, userPassword) {
    return candidatePassword === userPassword;
  }
}

User.users = [];

module.exports = User; 