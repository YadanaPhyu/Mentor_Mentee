# Mentor/Mentee Portal Specifications

## Project Overview
This document defines the technical specifications for the Mentor/Mentee Portal, a React Native mobile application built with Expo.

## Core Features

### 1. Authentication System
- **Login/Signup** screens with email validation
- **Session management** with secure token storage
- **Password reset** functionality
- **Email confirmation** workflow

### 2. User Profiles
- **Mentor profiles** with expertise areas and availability
- **Mentee profiles** with learning goals and career interests
- **Profile management** with photo upload and bio editing
- **Skills and interests** tagging system

### 3. Matching System
- **Discovery interface** for browsing mentors
- **Filtering and search** by skills, location, availability
- **Connection requests** with personalized messages
- **Mentor-mentee relationship** management

### 4. AI-Powered Career Mapping System

#### 4.1 Career Map Data Structures

##### CareerMapData JSON Shape:
```json
{
  "id": "string",
  "targetRole": "string",
  "currentSkills": ["string"],
  "careerFit": {
    "percentage": "number (0-100)",
    "strengths": ["string"],
    "gaps": ["string"]
  },
  "skillGaps": [
    {
      "skill": "string",
      "importance": "string (High|Medium|Low)",
      "currentLevel": "number (0-5)",
      "targetLevel": "number (0-5)",
      "resources": ["string"]
    }
  ],
  "timeline": {
    "totalWeeks": "number",
    "phases": [
      {
        "week": "number",
        "title": "string",
        "goals": ["string"],
        "deliverables": ["string"],
        "resources": ["string"],
        "mentorReview": "boolean"
      }
    ]
  },
  "capstoneProject": {
    "title": "string",
    "description": "string",
    "requirements": ["string"],
    "deliverables": ["string"]
  },
  "progressTracking": {
    "currentWeek": "number",
    "completedPhases": ["number"],
    "skillProgress": {
      "skillName": "number (0-5)"
    }
  },
  "marketInsights": {
    "averageSalary": "string",
    "jobGrowth": "string",
    "keyCompanies": ["string"],
    "emergingTrends": ["string"]
  }
}
```

##### Career Assessment Input JSON Shape:
```json
{
  "targetRole": "string",
  "currentExperience": "string (Beginner|Intermediate|Advanced)",
  "availableHours": "number",
  "preferredLearningStyle": "string (Visual|Hands-on|Reading|Mixed)",
  "currentSkills": ["string"],
  "interests": ["string"],
  "timeframe": "string (4weeks|8weeks|12weeks|6months|1year)"
}
```

#### 4.2 AI Service Specifications

##### aiCareerMapService.js Methods:
```javascript
// Generate comprehensive career roadmap
generateCareerMap(assessmentData: CareerAssessmentInput): Promise<CareerMapData>

// Analyze fit between current skills and target role
analyzeCareerFit(currentSkills: string[], targetRole: string): CareerFitAnalysis

// Get skill gap analysis with learning priorities
getSkillGapAnalysis(currentSkills: string[], targetRole: string): SkillGap[]

// Generate timeline with weekly goals and milestones
generateTimeline(skillGaps: SkillGap[], timeframe: string, hoursPerWeek: number): Timeline

// Get market insights for specific career
getMarketInsights(targetRole: string): MarketInsights

// Suggest similar career paths
getSimilarCareers(targetRole: string): string[]
```

#### 4.3 Screen Specifications

##### CareerGoalIntake.js
- **Purpose**: Collect user career goals and preferences
- **Input Components**:
  - Dynamic text input for target role with AI suggestions
  - Experience level selector (Beginner/Intermediate/Advanced)
  - Available hours per week slider
  - Learning style preference selector
  - Current skills multi-select with search
  - Timeframe selector
- **Navigation**: Proceeds to CareerMapView with assessment data

##### CareerMapView.js
- **Purpose**: Display AI-generated career roadmap
- **Display Sections**:
  - Career overview with fit percentage
  - Skill gap analysis with progress bars
  - 8-week timeline with expandable phases
  - Capstone project details
  - Market insights and salary information
  - Similar career suggestions
- **Actions**: Save roadmap, share with mentor, start tracking

##### CareerProgressTracker.js
- **Purpose**: Track progress through career roadmap
- **Features**:
  - Weekly checklist with completion tracking
  - Skill level self-assessment
  - Milestone celebration
  - Mentor feedback integration
  - Progress analytics and insights

### 5. Messaging System
- **Real-time chat** between mentors and mentees
- **File sharing** capability for resources
- **Message history** with search functionality
- **Notification system** for new messages

## Navigation Structure

### MainTabNavigator
- **Home**: Dashboard with overview
- **Discover**: Browse and search mentors (renamed to DiscoverMentors in MenteeStack)
- **Messages**: Chat conversations
- **Profile**: User profile management

### MenteeStack (Nested Navigation)
- **Home**: Mentee dashboard
- **DiscoverMentors**: Mentor discovery (避免命名冲突)
- **CareerGoalIntake**: Career assessment form
- **CareerMapView**: Display career roadmap
- **CareerProgressTracker**: Track learning progress
- **Messages**: Chat interface
- **Profile**: Profile management

## API Endpoints (Mock Data)

### Career Mapping API
```
POST /api/career-map/generate
Body: CareerAssessmentInput
Response: CareerMapData

GET /api/career-map/{id}
Response: CareerMapData

PUT /api/career-map/{id}/progress
Body: ProgressUpdate
Response: CareerMapData

GET /api/careers/suggestions?query={searchTerm}
Response: string[]

GET /api/careers/{roleName}/insights
Response: MarketInsights
```

### User Management API
```
POST /api/auth/login
POST /api/auth/register
POST /api/auth/forgot-password
GET /api/users/profile
PUT /api/users/profile
POST /api/users/upload-avatar
```

### Matching API
```
GET /api/mentors/search?skills={skills}&location={location}
POST /api/connections/request
PUT /api/connections/{id}/accept
PUT /api/connections/{id}/decline
GET /api/connections/my-mentees
GET /api/connections/my-mentors
```

## Technical Architecture

### State Management
- **React Context API** for authentication state
- **Local state** with useState for component-specific data
- **AsyncStorage** for persisting user preferences and offline data

### Styling Approach
- **StyleSheet** for component-specific styles
- **Consistent design system** with shared colors and typography
- **Responsive design** for different screen sizes
- **Dark mode support** (future enhancement)

### Data Flow
1. User completes CareerGoalIntake assessment
2. AI service processes input and generates roadmap
3. CareerMapView displays comprehensive career plan
4. Progress tracker maintains learning state
5. Mentor integration for feedback and guidance

### Error Handling
- **Network error** handling with offline mode
- **Input validation** with user-friendly error messages
- **Fallback UI** for missing or corrupted data
- **Error logging** for debugging and improvement

## Future Enhancements
- **Video calling** integration for mentor sessions
- **Calendar integration** for scheduling meetings
- **Achievement system** with badges and rewards
- **Community features** with group discussions
- **Advanced AI** with machine learning improvements
- **Analytics dashboard** for tracking platform usage

## Development Guidelines
- Use functional components with hooks
- Implement proper TypeScript types for new features
- Follow React Native best practices
- Maintain modular and reusable component structure
- Include comprehensive error handling
- Write unit tests for critical functionality
- Document complex algorithms and business logic
