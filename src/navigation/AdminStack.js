import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import AdminDashboard from '../screens/admin/AdminDashboard';
import ManageUsers from '../screens/admin/ManageUsers';

const Stack = createNativeStackNavigator();

export default function AdminStack() {
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
