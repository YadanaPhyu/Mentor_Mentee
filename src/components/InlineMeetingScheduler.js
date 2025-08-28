import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';

// Common time slots that mentors might be available
const TIME_SLOTS = [
  '9:00 AM',
  '10:00 AM', 
  '11:00 AM', 
  '12:00 PM',
  '1:00 PM', 
  '2:00 PM', 
  '3:00 PM', 
  '4:00 PM',
  '5:00 PM', 
  '6:00 PM',
];

// Get date objects for the next 7 days
const getUpcomingDays = () => {
  const days = [];
  const today = new Date();
  
  for (let i = 0; i < 7; i++) {
    const date = new Date();
    date.setDate(today.getDate() + i);
    days.push(date);
  }
  
  return days;
};

export default function InlineMeetingScheduler({ value, onChange }) {
  // Parse the initial value or use an empty object
  const [selectedTimes, setSelectedTimes] = useState(() => {
    try {
      return typeof value === 'string' ? JSON.parse(value) : value || {};
    } catch (e) {
      console.warn('Failed to parse meeting times:', e);
      return {};
    }
  });
  
  // Generate the upcoming days
  const upcomingDays = getUpcomingDays();
  
  // Update the parent when our internal state changes
  useEffect(() => {
    try {
      // Only notify parent if the selectedTimes actually changed
      const jsonString = JSON.stringify(selectedTimes);
      
      // Check if this is different from the current value
      const currentValue = typeof value === 'string' ? value : JSON.stringify(value || {});
      
      if (jsonString !== currentValue) {
        console.log('InlineMeetingScheduler: Updating parent with new times');
        onChange(jsonString);
      }
    } catch (e) {
      console.error('Error saving selected times:', e);
      onChange('{}');
    }
  }, [selectedTimes]);
  
  // Update our internal state when the parent value changes
  useEffect(() => {
    if (value) {
      try {
        const parsedValue = typeof value === 'string' ? JSON.parse(value) : value;
        setSelectedTimes(parsedValue);
      } catch (e) {
        console.warn('Failed to parse time value:', e);
        setSelectedTimes({});
      }
    } else {
      setSelectedTimes({});
    }
  }, [value]);
  
  // Format a date to ISO string date part
  const formatDate = (date) => date.toISOString().split('T')[0];
  
  // Toggle a time slot for a specific date
  const toggleTimeSlot = (date, time) => {
    const dateStr = formatDate(date);
    const dateTimes = selectedTimes[dateStr] || [];
    const newDateTimes = dateTimes.includes(time)
      ? dateTimes.filter(t => t !== time)
      : [...dateTimes, time].sort();
      
    const newSelectedTimes = { ...selectedTimes };
    
    if (newDateTimes.length > 0) {
      newSelectedTimes[dateStr] = newDateTimes;
    } else {
      delete newSelectedTimes[dateStr];
    }
    
    setSelectedTimes(newSelectedTimes);
  };
  
  // Check if a time slot is selected for a specific date
  const isTimeSelected = (date, time) => {
    const dateStr = formatDate(date);
    return selectedTimes[dateStr]?.includes(time) || false;
  };
  
  // Format the day name and date
  const formatDayLabel = (date) => {
    const isToday = new Date().toDateString() === date.toDateString();
    const day = date.toLocaleDateString('en-US', { weekday: 'short' });
    const dateNum = date.getDate();
    
    return `${day} ${dateNum}${isToday ? ' (Today)' : ''}`;
  };
  
  return (
    <View style={styles.container}>
      <View style={styles.instructionsRow}>
        <Ionicons name="information-circle-outline" size={16} color="#667eea" />
        <Text style={styles.instructions}>Swipe horizontally to see more days →</Text>
      </View>
      
      <ScrollView 
        horizontal 
        showsHorizontalScrollIndicator={false}
        style={styles.daysScroll}
      >
        {upcomingDays.map((day, dayIndex) => (
          <View key={dayIndex} style={styles.dayColumn}>
            <Text style={styles.dayLabel}>{formatDayLabel(day)}</Text>
            
            <View style={styles.timeSlotContainer}>
              {TIME_SLOTS.map((time, timeIndex) => (
                <TouchableOpacity
                  key={timeIndex}
                  style={[
                    styles.timeSlot,
                    isTimeSelected(day, time) && styles.selectedTimeSlot,
                    timeIndex === 0 && { borderTopWidth: 2, borderTopColor: '#ddd' }
                  ]}
                  onPress={() => toggleTimeSlot(day, time)}
                  activeOpacity={0.7}
                >
                  <Text 
                    style={[
                      styles.timeText,
                      isTimeSelected(day, time) && styles.selectedTimeText
                    ]}
                  >
                    {time}
                  </Text>
                  
                  {isTimeSelected(day, time) && (
                    <Ionicons 
                      name="checkmark-circle" 
                      size={14} 
                      color="#fff" 
                      style={styles.checkIcon}
                    />
                  )}
                </TouchableOpacity>
              ))}
            </View>
          </View>
        ))}
      </ScrollView>
      
      <View style={styles.summary}>
        <View style={styles.summaryDetails}>
          <Text style={styles.summaryTitle}>
            {Object.keys(selectedTimes).length > 0 
              ? `${Object.keys(selectedTimes).length} day${Object.keys(selectedTimes).length > 1 ? 's' : ''} selected` 
              : 'No times selected'}
          </Text>
          {Object.keys(selectedTimes).length > 0 && (
            <Text style={styles.summarySubtitle}>
              {(() => {
                // Calculate total time slots selected
                let totalSlots = 0;
                Object.values(selectedTimes).forEach(times => {
                  totalSlots += times.length;
                });
                return `${totalSlots} time slot${totalSlots !== 1 ? 's' : ''} total`;
              })()}
            </Text>
          )}
        </View>
        <TouchableOpacity 
          style={[
            styles.clearButton,
            Object.keys(selectedTimes).length === 0 && styles.disabledButton
          ]}
          disabled={Object.keys(selectedTimes).length === 0}
          onPress={() => setSelectedTimes({})}
        >
          <Text style={[
            styles.clearButtonText,
            Object.keys(selectedTimes).length === 0 && styles.disabledButtonText
          ]}>Clear All</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginTop: 10,
  },
  instructionsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
    paddingHorizontal: 5,
  },
  instructions: {
    fontSize: 12,
    color: '#667eea',
    marginLeft: 6,
    fontStyle: 'italic',
  },
  daysScroll: {
    marginBottom: 8,
  },
  dayColumn: {
    width: 140,
    marginRight: 12,
    backgroundColor: '#f8f9fa',
    borderRadius: 12,
    padding: 10,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 2,
  },
  dayLabel: {
    fontSize: 15,
    fontWeight: '600',
    marginBottom: 10,
    textAlign: 'center',
    color: '#495057',
  },
  timeSlotContainer: {
    width: '100%',
  },
  timeSlot: {
    padding: 10,
    marginVertical: 4,
    borderRadius: 8,
    backgroundColor: 'white',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#e9ecef',
  },
  selectedTimeSlot: {
    backgroundColor: '#667eea',
    borderColor: '#667eea',
  },
  timeText: {
    fontSize: 13,
    flex: 1,
  },
  selectedTimeText: {
    color: 'white',
    fontWeight: '500',
  },
  checkIcon: {
    marginLeft: 6,
  },
  summary: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 15,
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: '#e9ecef',
  },
  summaryDetails: {
    flex: 1,
  },
  summaryTitle: {
    fontSize: 14,
    color: '#666',
    fontWeight: '500',
  },
  summarySubtitle: {
    fontSize: 12,
    color: '#888',
    marginTop: 2,
  },
  clearButton: {
    paddingVertical: 8,
    paddingHorizontal: 12,
    backgroundColor: '#f1f3f5',
    borderRadius: 8,
  },
  disabledButton: {
    backgroundColor: '#f8f9fa',
    opacity: 0.5,
  },
  clearButtonText: {
    color: '#495057',
    fontSize: 13,
    fontWeight: '500',
  },
  disabledButtonText: {
    color: '#adb5bd',
  },
});
