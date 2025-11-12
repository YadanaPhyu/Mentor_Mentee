import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import MentorStack from './MentorStack'; // The tab navigator
import SessionBookingRequests from '../screens/mentor/SessionBookingRequests';

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
        options={{ title: 'Session Requests (Legacy)' }}
      />
    </Stack.Navigator>
  );
}
