import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Image,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';

export default function DiscoverScreen({ navigation }) {
  const { userType } = useAuth();
  const { t } = useLanguage();
  const [searchQuery, setSearchQuery] = useState('');

  // Mock data for mentors/mentees
  const profiles = [
    {
      id: 1,
      name: 'Dr. Sarah Johnson',
      title: 'Senior Software Engineer',
      company: 'Tech Corp',
      skills: ['React Native', 'JavaScript', 'Mobile Development'],
      rating: 4.8,
      sessions: 150,
      image: 'https://via.placeholder.com/100x100',
      location: 'Yangon, Myanmar',
    },
    {
      id: 2,
      name: 'Michael Chen',
      title: 'Product Manager',
      company: 'Innovation Labs',
      skills: ['Product Strategy', 'User Research', 'Agile'],
      rating: 4.9,
      sessions: 200,
      image: 'https://via.placeholder.com/100x100',
      location: 'Mandalay, Myanmar',
    },
    {
      id: 3,
      name: 'Emily Rodriguez',
      title: 'UX Designer',
      company: 'Design Studio',
      skills: ['UI/UX', 'Figma', 'User Testing'],
      rating: 4.7,
      sessions: 120,
      image: 'https://via.placeholder.com/100x100',
      location: 'Yangon, Myanmar',
    },
    {
      id: 4,
      name: 'David Kim',
      title: 'Data Scientist',
      company: 'Analytics Co',
      skills: ['Python', 'Machine Learning', 'Statistics'],
      rating: 4.6,
      sessions: 80,
      image: 'https://via.placeholder.com/100x100',
      location: 'Naypyidaw, Myanmar',
    },
  ];

  const filteredProfiles = profiles.filter(profile =>
    profile.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    profile.skills.some(skill => skill.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>
          {userType === 'mentor' ? t('discoverMentees') : t('discoverMentors')}
        </Text>
        <View style={styles.searchContainer}>
          <Ionicons name="search" size={20} color="#666" style={styles.searchIcon} />
          <TextInput
            style={styles.searchInput}
            placeholder={t('searchByNameOrSkills')}
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
        </View>
      </View>

      <ScrollView style={styles.content}>
        {/* AI Career Development Section */}
        <View style={styles.careerSection}>
          <Text style={styles.sectionTitle}>🤖 AI Career Development</Text>
          <TouchableOpacity 
            style={styles.careerCard}
            onPress={() => navigation.navigate('CareerGoalIntake')}
          >
            <View style={styles.careerHeader}>
              <Ionicons name="cpu" size={28} color="#667eea" />
              <View style={styles.careerContent}>
                <Text style={styles.careerTitle}>AI-Powered Career Roadmap</Text>
                <Text style={styles.careerSubtitle}>
                  Get a personalized 8-week learning plan for ANY career path using AI!
                </Text>
                <View style={styles.aiFeatures}>
                  <Text style={styles.aiFeature}>🎯 Skill gap analysis</Text>
                  <Text style={styles.aiFeature}>📚 Personalized resources</Text>
                  <Text style={styles.aiFeature}>🚀 Weekly action plans</Text>
                </View>
              </View>
              <Ionicons name="arrow-forward" size={20} color="#667eea" />
            </View>
          </TouchableOpacity>
        </View>

        <View style={styles.profilesContainer}>
          {filteredProfiles.map((profile) => (
            <View key={profile.id} style={styles.profileCard}>
              <View style={styles.profileHeader}>
                <Image
                  source={{ uri: profile.image }}
                  style={styles.profileImage}
                />
                <View style={styles.profileInfo}>
                  <Text style={styles.profileName}>{profile.name}</Text>
                  <Text style={styles.profileTitle}>{profile.title}</Text>
                  <Text style={styles.profileCompany}>{profile.company}</Text>
                  <View style={styles.locationContainer}>
                    <Ionicons name="location" size={14} color="#666" />
                    <Text style={styles.locationText}>{profile.location}</Text>
                  </View>
                </View>
              </View>

              <View style={styles.skillsContainer}>
                {profile.skills.map((skill, index) => (
                  <View key={index} style={styles.skillTag}>
                    <Text style={styles.skillText}>{skill}</Text>
                  </View>
                ))}
              </View>

              <View style={styles.statsContainer}>
                <View style={styles.statItem}>
                  <Ionicons name="star" size={16} color="#FFD700" />
                  <Text style={styles.statText}>{profile.rating}</Text>
                </View>
                <View style={styles.statItem}>
                  <Ionicons name="people" size={16} color="#667eea" />
                  <Text style={styles.statText}>{profile.sessions} {t('sessions')}</Text>
                </View>
              </View>

              <View style={styles.actionButtons}>
                <TouchableOpacity 
                  style={styles.viewButton}
                  onPress={() => navigation.navigate('MentorProfile', {
                    mentorId: profile.id,
                    mentorName: profile.name,
                    title: profile.title,
                    company: profile.company,
                    rating: profile.rating,
                    sessions: profile.sessions,
                    skills: profile.skills,
                    location: profile.location,
                    sessionFee: 2500 // Mock fee
                  })}
                >
                  <Text style={styles.viewButtonText}>{t('viewProfile')}</Text>
                </TouchableOpacity>
                <TouchableOpacity 
                  style={styles.connectButton}
                  onPress={() => navigation.navigate('BookSession', {
                    mentorId: profile.id,
                    mentorName: profile.name,
                    sessionFee: 2500 // Mock fee
                  })}
                >
                  <Text style={styles.connectButtonText}>Book Now</Text>
                </TouchableOpacity>
              </View>
            </View>
          ))}
        </View>

        {filteredProfiles.length === 0 && (
          <View style={styles.emptyState}>
            <Ionicons name="search" size={64} color="#ccc" />
            <Text style={styles.emptyStateText}>{t('noProfilesFound')}</Text>
            <Text style={styles.emptyStateSubtext}>
              {t('tryAdjustingSearch')}
            </Text>
          </View>
        )}
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
    backgroundColor: 'white',
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 15,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f0f0f0',
    borderRadius: 12,
    paddingHorizontal: 15,
  },
  searchIcon: {
    marginRight: 10,
  },
  searchInput: {
    flex: 1,
    paddingVertical: 12,
    fontSize: 16,
    color: '#333',
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
  },
  profilesContainer: {
    paddingVertical: 20,
  },
  profileCard: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 20,
    marginBottom: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  profileHeader: {
    flexDirection: 'row',
    marginBottom: 15,
  },
  profileImage: {
    width: 60,
    height: 60,
    borderRadius: 30,
    marginRight: 15,
    backgroundColor: '#ddd',
  },
  profileInfo: {
    flex: 1,
  },
  profileName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 5,
  },
  profileTitle: {
    fontSize: 16,
    color: '#667eea',
    marginBottom: 3,
  },
  profileCompany: {
    fontSize: 14,
    color: '#666',
    marginBottom: 5,
  },
  locationContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  locationText: {
    fontSize: 12,
    color: '#666',
    marginLeft: 3,
  },
  skillsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: 15,
  },
  skillTag: {
    backgroundColor: '#f0f0f0',
    borderRadius: 15,
    paddingHorizontal: 12,
    paddingVertical: 6,
    marginRight: 8,
    marginBottom: 8,
  },
  skillText: {
    fontSize: 12,
    color: '#333',
  },
  statsContainer: {
    flexDirection: 'row',
    marginBottom: 15,
  },
  statItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 20,
  },
  statText: {
    fontSize: 14,
    color: '#333',
    marginLeft: 5,
  },
  actionButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  viewButton: {
    flex: 1,
    backgroundColor: '#f0f0f0',
    borderRadius: 8,
    paddingVertical: 12,
    alignItems: 'center',
    marginRight: 10,
  },
  viewButtonText: {
    color: '#333',
    fontSize: 16,
    fontWeight: '600',
  },
  connectButton: {
    flex: 1,
    backgroundColor: '#667eea',
    borderRadius: 8,
    paddingVertical: 12,
    alignItems: 'center',
  },
  connectButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
  },
  emptyStateText: {
    fontSize: 18,
    color: '#666',
    marginTop: 15,
  },
  emptyStateSubtext: {
    fontSize: 14,
    color: '#999',
    marginTop: 5,
  },
  // Career Development Styles
  careerSection: {
    marginBottom: 20,
    paddingHorizontal: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 15,
  },
  careerCard: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 16,
    borderLeftWidth: 4,
    borderLeftColor: '#667eea',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  careerHeader: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  careerContent: {
    flex: 1,
    marginLeft: 12,
  },
  careerTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 4,
  },
  careerSubtitle: {
    fontSize: 14,
    color: '#666',
    marginBottom: 8,
    lineHeight: 18,
  },
  aiFeatures: {
    marginTop: 8,
  },
  aiFeature: {
    fontSize: 12,
    color: '#667eea',
    marginBottom: 2,
    fontWeight: '500',
  },
});
