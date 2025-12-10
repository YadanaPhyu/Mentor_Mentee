import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  RefreshControl,
  Alert,
  Linking,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../../context/AuthContext';
import { useLanguage } from '../../context/LanguageContext';

export default function UpcomingSessions({ navigation }) {
  const { API_URL, fetchWithTimeout, user } = useAuth();
  const { t } = useLanguage();
  
  const [sessions, setSessions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState(null);

  // Format session date and time from database format
  const formatSessionDateTime = (dateStr, timeStr) => {
    if (!dateStr) return 'Unknown';
    
    try {
      let fullDateTime;
      if (timeStr) {
        fullDateTime = `${dateStr} ${timeStr}`;
      } else {
        fullDateTime = dateStr;
      }
      const date = new Date(fullDateTime);
      if (isNaN(date.getTime())) {
        return `${dateStr} ${timeStr || ''}`;
      }
      return new Intl.DateTimeFormat('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
      }).format(date);
    } catch (e) {
      return `${dateStr} ${timeStr || ''}`;
    }
  };

  // Format time for display (HH:mm:ss to 12-hour or pass through if already formatted)
  const formatTime = (timeStr) => {
    if (!timeStr) return '';
    // If already in 12-hour format (e.g., "12:00 PM"), return as-is
    if (/AM|PM/i.test(timeStr)) return timeStr;
    // Otherwise, convert from 24-hour format
    const match = timeStr.match(/^(\d{1,2}):(\d{2})(?::(\d{2}))?$/);
    if (!match) return timeStr;
    let h = parseInt(match[1], 10);
    const m = match[2];
    const suffix = h >= 12 ? 'PM' : 'AM';
    h = ((h + 11) % 12) + 1;
    return `${h}:${m} ${suffix}`;
  };

  // Fetch upcoming sessions
  const fetchSessions = async () => {
    try {
      setError(null);
      
      const menteeId = user?.id;
      
      if (!menteeId) {
        throw new Error('User ID not available. Please login again.');
      }
      
      console.log(`Fetching sessions for mentee ${menteeId}`);
      
      const response = await fetchWithTimeout(
        `${API_URL}/api/sessions/user/${menteeId}?role=mentee`
      );
      
      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(errorText || `Failed to fetch sessions: ${response.status}`);
      }
      
      const data = await response.json();
      console.log('Sessions data:', data);
      
      // Filter for approved sessions and format data
      const formattedSessions = data
        .filter(session => session.status === 'approved')
        .map(session => ({
          id: session.id,
          mentor: {
            id: session.mentor_id,
            name: session.mentor_name || 'Unknown Mentor',
            title: session.mentor_title || '',
            email: session.mentor_email || '',
          },
          date: formatSessionDateTime(session.session_date, session.session_time),
          time: formatTime(session.session_time),
          duration: session.duration_minutes || 60,
          topic: session.topic || 'General mentoring session',
          fee: session.fee_amount || 0,
          status: session.status,
          meetingUrl: session.meeting_url,
          meetingProvider: session.meeting_provider || 'jitsi',
          notes: session.notes || '',
          createdAt: session.created_at,
          approvedAt: session.updated_at,
        }))
        .sort((a, b) => new Date(a.date) - new Date(b.date)); // Sort by date
      
      setSessions(formattedSessions);
      return true;
    } catch (err) {
      console.error('Error fetching sessions:', err);
      setError(err.message);
      return false;
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    setLoading(true);
    fetchSessions();
    
    // Set up refresh interval
    const refreshInterval = setInterval(fetchSessions, 60000);
    
    return () => clearInterval(refreshInterval);
  }, [API_URL, fetchWithTimeout, user]);

  // Handle pull-to-refresh
  const onRefresh = async () => {
    setRefreshing(true);
    await fetchSessions();
  };

  // Join meeting
  const handleJoinMeeting = async (session) => {
    if (!session.meetingUrl) {
      Alert.alert('No Meeting Link', 'Meeting link is not available yet.');
      return;
    }

    try {
      const supported = await Linking.canOpenURL(session.meetingUrl);
      if (supported) {
        await Linking.openURL(session.meetingUrl);
      } else {
        Alert.alert('Error', 'Unable to open the meeting link.');
      }
    } catch (error) {
      console.error('Error opening meeting link:', error);
      Alert.alert('Error', 'Failed to open the meeting link.');
    }
  };

  // View session details
  const handleViewDetails = (session) => {
    navigation.navigate('MenteeSessionDetails', { sessionId: session.id });
  };

  // Cancel session
  const handleCancelSession = (session) => {
    Alert.alert(
      'Cancel Session',
      'Are you sure you want to cancel this session?',
      [
        { text: 'No', style: 'cancel' },
        {
          text: 'Yes, Cancel',
          style: 'destructive',
          onPress: async () => {
            try {
              const response = await fetchWithTimeout(
                `${API_URL}/api/sessions/${session.id}/status`,
                {
                  method: 'PUT',
                  headers: { 'Content-Type': 'application/json' },
                  body: JSON.stringify({ 
                    status: 'cancelled',
                    userId: user?.id,
                    userRole: 'mentee'
                  }),
                }
              );

              if (!response.ok) {
                throw new Error('Failed to cancel session');
              }

              Alert.alert('Success', 'Session cancelled successfully');
              fetchSessions();
            } catch (error) {
              console.error('Error cancelling session:', error);
              Alert.alert('Error', 'Failed to cancel session. Please try again.');
            }
          },
        },
      ]
    );
  };

  if (loading && sessions.length === 0) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color="#667eea" />
        <Text style={styles.loadingText}>Loading sessions...</Text>
      </View>
    );
  }

  return (
    <ScrollView
      style={styles.container}
      refreshControl={
        <RefreshControl
          refreshing={refreshing}
          onRefresh={onRefresh}
          colors={['#667eea']}
        />
      }
    >
      {error && (
        <View style={styles.errorBanner}>
          <Ionicons name="warning" size={18} color="#fff" />
          <Text style={styles.errorBannerText}>{error}</Text>
        </View>
      )}

      <View style={styles.header}>
        <Text style={styles.title}>Upcoming Sessions</Text>
        <Text style={styles.subtitle}>
          {sessions.length} {sessions.length === 1 ? 'session' : 'sessions'} scheduled
        </Text>
      </View>

      {sessions.length === 0 && !loading && (
        <View style={styles.emptyState}>
          <Ionicons name="calendar-outline" size={80} color="#ccc" />
          <Text style={styles.emptyTitle}>No Upcoming Sessions</Text>
          <Text style={styles.emptySubtitle}>
            Book a session with a mentor to get started
          </Text>
          <TouchableOpacity
            style={styles.discoverButton}
            onPress={() => navigation.navigate('DiscoverMentors')}
          >
            <Ionicons name="search" size={20} color="white" />
            <Text style={styles.discoverButtonText}>Discover Mentors</Text>
          </TouchableOpacity>
        </View>
      )}

      {sessions.map((session) => (
        <View key={session.id} style={styles.sessionCard}>
          <View style={styles.cardHeader}>
            <View style={styles.mentorInfo}>
              <Ionicons name="person-circle-outline" size={50} color="#667eea" />
              <View style={styles.mentorDetails}>
                <Text style={styles.mentorName}>{session.mentor.name}</Text>
                <Text style={styles.mentorTitle}>{session.mentor.title || 'Mentor'}</Text>
              </View>
            </View>
            <View style={styles.statusBadge}>
              <Ionicons name="checkmark-circle" size={16} color="#4caf50" />
              <Text style={styles.statusText}>Approved</Text>
            </View>
          </View>

          <View style={styles.sessionInfo}>
            <View style={styles.infoRow}>
              <Ionicons name="calendar-outline" size={18} color="#666" />
              <Text style={styles.infoText}>{session.date}</Text>
            </View>
            <View style={styles.infoRow}>
              <Ionicons name="time-outline" size={18} color="#666" />
              <Text style={styles.infoText}>{session.time} • {session.duration} min</Text>
            </View>
            <View style={styles.infoRow}>
              <Ionicons name="book-outline" size={18} color="#666" />
              <Text style={styles.infoText}>{session.topic}</Text>
            </View>
            {session.meetingUrl && (
              <View style={styles.infoRow}>
                <Ionicons name="videocam" size={18} color="#4caf50" />
                <Text style={[styles.infoText, { color: '#4caf50' }]}>
                  Meeting link available
                </Text>
              </View>
            )}
          </View>

          <View style={styles.actionButtons}>
            {session.meetingUrl && (
              <TouchableOpacity
                style={[styles.actionButton, styles.joinButton]}
                onPress={() => handleJoinMeeting(session)}
              >
                <Ionicons name="videocam" size={20} color="white" />
                <Text style={styles.actionButtonText}>Join Meeting</Text>
              </TouchableOpacity>
            )}
            <TouchableOpacity
              style={[styles.actionButton, styles.detailsButton]}
              onPress={() => handleViewDetails(session)}
            >
              <Ionicons name="information-circle-outline" size={20} color="#667eea" />
              <Text style={[styles.actionButtonText, { color: '#667eea' }]}>Details</Text>
            </TouchableOpacity>
          </View>

          <TouchableOpacity
            style={styles.cancelButton}
            onPress={() => handleCancelSession(session)}
          >
            <Text style={styles.cancelButtonText}>Cancel Session</Text>
          </TouchableOpacity>
        </View>
      ))}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f5f5f5',
  },
  loadingText: {
    marginTop: 10,
    color: '#667eea',
    fontSize: 16,
  },
  errorBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f44336',
    padding: 12,
    marginBottom: 10,
  },
  errorBannerText: {
    color: 'white',
    marginLeft: 8,
    flex: 1,
  },
  header: {
    padding: 16,
    backgroundColor: 'white',
    marginBottom: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
  },
  subtitle: {
    fontSize: 16,
    color: '#666',
    marginTop: 4,
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 40,
    marginTop: 50,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
    marginTop: 16,
    marginBottom: 8,
  },
  emptySubtitle: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    paddingHorizontal: 20,
    marginBottom: 20,
  },
  discoverButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#667eea',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
    gap: 8,
  },
  discoverButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  sessionCard: {
    backgroundColor: 'white',
    borderRadius: 12,
    margin: 16,
    marginBottom: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
    borderLeftWidth: 4,
    borderLeftColor: '#4caf50',
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  mentorInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  mentorDetails: {
    marginLeft: 12,
    flex: 1,
  },
  mentorName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  mentorTitle: {
    fontSize: 14,
    color: '#666',
    marginTop: 2,
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#e8f5e9',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 12,
    gap: 4,
  },
  statusText: {
    color: '#4caf50',
    fontSize: 12,
    fontWeight: 'bold',
  },
  sessionInfo: {
    padding: 16,
    backgroundColor: '#f9f9f9',
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
    gap: 8,
  },
  infoText: {
    fontSize: 14,
    color: '#333',
    flex: 1,
  },
  actionButtons: {
    flexDirection: 'row',
    padding: 16,
    gap: 12,
  },
  actionButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    borderRadius: 8,
    gap: 6,
  },
  joinButton: {
    backgroundColor: '#4caf50',
  },
  detailsButton: {
    backgroundColor: 'white',
    borderWidth: 1,
    borderColor: '#667eea',
  },
  actionButtonText: {
    color: 'white',
    fontSize: 14,
    fontWeight: '600',
  },
  cancelButton: {
    padding: 12,
    borderTopWidth: 1,
    borderTopColor: '#f0f0f0',
    alignItems: 'center',
  },
  cancelButtonText: {
    color: '#f44336',
    fontSize: 14,
    fontWeight: '500',
  },
});
