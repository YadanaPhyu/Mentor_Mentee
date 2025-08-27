import { getDatabase } from './config';

class Database {
  static instance = null;
  db = null;

  static getInstance() {
    if (!Database.instance) {
      Database.instance = new Database();
    }
    return Database.instance;
  }

  constructor() {
    this.db = getDatabase();
  }

  async query(sql, params = []) {
    return new Promise((resolve, reject) => {
      this.db.transaction(tx => {
        tx.executeSql(
          sql,
          params,
          (_, { rows: { _array } }) => resolve(_array),
          (_, error) => reject(error)
        );
      });
    });
  }

  // User operations
  async createUser({ email, password, role }) {
    const sql = 'INSERT INTO users (email, password, role) VALUES (?, ?, ?)';
    return this.query(sql, [email, password, role]);
  }

  async getUserByEmail(email) {
    const sql = 'SELECT * FROM users WHERE email = ?';
    const users = await this.query(sql, [email]);
    return users[0];
  }

  // Profile operations
  async createProfile({ userId, fullName, bio, skills, interests, experienceLevel }) {
    const sql = `
      INSERT INTO profiles (user_id, full_name, bio, skills, interests, experience_level)
      VALUES (?, ?, ?, ?, ?, ?)
    `;
    return this.query(sql, [userId, fullName, bio, skills, interests, experienceLevel]);
  }

  async getProfileByUserId(userId) {
    const sql = 'SELECT * FROM profiles WHERE user_id = ?';
    const profiles = await this.query(sql, [userId]);
    return profiles[0];
  }

  // Mentorship operations
  async createMentorship(mentorId, menteeId) {
    const sql = 'INSERT INTO mentorships (mentor_id, mentee_id, status) VALUES (?, ?, "pending")';
    return this.query(sql, [mentorId, menteeId]);
  }

  async updateMentorshipStatus(mentorshipId, status) {
    const sql = 'UPDATE mentorships SET status = ? WHERE id = ?';
    return this.query(sql, [status, mentorshipId]);
  }

  // Message operations
  async sendMessage(senderId, receiverId, content) {
    const sql = 'INSERT INTO messages (sender_id, receiver_id, content) VALUES (?, ?, ?)';
    return this.query(sql, [senderId, receiverId, content]);
  }

  async getMessages(userId1, userId2) {
    const sql = `
      SELECT * FROM messages 
      WHERE (sender_id = ? AND receiver_id = ?) 
      OR (sender_id = ? AND receiver_id = ?)
      ORDER BY created_at DESC
    `;
    return this.query(sql, [userId1, userId2, userId2, userId1]);
  }
}

export default Database;
