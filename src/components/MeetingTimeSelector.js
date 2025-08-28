import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';

/**
 * A component for selecting and managing meeting times
 * Allows users to select available times within the next month
 */
const MeetingTimeSelector = ({ 
  value = {},  // Initial value - object with date keys and array of time slots
  onChange,    // Callback when value changes
  maxDays = 30, // Max number of days to show (default 30 - a month)
}) => {
  const [selectedDate, setSelectedDate] = useState(null);
  const [availableDates, setAvailableDates] = useState([]);
  const [meetingTimes, setMeetingTimes] = useState(value || {});

  // Generate available dates (current date + next 30 days)
  useEffect(() => {
    const today = new Date();
    const dates = [];
    
    for (let i = 0; i < maxDays; i++) {
      const date = new Date(today);
      date.setDate(today.getDate() + i);
      dates.push(date);
    }
    
    setAvailableDates(dates);
    
    // If no date is selected, select today by default
    if (!selectedDate) {
      setSelectedDate(formatDate(today));
    }
  }, [maxDays]);

  // Time slots to choose from
  const timeSlots = [
    '09:00', '10:00', '11:00', '12:00', '13:00', 
    '14:00', '15:00', '16:00', '17:00', '18:00'
  ];

  // Format date to YYYY-MM-DD string
  const formatDate = (date) => {
    return date.toISOString().split('T')[0];
  };

  // Format date for display (e.g., "Mon, 28 Aug")
  const formatDateDisplay = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      weekday: 'short', 
      day: 'numeric',
      month: 'short'
    });
  };

  // Handle time slot selection/deselection
  const toggleTimeSlot = (time) => {
    if (!selectedDate) return;
    
    setMeetingTimes(prev => {
      const newMeetingTimes = { ...prev };
      
      // Initialize array for this date if it doesn't exist
      if (!newMeetingTimes[selectedDate]) {
        newMeetingTimes[selectedDate] = [];
      }
      
      // Toggle the time slot
      if (newMeetingTimes[selectedDate].includes(time)) {
        newMeetingTimes[selectedDate] = newMeetingTimes[selectedDate]
          .filter(t => t !== time);
          
        // Remove the date key if no times are selected
        if (newMeetingTimes[selectedDate].length === 0) {
          delete newMeetingTimes[selectedDate];
        }
      } else {
        newMeetingTimes[selectedDate].push(time);
        // Sort times chronologically
        newMeetingTimes[selectedDate].sort();
      }
      
      // Call onChange with the updated meeting times
      if (onChange) {
        onChange(newMeetingTimes);
      }
      
      return newMeetingTimes;
    });
  };

  // Check if a time slot is selected for the current date
  const isTimeSelected = (time) => {
    return selectedDate && 
      meetingTimes[selectedDate] && 
      meetingTimes[selectedDate].includes(time);
  };

  // Handle date selection
  const handleDateSelect = (dateString) => {
    setSelectedDate(dateString);
  };

  // Clear all meeting times
  const clearAllTimes = () => {
    Alert.alert(
      "Clear All Times", 
      "Are you sure you want to clear all selected meeting times?",
      [
        { text: "Cancel", style: "cancel" },
        { 
          text: "Clear All", 
          style: "destructive",
          onPress: () => {
            setMeetingTimes({});
            if (onChange) {
              onChange({});
            }
          }
        }
      ]
    );
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Select Available Meeting Times</Text>
        {Object.keys(meetingTimes).length > 0 && (
          <TouchableOpacity 
            style={styles.clearButton} 
            onPress={clearAllTimes}
          >
            <Text style={styles.clearButtonText}>Clear All</Text>
          </TouchableOpacity>
        )}
      </View>
      
      {/* Date selector */}
      <ScrollView 
        horizontal 
        showsHorizontalScrollIndicator={false}
        style={styles.dateSelector}
      >
        {availableDates.map((date) => {
          const dateString = formatDate(date);
          const isSelected = dateString === selectedDate;
          const hasTimeSlots = meetingTimes[dateString] && meetingTimes[dateString].length > 0;
          
          return (
            <TouchableOpacity
              key={dateString}
              style={[
                styles.dateItem,
                isSelected && styles.selectedDateItem,
                hasTimeSlots && styles.dateWithTimes
              ]}
              onPress={() => handleDateSelect(dateString)}
            >
              <Text 
                style={[
                  styles.dateText,
                  isSelected && styles.selectedDateText
                ]}
              >
                {formatDateDisplay(dateString)}
              </Text>
              {hasTimeSlots && (
                <View style={styles.timeIndicator}>
                  <Text style={styles.timeCount}>{meetingTimes[dateString].length}</Text>
                </View>
              )}
            </TouchableOpacity>
          );
        })}
      </ScrollView>
      
      {/* Time slots */}
      <View style={styles.timeSlotsContainer}>
        <Text style={styles.subtitle}>
          {selectedDate ? `Available times for ${formatDateDisplay(selectedDate)}` : 'Select a date'}
        </Text>
        
        <View style={styles.timeSlots}>
          {timeSlots.map((time) => (
            <TouchableOpacity
              key={time}
              style={[
                styles.timeSlot,
                isTimeSelected(time) && styles.selectedTimeSlot
              ]}
              onPress={() => toggleTimeSlot(time)}
            >
              <Text 
                style={[
                  styles.timeText,
                  isTimeSelected(time) && styles.selectedTimeText
                ]}
              >
                {time}
              </Text>
              {isTimeSelected(time) && (
                <Ionicons name="checkmark-circle" size={18} color="white" style={styles.checkIcon} />
              )}
            </TouchableOpacity>
          ))}
        </View>
      </View>
      
      {/* Summary of selected times */}
      {Object.keys(meetingTimes).length > 0 && (
        <View style={styles.summary}>
          <Text style={styles.summaryTitle}>Your Available Times:</Text>
          <ScrollView style={styles.summaryContent}>
            {Object.entries(meetingTimes).map(([date, times]) => (
              <View key={date} style={styles.summaryItem}>
                <Text style={styles.summaryDate}>{formatDateDisplay(date)}:</Text>
                <Text style={styles.summaryTimes}>{times.join(', ')}</Text>
              </View>
            ))}
          </ScrollView>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#f8f9fa',
    borderRadius: 8,
    padding: 15,
    marginBottom: 20,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 15,
  },
  title: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
  },
  clearButton: {
    padding: 5,
  },
  clearButtonText: {
    color: '#dc3545',
    fontSize: 14,
    fontWeight: '500',
  },
  dateSelector: {
    flexGrow: 0,
    marginBottom: 20,
  },
  dateItem: {
    paddingVertical: 8,
    paddingHorizontal: 12,
    backgroundColor: '#e9ecef',
    borderRadius: 20,
    marginRight: 10,
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  selectedDateItem: {
    backgroundColor: '#667eea',
  },
  dateWithTimes: {
    borderWidth: 1,
    borderColor: '#667eea',
  },
  dateText: {
    fontSize: 14,
    color: '#495057',
  },
  selectedDateText: {
    color: '#fff',
    fontWeight: '500',
  },
  timeIndicator: {
    position: 'absolute',
    top: -5,
    right: -5,
    backgroundColor: '#28a745',
    width: 18,
    height: 18,
    borderRadius: 9,
    alignItems: 'center',
    justifyContent: 'center',
  },
  timeCount: {
    color: '#fff',
    fontSize: 10,
    fontWeight: 'bold',
  },
  timeSlotsContainer: {
    marginBottom: 20,
  },
  subtitle: {
    fontSize: 14,
    fontWeight: '500',
    marginBottom: 10,
    color: '#495057',
  },
  timeSlots: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  timeSlot: {
    width: '30%',
    backgroundColor: '#e9ecef',
    paddingVertical: 8,
    paddingHorizontal: 8,
    borderRadius: 6,
    marginRight: '3%',
    marginBottom: 10,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
  },
  selectedTimeSlot: {
    backgroundColor: '#667eea',
  },
  timeText: {
    fontSize: 14,
    color: '#495057',
  },
  selectedTimeText: {
    color: '#fff',
  },
  checkIcon: {
    marginLeft: 5,
  },
  summary: {
    backgroundColor: '#e9ecef',
    borderRadius: 8,
    padding: 10,
  },
  summaryTitle: {
    fontSize: 14,
    fontWeight: '500',
    marginBottom: 5,
  },
  summaryContent: {
    maxHeight: 100,
  },
  summaryItem: {
    flexDirection: 'row',
    marginBottom: 5,
  },
  summaryDate: {
    fontWeight: '500',
    marginRight: 5,
  },
  summaryTimes: {
    flex: 1,
  },
});

export default MeetingTimeSelector;
