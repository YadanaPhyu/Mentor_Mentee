/**
 * Session Model - Simple property definitions
 */
export class Session {
  constructor(data = {}) {
    this.id = data.id || null;
    this.mentor_id = data.mentor_id || null;
    this.mentee_id = data.mentee_id || null;
    this.title = data.title || '';
    this.description = data.description || '';
    this.scheduled_at = data.scheduled_at || null;
    this.duration_minutes = data.duration_minutes || 60;
    this.status = data.status || 'scheduled'; // 'scheduled', 'in_progress', 'completed', 'cancelled'
    this.meeting_link = data.meeting_link || '';
    this.meeting_platform = data.meeting_platform || 'zoom'; // 'zoom', 'meet', 'teams'
    this.agenda = data.agenda || '';
    this.notes = data.notes || '';
    this.mentor_notes = data.mentor_notes || '';
    this.mentee_notes = data.mentee_notes || '';
    this.rating = data.rating || null;
    this.feedback = data.feedback || '';
    this.price = data.price || 0;
    this.currency = data.currency || 'MMK';
    this.payment_status = data.payment_status || 'pending'; // 'pending', 'paid', 'refunded'
    this.cancellation_reason = data.cancellation_reason || '';
    this.created_at = data.created_at || new Date().toISOString();
    this.updated_at = data.updated_at || new Date().toISOString();
    this.started_at = data.started_at || null;
    this.ended_at = data.ended_at || null;
  }

  // Convert to plain object
  toObject() {
    return {
      id: this.id,
      mentor_id: this.mentor_id,
      mentee_id: this.mentee_id,
      title: this.title,
      description: this.description,
      scheduled_at: this.scheduled_at,
      duration_minutes: this.duration_minutes,
      status: this.status,
      meeting_link: this.meeting_link,
      meeting_platform: this.meeting_platform,
      agenda: this.agenda,
      notes: this.notes,
      mentor_notes: this.mentor_notes,
      mentee_notes: this.mentee_notes,
      rating: this.rating,
      feedback: this.feedback,
      price: this.price,
      currency: this.currency,
      payment_status: this.payment_status,
      cancellation_reason: this.cancellation_reason,
      created_at: this.created_at,
      updated_at: this.updated_at,
      started_at: this.started_at,
      ended_at: this.ended_at
    };
  }

  // Create from database row
  static fromDatabase(row) {
    return new Session(row);
  }

  // Validate required fields
  isValid() {
    return this.mentor_id && this.mentee_id && this.scheduled_at;
  }

  // Check if session is upcoming
  isUpcoming() {
    return new Date(this.scheduled_at) > new Date() && this.status === 'scheduled';
  }

  // Check if session is today
  isToday() {
    const today = new Date().toDateString();
    const sessionDate = new Date(this.scheduled_at).toDateString();
    return today === sessionDate;
  }
}

export default Session;
