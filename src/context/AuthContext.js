import React, { createContext, useContext, useState, useEffect } from 'react';
import { useDatabase } from './DatabaseContext';
import User from '../models/Users';

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
  const [userType, setUserType] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const { findWhere, insert, update, isReady } = useDatabase();

  // Simple password hashing (in production, use bcrypt or similar)
  const hashPassword = (password) => {
    // This is a simple hash - in production use bcrypt
    return btoa(password + 'salt123'); // Base64 encoding with salt
  };

  const verifyPassword = (password, hash) => {
    return hashPassword(password) === hash;
  };

  // Login with email and password
  const login = async (email, password) => {
    if (!isReady) {
      throw new Error('Database not ready');
    }

    setIsLoading(true);
    try {
      console.log('🔍 Attempting login for:', email);

      // Find user by email
      const users = await findWhere('users', { email: email.toLowerCase() });
      
      if (users.length === 0) {
        throw new Error('User not found');
      }

      const userData = users[0];
      
      // Verify password
      if (!verifyPassword(password, userData.password_hash)) {
        throw new Error('Invalid password');
      }

      // Check if user is active
      if (userData.status !== 'active') {
        throw new Error('Account is inactive');
      }

      // Create User model instance
      const userModel = new User(userData);
      
      // Update last login
      await update('users', userData.id, {
        last_login_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      });

      // Set user data and type
      setUser(userModel);
      setUserType(userData.user_type);

      console.log('✅ Login successful for:', email, 'Type:', userData.user_type);
      return { success: true, user: userModel };
      
    } catch (error) {
      console.error('❌ Login error:', error);
      setUser(null);
      setUserType(null);
      return { success: false, error: error.message };
    } finally {
      setIsLoading(false);
    }
  };

  // Register new user
  const register = async (userData) => {
    if (!isReady) {
      throw new Error('Database not ready');
    }

    setIsLoading(true);
    try {
      console.log('📝 Attempting registration for:', userData.email);

      // Check if user already exists
      const existingUsers = await findWhere('users', { email: userData.email.toLowerCase() });
      
      if (existingUsers.length > 0) {
        throw new Error('User already exists with this email');
      }

      // Hash password
      const hashedPassword = hashPassword(userData.password);

      // Create user data object (not User model instance)
      const newUserData = {
        email: userData.email.toLowerCase(),
        password_hash: hashedPassword,
        name: userData.name,
        user_type: userData.user_type || 'mentee',
        phone: userData.phone || '',
        bio: userData.bio || '',
        location: userData.location || '',
        status: 'active',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        last_login_at: null
      };

      console.log('🔍 Inserting user data:', newUserData);

      // Insert user into database
      const userId = await insert('users', newUserData);
      
      console.log('🔍 Insert result - userId:', userId);
      
      // Add the ID to the user data
      newUserData.id = userId;
      
      console.log('✅ Registration successful for:', userData.email);
      return { success: true, user: newUserData };
      
    } catch (error) {
      console.error('❌ Registration error:', error);
      return { success: false, error: error.message };
    } finally {
      setIsLoading(false);
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
    isLoading,
    login,
    register,
    logout,
    updateUser,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};
