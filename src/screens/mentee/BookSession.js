import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useLanguage } from '../../context/LanguageContext';

export default function BookSession({ route, navigation }) {
  const { t } = useLanguage();
  const [selectedDate, setSelectedDate] = useState(null);
  const [selectedTime, setSelectedTime] = useState(null);

  // Mock available time slots
  const availableSlots = {
    'Jul 21': ['10:00 AM', '2:00 PM', '4:00 PM'],
    'Jul 22': ['9:00 AM', '1:00 PM', '3:00 PM'],
    'Jul 23': ['11:00 AM', '2:00 PM', '5:00 PM'],
  };

  return (
    <ScrollView style={styles.container}>
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

      <TouchableOpacity
        style={[
          styles.confirmButton,
          (!selectedDate || !selectedTime) && styles.disabledButton,
        ]}
        disabled={!selectedDate || !selectedTime}
        onPress={() => {
          // Handle session booking
          navigation.navigate('MentorshipProgress');
        }}
      >
        <Text style={styles.confirmButtonText}>{t('confirmBooking')}</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
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
  confirmButton: {
    backgroundColor: '#667eea',
    margin: 20,
    padding: 15,
    borderRadius: 12,
    alignItems: 'center',
  },
  disabledButton: {
    backgroundColor: '#cccccc',
  },
  confirmButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
});
