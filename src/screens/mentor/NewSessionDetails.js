import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  Linking,
  Share,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../../context/AuthContext';
import { useLanguage } from '../../context/LanguageContext';

export default function SessionDetails({ route, navigation }) {
  const { sessionId } = route.params;
  const { API_URL, fetchWithTimeout, user } = useAuth();
  const { t } = useLanguage();
  
  const [session, setSession] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchSessionDetails = async () => {
      try {
        setLoading(true);
        setError(null);
        
        console.log(`Fetching session details for ID: ${sessionId}`);
        
        const response = await fetchWithTimeout(`${API_URL}/api/sessions/${sessionId}`);
        
        if (!response.ok) {
          const errorText = await response.text();
          throw new Error(errorText || `Failed to fetch session details: ${response.status}`);
        }
        
        const sessionData = await response.json();
        console.log('Session details:', sessionData);
        
        // Helper to format session date/time
        const formatSessionDate = (dateStr, timeStr) => {
          try {
            const fullDateTime = timeStr ? `${dateStr} ${timeStr}` : dateStr;
            const date = new Date(fullDateTime);
            if (isNaN(date.getTime())) return dateStr;
            return new Intl.DateTimeFormat('en-US', {
              year: 'numeric',
              month: 'short',
              day: 'numeric'
            }).format(date);
          } catch (e) {
            return dateStr;
          }
        };

        // Helper to format time (HH:mm:ss to 12-hour or pass through if already formatted)
        const formatTimeDisplay = (timeStr) => {
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
        
        // Format the session data for UI
        const formattedSession = {
          id: sessionData.id,
          status: sessionData.status,
          date: formatSessionDate(sessionData.session_date, sessionData.session_time),
          time: formatTimeDisplay(sessionData.session_time),
          duration: sessionData.duration_minutes || 60,
          topic: sessionData.topic || 'General mentoring session',
          fee: sessionData.fee_amount || 0,
          mentor: {
            id: sessionData.mentor_id,
            name: sessionData.mentor_name || 'Unknown Mentor',
            title: sessionData.mentor_title || '',
          },
          mentee: {
            id: sessionData.mentee_id,
            name: sessionData.mentee_name || 'Unknown Mentee',
            title: sessionData.mentee_title || '',
          },
          createdAt: sessionData.created_at,
          updatedAt: sessionData.updated_at,
          meetingUrl: sessionData.meeting_url,
          meetingProvider: sessionData.meeting_provider,
          notes: sessionData.notes || '',
          mentorRating: sessionData.mentor_rating,
          menteeRating: sessionData.mentee_rating,
          feedbackText: sessionData.feedback_text,
        };
        
        setSession(formattedSession);
      } catch (err) {
        console.error('Error fetching session details:', err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    
    fetchSessionDetails();
  }, [API_URL, fetchWithTimeout, sessionId]);
  
  const formatDate = (dateString) => {
    if (!dateString) return 'Not available';
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return dateString;
    return new Intl.DateTimeFormat('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: 'numeric',
      minute: '2-digit',
    }).format(date);
  };
  
  const getStatusBadgeColor = (status) => {
    switch (status) {
      case 'pending_approval': return '#ff9800';
      case 'approved': return '#4caf50';
      case 'rejected': return '#f44336';
      case 'completed': return '#2196f3';
      case 'completed-pending': return '#ff6f00';
      case 'cancelled': return '#9e9e9e';
      default: return '#9e9e9e';
    }
  };
  
  const getStatusText = (status) => {
    switch (status) {
      case 'pending_approval': return 'Pending Approval';
      case 'approved': return 'Approved';
      case 'rejected': return 'Rejected';
      case 'completed': return 'Completed';
      case 'completed-pending': return 'Completion Pending';
      case 'cancelled': return 'Cancelled';
      default: return 'Unknown';
    }
  };

  const handleJoinMeeting = async () => {
    if (!session?.meetingUrl) {
      Alert.alert('No Meeting Link', 'This session does not have an active meeting link yet.');
      return;
    }
    
    try {
      const canOpen = await Linking.canOpenURL(session.meetingUrl);
      
      if (canOpen) {
        await Linking.openURL(session.meetingUrl);
      } else {
        Alert.alert('Cannot Open Link', 'Unable to open the meeting link. Please copy it manually.');
      }
    } catch (error) {
      console.error('Error opening meeting link:', error);
      Alert.alert('Error', 'Failed to open meeting link.');
    }
  };
  
  const shareMeetingDetails = async () => {
    if (!session) return;
    
    try {
      const message = 
        `Mentoring Session Details:\n\n` +
        `Date: ${session.date}\n` +
        `Time: ${session.time}\n` +
        `Duration: ${session.duration} minutes\n` +
        `Topic: ${session.topic}\n` +
        `${user?.role === 'mentor' ? 'Mentee' : 'Mentor'}: ${user?.role === 'mentor' ? session.mentee.name : session.mentor.name}\n` +
        `${session.meetingUrl ? `\nMeeting Link: ${session.meetingUrl}` : ''}`;
      
      await Share.share({
        message,
        title: 'Mentoring Session Details',
      });
    } catch (error) {
      console.error('Error sharing session details:', error);
      Alert.alert('Error', 'Failed to share session details.');
    }
  };
  
  const handleCancelSession = () => {
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
              const response = await fetchWithTimeout(`${API_URL}/api/sessions/${sessionId}/status`, {
                method: 'PUT',
                headers: {
                  'Content-Type': 'application/json',
                },
                body: JSON.stringify({ 
                  status: 'cancelled',
                  userId: user?.id,
                  userRole: user?.role
                }),
              });
              
              if (!response.ok) {
                const errorText = await response.text();
                throw new Error(errorText || `Failed to cancel session: ${response.status}`);
              }
              
              const updatedSession = await response.json();
              setSession(prevSession => ({ 
                ...prevSession, 
                status: 'cancelled' 
              }));
              
              Alert.alert('Session Cancelled', 'The session has been cancelled successfully.');
            } catch (error) {
              console.error('Error cancelling session:', error);
              Alert.alert('Error', 'Failed to cancel session. Please try again.');
            }
          },
        },
      ]
    );
  };
  
  const handleCompleteSession = async () => {
    console.log('handleCompleteSession called for session:', sessionId);
    console.log('User info:', { id: user?.id, role: user?.role });
    console.log('Current session status:', session?.status);
    
    // If session is already pending completion by the other party, this is the final confirmation
    if (session?.status === 'completed-pending') {
      const confirmed = window.confirm('The other party has marked this session as complete. Do you confirm this session is completed?');
      console.log('Final confirmation:', confirmed);
      
      if (confirmed) {
        try {
          console.log('Sending final completion request to:', `${API_URL}/api/sessions/${sessionId}/status`);
          
          const response = await fetchWithTimeout(`${API_URL}/api/sessions/${sessionId}/status`, {
            method: 'PUT',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({ 
              status: 'completed',
              userId: user?.id,
              userRole: user?.role
            }),
          });
          
          console.log('Response status:', response.status);
          
          if (!response.ok) {
            const errorText = await response.text();
            console.error('Error response:', errorText);
            throw new Error(errorText || `Failed to complete session: ${response.status}`);
          }
          
          const updatedSession = await response.json();
          console.log('Session completed successfully:', updatedSession);
          
          setSession(prevSession => ({ 
            ...prevSession, 
            status: 'completed' 
          }));
          
          Alert.alert('Session Completed', 'The session has been marked as completed.');
        } catch (error) {
          console.error('Error completing session:', error);
          Alert.alert('Error', `Failed to complete session: ${error.message}`);
        }
      }
    } else {
      // First person marks as complete - status becomes 'completed-pending'
      const confirmed = window.confirm('Are you sure you want to mark this session as complete? The other party will need to confirm.');
      console.log('Initial confirmation:', confirmed);
      
      if (confirmed) {
        try {
          console.log('Sending completion request to:', `${API_URL}/api/sessions/${sessionId}/status`);
          
          const response = await fetchWithTimeout(`${API_URL}/api/sessions/${sessionId}/status`, {
            method: 'PUT',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({ 
              status: 'completed-pending',
              userId: user?.id,
              userRole: user?.role
            }),
          });
          
          console.log('Response status:', response.status);
          
          if (!response.ok) {
            const errorText = await response.text();
            console.error('Error response:', errorText);
            throw new Error(errorText || `Failed to mark session: ${response.status}`);
          }
          
          const updatedSession = await response.json();
          console.log('Session marked as pending completion:', updatedSession);
          
          setSession(prevSession => ({ 
            ...prevSession, 
            status: 'completed-pending' 
          }));
          
          Alert.alert('Pending Confirmation', 'Your session completion has been submitted. Waiting for the other party to confirm.');
        } catch (error) {
          console.error('Error marking session:', error);
          Alert.alert('Error', `Failed to mark session: ${error.message}`);
        }
      }
    }
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#667eea" />
        <Text style={styles.loadingText}>Loading session details...</Text>
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.errorContainer}>
        <Ionicons name="alert-circle" size={60} color="#f44336" />
        <Text style={styles.errorTitle}>Error Loading Session</Text>
        <Text style={styles.errorText}>{error}</Text>
        <TouchableOpacity
          style={styles.retryButton}
          onPress={() => navigation.goBack()}
        >
          <Text style={styles.retryButtonText}>Go Back</Text>
        </TouchableOpacity>
      </View>
    );
  }

  if (!session) {
    return (
      <View style={styles.errorContainer}>
        <Ionicons name="alert-circle" size={60} color="#f44336" />
        <Text style={styles.errorTitle}>Session Not Found</Text>
        <TouchableOpacity
          style={styles.retryButton}
          onPress={() => navigation.goBack()}
        >
          <Text style={styles.retryButtonText}>Go Back</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      {/* Header with session status */}
      <View style={styles.header}>
        <View style={styles.sessionStatusContainer}>
          <View style={[styles.statusBadge, { backgroundColor: getStatusBadgeColor(session.status) }]}>
            <Text style={styles.statusText}>{getStatusText(session.status)}</Text>
          </View>
        </View>
        
        <Text style={styles.sessionTitle}>{session.topic}</Text>
        
        <View style={styles.dateTimeContainer}>
          <Ionicons name="calendar-outline" size={20} color="#667eea" />
          <Text style={styles.dateTimeText}>{session.date} at {session.time}</Text>
        </View>
        
        <View style={styles.durationContainer}>
          <Ionicons name="time-outline" size={20} color="#667eea" />
          <Text style={styles.durationText}>{session.duration} minutes</Text>
        </View>
      </View>

      {/* Video call button for active sessions */}
      {session.meetingUrl && (
        <TouchableOpacity 
          style={[styles.joinMeetingButton, session.status === 'completed' && styles.disabledButton]}
          onPress={session.status === 'completed' ? null : handleJoinMeeting}
          disabled={session.status === 'completed'}
        >
          <Ionicons name="videocam" size={24} color={session.status === 'completed' ? '#999' : 'white'} />
          <Text style={[styles.joinMeetingText, session.status === 'completed' && styles.disabledButtonText]}>Join Video Meeting</Text>
        </TouchableOpacity>
      )}

      {/* Participants section */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Participants</Text>
        
        <View style={styles.participantCard}>
          <View style={styles.participantHeader}>
            <Ionicons name="person-circle-outline" size={36} color="#667eea" />
            <View style={styles.participantInfo}>
              <Text style={styles.participantName}>{session.mentor.name}</Text>
              <View style={styles.roleBadge}>
                <Text style={styles.roleText}>Mentor</Text>
              </View>
            </View>
          </View>
          {session.mentor.title && (
            <Text style={styles.participantTitle}>{session.mentor.title}</Text>
          )}
        </View>
        
        <View style={styles.participantCard}>
          <View style={styles.participantHeader}>
            <Ionicons name="person-circle-outline" size={36} color="#667eea" />
            <View style={styles.participantInfo}>
              <Text style={styles.participantName}>{session.mentee.name}</Text>
              <View style={[styles.roleBadge, styles.menteeBadge]}>
                <Text style={styles.roleText}>Mentee</Text>
              </View>
            </View>
          </View>
          {session.mentee.title && (
            <Text style={styles.participantTitle}>{session.mentee.title}</Text>
          )}
        </View>
      </View>

      {/* Session info section */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Session Information</Text>
        
        <View style={styles.infoRow}>
          <Text style={styles.infoLabel}>Status</Text>
          <View style={[styles.statusBadge, { backgroundColor: getStatusBadgeColor(session.status) }]}>
            <Text style={styles.statusText}>{getStatusText(session.status)}</Text>
          </View>
        </View>
        
        <View style={styles.infoRow}>
          <Text style={styles.infoLabel}>Created</Text>
          <Text style={styles.infoValue}>{formatDate(session.createdAt)}</Text>
        </View>
        
        {session.status !== 'pending_approval' && (
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Last Updated</Text>
            <Text style={styles.infoValue}>{formatDate(session.updatedAt)}</Text>
          </View>
        )}
        
        {session.fee > 0 && (
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Session Fee</Text>
            <Text style={styles.infoValue}>{session.fee} MMK</Text>
          </View>
        )}
      </View>
      
      {/* Feedback section for completed sessions */}
      {session.status === 'completed' && session.feedbackText && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Feedback</Text>
          
          <View style={styles.feedbackCard}>
            {(session.mentorRating || session.menteeRating) && (
              <View style={styles.ratingContainer}>
                <Text style={styles.ratingLabel}>Rating:</Text>
                <View style={styles.starsContainer}>
                  {[1, 2, 3, 4, 5].map((star) => (
                    <Ionicons
                      key={star}
                      name={star <= (user?.role === 'mentor' ? session.menteeRating : session.mentorRating) ? 'star' : 'star-outline'}
                      size={20}
                      color="#ffc107"
                    />
                  ))}
                </View>
              </View>
            )}
            
            {session.feedbackText && (
              <View style={styles.feedbackTextContainer}>
                <Text style={styles.feedbackText}>
                  "{session.feedbackText}"
                </Text>
              </View>
            )}
          </View>
        </View>
      )}

      {/* Action buttons section */}
      <View style={styles.actionsSection}>
        {/* Share button for all sessions */}
        <TouchableOpacity style={styles.actionButton} onPress={shareMeetingDetails}>
          <Ionicons name="share-outline" size={20} color="#667eea" />
          <Text style={styles.actionButtonText}>Share Details</Text>
        </TouchableOpacity>
        
        {/* Cancel button for approved sessions */}
        {session.status === 'approved' && (
          <TouchableOpacity 
            style={[styles.actionButton, styles.cancelButton]}
            onPress={handleCancelSession}
          >
            <Ionicons name="close-circle-outline" size={20} color="white" />
            <Text style={styles.cancelButtonText}>Cancel Session</Text>
          </TouchableOpacity>
        )}
        
        {/* Complete button for approved sessions (mentor only) */}
        {(session.status === 'approved' || session.status === 'completed-pending') && user?.role === 'mentor' && (
          <TouchableOpacity 
            style={[styles.actionButton, styles.completeButton]}
            onPress={handleCompleteSession}
          >
            <Ionicons name="checkmark-circle-outline" size={20} color="white" />
            <Text style={styles.completeButtonText}>
              {session.status === 'completed-pending' ? 'Confirm Completion' : 'Mark as Complete'}
            </Text>
          </TouchableOpacity>
        )}
        
        {/* Cancel button - disabled when completed */}
        {(session.status === 'approved' || session.status === 'pending_approval') && (
          <TouchableOpacity 
            style={[styles.actionButton, styles.cancelButton, session.status === 'completed' && styles.disabledButton]}
            onPress={session.status === 'completed' ? null : handleCancelSession}
            disabled={session.status === 'completed'}
          >
            <Ionicons name="close-circle-outline" size={20} color={session.status === 'completed' ? '#999' : '#f44336'} />
            <Text style={[styles.cancelButtonText, session.status === 'completed' && styles.disabledButtonText]}>Cancel Session</Text>
          </TouchableOpacity>
        )}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  loadingText: {
    marginTop: 10,
    color: '#667eea',
    fontSize: 16,
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  errorTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginTop: 16,
    marginBottom: 8,
  },
  errorText: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    marginBottom: 24,
  },
  retryButton: {
    backgroundColor: '#667eea',
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
  },
  retryButtonText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 16,
  },
  header: {
    backgroundColor: 'white',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  sessionStatusContainer: {
    flexDirection: 'row',
    justifyContent: 'flex-start',
    marginBottom: 12,
  },
  statusBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    alignSelf: 'flex-start',
  },
  statusText: {
    color: 'white',
    fontSize: 14,
    fontWeight: 'bold',
  },
  sessionTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 16,
    color: '#333',
  },
  dateTimeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  dateTimeText: {
    fontSize: 16,
    marginLeft: 8,
    color: '#333',
  },
  durationContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  durationText: {
    fontSize: 16,
    marginLeft: 8,
    color: '#333',
  },
  joinMeetingButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#4caf50',
    margin: 16,
    padding: 16,
    borderRadius: 8,
  },
  joinMeetingText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
    marginLeft: 8,
  },
  section: {
    backgroundColor: 'white',
    margin: 16,
    marginTop: 8,
    padding: 16,
    borderRadius: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 2,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 16,
    color: '#333',
  },
  participantCard: {
    backgroundColor: '#f9f9f9',
    borderRadius: 8,
    padding: 16,
    marginBottom: 12,
  },
  participantHeader: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  participantInfo: {
    marginLeft: 12,
    flex: 1,
  },
  participantName: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  roleBadge: {
    backgroundColor: '#667eea',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 12,
    alignSelf: 'flex-start',
  },
  menteeBadge: {
    backgroundColor: '#ff9800',
  },
  roleText: {
    color: 'white',
    fontSize: 12,
    fontWeight: 'bold',
  },
  participantTitle: {
    marginTop: 8,
    fontSize: 14,
    color: '#666',
    fontStyle: 'italic',
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  infoLabel: {
    fontSize: 16,
    color: '#666',
  },
  infoValue: {
    fontSize: 16,
    color: '#333',
  },
  feedbackCard: {
    backgroundColor: '#f9f9f9',
    borderRadius: 8,
    padding: 16,
  },
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  ratingLabel: {
    fontSize: 16,
    color: '#333',
    marginRight: 8,
  },
  starsContainer: {
    flexDirection: 'row',
  },
  feedbackTextContainer: {
    marginTop: 8,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: '#e0e0e0',
  },
  feedbackText: {
    fontSize: 14,
    color: '#333',
    fontStyle: 'italic',
  },
  actionsSection: {
    padding: 16,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'white',
    padding: 16,
    borderRadius: 8,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 2,
  },
  actionButtonText: {
    color: '#667eea',
    fontSize: 16,
    fontWeight: 'bold',
    marginLeft: 8,
  },
  cancelButton: {
    backgroundColor: '#f44336',
  },
  cancelButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
    marginLeft: 8,
  },
  completeButton: {
    backgroundColor: '#4caf50',
  },
  completeButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
    marginLeft: 8,
  },
  disabledButton: {
    backgroundColor: '#e0e0e0',
    opacity: 0.6,
  },
  disabledButtonText: {
    color: '#999',
  },
});
