import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config();

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_ANON_KEY
);

class DatabaseService {
  constructor() {
    this.supabase = supabase;
  }

  // Generic query methods
  async select(table, options = {}) {
    try {
      let query = this.supabase.from(table).select(options.select || '*');
      
      if (options.filters) {
        Object.entries(options.filters).forEach(([key, value]) => {
          query = query.eq(key, value);
        });
      }
      
      if (options.orderBy) {
        query = query.order(options.orderBy.column, { 
          ascending: options.orderBy.ascending !== false 
        });
      }
      
      if (options.limit) {
        query = query.limit(options.limit);
      }

      const { data, error } = await query;
      if (error) throw error;
      return data;
    } catch (error) {
      throw new Error(`Select query failed: ${error.message}`);
    }
  }

  async insert(table, data) {
    try {
      const { data: result, error } = await this.supabase
        .from(table)
        .insert(data)
        .select();
      
      if (error) throw error;
      return result;
    } catch (error) {
      throw new Error(`Insert failed: ${error.message}`);
    }
  }

  async update(table, id, data) {
    try {
      const { data: result, error } = await this.supabase
        .from(table)
        .update(data)
        .eq('id', id)
        .select();
      
      if (error) throw error;
      return result;
    } catch (error) {
      throw new Error(`Update failed: ${error.message}`);
    }
  }

  async delete(table, id) {
    try {
      const { error } = await this.supabase
        .from(table)
        .delete()
        .eq('id', id);
      
      if (error) throw error;
      return { success: true };
    } catch (error) {
      throw new Error(`Delete failed: ${error.message}`);
    }
  }

  // User-specific methods
  async getAllUsers() {
    try {
      const { data, error } = await this.supabase
        .from('profiles')
        .select(`
          *,
          user_roles (role)
        `)
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      return data;
    } catch (error) {
      throw new Error(`Failed to get users: ${error.message}`);
    }
  }

  async getUserProfile(userId) {
    try {
      const { data, error } = await this.supabase
        .from('profiles')
        .select(`
          *,
          user_roles (role)
        `)
        .eq('user_id', userId)
        .single();
      
      if (error) throw error;
      return data;
    } catch (error) {
      throw new Error(`Failed to get user profile: ${error.message}`);
    }
  }

  // Event-specific methods
  async getEvents(filters = {}) {
    try {
      let query = this.supabase
        .from('events')
        .select(`
          *,
          coaches (
            id,
            name,
            about,
            profile_image_url
          )
        `);

      if (filters.eventTypes && filters.eventTypes.length > 0) {
        query = query.in('event_type', filters.eventTypes);
      }

      if (filters.location) {
        query = query.eq('location', filters.location);
      }

      if (filters.priceRange) {
        query = query
          .gte('price_per_person', filters.priceRange[0])
          .lte('price_per_person', filters.priceRange[1]);
      }

      if (filters.date) {
        query = query.eq('event_date', filters.date);
      }

      const { data, error } = await query.order('event_date', { ascending: true });
      
      if (error) throw error;
      return data;
    } catch (error) {
      throw new Error(`Failed to get events: ${error.message}`);
    }
  }

  async getEventById(id) {
    try {
      const { data, error } = await this.supabase
        .from('events')
        .select(`
          *,
          coaches (
            id,
            name,
            about,
            profile_image_url
          )
        `)
        .eq('id', id)
        .single();
      
      if (error) throw error;
      return data;
    } catch (error) {
      throw new Error(`Failed to get event: ${error.message}`);
    }
  }

  // Coach-specific methods
  async getCoaches() {
    try {
      const { data, error } = await this.supabase
        .from('coaches')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      return data;
    } catch (error) {
      throw new Error(`Failed to get coaches: ${error.message}`);
    }
  }

  async getCoachById(id) {
    try {
      const { data, error } = await this.supabase
        .from('coaches')
        .select('*')
        .eq('id', id)
        .single();
      
      if (error) throw error;
      return data;
    } catch (error) {
      throw new Error(`Failed to get coach: ${error.message}`);
    }
  }

  // Booking-specific methods
  async getUserBookings(userId) {
    try {
      const { data, error } = await this.supabase
        .from('bookings')
        .select(`
          *,
          events (
            id,
            name,
            short_description,
            image_url,
            location,
            event_type,
            available_slots,
            price_per_person,
            event_date
          )
        `)
        .eq('user_id', userId)
        .eq('status', 'active')
        .order('booking_date', { ascending: false });
      
      if (error) throw error;
      return data;
    } catch (error) {
      throw new Error(`Failed to get user bookings: ${error.message}`);
    }
  }

  async createBooking(userId, eventId) {
    try {
      const { data, error } = await this.supabase
        .from('bookings')
        .insert([{
          user_id: userId,
          event_id: eventId
        }])
        .select();
      
      if (error) throw error;
      return data[0];
    } catch (error) {
      throw new Error(`Failed to create booking: ${error.message}`);
    }
  }

  async cancelBooking(bookingId, userId) {
    try {
      const { data, error } = await this.supabase
        .from('bookings')
        .update({ status: 'cancelled' })
        .eq('id', bookingId)
        .eq('user_id', userId)
        .select();
      
      if (error) throw error;
      return data[0];
    } catch (error) {
      throw new Error(`Failed to cancel booking: ${error.message}`);
    }
  }

  // Storage methods
  async uploadFile(bucket, filePath, file) {
    try {
      const { data, error } = await this.supabase.storage
        .from(bucket)
        .upload(filePath, file);
      
      if (error) throw error;
      
      const { data: urlData } = this.supabase.storage
        .from(bucket)
        .getPublicUrl(filePath);
      
      return urlData.publicUrl;
    } catch (error) {
      throw new Error(`File upload failed: ${error.message}`);
    }
  }

  async deleteFile(bucket, filePath) {
    try {
      const { error } = await this.supabase.storage
        .from(bucket)
        .remove([filePath]);
      
      if (error) throw error;
      return { success: true };
    } catch (error) {
      throw new Error(`File deletion failed: ${error.message}`);
    }
  }
}

export default new DatabaseService();