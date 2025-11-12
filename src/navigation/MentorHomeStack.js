import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import MentorHomeScreen from '../screens/mentor/MentorHomeScreen';
import SessionRequests from '../screens/mentor/SessionRequests';
import SessionDetails from '../screens/mentor/SessionDetails';
import NewSessionDetails from '../screens/mentor/NewSessionDetails';
import ManageAvailability from '../screens/mentor/ManageAvailability';
import MentorshipRequests from '../screens/mentor/MentorshipRequests';

const Stack = createNativeStackNavigator();

export default function MentorHomeStack() {
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
        name="MentorHome"
        component={MentorHomeScreen}
        options={{ 
          title: 'Mentor Dashboard',
          headerShown: false // Hide header since tab navigator shows it
        }}
      />
      <Stack.Screen
        name="SessionRequests"
        component={SessionRequests}
        options={{ title: 'Session Requests' }}
      />
      <Stack.Screen
        name="SessionDetails"
        component={SessionDetails}
        options={{ title: 'Session Details' }}
      />
      <Stack.Screen
        name="NewSessionDetails"
        component={NewSessionDetails}
        options={{ title: 'Session Details' }}
      />
      <Stack.Screen
        name="MentorshipRequests"
        component={MentorshipRequests}
        options={{ title: 'Mentorship Requests' }}
      />
      <Stack.Screen
        name="ManageAvailability"
        component={ManageAvailability}
        options={{ title: 'Manage Availability' }}
      />
    </Stack.Navigator>
  );
}
