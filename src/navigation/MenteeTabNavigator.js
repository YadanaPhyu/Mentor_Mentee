import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useLanguage } from '../context/LanguageContext';
import { useAuth } from '../context/AuthContext';
import HomeScreen from '../screens/HomeScreen';
import MessagesScreen from '../screens/MessagesScreen';
import ProfileStack from './ProfileStack';
import MenteeStack from './MenteeStack';

const Tab = createBottomTabNavigator();

export default function MenteeTabNavigator() {
  const { t } = useLanguage();
  const { logout } = useAuth();

  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        tabBarIcon: ({ focused, color, size }) => {
          let iconName;

          if (route.name === 'Home') {
            iconName = focused ? 'home' : 'home-outline';
          } else if (route.name === 'Discover') {
            iconName = focused ? 'search' : 'search-outline';
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
        name="Home" 
        component={HomeScreen}
        options={{ 
          title: t('home'),
          tabBarLabel: t('home')
        }}
      />
      <Tab.Screen 
        name="Discover" 
        component={MenteeStack}
        options={{ 
          headerShown: false,
          title: t('discover'),
          tabBarLabel: t('discover')
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
