import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Switch,
} from 'react-native';
import { useLanguage } from '../../context/LanguageContext';

export default function ManageAvailability() {
  const { t } = useLanguage();
  const [availability, setAvailability] = useState({
    monday: { morning: false, afternoon: false, evening: false },
    tuesday: { morning: false, afternoon: false, evening: false },
    wednesday: { morning: false, afternoon: false, evening: false },
    thursday: { morning: false, afternoon: false, evening: false },
    friday: { morning: false, afternoon: false, evening: false },
    saturday: { morning: false, afternoon: false, evening: false },
    sunday: { morning: false, afternoon: false, evening: false },
  });

  const toggleTimeSlot = (day, slot) => {
    setAvailability(prev => ({
      ...prev,
      [day]: { ...prev[day], [slot]: !prev[day][slot] }
    }));
  };

  const days = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'];
  const timeSlots = ['morning', 'afternoon', 'evening'];

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.header}>{t('setYourAvailability')}</Text>
      
      {days.map((day) => (
        <View key={day} style={styles.dayContainer}>
          <Text style={styles.dayTitle}>{t(day)}</Text>
          <View style={styles.slotsContainer}>
            {timeSlots.map((slot) => (
              <View key={slot} style={styles.slotRow}>
                <Text style={styles.slotText}>{t(slot)}</Text>
                <Switch
                  value={availability[day][slot]}
                  onValueChange={() => toggleTimeSlot(day, slot)}
                  trackColor={{ false: '#767577', true: '#667eea' }}
                  thumbColor={availability[day][slot] ? '#764ba2' : '#f4f3f4'}
                />
              </View>
            ))}
          </View>
        </View>
      ))}

      <TouchableOpacity style={styles.saveButton}>
        <Text style={styles.saveButtonText}>{t('saveAvailability')}</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
    padding: 20,
  },
  header: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 20,
  },
  dayContainer: {
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
  dayTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 10,
    textTransform: 'capitalize',
  },
  slotsContainer: {
    marginLeft: 10,
  },
  slotRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
  },
  slotText: {
    fontSize: 14,
    color: '#666',
    textTransform: 'capitalize',
  },
  saveButton: {
    backgroundColor: '#667eea',
    padding: 15,
    borderRadius: 12,
    alignItems: 'center',
    marginTop: 20,
    marginBottom: 30,
  },
  saveButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
});
