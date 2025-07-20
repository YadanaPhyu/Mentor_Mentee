import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import FindMentorsScreen from '../screens/FindMentorsScreen';
import MentorProfile from '../screens/mentee/MentorProfile';
import BookSession from '../screens/mentee/BookSession';
import MentorshipProgress from '../screens/mentee/MentorshipProgress';
import SessionHistory from '../screens/mentee/SessionHistory';

const Stack = createNativeStackNavigator();

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
        name="FindMentors"
        component={FindMentorsScreen}
        options={{ title: 'Find Mentors' }}
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
    </Stack.Navigator>
  );
}
