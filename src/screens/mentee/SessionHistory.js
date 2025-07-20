import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  FlatList,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useLanguage } from '../../context/LanguageContext';

export default function SessionHistory({ navigation }) {
  const { t } = useLanguage();

  // Mock session history data - in a real app, this would come from an API
  const sessions = [
    {
      id: '1',
      mentorName: 'John Doe',
      date: 'Jul 21, 2025',
      time: '2:00 PM',
      duration: '60 minutes',
      status: 'upcoming',
      topic: 'React Native Development',
    },
    {
      id: '2',
      mentorName: 'Jane Smith',
      date: 'Jul 19, 2025',
      time: '3:00 PM',
      duration: '60 minutes',
      status: 'completed',
      topic: 'Mobile UI Design',
    },
    {
      id: '3',
      mentorName: 'Mike Johnson',
      date: 'Jul 15, 2025',
      time: '11:00 AM',
      duration: '30 minutes',
      status: 'completed',
      topic: 'Career Guidance',
    },
  ];

  const getStatusColor = (status) => {
    switch (status) {
      case 'upcoming':
        return '#667eea';
      case 'completed':
        return '#4CAF50';
      case 'cancelled':
        return '#F44336';
      default:
        return '#999';
    }
  };

  const renderSession = ({ item }) => (
    <TouchableOpacity
      style={styles.sessionCard}
      onPress={() => navigation.navigate('MentorshipProgress', { sessionId: item.id })}
    >
      <View style={styles.cardHeader}>
        <View style={styles.mentorInfo}>
          <Ionicons name="person-circle-outline" size={24} color="#667eea" />
          <Text style={styles.mentorName}>{item.mentorName}</Text>
        </View>
        <View style={[styles.statusBadge, { backgroundColor: getStatusColor(item.status) }]}>
          <Text style={styles.statusText}>{t(item.status)}</Text>
        </View>
      </View>

      <View style={styles.sessionDetails}>
        <View style={styles.detailRow}>
          <Ionicons name="calendar-outline" size={20} color="#667eea" />
          <Text style={styles.detailText}>{item.date}</Text>
        </View>
        <View style={styles.detailRow}>
          <Ionicons name="time-outline" size={20} color="#667eea" />
          <Text style={styles.detailText}>{item.time}</Text>
        </View>
        <View style={styles.detailRow}>
          <Ionicons name="book-outline" size={20} color="#667eea" />
          <Text style={styles.detailText}>{item.topic}</Text>
        </View>
      </View>

      {item.status === 'upcoming' && (
        <View style={styles.actionButtons}>
          <TouchableOpacity
            style={[styles.actionButton, styles.messageButton]}
            onPress={() => navigation.navigate('Messages')}
          >
            <Ionicons name="chatbubbles-outline" size={20} color="white" />
            <Text style={styles.actionButtonText}>{t('message')}</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.actionButton, styles.cancelButton]}
            onPress={() => {
              // Handle cancellation
            }}
          >
            <Ionicons name="close-circle-outline" size={20} color="white" />
            <Text style={styles.actionButtonText}>{t('cancel')}</Text>
          </TouchableOpacity>
        </View>
      )}
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <FlatList
        data={sessions}
        renderItem={renderSession}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContainer}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  listContainer: {
    padding: 16,
  },
  sessionCard: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  mentorInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  mentorName: {
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
    color: '#333',
  },
  statusBadge: {
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 16,
  },
  statusText: {
    color: 'white',
    fontSize: 12,
    fontWeight: '600',
  },
  sessionDetails: {
    marginBottom: 12,
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  detailText: {
    marginLeft: 8,
    fontSize: 14,
    color: '#666',
  },
  actionButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 8,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 8,
    flex: 0.48,
  },
  messageButton: {
    backgroundColor: '#667eea',
  },
  cancelButton: {
    backgroundColor: '#dc3545',
  },
  actionButtonText: {
    color: 'white',
    marginLeft: 4,
    fontSize: 14,
    fontWeight: '500',
  },
});
