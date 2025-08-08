import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config();

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_ANON_KEY
);

class AuthService {
  constructor() {
    this.supabase = supabase;
  }

  // Sign up new user
  async signUp(email, password, metadata = {}) {
    try {
      const { data, error } = await this.supabase.auth.signUp({
        email,
        password,
        options: {
          data: metadata
        }
      });

      if (error) throw error;
      return { user: data.user, session: data.session };
    } catch (error) {
      throw new Error(`Sign up failed: ${error.message}`);
    }
  }

  // Sign in user
  async signIn(email, password) {
    try {
      const { data, error } = await this.supabase.auth.signInWithPassword({
        email,
        password
      });

      if (error) throw error;
      return { user: data.user, session: data.session };
    } catch (error) {
      throw new Error(`Sign in failed: ${error.message}`);
    }
  }

  // Sign out user
  async signOut() {
    try {
      const { error } = await this.supabase.auth.signOut();
      if (error) throw error;
      return { success: true };
    } catch (error) {
      throw new Error(`Sign out failed: ${error.message}`);
    }
  }

  // Get user from token
  async getUserFromToken(token) {
    try {
      const { data: { user }, error } = await this.supabase.auth.getUser(token);
      if (error) throw error;
      return user;
    } catch (error) {
      throw new Error(`Token validation failed: ${error.message}`);
    }
  }

  // Check if user has specific role
  async hasRole(userId, role) {
    try {
      const { data, error } = await this.supabase
        .from('user_roles')
        .select('role')
        .eq('user_id', userId)
        .eq('role', role)
        .single();

      if (error && error.code !== 'PGRST116') throw error;
      return !!data;
    } catch (error) {
      console.error('Role check error:', error);
      return false;
    }
  }

  // Get user roles
  async getUserRoles(userId) {
    try {
      const { data, error } = await this.supabase
        .from('user_roles')
        .select('role')
        .eq('user_id', userId);

      if (error) throw error;
      return data.map(item => item.role);
    } catch (error) {
      throw new Error(`Failed to get user roles: ${error.message}`);
    }
  }

  // Refresh session
  async refreshSession(refreshToken) {
    try {
      const { data, error } = await this.supabase.auth.refreshSession({
        refresh_token: refreshToken
      });

      if (error) throw error;
      return { user: data.user, session: data.session };
    } catch (error) {
      throw new Error(`Session refresh failed: ${error.message}`);
    }
  }
}

export default new AuthService();