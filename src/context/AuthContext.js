import React, { createContext, useContext, useState } from 'react';
import { Platform } from 'react-native';

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  // For demo purposes, we'll auto-login with test accounts based on role
  const [user, setUser] = useState({ id: 2, email: 'mentee@example.com', name: 'Test Mentee' });
  const [userType, setUserType] = useState('mentee'); // 'admin', 'mentor' or 'mentee'

  // Use the environment variable for API URL or fallback to localhost
  const API_URL = Platform.select({
    web: 'http://localhost:3000',
    android: 'http://10.0.2.2:3000', // Android emulator localhost
    ios: 'http://localhost:3000',
    default: 'http://localhost:3000',
  });
  
  // Log the API URL for debugging
  console.log('🔗 API URL:', API_URL);

  // Helper function to make API requests with timeout
  const fetchWithTimeout = async (url, options = {}, timeout = 10000) => {
    // Validate URL to ensure it's properly formed
    if (!url) {
      throw new Error('URL is undefined or empty');
    }
    
    // Ensure URL starts with http:// or https://
    if (!url.startsWith('http://') && !url.startsWith('https://')) {
      console.warn(`URL doesn't start with http:// or https://: ${url}`);
    }
    
    // Setup abort controller for timeout
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), timeout);

    try {
      console.log(`🌐 Fetch request to: ${url}`);
      console.log(`   - Options:`, JSON.stringify(options));
      
      const start = Date.now();
      
      // Make the fetch request with timeout
      const response = await fetch(url, {
        ...options,
        signal: controller.signal,
        headers: {
          ...options.headers,
          'Accept': 'application/json',
          'Content-Type': 'application/json',
        },
      });
      
      // Clear timeout as request completed
      clearTimeout(timeoutId);
      
      const duration = Date.now() - start;
      console.log(`✅ Response from ${url}: status=${response.status} (${duration}ms)`);
      
      return response;
    } catch (error) {
      // Clear timeout as request completed (with error)
      clearTimeout(timeoutId);
      
      console.error(`❌ Fetch error for ${url}:`, error.name, error.message);
      
      // Provide more user-friendly error messages
      if (error.name === 'AbortError') {
        throw new Error(`Request timed out after ${timeout/1000} seconds. Please check your connection and try again.`);
      } else if (error.message && error.message.includes('Network request failed')) {
        throw new Error(`Network request failed. Please check your internet connection and that the server is running at ${url.split('/').slice(0, 3).join('/')}`);
      } else if (error.message && error.message.includes('ECONNREFUSED')) {
        throw new Error(`Connection refused. The server at ${url.split('/').slice(0, 3).join('/')} appears to be offline or unreachable.`);
      }
      
      throw error;
    }
  };

  const signup = async (email, password, name, role) => {
    try {
      const response = await fetchWithTimeout(
        `${API_URL}/api/auth/signup`,
        {
          method: 'POST',
          body: JSON.stringify({
            email,
            password,
            name,
            role
          }),
        }
      );

      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || 'Signup failed');
      }

      // Auto-login after successful signup
      setUser(data);
      setUserType(data.role);
      return true;
    } catch (error) {
      console.error('Signup error:', error);
      throw error;
    }
  };

  const login = async (email, password) => {
    try {
      // Special handling for admin login
      if (email.toLowerCase() === 'admin@example.com') {
        setUser({ id: 'admin', email, name: 'Admin' });
        setUserType('admin');
        return true;
      }

      const response = await fetchWithTimeout(
        `${API_URL}/api/auth/login`,
        {
          method: 'POST',
          body: JSON.stringify({
            email,
            password
          }),
        }
      );

      let data;
      try {
        data = await response.json();
      } catch (e) {
        throw new Error('Unable to connect to server. Please check if the server is running.');
      }
      
      if (!response.ok) {
        throw new Error(data.error || 'Login failed');
      }

      setUser(data);
      setUserType(data.role);
      return true;
    } catch (error) {
      console.error('Login error:', error);
      setUser(null);
      setUserType(null);
      throw error;
    }
  };

  const logout = async () => {
    try {
      console.log('AuthContext: Logging out user');
      
      // Clear all auth state
      setUser(null);
      setUserType(null);
      
      // Clear storage (when implemented)
      // await AsyncStorage.removeItem('userToken');
      // await AsyncStorage.removeItem('userType');
      // await AsyncStorage.removeItem('userData');
      
      console.log('AuthContext: Logout completed successfully');
      return true;
    } catch (error) {
      console.error('AuthContext: Logout error:', error);
      // Even if there's an error, clear the state
      setUser(null);
      setUserType(null);
      return false;
    }
  };

  const updateUser = (updatedUserData) => {
    try {
      setUser(updatedUserData);
      
      // In real app, would update user data in backend and storage
      // await updateUserProfile(updatedUserData);
      // await AsyncStorage.setItem('userData', JSON.stringify(updatedUserData));
      
      return true;
    } catch (error) {
      console.error('Update user error:', error);
      return false;
    }
  };

  const value = {
    user,
    userType,
    login,
    logout,
    signup,
    updateUser,
    API_URL,
    fetchWithTimeout
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};
