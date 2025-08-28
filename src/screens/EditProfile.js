import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  TextInput,
  TouchableOpacity,
  Image,
  Switch,
  Alert,
  Platform,
  ActivityIndicator,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import { useNavigation } from '@react-navigation/native';
import MeetingTimeSelector from '../components/MeetingTimeSelector';

export default function EditProfile() {
  const { user, userType, updateUser, API_URL, fetchWithTimeout } = useAuth();
  const { t } = useLanguage();
  const navigation = useNavigation();
  const [loading, setLoading] = useState(false);
  const [initialDataLoaded, setInitialDataLoaded] = useState(false);

  // Initialize form state with user data
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [location, setLocation] = useState('');
  const [bio, setBio] = useState('');
  
  // Role-specific fields
  const [title, setTitle] = useState('');
  const [company, setCompany] = useState('');
  const [experience, setExperience] = useState('');
  const [skills, setSkills] = useState('');
  const [hourlyRate, setHourlyRate] = useState('');
  const [preferredMeetingTimes, setPreferredMeetingTimes] = useState('');
  
  // Availability settings
  const [availableForMentoring, setAvailableForMentoring] = useState(false);
  const [emailNotifications, setEmailNotifications] = useState(true);

  // Load user profile data
  React.useEffect(() => {
    const loadProfile = async () => {
      if (!user?.id || initialDataLoaded) return;

      try {
        setLoading(true);
        console.log('Fetching profile data for user:', { 
          userId: user.id, 
          userType,
          name: user.name,
          email: user.email 
        });
        
        const response = await fetchWithTimeout(`${API_URL}/api/profiles/${user.id}`);
        const profileData = await response.json();

        if (!response.ok) {
          console.error('Profile fetch failed:', { 
            status: response.status, 
            statusText: response.statusText 
          });
          throw new Error(profileData.error || 'Failed to load profile data');
        }

        if (!profileData) {
          console.error('No profile data received for user:', user.id);
          throw new Error('No profile data received');
        }

        console.log('Raw profile data:', JSON.stringify(profileData, null, 2));

        // Set basic profile data first
        setName(profileData.full_name || user.name || '');
        setEmail(profileData.email || user.email || '');
        setBio(profileData.bio || '');
        setPhone(profileData.phone || '');
        setLocation(profileData.location || '');

        // Handle user type specific data
        if (userType === 'mentor') {
          console.log('Setting mentor-specific data');
          
          // Log mentor data before setting
          console.log('Mentor data to set:', {
            company: profileData.current_company,
            title: profileData.current_title,
            availabilityStatus: profileData.availability_status,
            hourlyRate: profileData.hourly_rate,
            meetingTimes: typeof profileData.preferred_meeting_times === 'string' 
              ? profileData.preferred_meeting_times 
              : JSON.stringify(profileData.preferred_meeting_times),
            experience: profileData.years_of_experience,
            expertiseAreas: profileData.expertise_areas,
            skills: profileData.skills
          });

          // Set mentor-specific fields with type checking
          console.log('Raw mentor field values:', {
            hourlyRate: profileData.hourly_rate,
            meetingTimes: profileData.preferred_meeting_times,
            rawCompany: profileData.current_company,
            rawTitle: profileData.current_title
          });

          setCompany(profileData.current_company || '');
          setTitle(profileData.current_title || '');
          setAvailableForMentoring(profileData.availability_status === 'available');
          
          // Handle hourly rate with proper type checking and conversion
          const hourlyRateValue = profileData.hourly_rate != null 
            ? profileData.hourly_rate.toString() 
            : '';
          console.log('Setting hourly rate:', hourlyRateValue);
          setHourlyRate(hourlyRateValue);
          
          // Handle preferred meeting times with proper formatting and validation
          let meetingTimesValue = '{}';
          try {
            if (typeof profileData.preferred_meeting_times === 'string') {
              // Validate if it's a valid JSON string
              JSON.parse(profileData.preferred_meeting_times);
              meetingTimesValue = profileData.preferred_meeting_times;
            } else if (profileData.preferred_meeting_times) {
              meetingTimesValue = JSON.stringify(profileData.preferred_meeting_times);
            }
          } catch (e) {
            console.warn('Invalid meeting times format:', e);
          }
          console.log('Setting meeting times:', meetingTimesValue);
          setPreferredMeetingTimes(meetingTimesValue);
          
          setExperience(profileData.years_of_experience?.toString() || '');
          setSkills(profileData.expertise_areas || profileData.skills || '');

        } else {
          console.log('Setting mentee-specific data');
          setCompany(profileData.current_company || '');
          setTitle(profileData.current_title || '');
          setBio(profileData.career_goals || profileData.bio || '');
          setSkills(profileData.skills || '');
          setExperience(profileData.experience_level || '');
        }

        setInitialDataLoaded(true);
        console.log('Profile data loaded successfully for user type:', userType);
      } catch (error) {
        console.error('Failed to load profile:', error.message);
        Alert.alert(
          t('error'),
          'Failed to load profile data. Some information might be missing.'
        );
      } finally {
        setLoading(false);
      }
    };

    loadProfile();
  }, [user?.id, userType, t]);

  const handleSave = async () => {
    if (!name || !email) {
      Alert.alert(t('error'), 'Name and email are required fields.');
      return;
    }

    try {
      console.log('Current form values:', {
        name, email, bio, skills, experience,
        phone, location, company, title,
        userType, availableForMentoring,
        hourlyRate, preferredMeetingTimes
      });

      // Prepare the update data using actual database fields
      const updatedUser = {
        // Common fields
        full_name: name,
        bio: bio || '',
        skills: skills.split(',').map(skill => skill.trim()).filter(skill => skill).join(','),
        experience_level: experience || '',
        profile_image: user?.profile?.profile_image || null,
        phone: phone || null,
        location: location || null,
        linkedin_url: user?.profile?.linkedin_url || null,
        github_url: user?.profile?.github_url || null,
        portfolio_url: user?.profile?.portfolio_url || null,
        current_company: company || null,
        current_title: title || null,
        industry: user?.profile?.industry || null,
        
        // Role-specific fields
        ...(userType === 'mentor' ? {
          availability_status: availableForMentoring ? 'available' : 'unavailable',
          hourly_rate: hourlyRate && hourlyRate.trim() !== '' ? parseFloat(hourlyRate) : 0,
          years_of_experience: experience ? parseInt(experience, 10) : 0,
          expertise_areas: skills,
          preferred_communication: 'in-app',
          preferred_meeting_times: preferredMeetingTimes && preferredMeetingTimes !== 'null' ? preferredMeetingTimes : '{}'
        } : {
          career_goals: bio || null,
          learning_style: null, // To be implemented in UI
          target_role: title || null
        })
      };

      setLoading(true);
      const response = await fetchWithTimeout(
        `${API_URL}/api/profiles/${user.id}`,
        {
          method: 'PUT',
          body: JSON.stringify(updatedUser),
        }
      );

      const data = await response.json();
      console.log('Server response:', data);

      if (!response.ok) {
        throw new Error(data.error || 'Failed to update profile');
      }

      // Update local user data with the response from server
      if (updateUser && typeof updateUser === 'function') {
        const updatedUserData = {
          ...user,
          name: data.full_name,
          email: data.email,
          profile: data
        };
        updateUser(updatedUserData);
      }
      
      Alert.alert(
        t('success'),
        'Profile updated successfully!',
        [{ text: 'OK', onPress: () => navigation.goBack() }]
      );
    } catch (error) {
      console.error('Error updating profile:', error);
      Alert.alert(
        t('error'),
        error.message || 'Failed to update profile. Please try again.'
      );
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    Alert.alert(
      'Discard Changes?',
      'Are you sure you want to discard your changes?',
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Discard', onPress: () => navigation.goBack() }
      ]
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <LinearGradient
        colors={['#667eea', '#764ba2']}
        style={styles.header}
      >
        <View style={styles.headerContent}>
          <TouchableOpacity 
            style={styles.backButton}
            onPress={handleCancel}
          >
            <Ionicons name="arrow-back" size={24} color="white" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Edit Profile</Text>
          <TouchableOpacity 
            style={styles.saveButton}
            onPress={handleSave}
          >
            <Text style={styles.saveButtonText}>Save</Text>
          </TouchableOpacity>
        </View>
      </LinearGradient>

      <ScrollView style={styles.content}>
        {/* Profile Picture Section */}
        <View style={styles.profilePictureSection}>
          <TouchableOpacity style={styles.profilePictureContainer}>
            <Image
              source={{ uri: user?.profilePicture || 'https://via.placeholder.com/100x100' }}
              style={styles.profilePicture}
            />
            <View style={styles.cameraIcon}>
              <Ionicons name="camera" size={20} color="white" />
            </View>
          </TouchableOpacity>
          <Text style={styles.changePictureText}>Tap to change picture</Text>
        </View>

        {/* Basic Information */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Basic Information</Text>
          
          <View style={styles.inputContainer}>
            <Text style={styles.inputLabel}>Full Name *</Text>
            <TextInput
              style={styles.input}
              value={name}
              onChangeText={setName}
              placeholder="Enter your full name"
            />
          </View>

          <View style={styles.inputContainer}>
            <Text style={styles.inputLabel}>Email *</Text>
            <TextInput
              style={styles.input}
              value={email}
              onChangeText={setEmail}
              placeholder="Enter your email"
              keyboardType="email-address"
              autoCapitalize="none"
            />
          </View>

          <View style={styles.inputContainer}>
            <Text style={styles.inputLabel}>Phone Number</Text>
            <TextInput
              style={styles.input}
              value={phone}
              onChangeText={setPhone}
              placeholder="Enter your phone number"
              keyboardType="phone-pad"
            />
          </View>

          <View style={styles.inputContainer}>
            <Text style={styles.inputLabel}>Location</Text>
            <TextInput
              style={styles.input}
              value={location}
              onChangeText={setLocation}
              placeholder="Enter your location"
            />
          </View>

          <View style={styles.inputContainer}>
            <Text style={styles.inputLabel}>Bio</Text>
            <TextInput
              style={[styles.input, styles.textArea]}
              value={bio}
              onChangeText={setBio}
              placeholder="Tell us about yourself"
              multiline
              numberOfLines={4}
              textAlignVertical="top"
            />
          </View>
        </View>

        {/* Professional Information (for mentors and mentees) */}
        {(userType === 'mentor' || userType === 'mentee') && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Professional Information</Text>
            
            <View style={styles.inputContainer}>
              <Text style={styles.inputLabel}>Job Title</Text>
              <TextInput
                style={styles.input}
                value={title}
                onChangeText={setTitle}
                placeholder="Enter your job title"
              />
            </View>

            <View style={styles.inputContainer}>
              <Text style={styles.inputLabel}>Company</Text>
              <TextInput
                style={styles.input}
                value={company}
                onChangeText={setCompany}
                placeholder="Enter your company"
              />
            </View>

            <View style={styles.inputContainer}>
              <Text style={styles.inputLabel}>Experience</Text>
              <TextInput
                style={styles.input}
                value={experience}
                onChangeText={setExperience}
                placeholder="e.g., 5 years"
              />
            </View>

            <View style={styles.inputContainer}>
              <Text style={styles.inputLabel}>Skills</Text>
              <TextInput
                style={styles.input}
                value={skills}
                onChangeText={setSkills}
                placeholder="Enter skills separated by commas"
              />
              <Text style={styles.helpText}>Separate multiple skills with commas</Text>
            </View>
          </View>
        )}

        {/* Mentor-specific settings */}
        {userType === 'mentor' && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Mentoring Settings</Text>
            
            <View style={styles.inputContainer}>
              <Text style={styles.inputLabel}>Hourly Rate (MMK)</Text>
              <TextInput
                style={styles.input}
                value={hourlyRate}
                onChangeText={setHourlyRate}
                placeholder="Enter hourly rate"
                keyboardType="numeric"
              />
              <Text style={styles.helpText}>Leave empty if offering free mentoring</Text>
            </View>

            <View style={styles.switchContainer}>
              <Text style={styles.switchLabel}>Available for Mentoring</Text>
              <Switch
                value={availableForMentoring}
                onValueChange={setAvailableForMentoring}
                trackColor={{ false: '#767577', true: '#667eea' }}
                thumbColor={availableForMentoring ? '#fff' : '#f4f3f4'}
              />
            </View>
          </View>
        )}

        {/* Meeting Time Settings - Mentor Only */}
        {userType === 'mentor' && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Meeting Availability</Text>
            <MeetingTimeSelector
              value={preferredMeetingTimes}
              onChange={setPreferredMeetingTimes}
            />
          </View>
        )}

        {/* Notification Settings */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Notification Settings</Text>
          
          <View style={styles.switchContainer}>
            <Text style={styles.switchLabel}>Email Notifications</Text>
            <Switch
              value={emailNotifications}
              onValueChange={setEmailNotifications}
              trackColor={{ false: '#767577', true: '#667eea' }}
              thumbColor={emailNotifications ? '#fff' : '#f4f3f4'}
            />
          </View>
        </View>

        {/* Action Buttons */}
        <View style={styles.buttonContainer}>
          <TouchableOpacity 
            style={styles.cancelButton}
            onPress={handleCancel}
          >
            <Text style={styles.cancelButtonText}>Cancel</Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={[styles.saveMainButton, loading && styles.saveMainButtonDisabled]}
            onPress={handleSave}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color="#FFFFFF" />
            ) : (
              <Text style={styles.saveMainButtonText}>Save Changes</Text>
            )}
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  saveMainButtonDisabled: {
    opacity: 0.7,
  },
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  header: {
    paddingTop: 20,
    paddingBottom: 20,
    paddingHorizontal: 20,
  },
  headerContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  backButton: {
    padding: 5,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: 'white',
    flex: 1,
    textAlign: 'center',
  },
  saveButton: {
    paddingHorizontal: 15,
    paddingVertical: 8,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    borderRadius: 20,
  },
  saveButtonText: {
    color: 'white',
    fontSize: 14,
    fontWeight: '600',
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
  },
  profilePictureSection: {
    alignItems: 'center',
    paddingVertical: 30,
  },
  profilePictureContainer: {
    position: 'relative',
    marginBottom: 10,
  },
  profilePicture: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: '#ddd',
  },
  cameraIcon: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    backgroundColor: '#667eea',
    width: 30,
    height: 30,
    borderRadius: 15,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: 'white',
  },
  changePictureText: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
  },
  section: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 20,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 20,
  },
  inputContainer: {
    marginBottom: 20,
  },
  inputLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
    marginBottom: 8,
  },
  input: {
    backgroundColor: '#f8f9fa',
    borderRadius: 8,
    paddingHorizontal: 15,
    paddingVertical: 12,
    fontSize: 16,
    borderWidth: 1,
    borderColor: '#e9ecef',
  },
  textArea: {
    minHeight: 100,
    textAlignVertical: 'top',
  },
  helpText: {
    fontSize: 12,
    color: '#666',
    marginTop: 5,
    fontStyle: 'italic',
  },
  switchContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  switchLabel: {
    fontSize: 16,
    color: '#333',
    flex: 1,
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingBottom: 30,
    paddingHorizontal: 10,
  },
  cancelButton: {
    flex: 1,
    backgroundColor: '#f8f9fa',
    borderRadius: 8,
    paddingVertical: 15,
    alignItems: 'center',
    marginRight: 10,
    borderWidth: 1,
    borderColor: '#dee2e6',
  },
  cancelButtonText: {
    color: '#6c757d',
    fontSize: 16,
    fontWeight: '600',
  },
  saveMainButton: {
    flex: 1,
    backgroundColor: '#667eea',
    borderRadius: 8,
    paddingVertical: 15,
    alignItems: 'center',
    marginLeft: 10,
  },
  saveMainButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
});
