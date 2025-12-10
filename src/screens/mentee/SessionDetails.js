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
  TextInput,
  Modal,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../../context/AuthContext';

export default function SessionDetails({ route, navigation }) {
  const { sessionId } = route.params;
  const { API_URL, fetchWithTimeout, user } = useAuth();
  
  const [session, setSession] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showReviewModal, setShowReviewModal] = useState(false);
  const [review, setReview] = useState({ rating: 0, comment: '' });
  const [reviewed, setReviewed] = useState(false);

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

        // Helper to format time
        const formatTimeDisplay = (timeStr) => {
          if (!timeStr) return '';
          if (/AM|PM/i.test(timeStr)) return timeStr;
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
            email: sessionData.mentor_email || '',
          },
          mentee: {
            id: sessionData.mentee_id,
            name: sessionData.mentee_name || 'Unknown Mentee',
          },
          createdAt: sessionData.created_at,
          updatedAt: sessionData.updated_at,
          meetingUrl: sessionData.meeting_url,
          meetingProvider: sessionData.meeting_provider,
          notes: sessionData.notes || '',
        };
        
        setSession(formattedSession);
        
        // Check if the session has already been reviewed
        if (sessionData.status === 'completed' && user?.id) {
          try {
            const reviewRes = await fetchWithTimeout(
              `${API_URL}/api/sessions/${sessionId}/review?menteeId=${user.id}`
            );
            if (reviewRes.ok) {
              const reviewData = await reviewRes.json();
              if (reviewData && reviewData.rating) {
                setReviewed(true);
              }
            }
          } catch (reviewErr) {
            // Ignore error - review doesn't exist yet
            console.log('No existing review found');
          }
        }
      } catch (err) {
        console.error('Error fetching session details:', err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    
    fetchSessionDetails();
  }, [API_URL, fetchWithTimeout, sessionId, user]);
  
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
      case 'pending_approval':
      case 'pending_mentor_approval':
        return '#ff9800';
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
      case 'pending_approval':
      case 'pending_mentor_approval':
        return 'Pending Approval';
      case 'approved': return 'Approved';
      case 'rejected': return 'Rejected';
      case 'completed': return 'Completed';
      case 'completed-pending': return 'Completion Pending';
      case 'cancelled': return 'Cancelled';
      default: return 'Unknown';
    }
  };

  const handleJoinMeeting = async () => {
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

  const handleShareMeetingLink = async () => {
    if (!session.meetingUrl) {
      Alert.alert('No Meeting Link', 'Meeting link is not available yet.');
      return;
    }

    try {
      await Share.share({
        message: `Join my mentoring session: ${session.meetingUrl}`,
        title: 'Mentoring Session',
      });
    } catch (error) {
      console.error('Error sharing meeting link:', error);
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

              Alert.alert('Success', 'Session cancelled successfully', [
                { text: 'OK', onPress: () => navigation.goBack() }
              ]);
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
    console.log('handleCompleteSession called for session:', session?.id);
    console.log('User info:', { id: user?.id, role: user?.role, userType: user?.userType });
    console.log('Current session status:', session?.status);
    
    // If session is already pending completion by the other party, this is the final confirmation
    if (session?.status === 'completed-pending') {
      const confirmed = window.confirm('The other party has marked this session as complete. Do you confirm this session is completed?');
      console.log('Final confirmation:', confirmed);
      
      if (confirmed) {
        try {
          const requestBody = { 
            status: 'completed',
            userId: user?.id,
            userRole: user?.role || user?.userType || 'mentee'
          };
          console.log('Request body:', JSON.stringify(requestBody));
          console.log('Sending final completion request to:', `${API_URL}/api/sessions/${session.id}/status`);
          
          const response = await fetchWithTimeout(
            `${API_URL}/api/sessions/${session.id}/status`,
            {
              method: 'PUT',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify(requestBody),
            }
          );
          
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
          
          Alert.alert('Session Completed', 'The session has been marked as completed. You can now leave a review!');
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
          const requestBody = { 
            status: 'completed-pending',
            userId: user?.id,
            userRole: user?.role || user?.userType || 'mentee'
          };
          console.log('Request body:', JSON.stringify(requestBody));
          console.log('Sending completion request to:', `${API_URL}/api/sessions/${session.id}/status`);
          
          const response = await fetchWithTimeout(
            `${API_URL}/api/sessions/${session.id}/status`,
            {
              method: 'PUT',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify(requestBody),
            }
          );
          
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
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color="#667eea" />
        <Text style={styles.loadingText}>Loading session details...</Text>
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.centerContainer}>
        <Ionicons name="alert-circle" size={64} color="#f44336" />
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
      <View style={styles.centerContainer}>
        <Text style={styles.errorText}>Session not found</Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <View style={[styles.statusBadge, { backgroundColor: getStatusBadgeColor(session.status) }]}>
          <Text style={styles.statusText}>{getStatusText(session.status)}</Text>
        </View>
      </View>

      {/* Mentor Info */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Mentor</Text>
        <View style={styles.mentorCard}>
          <Ionicons name="person-circle" size={60} color="#667eea" />
          <View style={styles.mentorInfo}>
            <Text style={styles.mentorName}>{session.mentor.name}</Text>
            <Text style={styles.mentorEmail}>{session.mentor.email}</Text>
          </View>
        </View>
      </View>

      {/* Session Details */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Session Details</Text>
        <View style={styles.detailsCard}>
          <View style={styles.detailRow}>
            <Ionicons name="calendar-outline" size={20} color="#666" />
            <View style={styles.detailContent}>
              <Text style={styles.detailLabel}>Date</Text>
              <Text style={styles.detailValue}>{session.date}</Text>
            </View>
          </View>

          <View style={styles.detailRow}>
            <Ionicons name="time-outline" size={20} color="#666" />
            <View style={styles.detailContent}>
              <Text style={styles.detailLabel}>Time</Text>
              <Text style={styles.detailValue}>{session.time}</Text>
            </View>
          </View>

          <View style={styles.detailRow}>
            <Ionicons name="hourglass-outline" size={20} color="#666" />
            <View style={styles.detailContent}>
              <Text style={styles.detailLabel}>Duration</Text>
              <Text style={styles.detailValue}>{session.duration} minutes</Text>
            </View>
          </View>

          <View style={styles.detailRow}>
            <Ionicons name="book-outline" size={20} color="#666" />
            <View style={styles.detailContent}>
              <Text style={styles.detailLabel}>Topic</Text>
              <Text style={styles.detailValue}>{session.topic}</Text>
            </View>
          </View>

          {session.fee > 0 && (
            <View style={styles.detailRow}>
              <Ionicons name="cash-outline" size={20} color="#666" />
              <View style={styles.detailContent}>
                <Text style={styles.detailLabel}>Fee</Text>
                <Text style={styles.detailValue}>{session.fee} MMK</Text>
              </View>
            </View>
          )}
        </View>
      </View>

      {/* Meeting Link */}
      {session.meetingUrl && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Meeting</Text>
          <View style={styles.meetingCard}>
            <Ionicons name="videocam" size={24} color={session.status === 'completed' ? '#999' : '#4caf50'} />
            <Text style={[styles.meetingText, session.status === 'completed' && {color: '#999'}]}>
              {session.status === 'completed' ? 'Session completed' : 'Meeting link is ready'}
            </Text>
          </View>
          
          <TouchableOpacity
            style={[styles.joinButton, session.status === 'completed' && styles.disabledButton]}
            onPress={session.status === 'completed' ? null : handleJoinMeeting}
            disabled={session.status === 'completed'}
          >
            <Ionicons name="videocam" size={20} color={session.status === 'completed' ? '#999' : 'white'} />
            <Text style={[styles.joinButtonText, session.status === 'completed' && styles.disabledButtonText]}>Join Meeting</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.shareButton, session.status === 'completed' && styles.disabledButton]}
            onPress={session.status === 'completed' ? null : handleShareMeetingLink}
            disabled={session.status === 'completed'}
          >
            <Ionicons name="share-outline" size={20} color={session.status === 'completed' ? '#999' : '#667eea'} />
            <Text style={[styles.shareButtonText, session.status === 'completed' && styles.disabledButtonText]}>Share Meeting Link</Text>
          </TouchableOpacity>
        </View>
      )}

      {/* Notes */}
      {session.notes && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Notes</Text>
          <View style={styles.notesCard}>
            <Text style={styles.notesText}>{session.notes}</Text>
          </View>
        </View>
      )}

      {/* Booking Info */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Booking Information</Text>
        <View style={styles.infoCard}>
          <Text style={styles.infoText}>Requested: {formatDate(session.createdAt)}</Text>
          {session.status === 'approved' && (
            <Text style={styles.infoText}>Approved: {formatDate(session.updatedAt)}</Text>
          )}
        </View>
      </View>

      {/* Mark as Completed Button */}
      {(session.status === 'approved' || session.status === 'completed-pending') && (
        <TouchableOpacity
          style={styles.completeButton}
          onPress={() => {
            console.log('Complete button pressed!');
            handleCompleteSession();
          }}
          activeOpacity={0.7}
        >
          <Ionicons name="checkmark-circle" size={20} color="white" />
          <Text style={styles.completeButtonText}>
            {session.status === 'completed-pending' ? 'Confirm Completion' : 'Mark as Completed'}
          </Text>
        </TouchableOpacity>
      )}

      {/* Cancel Button */}
      {(session.status === 'approved' || session.status === 'pending_approval' || session.status === 'pending_mentor_approval') && (
        <TouchableOpacity
          style={[styles.cancelButton, session.status === 'completed' && styles.disabledButton]}
          onPress={session.status === 'completed' ? null : handleCancelSession}
          disabled={session.status === 'completed'}
        >
          <Ionicons name="close-circle-outline" size={20} color={session.status === 'completed' ? '#999' : '#f44336'} />
          <Text style={[styles.cancelButtonText, session.status === 'completed' && styles.disabledButtonText]}>Cancel Session</Text>
        </TouchableOpacity>
      )}

      {/* Review Button for completed session */}
      {session && session.status === 'completed' && user?.userType === 'mentee' && !reviewed && (
        <TouchableOpacity
          style={styles.reviewButton}
          onPress={() => setShowReviewModal(true)}
        >
          <Ionicons name="star" size={20} color="#FFD700" />
          <Text style={styles.reviewButtonText}>Leave a Review</Text>
        </TouchableOpacity>
      )}
      {reviewed && (
        <View style={styles.reviewedBadge}>
          <Ionicons name="checkmark-circle" size={18} color="#4CAF50" />
          <Text style={styles.reviewedText}>Reviewed</Text>
        </View>
      )}

      {/* Review Modal */}
      <Modal
        visible={showReviewModal}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setShowReviewModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Leave a Review</Text>
            <View style={styles.ratingRow}>
              {[1,2,3,4,5].map((star, index) => (
                <TouchableOpacity 
                  key={star} 
                  onPress={() => setReview(r => ({...r, rating: star}))}
                  style={{ marginHorizontal: 4 }}
                >
                  <Ionicons name={review.rating >= star ? "star" : "star-outline"} size={32} color="#FFD700" />
                </TouchableOpacity>
              ))}
            </View>
            <TextInput
              style={styles.commentInput}
              placeholder="Write your feedback..."
              value={review.comment}
              onChangeText={text => setReview(r => ({...r, comment: text}))}
              multiline
            />
            <View style={styles.modalActions}>
              <TouchableOpacity style={styles.cancelBtn} onPress={() => setShowReviewModal(false)}>
                <Text style={{color:'#667eea'}}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.submitBtn}
                onPress={async () => {
                  if (!review.rating) { Alert.alert('Please select a rating'); return; }
                  try {
                    const res = await fetchWithTimeout(`${API_URL}/api/sessions/${sessionId}/review`, {
                      method: 'POST',
                      headers: { 'Content-Type': 'application/json' },
                      body: JSON.stringify({ menteeId: user?.id, mentorId: session.mentor.id, rating: review.rating, comment: review.comment })
                    });
                    if (res.ok) {
                      setReviewed(true);
                      setShowReviewModal(false);
                      Alert.alert('Thank you!', 'Your review has been submitted.');
                    } else {
                      Alert.alert('Error', 'Failed to submit review.');
                    }
                  } catch (e) {
                    Alert.alert('Error', 'Network error.');
                  }
                }}
              >
                <Text style={{color:'white'}}>Submit</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
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
    padding: 20,
  },
  loadingText: {
    marginTop: 10,
    color: '#667eea',
    fontSize: 16,
  },
  errorTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#f44336',
    marginTop: 16,
    marginBottom: 8,
  },
  errorText: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
  },
  retryButton: {
    marginTop: 20,
    backgroundColor: '#667eea',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  retryButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  header: {
    padding: 16,
    backgroundColor: 'white',
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  statusBadge: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 16,
  },
  statusText: {
    color: 'white',
    fontSize: 14,
    fontWeight: 'bold',
  },
  section: {
    marginTop: 16,
    backgroundColor: 'white',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 12,
  },
  mentorCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    backgroundColor: '#f9f9f9',
    borderRadius: 8,
  },
  mentorInfo: {
    marginLeft: 16,
    flex: 1,
  },
  mentorName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  mentorEmail: {
    fontSize: 14,
    color: '#666',
    marginTop: 4,
  },
  detailsCard: {
    backgroundColor: '#f9f9f9',
    borderRadius: 8,
    padding: 12,
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  detailContent: {
    marginLeft: 12,
    flex: 1,
  },
  detailLabel: {
    fontSize: 12,
    color: '#999',
    marginBottom: 2,
  },
  detailValue: {
    fontSize: 16,
    color: '#333',
    fontWeight: '500',
  },
  meetingCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    backgroundColor: '#e8f5e9',
    borderRadius: 8,
    marginBottom: 12,
  },
  meetingText: {
    marginLeft: 12,
    fontSize: 16,
    color: '#4caf50',
    fontWeight: '500',
  },
  joinButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#4caf50',
    paddingVertical: 14,
    borderRadius: 8,
    marginBottom: 12,
  },
  joinButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
    marginLeft: 8,
  },
  shareButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'white',
    borderWidth: 1,
    borderColor: '#667eea',
    paddingVertical: 12,
    borderRadius: 8,
  },
  shareButtonText: {
    color: '#667eea',
    fontSize: 14,
    fontWeight: '600',
    marginLeft: 8,
  },
  notesCard: {
    backgroundColor: '#f9f9f9',
    borderRadius: 8,
    padding: 12,
  },
  notesText: {
    fontSize: 14,
    color: '#333',
    lineHeight: 20,
  },
  infoCard: {
    backgroundColor: '#f9f9f9',
    borderRadius: 8,
    padding: 12,
  },
  infoText: {
    fontSize: 14,
    color: '#666',
    marginBottom: 6,
  },
  completeButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    margin: 16,
    marginBottom: 8,
    padding: 14,
    backgroundColor: '#4CAF50',
    borderRadius: 8,
  },
  completeButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
  },
  cancelButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginHorizontal: 16,
    marginBottom: 16,
    padding: 14,
    backgroundColor: 'white',
    borderWidth: 1,
    borderColor: '#f44336',
    borderRadius: 8,
  },
  cancelButtonText: {
    color: '#f44336',
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
  },
  reviewButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FFF9E6',
    borderWidth: 1,
    borderColor: '#FFD700',
    paddingVertical: 14,
    borderRadius: 8,
    marginHorizontal: 16,
    marginTop: 12,
  },
  reviewButtonText: {
    color: '#333',
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
  },
  reviewedBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#E8F5E9',
    paddingVertical: 12,
    borderRadius: 8,
    marginHorizontal: 16,
    marginTop: 12,
  },
  reviewedText: {
    color: '#4CAF50',
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 6,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 24,
    width: '85%',
    maxWidth: 400,
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 20,
    color: '#333',
    textAlign: 'center',
  },
  ratingRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginBottom: 20,
  },
  commentInput: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 12,
    minHeight: 80,
    marginBottom: 20,
    fontSize: 15,
    color: '#333',
    textAlignVertical: 'top',
  },
  modalActions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
  },
  cancelBtn: {
    paddingVertical: 10,
    paddingHorizontal: 20,
    marginRight: 12,
  },
  submitBtn: {
    backgroundColor: '#667eea',
    borderRadius: 8,
    paddingVertical: 10,
    paddingHorizontal: 24,
  },
  disabledButton: {
    backgroundColor: '#e0e0e0',
    opacity: 0.6,
  },
  disabledButtonText: {
    color: '#999',
  },
});
