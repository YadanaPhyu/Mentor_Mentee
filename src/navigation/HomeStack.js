import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import HomeScreen from '../screens/HomeScreen';
// Career Map imports
import CareerGoalIntake from '../screens/CareerGoalIntake';
import CareerMapView from '../screens/CareerMapView';
import ProgressTracker from '../screens/ProgressTracker';
import MentorReview from '../screens/MentorReview';

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
        options={{ title: 'Home' }}
      />
      {/* Career Map Screens */}
      <Stack.Screen
        name="CareerGoalIntake"
        component={CareerGoalIntake}
        options={{ title: 'Career Assessment' }}
      />
      <Stack.Screen
        name="CareerMapView"
        component={CareerMapView}
        options={{ title: 'Your Career Map' }}
      />
      <Stack.Screen
        name="ProgressTracker"
        component={ProgressTracker}
        options={{ title: 'Progress Tracker' }}
      />
      <Stack.Screen
        name="MentorReview"
        component={MentorReview}
        options={{ title: 'Mentor Review' }}
      />
    </Stack.Navigator>
  );
}
