# Copilot Instructions for Mentor/Mentee Portal

<!-- Use this file to provide workspace-specific custom instructions to Copilot. For more details, visit https://code.visualstudio.com/docs/copilot/copilot-customization#_use-a-githubcopilotinstructionsmd-file -->

## Project Overview
This is a React Native mobile application built with Expo for connecting mentors and mentees. The app focuses on:

- Authentication and user management
- Mentor/mentee profile creation and management
- Matching system between mentors and mentees
- In-app messaging functionality
- Modern, intuitive mobile UI/UX

## Technical Stack
- **Framework**: React Native with Expo
- **Navigation**: React Navigation
- **State Management**: React Context API / Redux (if needed)
- **Styling**: StyleSheet / Styled Components
- **Backend**: Mock data initially, can be extended to real API

## Code Style Guidelines
- Use functional components with hooks
- Follow React Native best practices
- Implement proper TypeScript types if converted to TypeScript
- Use meaningful component and variable names
- Keep components modular and reusable
- Implement proper error handling
- Use proper navigation patterns for mobile apps

## Features to Implement
1. **Authentication**: Login/Signup screens with email confirmation
2. **User Profiles**: Mentor and mentee profile creation and management
3. **Discovery**: Browse and search for mentors with filtering
4. **Matching**: Request/accept mentor relationships
5. **AI-Powered Career Mapping**: Dynamic career roadmap generation
6. **Messaging**: Real-time chat functionality
7. **Dashboard**: Overview of connections and activities
8. **Progress Tracking**: Career development milestone tracking

## AI-Powered Career Mapping System
The core feature of the app that provides:

### Career Map Components
- **CareerGoalIntake**: Dynamic assessment with free-text target role input
- **CareerMapView**: Comprehensive roadmap display with AI-generated content
- **CareerProgressTracker**: Weekly milestone tracking and mentor integration

### AI Service Capabilities
- **Dynamic career analysis** for any profession (50+ predefined + AI fallbacks)
- **Skill gap identification** with personalized learning paths
- **8-week structured timeline** with weekly goals and deliverables
- **Market insights** including salary data and growth trends
- **Capstone project generation** for practical skill application

### Data Structures
Refer to `specifications.md` for complete JSON schemas including:
- CareerMapData structure with skill gaps, timeline, and market insights
- Career assessment input with user preferences and current skills
- Progress tracking data for milestone completion

### Navigation Integration
- Integrated into MenteeStack navigation (screens renamed to avoid conflicts)
- Proper routing from HomeScreen → CareerGoalIntake → CareerMapView
- Seamless flow with mentor discovery and messaging features
