import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Alert,
} from 'react-native';
import * as Clipboard from 'expo-clipboard';
import { Ionicons } from '@expo/vector-icons';
import { useLanguage } from '../../context/LanguageContext';
import VideoCallService from '../../services/videoCallService';
import EmailService from '../../services/emailService';
import EmailPreview from '../../components/EmailPreview';
import EmailTestUtils from '../../utils/emailTestUtils';

export default function BookSession({ route, navigation }) {
  const { mentorId, mentorName, sessionFee } = route.params;
  const { t } = useLanguage();
  const [selectedDate, setSelectedDate] = useState(null);
  const [selectedTime, setSelectedTime] = useState(null);
  const [requestNote, setRequestNote] = useState('');
  const [buttonClicked, setButtonClicked] = useState(false);
  const [sessionCreated, setSessionCreated] = useState(false);
  const [createdSession, setCreatedSession] = useState(null);
  const [emailSent, setEmailSent] = useState(false);
  const [emailSending, setEmailSending] = useState(false);
  const [showEmailPreview, setShowEmailPreview] = useState(false);
  
  // New states for mentor confirmation flow
  const [sessionStatus, setSessionStatus] = useState('booking'); // 'booking', 'pending', 'confirmed', 'rejected'
  const [bookingRequest, setBookingRequest] = useState(null);

  // Debug logging
  console.log('BookSession component rendered');
  console.log('Route params:', route.params);
  console.log('Mentor ID:', mentorId, 'Name:', mentorName, 'Fee:', sessionFee);

  // Function to copy meeting link to clipboard
  const copyMeetingLink = async () => {
    if (createdSession?.videoCall?.meetingUrl) {
      try {
        await Clipboard.setStringAsync(createdSession.videoCall.meetingUrl);
        // Show a brief visual feedback
        console.log('📋 Meeting link copied to clipboard');
      } catch (error) {
        console.error('Failed to copy meeting link:', error);
      }
    }
  };

  // Mock available time slots
  const availableSlots = {
    'Jul 21': ['10:00 AM', '2:00 PM', '4:00 PM'],
    'Jul 22': ['9:00 AM', '1:00 PM', '3:00 PM'],
    'Jul 23': ['11:00 AM', '2:00 PM', '5:00 PM'],
  };

  const handleRequestSession = async () => {
    console.log('🚀 Starting session request process...');
    
    // Check if date and time are selected
    if (!selectedDate || !selectedTime) {
      console.log('Missing date or time');
      setButtonClicked(true);
      setTimeout(() => setButtonClicked(false), 3000);
      return;
    }

    console.log('✅ Form validation passed - creating session request...');
    setButtonClicked(true);
    
    // Create session request object (pending mentor approval)
    const newBookingRequest = {
      id: Date.now().toString(),
      mentorId,
      mentorName,
      menteeName: 'Current User', // Replace with actual mentee name from auth context
      date: selectedDate,
      time: selectedTime,
      duration: 60, // minutes
      status: 'pending_mentor_approval',
      topic: requestNote || 'General mentoring session',
      fee: sessionFee,
      requestedAt: new Date().toISOString(),
      hasVideoCall: false, // Will be set to true only after mentor confirmation
      emailNotificationSent: false
    };

    console.log('📝 Created booking request:', newBookingRequest);

    try {
      // Save the booking request (in real app, this would be sent to backend)
      setBookingRequest(newBookingRequest);
      setSessionStatus('pending');
      setButtonClicked(false);

      // Send notification to mentor (not confirmation email yet)
      sendMentorNotification(newBookingRequest);

      console.log('✅ Session request sent to mentor for approval');

    } catch (error) {
      console.error('❌ Error creating session request:', error);
      setButtonClicked(false);
    }
  };

  // Function to send notification to mentor about the booking request
  const sendMentorNotification = async (request) => {
    console.log('📧 Sending booking request notification to mentor...');
    
    try {
      // In real app, send notification to mentor via API
      const mentorEmail = 'mentor@example.com'; // Replace with actual mentor email
      
      // For demo purposes, simulate mentor response after 3 seconds
      setTimeout(() => {
        simulateMentorResponse(request);
      }, 3000);
      
      console.log('✅ Mentor notification sent');
    } catch (error) {
      console.error('❌ Error sending mentor notification:', error);
    }
  };

  // Function to simulate mentor confirmation (for demo purposes)
  const simulateMentorResponse = (request) => {
    console.log('🤖 Simulating mentor response...');
    
    // In real app, this would come from mentor's action via API
    const mentorConfirmed = true; // Simulate approval (in real app, this comes from mentor's decision)
    
    if (mentorConfirmed) {
      handleMentorConfirmation(request);
    } else {
      handleMentorRejection(request);
    }
  };

  // Function to handle mentor confirmation
  const handleMentorConfirmation = async (request) => {
    console.log('✅ Mentor confirmed the session!');
    
    // Update request to confirmed session with video call
    const confirmedSession = {
      ...request,
      status: 'confirmed',
      confirmedAt: new Date().toISOString(),
      hasVideoCall: true
    };

    try {
      // Generate video call link only after mentor confirmation
      const sessionWithVideoCall = VideoCallService.addMeetingToSession(confirmedSession);
      console.log('🎥 Video call generated after mentor confirmation:', sessionWithVideoCall.videoCall);

      // Update states to show confirmed session
      setCreatedSession(sessionWithVideoCall);
      setSessionStatus('confirmed');
      setSessionCreated(true);

      // Send confirmation email with meeting link
      sendConfirmationEmail(sessionWithVideoCall);

    } catch (error) {
      console.error('❌ Error generating video call:', error);
    }
  };

  // Function to handle mentor rejection
  const handleMentorRejection = (request) => {
    console.log('❌ Mentor rejected the session');
    setSessionStatus('rejected');
    // In real app, notify mentee about rejection and suggest alternative times
  };
  const sendConfirmationEmail = async (session) => {
    console.log('📧 Preparing to send confirmation email...');
    setEmailSending(true);

    try {
      // In a real app, you would get these from user profiles or authentication context
      const mentorEmail = 'mentor@example.com'; // Replace with actual mentor email
      const menteeEmail = 'mentee@example.com'; // Replace with actual mentee email

      const emailSent = await EmailService.sendSessionConfirmationEmail(
        session,
        mentorEmail,
        menteeEmail
      );

      if (emailSent) {
        console.log('✅ Confirmation email sent successfully!');
        setEmailSent(true);
      } else {
        console.log('📧 Email sending was cancelled or failed');
      }
    } catch (error) {
      console.error('❌ Error sending confirmation email:', error);
    } finally {
      setEmailSending(false);
    }
  };

  // Development test function for email functionality
  const testEmailFeature = async () => {
    console.log('🧪 Testing email feature...');
    try {
      await EmailTestUtils.testEmailService();
    } catch (error) {
      console.error('🧪 Email test failed:', error);
    }
  };

  return (
    <ScrollView style={styles.container}>
      {/* Show different screens based on session status */}
      
      {/* Pending Mentor Approval Screen */}
      {sessionStatus === 'pending' && bookingRequest ? (
        <View style={styles.pendingContainer}>
          <View style={styles.pendingHeader}>
            <Ionicons name="hourglass" size={80} color="#ffa726" />
            <Text style={styles.pendingTitle}>Request Sent! ⏳</Text>
            <Text style={styles.pendingSubtitle}>
              Waiting for {mentorName} to confirm your session
            </Text>
          </View>

          {/* Request Details */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Request Details</Text>
            <View style={styles.sessionDetailCard}>
              <View style={styles.detailRow}>
                <Ionicons name="person" size={24} color="#667eea" />
                <Text style={styles.detailText}>Mentor: {bookingRequest.mentorName}</Text>
              </View>
              <View style={styles.detailRow}>
                <Ionicons name="calendar" size={24} color="#667eea" />
                <Text style={styles.detailText}>Requested Date: {bookingRequest.date}</Text>
              </View>
              <View style={styles.detailRow}>
                <Ionicons name="time" size={24} color="#667eea" />
                <Text style={styles.detailText}>Requested Time: {bookingRequest.time}</Text>
              </View>
              <View style={styles.detailRow}>
                <Ionicons name="hourglass" size={24} color="#667eea" />
                <Text style={styles.detailText}>Duration: {bookingRequest.duration} minutes</Text>
              </View>
              {bookingRequest.topic && (
                <View style={styles.detailRow}>
                  <Ionicons name="book" size={24} color="#667eea" />
                  <Text style={styles.detailText}>Topic: {bookingRequest.topic}</Text>
                </View>
              )}
            </View>
          </View>

          {/* Status Information */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>
              <Ionicons name="information-circle" size={20} color="#ffa726" /> What's Next?
            </Text>
            <View style={styles.statusCard}>
              <Text style={styles.statusText}>
                📨 Your mentor has been notified about your session request
              </Text>
              <Text style={styles.statusText}>
                ⏰ You'll receive a confirmation email once they approve
              </Text>
              <Text style={styles.statusText}>
                🎥 Meeting link will be generated only after confirmation
              </Text>
              <Text style={styles.statusText}>
                📧 Both you and your mentor will get session details via email
              </Text>
            </View>
          </View>

          {/* Cancel Request Button */}
          <View style={styles.actionButtonsContainer}>
            <TouchableOpacity
              style={styles.cancelButton}
              onPress={() => {
                setSessionStatus('booking');
                setBookingRequest(null);
              }}
            >
              <Ionicons name="close" size={24} color="#e53e3e" />
              <Text style={styles.cancelButtonText}>Cancel Request</Text>
            </TouchableOpacity>
          </View>
        </View>
      ) : 
      
      /* Mentor Rejected Screen */
      sessionStatus === 'rejected' ? (
        <View style={styles.rejectedContainer}>
          <View style={styles.rejectedHeader}>
            <Ionicons name="close-circle" size={80} color="#e53e3e" />
            <Text style={styles.rejectedTitle}>Request Not Available</Text>
            <Text style={styles.rejectedSubtitle}>
              The mentor is not available at your requested time
            </Text>
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Suggested Actions</Text>
            <View style={styles.suggestionCard}>
              <Text style={styles.suggestionText}>
                • Try selecting a different time slot
              </Text>
              <Text style={styles.suggestionText}>
                • Check mentor's availability calendar
              </Text>
              <Text style={styles.suggestionText}>
                • Consider booking for next week
              </Text>
            </View>
          </View>

          <View style={styles.actionButtonsContainer}>
            <TouchableOpacity
              style={styles.tryAgainButton}
              onPress={() => {
                setSessionStatus('booking');
                setBookingRequest(null);
                setSelectedDate(null);
                setSelectedTime(null);
              }}
            >
              <Ionicons name="refresh" size={24} color="#667eea" />
              <Text style={styles.tryAgainButtonText}>Try Different Time</Text>
            </TouchableOpacity>
          </View>
        </View>
      ) : 
      
      /* Confirmed Session Screen */
      sessionStatus === 'confirmed' && sessionCreated && createdSession ? (
        <View style={styles.successContainer}>
          {/* Success Header */}
          <View style={styles.successHeader}>
            <Ionicons name="checkmark-circle" size={80} color="#4CAF50" />
            <Text style={styles.successTitle}>Session Confirmed! 🎉</Text>
            <Text style={styles.successSubtitle}>
              Your mentoring session has been successfully booked
            </Text>
          </View>

          {/* Session Details */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Session Details</Text>
            <View style={styles.sessionDetailCard}>
              <View style={styles.detailRow}>
                <Ionicons name="person" size={24} color="#667eea" />
                <Text style={styles.detailText}>Mentor: {createdSession.mentorName}</Text>
              </View>
              <View style={styles.detailRow}>
                <Ionicons name="calendar" size={24} color="#667eea" />
                <Text style={styles.detailText}>Date: {createdSession.date}</Text>
              </View>
              <View style={styles.detailRow}>
                <Ionicons name="time" size={24} color="#667eea" />
                <Text style={styles.detailText}>Time: {createdSession.time}</Text>
              </View>
              <View style={styles.detailRow}>
                <Ionicons name="hourglass" size={24} color="#667eea" />
                <Text style={styles.detailText}>Duration: {createdSession.duration} minutes</Text>
              </View>
              {createdSession.topic && (
                <View style={styles.detailRow}>
                  <Ionicons name="book" size={24} color="#667eea" />
                  <Text style={styles.detailText}>Topic: {createdSession.topic}</Text>
                </View>
              )}
            </View>
          </View>

          {/* Video Call Section */}
          {createdSession.hasVideoCall && (
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>
                <Ionicons name="videocam" size={20} color="#667eea" /> Video Call Ready
              </Text>
              <View style={styles.videoCallCard}>
                <Text style={styles.videoCallInfo}>
                  A video meeting room has been automatically created for your session.
                  You can join the call 15 minutes before the scheduled time.
                </Text>
                
                <View style={styles.meetingLinkContainer}>
                  <Text style={styles.linkLabel}>Meeting Link:</Text>
                  <View style={styles.linkRow}>
                    <TextInput
                      style={styles.linkInput}
                      value={createdSession.videoCall.meetingUrl}
                      editable={false}
                      selectTextOnFocus={true}
                    />
                    <TouchableOpacity
                      style={styles.copyButton}
                      onPress={copyMeetingLink}
                    >
                      <Ionicons name="copy" size={20} color="white" />
                      <Text style={styles.copyButtonText}>Copy</Text>
                    </TouchableOpacity>
                  </View>
                </View>

                <View style={styles.platformInfo}>
                  <Ionicons name="information-circle" size={16} color="#666" />
                  <Text style={styles.platformText}>
                    Using {createdSession.videoCall.provider === 'jitsi' ? 'Jitsi Meet' : createdSession.videoCall.provider}
                    {' - No account required, works in any browser'}
                  </Text>
                </View>
              </View>
            </View>
          )}

          {/* Email Status Section */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>
              <Ionicons name="mail" size={20} color="#667eea" /> Email Confirmation
            </Text>
            <View style={styles.emailStatusCard}>
              {emailSending ? (
                <View style={styles.emailSendingRow}>
                  <Ionicons name="sync" size={24} color="#ffa726" />
                  <Text style={styles.emailSendingText}>Sending confirmation email...</Text>
                </View>
              ) : emailSent ? (
                <View style={styles.emailSuccessRow}>
                  <Ionicons name="checkmark-circle" size={24} color="#4CAF50" />
                  <Text style={styles.emailSuccessText}>
                    Confirmation email sent! Check your inbox for session details and meeting link.
                  </Text>
                </View>
              ) : (
                <View style={styles.emailPendingRow}>
                  <Ionicons name="time" size={24} color="#ffa726" />
                  <Text style={styles.emailPendingText}>
                    Preparing to send confirmation email...
                  </Text>
                </View>
              )}
              
              <Text style={styles.emailNote}>
                📧 Both you and your mentor will receive a detailed email with session information and the video meeting link.
              </Text>

              {/* Resend Email Button */}
              {emailSent && (
                <View style={styles.emailActionButtons}>
                  <TouchableOpacity
                    style={styles.previewEmailButton}
                    onPress={() => setShowEmailPreview(true)}
                  >
                    <Ionicons name="eye" size={18} color="#667eea" />
                    <Text style={styles.previewEmailText}>Preview Email</Text>
                  </TouchableOpacity>
                  
                  <TouchableOpacity
                    style={styles.resendEmailButton}
                    onPress={() => sendConfirmationEmail(createdSession)}
                    disabled={emailSending}
                  >
                    <Ionicons name="refresh" size={18} color="#667eea" />
                    <Text style={styles.resendEmailText}>Send Again</Text>
                  </TouchableOpacity>
                </View>
              )}
            </View>
          </View>

          {/* Action Buttons */}
          <View style={styles.actionButtonsContainer}>
            <TouchableOpacity
              style={styles.doneButton}
              onPress={() => navigation.goBack()}
            >
              <Ionicons name="checkmark" size={24} color="white" />
              <Text style={styles.doneButtonText}>Done</Text>
            </TouchableOpacity>
            
            <TouchableOpacity
              style={styles.shareButton}
              onPress={copyMeetingLink}
            >
              <Ionicons name="share" size={24} color="#667eea" />
              <Text style={styles.shareButtonText}>Share Link</Text>
            </TouchableOpacity>
          </View>
        </View>
      ) : (
        /* Original booking form */
        <>
          <View style={styles.mentorCard}>
        <View style={styles.mentorInfo}>
          <Ionicons name="person-circle" size={50} color="#764ba2" />
          <View style={styles.mentorDetails}>
            <Text style={styles.mentorName}>{mentorName}</Text>
            <Text style={styles.sessionFee}>
              {sessionFee === 0 ? 'Free Session' : `₱${sessionFee}/session`}
            </Text>
          </View>
        </View>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>{t('selectDate')}</Text>
        <View style={styles.dateGrid}>
          {Object.keys(availableSlots).map((date) => (
            <TouchableOpacity
              key={date}
              style={[
                styles.dateButton,
                selectedDate === date && styles.selectedDate,
              ]}
              onPress={() => setSelectedDate(date)}
            >
              <Text
                style={[
                  styles.dateText,
                  selectedDate === date && styles.selectedDateText,
                ]}
              >
                {date}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      {selectedDate && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>{t('selectTime')}</Text>
          <View style={styles.timeGrid}>
            {availableSlots[selectedDate].map((time) => (
              <TouchableOpacity
                key={time}
                style={[
                  styles.timeButton,
                  selectedTime === time && styles.selectedTime,
                ]}
                onPress={() => setSelectedTime(time)}
              >
                <Text
                  style={[
                    styles.timeText,
                    selectedTime === time && styles.selectedTimeText,
                  ]}
                >
                  {time}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>
      )}

      {selectedDate && selectedTime && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>{t('sessionDetails')}</Text>
          <View style={styles.detailsCard}>
            <View style={styles.detailRow}>
              <Ionicons name="calendar-outline" size={24} color="#667eea" />
              <Text style={styles.detailText}>{selectedDate}</Text>
            </View>
            <View style={styles.detailRow}>
              <Ionicons name="time-outline" size={24} color="#667eea" />
              <Text style={styles.detailText}>{selectedTime}</Text>
            </View>
            <View style={styles.detailRow}>
              <Ionicons name="hourglass-outline" size={24} color="#667eea" />
              <Text style={styles.detailText}>60 {t('minutes')}</Text>
            </View>
          </View>
        </View>
      )}

      {selectedDate && selectedTime && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Message to Mentor (optional)</Text>
          <View style={styles.detailsCard}>
            <Text style={styles.detailText}>Add a note for your mentor about your session goals, questions, or anything you'd like to discuss.</Text>
            <View style={styles.noteInputContainer}>
              <TextInput
                style={styles.noteInput}
                placeholder="Type your message here..."
                value={requestNote}
                onChangeText={setRequestNote}
                multiline
              />
            </View>
          </View>
        </View>
      )}

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>{t('paymentNote')}</Text>
        <View style={styles.paymentInfo}>
          <Text style={styles.paymentText}>
            Session fee: {sessionFee === 0 ? 'Free' : `₱${sessionFee}`}
          </Text>
          <Text style={styles.paymentSubtext}>
            Payment will be processed after the mentor confirms your session request.
          </Text>
        </View>
      </View>

      {/* Debug info - can be removed in production */}
      {!sessionCreated && (
        <View style={[styles.section, { backgroundColor: '#f0f0f0' }]}>
          <Text style={styles.sectionTitle}>Debug Info</Text>
          <Text>Selected Date: {selectedDate || 'None'}</Text>
          <Text>Selected Time: {selectedTime || 'None'}</Text>
          <Text>Mentor Name: {mentorName}</Text>
          <Text>Button Enabled: {selectedDate && selectedTime ? 'YES' : 'NO'}</Text>
          
          {/* VISUAL SUCCESS INDICATOR */}
          {buttonClicked && (
            <View style={{
              backgroundColor: '#4CAF50',
              padding: 15,
              borderRadius: 10,
              marginTop: 10,
              alignItems: 'center',
            }}>
              <Text style={{ color: 'white', fontSize: 18, fontWeight: 'bold' }}>
                ✅ SESSION BEING CREATED! ✅
              </Text>
              <Text style={{ color: 'white', fontSize: 14, textAlign: 'center' }}>
                {selectedDate && selectedTime 
                  ? `Creating session for ${selectedDate} at ${selectedTime}...`
                  : 'Please select date and time first!'
                }
              </Text>
            </View>
          )}
        </View>
      )}

      <TouchableOpacity
        style={[
          styles.requestButton,
          (!selectedDate || !selectedTime) && styles.disabledButton,
        ]}
        disabled={!selectedDate || !selectedTime}
        onPress={() => {
          console.log('🔴 BUTTON PRESSED - Starting session creation...');
          handleRequestSession();
        }}
      >
        <Text style={styles.requestButtonText}>Request Session</Text>
        <Text style={styles.requestButtonSubtext}>
          {sessionFee === 0 ? 'Pending mentor approval' : `₱${sessionFee} - Pending approval`}
        </Text>
      </TouchableOpacity>
        </>
      )}

      {/* Email Preview Modal */}
      <EmailPreview
        visible={showEmailPreview}
        onClose={() => setShowEmailPreview(false)}
        session={createdSession}
      />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  successContainer: {
    flex: 1,
    padding: 20,
  },
  successHeader: {
    alignItems: 'center',
    paddingVertical: 30,
    backgroundColor: 'white',
    borderRadius: 12,
    marginBottom: 20,
  },
  successTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    marginTop: 15,
    textAlign: 'center',
  },
  successSubtitle: {
    fontSize: 16,
    color: '#666',
    marginTop: 8,
    textAlign: 'center',
  },
  sessionDetailCard: {
    backgroundColor: '#f8f9fa',
    borderRadius: 12,
    padding: 15,
  },
  videoCallCard: {
    backgroundColor: '#f0f4ff',
    borderRadius: 12,
    padding: 15,
    borderLeftWidth: 4,
    borderLeftColor: '#667eea',
  },
  videoCallInfo: {
    fontSize: 14,
    color: '#333',
    lineHeight: 20,
    marginBottom: 15,
  },
  meetingLinkContainer: {
    marginBottom: 15,
  },
  linkLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
    marginBottom: 8,
  },
  linkRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  linkInput: {
    flex: 1,
    backgroundColor: 'white',
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 12,
    marginRight: 10,
    fontSize: 14,
    color: '#333',
  },
  copyButton: {
    backgroundColor: '#667eea',
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 15,
    paddingVertical: 12,
    borderRadius: 8,
  },
  copyButtonText: {
    color: 'white',
    fontWeight: '600',
    marginLeft: 5,
  },
  platformInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  platformText: {
    fontSize: 12,
    color: '#666',
    marginLeft: 5,
    flex: 1,
  },
  actionButtonsContainer: {
    flexDirection: 'row',
    marginTop: 30,
    gap: 10,
  },
  doneButton: {
    flex: 1,
    backgroundColor: '#4CAF50',
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 15,
    borderRadius: 12,
  },
  doneButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
  },
  shareButton: {
    flex: 1,
    backgroundColor: 'white',
    borderWidth: 2,
    borderColor: '#667eea',
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 15,
    borderRadius: 12,
  },
  shareButtonText: {
    color: '#667eea',
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
  },
  mentorCard: {
    backgroundColor: 'white',
    padding: 20,
    marginBottom: 10,
  },
  mentorInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  mentorDetails: {
    marginLeft: 15,
    flex: 1,
  },
  mentorName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  sessionFee: {
    fontSize: 16,
    color: '#667eea',
    marginTop: 4,
    fontWeight: '600',
  },
  section: {
    backgroundColor: 'white',
    padding: 20,
    marginBottom: 10,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 15,
  },
  dateGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginHorizontal: -5,
  },
  dateButton: {
    width: '31%',
    margin: '1%',
    padding: 12,
    borderRadius: 8,
    backgroundColor: '#f8f9fa',
    alignItems: 'center',
  },
  selectedDate: {
    backgroundColor: '#667eea',
  },
  dateText: {
    fontSize: 14,
    color: '#333',
  },
  selectedDateText: {
    color: 'white',
  },
  timeGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginHorizontal: -5,
  },
  timeButton: {
    width: '31%',
    margin: '1%',
    padding: 12,
    borderRadius: 8,
    backgroundColor: '#f8f9fa',
    alignItems: 'center',
  },
  selectedTime: {
    backgroundColor: '#667eea',
  },
  timeText: {
    fontSize: 14,
    color: '#333',
  },
  selectedTimeText: {
    color: 'white',
  },
  detailsCard: {
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
  paymentInfo: {
    backgroundColor: '#F0F4FF',
    padding: 15,
    borderRadius: 8,
  },
  paymentText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#667eea',
    marginBottom: 5,
  },
  paymentSubtext: {
    fontSize: 14,
    color: '#666',
  },
  requestButton: {
    backgroundColor: '#667eea',
    margin: 20,
    padding: 20,
    borderRadius: 12,
    alignItems: 'center',
  },
  disabledButton: {
    backgroundColor: '#cccccc',
  },
  requestButtonText: {
    color: 'white',
    fontSize: 18,
    fontWeight: '700',
  },
  requestButtonSubtext: {
    color: 'rgba(255, 255, 255, 0.9)',
    fontSize: 14,
    marginTop: 4,
  },
  noteInputContainer: {
    backgroundColor: '#f8f9fa',
    borderRadius: 8,
    marginTop: 10,
  },
  noteInput: {
    padding: 10,
    fontSize: 14,
    minHeight: 40,
    color: '#333',
  },

  // Email Status Styles
  emailStatusCard: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 20,
    marginTop: 10,
    borderLeftWidth: 4,
    borderLeftColor: '#667eea',
  },
  emailSendingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 15,
  },
  emailSuccessRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 15,
  },
  emailPendingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 15,
  },
  emailSendingText: {
    fontSize: 16,
    color: '#ffa726',
    marginLeft: 10,
    fontWeight: '600',
  },
  emailSuccessText: {
    fontSize: 16,
    color: '#4CAF50',
    marginLeft: 10,
    fontWeight: '600',
    flex: 1,
  },
  emailPendingText: {
    fontSize: 16,
    color: '#ffa726',
    marginLeft: 10,
    fontWeight: '600',
  },
  emailNote: {
    fontSize: 14,
    color: '#666',
    fontStyle: 'italic',
    marginTop: 10,
    paddingTop: 15,
    borderTopWidth: 1,
    borderTopColor: '#f0f0f0',
  },
  emailActionButtons: {
    flexDirection: 'row',
    marginTop: 15,
    gap: 10,
  },
  previewEmailButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#f8f9ff',
    borderWidth: 1,
    borderColor: '#667eea',
    borderRadius: 8,
    padding: 12,
  },
  previewEmailText: {
    color: '#667eea',
    fontSize: 14,
    fontWeight: '600',
    marginLeft: 5,
  },
  resendEmailButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#f8f9ff',
    borderWidth: 1,
    borderColor: '#667eea',
    borderRadius: 8,
    padding: 12,
  },
  resendEmailText: {
    color: '#667eea',
    fontSize: 14,
    fontWeight: '600',
    marginLeft: 5,
  },
  // New styles for pending and rejected states
  pendingContainer: {
    flex: 1,
    padding: 20,
  },
  pendingHeader: {
    alignItems: 'center',
    paddingVertical: 30,
    backgroundColor: 'white',
    borderRadius: 12,
    marginBottom: 20,
  },
  pendingTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    marginTop: 15,
    textAlign: 'center',
  },
  pendingSubtitle: {
    fontSize: 16,
    color: '#666',
    marginTop: 8,
    textAlign: 'center',
  },
  statusCard: {
    backgroundColor: '#fff8e1',
    borderRadius: 12,
    padding: 15,
    borderLeftWidth: 4,
    borderLeftColor: '#ffa726',
  },
  statusText: {
    fontSize: 14,
    color: '#333',
    lineHeight: 20,
    marginBottom: 8,
  },
  cancelButton: {
    backgroundColor: 'white',
    borderWidth: 2,
    borderColor: '#e53e3e',
    borderRadius: 12,
    padding: 15,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  cancelButtonText: {
    color: '#e53e3e',
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
  },
  rejectedContainer: {
    flex: 1,
    padding: 20,
  },
  rejectedHeader: {
    alignItems: 'center',
    paddingVertical: 30,
    backgroundColor: 'white',
    borderRadius: 12,
    marginBottom: 20,
  },
  rejectedTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    marginTop: 15,
    textAlign: 'center',
  },
  rejectedSubtitle: {
    fontSize: 16,
    color: '#666',
    marginTop: 8,
    textAlign: 'center',
  },
  suggestionCard: {
    backgroundColor: '#f8f9fa',
    borderRadius: 12,
    padding: 15,
  },
  suggestionText: {
    fontSize: 14,
    color: '#333',
    lineHeight: 20,
    marginBottom: 8,
  },
  tryAgainButton: {
    backgroundColor: '#667eea',
    borderRadius: 12,
    padding: 15,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  tryAgainButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
  },
});
