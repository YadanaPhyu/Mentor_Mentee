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

export default function MentorHomeScreen({ navigation }) {
  const { t } = useLanguage();

  // Mock data for upcoming sessions
  const upcomingSessions = [
    {
      id: '1',
      menteeName: 'Alice Johnson',
      date: 'Jul 21, 2025',
      time: '2:00 PM',
      topic: 'React Native Development',
    },
    {
      id: '2',
      menteeName: 'Bob Smith',
      date: 'Jul 22, 2025',
      time: '3:00 PM',
      topic: 'Mobile UI Design',
    },
  ];

  // Mock data for session requests
  const sessionRequests = [
    {
      id: '3',
      menteeName: 'Carol Wilson',
      topic: 'Career Guidance',
      message: 'Would like to discuss career transition to mobile development',
    },
    {
      id: '4',
      menteeName: 'David Brown',
      topic: 'Code Review',
      message: 'Need help reviewing my React Native project',
    },
  ];

  const renderUpcomingSession = ({ item }) => (
    <TouchableOpacity
      style={styles.sessionCard}
      onPress={() => navigation.navigate('SessionDetails', { sessionId: item.id })}
    >
      <View style={styles.sessionHeader}>
        <Ionicons name="person-circle-outline" size={24} color="#667eea" />
        <Text style={styles.menteeName}>{item.menteeName}</Text>
      </View>
      <View style={styles.sessionInfo}>
        <View style={styles.infoRow}>
          <Ionicons name="calendar-outline" size={20} color="#667eea" />
          <Text style={styles.infoText}>{item.date}</Text>
        </View>
        <View style={styles.infoRow}>
          <Ionicons name="time-outline" size={20} color="#667eea" />
          <Text style={styles.infoText}>{item.time}</Text>
        </View>
        <View style={styles.infoRow}>
          <Ionicons name="book-outline" size={20} color="#667eea" />
          <Text style={styles.infoText}>{item.topic}</Text>
        </View>
      </View>
    </TouchableOpacity>
  );

  const renderSessionRequest = ({ item }) => (
    <View style={styles.requestCard}>
      <View style={styles.requestHeader}>
        <View style={styles.requestUser}>
          <Ionicons name="person-circle-outline" size={24} color="#667eea" />
          <Text style={styles.menteeName}>{item.menteeName}</Text>
        </View>
        <Text style={styles.topicLabel}>{item.topic}</Text>
      </View>
      <Text style={styles.requestMessage}>{item.message}</Text>
      <View style={styles.requestActions}>
        <TouchableOpacity
          style={[styles.actionButton, styles.acceptButton]}
          onPress={() => {
            // Handle accept request
            navigation.navigate('SessionDetails', { sessionId: item.id });
          }}
        >
          <Text style={styles.actionButtonText}>{t('accept')}</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.actionButton, styles.declineButton]}
          onPress={() => {
            // Handle decline request
          }}
        >
          <Text style={styles.actionButtonText}>{t('decline')}</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  return (
    <ScrollView style={styles.container}>
      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>{t('upcomingSessions')}</Text>
          <TouchableOpacity onPress={() => navigation.navigate('SessionHistory')}>
            <Text style={styles.viewAllText}>{t('viewAll')}</Text>
          </TouchableOpacity>
        </View>
        <FlatList
          data={upcomingSessions}
          renderItem={renderUpcomingSession}
          keyExtractor={(item) => item.id}
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.sessionsList}
        />
      </View>

      {/* Session Booking Requests Section */}
      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Session Booking Requests</Text>
          <TouchableOpacity onPress={() => navigation.navigate('SessionBookingRequests')}>
            <Text style={styles.viewAllText}>View All</Text>
          </TouchableOpacity>
        </View>
        <TouchableOpacity 
          style={styles.quickAccessCard}
          onPress={() => navigation.navigate('SessionBookingRequests')}
        >
          <View style={styles.quickAccessContent}>
            <Ionicons name="calendar-outline" size={32} color="#667eea" />
            <View style={styles.quickAccessText}>
              <Text style={styles.quickAccessTitle}>Manage Session Requests</Text>
              <Text style={styles.quickAccessSubtitle}>
                Review and respond to mentee session booking requests
              </Text>
            </View>
            <Ionicons name="chevron-forward" size={24} color="#667eea" />
          </View>
        </TouchableOpacity>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>{t('pendingRequests')}</Text>
        {sessionRequests.map((request) => (
          <View key={request.id}>
            {renderSessionRequest({ item: request })}
          </View>
        ))}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  section: {
    padding: 16,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
  },
  viewAllText: {
    color: '#667eea',
    fontSize: 14,
    fontWeight: '600',
  },
  sessionsList: {
    paddingRight: 16,
  },
  sessionCard: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 16,
    marginRight: 12,
    width: 280,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  sessionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  menteeName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginLeft: 8,
  },
  sessionInfo: {
    marginTop: 4,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  infoText: {
    marginLeft: 8,
    color: '#666',
    fontSize: 14,
  },
  requestCard: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  requestHeader: {
    marginBottom: 12,
  },
  requestUser: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  topicLabel: {
    color: '#667eea',
    fontSize: 14,
    fontWeight: '500',
  },
  requestMessage: {
    color: '#666',
    fontSize: 14,
    marginBottom: 16,
  },
  requestActions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
  },
  actionButton: {
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 8,
    marginLeft: 8,
  },
  acceptButton: {
    backgroundColor: '#667eea',
  },
  declineButton: {
    backgroundColor: '#dc3545',
  },
  actionButtonText: {
    color: 'white',
    fontWeight: '600',
  },
  quickAccessCard: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  quickAccessContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  quickAccessText: {
    flex: 1,
    marginLeft: 12,
  },
  quickAccessTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 4,
  },
  quickAccessSubtitle: {
    fontSize: 14,
    color: '#666',
    lineHeight: 18,
  },
});
