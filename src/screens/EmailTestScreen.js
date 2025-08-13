import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import EmailService from '../services/emailService';
import EmailTestUtils from '../utils/emailTestUtils';
import VideoCallService from '../services/videoCallService';

export default function EmailTestScreen() {
  const [emailSending, setEmailSending] = useState(false);
  const [emailSent, setEmailSent] = useState(false);
  const [lastSession, setLastSession] = useState(null);

  const createTestSession = () => {
    const session = {
      id: 'test-' + Date.now(),
      mentorId: 'mentor123',
      mentorName: 'Dr. Sarah Johnson',
      date: 'August 15, 2025',
      time: '2:00 PM',
      duration: 60,
      status: 'confirmed',
      topic: 'React Native Development Mentoring',
      fee: 50,
    };

    // Add video call
    return VideoCallService.addMeetingToSession(session);
  };

  const testEmailFunctionality = async () => {
    console.log('🧪 Starting Email Test...');
    setEmailSending(true);
    setEmailSent(false);

    try {
      // Create test session
      const testSession = createTestSession();
      setLastSession(testSession);
      
      console.log('📝 Created test session:', testSession);

      // Test email sending
      const result = await EmailService.sendSessionConfirmationEmail(
        testSession,
        'mentor@example.com',
        'mentee@example.com'
      );

      if (result) {
        console.log('✅ Email test successful!');
        setEmailSent(true);
        Alert.alert(
          '📧 Email Test Complete!',
          'Check your console for email content. On mobile, your email app should have opened!',
          [{ text: 'OK' }]
        );
      } else {
        Alert.alert('❌ Email Test Failed', 'Check console for details');
      }
    } catch (error) {
      console.error('❌ Email test error:', error);
      Alert.alert('❌ Error', error.message);
    } finally {
      setEmailSending(false);
    }
  };

  const runEmailUtilityTests = async () => {
    console.log('🔧 Running Email Utility Tests...');
    try {
      await EmailTestUtils.testEmailService();
      Alert.alert(
        '🔧 Utility Test Complete!',
        'Check console for detailed test results',
        [{ text: 'OK' }]
      );
    } catch (error) {
      console.error('❌ Utility test error:', error);
      Alert.alert('❌ Error', error.message);
    }
  };

  const showEmailPreview = () => {
    if (!lastSession) {
      Alert.alert('📧 No Session', 'Run email test first to create a session');
      return;
    }

    const plainText = EmailService.generatePlainTextEmail(lastSession);
    Alert.alert(
      '📧 Email Preview',
      plainText.substring(0, 500) + '...',
      [{ text: 'OK' }]
    );
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Ionicons name="mail" size={40} color="#667eea" />
        <Text style={styles.title}>Email Testing</Text>
        <Text style={styles.subtitle}>Test email functionality on mobile device</Text>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>📱 Mobile Email Test</Text>
        <Text style={styles.description}>
          This will create a test session and trigger the email functionality.
          On mobile devices, your email app should open automatically.
        </Text>
        
        <TouchableOpacity
          style={[styles.testButton, emailSending && styles.disabledButton]}
          onPress={testEmailFunctionality}
          disabled={emailSending}
        >
          {emailSending ? (
            <Ionicons name="sync" size={24} color="white" />
          ) : (
            <Ionicons name="mail" size={24} color="white" />
          )}
          <Text style={styles.buttonText}>
            {emailSending ? 'Testing Email...' : 'Test Email Feature'}
          </Text>
        </TouchableOpacity>

        {emailSent && (
          <View style={styles.successMessage}>
            <Ionicons name="checkmark-circle" size={24} color="#4CAF50" />
            <Text style={styles.successText}>Email test completed!</Text>
          </View>
        )}
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>🔧 Utility Tests</Text>
        <Text style={styles.description}>
          Run comprehensive email service tests and log detailed information.
        </Text>
        
        <TouchableOpacity
          style={styles.utilityButton}
          onPress={runEmailUtilityTests}
        >
          <Ionicons name="settings" size={24} color="#667eea" />
          <Text style={styles.utilityButtonText}>Run Utility Tests</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>👀 Email Preview</Text>
        <Text style={styles.description}>
          Preview the email content that would be sent.
        </Text>
        
        <TouchableOpacity
          style={styles.previewButton}
          onPress={showEmailPreview}
        >
          <Ionicons name="eye" size={24} color="#667eea" />
          <Text style={styles.previewButtonText}>Preview Email Content</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.infoSection}>
        <Text style={styles.infoTitle}>💡 How to Test:</Text>
        <Text style={styles.infoText}>
          1. Tap "Test Email Feature" above{'\n'}
          2. On mobile: Your email app will open{'\n'}
          3. Email will be pre-filled with session details{'\n'}
          4. Change recipient emails to your real addresses{'\n'}
          5. Tap Send to test actual email delivery
        </Text>
      </View>

      <View style={styles.infoSection}>
        <Text style={styles.infoTitle}>📱 Platform Differences:</Text>
        <Text style={styles.infoText}>
          • Mobile: Opens real email app with pre-filled content{'\n'}
          • Web: Shows simulation and logs email content{'\n'}
          • Both: Complete UI testing and email preview
        </Text>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  header: {
    alignItems: 'center',
    padding: 30,
    backgroundColor: 'white',
    marginBottom: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    marginTop: 10,
  },
  subtitle: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    marginTop: 5,
  },
  section: {
    backgroundColor: 'white',
    margin: 15,
    padding: 20,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 10,
  },
  description: {
    fontSize: 14,
    color: '#666',
    lineHeight: 20,
    marginBottom: 15,
  },
  testButton: {
    backgroundColor: '#667eea',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 15,
    borderRadius: 10,
    marginBottom: 10,
  },
  disabledButton: {
    backgroundColor: '#cccccc',
  },
  buttonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 10,
  },
  utilityButton: {
    backgroundColor: '#f8f9ff',
    borderWidth: 2,
    borderColor: '#667eea',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 15,
    borderRadius: 10,
  },
  utilityButtonText: {
    color: '#667eea',
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 10,
  },
  previewButton: {
    backgroundColor: '#fff8e1',
    borderWidth: 2,
    borderColor: '#ffa726',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 15,
    borderRadius: 10,
  },
  previewButtonText: {
    color: '#ffa726',
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 10,
  },
  successMessage: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#e8f5e8',
    padding: 10,
    borderRadius: 8,
  },
  successText: {
    color: '#4CAF50',
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 10,
  },
  infoSection: {
    backgroundColor: '#f0f4ff',
    margin: 15,
    padding: 20,
    borderRadius: 12,
    borderLeftWidth: 4,
    borderLeftColor: '#667eea',
  },
  infoTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#667eea',
    marginBottom: 10,
  },
  infoText: {
    fontSize: 14,
    color: '#333',
    lineHeight: 20,
  },
});
