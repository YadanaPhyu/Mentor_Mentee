import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import { useNavigation } from '@react-navigation/native';

export default function HomeScreen() {
  const { user, userType, API_URL, fetchWithTimeout } = useAuth();
  const { t } = useLanguage();
  const navigation = useNavigation();
  
  const [stats, setStats] = useState([
    { label: t('connections'), value: '0', icon: 'people', loading: true },
    { label: t('sessions'), value: '0', icon: 'time', loading: true },
  ]);

  useEffect(() => {
    const fetchStats = async () => {
      if (!user?.id) return;
      
      try {
        const response = await fetchWithTimeout(`${API_URL}/api/users/${user.id}/stats`);
        
        if (!response.ok) {
          throw new Error('Failed to fetch stats');
        }
        
        const data = await response.json();
        
        setStats([
          { label: t('connections'), value: data.connections.toString(), icon: 'people', loading: false },
          { label: t('sessions'), value: data.sessions.toString(), icon: 'time', loading: false },
        ]);
      } catch (error) {
        console.error('Error fetching stats:', error);
        // Keep default values on error
        setStats([
          { label: t('connections'), value: '0', icon: 'people', loading: false },
          { label: t('sessions'), value: '0', icon: 'time', loading: false },
        ]);
      }
    };
    
    fetchStats();
  }, [user?.id, API_URL, fetchWithTimeout, t]);

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
                {stat.loading ? (
                  <ActivityIndicator size="small" color="#667eea" style={styles.statValue} />
                ) : (
                  <Text style={styles.statValue}>{stat.value}</Text>
                )}
                <Text style={styles.statLabel}>{stat.label}</Text>
              </View>
            ))}
          </View>
        </View>

        {/* AI Career Development Section for Mentees */}
        {userType === 'mentee' && (
          <View style={styles.careerMapContainer}>
            <Text style={styles.sectionTitle}>🤖 AI Career Development</Text>
            <TouchableOpacity 
              style={styles.careerMapCard}
              onPress={() => navigation.navigate('CareerGoalIntake')}
            >
              <View style={styles.careerMapHeader}>
                <Ionicons name="cpu" size={32} color="#667eea" />
                <View style={styles.careerMapContent}>
                  <Text style={styles.careerMapTitle}>AI-Powered Career Roadmap</Text>
                  <Text style={styles.careerMapSubtitle}>
                    Get a personalized 8-week learning plan for ANY career path using AI!
                  </Text>
                </View>
              </View>
              
              <View style={styles.careerMapFeatures}>
                <View style={styles.feature}>
                  <Ionicons name="analytics" size={16} color="#667eea" />
                  <Text style={styles.featureText}>🎯 Skill gap analysis</Text>
                </View>
                <View style={styles.feature}>
                  <Ionicons name="calendar" size={16} color="#667eea" />
                  <Text style={styles.featureText}>📚 Personalized resources</Text>
                </View>
                <View style={styles.feature}>
                  <Ionicons name="rocket" size={16} color="#667eea" />
                  <Text style={styles.featureText}>🚀 Weekly action plans</Text>
                </View>
              </View>
              
              <View style={styles.careerMapAction}>
                <Text style={styles.careerMapActionText}>Start AI Assessment</Text>
                <Ionicons name="arrow-forward" size={20} color="#667eea" />
              </View>
            </TouchableOpacity>
          </View>
        )}

        {/* Recent Activity - Hidden for mentees */}
        {userType === 'mentor' && (
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
        )}

        <View style={styles.quickActionsContainer}>
          <Text style={styles.sectionTitle}>{t('quickActions')}</Text>
          <View style={styles.quickActionsGrid}>
            <TouchableOpacity
              style={styles.quickActionButton}
              onPress={() => {
                if (userType === 'mentor') {
                  navigation.navigate('MentorDashboard');
                } else {
                  // Navigate to the Discover tab which contains the MenteeStack
                  navigation.navigate('Discover', { screen: 'DiscoverMentors' });
                }
              }}
            >
              <Ionicons name="search" size={24} color="white" />
              <Text style={styles.quickActionText}>
                {userType === 'mentor' ? t('findMentees') : t('findMentors')}
              </Text>
            </TouchableOpacity>
            {userType === 'mentee' && (
              <>
                <TouchableOpacity 
                  style={styles.quickActionButton}
                  onPress={() => navigation.navigate('UpcomingSessions')}
                >
                  <Ionicons name="calendar" size={24} color="white" />
                  <Text style={styles.quickActionText}>My Sessions</Text>
                </TouchableOpacity>
                <TouchableOpacity 
                  style={styles.quickActionButton}
                  onPress={() => navigation.navigate('CareerGoalIntake')}
                >
                  <Ionicons name="map" size={24} color="white" />
                  <Text style={styles.quickActionText}>Career Plan</Text>
                </TouchableOpacity>
              </>
            )}
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
  // Career Map Styles
  careerMapContainer: {
    marginBottom: 30,
  },
  careerMapCard: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 20,
    borderLeftWidth: 4,
    borderLeftColor: '#667eea',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  careerMapHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 15,
  },
  careerMapContent: {
    flex: 1,
    marginLeft: 15,
  },
  careerMapTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 5,
  },
  careerMapSubtitle: {
    fontSize: 14,
    color: '#666',
    lineHeight: 20,
  },
  careerMapFeatures: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: 15,
  },
  feature: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 20,
    marginBottom: 8,
  },
  featureText: {
    fontSize: 14,
    color: '#667eea',
    marginLeft: 6,
    fontWeight: '500',
  },
  careerMapAction: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: 15,
    borderTopWidth: 1,
    borderTopColor: '#f0f0f0',
  },
  careerMapActionText: {
    fontSize: 16,
    color: '#667eea',
    fontWeight: '600',
  },
});
