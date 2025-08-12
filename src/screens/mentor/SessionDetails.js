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

export default function SessionDetails({ route, navigation }) {
  const { t } = useLanguage();
  
  // In a real app, this would come from route.params and/or API
  const session = {
    id: '1',
    mentee: {
      name: 'John Smith',
      title: 'Junior Developer',
      skills: ['React Native', 'JavaScript'],
    },
    date: 'Jul 21, 2025',
    time: '10:00 AM',
    duration: '60',
    topic: 'React Native Navigation',
    objectives: [
      'Understanding navigation patterns',
      'Implementing stack navigation',
      'Handling navigation events',
    ],
    notes: 'Focus on practical implementation with examples',
    status: 'upcoming', // upcoming, completed, cancelled
    // Auto-generate video call for upcoming sessions
    ...VideoCallService.addMeetingToSession({
      id: '1',
      date: 'Jul 21, 2025',
      time: '10:00 AM',
      duration: 60,
    }),
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'upcoming':
        return '#667eea';
      case 'completed':
        return '#4CAF50';
      case 'cancelled':
        return '#f44336';
      default:
        return '#667eea';
    }
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.section}>
        <View style={styles.header}>
          <View style={styles.menteeInfo}>
            <Ionicons name="person-circle" size={50} color="#764ba2" />
            <View style={styles.nameContainer}>
              <Text style={styles.menteeName}>{session.mentee.name}</Text>
              <Text style={styles.menteeTitle}>{session.mentee.title}</Text>
            </View>
          </View>
          <View style={[styles.statusBadge, { backgroundColor: getStatusColor(session.status) }]}>
            <Text style={styles.statusText}>{t(session.status)}</Text>
          </View>
        </View>

        <View style={styles.detailsContainer}>
          <View style={styles.detailRow}>
            <Ionicons name="calendar-outline" size={24} color="#667eea" />
            <Text style={styles.detailText}>{session.date}</Text>
          </View>
          <View style={styles.detailRow}>
            <Ionicons name="time-outline" size={24} color="#667eea" />
            <Text style={styles.detailText}>{session.time}</Text>
          </View>
          <View style={styles.detailRow}>
            <Ionicons name="hourglass-outline" size={24} color="#667eea" />
            <Text style={styles.detailText}>{session.duration} {t('minutes')}</Text>
          </View>
        </View>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>{t('topic')}</Text>
        <Text style={styles.topicText}>{session.topic}</Text>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>{t('objectives')}</Text>
        {session.objectives.map((objective, index) => (
          <View key={index} style={styles.objectiveItem}>
            <Ionicons name="checkmark-circle" size={20} color="#667eea" />
            <Text style={styles.objectiveText}>{objective}</Text>
          </View>
        ))}
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>{t('notes')}</Text>
        <Text style={styles.notesText}>{session.notes}</Text>
      </View>

      {session.hasVideoCall && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>{t('videoCallDetails')}</Text>
          <MeetingDetails session={session} />
        </View>
      )}

      {session.status === 'upcoming' && (
        <View style={styles.actionButtons}>
          {session.hasVideoCall && (
            <VideoCallButton 
              session={session} 
              style={styles.videoCallButton}
            />
          )}
          <TouchableOpacity style={styles.startButton}>
            <Text style={styles.buttonText}>{t('startSession')}</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.rescheduleButton}>
            <Text style={styles.buttonText}>{t('reschedule')}</Text>
          </TouchableOpacity>
        </View>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  section: {
    backgroundColor: 'white',
    padding: 20,
    marginBottom: 10,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 20,
  },
  menteeInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  nameContainer: {
    marginLeft: 12,
  },
  menteeName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  menteeTitle: {
    fontSize: 14,
    color: '#666',
    marginTop: 2,
  },
  statusBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
  },
  statusText: {
    color: 'white',
    fontSize: 12,
    fontWeight: '600',
    textTransform: 'uppercase',
  },
  detailsContainer: {
    backgroundColor: '#f8f9fa',
    borderRadius: 12,
    padding: 15,
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
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 15,
  },
  topicText: {
    fontSize: 16,
    color: '#333',
    lineHeight: 24,
  },
  objectiveItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  objectiveText: {
    fontSize: 14,
    color: '#444',
    marginLeft: 10,
    flex: 1,
  },
  notesText: {
    fontSize: 14,
    color: '#444',
    lineHeight: 22,
  },
  actionButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    padding: 20,
    flexWrap: 'wrap',
  },
  videoCallButton: {
    width: '100%',
    marginBottom: 10,
  },
  startButton: {
    backgroundColor: '#667eea',
    borderRadius: 12,
    padding: 15,
    flex: 1,
    marginRight: 10,
    alignItems: 'center',
  },
  rescheduleButton: {
    backgroundColor: '#764ba2',
    borderRadius: 12,
    padding: 15,
    flex: 1,
    marginLeft: 10,
    alignItems: 'center',
  },
  buttonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
});
