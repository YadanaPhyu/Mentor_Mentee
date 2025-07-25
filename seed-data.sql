-- Database seeding SQL
-- Generated on 2025-07-25T15:20:55.721Z

-- Clear existing data
DELETE FROM users;

-- Insert test users
INSERT INTO users (id, email, password_hash, name, user_type, phone, bio, location, status, created_at, updated_at) VALUES (
  1,
  'admin@example.com',
  'YWRtaW4xMjNzYWx0MTIz',
  'Admin User',
  'admin',
  '+1234567890',
  'System administrator',
  'New York, NY',
  'active',
  '2025-07-25T15:20:55.720Z',
  '2025-07-25T15:20:55.720Z'
);

INSERT INTO users (id, email, password_hash, name, user_type, phone, bio, location, status, created_at, updated_at) VALUES (
  2,
  'mentor@example.com',
  'bWVudG9yMTIzc2FsdDEyMw==',
  'Jane Mentor',
  'mentor',
  '+1234567891',
  'Senior Software Engineer with 10+ years experience in full-stack development',
  'San Francisco, CA',
  'active',
  '2025-07-25T15:20:55.721Z',
  '2025-07-25T15:20:55.721Z'
);

INSERT INTO users (id, email, password_hash, name, user_type, phone, bio, location, status, created_at, updated_at) VALUES (
  3,
  'mentee@example.com',
  'bWVudGVlMTIzc2FsdDEyMw==',
  'John Mentee',
  'mentee',
  '+1234567892',
  'Computer Science student looking to learn web development',
  'Austin, TX',
  'active',
  '2025-07-25T15:20:55.721Z',
  '2025-07-25T15:20:55.721Z'
);

INSERT INTO users (id, email, password_hash, name, user_type, phone, bio, location, status, created_at, updated_at) VALUES (
  4,
  'sarah.dev@example.com',
  'cGFzc3dvcmQxMjNzYWx0MTIz',
  'Sarah Developer',
  'mentor',
  '+1234567893',
  'Frontend specialist with expertise in React and UI/UX design',
  'Seattle, WA',
  'active',
  '2025-07-25T15:20:55.721Z',
  '2025-07-25T15:20:55.721Z'
);

INSERT INTO users (id, email, password_hash, name, user_type, phone, bio, location, status, created_at, updated_at) VALUES (
  5,
  'mike.student@example.com',
  'cGFzc3dvcmQxMjNzYWx0MTIz',
  'Mike Student',
  'mentee',
  '+1234567894',
  'Bootcamp graduate seeking guidance in backend development',
  'Chicago, IL',
  'active',
  '2025-07-25T15:20:55.721Z',
  '2025-07-25T15:20:55.721Z'
);

