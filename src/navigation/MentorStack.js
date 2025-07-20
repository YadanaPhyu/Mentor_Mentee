import React from 'react';
import { View, Text } from 'react-native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons';
import MentorHomeScreen from '../screens/mentor/MentorHomeScreen';
import MessagesScreen from '../screens/MessagesScreen';
import ProfileScreen from '../screens/ProfileScreen';
import { useLanguage } from '../context/LanguageContext';

const Tab = createBottomTabNavigator();

export default function MentorStack() {
  const { t } = useLanguage();

  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        tabBarIcon: ({ focused, color, size }) => {
          let iconName;

          if (route.name === 'Dashboard') {
            iconName = focused ? 'home' : 'home-outline';
          } else if (route.name === 'Messages') {
            iconName = focused ? 'chatbubbles' : 'chatbubbles-outline';
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
      })}
    >
      <Tab.Screen
        name="Dashboard"
        component={MentorHomeScreen}
        options={{ 
          title: t('mentorDashboard'),
          tabBarLabel: t('dashboard')
        }}
      />
      <Tab.Screen
        name="Messages"
        component={MessagesScreen}
        options={{ 
          title: t('messages'),
          tabBarLabel: t('messages')
        }}
      />
      <Tab.Screen
        name="Profile"
        component={ProfileScreen}
        options={{ 
          title: t('profile'),
          tabBarLabel: t('profile')
        }}
      />
    </Tab.Navigator>
  );
}
