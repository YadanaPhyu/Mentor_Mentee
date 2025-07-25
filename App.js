import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { View, Text, ActivityIndicator } from 'react-native';
import { AuthProvider, useAuth } from './src/context/AuthContext';
import { LanguageProvider } from './src/context/LanguageContext';
import { DatabaseProvider } from './src/context/DatabaseContext';
import AppNavigator from './src/navigation/AppNavigator';

function NavigationContent() {
  const { user, userType } = useAuth();
  
  console.log('🔍 NavigationContent - user:', user, 'userType:', userType);

  return (
    <View style={{ flex: 1 }}>
      <AppNavigator />
      <StatusBar style="auto" />
    </View>
  );
}

function AppContent() {
  console.log('📱 AppContent rendering...');
  
  return (
    <NavigationContainer
      fallback={
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
          <ActivityIndicator size="large" color="#667eea" />
          <Text style={{ marginTop: 10, color: '#666' }}>Loading...</Text>
        </View>
      }
    >
      <NavigationContent />
    </NavigationContainer>
  );
}

export default function App() {
  console.log('🚀 App starting...');
  
  return (
    <SafeAreaProvider>
      <DatabaseProvider>
        <AuthProvider>
          <LanguageProvider>
            <AppContent />
          </LanguageProvider>
        </AuthProvider>
      </DatabaseProvider>
    </SafeAreaProvider>
  );
}
