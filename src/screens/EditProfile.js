import React, { useState, useEffect, useContext, useRef } from 'react';
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
  KeyboardAvoidingView,
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
  
  // Log important data on initial render to help with debugging
  React.useEffect(() => {
    console.log('EditProfile component mounted with:', {
      userPresent: !!user,
      userId: user?.id,
      userType,
      apiUrl: API_URL,
    });
    
    // Check if API_URL is properly defined
    if (!API_URL) {
      console.error('API_URL is not defined in AuthContext');
    }
  }, []);

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
  const [preferredMeetingTimes, setPreferredMeetingTimes] = useState({});
  
  // Availability settings
  const [availableForMentoring, setAvailableForMentoring] = useState(false);
  const [emailNotifications, setEmailNotifications] = useState(true);
  
  // Validation state
  const [nameError, setNameError] = useState('');
  const [emailError, setEmailError] = useState('');
  const [phoneError, setPhoneError] = useState('');
  const [bioError, setBioError] = useState('');
  const [hourlyRateError, setHourlyRateError] = useState('');
  const [experienceError, setExperienceError] = useState('');
  const [skillsError, setSkillsError] = useState('');
  const [meetingTimesError, setMeetingTimesError] = useState('');
  
  // References for scrolling to error fields
  const scrollViewRef = useRef(null);
  const nameInputRef = useRef(null);
  const emailInputRef = useRef(null);
  const phoneInputRef = useRef(null);
  const hourlyRateInputRef = useRef(null);

  // Load user profile data
  React.useEffect(() => {
    const loadProfile = async () => {
      if (!user?.id) {
        console.warn('No user ID available, cannot load profile data');
        return;
      }
      
      if (initialDataLoaded) {
        console.log('Profile data already loaded, skipping fetch');
        return;
      }

      try {
        setLoading(true);
        console.log('Fetching profile data for user:', { 
          userId: user.id, 
          userType,
          name: user.name,
          email: user.email,
          apiUrl: API_URL
        });
        
        // Ensure API_URL is properly set
        if (!API_URL) {
          throw new Error('API URL is not defined');
        }
        
        const requestUrl = `${API_URL}/api/profiles/${user.id}`;
        console.log('Making API request to:', requestUrl);
        
        const response = await fetchWithTimeout(requestUrl);
        console.log('API Response status:', response.status);
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
            const interests = profileData.interests ? JSON.parse(profileData.interests) : {};
            
            if (userType === 'mentor') {
              setTitle(interests.title || profileData.current_title || '');
              setCompany(interests.company || profileData.current_company || '');
              setAvailableForMentoring(profileData.availability_status === 'available' || interests.availability === true || false);
              setHourlyRate(profileData.hourly_rate?.toString() || interests.hourlyRate?.toString() || '');
              
              // Load preferred meeting times
              try {
                let meetingTimes = {};
                // First check if it's in the profileData directly
                if (profileData.preferred_meeting_times) {
                  if (typeof profileData.preferred_meeting_times === 'string') {
                    meetingTimes = JSON.parse(profileData.preferred_meeting_times);
                  } else if (typeof profileData.preferred_meeting_times === 'object') {
                    meetingTimes = profileData.preferred_meeting_times;
                  }
                } 
                // Fall back to interests if needed
                else if (interests.meetingTimes) {
                  if (typeof interests.meetingTimes === 'string') {
                    meetingTimes = JSON.parse(interests.meetingTimes);
                  } else if (typeof interests.meetingTimes === 'object') {
                    meetingTimes = interests.meetingTimes;
                  }
                }
                
                setPreferredMeetingTimes(meetingTimes);
              } catch (e) {
                console.warn('Failed to parse meeting times:', e);
                setPreferredMeetingTimes({});
              }
              
              // Use expertise as skills if available
              if (profileData.expertise_areas) {
                setSkills(profileData.expertise_areas);
              } else if (interests.expertise && Array.isArray(interests.expertise)) {
                setSkills(interests.expertise.join(', '));
              }
              console.log('Valid meeting times found:', meetingTimesValue);
            } else {
              console.log('No meeting times found, using default empty object');
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
        
        // Create default values for form
        setName(user?.name || '');
        setEmail(user?.email || '');
        
        // Show user-friendly error message
        Alert.alert(
          t('error'),
          'Failed to load complete profile data. Some information might be missing.\n\n' + 
          'You may continue editing with partial data.',
          [
            { 
              text: 'Try Again', 
              onPress: () => {
                setInitialDataLoaded(false);
                // This will trigger the useEffect to run again
              } 
            },
            { text: 'Continue' }
          ]
        );
      } finally {
        setLoading(false);
      }
    };

    loadProfile();
  }, [user?.id, userType, t]);

  // Validation functions
  const isValidEmail = (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };
  
  const isValidPhone = (phone) => {
    // Allow empty phone as it's optional
    if (!phone) return true;
    // Basic phone validation - adjust regex as needed for your region's format
    const phoneRegex = /^[\d\s+()-]{8,15}$/;
    return phoneRegex.test(phone);
  };
  
  const sanitizeNumericInput = (value, allowDecimal = false) => {
    if (allowDecimal) {
      // Allow one decimal point and digits
      return value.replace(/[^\d.]/g, '').replace(/(\..*)\./g, '$1');
    } else {
      // Allow only digits
      return value.replace(/[^\d]/g, '');
    }
  };
  
  const validateFields = () => {
    let isValid = true;
    
    // Reset all errors first
    setNameError('');
    setEmailError('');
    setPhoneError('');
    setBioError('');
    setHourlyRateError('');
    setExperienceError('');
    setSkillsError('');
    setMeetingTimesError('');
    
    // Validate name (required)
    if (!name.trim()) {
      setNameError('Name is required');
      isValid = false;
    } else if (name.trim().length < 2) {
      setNameError('Name must be at least 2 characters');
      isValid = false;
    }
    
    // Validate email (required)
    if (!email.trim()) {
      setEmailError('Email is required');
      isValid = false;
    } else if (!isValidEmail(email)) {
      setEmailError('Please enter a valid email address');
      isValid = false;
    }
    
    // Validate phone (optional but must be valid if provided)
    if (phone && !isValidPhone(phone)) {
      setPhoneError('Please enter a valid phone number');
      isValid = false;
    }
    
    // Validate bio (optional but max length)
    if (bio && bio.length > 500) {
      setBioError('Bio must be less than 500 characters');
      isValid = false;
    }
    
    // Mentor specific validations
    if (userType === 'mentor') {
      // Validate hourly rate
      if (availableForMentoring && !hourlyRate) {
        setHourlyRateError('Hourly rate is required when available for mentoring');
        isValid = false;
      } else if (hourlyRate && (isNaN(parseFloat(hourlyRate)) || parseFloat(hourlyRate) < 0)) {
        setHourlyRateError('Please enter a valid positive number');
        isValid = false;
      }
      
      // Validate experience
      if (experience && (isNaN(parseInt(experience)) || parseInt(experience) < 0)) {
        setExperienceError('Please enter a valid number of years');
        isValid = false;
      }
      
      // Validate skills
      if (!skills.trim() && availableForMentoring) {
        setSkillsError('Please enter at least one skill or expertise area');
        isValid = false;
      }
      
      // Validate meeting times
      if (availableForMentoring && (!preferredMeetingTimes || Object.keys(preferredMeetingTimes).length === 0)) {
        setMeetingTimesError('Please set at least one available meeting time');
        isValid = false;
      }
    }
    
    return isValid;
  };

  const handleSave = async () => {
    if (!validateFields()) {
      Alert.alert(t('error'), 'Please correct the errors in the form before saving.');
      return;
    }

    try {
      // Log form values for debugging
      console.log('Saving form values:', {
        name, email, bio, skills, experience,
        phone, location, company, title,
        userType, availableForMentoring,
        hourlyRate, 
        preferredMeetingTimesType: typeof preferredMeetingTimes,
        preferredMeetingTimesValue: preferredMeetingTimes
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
          // Stringify meeting times for database storage
          preferred_meeting_times: availableForMentoring && Object.keys(preferredMeetingTimes).length > 0 
            ? JSON.stringify(preferredMeetingTimes) 
            : null
        } : {
          career_goals: bio || null,
          preferred_meeting_times: null,
          learning_style: null,
          target_role: title || null
        })
      };

      setLoading(true);
      console.log('Sending API request to update profile:', {
        url: `${API_URL}/api/profiles/${user.id}`,
        data: updatedUser
      });
      
      const response = await fetchWithTimeout(
        `${API_URL}/api/profiles/${user.id}`,
        {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json'
          },
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
              ref={nameInputRef}
              style={[
                styles.input, 
                nameError ? styles.inputError : null
              ]}
              value={name}
              onChangeText={(text) => {
                setName(text);
                if (text.trim()) {
                  setNameError('');
                }
              }}
              onBlur={() => {
                if (!name.trim()) {
                  setNameError('Name is required');
                } else if (name.trim().length < 2) {
                  setNameError('Name must be at least 2 characters');
                }
              }}
              placeholder="Enter your full name"
            />
            {nameError ? (
              <Text style={styles.errorText}>{nameError}</Text>
            ) : null}
          </View>

          <View style={styles.inputContainer}>
            <Text style={styles.inputLabel}>Email *</Text>
            <TextInput
              ref={emailInputRef}
              style={[
                styles.input, 
                emailError ? styles.inputError : null
              ]}
              value={email}
              onChangeText={(text) => {
                setEmail(text);
                if (isValidEmail(text) || text === '') {
                  setEmailError('');
                }
              }}
              onBlur={() => {
                if (!email.trim()) {
                  setEmailError('Email is required');
                } else if (!isValidEmail(email)) {
                  setEmailError('Please enter a valid email address');
                }
              }}
              placeholder="Enter your email"
              keyboardType="email-address"
              autoCapitalize="none"
            />
            {emailError ? (
              <Text style={styles.errorText}>{emailError}</Text>
            ) : null}
          </View>

          <View style={styles.inputContainer}>
            <Text style={styles.inputLabel}>Phone Number</Text>
            <TextInput
              ref={phoneInputRef}
              style={[
                styles.input, 
                phoneError ? styles.inputError : null
              ]}
              value={phone}
              onChangeText={(text) => {
                setPhone(text);
                if (isValidPhone(text) || text === '') {
                  setPhoneError('');
                }
              }}
              onBlur={() => {
                if (phone && !isValidPhone(phone)) {
                  setPhoneError('Please enter a valid phone number');
                }
              }}
              placeholder="Enter your phone number"
              keyboardType="phone-pad"
            />
            {phoneError ? (
              <Text style={styles.errorText}>{phoneError}</Text>
            ) : null}
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
              <Text style={styles.inputLabel}>Experience (years)</Text>
              <TextInput
                style={[
                  styles.input,
                  experienceError ? styles.inputError : null
                ]}
                value={experience}
                onChangeText={(text) => {
                  // Only allow numbers
                  const sanitized = sanitizeNumericInput(text, false);
                  setExperience(sanitized);
                  
                  if (!text || (text && !isNaN(parseInt(text)) && parseInt(text) >= 0)) {
                    setExperienceError('');
                  }
                }}
                onBlur={() => {
                  if (experience && (isNaN(parseInt(experience)) || parseInt(experience) < 0)) {
                    setExperienceError('Please enter a valid number of years');
                  }
                }}
                placeholder="e.g., 5"
                keyboardType="numeric"
              />
              {experienceError ? (
                <Text style={styles.errorText}>{experienceError}</Text>
              ) : null}
            </View>

            <View style={styles.inputContainer}>
              <Text style={styles.inputLabel}>Skills{availableForMentoring ? ' *' : ''}</Text>
              <TextInput
                style={[
                  styles.input,
                  skillsError ? styles.inputError : null
                ]}
                value={skills}
                onChangeText={(text) => {
                  setSkills(text);
                  if (text.trim() || !availableForMentoring) {
                    setSkillsError('');
                  }
                }}
                onBlur={() => {
                  if (!skills.trim() && availableForMentoring) {
                    setSkillsError('Please enter at least one skill or expertise area');
                  }
                }}
                placeholder="Enter skills separated by commas"
              />
              {skillsError ? (
                <Text style={styles.errorText}>{skillsError}</Text>
              ) : (
                <Text style={styles.helpText}>Separate multiple skills with commas</Text>
              )}
            </View>
          </View>
        )}

        {/* Mentor-specific settings */}
        {userType === 'mentor' && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Mentoring Settings</Text>
            
            <View style={styles.inputContainer}>
              <Text style={styles.inputLabel}>Hourly Rate (MMK){availableForMentoring ? ' *' : ''}</Text>
              <TextInput
                ref={hourlyRateInputRef}
                style={[
                  styles.input, 
                  hourlyRateError ? styles.inputError : null
                ]}
                value={hourlyRate}
                onChangeText={(text) => {
                  // Only allow numbers and decimal point
                  const sanitized = sanitizeNumericInput(text, true);
                  setHourlyRate(sanitized);
                  if (sanitized || !availableForMentoring) {
                    setHourlyRateError('');
                  }
                }}
                onBlur={() => {
                  if (availableForMentoring && !hourlyRate) {
                    setHourlyRateError('Hourly rate is required when available for mentoring');
                  } else if (hourlyRate && (isNaN(parseFloat(hourlyRate)) || parseFloat(hourlyRate) < 0)) {
                    setHourlyRateError('Please enter a valid positive number');
                  }
                }}
                placeholder="Enter hourly rate"
                keyboardType="numeric"
              />
              {hourlyRateError ? (
                <Text style={styles.errorText}>{hourlyRateError}</Text>
              ) : (
                <Text style={styles.helpText}>
                  {availableForMentoring ? 'Required when you are available for mentoring' : 'Leave empty if offering free mentoring'}
                </Text>
              )}
            </View>

            <View style={styles.switchContainer}>
              <Text style={styles.switchLabel}>Available for Mentoring</Text>
              <Switch
                value={availableForMentoring}
                onValueChange={(value) => {
                  setAvailableForMentoring(value);
                  if (!value) {
                    // Reset meeting times and clear validation errors when toggled off
                    setPreferredMeetingTimes('{}');
                    setMeetingTimesError('');
                  }
                }}
                trackColor={{ false: '#767577', true: '#667eea' }}
                thumbColor={availableForMentoring ? '#fff' : '#f4f3f4'}
              />
            </View>
            
            {/* Meeting Time Selector - only shown when mentor is available */}
            {availableForMentoring && (
              <View style={styles.meetingTimesContainer}>
                <Text style={styles.meetingTimesLabel}>Set Your Available Meeting Times</Text>
                <Text style={styles.helpText}>
                  Select dates and times when you're available for mentoring sessions.
                </Text>
                
                <MeetingTimeSelector
                  value={preferredMeetingTimes}
                  onChange={(times) => {
                    console.log('Meeting times updated:', times);
                    setPreferredMeetingTimes(times);
                    if (Object.keys(times).length > 0) {
                      setMeetingTimesError('');
                    }
                  }}
                  maxDays={30} // Limit to 1 month ahead
                />
                
                {meetingTimesError ? (
                  <Text style={[styles.errorText, styles.meetingTimesError]}>
                    {meetingTimesError}
                  </Text>
                ) : null}
              </View>
            )}
          </View>
        )}

        {/* Meeting Time Settings - Mentor Only */}
        {userType === 'mentor' && availableForMentoring && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Meeting Availability</Text>
            <Text style={styles.helpText}>
              Set the times when you're available for mentoring sessions.
              Swipe to see more days and tap time slots to select/unselect them.
            </Text>
            
            {/* Inline Meeting Time Scheduler */}
            <View style={styles.inlineSchedulerContainer}>
              <InlineMeetingScheduler
                value={preferredMeetingTimes}
                onChange={(newTimes) => {
                  console.log('Meeting times updated from inline scheduler:', newTimes);
                  
                  try {
                    // Ensure we always have a valid JSON string or object
                    if (typeof newTimes === 'object') {
                      const jsonString = JSON.stringify(newTimes);
                      console.log('Converted meeting times object to string:', jsonString);
                      setPreferredMeetingTimes(jsonString);
                      
                      // Clear validation error if we have times
                      if (Object.keys(newTimes).length > 0) {
                        setMeetingTimesError('');
                      }
                    } else if (typeof newTimes === 'string') {
                      // Validate it's a proper JSON string
                      const parsed = JSON.parse(newTimes);
                      console.log('Parsed meeting times string:', parsed);
                      setPreferredMeetingTimes(newTimes);
                      
                      // Clear validation error if we have times
                      if (Object.keys(parsed).length > 0) {
                        setMeetingTimesError('');
                      }
                    } else {
                      console.warn('Invalid meeting times type received:', typeof newTimes);
                      setPreferredMeetingTimes('{}');
                    }
                  } catch (e) {
                    console.error('Error processing meeting times:', e, 'Value was:', newTimes);
                    // Set to empty object if we get invalid data
                    setPreferredMeetingTimes('{}');
                  }
                }}
              />
            </View>
            
            <Text style={styles.orText}>Or use the calendar view</Text>
            
            {/* Original Calendar-Based Selector */}
            <View style={styles.meetingTimesContainer}>
              <MeetingTimeSelector
                value={preferredMeetingTimes}
                onChange={(newTimes) => {
                  console.log('Meeting times updated from selector:', newTimes);
                  
                  try {
                    // Ensure we always have a valid JSON string or object
                    if (typeof newTimes === 'object') {
                      const jsonString = JSON.stringify(newTimes);
                      console.log('Converted meeting times object to string:', jsonString);
                      setPreferredMeetingTimes(jsonString);
                      
                      // Clear validation error if we have times
                      if (Object.keys(newTimes).length > 0) {
                        setMeetingTimesError('');
                      }
                    } else if (typeof newTimes === 'string') {
                      // Validate it's a proper JSON string
                      const parsed = JSON.parse(newTimes);
                      console.log('Parsed meeting times string:', parsed);
                      setPreferredMeetingTimes(newTimes);
                      
                      // Clear validation error if we have times
                      if (Object.keys(parsed).length > 0) {
                        setMeetingTimesError('');
                      }
                    } else {
                      console.warn('Invalid meeting times type received:', typeof newTimes);
                      setPreferredMeetingTimes('{}');
                    }
                  } catch (e) {
                    console.error('Error processing meeting times:', e, 'Value was:', newTimes);
                    // Set to empty object if we get invalid data
                    setPreferredMeetingTimes('{}');
                  }
                }}
              />
            </View>
            
            {meetingTimesError ? (
              <Text style={styles.errorText}>{meetingTimesError}</Text>
            ) : null}
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
  // Validation styles
  inputError: {
    borderColor: '#ff3b30',
    borderWidth: 1,
  },
  errorText: {
    color: '#ff3b30',
    fontSize: 12,
    marginTop: 5,
  },
  meetingTimesContainer: {
    marginTop: 20,
    paddingTop: 15,
    borderTopWidth: 1,
    borderTopColor: '#f0f0f0',
  },
  meetingTimesLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 8,
  },
  meetingTimesError: {
    marginTop: 10,
    marginBottom: 5,
    fontSize: 13,
  },
});
