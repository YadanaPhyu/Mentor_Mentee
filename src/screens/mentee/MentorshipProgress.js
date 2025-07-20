import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useLanguage } from '../../context/LanguageContext';

export default function MentorshipProgress({ route, navigation }) {
  const { t } = useLanguage();

  // Mock session data - in a real app, this would come from props or API
  const sessionData = {
    date: 'Jul 21',
    time: '2:00 PM',
    duration: '60 minutes',
    status: 'confirmed',
    mentor: {
      name: 'John Doe',
      expertise: 'React Native Development',
    },
  };

  const renderStatusIcon = () => {
    switch (sessionData.status) {
      case 'confirmed':
        return <Ionicons name="checkmark-circle" size={50} color="#4CAF50" />;
      case 'pending':
        return <Ionicons name="time" size={50} color="#FFC107" />;
      case 'cancelled':
        return <Ionicons name="close-circle" size={50} color="#F44336" />;
      default:
        return null;
    }
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.statusContainer}>
        {renderStatusIcon()}
        <Text style={styles.statusText}>
          {t('sessionStatus')}: {sessionData.status.toUpperCase()}
        </Text>
      </View>

      <View style={styles.card}>
        <Text style={styles.cardTitle}>{t('sessionDetails')}</Text>
        <View style={styles.detailRow}>
          <Ionicons name="calendar-outline" size={24} color="#667eea" />
          <Text style={styles.detailText}>{sessionData.date}</Text>
        </View>
        <View style={styles.detailRow}>
          <Ionicons name="time-outline" size={24} color="#667eea" />
          <Text style={styles.detailText}>{sessionData.time}</Text>
        </View>
        <View style={styles.detailRow}>
          <Ionicons name="hourglass-outline" size={24} color="#667eea" />
          <Text style={styles.detailText}>{sessionData.duration}</Text>
        </View>
      </View>

      <View style={styles.card}>
        <Text style={styles.cardTitle}>{t('mentorInfo')}</Text>
        <View style={styles.detailRow}>
          <Ionicons name="person-outline" size={24} color="#667eea" />
          <Text style={styles.detailText}>{sessionData.mentor.name}</Text>
        </View>
        <View style={styles.detailRow}>
          <Ionicons name="briefcase-outline" size={24} color="#667eea" />
          <Text style={styles.detailText}>{sessionData.mentor.expertise}</Text>
        </View>
      </View>

      <View style={styles.buttonContainer}>
        <TouchableOpacity
          style={styles.actionButton}
          onPress={() => navigation.navigate('Messages')}
        >
          <Ionicons name="chatbubbles-outline" size={24} color="white" />
          <Text style={styles.buttonText}>{t('messageNow')}</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.actionButton, styles.cancelButton]}
          onPress={() => {
            // Handle session cancellation
            navigation.goBack();
          }}
        >
          <Ionicons name="close-circle-outline" size={24} color="white" />
          <Text style={styles.buttonText}>{t('cancelSession')}</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  statusContainer: {
    backgroundColor: 'white',
    padding: 20,
    alignItems: 'center',
    marginBottom: 10,
  },
  statusText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginTop: 10,
  },
  card: {
    backgroundColor: 'white',
    padding: 20,
    marginBottom: 10,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 15,
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
  buttonContainer: {
    padding: 20,
  },
  actionButton: {
    backgroundColor: '#667eea',
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 15,
    borderRadius: 12,
    marginBottom: 10,
  },
  cancelButton: {
    backgroundColor: '#dc3545',
  },
  buttonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 10,
  },
});
