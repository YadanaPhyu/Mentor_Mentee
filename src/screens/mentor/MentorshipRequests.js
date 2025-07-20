import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useLanguage } from '../../context/LanguageContext';

export default function MentorshipRequests() {
  const { t } = useLanguage();
  const [requests, setRequests] = useState([
    {
      id: 1,
      mentee: {
        name: 'John Smith',
        title: 'Junior Developer',
        skills: ['React Native', 'JavaScript'],
      },
      message: 'I would love to learn more about mobile development and React Native best practices.',
      status: 'pending',
      requestedDate: '2025-07-19',
    },
    {
      id: 2,
      mentee: {
        name: 'Sarah Johnson',
        title: 'UI/UX Designer',
        skills: ['UI Design', 'Mobile Design'],
      },
      message: 'Looking for guidance in transitioning from design to development.',
      status: 'pending',
      requestedDate: '2025-07-20',
    },
  ]);

  const handleRequest = (id, action) => {
    setRequests(prevRequests =>
      prevRequests.map(request =>
        request.id === id
          ? { ...request, status: action }
          : request
      )
    );
  };

  return (
    <ScrollView style={styles.container}>
      {requests.map((request) => (
        <View key={request.id} style={styles.requestCard}>
          <View style={styles.header}>
            <View style={styles.menteeInfo}>
              <Ionicons name="person-circle" size={50} color="#764ba2" />
              <View style={styles.nameContainer}>
                <Text style={styles.menteeName}>{request.mentee.name}</Text>
                <Text style={styles.menteeTitle}>{request.mentee.title}</Text>
              </View>
            </View>
            <View style={[styles.statusBadge, 
              request.status === 'accepted' && styles.statusAccepted,
              request.status === 'declined' && styles.statusDeclined
            ]}>
              <Text style={styles.statusText}>{request.status}</Text>
            </View>
          </View>

          <View style={styles.skillsContainer}>
            {request.mentee.skills.map((skill, index) => (
              <View key={index} style={styles.skillBadge}>
                <Text style={styles.skillText}>{skill}</Text>
              </View>
            ))}
          </View>

          <Text style={styles.message}>{request.message}</Text>
          
          <Text style={styles.requestDate}>
            {t('requestedOn')}: {request.requestedDate}
          </Text>

          {request.status === 'pending' && (
            <View style={styles.actionButtons}>
              <TouchableOpacity
                style={[styles.actionButton, styles.acceptButton]}
                onPress={() => handleRequest(request.id, 'accepted')}
              >
                <Ionicons name="checkmark-circle" size={20} color="white" />
                <Text style={styles.actionButtonText}>{t('accept')}</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.actionButton, styles.declineButton]}
                onPress={() => handleRequest(request.id, 'declined')}
              >
                <Ionicons name="close-circle" size={20} color="white" />
                <Text style={styles.actionButtonText}>{t('decline')}</Text>
              </TouchableOpacity>
            </View>
          )}
        </View>
      ))}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
    padding: 15,
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
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 15,
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
    backgroundColor: '#ffd700',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
  },
  statusAccepted: {
    backgroundColor: '#4CAF50',
  },
  statusDeclined: {
    backgroundColor: '#f44336',
  },
  statusText: {
    color: 'white',
    fontSize: 12,
    fontWeight: '600',
    textTransform: 'uppercase',
  },
  skillsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: 15,
  },
  skillBadge: {
    backgroundColor: '#667eea',
    borderRadius: 20,
    paddingHorizontal: 12,
    paddingVertical: 6,
    marginRight: 8,
    marginBottom: 8,
  },
  skillText: {
    color: 'white',
    fontSize: 12,
    fontWeight: '500',
  },
  message: {
    fontSize: 14,
    color: '#444',
    lineHeight: 20,
    marginBottom: 15,
  },
  requestDate: {
    fontSize: 12,
    color: '#666',
    marginBottom: 15,
  },
  actionButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    flex: 1,
    marginHorizontal: 5,
    paddingVertical: 10,
    borderRadius: 8,
  },
  acceptButton: {
    backgroundColor: '#4CAF50',
  },
  declineButton: {
    backgroundColor: '#f44336',
  },
  actionButtonText: {
    color: 'white',
    fontSize: 14,
    fontWeight: '600',
    marginLeft: 5,
  },
});
