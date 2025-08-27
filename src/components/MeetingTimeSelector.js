import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Modal,
  ScrollView,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Calendar } from 'react-native-calendars';

const TIME_SLOTS = [
  '9:00 AM', '10:00 AM', '11:00 AM', '12:00 PM',
  '1:00 PM', '2:00 PM', '3:00 PM', '4:00 PM',
  '5:00 PM', '6:00 PM'
];

export default function MeetingTimeSelector({ value, onChange }) {
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedDate, setSelectedDate] = useState(null);
  const [availability, setAvailability] = useState(() => {
    if (!value) return {};
    try {
      return typeof value === 'string' ? JSON.parse(value) : value;
    } catch (e) {
      console.warn('Failed to parse initial availability:', e);
      return {};
    }
  });
  
  // Set up the date range for the calendar
  const today = new Date();
  const maxDate = new Date();
  maxDate.setDate(today.getDate() + 30); // 1 month window

  useEffect(() => {
    if (value) {
      try {
        const parsedValue = typeof value === 'string' ? JSON.parse(value) : value;
        setAvailability(parsedValue);
      } catch (e) {
        console.warn('Failed to parse availability:', e);
        setAvailability({});
      }
    }
  }, [value]);

  const toggleTimeSlot = (date, time) => {
    const dateStr = date.toISOString().split('T')[0];
    const dateTimes = availability[dateStr] || [];
    const newDateTimes = dateTimes.includes(time)
      ? dateTimes.filter(t => t !== time)
      : [...dateTimes, time].sort();

    const newAvailability = {
      ...availability,
      [dateStr]: newDateTimes
    };

    if (newDateTimes.length === 0) {
      delete newAvailability[dateStr];
    }

    setAvailability(newAvailability);
    onChange(JSON.stringify(newAvailability));
  };

  const getAvailabilityDisplay = () => {
    const dates = Object.keys(availability);
    if (dates.length === 0) return 'Click to set your availability';
    
    return dates
      .sort()
      .map(date => {
        const formattedDate = new Date(date).toLocaleDateString();
        return `${formattedDate}: ${availability[date].map(time => time.replace(':00', '')).join(', ')}`;
      })
      .join('\n');
  };

  const getMarkedDates = () => {
    const marked = {};
    Object.keys(availability).forEach(date => {
      marked[date] = { marked: true, dotColor: '#2196F3' };
    });
    if (selectedDate) {
      marked[selectedDate] = {
        ...marked[selectedDate],
        selected: true,
        selectedColor: '#2196F3'
      };
    }
    return marked;
  };

  return (
    <View style={styles.container}>
      <TouchableOpacity
        style={styles.selector}
        onPress={() => setModalVisible(true)}
      >
        <View style={styles.selectorContent}>
          <Text style={styles.label}>Available Meeting Times</Text>
          <Text style={styles.value} numberOfLines={5}>{getAvailabilityDisplay()}</Text>
        </View>
        <Ionicons name="chevron-forward" size={24} color="#666" />
      </TouchableOpacity>

      <Modal
        animationType="slide"
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => {
          setSelectedDate(null);
          setModalVisible(false);
        }}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Set Your Availability</Text>
              <TouchableOpacity
                onPress={() => {
                  setSelectedDate(null);
                  setModalVisible(false);
                }}
                style={styles.closeButton}
              >
                <Ionicons name="close" size={24} color="#000" />
              </TouchableOpacity>
            </View>

            <ScrollView>
              <Calendar
                minDate={today.toISOString().split('T')[0]}
                maxDate={maxDate.toISOString().split('T')[0]}
                onDayPress={(day) => setSelectedDate(day.dateString)}
                markedDates={getMarkedDates()}
                theme={{
                  selectedDayBackgroundColor: '#2196F3',
                  dotColor: '#2196F3',
                  todayTextColor: '#2196F3',
                }}
              />
              {selectedDate && (
                <View style={styles.timeSelectionContainer}>
                  <Text style={styles.selectedDateText}>
                    {new Date(selectedDate).toLocaleDateString()}
                  </Text>
                  <View style={styles.timeGrid}>
                    {TIME_SLOTS.map(time => {
                      const isSelected = (availability[selectedDate] || []).includes(time);
                      return (
                        <TouchableOpacity
                          key={time}
                          style={[
                            styles.timeSlot,
                            isSelected && styles.selectedTimeSlot
                          ]}
                          onPress={() => toggleTimeSlot(new Date(selectedDate), time)}
                        >
                          <Text style={[
                            styles.timeText,
                            isSelected && styles.selectedTimeText
                          ]}>
                            {time.replace(':00', '')}
                          </Text>
                        </TouchableOpacity>
                      );
                    })}
                  </View>
                </View>
              )}
            </ScrollView>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: 15,
  },
  selector: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 15,
    backgroundColor: '#f8f9fa',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#e9ecef',
  },
  selectorContent: {
    flex: 1,
    marginRight: 10,
  },
  label: {
    fontSize: 16,
    color: '#212529',
    marginBottom: 5,
    fontWeight: '600',
  },
  value: {
    fontSize: 14,
    color: '#666',
    lineHeight: 20,
  },
  modalContainer: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalContent: {
    flex: 1,
    backgroundColor: '#fff',
    marginTop: 50,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#e9ecef',
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#212529',
  },
  closeButton: {
    padding: 5,
  },
  timeSelectionContainer: {
    padding: 15,
  },
  selectedDateText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#212529',
    marginBottom: 15,
    textAlign: 'center',
  },
  timeGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    gap: 10,
    padding: 10,
  },
  timeSlot: {
    width: '22%',
    aspectRatio: 2,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f8f9fa',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#e9ecef',
  },
  selectedTimeSlot: {
    backgroundColor: '#2196F3',
    borderColor: '#2196F3',
  },
  timeText: {
    fontSize: 14,
    color: '#212529',
  },
  selectedTimeText: {
    color: '#fff',
  },
});
