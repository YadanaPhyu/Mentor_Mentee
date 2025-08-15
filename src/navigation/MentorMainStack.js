import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import MentorStack from './MentorStack'; // The tab navigator
import SessionBookingRequests from '../screens/mentor/SessionBookingRequests';
import SessionDetails from '../screens/mentor/SessionDetails';
import MentorshipRequests from '../screens/mentor/MentorshipRequests';
import ManageAvailability from '../screens/mentor/ManageAvailability';

const Stack = createNativeStackNavigator();

export default function MentorMainStack() {
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
        name="MentorTabs"
        component={MentorStack}
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name="SessionBookingRequests"
        component={SessionBookingRequests}
        options={{ title: 'Session Requests' }}
      />
      <Stack.Screen
        name="SessionDetails"
        component={SessionDetails}
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
