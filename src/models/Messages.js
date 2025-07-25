/**
 * Message Model - Simple property definitions
 */
export class Message {
  constructor(data = {}) {
    this.id = data.id || null;
    this.conversation_id = data.conversation_id || null;
    this.sender_id = data.sender_id || null;
    this.receiver_id = data.receiver_id || null;
    this.content = data.content || '';
    this.message_type = data.message_type || 'text'; // 'text', 'image', 'file', 'voice'
    this.file_url = data.file_url || '';
    this.file_name = data.file_name || '';
    this.file_size = data.file_size || 0;
    this.is_read = data.is_read !== undefined ? data.is_read : false;
    this.read_at = data.read_at || null;
    this.is_edited = data.is_edited !== undefined ? data.is_edited : false;
    this.edited_at = data.edited_at || null;
    this.reply_to_message_id = data.reply_to_message_id || null;
    this.created_at = data.created_at || new Date().toISOString();
    this.updated_at = data.updated_at || new Date().toISOString();
  }

  // Convert to plain object
  toObject() {
    return {
      id: this.id,
      conversation_id: this.conversation_id,
      sender_id: this.sender_id,
      receiver_id: this.receiver_id,
      content: this.content,
      message_type: this.message_type,
      file_url: this.file_url,
      file_name: this.file_name,
      file_size: this.file_size,
      is_read: this.is_read,
      read_at: this.read_at,
      is_edited: this.is_edited,
      edited_at: this.edited_at,
      reply_to_message_id: this.reply_to_message_id,
      created_at: this.created_at,
      updated_at: this.updated_at
    };
  }

  // Create from database row
  static fromDatabase(row) {
    return new Message(row);
  }

  // Validate required fields
  isValid() {
    return this.conversation_id && this.sender_id && this.content;
  }
}

/**
 * Conversation Model - Simple property definitions
 */
export class Conversation {
  constructor(data = {}) {
    this.id = data.id || null;
    this.participant_1_id = data.participant_1_id || null;
    this.participant_2_id = data.participant_2_id || null;
    this.last_message_id = data.last_message_id || null;
    this.last_message_at = data.last_message_at || null;
    this.unread_count_p1 = data.unread_count_p1 || 0;
    this.unread_count_p2 = data.unread_count_p2 || 0;
    this.is_archived_p1 = data.is_archived_p1 !== undefined ? data.is_archived_p1 : false;
    this.is_archived_p2 = data.is_archived_p2 !== undefined ? data.is_archived_p2 : false;
    this.created_at = data.created_at || new Date().toISOString();
    this.updated_at = data.updated_at || new Date().toISOString();
  }

  // Convert to plain object
  toObject() {
    return {
      id: this.id,
      participant_1_id: this.participant_1_id,
      participant_2_id: this.participant_2_id,
      last_message_id: this.last_message_id,
      last_message_at: this.last_message_at,
      unread_count_p1: this.unread_count_p1,
      unread_count_p2: this.unread_count_p2,
      is_archived_p1: this.is_archived_p1,
      is_archived_p2: this.is_archived_p2,
      created_at: this.created_at,
      updated_at: this.updated_at
    };
  }

  // Create from database row
  static fromDatabase(row) {
    return new Conversation(row);
  }

  // Validate required fields
  isValid() {
    return this.participant_1_id && this.participant_2_id;
  }
}

export { Message, Conversation };
export default Message;
