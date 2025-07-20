import React from 'react';
import { View, Text } from 'react-native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { useAuth } from '../context/AuthContext';
import MainTabNavigator from './MainTabNavigator';
import MentorStack from './MentorStack';
import AdminStack from './AdminStack';
import AuthScreen from '../screens/AuthScreen';

const Stack = createNativeStackNavigator();

export default function AppNavigator() {
  const { user, userType } = useAuth();

  return (
    <Stack.Navigator 
      screenOptions={{ 
        headerShown: false,
        animation: 'fade',
        gestureEnabled: false // Disable gesture navigation during auth state changes
      }}
    >
      {!user ? (
        // Auth Stack
        <Stack.Screen 
          name="Auth" 
          component={AuthScreen} 
          options={{
            animationTypeForReplace: 'pop',
            gestureEnabled: false
          }}
        />
      ) : userType === 'admin' ? (
        // Admin Stack
        <Stack.Screen 
          name="AdminStack" 
          component={AdminStack} 
          options={{
            animationTypeForReplace: 'pop',
            gestureEnabled: true
          }}
        />
      ) : userType === 'mentor' ? (
        // Mentor Stack
        <Stack.Screen 
          name="MentorStack" 
          component={MentorStack} 
          options={{
            animationTypeForReplace: 'pop',
            gestureEnabled: true
          }}
        />
      ) : (
        // Mentee Stack
        <Stack.Screen 
          name="MenteeStack" 
          component={MainTabNavigator} 
          options={{
            animationTypeForReplace: 'pop',
          }}
        />
      )}
    </Stack.Navigator>
  );
}
