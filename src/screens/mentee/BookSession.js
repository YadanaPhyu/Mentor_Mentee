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

export default function BookSession({ route, navigation }) {
  const { mentorId, mentorName, sessionFee } = route.params;
  const { t } = useLanguage();
  const [selectedDate, setSelectedDate] = useState(null);
  const [selectedTime, setSelectedTime] = useState(null);
  const [requestNote, setRequestNote] = useState('');
  const [buttonClicked, setButtonClicked] = useState(false);
  const [sessionCreated, setSessionCreated] = useState(false);
  const [createdSession, setCreatedSession] = useState(null);

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

  const handleRequestSession = () => {
    console.log('🚀 Starting session creation process...');
    
    // Check if date and time are selected
    if (!selectedDate || !selectedTime) {
      console.log('Missing date or time');
      setButtonClicked(true);
      setTimeout(() => setButtonClicked(false), 3000);
      return;
    }

    console.log('✅ Form validation passed - creating session...');
    setButtonClicked(true);
    
    // Create session object
    const newSession = {
      id: Date.now().toString(),
      mentorId,
      mentorName,
      date: selectedDate,
      time: selectedTime,
      duration: 60, // minutes
      status: 'confirmed',
      topic: requestNote || 'General mentoring session',
      fee: sessionFee,
    };

    console.log('📝 Created session object:', newSession);

    // Auto-generate video call link
    try {
      const sessionWithVideoCall = VideoCallService.addMeetingToSession(newSession);
      console.log('🎥 Video call generated:', sessionWithVideoCall.videoCall);

      // Set the created session to show success screen
      setCreatedSession(sessionWithVideoCall);
      setSessionCreated(true);
      setButtonClicked(false);

    } catch (error) {
      console.error('❌ Error creating video call:', error);
      setButtonClicked(false);
    }
  };

  return (
    <ScrollView style={styles.container}>
      {/* Show success screen if session is created */}
      {sessionCreated && createdSession ? (
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
          {sessionFee === 0 ? 'Free Session' : `₱${sessionFee}`}
        </Text>
      </TouchableOpacity>
        </>
      )}
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
});
