import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  Modal,
  ActivityIndicator,
  RefreshControl,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useLanguage } from '../../context/LanguageContext';
import { useAuth } from '../../context/AuthContext';
import VideoCallService from '../../services/videoCallService';
import EmailService from '../../services/emailService';
import SessionRequestCard from '../../components/SessionRequestCard';

export default function SessionRequests({ navigation }) {
  const { t } = useLanguage();
  const { API_URL, fetchWithTimeout, user } = useAuth();
  const [selectedRequest, setSelectedRequest] = useState(null);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [processingRequest, setProcessingRequest] = useState(null);
  const [sessions, setSessions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState(null);
  
  // Filter sessions by status
  const pendingRequests = sessions.filter(s => s.status === 'pending_mentor_approval' || s.status === 'pending_approval');
  const approvedSessions = sessions.filter(s => s.status === 'approved');
  const rejectedSessions = sessions.filter(s => s.status === 'rejected');

  // Format date for display
  const formatDate = (dateString) => {
    if (!dateString) return 'Unknown';
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return dateString; // Return as-is if invalid
    return new Intl.DateTimeFormat('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: 'numeric',
      minute: '2-digit'
    }).format(date);
  };

  // Format session date and time from database format
  const formatSessionDateTime = (dateStr, timeStr) => {
    if (!dateStr) return 'Unknown';
    
    // dateStr might be in yyyy-MM-dd format from database
    // timeStr might be HH:mm:ss format
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
  
  // Fetch session data from API
  const fetchSessionData = async () => {
    try {
      setError(null);
      
      // Get mentor ID from auth context
      const mentorId = user?.id; 
      
      if (!mentorId) {
        throw new Error('User ID not available. Please login again.');
      }
      
      console.log(`Fetching sessions for mentor ${mentorId}`);
      
      const response = await fetchWithTimeout(
        `${API_URL}/api/sessions/user/${mentorId}?role=mentor`
      );
      
      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(errorText || `Failed to fetch sessions: ${response.status}`);
      }
      
      const data = await response.json();
      console.log('Sessions data:', data);
      
      // Transform API data to match our component format
      const formattedSessions = data.map(session => ({
        id: session.id,
        mentee: {
          id: session.mentee_id,
          name: session.mentee_name || 'Unknown Mentee',
          title: session.mentee_title || '',
          email: session.mentee_email || 'email@example.com',
        },
        requestedDate: formatSessionDateTime(session.session_date, session.session_time),
        requestedTime: formatTime(session.session_time),
        duration: session.duration_minutes || 60,
        topic: session.topic || 'General mentoring session',
        fee: session.fee_amount || 0, // Changed from session_fee to fee_amount
        status: session.status,
        requestedAt: session.created_at,
        confirmedAt: session.updated_at,
        additionalNotes: session.notes || '',
        hasVideoCall: !!session.meeting_url,
        videoCall: session.meeting_url ? {
          meetingUrl: session.meeting_url,
          provider: session.meeting_provider || 'jitsi'
        } : null
      }));
      
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
  
  // Initial load and refresh interval
  useEffect(() => {
    setLoading(true);
    fetchSessionData();
    
    // Set up refresh interval - fetch every 60 seconds
    const refreshInterval = setInterval(fetchSessionData, 60000);
    
    return () => clearInterval(refreshInterval);
  }, [API_URL, fetchWithTimeout, user]);

  // Handle pull-to-refresh
  const onRefresh = async () => {
    setRefreshing(true);
    await fetchSessionData();
  };

  // View session details
  const showRequestDetails = (request) => {
    setSelectedRequest(request);
    setShowDetailsModal(true);
  };

  // Accept session request
  const handleAcceptRequest = async (request) => {
    setProcessingRequest(request.id);
    
    try {
      console.log('🟢 Mentor accepting session request:', request.id);
      
      // Update session status to approved via API
      const sessionId = Number(request.id);
      console.log(`Updating session status: ${API_URL}/api/sessions/${sessionId}/status`);
      
      const response = await fetchWithTimeout(`${API_URL}/api/sessions/${sessionId}/status`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          status: 'approved',
          userId: user?.id,
          userRole: 'mentor'
        }),
      });
      
      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(errorText || `Failed to update session status: ${response.status}`);
      }
      
      const updatedSession = await response.json();
      console.log('Session approved via API:', updatedSession);
      
      // Generate video call link
      const meetingUrl = VideoCallService.generateMeetingUrl(request.id);
      
      // Update meeting URL via API
      const meetingResponse = await fetchWithTimeout(`${API_URL}/api/sessions/${sessionId}/meeting`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          meeting_url: meetingUrl,
          meeting_provider: 'jitsi',
          userId: user?.id,
          userRole: 'mentor'
        }),
      });
      
      if (!meetingResponse.ok) {
        console.warn('Failed to update meeting URL, but session is approved');
      }
      
      // Update local state
      setSessions(prevSessions =>
        prevSessions.map(s =>
          s.id === request.id ? {
            ...s,
            status: 'approved',
            confirmedAt: new Date().toISOString(),
            hasVideoCall: true,
            videoCall: {
              meetingUrl: meetingUrl,
              provider: 'jitsi'
            }
          } : s
        )
      );

      // Send confirmation email to both parties
      // We'll assume the EmailService has a method for this
      await EmailService.sendSessionApprovalEmails(request);

      // Show success feedback
      Alert.alert(
        'Session Approved! ✅',
        `Your session with ${request.mentee.name} has been approved. Both of you will receive a confirmation email with the meeting link.`,
        [{ text: 'Great!', style: 'default' }]
      );

      console.log('✅ Session approved successfully');

    } catch (error) {
      console.error('❌ Error approving session:', error);
      Alert.alert('Error', 'Failed to approve session. Please try again.');
    } finally {
      setProcessingRequest(null);
    }
  };

  // Decline session request
  const handleDeclineRequest = (request) => {
    Alert.alert(
      'Decline Session Request',
      `Are you sure you want to decline the session request from ${request.mentee.name}?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Decline',
          style: 'destructive',
          onPress: async () => {
            setProcessingRequest(request.id);
            
            try {
              console.log('🔴 Mentor declining session request:', request.id);
              
              // Update session status to rejected via API
              const sessionId = Number(request.id);
              console.log(`Rejecting session: ${API_URL}/api/sessions/${sessionId}/status`);
              
              const response = await fetchWithTimeout(`${API_URL}/api/sessions/${sessionId}/status`, {
                method: 'PUT',
                headers: {
                  'Content-Type': 'application/json',
                },
                body: JSON.stringify({ 
                  status: 'rejected',
                  userId: user?.id,
                  userRole: 'mentor'
                }),
              });
              
              if (!response.ok) {
                const errorText = await response.text();
                throw new Error(errorText || `Failed to reject session: ${response.status}`);
              }
              
              // Update local state
              setSessions(prevSessions =>
                prevSessions.map(s =>
                  s.id === request.id ? {
                    ...s,
                    status: 'rejected',
                    rejectedAt: new Date().toISOString()
                  } : s
                )
              );
  
              // Notify mentee about rejection
              await EmailService.sendSessionRejectionEmail(request);

              Alert.alert(
                'Request Declined',
                `You have declined the session request from ${request.mentee.name}.`,
                [{ text: 'OK' }]
              );
              
            } catch (error) {
              console.error('Error declining session request:', error);
              Alert.alert('Error', 'Failed to decline request. Please try again.');
            } finally {
              setProcessingRequest(null);
            }
          },
        },
      ]
    );
  };

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
      {/* Show error banner if there was an error */}
      {error && (
        <View style={styles.errorBanner}>
          <Ionicons name="warning" size={18} color="#fff" />
          <Text style={styles.errorBannerText}>
            {error}
          </Text>
        </View>
      )}
      
      {/* Loading indicator */}
      {loading && !refreshing && (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#667eea" />
          <Text style={styles.loadingText}>Loading session data...</Text>
        </View>
      )}

      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.title}>Session Requests</Text>
        <Text style={styles.subtitle}>
          {pendingRequests.length} pending • {approvedSessions.length} approved
        </Text>
      </View>

      {/* No sessions message */}
      {!loading && sessions.length === 0 && (
        <View style={styles.emptyState}>
          <Ionicons name="calendar-outline" size={60} color="#ccc" />
          <Text style={styles.emptyStateTitle}>No Sessions Yet</Text>
          <Text style={styles.emptyStateText}>
            When mentees request sessions with you, they will appear here.
          </Text>
        </View>
      )}

      {/* Pending Requests Section */}
      {pendingRequests.length > 0 && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>
            <Ionicons name="hourglass-outline" size={20} color="#ffa726" /> Pending Approval ({pendingRequests.length})
          </Text>
          
          {pendingRequests.map((request) => (
            <SessionRequestCard 
              key={request.id}
              request={request}
              onAccept={handleAcceptRequest}
              onDecline={handleDeclineRequest}
              onViewDetails={() => showRequestDetails(request)}
              isProcessing={processingRequest === request.id}
            />
          ))}
        </View>
      )}

      {/* Approved Sessions Section */}
      {approvedSessions.length > 0 && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>
            <Ionicons name="checkmark-circle-outline" size={20} color="#4caf50" /> Approved Sessions ({approvedSessions.length})
          </Text>
          
          {approvedSessions.map((session) => (
            <TouchableOpacity 
              key={session.id} 
              style={[styles.requestCard, styles.approvedCard]}
              onPress={() => navigation.navigate('NewSessionDetails', { sessionId: session.id })}
            >
              <View style={styles.cardHeader}>
                <View style={styles.menteeInfo}>
                  <Ionicons name="person-circle-outline" size={46} color="#667eea" />
                  <View style={styles.menteeDetails}>
                    <Text style={styles.menteeName}>{session.mentee.name}</Text>
                    <Text style={styles.menteeTitle}>{session.mentee.title || 'Mentee'}</Text>
                  </View>
                </View>
                <View style={[styles.statusBadge, { backgroundColor: '#4caf50' }]}>
                  <Ionicons name="checkmark-circle" size={16} color="white" />
                  <Text style={styles.statusText}>Approved</Text>
                </View>
              </View>

              <View style={styles.sessionInfo}>
                <View style={styles.infoRow}>
                  <Ionicons name="calendar-outline" size={16} color="#666" />
                  <Text style={styles.infoText}>{session.requestedDate} at {session.requestedTime}</Text>
                </View>
                <View style={styles.infoRow}>
                  <Ionicons name="time-outline" size={16} color="#666" />
                  <Text style={styles.infoText}>{session.duration} minutes</Text>
                </View>
                <View style={styles.infoRow}>
                  <Ionicons name="book-outline" size={16} color="#666" />
                  <Text style={styles.infoText}>{session.topic}</Text>
                </View>
              </View>

              <View style={styles.viewDetailsRow}>
                <Text style={styles.approvedDate}>
                  Approved on {formatDate(session.confirmedAt)}
                </Text>
                <View style={styles.viewDetailsButton}>
                  <Text style={styles.viewDetailsText}>View Details</Text>
                  <Ionicons name="chevron-forward" size={16} color="#667eea" />
                </View>
              </View>
            </TouchableOpacity>
          ))}
        </View>
      )}

      {/* Details Modal */}
      <Modal
        visible={showDetailsModal}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setShowDetailsModal(false)}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Session Request Details</Text>
              <TouchableOpacity 
                style={styles.closeButton}
                onPress={() => setShowDetailsModal(false)}
              >
                <Ionicons name="close" size={24} color="#333" />
              </TouchableOpacity>
            </View>

            {selectedRequest && (
              <ScrollView>
                <View style={styles.detailSection}>
                  <Text style={styles.detailSectionTitle}>Mentee Information</Text>
                  <View style={styles.detailRow}>
                    <Text style={styles.detailLabel}>Name:</Text>
                    <Text style={styles.detailValue}>{selectedRequest.mentee.name}</Text>
                  </View>
                  {selectedRequest.mentee.title && (
                    <View style={styles.detailRow}>
                      <Text style={styles.detailLabel}>Title:</Text>
                      <Text style={styles.detailValue}>{selectedRequest.mentee.title}</Text>
                    </View>
                  )}
                  <View style={styles.detailRow}>
                    <Text style={styles.detailLabel}>Email:</Text>
                    <Text style={styles.detailValue}>{selectedRequest.mentee.email}</Text>
                  </View>
                </View>

                <View style={styles.detailSection}>
                  <Text style={styles.detailSectionTitle}>Session Information</Text>
                  <View style={styles.detailRow}>
                    <Text style={styles.detailLabel}>Date:</Text>
                    <Text style={styles.detailValue}>{selectedRequest.requestedDate}</Text>
                  </View>
                  <View style={styles.detailRow}>
                    <Text style={styles.detailLabel}>Time:</Text>
                    <Text style={styles.detailValue}>{selectedRequest.requestedTime}</Text>
                  </View>
                  <View style={styles.detailRow}>
                    <Text style={styles.detailLabel}>Duration:</Text>
                    <Text style={styles.detailValue}>{selectedRequest.duration} minutes</Text>
                  </View>
                  <View style={styles.detailRow}>
                    <Text style={styles.detailLabel}>Topic:</Text>
                    <Text style={styles.detailValue}>{selectedRequest.topic}</Text>
                  </View>
                  <View style={styles.detailRow}>
                    <Text style={styles.detailLabel}>Fee:</Text>
                    <Text style={styles.detailValue}>
                      {selectedRequest.fee > 0 ? `${selectedRequest.fee} MMK` : 'Free'}
                    </Text>
                  </View>
                  <View style={styles.detailRow}>
                    <Text style={styles.detailLabel}>Requested:</Text>
                    <Text style={styles.detailValue}>{formatDate(selectedRequest.requestedAt)}</Text>
                  </View>
                </View>

                {selectedRequest.additionalNotes && (
                  <View style={styles.detailSection}>
                    <Text style={styles.detailSectionTitle}>Additional Notes</Text>
                    <Text style={styles.notesText}>{selectedRequest.additionalNotes}</Text>
                  </View>
                )}

                <View style={styles.modalActions}>
                  {(selectedRequest.status === 'pending_approval' || selectedRequest.status === 'pending_mentor_approval') && (
                    <>
                      <TouchableOpacity
                        style={[styles.modalButton, styles.acceptButton]}
                        onPress={() => {
                          setShowDetailsModal(false);
                          handleAcceptRequest(selectedRequest);
                        }}
                      >
                        <Ionicons name="checkmark-circle" size={20} color="white" />
                        <Text style={styles.modalButtonText}>Accept Request</Text>
                      </TouchableOpacity>
                      <TouchableOpacity
                        style={[styles.modalButton, styles.declineButton]}
                        onPress={() => {
                          setShowDetailsModal(false);
                          handleDeclineRequest(selectedRequest);
                        }}
                      >
                        <Ionicons name="close-circle" size={20} color="white" />
                        <Text style={styles.modalButtonText}>Decline Request</Text>
                      </TouchableOpacity>
                    </>
                  )}
                </View>
              </ScrollView>
            )}
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
  loadingContainer: {
    padding: 20,
    alignItems: 'center',
    justifyContent: 'center',
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
  section: {
    padding: 16,
    paddingBottom: 8,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 12,
    flexDirection: 'row',
    alignItems: 'center',
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 40,
  },
  emptyStateTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
    marginTop: 16,
    marginBottom: 8,
  },
  emptyStateText: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    paddingHorizontal: 20,
  },
  requestCard: {
    backgroundColor: 'white',
    borderRadius: 12,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
    overflow: 'hidden',
  },
  approvedCard: {
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
  menteeInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  menteeDetails: {
    marginLeft: 12,
  },
  menteeName: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  menteeTitle: {
    fontSize: 14,
    color: '#666',
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  statusText: {
    color: 'white',
    fontSize: 12,
    fontWeight: 'bold',
    marginLeft: 4,
  },
  sessionInfo: {
    padding: 16,
    backgroundColor: '#f9f9f9',
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  infoText: {
    marginLeft: 8,
    fontSize: 14,
    color: '#333',
  },
  viewDetailsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 12,
  },
  approvedDate: {
    fontSize: 12,
    color: '#666',
    fontStyle: 'italic',
  },
  viewDetailsButton: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  viewDetailsText: {
    color: '#667eea',
    fontSize: 14,
    fontWeight: '500',
    marginRight: 4,
  },
  modalContainer: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: 'white',
    borderRadius: 12,
    width: '90%',
    maxHeight: '80%',
    padding: 0,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
  },
  closeButton: {
    padding: 4,
  },
  detailSection: {
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  detailSectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 12,
  },
  detailRow: {
    flexDirection: 'row',
    marginBottom: 8,
  },
  detailLabel: {
    width: 100,
    fontSize: 14,
    color: '#666',
    fontWeight: '500',
  },
  detailValue: {
    flex: 1,
    fontSize: 14,
    color: '#333',
  },
  notesText: {
    fontSize: 14,
    color: '#333',
    lineHeight: 20,
  },
  modalActions: {
    flexDirection: 'row',
    padding: 16,
  },
  modalButton: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 12,
    borderRadius: 8,
    marginHorizontal: 8,
  },
  acceptButton: {
    backgroundColor: '#4caf50',
  },
  declineButton: {
    backgroundColor: '#f44336',
  },
  modalButtonText: {
    color: 'white',
    fontWeight: 'bold',
    marginLeft: 8,
  },
});
