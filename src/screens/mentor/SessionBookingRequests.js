import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  Modal,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useLanguage } from '../../context/LanguageContext';
import VideoCallService from '../../services/videoCallService';
import EmailService from '../../services/emailService';

export default function SessionBookingRequests({ navigation }) {
  const { t } = useLanguage();
  const [selectedRequest, setSelectedRequest] = useState(null);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [processingRequest, setProcessingRequest] = useState(null);
  
  // Mock session booking requests - in real app, this would come from API
  const [bookingRequests, setBookingRequests] = useState([
    {
      id: '1692123456789',
      mentee: {
        name: 'Current User',
        email: 'mentee@example.com',
        avatar: null,
        experience: 'Beginner'
      },
      requestedDate: 'Jul 21',
      requestedTime: '2:00 PM',
      duration: 60,
      topic: 'General mentoring session',
      fee: 0,
      status: 'pending_mentor_approval',
      requestedAt: '2025-07-19T10:30:00Z',
      additionalNotes: 'Looking forward to learning about React Native development and career guidance.'
    },
    {
      id: '1692123456790',
      mentee: {
        name: 'Sarah Johnson',
        email: 'sarah@example.com',
        avatar: null,
        experience: 'Intermediate'
      },
      requestedDate: 'Jul 22',
      requestedTime: '10:00 AM',
      duration: 60,
      topic: 'Career transition guidance',
      fee: 50,
      status: 'pending_mentor_approval',
      requestedAt: '2025-07-19T14:15:00Z',
      additionalNotes: 'Would like to discuss transitioning from design to development role.'
    },
    {
      id: '1692123456791',
      mentee: {
        name: 'Mike Chen',
        email: 'mike@example.com',
        avatar: null,
        experience: 'Advanced'
      },
      requestedDate: 'Jul 23',
      requestedTime: '4:00 PM',
      duration: 90,
      topic: 'Technical architecture review',
      fee: 75,
      status: 'confirmed',
      requestedAt: '2025-07-18T16:45:00Z',
      confirmedAt: '2025-07-18T17:00:00Z',
      additionalNotes: 'Need help reviewing system architecture for scalability.',
      hasVideoCall: true,
      videoCall: {
        meetingUrl: 'https://meet.jit.si/mentor-session-1692123456791',
        provider: 'jitsi'
      }
    }
  ]);

  const handleAcceptRequest = async (request) => {
    setProcessingRequest(request.id);
    
    try {
      console.log('🟢 Mentor accepting session request:', request.id);
      
      // Create confirmed session with video call
      const confirmedSession = {
        ...request,
        status: 'confirmed',
        confirmedAt: new Date().toISOString(),
        hasVideoCall: true
      };

      // Generate video call link
      const sessionWithVideoCall = VideoCallService.addMeetingToSession(confirmedSession);
      console.log('🎥 Video call generated:', sessionWithVideoCall.videoCall);

      // Update the request in state
      setBookingRequests(prevRequests =>
        prevRequests.map(req =>
          req.id === request.id ? sessionWithVideoCall : req
        )
      );

      // Send confirmation email to both parties
      await sendConfirmationEmail(sessionWithVideoCall);

      // Show success feedback
      Alert.alert(
        'Session Confirmed! ✅',
        `Your session with ${request.mentee.name} has been confirmed. Both of you will receive a confirmation email with the meeting link.`,
        [{ text: 'Great!', style: 'default' }]
      );

      console.log('✅ Session confirmed successfully');

    } catch (error) {
      console.error('❌ Error confirming session:', error);
      Alert.alert('Error', 'Failed to confirm session. Please try again.');
    } finally {
      setProcessingRequest(null);
    }
  };

  const handleDeclineRequest = (request) => {
    Alert.alert(
      'Decline Session Request',
      `Are you sure you want to decline the session request from ${request.mentee.name}?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Decline',
          style: 'destructive',
          onPress: () => {
            console.log('🔴 Mentor declining session request:', request.id);
            
            setBookingRequests(prevRequests =>
              prevRequests.map(req =>
                req.id === request.id 
                  ? { ...req, status: 'rejected', rejectedAt: new Date().toISOString() }
                  : req
              )
            );

            // In real app, send notification to mentee about rejection
            console.log('📧 Sending rejection notification to mentee');
          }
        }
      ]
    );
  };

  const sendConfirmationEmail = async (session) => {
    console.log('📧 Sending confirmation emails...');
    
    try {
      const mentorEmail = 'mentor@example.com'; // Replace with actual mentor email
      const menteeEmail = session.mentee.email;

      await EmailService.sendSessionConfirmationEmail(
        session,
        mentorEmail,
        menteeEmail
      );

      console.log('✅ Confirmation emails sent successfully');
    } catch (error) {
      console.error('❌ Error sending confirmation emails:', error);
    }
  };

  const showRequestDetails = (request) => {
    setSelectedRequest(request);
    setShowDetailsModal(true);
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'pending_mentor_approval':
        return '#ffa726';
      case 'confirmed':
        return '#4caf50';
      case 'rejected':
        return '#f44336';
      default:
        return '#666';
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'pending_mentor_approval':
        return 'hourglass';
      case 'confirmed':
        return 'checkmark-circle';
      case 'rejected':
        return 'close-circle';
      default:
        return 'help-circle';
    }
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString() + ' at ' + date.toLocaleTimeString([], { 
      hour: '2-digit', 
      minute: '2-digit' 
    });
  };

  const pendingRequests = bookingRequests.filter(req => req.status === 'pending_mentor_approval');
  const confirmedRequests = bookingRequests.filter(req => req.status === 'confirmed');
  const rejectedRequests = bookingRequests.filter(req => req.status === 'rejected');

  return (
    <ScrollView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.title}>Session Booking Requests</Text>
        <Text style={styles.subtitle}>
          {pendingRequests.length} pending • {confirmedRequests.length} confirmed
        </Text>
      </View>

      {/* Pending Requests Section */}
      {pendingRequests.length > 0 && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>
            <Ionicons name="hourglass" size={20} color="#ffa726" /> Pending Approval ({pendingRequests.length})
          </Text>
          
          {pendingRequests.map((request) => (
            <View key={request.id} style={styles.requestCard}>
              <View style={styles.cardHeader}>
                <View style={styles.menteeInfo}>
                  <Ionicons name="person-circle" size={50} color="#667eea" />
                  <View style={styles.menteeDetails}>
                    <Text style={styles.menteeName}>{request.mentee.name}</Text>
                    <Text style={styles.menteeLevel}>{request.mentee.experience} Level</Text>
                  </View>
                </View>
                <TouchableOpacity
                  style={styles.detailsButton}
                  onPress={() => showRequestDetails(request)}
                >
                  <Ionicons name="information-circle" size={24} color="#667eea" />
                </TouchableOpacity>
              </View>

              <View style={styles.sessionInfo}>
                <View style={styles.infoRow}>
                  <Ionicons name="calendar" size={16} color="#666" />
                  <Text style={styles.infoText}>{request.requestedDate} at {request.requestedTime}</Text>
                </View>
                <View style={styles.infoRow}>
                  <Ionicons name="time" size={16} color="#666" />
                  <Text style={styles.infoText}>{request.duration} minutes</Text>
                </View>
                <View style={styles.infoRow}>
                  <Ionicons name="book" size={16} color="#666" />
                  <Text style={styles.infoText}>{request.topic}</Text>
                </View>
                {request.fee > 0 && (
                  <View style={styles.infoRow}>
                    <Ionicons name="cash" size={16} color="#666" />
                    <Text style={styles.infoText}>₱{request.fee}</Text>
                  </View>
                )}
              </View>

              <Text style={styles.requestTime}>
                Requested {formatDate(request.requestedAt)}
              </Text>

              <View style={styles.actionButtons}>
                <TouchableOpacity
                  style={[styles.actionButton, styles.acceptButton]}
                  onPress={() => handleAcceptRequest(request)}
                  disabled={processingRequest === request.id}
                >
                  {processingRequest === request.id ? (
                    <>
                      <Ionicons name="sync" size={20} color="white" />
                      <Text style={styles.actionButtonText}>Processing...</Text>
                    </>
                  ) : (
                    <>
                      <Ionicons name="checkmark-circle" size={20} color="white" />
                      <Text style={styles.actionButtonText}>Accept & Confirm</Text>
                    </>
                  )}
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.actionButton, styles.declineButton]}
                  onPress={() => handleDeclineRequest(request)}
                  disabled={processingRequest === request.id}
                >
                  <Ionicons name="close-circle" size={20} color="white" />
                  <Text style={styles.actionButtonText}>Decline</Text>
                </TouchableOpacity>
              </View>
            </View>
          ))}
        </View>
      )}

      {/* Confirmed Sessions Section */}
      {confirmedRequests.length > 0 && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>
            <Ionicons name="checkmark-circle" size={20} color="#4caf50" /> Confirmed Sessions ({confirmedRequests.length})
          </Text>
          
          {confirmedRequests.map((request) => (
            <View key={request.id} style={[styles.requestCard, styles.confirmedCard]}>
              <View style={styles.cardHeader}>
                <View style={styles.menteeInfo}>
                  <Ionicons name="person-circle" size={50} color="#667eea" />
                  <View style={styles.menteeDetails}>
                    <Text style={styles.menteeName}>{request.mentee.name}</Text>
                    <Text style={styles.menteeLevel}>{request.mentee.experience} Level</Text>
                  </View>
                </View>
                <View style={[styles.statusBadge, { backgroundColor: getStatusColor(request.status) }]}>
                  <Ionicons name={getStatusIcon(request.status)} size={16} color="white" />
                  <Text style={styles.statusText}>Confirmed</Text>
                </View>
              </View>

              <View style={styles.sessionInfo}>
                <View style={styles.infoRow}>
                  <Ionicons name="calendar" size={16} color="#666" />
                  <Text style={styles.infoText}>{request.requestedDate} at {request.requestedTime}</Text>
                </View>
                <View style={styles.infoRow}>
                  <Ionicons name="time" size={16} color="#666" />
                  <Text style={styles.infoText}>{request.duration} minutes</Text>
                </View>
                <View style={styles.infoRow}>
                  <Ionicons name="videocam" size={16} color="#4caf50" />
                  <Text style={[styles.infoText, { color: '#4caf50' }]}>Meeting link generated</Text>
                </View>
              </View>

              <Text style={styles.confirmTime}>
                Confirmed {formatDate(request.confirmedAt)}
              </Text>

              <TouchableOpacity
                style={styles.viewSessionButton}
                onPress={() => navigation.navigate('SessionDetails', { session: request })}
              >
                <Ionicons name="eye" size={20} color="#667eea" />
                <Text style={styles.viewSessionText}>View Session Details</Text>
              </TouchableOpacity>
            </View>
          ))}
        </View>
      )}

      {pendingRequests.length === 0 && confirmedRequests.length === 0 && (
        <View style={styles.emptyState}>
          <Ionicons name="calendar-outline" size={80} color="#ccc" />
          <Text style={styles.emptyTitle}>No Booking Requests</Text>
          <Text style={styles.emptySubtitle}>
            Session booking requests from mentees will appear here
          </Text>
        </View>
      )}

      {/* Request Details Modal */}
      <Modal
        visible={showDetailsModal}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setShowDetailsModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            {selectedRequest && (
              <>
                <View style={styles.modalHeader}>
                  <Text style={styles.modalTitle}>Session Request Details</Text>
                  <TouchableOpacity
                    style={styles.closeButton}
                    onPress={() => setShowDetailsModal(false)}
                  >
                    <Ionicons name="close" size={24} color="#666" />
                  </TouchableOpacity>
                </View>

                <ScrollView style={styles.modalBody}>
                  <View style={styles.modalSection}>
                    <Text style={styles.modalSectionTitle}>Mentee Information</Text>
                    <Text style={styles.modalText}>Name: {selectedRequest.mentee.name}</Text>
                    <Text style={styles.modalText}>Experience: {selectedRequest.mentee.experience}</Text>
                    <Text style={styles.modalText}>Email: {selectedRequest.mentee.email}</Text>
                  </View>

                  <View style={styles.modalSection}>
                    <Text style={styles.modalSectionTitle}>Session Details</Text>
                    <Text style={styles.modalText}>Date: {selectedRequest.requestedDate}</Text>
                    <Text style={styles.modalText}>Time: {selectedRequest.requestedTime}</Text>
                    <Text style={styles.modalText}>Duration: {selectedRequest.duration} minutes</Text>
                    <Text style={styles.modalText}>Topic: {selectedRequest.topic}</Text>
                    {selectedRequest.fee > 0 && (
                      <Text style={styles.modalText}>Fee: ₱{selectedRequest.fee}</Text>
                    )}
                  </View>

                  {selectedRequest.additionalNotes && (
                    <View style={styles.modalSection}>
                      <Text style={styles.modalSectionTitle}>Additional Notes</Text>
                      <Text style={styles.modalText}>{selectedRequest.additionalNotes}</Text>
                    </View>
                  )}
                </ScrollView>

                {selectedRequest.status === 'pending_mentor_approval' && (
                  <View style={styles.modalActions}>
                    <TouchableOpacity
                      style={[styles.modalActionButton, styles.acceptButton]}
                      onPress={() => {
                        setShowDetailsModal(false);
                        handleAcceptRequest(selectedRequest);
                      }}
                    >
                      <Ionicons name="checkmark-circle" size={20} color="white" />
                      <Text style={styles.actionButtonText}>Accept & Confirm</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                      style={[styles.modalActionButton, styles.declineButton]}
                      onPress={() => {
                        setShowDetailsModal(false);
                        handleDeclineRequest(selectedRequest);
                      }}
                    >
                      <Ionicons name="close-circle" size={20} color="white" />
                      <Text style={styles.actionButtonText}>Decline</Text>
                    </TouchableOpacity>
                  </View>
                )}
              </>
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
  header: {
    padding: 20,
    backgroundColor: 'white',
    borderBottomWidth: 1,
    borderBottomColor: '#e1e5e9',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 5,
  },
  subtitle: {
    fontSize: 16,
    color: '#666',
  },
  section: {
    margin: 15,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
    marginBottom: 15,
    flexDirection: 'row',
    alignItems: 'center',
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
  confirmedCard: {
    borderLeftWidth: 4,
    borderLeftColor: '#4caf50',
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 15,
  },
  menteeInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  menteeDetails: {
    marginLeft: 12,
    flex: 1,
  },
  menteeName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  menteeLevel: {
    fontSize: 14,
    color: '#666',
    marginTop: 2,
  },
  detailsButton: {
    padding: 5,
  },
  sessionInfo: {
    marginBottom: 10,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 5,
  },
  infoText: {
    marginLeft: 8,
    fontSize: 14,
    color: '#666',
  },
  requestTime: {
    fontSize: 12,
    color: '#999',
    marginBottom: 15,
    fontStyle: 'italic',
  },
  confirmTime: {
    fontSize: 12,
    color: '#4caf50',
    marginBottom: 15,
    fontStyle: 'italic',
  },
  actionButtons: {
    flexDirection: 'row',
    gap: 10,
  },
  actionButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 12,
    borderRadius: 8,
    gap: 5,
  },
  acceptButton: {
    backgroundColor: '#4caf50',
  },
  declineButton: {
    backgroundColor: '#f44336',
  },
  actionButtonText: {
    color: 'white',
    fontSize: 14,
    fontWeight: '600',
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    gap: 4,
  },
  statusText: {
    color: 'white',
    fontSize: 12,
    fontWeight: '600',
  },
  viewSessionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#f8f9ff',
    borderWidth: 1,
    borderColor: '#667eea',
    borderRadius: 8,
    padding: 12,
    gap: 5,
  },
  viewSessionText: {
    color: '#667eea',
    fontSize: 14,
    fontWeight: '600',
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 50,
    marginTop: 50,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#666',
    marginTop: 20,
  },
  emptySubtitle: {
    fontSize: 16,
    color: '#999',
    textAlign: 'center',
    marginTop: 10,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: 'white',
    borderRadius: 12,
    width: '90%',
    maxHeight: '80%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#e1e5e9',
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
  },
  closeButton: {
    padding: 5,
  },
  modalBody: {
    padding: 20,
  },
  modalSection: {
    marginBottom: 20,
  },
  modalSectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 10,
  },
  modalText: {
    fontSize: 14,
    color: '#666',
    marginBottom: 5,
  },
  modalActions: {
    flexDirection: 'row',
    padding: 20,
    gap: 10,
    borderTopWidth: 1,
    borderTopColor: '#e1e5e9',
  },
  modalActionButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 12,
    borderRadius: 8,
    gap: 5,
  },
});
