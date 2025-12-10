import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import HomeScreen from '../screens/HomeScreen';
// Career Map imports
import SimpleCareerGoalIntake from '../screens/SimpleCareerGoalIntake';
import RoleConfirmationScreen from '../screens/RoleConfirmationScreen';
import SimpleCareerMapView from '../screens/SimpleCareerMapView';
import ProgressTracker from '../screens/ProgressTracker';
import MentorReview from '../screens/MentorReview';
// Session imports
import UpcomingSessions from '../screens/mentee/UpcomingSessions';
import SessionDetails from '../screens/mentee/SessionDetails';

const Stack = createNativeStackNavigator();

export default function HomeStack() {
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
        name="HomeMain"
        component={HomeScreen}
        options={{ 
          headerShown: false, // Tab navigator will show the header
        }}
      />
      {/* Career Assessment Screens */}
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
      {/* Session Screens */}
      <Stack.Screen
        name="UpcomingSessions"
        component={UpcomingSessions}
        options={{ 
          title: 'Upcoming Sessions',
          headerShown: true,
          headerBackTitleVisible: false,
        }}
      />
      <Stack.Screen
        name="MenteeSessionDetails"
        component={SessionDetails}
        options={{ 
          title: 'Session Details',
          headerShown: true,
          headerBackTitleVisible: false,
        }}
      />
    </Stack.Navigator>
  );
}
