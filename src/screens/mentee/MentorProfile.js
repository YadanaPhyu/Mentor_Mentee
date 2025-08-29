import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useLanguage } from '../../context/LanguageContext';
import { useAuth } from '../../context/AuthContext';

export default function MentorProfile({ route, navigation }) {
  const { t } = useLanguage();
  const { API_URL, fetchWithTimeout } = useAuth();
  const { mentorId } = route.params;
  
  const [mentor, setMentor] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Fetch mentor profile from API
  useEffect(() => {
    const fetchMentorProfile = async () => {
      try {
        setLoading(true);
        setError(null);
        
        console.log(`Fetching mentor profile: ${API_URL}/api/mentors/${mentorId}`);
        const response = await fetchWithTimeout(`${API_URL}/api/mentors/${mentorId}`);
        
        if (!response.ok) {
          const errorText = await response.text();
          throw new Error(errorText || `Failed to fetch mentor profile: ${response.status}`);
        }
        
        const data = await response.json();
        console.log('Mentor profile data:', data);
        
        // Transform the data for display
        setMentor({
          id: data.user_id,
          name: data.full_name || 'Unnamed Mentor',
          title: data.current_title || 'Mentor',
          company: data.current_company || '',
          experience: data.years_of_experience ? `${data.years_of_experience} years` : 'Not specified',
          rating: data.rating ? parseFloat(data.rating).toFixed(1) : 'New',
          totalSessions: data.total_sessions || 0,
          sessionFee: data.hourly_rate || 0,
          skills: data.expertise_areas 
            ? data.expertise_areas.split(',').map(s => s.trim()) 
            : (data.skills ? data.skills.split(',').map(s => s.trim()) : []),
          bio: data.bio || 'No bio available',
          location: data.location || 'Not specified',
          availability: data.availability_status || 'unavailable',
          // Parse meeting times if available
          meetingTimes: data.preferred_meeting_times ? (() => {
            try {
              return JSON.parse(data.preferred_meeting_times);
            } catch (e) {
              console.warn('Could not parse meeting times:', e);
              return {};
            }
          })() : {},
          socialLinks: {
            linkedin: data.linkedin_url,
            github: data.github_url,
          },
          // For now, we'll use mock reviews until we implement a reviews system
          reviews: [
            {
              id: 1,
              mentee: 'Alice Brown',
              rating: 5,
              comment: 'Excellent mentor, very patient and knowledgeable.',
              date: '2 weeks ago',
            },
            {
              id: 2,
              mentee: 'Bob Wilson',
              rating: 4,
              comment: 'Great at explaining complex concepts in simple terms.',
              date: '1 month ago',
            },
          ],
        });
      } catch (err) {
        console.error('Error fetching mentor profile:', err);
        setError(err.message);
        // Use fallback data from route params if available
        if (route.params.mentorName) {
          setMentor({
            id: mentorId,
            name: route.params.mentorName,
            title: route.params.title || 'Mentor',
            company: route.params.company || '',
            experience: route.params.yearsOfExperience ? `${route.params.yearsOfExperience} years` : 'Not specified',
            rating: route.params.rating || 'New',
            totalSessions: route.params.sessions || 0,
            sessionFee: route.params.sessionFee || 0,
            skills: route.params.skills || [],
            bio: route.params.bio || 'Bio not available',
            location: route.params.location || 'Not specified',
            availability: route.params.availability || 'unavailable',
            reviews: [],
            socialLinks: route.params.socialLinks || {},
          });
        }
      } finally {
        setLoading(false);
      }
    };
    
    fetchMentorProfile();
  }, [mentorId, API_URL, fetchWithTimeout]);

  // Show loading state
  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#667eea" />
        <Text style={styles.loadingText}>Loading mentor profile...</Text>
      </View>
    );
  }
  
  // Show error state
  if (error && !mentor) {
    return (
      <View style={styles.errorContainer}>
        <Ionicons name="alert-circle" size={64} color="#e53935" />
        <Text style={styles.errorTitle}>Error Loading Profile</Text>
        <Text style={styles.errorText}>{error}</Text>
        <TouchableOpacity 
          style={styles.retryButton} 
          onPress={() => navigation.goBack()}
        >
          <Text style={styles.retryButtonText}>Go Back</Text>
        </TouchableOpacity>
      </View>
    );
  }

  // If no mentor data, show error
  if (!mentor) {
    return (
      <View style={styles.errorContainer}>
        <Ionicons name="person-outline" size={64} color="#999" />
        <Text style={styles.errorTitle}>Mentor Not Found</Text>
        <Text style={styles.errorText}>We couldn't find this mentor's profile.</Text>
        <TouchableOpacity 
          style={styles.retryButton} 
          onPress={() => navigation.goBack()}
        >
          <Text style={styles.retryButtonText}>Go Back</Text>
        </TouchableOpacity>
      </View>
    );
  }
  
  // Available days from the mentor's meeting times
  const availableDays = mentor.meetingTimes ? 
    Object.keys(mentor.meetingTimes).filter(day => 
      mentor.meetingTimes[day] && Object.values(mentor.meetingTimes[day]).some(val => val)
    ) : [];

  return (
    <ScrollView style={styles.container}>
      {/* Show an error banner if there was an error but we have fallback data */}
      {error && (
        <View style={styles.errorBanner}>
          <Ionicons name="warning" size={18} color="#fff" />
          <Text style={styles.errorBannerText}>
            Error loading latest data. Some information may not be up to date.
          </Text>
        </View>
      )}
    
      <View style={styles.header}>
        <View style={styles.profileInfo}>
          <Ionicons name="person-circle" size={80} color="#764ba2" />
          <View style={styles.nameContainer}>
            <Text style={styles.name}>{mentor.name}</Text>
            <Text style={styles.title}>{mentor.title}</Text>
            {mentor.company && (
              <Text style={styles.company}>{mentor.company}</Text>
            )}
            <View style={styles.feeContainer}>
              <Text style={styles.feeText}>
                {mentor.sessionFee === 0 ? 'Free' : `${mentor.sessionFee} MMK/hr`}
              </Text>
            </View>
          </View>
        </View>
        
        <View style={styles.stats}>
          <View style={styles.statItem}>
            <Text style={styles.statValue}>{mentor.experience}</Text>
            <Text style={styles.statLabel}>{t('experience')}</Text>
          </View>
          <View style={styles.statItem}>
            <Text style={styles.statValue}>{mentor.rating}</Text>
            <Text style={styles.statLabel}>{t('rating')}</Text>
          </View>
          <View style={styles.statItem}>
            <Text style={styles.statValue}>{mentor.totalSessions}</Text>
            <Text style={styles.statLabel}>{t('sessions')}</Text>
          </View>
        </View>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>{t('about')}</Text>
        <Text style={styles.bio}>{mentor.bio}</Text>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>{t('skills')}</Text>
        <View style={styles.skillsContainer}>
          {mentor.skills && mentor.skills.length > 0 ? (
            mentor.skills.map((skill, index) => (
              <View key={index} style={styles.skillBadge}>
                <Text style={styles.skillText}>{skill}</Text>
              </View>
            ))
          ) : (
            <Text style={styles.emptyText}>No skills listed</Text>
          )}
        </View>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>{t('availability')}</Text>
        <View style={styles.availabilityContainer}>
          {availableDays.length > 0 ? (
            availableDays.map((day, index) => (
              <View key={index} style={styles.dayBadge}>
                <Text style={styles.dayText}>{day}</Text>
              </View>
            ))
          ) : (
            <Text style={styles.emptyText}>No availability specified</Text>
          )}
        </View>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>{t('reviews')}</Text>
        {mentor.reviews && mentor.reviews.length > 0 ? (
          mentor.reviews.map((review) => (
            <View key={review.id} style={styles.reviewCard}>
              <View style={styles.reviewHeader}>
                <Text style={styles.reviewerName}>{review.mentee}</Text>
                <Text style={styles.reviewDate}>{review.date}</Text>
              </View>
              <View style={styles.ratingContainer}>
                {[...Array(5)].map((_, i) => (
                  <Ionicons
                    key={i}
                    name={i < review.rating ? 'star' : 'star-outline'}
                    size={16}
                    color="#FFD700"
                  />
                ))}
              </View>
              <Text style={styles.reviewText}>{review.comment}</Text>
            </View>
          ))
        ) : (
          <Text style={styles.emptyText}>No reviews yet</Text>
        )}
      </View>

      {/* Social links section */}
      {(mentor.socialLinks?.linkedin || mentor.socialLinks?.github) && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Social Links</Text>
          <View style={styles.socialLinksContainer}>
            {mentor.socialLinks?.linkedin && (
              <TouchableOpacity style={styles.socialButton}>
                <Ionicons name="logo-linkedin" size={24} color="#0077B5" />
                <Text style={styles.socialButtonText}>LinkedIn Profile</Text>
              </TouchableOpacity>
            )}
            {mentor.socialLinks?.github && (
              <TouchableOpacity style={styles.socialButton}>
                <Ionicons name="logo-github" size={24} color="#333" />
                <Text style={styles.socialButtonText}>GitHub Profile</Text>
              </TouchableOpacity>
            )}
          </View>
        </View>
      )}

      <TouchableOpacity
        style={styles.bookButton}
        onPress={() => {
          // Validate the mentor ID before navigation
          if (!mentor || !mentor.id) {
            Alert.alert(
              'Error',
              'Mentor information is missing. Please try again later.',
              [{ text: 'OK' }]
            );
            return;
          }
          
          // Validate mentorId before navigation
          if (!mentor.id || isNaN(parseInt(mentor.id))) {
            Alert.alert(
              'Error',
              'Invalid mentor ID. Please try again or contact support.',
              [{ text: 'OK' }]
            );
            return;
          }
          
          // Navigate with required parameters
          navigation.navigate('BookSession', { 
            mentorId: parseInt(mentor.id), // Ensure it's a valid number
            mentorName: mentor.name || 'Unknown Mentor',
            sessionFee: mentor.sessionFee || 0,
            meetingTimes: mentor.meetingTimes || {}
          });
        }}
      >
        <View style={styles.bookButtonContent}>
          <Text style={styles.bookButtonText}>Book Now</Text>
          <Text style={styles.bookButtonPrice}>
            {mentor.sessionFee === 0 ? 'Free Session' : `${mentor.sessionFee} MMK/hr`}
          </Text>
        </View>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  header: {
    backgroundColor: 'white',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  profileInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },
  nameContainer: {
    marginLeft: 20,
    flex: 1,
  },
  name: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
  },
  title: {
    fontSize: 16,
    color: '#667eea',
    marginTop: 4,
  },
  company: {
    fontSize: 14,
    color: '#666',
    marginTop: 2,
  },
  feeContainer: {
    marginTop: 6,
  },
  feeText: {
    color: '#e91e63',
    fontSize: 16,
    fontWeight: '600',
  },
  stats: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginTop: 10,
  },
  statItem: {
    alignItems: 'center',
  },
  statValue: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#667eea',
  },
  statLabel: {
    fontSize: 12,
    color: '#666',
    marginTop: 4,
  },
  section: {
    backgroundColor: 'white',
    padding: 20,
    marginTop: 10,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 15,
  },
  bio: {
    fontSize: 14,
    color: '#666',
    lineHeight: 22,
  },
  skillsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  skillBadge: {
    backgroundColor: '#667eea',
    borderRadius: 20,
    paddingVertical: 6,
    paddingHorizontal: 12,
    margin: 4,
  },
  skillText: {
    color: 'white',
    fontSize: 12,
  },
  availabilityContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  dayBadge: {
    backgroundColor: '#764ba2',
    borderRadius: 20,
    paddingVertical: 6,
    paddingHorizontal: 12,
    margin: 4,
  },
  dayText: {
    color: 'white',
    fontSize: 12,
  },
  reviewCard: {
    backgroundColor: '#f8f9fa',
    borderRadius: 12,
    padding: 15,
    marginBottom: 10,
  },
  reviewHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  reviewerName: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
  },
  reviewDate: {
    fontSize: 12,
    color: '#666',
  },
  ratingContainer: {
    flexDirection: 'row',
    marginBottom: 8,
  },
  reviewText: {
    fontSize: 14,
    color: '#666',
    lineHeight: 20,
  },
  feeContainer: {
    backgroundColor: '#F0F4FF',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    marginTop: 8,
  },
  feeText: {
    color: '#667eea',
    fontSize: 14,
    fontWeight: '600',
  },
  bookButton: {
    backgroundColor: '#667eea',
    margin: 20,
    padding: 15,
    borderRadius: 12,
  },
  bookButtonContent: {
    alignItems: 'center',
  },
  bookButtonText: {
    color: 'white',
    fontSize: 18,
    fontWeight: '700',
  },
  bookButtonPrice: {
    color: 'rgba(255, 255, 255, 0.9)',
    fontSize: 14,
    marginTop: 4,
  },
  // Loading styles
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f5f5f5',
    padding: 20,
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
    color: '#667eea',
  },
  // Error styles
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f5f5f5',
    padding: 20,
  },
  errorTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
    marginTop: 15,
    marginBottom: 10,
  },
  errorText: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
    marginBottom: 20,
  },
  retryButton: {
    backgroundColor: '#667eea',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 8,
  },
  retryButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  errorBanner: {
    backgroundColor: '#e53935',
    padding: 10,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  errorBannerText: {
    color: 'white',
    fontSize: 13,
    marginLeft: 8,
  },
  // Social links styles
  socialLinksContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  socialButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f0f0f0',
    paddingHorizontal: 15,
    paddingVertical: 10,
    borderRadius: 8,
  },
  socialButtonText: {
    marginLeft: 8,
    fontSize: 14,
    color: '#333',
  },
  // Empty state text
  emptyText: {
    fontSize: 14,
    color: '#999',
    fontStyle: 'italic',
  },
});
