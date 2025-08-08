import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config();

let supabase = null;
if (process.env.SUPABASE_URL && process.env.SUPABASE_ANON_KEY) {
  supabase = createClient(
    process.env.SUPABASE_URL,
    process.env.SUPABASE_ANON_KEY,
    { auth: { persistSession: false } }
  );
} else {
  console.warn('Supabase env missing: set SUPABASE_URL and SUPABASE_ANON_KEY');
}

const supabaseAdmin = (process.env.SUPABASE_SERVICE_ROLE && process.env.SUPABASE_URL)
  ? createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE, { auth: { persistSession: false } })
  : null;

class AuthService {
  constructor() {
    this.supabase = supabase;
  }

    // Ensure admin user exists and is confirmed; assign admin role
    async ensureAdminUser() {
      if (!supabaseAdmin) {
        console.warn('SUPABASE_SERVICE_ROLE not set; skipping admin bootstrap');
        return;
      }
      const adminEmail = process.env.ADMIN_EMAIL || 'admin@impactboard.com';
      const adminPassword = process.env.ADMIN_PASSWORD || 'impactboard1212';
      try {
        const { data: list } = await supabaseAdmin.auth.admin.listUsers({ page: 1, perPage: 200 });
        const existing = list?.users?.find(u => u.email === adminEmail);
        if (!existing) {
          const { data: created, error } = await supabaseAdmin.auth.admin.createUser({
            email: adminEmail,
            password: adminPassword,
            email_confirm: true,
            user_metadata: { name: 'Administrator' }
          });
          if (error) throw error;
          // Insert admin role and profile
          const userId = created.user?.id;
          if (userId) {
            await this._ensureProfileAndRole(userId, adminEmail, { name: 'Administrator' }, 'admin');
          }
          console.log('Admin user created');
        } else {
          await this._ensureProfileAndRole(existing.id, adminEmail, existing.user_metadata || {}, 'admin');
        }
      } catch (e) {
        console.error('Admin bootstrap failed:', e);
      }
    }

    async _ensureProfileAndRole(userId, email, metadata = {}, role = 'user') {
      try {
        // Ensure profile exists
        await this.supabase
          .from('profiles')
          .upsert({ user_id: userId, email, name: metadata.name || null, phone: metadata.phone || null }, { onConflict: 'user_id' });
        // Ensure role exists
        const { data: roleRow } = await this.supabase
          .from('user_roles')
          .select('role')
          .eq('user_id', userId)
          .eq('role', role)
          .maybeSingle();
        if (!roleRow) {
          await this.supabase.from('user_roles').insert([{ user_id: userId, role }]);
        }
      } catch (e) {
        console.error('Ensure profile/role failed:', e);
      }
    }

  // Sign up new user
  async signUp(email, password, metadata = {}) {
    try {
      if (!this.supabase) throw new Error('Supabase not configured');
      const { data, error } = await this.supabase.auth.signUp({
        email,
        password,
        options: {
          data: metadata
        }
      });

      if (error) throw error;
      // Create profile and default role in our DB
      if (data.user) {
        await this._ensureProfileAndRole(data.user.id, email, metadata, 'user');
      }
      return { user: data.user, session: data.session };
    } catch (error) {
      throw new Error(`Sign up failed: ${error.message}`);
    }
  }

  // Sign in user
  async signIn(email, password) {
    try {
      if (!this.supabase) throw new Error('Supabase not configured');
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
      if (!this.supabase) throw new Error('Supabase not configured');
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
      if (!this.supabase) throw new Error('Supabase not configured');
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
      if (!this.supabase) throw new Error('Supabase not configured');
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
      if (!this.supabase) throw new Error('Supabase not configured');
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
      if (!this.supabase) throw new Error('Supabase not configured');
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