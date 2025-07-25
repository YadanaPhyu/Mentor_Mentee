/**
 * Mentor Profile Model - ONLY mentor-specific additional data
 * This extends the base User model for mentors
 */
export class MentorProfile {
  constructor(data = {}) {
    this.id = data.id || null;
    this.user_id = data.user_id || null; // Foreign key to users table
    
    // Professional Info (mentor-specific)
    this.title = data.title || '';
    this.company = data.company || '';
    this.experience_years = data.experience_years || 0;
    this.education = data.education || '';
    this.certifications = data.certifications || [];
    
    // Mentoring-specific fields
    this.hourly_rate = data.hourly_rate || 0;
    this.currency = data.currency || 'MMK';
    this.is_available = data.is_available !== undefined ? data.is_available : true;
    this.specializations = data.specializations || []; // What they teach
    this.availability_schedule = data.availability_schedule || {}; // When they're available
    this.languages = data.languages || ['English']; // Languages they can mentor in
    
    // Mentor stats
    this.rating = data.rating || 0;
    this.total_sessions = data.total_sessions || 0;
    this.total_mentees = data.total_mentees || 0;
    
    // Professional links
    this.linkedin_url = data.linkedin_url || '';
    this.github_url = data.github_url || '';
    this.portfolio_url = data.portfolio_url || '';
    
    // System fields
    this.created_at = data.created_at || new Date().toISOString();
    this.updated_at = data.updated_at || new Date().toISOString();
  }

  toObject() {
    return {
      id: this.id,
      user_id: this.user_id,
      title: this.title,
      company: this.company,
      experience_years: this.experience_years,
      education: this.education,
      certifications: JSON.stringify(this.certifications),
      hourly_rate: this.hourly_rate,
      currency: this.currency,
      is_available: this.is_available,
      specializations: JSON.stringify(this.specializations),
      availability_schedule: JSON.stringify(this.availability_schedule),
      languages: JSON.stringify(this.languages),
      rating: this.rating,
      total_sessions: this.total_sessions,
      total_mentees: this.total_mentees,
      linkedin_url: this.linkedin_url,
      github_url: this.github_url,
      portfolio_url: this.portfolio_url,
      created_at: this.created_at,
      updated_at: this.updated_at
    };
  }

  static fromDatabase(row) {
    const data = { ...row };
    // Parse JSON fields
    if (data.certifications) data.certifications = JSON.parse(data.certifications);
    if (data.specializations) data.specializations = JSON.parse(data.specializations);
    if (data.availability_schedule) data.availability_schedule = JSON.parse(data.availability_schedule);
    if (data.languages) data.languages = JSON.parse(data.languages);
    
    return new MentorProfile(data);
  }

  isValid() {
    return this.user_id && this.title;
  }
}

export default MentorProfile;
