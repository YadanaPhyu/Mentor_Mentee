import React, { useState } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  TouchableOpacity, 
  Alert
} from 'react-native';
import * as Clipboard from 'expo-clipboard';
import { Ionicons } from '@expo/vector-icons';
import { useLanguage } from '../context/LanguageContext';

export default function MeetingDetails({ session, onJoinCall }) {
  const { t } = useLanguage();
  const [copied, setCopied] = useState(false);

  if (!session.hasVideoCall || !session.videoCall) {
    return null;
  }

  const { videoCall } = session;

  const copyToClipboard = async () => {
    try {
      await Clipboard.setStringAsync(videoCall.meetingUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
      Alert.alert('Copied!', 'Meeting link copied to clipboard');
    } catch (error) {
      Alert.alert('Error', 'Failed to copy meeting link');
    }
  };

  const getProviderIcon = () => {
    switch (videoCall.provider) {
      case 'google_meet':
        return 'logo-google';
      case 'zoom':
        return 'videocam';
      case 'jitsi':
      default:
        return 'videocam-outline';
    }
  };

  const getProviderName = () => {
    switch (videoCall.provider) {
      case 'google_meet':
        return 'Google Meet';
      case 'zoom':
        return 'Zoom';
      case 'jitsi':
      default:
        return 'Jitsi Meet';
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Ionicons name={getProviderIcon()} size={24} color="#667eea" />
        <Text style={styles.title}>{t('videoCall')} - {getProviderName()}</Text>
      </View>
      
      <View style={styles.content}>
        <Text style={styles.instructions}>
          {videoCall.instructions}
        </Text>
        
        <View style={styles.linkContainer}>
          <Text style={styles.linkLabel}>{t('meetingLink')}:</Text>
          <TouchableOpacity 
            style={styles.linkButton}
            onPress={copyToClipboard}
          >
            <Text style={styles.linkText} numberOfLines={1}>
              {videoCall.meetingUrl}
            </Text>
            <Ionicons 
              name={copied ? "checkmark" : "copy-outline"} 
              size={20} 
              color="#667eea" 
            />
          </TouchableOpacity>
        </View>

        {videoCall.meetingId && (
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>{t('meetingId')}:</Text>
            <Text style={styles.infoValue}>{videoCall.meetingId}</Text>
          </View>
        )}

        <View style={styles.infoRow}>
          <Text style={styles.infoLabel}>{t('createdAt')}:</Text>
          <Text style={styles.infoValue}>
            {new Date(videoCall.createdAt).toLocaleString()}
          </Text>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#f8f9ff',
    borderRadius: 12,
    padding: 16,
    marginVertical: 8,
    borderLeftWidth: 4,
    borderLeftColor: '#667eea',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  title: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginLeft: 8,
  },
  content: {
    marginLeft: 32,
  },
  instructions: {
    fontSize: 14,
    color: '#666',
    lineHeight: 20,
    marginBottom: 12,
  },
  linkContainer: {
    marginBottom: 12,
  },
  linkLabel: {
    fontSize: 14,
    fontWeight: '500',
    color: '#333',
    marginBottom: 4,
  },
  linkButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'white',
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#e0e0e0',
  },
  linkText: {
    flex: 1,
    fontSize: 14,
    color: '#667eea',
    marginRight: 8,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 4,
  },
  infoLabel: {
    fontSize: 14,
    color: '#666',
    fontWeight: '500',
  },
  infoValue: {
    fontSize: 14,
    color: '#333',
    maxWidth: 200,
    textAlign: 'right',
  },
});
