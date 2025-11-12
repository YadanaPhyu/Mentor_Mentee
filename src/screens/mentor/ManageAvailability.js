import React, { useEffect, useMemo, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Switch,
} from 'react-native';
import { useLanguage } from '../../context/LanguageContext';
import { useAuth } from '../../context/AuthContext';

export default function ManageAvailability() {
  const { t } = useLanguage();
  const { user, API_URL, fetchWithTimeout } = useAuth();
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [available, setAvailable] = useState(true);
  const [saveToastVisible, setSaveToastVisible] = useState(false);
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

  // Convert weekly pattern to date->times mapping for next 7 days in dd-MM-yyyy format
  const weeklyToDateSlots = (weekly) => {
    const slots = {};
    const now = new Date();
    const timeFor = {
      morning: '10:00:00',
      afternoon: '14:00:00',
      evening: '17:00:00',
    };
    for (let i = 0; i < 7; i++) {
      const d = new Date(now);
      d.setDate(d.getDate() + i + 1);
      const weekday = d.toLocaleString('en-US', { weekday: 'long' }).toLowerCase();
      const dd = d.getDate().toString().padStart(2, '0');
      const mm = (d.getMonth() + 1).toString().padStart(2, '0');
      const yyyy = d.getFullYear();
      const label = `${dd}-${mm}-${yyyy}`;
      const times = [];
      for (const slot of timeSlots) {
        if (weekly[weekday] && weekly[weekday][slot]) times.push(timeFor[slot]);
      }
      if (times.length > 0) slots[label] = times;
    }
    return slots;
  };

  // Convert preferred_meeting_times map to a coarse weekly pattern guess
  const meetingTimesToWeekly = (meetingTimes) => {
    try {
      const parsed = typeof meetingTimes === 'string' ? JSON.parse(meetingTimes) : meetingTimes;
      const newWeekly = JSON.parse(JSON.stringify(availability));
      const timeToSlot = {
        '10:00:00': 'morning',
        '09:00:00': 'morning',
        '11:00:00': 'morning',
        '13:00:00': 'afternoon',
        '14:00:00': 'afternoon',
        '15:00:00': 'afternoon',
        '16:00:00': 'evening',
        '17:00:00': 'evening',
      };
      // Look at next 7 keys and infer typical slots
      Object.values(parsed).forEach((arr) => {
        (arr || []).forEach((time) => {
          const slot = timeToSlot[time];
          if (slot) {
            // spread across all days to show intent; users can fine-tune
            days.forEach((d) => {
              newWeekly[d][slot] = true;
            });
          }
        });
      });
      return newWeekly;
    } catch (e) {
      return availability;
    }
  };

  useEffect(() => {
    const load = async () => {
      if (!user?.id) return;
      try {
        setLoading(true);
        const res = await fetchWithTimeout(`${API_URL}/api/mentors/${user.id}`);
        if (!res.ok) throw new Error(`Failed to load mentor profile: ${res.status}`);
        const data = await res.json();
        setAvailable((data.availability_status || 'available') === 'available');
        if (data.preferred_meeting_times) {
          setAvailability(meetingTimesToWeekly(data.preferred_meeting_times));
        }
      } catch (e) {
        console.warn('Failed to load mentor availability', e);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [user?.id, API_URL, fetchWithTimeout]);

  const handleSave = async () => {
    if (!user?.id) return;
    try {
      setSaving(true);
      const payload = {
        availability_status: available ? 'available' : 'unavailable',
        preferred_meeting_times: weeklyToDateSlots(availability),
      };
      const res = await fetchWithTimeout(`${API_URL}/api/mentors/${user.id}/availability`, {
        method: 'PUT',
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Failed to update availability');
      }
      setSaveToastVisible(true);
      setTimeout(() => setSaveToastVisible(false), 1500);
    } catch (e) {
      console.error('Save availability error', e);
      alert(e.message || 'Failed to save availability');
    } finally {
      setSaving(false);
    }
  };

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.header}>{t('setYourAvailability')}</Text>

      <View style={styles.availabilityToggle}>
        <Text style={styles.availabilityLabel}>{t('availableForMentoring') || 'Available for mentoring'}</Text>
        <Switch
          value={available}
          onValueChange={setAvailable}
          trackColor={{ false: '#767577', true: '#667eea' }}
          thumbColor={available ? '#764ba2' : '#f4f3f4'}
        />
      </View>
      
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

      <TouchableOpacity style={[styles.saveButton, saving && { opacity: 0.6 }]} onPress={handleSave} disabled={saving || loading}>
        <Text style={styles.saveButtonText}>{saving ? (t('saving') || 'Saving...') : t('saveAvailability')}</Text>
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
  availabilityToggle: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 15,
    marginBottom: 15,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  availabilityLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
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
  toastContainer: {
    position: 'absolute',
    bottom: 20,
    left: 20,
    right: 20,
    backgroundColor: 'rgba(51, 171, 83, 0.95)',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 6,
    elevation: 3,
  },
  toastText: {
    color: 'white',
    fontWeight: '600',
  },
});
