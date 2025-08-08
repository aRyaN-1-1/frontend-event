import dotenv from 'dotenv';
import pkg from 'pg';

dotenv.config();

const { Pool } = pkg;

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false }
});

class DatabaseService {
  async query(sql, params = []) {
    const client = await pool.connect();
    try {
      const result = await client.query(sql, params);
      return result.rows;
    } finally {
      client.release();
    }
  }

  // Users
  async getAllUsers() {
    const sql = `
      SELECT p.*, ARRAY(SELECT ur.role FROM user_roles ur WHERE ur.user_id = p.user_id) AS roles
      FROM profiles p
      ORDER BY p.created_at DESC
    `;
    return this.query(sql);
  }

  async getUserProfile(userId) {
    const sql = `
      SELECT p.*, ARRAY(SELECT ur.role FROM user_roles ur WHERE ur.user_id = p.user_id) AS roles
      FROM profiles p
      WHERE p.user_id = $1
      LIMIT 1
    `;
    const rows = await this.query(sql, [userId]);
    return rows[0] || null;
  }

  // Generic helpers
  async insert(table, data) {
    const keys = Object.keys(data);
    const placeholders = keys.map((_, i) => `$${i + 1}`).join(',');
    const sql = `INSERT INTO ${table}(${keys.join(',')}) VALUES(${placeholders}) RETURNING *`;
    const values = keys.map(k => data[k]);
    const rows = await this.query(sql, values);
    return rows;
  }

  async update(table, id, data) {
    const keys = Object.keys(data);
    const sets = keys.map((k, i) => `${k} = $${i + 1}`).join(',');
    const sql = `UPDATE ${table} SET ${sets} WHERE id = $${keys.length + 1} RETURNING *`;
    const values = [...keys.map(k => data[k]), id];
    const rows = await this.query(sql, values);
    return rows;
  }

  async delete(table, id) {
    await this.query(`DELETE FROM ${table} WHERE id = $1`, [id]);
    return { success: true };
  }

  // Events
  async getEvents(filters = {}) {
    const conditions = [];
    const params = [];

    if (filters.eventTypes?.length) {
      params.push(filters.eventTypes);
      conditions.push(`event_type = ANY($${params.length})`);
    }
    if (filters.location) {
      params.push(filters.location);
      conditions.push(`location = $${params.length}`);
    }
    if (filters.priceRange) {
      params.push(filters.priceRange[0]);
      conditions.push(`price_per_person >= $${params.length}`);
      params.push(filters.priceRange[1]);
      conditions.push(`price_per_person <= $${params.length}`);
    }
    if (filters.date) {
      params.push(filters.date);
      conditions.push(`event_date = $${params.length}`);
    }

    const where = conditions.length ? `WHERE ${conditions.join(' AND ')}` : '';
    const sql = `
      SELECT e.*, 
        jsonb_build_object(
          'id', c.id,
          'name', c.name,
          'about', c.about,
          'profile_image_url', c.profile_image_url
        ) AS coaches
      FROM events e
      LEFT JOIN coaches c ON c.id = e.coach_id
      ${where}
      ORDER BY e.event_date ASC
    `;
    return this.query(sql, params);
  }

  async getEventById(id) {
    const sql = `
      SELECT e.*, 
        jsonb_build_object(
          'id', c.id,
          'name', c.name,
          'about', c.about,
          'profile_image_url', c.profile_image_url
        ) AS coaches
      FROM events e
      LEFT JOIN coaches c ON c.id = e.coach_id
      WHERE e.id = $1
      LIMIT 1
    `;
    const rows = await this.query(sql, [id]);
    return rows[0] || null;
  }

  // Coaches
  async getCoaches() {
    const sql = `SELECT * FROM coaches ORDER BY created_at DESC`;
    return this.query(sql);
  }

  async getCoachById(id) {
    const sql = `SELECT * FROM coaches WHERE id = $1 LIMIT 1`;
    const rows = await this.query(sql, [id]);
    return rows[0] || null;
  }

  // Bookings
  async getUserBookings(userId) {
    const sql = `
      SELECT b.*, 
        jsonb_build_object(
          'id', e.id,
          'name', e.name,
          'short_description', e.short_description,
          'image_url', e.image_url,
          'location', e.location,
          'event_type', e.event_type,
          'available_slots', e.available_slots,
          'price_per_person', e.price_per_person,
          'event_date', e.event_date
        ) AS events
      FROM bookings b
      JOIN events e ON e.id = b.event_id
      WHERE b.user_id = $1 AND b.status = 'active'
      ORDER BY b.booking_date DESC
    `;
    return this.query(sql, [userId]);
  }

  async createBooking(userId, eventId) {
    // Prevent double booking
    const existing = await this.query(`SELECT id FROM bookings WHERE user_id = $1 AND event_id = $2 AND status = 'active' LIMIT 1`, [userId, eventId]);
    if (existing.length) {
      const err = new Error('You have already booked this event');
      err.code = 'ALREADY_BOOKED';
      throw err;
    }
    const sql = `INSERT INTO bookings (user_id, event_id) VALUES ($1, $2) RETURNING *`;
    const rows = await this.query(sql, [userId, eventId]);
    return rows[0];
  }

  async cancelBooking(bookingId, userId) {
    const sql = `UPDATE bookings SET status = 'cancelled' WHERE id = $1 AND user_id = $2 RETURNING *`;
    const rows = await this.query(sql, [bookingId, userId]);
    return rows[0];
  }
}

export default new DatabaseService();