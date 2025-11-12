import React, { createContext, useContext, useState, useEffect } from 'react';
import { Platform } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { ADMIN_CREDENTIALS } from '../config/adminCredentials';

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [userType, setUserType] = useState(null); // 'admin', 'mentor' or 'mentee'
  const [isLoading, setIsLoading] = useState(true);

  // Load stored authentication state when the app starts
  useEffect(() => {
    const loadStoredAuth = async () => {
      try {
        const [storedUser, storedUserType] = await Promise.all([
          AsyncStorage.getItem('userData'),
          AsyncStorage.getItem('userType')
        ]);
        
        if (storedUser && storedUserType) {
          setUser(JSON.parse(storedUser));
          setUserType(storedUserType);
        }
      } catch (error) {
        console.error('Error loading stored auth:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadStoredAuth();
  }, []);

  // Use the environment variable for API URL
  const API_URL = Platform.select({
    web: 'http://localhost:3000',
    android: 'http://10.0.2.2:3000', // Android emulator localhost
    ios: 'http://localhost:3000',
    default: process.env.EXPO_PUBLIC_API_BASE_URL || 'http://localhost:3000',
  });

  // Test server connection on startup
  useEffect(() => {
    const testConnection = async () => {
      try {
        const response = await fetch(`${API_URL}/health`);
        const data = await response.json();
        console.log('Server health check:', data);
      } catch (error) {
        console.error('Server connection test failed:', error);
      }
    };
    testConnection();
  }, []);
  
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
    
    console.log('Making API request to:', url);
    console.log('Request options:', JSON.stringify(options, null, 2));
    
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
          'Accept': 'application/json',
          'Content-Type': 'application/json',
          ...options.headers,
        },
        mode: 'cors'
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
        throw new Error(`Server connection failed. Please ensure the server is running at ${url.split('/').slice(0, 3).join('/')}`);
      } else if (error.message && error.message.includes('ECONNREFUSED')) {
        throw new Error(`Connection refused. Please check if the server is running at ${url.split('/').slice(0, 3).join('/')}`);
      } else if (error.message === 'Failed to fetch') {
        throw new Error(`Failed to connect to server at ${url.split('/').slice(0, 3).join('/')}. Please ensure the server is running and CORS is properly configured.`);
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
      // Input validation
      if (!email || !password) {
        throw new Error('Email and password are required');
      }

      if (!email.includes('@')) {
        throw new Error('Invalid email format');
      }

      console.log('Attempting login with:', { email, apiUrl: API_URL });

      // Special handling for admin login
      if (email.toLowerCase() === ADMIN_CREDENTIALS.email) {
        if (password !== ADMIN_CREDENTIALS.password) {
          throw new Error('Invalid password');
        }
        
        const adminData = {
          id: 'admin',
          email: ADMIN_CREDENTIALS.email,
          name: 'Administrator',
          role: 'admin'
        };
        
        await Promise.all([
          AsyncStorage.setItem('userData', JSON.stringify(adminData)),
          AsyncStorage.setItem('userType', 'admin')
        ]);
        
        setUser(adminData);
        setUserType('admin');
        return { success: true, user: adminData };
      }

      const response = await fetchWithTimeout(
        `${API_URL}/api/auth/login`,
        {
          method: 'POST',
          body: JSON.stringify({
            email: email.toLowerCase(),
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
        // Handle specific error cases
        switch (response.status) {
          case 401:
            throw new Error('Invalid email or password');
          case 403:
            throw new Error('Account is locked. Please contact support.');
          case 404:
            throw new Error('Account not found');
          default:
            throw new Error(data.error || 'Login failed');
        }
      }

      if (!data.id || !data.email || !data.role) {
        throw new Error('Invalid response from server');
      }

      // Store authentication state
      await Promise.all([
        AsyncStorage.setItem('userData', JSON.stringify(data)),
        AsyncStorage.setItem('userType', data.role)
      ]);

      setUser(data);
      setUserType(data.role);
      
      // Return the user data for immediate use if needed
      return { success: true, user: data };
    } catch (error) {
      console.error('Login error:', error);
      setUser(null);
      setUserType(null);
      
      // Clear stored auth state on error
      await Promise.all([
        AsyncStorage.removeItem('userData'),
        AsyncStorage.removeItem('userType')
      ]).catch(e => console.error('Error clearing auth storage:', e));
      
      throw error;
    }
  };

  const logout = async () => {
    try {
      console.log('AuthContext: Logging out user');
      
      // Clear stored auth state
      await Promise.all([
        AsyncStorage.removeItem('userData'),
        AsyncStorage.removeItem('userType')
      ]);
      
      // Clear memory state
      setUser(null);
      setUserType(null);
      
      console.log('AuthContext: Logout completed successfully');
      return true;
    } catch (error) {
      console.error('AuthContext: Logout error:', error);
      // Even if there's an error clearing storage, clear the memory state
      setUser(null);
      setUserType(null);
      return false;
    }
  };

  const updateUser = async (updatedUserData) => {
    try {
      // Update memory state
      setUser(updatedUserData);
      
      // Update stored state
      await AsyncStorage.setItem('userData', JSON.stringify(updatedUserData));
      
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
