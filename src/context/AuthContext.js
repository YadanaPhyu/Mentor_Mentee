import React, { createContext, useContext, useState } from 'react';

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

  const login = async (userData, type) => {
    try {
      // Special handling for admin login
      if (userData.email.toLowerCase() === 'admin@example.com') {
        type = 'admin';
      }
      
      // Validate user type
      if (!['admin', 'mentor', 'mentee'].includes(type)) {
        throw new Error('Invalid user type');
      }

      // Set user data and type
      setUser(userData);
      setUserType(type);

      // You would typically store auth token here
      // await AsyncStorage.setItem('userToken', token);
      // await AsyncStorage.setItem('userType', type);
      
      return true;
    } catch (error) {
      console.error('Login error:', error);
      setUser(null);
      setUserType(null);
      return false;
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
    updateUser,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};
