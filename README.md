# MentorMyanmar

A React Native mobile application built with Expo for connecting mentors and mentees across Myanmar.

## Features

- **Bilingual Support**: Full support for English and Burmese (မြန်မာဘာသာ) languages
- **Authentication System**: Secure login and registration for mentors and mentees
- **User Profiles**: Comprehensive profiles with skills, experience, and availability
- **Discovery**: Browse and search for mentors or mentees based on skills and location
- **Messaging**: Real-time communication between mentors and mentees
- **Dashboard**: Overview of connections, sessions, and activities
- **Modern UI**: Beautiful, intuitive interface with gradient backgrounds and smooth animations
- **Language Toggle**: Easy switching between English and Burmese throughout the app

## Screenshots

The app includes:
- Welcome screen with mentor/mentee selection
- Home dashboard with stats and recent activities
- Discovery screen to find and connect with mentors/mentees
- Messages screen for communication
- Profile screen with settings and account management

## Technical Stack

- **Framework**: React Native with Expo
- **Navigation**: React Navigation v6
- **UI Components**: Native React Native components
- **Icons**: Expo Vector Icons
- **Styling**: StyleSheet with LinearGradient
- **State Management**: React Context API (Auth + Language)
- **Internationalization**: Built-in translation system for English/Burmese

## Getting Started

### Prerequisites

- Node.js (v14 or higher)
- npm or yarn
- Expo CLI (`npm install -g expo-cli`)

### Installation

1. Clone the repository:
   ```bash
   git clone <repository-url>
   cd MentorMyanmar
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Start the development server:
   ```bash
   npx expo start
   ```

4. Run on your device:
   - Install Expo Go app on your mobile device
   - Scan the QR code from the terminal
   - Or use an emulator (iOS Simulator or Android Studio)

### Available Scripts

- `npm start` - Start the Expo development server
- `npm run android` - Run on Android emulator
- `npm run ios` - Run on iOS simulator
- `npm run web` - Run on web browser

## Project Structure

```
MentorMyanmar/
├── src/
│   ├── components/
│   │   └── ProfileCard.js
│   ├── context/
│   │   └── AuthContext.js
│   ├── data/
│   │   └── mockData.js
│   ├── navigation/
│   │   └── MainTabNavigator.js
│   └── screens/
│       ├── AuthScreen.js
│       ├── DiscoverScreen.js
│       ├── HomeScreen.js
│       ├── MessagesScreen.js
│       └── ProfileScreen.js
├── assets/
├── App.js
├── app.json
└── package.json
```

## Key Features Explained

### Authentication
- Login/signup with email and password
- User type selection (mentor/mentee)
- Mock authentication for demo purposes

### Home Dashboard
- Personalized greeting
- Statistics overview (connections, messages, sessions)
- Recent activity feed
- Quick action buttons

### Discovery
- Browse mentors/mentees based on user type
- Search functionality by name or skills
- Filter by location and expertise
- Profile cards with key information

### Messaging
- Conversation list with unread indicators
- Online status indicators
- Search conversations
- Modern chat interface

### Profile Management
- User information display
- Settings and preferences
- Toggle availability for mentoring
- Logout functionality

## Customization

The app uses a Myanmar-focused theme with:
- Purple gradient color scheme (#667eea to #764ba2)
- Modern card-based design
- Responsive layout for different screen sizes
- Smooth animations and transitions

## Future Enhancements

- Real-time messaging with WebSocket
- Video call integration
- Payment system for mentoring sessions
- Advanced matching algorithm
- Push notifications
- Backend API integration
- User verification system
- Review and rating system

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## License

This project is licensed under the MIT License.

## Contact

For questions or support, please contact the development team.
