/**
 * Mentee Profile Model - ONLY mentee-specific additional data
 * This extends the base User model for mentees
 */
export class MenteeProfile {
  constructor(data = {}) {
    this.id = data.id || null;
    this.user_id = data.user_id || null; // Foreign key to users table
    
    // Learning goals and interests
    this.learning_goals = data.learning_goals || [];
    this.interests = data.interests || [];
    this.skill_level = data.skill_level || 'beginner'; // 'beginner', 'intermediate', 'advanced'
    this.preferred_learning_style = data.preferred_learning_style || 'visual'; // 'visual', 'auditory', 'kinesthetic'
    
    // Mentee preferences
    this.preferred_mentor_gender = data.preferred_mentor_gender || 'no_preference'; // 'male', 'female', 'no_preference'
    this.preferred_session_duration = data.preferred_session_duration || 60; // minutes
    this.budget_range_min = data.budget_range_min || 0;
    this.budget_range_max = data.budget_range_max || 0;
    this.currency = data.currency || 'MMK';
    
    // Availability
    this.availability_schedule = data.availability_schedule || {};
    this.is_seeking_mentor = data.is_seeking_mentor !== undefined ? data.is_seeking_mentor : true;
    
    // Mentee stats
    this.total_sessions = data.total_sessions || 0;
    this.current_mentors = data.current_mentors || 0;
    this.completed_goals = data.completed_goals || 0;
    
    // Educational background
    this.current_education_level = data.current_education_level || '';
    this.institution = data.institution || '';
    this.field_of_study = data.field_of_study || '';
    
    // System fields
    this.created_at = data.created_at || new Date().toISOString();
    this.updated_at = data.updated_at || new Date().toISOString();
  }

  toObject() {
    return {
      id: this.id,
      user_id: this.user_id,
      learning_goals: JSON.stringify(this.learning_goals),
      interests: JSON.stringify(this.interests),
      skill_level: this.skill_level,
      preferred_learning_style: this.preferred_learning_style,
      preferred_mentor_gender: this.preferred_mentor_gender,
      preferred_session_duration: this.preferred_session_duration,
      budget_range_min: this.budget_range_min,
      budget_range_max: this.budget_range_max,
      currency: this.currency,
      availability_schedule: JSON.stringify(this.availability_schedule),
      is_seeking_mentor: this.is_seeking_mentor,
      total_sessions: this.total_sessions,
      current_mentors: this.current_mentors,
      completed_goals: this.completed_goals,
      current_education_level: this.current_education_level,
      institution: this.institution,
      field_of_study: this.field_of_study,
      created_at: this.created_at,
      updated_at: this.updated_at
    };
  }

  static fromDatabase(row) {
    const data = { ...row };
    // Parse JSON fields
    if (data.learning_goals) data.learning_goals = JSON.parse(data.learning_goals);
    if (data.interests) data.interests = JSON.parse(data.interests);
    if (data.availability_schedule) data.availability_schedule = JSON.parse(data.availability_schedule);
    
    return new MenteeProfile(data);
  }

  isValid() {
    return this.user_id;
  }
}

export default MenteeProfile;
