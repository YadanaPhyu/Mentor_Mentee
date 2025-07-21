import React from 'react';
import { TouchableOpacity } from 'react-native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../context/AuthContext';
import AdminDashboard from '../screens/admin/AdminDashboard';
import ManageUsers from '../screens/admin/ManageUsers';

const Stack = createNativeStackNavigator();

export default function AdminStack() {
  const { logout } = useAuth();

  return (
    <Stack.Navigator
      initialRouteName="AdminDashboard"
      screenOptions={{
        headerStyle: {
          backgroundColor: '#667eea',
        },
        headerTintColor: '#fff',
        headerTitleStyle: {
          fontWeight: 'bold',
        },
        headerRight: () => (
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
        ),
      }}
    >
      <Stack.Screen
        name="AdminDashboard"
        component={AdminDashboard}
        options={{
          title: 'Admin Dashboard',
        }}
      />
      <Stack.Screen
        name="ManageUsers"
        component={ManageUsers}
        options={{
          title: 'Manage Users',
        }}
      />
    </Stack.Navigator>
  );
}
