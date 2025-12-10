import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons';
import MentorHomeStack from './MentorHomeStack';
import ProfileStack from './ProfileStack';
import { useLanguage } from '../context/LanguageContext';
import { useAuth } from '../context/AuthContext';

const Tab = createBottomTabNavigator();

export default function MentorStack() {
  const { t } = useLanguage();
  const { logout } = useAuth();

  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        tabBarIcon: ({ focused, color, size }) => {
          let iconName;

          if (route.name === 'Dashboard') {
            iconName = focused ? 'home' : 'home-outline';
          } else if (route.name === 'Profile') {
            iconName = focused ? 'person' : 'person-outline';
          }

          return <Ionicons name={iconName} size={size} color={color} />;
        },
        tabBarActiveTintColor: '#667eea',
        tabBarInactiveTintColor: 'gray',
        headerStyle: {
          backgroundColor: '#667eea',
        },
        headerTintColor: '#fff',
        headerTitleStyle: {
          fontWeight: 'bold',
        },
        headerRight: () => (
          route.name === 'Profile' ? (
            <TouchableOpacity
              onPress={async () => {
                await logout();
              }}
              style={{ marginRight: 16 }}
            >
              <Ionicons 
                name="log-out-outline" 
                size={24} 
                color="#fff"
              />
            </TouchableOpacity>
          ) : null
        ),
      })}
    >
      <Tab.Screen
        name="Dashboard"
        component={MentorHomeStack}
        options={{ 
          title: t('mentorDashboard'),
          tabBarLabel: t('dashboard'),
          headerShown: false // Let the stack handle headers
        }}
      />
      <Tab.Screen
        name="Profile"
        component={ProfileStack}
        options={{ 
          title: t('profile'),
          tabBarLabel: t('profile'),
          headerShown: false
        }}
      />
    </Tab.Navigator>
  );
}
