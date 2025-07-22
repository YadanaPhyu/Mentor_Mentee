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

export default function AuthScreen() {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [userType, setUserType] = useState('mentee');
  const { login } = useAuth();
  const { t, toggleLanguage, language } = useLanguage();

  const handleSubmit = () => {
    if (!email || !password || (!isLogin && !name)) {
      Alert.alert(t('error'), t('fillAllFields'));
      return;
    }

    // For mentor@example.com, automatically set as mentor
    const isMentorEmail = email.toLowerCase() === 'mentor@example.com';
    const type = isMentorEmail ? 'mentor' : (userType || 'mentee');

    // Mock authentication
    const userData = {
      id: Math.random().toString(36).substr(2, 9),
      email,
      name: isLogin ? (isMentorEmail ? 'Mentor User' : 'Demo User') : name,
    };

    login(userData, type);
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
            )}

            <TouchableOpacity style={styles.submitButton} onPress={handleSubmit}>
              <Text style={styles.submitButtonText}>
                {isLogin ? t('signIn') : t('signUp')}
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
});
