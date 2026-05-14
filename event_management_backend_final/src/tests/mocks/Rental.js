const { AppError } = require('../../utils/AppError');

class Rental {
  static rentals = [];

  constructor(data) {
    this.id = Date.now().toString();
    this.name = data.name;
    this.description = data.description;
    this.price = data.price;
    this.category = data.category;
    this.status = data.status || 'available';
    this.user_id = data.user_id;
    this.image = data.image;
    this.createdAt = new Date().toISOString();
    this.updatedAt = new Date().toISOString();
  }

  static async findAll(filters = {}) {
    // Return mock paginated response
    return {
      data: {
        rentals: this.rentals,
        total: this.rentals.length,
        page: 1,
        limit: 10,
        totalPages: Math.ceil(this.rentals.length / 10),
      },
    };
  }

  static async findById(id) {
    const rental = this.rentals.find((r) => r.id === id);
    if (!rental) {
      throw new AppError('Rental not found', 404);
    }
    return { data: { rental } };
  }

  static async create(data) {
    const rental = new Rental(data);
    this.rentals.push(rental);
    return { data: { rental } };
  }

  static async update(id, data) {
    const index = this.rentals.findIndex((r) => r.id === id);
    if (index === -1) {
      throw new AppError('Rental not found', 404);
    }
    
    const rental = { ...this.rentals[index], ...data, updatedAt: new Date().toISOString() };
    this.rentals[index] = rental;
    return { data: { rental } };
  }

  static async delete(id) {
    const index = this.rentals.findIndex((r) => r.id === id);
    if (index === -1) {
      throw new AppError('Rental not found', 404);
    }
    
    this.rentals.splice(index, 1);
    return { data: null };
  }
}

module.exports = Rental; 