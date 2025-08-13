import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import CareerGoalIntake from '../screens/CareerGoalIntake';
import CareerMapView from '../screens/CareerMapView';
import ProgressTracker from '../screens/ProgressTracker';
import MentorReview from '../screens/MentorReview';

const Stack = createNativeStackNavigator();

export default function CareerMapStack() {
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
        name="CareerGoalIntake"
        component={CareerGoalIntake}
        options={{
          title: 'Career Goals',
          headerBackTitle: 'Back',
        }}
      />
      <Stack.Screen
        name="CareerMapView"
        component={CareerMapView}
        options={{
          title: 'Your Career Map',
          headerBackTitle: 'Goals',
        }}
      />
      <Stack.Screen
        name="ProgressTracker"
        component={ProgressTracker}
        options={{
          title: 'Progress Tracker',
          headerBackTitle: 'Map',
        }}
      />
      <Stack.Screen
        name="MentorReview"
        component={MentorReview}
        options={{
          title: 'Mentor Review',
          headerBackTitle: 'Progress',
        }}
      />
    </Stack.Navigator>
  );
}
