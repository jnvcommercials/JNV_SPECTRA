const request = require('supertest');
const app = require('../app');
const User = require('../tests/mocks/User');
const Rental = require('../tests/mocks/Rental');

jest.setTimeout(30000); // Set timeout to 30 seconds

describe('Rental API', () => {
  let adminToken;
  let userToken;
  let adminId;
  let userId;

  beforeAll(async () => {
    // Create admin user
    const adminResult = await User.create({
      name: 'Admin User',
      email: 'admin@test.com',
      password: 'password123',
      role: 'admin',
    });
    adminId = adminResult.data.user.id;
    adminToken = `test-token-${adminId}`;

    // Create regular user
    const userResult = await User.create({
      name: 'Regular User',
      email: 'user@test.com',
      password: 'password123',
      role: 'user',
    });
    userId = userResult.data.user.id;
    userToken = `test-token-${userId}`;
  });

  beforeEach(() => {
    // Clear rentals before each test
    Rental.rentals = [];
  });

  describe('GET /api/v1/rentals', () => {
    it('should return all rentals', async () => {
      await Rental.create({
        name: 'Test Rental 1',
        description: 'Test Description 1',
        price: 100,
        category: 'test',
        status: 'available',
        user_id: adminId,
      });

      await Rental.create({
        name: 'Test Rental 2',
        description: 'Test Description 2',
        price: 200,
        category: 'test',
        status: 'available',
        user_id: adminId,
      });

      const res = await request(app)
        .get('/api/v1/rentals')
        .set('Authorization', `Bearer ${userToken}`);

      expect(res.status).toBe(200);
      expect(res.body.data.rentals).toHaveLength(2);
    });
  });

  describe('GET /api/v1/rentals/:id', () => {
    it('should return a rental by id', async () => {
      const result = await Rental.create({
        name: 'Test Rental',
        description: 'Test Description',
        price: 100,
        category: 'test',
        status: 'available',
        user_id: adminId,
      });

      const res = await request(app)
        .get(`/api/v1/rentals/${result.data.rental.id}`)
        .set('Authorization', `Bearer ${userToken}`);

      expect(res.status).toBe(200);
      expect(res.body.data.rental.name).toBe('Test Rental');
    });

    it('should return 404 if rental not found', async () => {
      const res = await request(app)
        .get('/api/v1/rentals/nonexistent')
        .set('Authorization', `Bearer ${userToken}`);

      expect(res.status).toBe(404);
    });
  });

  describe('POST /api/v1/rentals', () => {
    it('should create a new rental', async () => {
      const res = await request(app)
        .post('/api/v1/rentals')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          name: 'New Rental',
          description: 'New Description',
          price: 100,
          category: 'test',
          status: 'available',
        });

      expect(res.status).toBe(201);
      expect(res.body.data.rental.name).toBe('New Rental');
    });

    it('should return 403 if user is not admin', async () => {
      const res = await request(app)
        .post('/api/v1/rentals')
        .set('Authorization', `Bearer ${userToken}`)
        .send({
          name: 'New Rental',
          description: 'New Description',
          price: 100,
          category: 'test',
          status: 'available',
        });

      expect(res.status).toBe(403);
    });
  });

  describe('PUT /api/v1/rentals/:id', () => {
    it('should update a rental', async () => {
      const result = await Rental.create({
        name: 'Test Rental',
        description: 'Test Description',
        price: 100,
        category: 'test',
        status: 'available',
        user_id: adminId,
      });

      const res = await request(app)
        .put(`/api/v1/rentals/${result.data.rental.id}`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          name: 'Updated Rental',
          price: 200,
        });

      expect(res.status).toBe(200);
      expect(res.body.data.rental.name).toBe('Updated Rental');
      expect(res.body.data.rental.price).toBe(200);
    });

    it('should return 403 if user is not admin', async () => {
      const result = await Rental.create({
        name: 'Test Rental',
        description: 'Test Description',
        price: 100,
        category: 'test',
        status: 'available',
        user_id: adminId,
      });

      const res = await request(app)
        .put(`/api/v1/rentals/${result.data.rental.id}`)
        .set('Authorization', `Bearer ${userToken}`)
        .send({
          name: 'Updated Rental',
          price: 200,
        });

      expect(res.status).toBe(403);
    });
  });

  describe('DELETE /api/v1/rentals/:id', () => {
    it('should delete a rental', async () => {
      const result = await Rental.create({
        name: 'Test Rental',
        description: 'Test Description',
        price: 100,
        category: 'test',
        status: 'available',
        user_id: adminId,
      });

      const res = await request(app)
        .delete(`/api/v1/rentals/${result.data.rental.id}`)
        .set('Authorization', `Bearer ${adminToken}`);

      expect(res.status).toBe(204);
    });

    it('should return 403 if user is not admin', async () => {
      const result = await Rental.create({
        name: 'Test Rental',
        description: 'Test Description',
        price: 100,
        category: 'test',
        status: 'available',
        user_id: adminId,
      });

      const res = await request(app)
        .delete(`/api/v1/rentals/${result.data.rental.id}`)
        .set('Authorization', `Bearer ${userToken}`);

      expect(res.status).toBe(403);
    });
  });
}); 