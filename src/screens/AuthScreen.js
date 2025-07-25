import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  Alert,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import { useDatabase } from '../context/DatabaseContext';

export default function AuthScreen() {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [userType, setUserType] = useState('mentee');
  const [phone, setPhone] = useState('');
  const [bio, setBio] = useState('');
  const [location, setLocation] = useState('');
  const [loading, setLoading] = useState(false);
  const { login, register, isLoading } = useAuth();
  const { t, toggleLanguage, language } = useLanguage();
  const { findWhere: dbFindWhere, findAll, isReady: dbReady, getAllTables, executeQuery, db } = useDatabase();

  // Debug function to check database
  const debugDatabase = async () => {
    try {
      console.log('🔍 Debug: Checking database...');
      console.log('🔍 Database ready:', dbReady);
      console.log('🔍 Database object:', db);
      
      // Check if we're using a mock database
      const isMockDatabase = db && typeof db.execSync === 'function' && 
        db.execSync.toString().includes('Mock execSync');
      
      console.log('🔍 Is mock database:', isMockDatabase);
      console.log('🔍 Platform:', require('react-native').Platform.OS);
      
      if (!dbReady) {
        Alert.alert('Debug', 'Database not ready yet!');
        return;
      }

      // Check database functions availability
      const functions = {
        execSync: typeof db?.execSync === 'function',
        getAllSync: typeof db?.getAllSync === 'function',
        runSync: typeof db?.runSync === 'function',
        getFirstSync: typeof db?.getFirstSync === 'function'
      };
      
      console.log('🔍 Database functions:', functions);

      // Direct database query to check tables
      let tables = [];
      let sqlError = null;
      try {
        const sql = "SELECT name FROM sqlite_master WHERE type='table' AND name NOT LIKE 'sqlite_%'";
        console.log('🔍 Executing SQL:', sql);
        const result = db.getAllSync(sql);
        console.log('🔍 Direct SQL result:', result);
        tables = result.map(row => row.name);
      } catch (directError) {
        console.error('🔍 Direct SQL query failed:', directError);
        sqlError = directError.message;
        // Fallback to getAllTables function
        try {
          tables = await getAllTables() || [];
        } catch (functionError) {
          console.error('🔍 getAllTables function failed:', functionError);
        }
      }
      
      console.log('🔍 Available tables:', tables);

      // Try to get users
      let allUsers = [];
      let userError = null;
      try {
        allUsers = await findAll('users');
        console.log('🔍 All users in database:', allUsers);
      } catch (error) {
        console.error('🔍 Error getting users:', error);
        userError = error.message;
      }
      
      const debugInfo = `Platform: ${require('react-native').Platform.OS}
Database Ready: ${dbReady}
Database Object: ${db ? 'Available' : 'Not Available'}
Is Mock Database: ${isMockDatabase}
Functions Available: ${Object.entries(functions).map(([k,v]) => `${k}:${v}`).join(', ')}
SQL Error: ${sqlError || 'None'}
Tables: ${tables.join(', ') || 'None found'}
Users Count: ${allUsers.length}
User Error: ${userError || 'None'}

Users:
${allUsers.map(u => `• ${u.email} (${u.user_type})`).join('\n')}`;

      Alert.alert('Database Debug', debugInfo);
    } catch (error) {
      console.error('🔍 Debug error:', error);
      Alert.alert('Debug Error', `Error: ${error.message}\n\nDetails: ${JSON.stringify(error, null, 2)}`);
    }
  };

  // Manual table creation for testing
  const createTablesManually = async () => {
    try {
      console.log('🔧 Creating tables manually...');
      console.log('🔧 Database object:', db);
      console.log('🔧 Platform:', require('react-native').Platform.OS);
      
      if (!db) {
        Alert.alert('Error', 'Database not available!');
        return;
      }
      
      // Check if we're using a mock database
      const isMockDatabase = db && typeof db.execSync === 'function' && 
        db.execSync.toString().includes('Mock execSync');
      
      console.log('🔧 Is mock database:', isMockDatabase);
      
      if (isMockDatabase) {
        Alert.alert('Mock Database Detected', 
          'You are using a mock database (likely on web platform). Tables cannot be created in mock mode. Please test on a real device or Android/iOS simulator.');
        return;
      }
      
      // Create users table using direct database access
      const createUsersSQL = `
        CREATE TABLE IF NOT EXISTS users (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          email TEXT UNIQUE NOT NULL,
          password_hash TEXT NOT NULL,
          name TEXT NOT NULL,
          user_type TEXT NOT NULL CHECK (user_type IN ('admin', 'mentor', 'mentee')),
          phone TEXT,
          bio TEXT,
          location TEXT,
          status TEXT DEFAULT 'active' CHECK (status IN ('active', 'inactive', 'pending')),
          created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
          updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
          last_login_at DATETIME
        );
      `;

      console.log('🔧 Executing SQL:', createUsersSQL);
      
      // Try direct database execution
      let executionMethod = '';
      try {
        db.execSync(createUsersSQL);
        executionMethod = 'execSync';
        console.log('✅ Users table created with execSync');
      } catch (execError) {
        console.error('❌ execSync failed:', execError);
        try {
          // Fallback to executeQuery function
          await executeQuery(createUsersSQL);
          executionMethod = 'executeQuery';
          console.log('✅ Users table created with executeQuery');
        } catch (queryError) {
          console.error('❌ executeQuery also failed:', queryError);
          throw new Error(`Both execSync and executeQuery failed. execSync: ${execError.message}, executeQuery: ${queryError.message}`);
        }
      }
      
      // Wait a moment for the operation to complete
      await new Promise(resolve => setTimeout(resolve, 100));
      
      // Verify table creation immediately
      let verification = [];
      let verificationMethod = '';
      try {
        const verifySQL = "SELECT name FROM sqlite_master WHERE type='table' AND name='users'";
        verification = db.getAllSync(verifySQL);
        verificationMethod = 'getAllSync';
        console.log('🔍 Verification result (getAllSync):', verification);
      } catch (verifyError) {
        console.error('❌ Verification with getAllSync failed:', verifyError);
        try {
          // Try with getAllTables function
          const allTables = await getAllTables() || [];
          verification = allTables.includes('users') ? [{ name: 'users' }] : [];
          verificationMethod = 'getAllTables';
          console.log('🔍 Verification result (getAllTables):', allTables);
        } catch (tableError) {
          console.error('❌ Verification with getAllTables failed:', tableError);
          verificationMethod = 'failed';
        }
      }
      
      const tableExists = verification.length > 0;
      const message = `Tables created using: ${executionMethod}
Verification method: ${verificationMethod}
Table exists: ${tableExists ? 'YES' : 'NO'}
Platform: ${require('react-native').Platform.OS}`;
      
      if (tableExists) {
        Alert.alert('✅ Success', message);
      } else {
        Alert.alert('⚠️ Warning', `Table creation reported success but verification failed!\n\n${message}`);
      }
      
    } catch (error) {
      console.error('❌ Manual table creation failed:', error);
      Alert.alert('Error', `Failed to create tables: ${error.message}`);
    }
  };

  const handleSubmit = async () => {
    if (!email || !password || (!isLogin && !name)) {
      Alert.alert(t('error'), t('fillAllFields'));
      return;
    }

    setLoading(true);

    try {
      if (isLogin) {
        // Login flow
        const result = await login(email, password);
        
        if (!result.success) {
          Alert.alert(t('error'), result.error || 'Login failed');
        }
        // If successful, AuthContext will handle navigation
        
      } else {
        // Registration flow
        const userData = {
          email,
          password,
          name,
          userType,
          phone,
          bio,
          location
        };
        
        const result = await register(userData);
        
        if (result.success) {
          Alert.alert(t('success'), 'Account created successfully!', [
            {
              text: 'OK',
              onPress: () => setIsLogin(true) // Switch to login form
            }
          ]);
        } else {
          Alert.alert(t('error'), result.error || 'Registration failed');
        }
      }
    } catch (error) {
      Alert.alert(t('error'), error.message || 'An unexpected error occurred');
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <LinearGradient
        colors={['#667eea', '#764ba2']}
        style={styles.gradient}
      >
        <View style={styles.content}>
          <View style={styles.languageToggle}>
            <TouchableOpacity onPress={toggleLanguage} style={styles.languageButton}>
              <Ionicons name="language" size={20} color="white" />
              <Text style={styles.languageText}>
                {language === 'en' ? 'မြန်မာ' : 'English'}
              </Text>
            </TouchableOpacity>
          </View>

          <Text style={styles.title}>{t('appTitle')}</Text>
          <Text style={styles.subtitle}>
            {isLogin ? t('welcomeBack') : t('createAccount')}
          </Text>

          <View style={styles.form}>
            {!isLogin && (
              <TextInput
                style={styles.input}
                placeholder={t('fullName')}
                value={name}
                onChangeText={setName}
                placeholderTextColor="#666"
              />
            )}

            <TextInput
              style={styles.input}
              placeholder={t('email')}
              value={email}
              onChangeText={setEmail}
              keyboardType="email-address"
              autoCapitalize="none"
              placeholderTextColor="#666"
            />

            <TextInput
              style={styles.input}
              placeholder={t('password')}
              value={password}
              onChangeText={setPassword}
              secureTextEntry
              placeholderTextColor="#666"
            />

            {!isLogin && (
              <>
                <TextInput
                  style={styles.input}
                  placeholder="Phone (optional)"
                  value={phone}
                  onChangeText={setPhone}
                  placeholderTextColor="#666"
                  keyboardType="phone-pad"
                />

                <TextInput
                  style={[styles.input, styles.textArea]}
                  placeholder="Bio (optional)"
                  value={bio}
                  onChangeText={setBio}
                  placeholderTextColor="#666"
                  multiline
                  numberOfLines={3}
                />

                <TextInput
                  style={styles.input}
                  placeholder="Location (optional)"
                  value={location}
                  onChangeText={setLocation}
                  placeholderTextColor="#666"
                />

                <View style={styles.userTypeContainer}>
                  <Text style={styles.userTypeLabel}>{t('iAmA')}</Text>
                  <View style={styles.userTypeButtons}>
                    <TouchableOpacity
                      style={[
                        styles.userTypeButton,
                        userType === 'mentee' && styles.userTypeButtonActive,
                      ]}
                      onPress={() => setUserType('mentee')}
                    >
                      <Text
                        style={[
                          styles.userTypeButtonText,
                          userType === 'mentee' && styles.userTypeButtonTextActive,
                        ]}
                      >
                        {t('mentee')}
                      </Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                      style={[
                        styles.userTypeButton,
                        userType === 'mentor' && styles.userTypeButtonActive,
                      ]}
                      onPress={() => setUserType('mentor')}
                    >
                      <Text
                        style={[
                          styles.userTypeButtonText,
                          userType === 'mentor' && styles.userTypeButtonTextActive,
                        ]}
                      >
                        {t('mentor')}
                      </Text>
                    </TouchableOpacity>
                  </View>
                </View>
              </>
            )}

            <TouchableOpacity 
              style={[styles.submitButton, (loading || isLoading) && styles.submitButtonDisabled]} 
              onPress={handleSubmit}
              disabled={loading || isLoading}
            >
              <Text style={styles.submitButtonText}>
                {(loading || isLoading) 
                  ? 'Loading...' 
                  : (isLogin ? t('signIn') : t('signUp'))
                }
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.switchButton}
              onPress={() => setIsLogin(!isLogin)}
            >
              <Text style={styles.switchButtonText}>
                {isLogin ? t('dontHaveAccount') : t('alreadyHaveAccount')}
              </Text>
            </TouchableOpacity>

            {/* Debug button - remove in production */}
            <TouchableOpacity
              style={styles.debugButton}
              onPress={debugDatabase}
            >
              <Text style={styles.debugButtonText}>
                🔍 Debug Database
              </Text>
            </TouchableOpacity>

            {/* Manual table creation button */}
            <TouchableOpacity
              style={styles.createTablesButton}
              onPress={createTablesManually}
            >
              <Text style={styles.createTablesButtonText}>
                🔧 Create Tables
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </LinearGradient>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  gradient: {
    flex: 1,
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    paddingHorizontal: 30,
  },
  languageToggle: {
    position: 'absolute',
    top: 50,
    right: 20,
    zIndex: 1,
  },
  languageButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
  },
  languageText: {
    color: 'white',
    fontSize: 14,
    marginLeft: 5,
    fontWeight: '600',
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: 'white',
    textAlign: 'center',
    marginBottom: 10,
  },
  subtitle: {
    fontSize: 18,
    color: 'white',
    textAlign: 'center',
    marginBottom: 40,
    opacity: 0.9,
  },
  form: {
    width: '100%',
  },
  input: {
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    borderRadius: 12,
    paddingHorizontal: 20,
    paddingVertical: 15,
    marginBottom: 15,
    fontSize: 16,
  },
  textArea: {
    height: 80,
    textAlignVertical: 'top',
  },
  userTypeContainer: {
    marginBottom: 20,
  },
  userTypeLabel: {
    color: 'white',
    fontSize: 16,
    marginBottom: 10,
    textAlign: 'center',
  },
  userTypeButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  userTypeButton: {
    flex: 1,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    borderRadius: 10,
    paddingVertical: 12,
    marginHorizontal: 5,
    alignItems: 'center',
  },
  userTypeButtonActive: {
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
  },
  userTypeButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  userTypeButtonTextActive: {
    color: '#667eea',
  },
  submitButton: {
    backgroundColor: '#4C1D95', // Deep purple for better contrast
    borderRadius: 12,
    paddingVertical: 15,
    alignItems: 'center',
    marginTop: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  submitButtonDisabled: {
    backgroundColor: '#9CA3AF',
    opacity: 0.6,
  },
  submitButtonText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: 'bold',
    letterSpacing: 0.5,
  },
  switchButton: {
    alignItems: 'center',
    marginTop: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.3)',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
    elevation: 3,
  },
  switchButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
    textShadowColor: 'rgba(0, 0, 0, 0.1)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
  },
  debugButton: {
    alignItems: 'center',
    marginTop: 10,
    backgroundColor: 'rgba(255, 215, 0, 0.2)',
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: 'rgba(255, 215, 0, 0.5)',
  },
  debugButtonText: {
    color: '#FFD700',
    fontSize: 14,
    fontWeight: '500',
  },
  createTablesButton: {
    alignItems: 'center',
    marginTop: 5,
    backgroundColor: 'rgba(34, 197, 94, 0.2)',
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: 'rgba(34, 197, 94, 0.5)',
  },
  createTablesButtonText: {
    color: '#22C55E',
    fontSize: 14,
    fontWeight: '500',
  },
});
