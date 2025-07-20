import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  TouchableOpacity,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import { useNavigation } from '@react-navigation/native';

export default function HomeScreen() {
  const { user, userType } = useAuth();
  const { t } = useLanguage();
  const navigation = useNavigation();

  const stats = [
    { label: t('connections'), value: '12', icon: 'people' },
    { label: t('messages'), value: '8', icon: 'chatbubbles' },
    { label: t('sessions'), value: '24', icon: 'time' },
  ];

  const recentActivities = [
    { id: 1, text: 'New message from John Doe', time: '2 min ago' },
    { id: 2, text: 'Mentoring session completed', time: '1 hour ago' },
    { id: 3, text: 'Profile viewed by 3 people', time: '3 hours ago' },
  ];

  return (
    <SafeAreaView style={styles.container}>
      <LinearGradient
        colors={['#667eea', '#764ba2']}
        style={styles.header}
      >
        <View style={styles.headerContent}>
          <Text style={styles.greeting}>
            {t('welcomeBack2')}, {user?.name || 'User'}!
          </Text>
          <Text style={styles.userTypeText}>
            {userType === 'mentor' ? t('mentorDashboard') : t('menteeDashboard')}
          </Text>
        </View>
      </LinearGradient>

      <ScrollView style={styles.content}>
        <View style={styles.statsContainer}>
          <Text style={styles.sectionTitle}>{t('yourStats')}</Text>
          <View style={styles.statsGrid}>
            {stats.map((stat, index) => (
              <View key={index} style={styles.statCard}>
                <Ionicons name={stat.icon} size={30} color="#667eea" />
                <Text style={styles.statValue}>{stat.value}</Text>
                <Text style={styles.statLabel}>{stat.label}</Text>
              </View>
            ))}
          </View>
        </View>

        <View style={styles.activityContainer}>
          <Text style={styles.sectionTitle}>{t('recentActivity')}</Text>
          {recentActivities.map((activity) => (
            <View key={activity.id} style={styles.activityItem}>
              <View style={styles.activityDot} />
              <View style={styles.activityContent}>
                <Text style={styles.activityText}>{activity.text}</Text>
                <Text style={styles.activityTime}>{activity.time}</Text>
              </View>
            </View>
          ))}
        </View>

        <View style={styles.quickActionsContainer}>
          <Text style={styles.sectionTitle}>{t('quickActions')}</Text>
          <View style={styles.quickActionsGrid}>
            <TouchableOpacity
              style={styles.quickActionButton}
              onPress={() => {
                if (userType === 'mentor') {
                  navigation.navigate('MentorDashboard');
                } else {
                  navigation.navigate('FindMentors');
                }
              }}
            >
              <Ionicons name="search" size={24} color="white" />
              <Text style={styles.quickActionText}>
                {userType === 'mentor' ? t('findMentees') : t('findMentors')}
              </Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.quickActionButton}>
              <Ionicons name="chatbubbles" size={24} color="white" />
              <Text style={styles.quickActionText}>{t('messages')}</Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  header: {
    paddingTop: 20,
    paddingBottom: 30,
    paddingHorizontal: 20,
  },
  headerContent: {
    alignItems: 'center',
  },
  greeting: {
    fontSize: 24,
    fontWeight: 'bold',
    color: 'white',
    marginBottom: 5,
  },
  userTypeText: {
    fontSize: 16,
    color: 'white',
    opacity: 0.9,
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
  },
  statsContainer: {
    marginTop: 20,
    marginBottom: 30,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 15,
  },
  statsGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  statCard: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 20,
    alignItems: 'center',
    flex: 1,
    marginHorizontal: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  statValue: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    marginTop: 10,
  },
  statLabel: {
    fontSize: 12,
    color: '#666',
    marginTop: 5,
  },
  activityContainer: {
    marginBottom: 30,
  },
  activityItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 15,
    backgroundColor: 'white',
    padding: 15,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  activityDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#667eea',
    marginTop: 6,
    marginRight: 12,
  },
  activityContent: {
    flex: 1,
  },
  activityText: {
    fontSize: 16,
    color: '#333',
    marginBottom: 5,
  },
  activityTime: {
    fontSize: 12,
    color: '#666',
  },
  quickActionsContainer: {
    marginBottom: 30,
  },
  quickActionsGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  quickActionButton: {
    backgroundColor: '#667eea',
    borderRadius: 12,
    padding: 20,
    alignItems: 'center',
    flex: 1,
    marginHorizontal: 5,
  },
  quickActionText: {
    color: 'white',
    fontSize: 14,
    fontWeight: '600',
    marginTop: 8,
    textAlign: 'center',
  },
});
