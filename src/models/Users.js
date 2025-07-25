/**
 * User Model - Base user information for ALL user types
 */
export class User {
  constructor(data = {}) {
    // Core user fields (applies to ALL users)
    this.id = data.id || null;
    this.email = data.email || '';
    this.password_hash = data.password_hash || '';
    this.name = data.name || '';
    this.phone = data.phone || '';
    this.profile_picture = data.profile_picture || '';
    this.user_type = data.user_type || 'mentee'; // 'mentor', 'mentee', 'admin'
    this.status = data.status || 'active'; // 'active', 'inactive', 'suspended'
    
    // Basic profile fields (common to all users)
    this.bio = data.bio || '';
    this.location = data.location || '';
    this.timezone = data.timezone || 'Asia/Yangon';
    this.language_preference = data.language_preference || 'en';
    
    // System fields
    this.email_verified = data.email_verified || false;
    this.onboarding_completed = data.onboarding_completed || false;
    this.email_notifications = data.email_notifications !== undefined ? data.email_notifications : true;
    this.push_notifications = data.push_notifications !== undefined ? data.push_notifications : true;
    this.created_at = data.created_at || new Date().toISOString();
    this.updated_at = data.updated_at || new Date().toISOString();
    this.last_login_at = data.last_login_at || null;
  }

  toObject() {
    return {
      id: this.id,
      email: this.email,
      password_hash: this.password_hash,
      name: this.name,
      phone: this.phone,
      profile_picture: this.profile_picture,
      user_type: this.user_type,
      status: this.status,
      bio: this.bio,
      location: this.location,
      timezone: this.timezone,
      language_preference: this.language_preference,
      email_verified: this.email_verified,
      onboarding_completed: this.onboarding_completed,
      email_notifications: this.email_notifications,
      push_notifications: this.push_notifications,
      created_at: this.created_at,
      updated_at: this.updated_at,
      last_login_at: this.last_login_at
    };
  }

  static fromDatabase(row) {
    return new User(row);
  }

  isValid() {
    return this.email && this.name && this.user_type;
  }
}

export default User;
