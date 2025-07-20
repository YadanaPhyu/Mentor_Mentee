import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { View, Text, ActivityIndicator } from 'react-native';
import { AuthProvider, useAuth } from './src/context/AuthContext';
import { LanguageProvider } from './src/context/LanguageContext';
import AppNavigator from './src/navigation/AppNavigator';

function NavigationContent() {
  const { user, userType } = useAuth();

  return (
    <View style={{ flex: 1 }}>
      <AppNavigator />
      <StatusBar style="auto" />
    </View>
  );
}

function AppContent() {
  return (
    <NavigationContainer
      fallback={
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
          <ActivityIndicator size="large" color="#667eea" />
        </View>
      }
    >
      <NavigationContent />
    </NavigationContainer>
  );
}

export default function App() {
  return (
    <SafeAreaProvider>
      <AuthProvider>
        <LanguageProvider>
          <AppContent />
        </LanguageProvider>
      </AuthProvider>
    </SafeAreaProvider>
  );
}
