import React from 'react';
import { View, Text } from 'react-native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { useAuth } from '../context/AuthContext';
import MenteeTabNavigator from './MenteeTabNavigator';
import MentorMainStack from './MentorMainStack';
import AdminStack from './AdminStack';
import AuthScreen from '../screens/AuthScreen';
import DatabaseTestScreen from '../screens/DatabaseTestScreen';

const Stack = createNativeStackNavigator();

export default function AppNavigator() {
  const { user, userType } = useAuth();

  return (
    <Stack.Navigator 
      screenOptions={{ 
        headerShown: true,
        animation: 'fade',
        gestureEnabled: false // Disable gesture navigation during auth state changes
      }}
      initialRouteName="Auth"
    >
      {!user ? (
        // Auth Stack
        <Stack.Screen 
          name="Auth" 
          component={AuthScreen} 
          options={{
            title: 'Login / Sign Up',
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
          component={MentorMainStack} 
          options={{
            animationTypeForReplace: 'pop',
            gestureEnabled: true
          }}
        />
      ) : userType === 'mentee' ? (
        // Mentee Stack
        <Stack.Screen 
          name="MenteeStack" 
          component={MenteeTabNavigator} 
          options={{
            animationTypeForReplace: 'pop',
            gestureEnabled: true
          }}
        />
      ) : (
        // Fallback for unknown user type
        <Stack.Screen 
          name="Error" 
          component={() => (
            <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
              <Text>Invalid user type. Please log out and try again.</Text>
            </View>
          )}
        />
      )}
    </Stack.Navigator>
  );
}
