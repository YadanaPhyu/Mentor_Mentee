import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Image,
  ActivityIndicator,
  RefreshControl,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';

export default function DiscoverScreen({ navigation }) {
  const { userType, API_URL, fetchWithTimeout } = useAuth();
  const { t } = useLanguage();
  const [searchQuery, setSearchQuery] = useState('');
  const [mentors, setMentors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState(null);
  const [skillFilter, setSkillFilter] = useState('');

  // Load mentors from the API
  const loadMentors = async (search = '') => {
    try {
      setLoading(true);
      setError(null);
      
      // Prepare search parameters
      const searchParams = new URLSearchParams();
      if (search) searchParams.append('search', search);
      
      // Fetch available mentors from the server
      const url = `${API_URL}/api/mentors?${searchParams.toString()}`;
      console.log(`🔍 Fetching mentors from: ${url}`);
      
      // Check if API_URL is defined
      if (!API_URL) {
        throw new Error('API URL is not defined. Please check your configuration.');
      }
      
      // Add timeout for better error diagnostics
      const response = await fetchWithTimeout(
        url,
        { 
          headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json'
          }
        },
        10000 // 10 second timeout
      );
      
      // Check if the response is okay
      if (!response.ok) {
        let errorMessage = `Server error: ${response.status} ${response.statusText}`;
        try {
          // Try to parse error as JSON
          const errorData = await response.json();
          errorMessage = errorData.error || errorMessage;
        } catch (parseError) {
          // If we can't parse as JSON, try to get text
          try {
            const textError = await response.text();
            if (textError.includes('<!DOCTYPE html>')) {
              // This is an HTML error page
              errorMessage = 'Server returned HTML instead of JSON. This might indicate a server error.';
            } else if (textError.length < 100) {
              // If it's a short message, show it
              errorMessage = textError;
            }
          } catch (textError) {
            // If all fails, stick with default error message
          }
        }
        throw new Error(errorMessage);
      }
      
      // Parse the JSON response
      let data;
      try {
        data = await response.json();
        console.log(`Received ${data.length} mentors from API`);
      } catch (jsonError) {
        console.error('JSON parsing error:', jsonError);
        throw new Error('Invalid response format from server. Please try again later.');
      }
      
      // Process the mentor data
      console.log('Example mentor data:', data.length > 0 ? data[0] : 'No mentors found');
      
      const processedMentors = data.map(mentor => ({
        id: mentor.user_id,
        name: mentor.full_name || 'Unnamed Mentor',
        title: mentor.current_title || 'Mentor',
        company: mentor.current_company || '',
        bio: mentor.bio || '',
        skills: mentor.expertise_areas 
          ? mentor.expertise_areas.split(',').map(s => s.trim()) 
          : (mentor.skills ? mentor.skills.split(',').map(s => s.trim()) : []),
        rating: 0, // We'll add ratings in a future update
        sessions: 0, // We'll add session counts in a future update
        hourlyRate: mentor.hourly_rate || 0,
        image: 'https://via.placeholder.com/100x100', // Default image
        location: mentor.location || 'Myanmar',
        yearsOfExperience: mentor.years_of_experience || 0,
        availability: mentor.availability_status || 'unavailable',
        // Meeting times - parse from JSON if available
        meetingTimes: mentor.preferred_meeting_times ? (() => {
          try {
            return JSON.parse(mentor.preferred_meeting_times);
          } catch (e) {
            console.warn('Could not parse meeting times:', e);
            return {};
          }
        })() : {},
        socialLinks: {
          linkedin: mentor.linkedin_url,
          github: mentor.github_url,
        }
      }));
      
      setMentors(processedMentors);
    } catch (err) {
      console.error('❌ Error loading mentors:', err);
      // Create a more user-friendly error message
      let userMessage = err.message;
      
      // Add more context for connection failures
      if (err.message.includes('Network request failed')) {
        userMessage = 'Cannot connect to the server. Please check your internet connection or try again later.';
      } else if (err.message.includes('timed out')) {
        userMessage = 'The server is taking too long to respond. Please try again later.';
      }
      
      setError(userMessage);
      
      // In development, add debug information
      if (__DEV__) {
        console.log('Debug info - API URL:', API_URL);
        console.log('Debug info - User type:', userType);
        // Try a simple fetch to check connectivity
        fetch('https://httpstat.us/200')
          .then(r => console.log('Internet connectivity test:', r.status))
          .catch(e => console.log('Internet connectivity failed:', e));
      }
      
      // Ask user if they want to use mock data as a fallback
      Alert.alert(
        'Connection Error',
        `${userMessage}\n\nWould you like to see demo mentors instead?`,
        [
          { 
            text: 'Yes, show demo data', 
            onPress: () => {
              console.log('⚠️ Using mock mentor data as fallback');
              // Use fixed IDs to avoid the INT overflow issue
              const mockMentors = [
                {
                  id: 1,
                  name: 'John Smith',
                  title: 'Senior Software Engineer',
                  company: 'TechCorp',
                  bio: 'Experienced developer with 10+ years in web and mobile development.',
                  skills: ['JavaScript', 'React', 'Node.js'],
                  rating: 4.8,
                  sessions: 24,
                  hourlyRate: 50,
                  image: 'https://via.placeholder.com/100x100',
                  location: 'Yangon',
                  yearsOfExperience: 10,
                  availability: 'available',
                  meetingTimes: { mon: ['10:00', '14:00'], wed: ['11:00', '15:00'] },
                  socialLinks: {
                    linkedin: 'https://linkedin.com/in/johnsmith',
                    github: 'https://github.com/johnsmith',
                  }
                },
                {
                  id: 2,
                  name: 'Sarah Lee',
                  title: 'UX Designer',
                  company: 'DesignHub',
                  bio: 'UX/UI specialist focused on creating intuitive user experiences.',
                  skills: ['UI/UX', 'Figma', 'User Research'],
                  rating: 4.9,
                  sessions: 18,
                  hourlyRate: 45,
                  image: 'https://via.placeholder.com/100x100',
                  location: 'Mandalay',
                  yearsOfExperience: 7,
                  availability: 'available',
                  meetingTimes: { tue: ['09:00', '13:00'], thu: ['14:00', '16:00'] },
                  socialLinks: {
                    linkedin: 'https://linkedin.com/in/sarahlee',
                    github: null,
                  }
                }
              ];
              setMentors(mockMentors);
              
              // Clear the error since we're showing mock data now
              setError('Demo mode: Showing sample mentors');
            } 
          },
          {
            text: 'No, try again',
            onPress: () => loadMentors(searchQuery),
            style: 'cancel'
          }
        ]
      );
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  // Initial load
  useEffect(() => {
    loadMentors();
  }, []);
  
  // Handle search
  const handleSearch = () => {
    loadMentors(searchQuery);
  };
  
  // Handle pull-to-refresh
  const onRefresh = () => {
    setRefreshing(true);
    loadMentors(searchQuery);
  };
  
  // Filter mentors based on search query (client-side filtering after initial search)
  const filteredProfiles = mentors.filter(mentor => {
    if (!searchQuery) return true;
    
    const query = searchQuery.toLowerCase();
    
    // Check name, title, company
    if (
      mentor.name.toLowerCase().includes(query) || 
      (mentor.title && mentor.title.toLowerCase().includes(query)) ||
      (mentor.company && mentor.company.toLowerCase().includes(query))
    ) return true;
    
    // Check skills
    if (mentor.skills && mentor.skills.some(skill => skill.toLowerCase().includes(query))) {
      return true;
    }
    
    // Check bio
    if (mentor.bio && mentor.bio.toLowerCase().includes(query)) {
      return true;
    }
    
    return false;
  });

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
            onSubmitEditing={handleSearch}
            returnKeyType="search"
          />
          <TouchableOpacity 
            style={styles.searchButton} 
            onPress={handleSearch}
          >
            <Ionicons name="arrow-forward" size={20} color="#667eea" />
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView 
        style={styles.content}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={['#667eea']}
          />
        }
      >
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

        {/* Loading state */}
        {loading && !refreshing && (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#667eea" />
            <Text style={styles.loadingText}>Loading mentors...</Text>
          </View>
        )}
        
        {/* Error state */}
        {error && mentors.length === 0 && (
          <View style={styles.errorContainer}>
            <Ionicons name="alert-circle" size={48} color="#e53935" />
            <Text style={styles.errorText}>Something went wrong</Text>
            <Text style={styles.errorSubtext}>{error}</Text>
            <View style={styles.errorButtonsRow}>
              <TouchableOpacity 
                style={styles.retryButton}
                onPress={() => loadMentors(searchQuery)}
              >
                <Text style={styles.retryButtonText}>Try Again</Text>
              </TouchableOpacity>
              <TouchableOpacity 
                style={[styles.retryButton, {backgroundColor: '#4CAF50'}]}
                onPress={() => {
                  // Load mock data and clear error
                  const mockMentors = [
                    {
                      id: 1,
                      name: 'John Smith',
                      title: 'Senior Software Engineer',
                      company: 'TechCorp',
                      bio: 'Experienced developer with 10+ years in web and mobile development.',
                      skills: ['JavaScript', 'React', 'Node.js'],
                      rating: 4.8,
                      sessions: 24,
                      hourlyRate: 50,
                      image: 'https://via.placeholder.com/100x100',
                      location: 'Yangon',
                      yearsOfExperience: 10,
                      availability: 'available',
                      meetingTimes: { mon: ['10:00', '14:00'], wed: ['11:00', '15:00'] },
                      socialLinks: { linkedin: 'https://linkedin.com/in/johnsmith', github: 'https://github.com/johnsmith' }
                    },
                    {
                      id: 2,
                      name: 'Sarah Lee',
                      title: 'UX Designer',
                      company: 'DesignHub',
                      bio: 'UX/UI specialist focused on creating intuitive user experiences.',
                      skills: ['UI/UX', 'Figma', 'User Research'],
                      rating: 4.9,
                      sessions: 18,
                      hourlyRate: 45,
                      image: 'https://via.placeholder.com/100x100',
                      location: 'Mandalay',
                      yearsOfExperience: 7,
                      availability: 'available',
                      meetingTimes: { tue: ['09:00', '13:00'], thu: ['14:00', '16:00'] },
                      socialLinks: { linkedin: 'https://linkedin.com/in/sarahlee', github: null }
                    }
                  ];
                  setMentors(mockMentors);
                  setError(null);
                  Alert.alert('Demo Mode', 'Using demo data because the server connection failed.');
                }}
              >
                <Text style={styles.retryButtonText}>Use Demo Data</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}
        
        {/* Profiles container */}
        {!loading && !error && (
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
                    {profile.company && (
                      <Text style={styles.profileCompany}>{profile.company}</Text>
                    )}
                    <View style={styles.locationContainer}>
                      <Ionicons name="location" size={14} color="#666" />
                      <Text style={styles.locationText}>{profile.location}</Text>
                    </View>
                  </View>
                </View>
                
                {/* Experience and rate row */}
                <View style={styles.detailsRow}>
                  <View style={styles.detailItem}>
                    <Ionicons name="briefcase-outline" size={14} color="#666" />
                    <Text style={styles.detailText}>
                      {profile.yearsOfExperience} {profile.yearsOfExperience === 1 ? 'year' : 'years'}
                    </Text>
                  </View>
                  <View style={styles.detailItem}>
                    <Ionicons name="cash-outline" size={14} color="#666" />
                    <Text style={styles.detailText}>
                      {profile.hourlyRate > 0 ? `${profile.hourlyRate} MMK/hr` : 'Free'}
                    </Text>
                  </View>
                </View>

                <View style={styles.skillsContainer}>
                  {profile.skills.slice(0, 3).map((skill, index) => (
                    <View key={index} style={styles.skillTag}>
                      <Text style={styles.skillText}>{skill}</Text>
                    </View>
                  ))}
                  {profile.skills.length > 3 && (
                    <View style={[styles.skillTag, styles.moreSkillsTag]}>
                      <Text style={styles.skillText}>+{profile.skills.length - 3}</Text>
                    </View>
                  )}
                </View>

                <View style={styles.statsContainer}>
                  <View style={styles.statItem}>
                    <Ionicons name="star" size={16} color="#FFD700" />
                    <Text style={styles.statText}>
                      {profile.rating > 0 ? profile.rating.toFixed(1) : 'New'}
                    </Text>
                  </View>
                  <View style={styles.statItem}>
                    <Ionicons name="people" size={16} color="#667eea" />
                    <Text style={styles.statText}>
                      {profile.sessions} {profile.sessions === 1 ? 'session' : 'sessions'}
                    </Text>
                  </View>
                </View>

                <View style={styles.actionButtons}>
                  <TouchableOpacity 
                    style={styles.viewButton}
                    onPress={() => navigation.navigate('MentorProfile', {
                      mentorId: profile.id,
                      // Pass minimal data in case the API call fails
                      mentorName: profile.name
                    })}
                  >
                    <Text style={styles.viewButtonText}>{t('viewProfile')}</Text>
                  </TouchableOpacity>
                  <TouchableOpacity 
                    style={styles.connectButton}
                    onPress={() => {
                      // Ensure we have a valid numeric ID
                      const validMentorId = parseInt(profile.id);
                      if (isNaN(validMentorId) || validMentorId <= 0) {
                        Alert.alert(
                          'Invalid Mentor ID',
                          'Could not book a session with this mentor due to an invalid ID.',
                          [{ text: 'OK' }]
                        );
                        return;
                      }
                      
                      navigation.navigate('BookSession', {
                        mentorId: validMentorId, // Send as number, not string
                        mentorName: profile.name,
                        sessionFee: profile.hourlyRate || 0,
                        meetingTimes: profile.meetingTimes || {}
                      });
                    }}
                  >
                    <Text style={styles.connectButtonText}>Book Now</Text>
                  </TouchableOpacity>
                </View>
              </View>
            ))}
          </View>
        )}

        {/* Empty state when no mentors match search */}
        {!loading && !error && filteredProfiles.length === 0 && (
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
    marginTop: 8,
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
  searchButton: {
    padding: 6,
    borderRadius: 20,
    backgroundColor: '#f0f0f0',
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
  // Loading and error state styles
  loadingContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 40,
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
    color: '#667eea',
  },
  errorContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 40,
  },
  errorText: {
    marginTop: 10,
    fontSize: 18,
    fontWeight: 'bold',
    color: '#e53935',
  },
  errorSubtext: {
    marginTop: 5,
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
    paddingHorizontal: 20,
  },
  errorButtonsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 20,
  },
  retryButton: {
    marginHorizontal: 10,
    paddingVertical: 10,
    paddingHorizontal: 20,
    backgroundColor: '#667eea',
    borderRadius: 8,
  },
  retryButtonText: {
    color: 'white',
    fontWeight: '600',
  },
  // Enhanced profile display
  detailsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 5,
    marginBottom: 10,
  },
  detailItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  detailText: {
    fontSize: 13,
    color: '#666',
    marginLeft: 4,
  },
  moreSkillsTag: {
    backgroundColor: '#f0f0f0',
  },
});
