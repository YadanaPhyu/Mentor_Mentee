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
import { Ionicons } from '@expo/vector-icons';
import { useLanguage } from '../../context/LanguageContext';

export default function BookSession({ route, navigation }) {
  const { mentorId, mentorName, sessionFee } = route.params;
  const { t } = useLanguage();
  const [selectedDate, setSelectedDate] = useState(null);
  const [selectedTime, setSelectedTime] = useState(null);
  const [requestNote, setRequestNote] = useState('');

  // Mock available time slots
  const availableSlots = {
    'Jul 21': ['10:00 AM', '2:00 PM', '4:00 PM'],
    'Jul 22': ['9:00 AM', '1:00 PM', '3:00 PM'],
    'Jul 23': ['11:00 AM', '2:00 PM', '5:00 PM'],
  };

  const handleRequestSession = () => {
    if (!selectedDate || !selectedTime) {
      Alert.alert('Error', 'Please select both date and time for your session');
      return;
    }

    Alert.alert(
      'Confirm Session Request',
      `Would you like to request a session with ${mentorName} for ${selectedDate} at ${selectedTime}?`,
      [
        {
          text: 'Cancel',
          style: 'cancel',
        },
        {
          text: 'Confirm',
          onPress: () => {
            // Here you would typically make an API call to create the session request
            Alert.alert(
              'Request Sent',
              'Your session request has been sent to the mentor. You will be notified once they confirm.',
              [
                {
                  text: 'OK',
                  onPress: () => navigation.navigate('MentorshipProgress'),
                },
              ]
            );
          },
        },
      ]
    );
  };

  return (
    <ScrollView style={styles.container}>
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

      <TouchableOpacity
        style={[
          styles.requestButton,
          (!selectedDate || !selectedTime) && styles.disabledButton,
        ]}
        disabled={!selectedDate || !selectedTime}
        onPress={handleRequestSession}
      >
        <Text style={styles.requestButtonText}>Request Session</Text>
        <Text style={styles.requestButtonSubtext}>
          {sessionFee === 0 ? 'Free Session' : `₱${sessionFee}`}
        </Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
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
