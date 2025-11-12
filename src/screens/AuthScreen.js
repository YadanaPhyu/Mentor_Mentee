import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
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
  const [loading, setLoading] = useState(false);
  const { login, signup, API_URL, fetchWithTimeout } = useAuth();
  const [serverOnline, setServerOnline] = useState(true);
  const { t, toggleLanguage, language } = useLanguage();

  // Check API health on mount
  React.useEffect(() => {
    let cancelled = false;
    const ping = async () => {
      try {
        // Fast health check with short timeout
        await fetchWithTimeout(`${API_URL}/health`, { method: 'GET' }, 3000);
        if (!cancelled) setServerOnline(true);
      } catch (e) {
        if (!cancelled) setServerOnline(false);
        console.warn('API health check failed:', e?.message);
      }
    };
    ping();
    // Optional periodic check while on auth screen
    const id = setInterval(ping, 20000);
    return () => { cancelled = true; clearInterval(id); };
  }, [API_URL, fetchWithTimeout]);

  const handleSubmit = async () => {
    try {
      if (!email || !password || (!isLogin && !name)) {
        Alert.alert(t('error'), t('fillAllFields'));
        return;
      }

      setLoading(true);
      
      // Preflight: ensure API is reachable, provide clear guidance if not
      try {
        await fetchWithTimeout(`${API_URL}/health`, { method: 'GET' }, 4000);
      } catch (e) {
        setServerOnline(false);
        Alert.alert(
          'Cannot reach server',
          `The API at ${API_URL} is not reachable. Please:
\n1) Start the API server (node server-minimal.js or VS Code task).
2) Keep this window open while the server runs.
3) Then try again.\n\nTechnical: ${e?.message || 'Unknown network error'}`
        );
        return;
      }
      
      if (isLogin) {
        await login(email, password);
      } else {
        await signup(email, password, name, userType);
      }
    } catch (error) {
      Alert.alert(t('error'), error.message || 'Authentication failed');
      console.error('Auth error:', error);
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
          {/* Server status banner */}
          {!serverOnline && (
            <View style={styles.serverBanner}>
              <Ionicons name="cloud-offline" size={18} color="#fff" />
              <Text style={styles.serverBannerText}>
                Cannot reach API at {API_URL}. Start the server and retry.
              </Text>
              <TouchableOpacity onPress={async () => {
                try {
                  await fetchWithTimeout(`${API_URL}/health`, { method: 'GET' }, 3000);
                  setServerOnline(true);
                } catch {
                  setServerOnline(false);
                }
              }}>
                <Text style={styles.serverBannerLink}>Retry</Text>
              </TouchableOpacity>
            </View>
          )}
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

            <TouchableOpacity 
              style={[styles.submitButton, loading && styles.submitButtonDisabled]} 
              onPress={handleSubmit}
              disabled={loading}
            >
              {loading ? (
                <ActivityIndicator color="#FFFFFF" />
              ) : (
                <Text style={styles.submitButtonText}>
                  {isLogin ? t('signIn') : t('signUp')}
                </Text>
              )}
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
  serverBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#e53935',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    marginBottom: 10,
  },
  serverBannerText: {
    color: '#fff',
    marginLeft: 8,
    flex: 1,
  },
  serverBannerLink: {
    color: '#fff',
    fontWeight: '600',
    marginLeft: 12,
    textDecorationLine: 'underline',
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
  submitButtonDisabled: {
    opacity: 0.7,
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
