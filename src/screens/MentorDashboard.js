import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useLanguage } from '../context/LanguageContext';
import { useAuth } from '../context/AuthContext';

export default function MentorDashboard() {
  const { t } = useLanguage();
  const { user } = useAuth();

  const mentorshipRequests = [
    { id: 1, name: 'John Doe', skills: ['React Native', 'JavaScript'], status: 'pending' },
    { id: 2, name: 'Jane Smith', skills: ['UI/UX', 'Mobile Design'], status: 'pending' },
  ];

  const upcomingSessions = [
    { id: 1, mentee: 'Alice Brown', date: '2025-07-22', time: '10:00 AM', topic: 'React Navigation' },
    { id: 2, mentee: 'Bob Wilson', date: '2025-07-23', time: '2:00 PM', topic: 'State Management' },
  ];

  return (
    <ScrollView style={styles.container}>
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>{t('pendingRequests')}</Text>
        {mentorshipRequests.map((request) => (
          <View key={request.id} style={styles.requestCard}>
            <View style={styles.requestHeader}>
              <Text style={styles.requestName}>{request.name}</Text>
              <View style={styles.statusBadge}>
                <Text style={styles.statusText}>{t('pending')}</Text>
              </View>
            </View>
            <View style={styles.skillsContainer}>
              {request.skills.map((skill, index) => (
                <View key={index} style={styles.skillBadge}>
                  <Text style={styles.skillText}>{skill}</Text>
                </View>
              ))}
            </View>
            <View style={styles.actionButtons}>
              <TouchableOpacity style={[styles.actionButton, styles.acceptButton]}>
                <Text style={styles.actionButtonText}>{t('accept')}</Text>
              </TouchableOpacity>
              <TouchableOpacity style={[styles.actionButton, styles.declineButton]}>
                <Text style={styles.actionButtonText}>{t('decline')}</Text>
              </TouchableOpacity>
            </View>
          </View>
        ))}
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>{t('upcomingSessions')}</Text>
        {upcomingSessions.map((session) => (
          <View key={session.id} style={styles.sessionCard}>
            <View style={styles.sessionHeader}>
              <Ionicons name="calendar" size={24} color="#667eea" />
              <View style={styles.sessionInfo}>
                <Text style={styles.sessionMentee}>{session.mentee}</Text>
                <Text style={styles.sessionDateTime}>{session.date} at {session.time}</Text>
              </View>
            </View>
            <Text style={styles.sessionTopic}>{session.topic}</Text>
            <TouchableOpacity style={styles.startSessionButton}>
              <Text style={styles.startSessionText}>{t('startSession')}</Text>
            </TouchableOpacity>
          </View>
        ))}
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>{t('mentorSettings')}</Text>
        <TouchableOpacity style={styles.settingButton}>
          <Ionicons name="calendar-outline" size={24} color="#667eea" />
          <Text style={styles.settingText}>{t('manageAvailability')}</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.settingButton}>
          <Ionicons name="list-outline" size={24} color="#667eea" />
          <Text style={styles.settingText}>{t('updateSkills')}</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
    padding: 20,
  },
  section: {
    marginBottom: 30,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 15,
  },
  requestCard: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 15,
    marginBottom: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  requestHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  requestName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
  },
  statusBadge: {
    backgroundColor: '#ffd700',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  statusText: {
    color: '#666',
    fontSize: 12,
    fontWeight: '500',
  },
  skillsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: 15,
  },
  skillBadge: {
    backgroundColor: '#667eea',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    marginRight: 8,
    marginBottom: 8,
  },
  skillText: {
    color: 'white',
    fontSize: 12,
  },
  actionButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  actionButton: {
    flex: 1,
    paddingVertical: 8,
    borderRadius: 8,
    marginHorizontal: 5,
    alignItems: 'center',
  },
  acceptButton: {
    backgroundColor: '#4CAF50',
  },
  declineButton: {
    backgroundColor: '#f44336',
  },
  actionButtonText: {
    color: 'white',
    fontWeight: '600',
  },
  sessionCard: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 15,
    marginBottom: 15,
  },
  sessionHeader: {
    flexDirection: 'row',
    marginBottom: 10,
  },
  sessionInfo: {
    marginLeft: 10,
  },
  sessionMentee: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
  },
  sessionDateTime: {
    fontSize: 14,
    color: '#666',
  },
  sessionTopic: {
    fontSize: 14,
    color: '#667eea',
    marginBottom: 10,
  },
  startSessionButton: {
    backgroundColor: '#667eea',
    paddingVertical: 8,
    borderRadius: 8,
    alignItems: 'center',
  },
  startSessionText: {
    color: 'white',
    fontWeight: '600',
  },
  settingButton: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 15,
    marginBottom: 10,
    flexDirection: 'row',
    alignItems: 'center',
  },
  settingText: {
    marginLeft: 10,
    fontSize: 16,
    color: '#333',
  },
});
