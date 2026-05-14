const User = require('../models/User');
const { setupLogger } = require('../utils/logger');

const logger = setupLogger();

describe('User Model', () => {
  const testUser = {
    username: 'testuser',
    email: 'test@example.com',
    password: 'password123',
    role: 'user',
  };

  beforeEach(async () => {
    // Clean up test data before each test
    try {
      const { data: users } = await User.findAll();
      if (users) {
        for (const user of users) {
          if (user.email === testUser.email) {
            await User.delete(user.id);
          }
        }
      }
    } catch (error) {
      logger.error('Error in beforeEach:', error);
    }
  });

  it('should create a new user', async () => {
    const user = await User.create(testUser);
    expect(user).toBeDefined();
    expect(user.username).toBe(testUser.username);
    expect(user.email).toBe(testUser.email);
    expect(user.role).toBe(testUser.role);
    expect(user.password).toBeDefined();
    expect(user.password).not.toBe(testUser.password); // Password should be hashed
    expect(user.password.startsWith('$2a$')).toBe(true); // Should be bcrypt hash
  });

  it('should find a user by email', async () => {
    const createdUser = await User.create(testUser);
    const foundUser = await User.findByEmail(testUser.email);
    expect(foundUser).toBeDefined();
    expect(foundUser.id).toBe(createdUser.id);
  });

  it('should update a user', async () => {
    const user = await User.create(testUser);
    const updatedData = {
      username: 'updateduser',
    };
    const updatedUser = await User.update(user.id, updatedData);
    expect(updatedUser.username).toBe(updatedData.username);
  });

  it('should delete a user', async () => {
    const user = await User.create(testUser);
    const result = await User.delete(user.id);
    expect(result).toBe(true);
    const deletedUser = await User.findById(user.id);
    expect(deletedUser).toBeNull();
  });

  it('should verify password correctly', async () => {
    const user = await User.create(testUser);
    const isPasswordValid = await User.verifyPassword(testUser.password, user.password);
    expect(isPasswordValid).toBe(true);
  });

  it('should not verify incorrect password', async () => {
    const user = await User.create(testUser);
    const isPasswordValid = await User.verifyPassword('wrongpassword', user.password);
    expect(isPasswordValid).toBe(false);
  });
}); 