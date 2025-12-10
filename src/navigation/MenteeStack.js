import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import DiscoverScreen from '../screens/DiscoverScreen';
import MentorProfile from '../screens/mentee/MentorProfile';
import BookSession from '../screens/mentee/BookSession';
import MentorshipProgress from '../screens/mentee/MentorshipProgress';
import SessionHistory from '../screens/mentee/SessionHistory';
import UpcomingSessions from '../screens/mentee/UpcomingSessions';
import SessionDetails from '../screens/mentee/SessionDetails';
import EditProfile from '../screens/EditProfile';
// Career Map imports
import CareerGoalIntake from '../screens/CareerGoalIntake';
import SimpleCareerGoalIntake from '../screens/SimpleCareerGoalIntake';
import RoleConfirmationScreen from '../screens/RoleConfirmationScreen';
import CareerMapView from '../screens/CareerMapView';
import SimpleCareerMapView from '../screens/SimpleCareerMapView';
import ProgressTracker from '../screens/ProgressTracker';
import MentorReview from '../screens/MentorReview';
import ErrorBoundary from '../components/ErrorBoundary';

const Stack = createNativeStackNavigator();

// Wrap CareerMapView with ErrorBoundary
const CareerMapViewWithErrorBoundary = (props) => (
  <ErrorBoundary onGoBack={() => props.navigation.goBack()}>
    <CareerMapView {...props} />
  </ErrorBoundary>
);

export default function MenteeStack() {
  return (
    <Stack.Navigator
      screenOptions={{
        headerStyle: {
          backgroundColor: '#667eea',
        },
        headerTintColor: '#fff',
        headerTitleStyle: {
          fontWeight: 'bold',
        },
      }}
    >
      <Stack.Screen
        name="DiscoverMentors"
        component={DiscoverScreen}
        options={{ title: 'Discover Mentors' }}
      />
      <Stack.Screen
        name="MentorProfile"
        component={MentorProfile}
        options={{ title: 'Mentor Profile' }}
      />
      <Stack.Screen
        name="BookSession"
        component={BookSession}
        options={{ title: 'Book Session' }}
      />
      <Stack.Screen
        name="MentorshipProgress"
        component={MentorshipProgress}
        options={{ title: 'My Progress' }}
      />
      <Stack.Screen
        name="SessionHistory"
        component={SessionHistory}
        options={{ title: 'Session History' }}
      />
      <Stack.Screen
        name="UpcomingSessions"
        component={UpcomingSessions}
        options={{ title: 'Upcoming Sessions' }}
      />
      <Stack.Screen
        name="MenteeSessionDetails"
        component={SessionDetails}
        options={{ title: 'Session Details' }}
      />
      <Stack.Screen
        name="EditProfile"
        component={EditProfile}
        options={{ 
          title: 'Edit Profile',
          headerShown: false // Let the screen handle its own header
        }}
      />
      {/* Career Map Screens */}
      <Stack.Screen
        name="CareerGoalIntake"
        component={SimpleCareerGoalIntake}
        options={{ 
          title: 'Career Assessment',
          headerShown: true,
          headerBackTitleVisible: false,
        }}
      />
      <Stack.Screen
        name="RoleConfirmation"
        component={RoleConfirmationScreen}
        options={{ 
          title: 'Confirm Career Role',
          headerShown: true,
          headerBackTitleVisible: false,
        }}
      />
      <Stack.Screen
        name="CareerMapView"
        component={SimpleCareerMapView}
        options={{ 
          title: 'Your Career Map',
          headerShown: true,
          headerBackTitleVisible: false,
        }}
      />
      <Stack.Screen
        name="ProgressTracker"
        component={ProgressTracker}
        options={{ 
          title: 'Progress Tracker',
          headerShown: true,
          headerBackTitleVisible: false,
        }}
      />
      <Stack.Screen
        name="MentorReview"
        component={MentorReview}
        options={{ 
          title: 'Mentor Review',
          headerShown: true,
          headerBackTitleVisible: false,
        }}
      />
    </Stack.Navigator>
  );
}
