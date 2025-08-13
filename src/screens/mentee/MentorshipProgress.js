import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useLanguage } from '../../context/LanguageContext';
import VideoCallButton from '../../components/VideoCallButton';
import MeetingDetails from '../../components/MeetingDetails';
import VideoCallService from '../../services/videoCallService';

export default function MentorshipProgress({ route, navigation }) {
  const { t } = useLanguage();

  // Mock session data - in a real app, this would come from props or API
  const sessionData = {
    id: '1',
    date: 'Jul 21',
    time: '2:00 PM',
    duration: 60, // changed to number for video call service
    status: 'confirmed',
    mentor: {
      name: 'John Doe',
      expertise: 'React Native Development',
    },
    // Auto-generate video call for confirmed sessions
    ...VideoCallService.addMeetingToSession({
      id: '1',
      date: 'Jul 21',
      time: '2:00 PM',
      duration: 60,
    }),
  };

  const renderStatusIcon = () => {
    switch (sessionData.status) {
      case 'confirmed':
        return <Ionicons name="checkmark-circle" size={50} color="#4CAF50" />;
      case 'pending':
        return <Ionicons name="time" size={50} color="#FFC107" />;
      case 'cancelled':
        return <Ionicons name="close-circle" size={50} color="#F44336" />;
      default:
        return null;
    }
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.statusContainer}>
        {renderStatusIcon()}
        <Text style={styles.statusText}>
          {t('sessionStatus')}: {sessionData.status.toUpperCase()}
        </Text>
      </View>

      <View style={styles.card}>
        <Text style={styles.cardTitle}>{t('sessionDetails')}</Text>
        <View style={styles.detailRow}>
          <Ionicons name="calendar-outline" size={24} color="#667eea" />
          <Text style={styles.detailText}>{sessionData.date}</Text>
        </View>
        <View style={styles.detailRow}>
          <Ionicons name="time-outline" size={24} color="#667eea" />
          <Text style={styles.detailText}>{sessionData.time}</Text>
        </View>
        <View style={styles.detailRow}>
          <Ionicons name="hourglass-outline" size={24} color="#667eea" />
          <Text style={styles.detailText}>{sessionData.duration}</Text>
        </View>
      </View>

      <View style={styles.card}>
        <Text style={styles.cardTitle}>{t('mentorInfo')}</Text>
        <View style={styles.detailRow}>
          <Ionicons name="person-outline" size={24} color="#667eea" />
          <Text style={styles.detailText}>{sessionData.mentor.name}</Text>
        </View>
        <View style={styles.detailRow}>
          <Ionicons name="briefcase-outline" size={24} color="#667eea" />
          <Text style={styles.detailText}>{sessionData.mentor.expertise}</Text>
        </View>
      </View>

      {sessionData.hasVideoCall && (
        <View style={styles.card}>
          <Text style={styles.cardTitle}>{t('videoCallDetails')}</Text>
          <MeetingDetails session={sessionData} />
        </View>
      )}

      <View style={styles.buttonContainer}>
        {sessionData.hasVideoCall && (
          <VideoCallButton 
            session={sessionData} 
            style={styles.videoCallButton}
          />
        )}
        
        <View style={styles.actionRow}>
          <TouchableOpacity
            style={styles.actionButton}
            onPress={() => navigation.navigate('Messages')}
          >
            <Ionicons name="chatbubbles-outline" size={24} color="white" />
            <Text style={styles.buttonText}>{t('messageNow')}</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.actionButton, styles.cancelButton]}
            onPress={() => {
              // Handle session cancellation
              navigation.goBack();
            }}
          >
            <Ionicons name="close-circle-outline" size={24} color="white" />
            <Text style={styles.buttonText}>{t('cancelSession')}</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Career Map Integration */}
      <View style={styles.careerSection}>
        <Text style={styles.sectionTitle}>Career Development</Text>
        <TouchableOpacity 
          style={styles.careerMapCard}
          onPress={() => navigation.navigate('CareerGoalIntake')}
        >
          <View style={styles.careerMapHeader}>
            <Ionicons name="map" size={28} color="#667eea" />
            <View style={styles.careerMapContent}>
              <Text style={styles.careerMapTitle}>Your Learning Path</Text>
              <Text style={styles.careerMapSubtitle}>
                Track progress on your 8-week career plan
              </Text>
            </View>
            <View style={styles.progressBadge}>
              <Text style={styles.progressText}>65%</Text>
            </View>
          </View>
          
          <View style={styles.careerActions}>
            <TouchableOpacity 
              style={styles.careerActionButton}
              onPress={() => navigation.navigate('ProgressTracker')}
            >
              <Ionicons name="checkmark-circle" size={18} color="#667eea" />
              <Text style={styles.careerActionText}>Track Progress</Text>
            </TouchableOpacity>
            <TouchableOpacity 
              style={styles.careerActionButton}
              onPress={() => navigation.navigate('MentorReview')}
            >
              <Ionicons name="people" size={18} color="#667eea" />
              <Text style={styles.careerActionText}>Get Review</Text>
            </TouchableOpacity>
          </View>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  statusContainer: {
    backgroundColor: 'white',
    padding: 20,
    alignItems: 'center',
    marginBottom: 10,
  },
  statusText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginTop: 10,
  },
  card: {
    backgroundColor: 'white',
    padding: 20,
    marginBottom: 10,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 15,
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
  },
  detailText: {
    fontSize: 16,
    color: '#333',
    marginLeft: 10,
  },
  buttonContainer: {
    padding: 20,
  },
  videoCallButton: {
    marginBottom: 15,
  },
  actionRow: {
    flexDirection: 'column',
  },
  actionButton: {
    backgroundColor: '#667eea',
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 15,
    borderRadius: 12,
    marginBottom: 10,
  },
  cancelButton: {
    backgroundColor: '#dc3545',
  },
  buttonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 10,
  },
  // Career Map Styles
  careerSection: {
    backgroundColor: 'white',
    padding: 20,
    marginBottom: 10,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 15,
  },
  careerMapCard: {
    backgroundColor: '#f8f9fa',
    borderRadius: 12,
    padding: 16,
    borderLeftWidth: 4,
    borderLeftColor: '#667eea',
  },
  careerMapHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 15,
  },
  careerMapContent: {
    flex: 1,
    marginLeft: 12,
  },
  careerMapTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 4,
  },
  careerMapSubtitle: {
    fontSize: 14,
    color: '#666',
  },
  progressBadge: {
    backgroundColor: '#667eea',
    borderRadius: 20,
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  progressText: {
    fontSize: 14,
    fontWeight: '600',
    color: 'white',
  },
  careerActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  careerActionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'white',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#667eea',
    flex: 0.48,
  },
  careerActionText: {
    fontSize: 14,
    color: '#667eea',
    fontWeight: '500',
    marginLeft: 6,
  },
});
