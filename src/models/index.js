// Export all models from this central file
export { BaseModel } from './BaseModel';
export { User, UserModel } from './User';

// You can add more models here as you create them:
// export { Mentor, MentorModel } from './Mentor';
// export { Mentee, MenteeModel } from './Mentee';
// export { Session, SessionModel } from './Session';
// export { Message, MessageModel } from './Message';

// Database initialization
export { initializeDatabase } from '../database/migrationRunner';

// Usage example:
/*
import { UserModel, initializeDatabase } from '../models';

// Initialize database first
await initializeDatabase();

// Then use models
const users = await UserModel.findAll();
const user = await UserModel.findById(1);
const newUser = await UserModel.create({
  email: 'test@example.com',
  name: 'Test User',
  user_type: 'mentee'
});
*/
