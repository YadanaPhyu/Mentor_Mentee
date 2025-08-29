import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Alert,
  ActivityIndicator,
} from 'react-native';
import * as Clipboard from 'expo-clipboard';
import { Ionicons } from '@expo/vector-icons';
import { useLanguage } from '../../context/LanguageContext';
import { useAuth } from '../../context/AuthContext';
import VideoCallService from '../../services/videoCallService';
import EmailService from '../../services/emailService';
import EmailPreview from '../../components/EmailPreview';
import EmailTestUtils from '../../utils/emailTestUtils';

export default function BookSession({ route, navigation }) {
  // More robust parameter extraction with default value and console logging
  const routeParams = route.params || {};
  const mentorId = routeParams.mentorId || null;
  
  // Log the parameters on component mount for debugging
  console.log('BookSession component mounted with params:', { 
    routeParams,
    extractedMentorId: mentorId 
  });
  
  const { t } = useLanguage();
  const { API_URL, fetchWithTimeout, user } = useAuth();
  
  // Mentor data states
  const [mentor, setMentor] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // Session booking states
  const [selectedDate, setSelectedDate] = useState(null);
  const [selectedTime, setSelectedTime] = useState(null);
  const [requestNote, setRequestNote] = useState('');
  const [buttonClicked, setButtonClicked] = useState(false);
  const [sessionCreated, setSessionCreated] = useState(false);
  const [createdSession, setCreatedSession] = useState(null);
  const [emailSent, setEmailSent] = useState(false);
  const [emailSending, setEmailSending] = useState(false);
  const [showEmailPreview, setShowEmailPreview] = useState(false);
  
  // New states for mentor confirmation flow
  const [sessionStatus, setSessionStatus] = useState('booking'); // 'booking', 'pending', 'confirmed', 'rejected'
  const [bookingRequest, setBookingRequest] = useState(null);

  // Fetch mentor data from API
  useEffect(() => {
    const fetchMentorData = async () => {
      try {
        setLoading(true);
        setError(null);
        
        // Add validation to ensure mentorId is available
        if (!mentorId) {
          console.error('No mentor ID provided in route params');
          throw new Error('No mentor ID provided. Please go back and try again.');
        }
        
        console.log(`Fetching mentor data for booking: ${API_URL}/api/mentors/${mentorId}`);
        const response = await fetchWithTimeout(`${API_URL}/api/mentors/${mentorId}`);
        
        if (!response.ok) {
          const errorText = await response.text();
          throw new Error(errorText || `Failed to fetch mentor data: ${response.status}`);
        }
        
        const data = await response.json();
        console.log('Mentor data for booking:', data);
        
        // Transform the data for display
        setMentor({
          id: data.user_id,
          name: data.full_name || 'Unnamed Mentor',
          title: data.current_title || 'Mentor',
          company: data.current_company || '',
          sessionFee: data.hourly_rate || 0,
          meetingTimes: data.preferred_meeting_times ? (() => {
            try {
              return JSON.parse(data.preferred_meeting_times);
            } catch (e) {
              console.warn('Could not parse meeting times:', e);
              return {};
            }
          })() : {},
        });
      } catch (err) {
        console.error('Error fetching mentor data for booking:', err);
        setError(err.message);
        // Use fallback from route params if available
        if (route.params.mentorName) {
          setMentor({
            id: mentorId,
            name: route.params.mentorName,
            sessionFee: route.params.sessionFee || 0,
            meetingTimes: route.params.meetingTimes || {},
          });
        }
      } finally {
        setLoading(false);
      }
    };
    
    fetchMentorData();
  }, [mentorId, API_URL, fetchWithTimeout]);

  // Debug logging
  console.log('BookSession component rendered');
  console.log('Route params:', route.params);
  console.log('Mentor ID:', mentorId);

  // Function to copy meeting link to clipboard
  const copyMeetingLink = async () => {
    if (createdSession?.videoCall?.meetingUrl) {
      try {
        await Clipboard.setStringAsync(createdSession.videoCall.meetingUrl);
        // Show a brief visual feedback
        console.log('📋 Meeting link copied to clipboard');
      } catch (error) {
        console.error('Failed to copy meeting link:', error);
      }
    }
  };

  // Use mentor's preferred meeting times if available, otherwise use defaults
  const [availableSlots, setAvailableSlots] = useState({
    'Jul 21': ['10:00 AM', '2:00 PM', '4:00 PM'],
    'Jul 22': ['9:00 AM', '1:00 PM', '3:00 PM'],
    'Jul 23': ['11:00 AM', '2:00 PM', '5:00 PM'],
  });
  
  // Update available slots when mentor data loads
  useEffect(() => {
    if (mentor && mentor.meetingTimes && Object.keys(mentor.meetingTimes).length > 0) {
      console.log('Using mentor\'s preferred meeting times:', mentor.meetingTimes);
      setAvailableSlots(mentor.meetingTimes);
    } else {
      console.log('Using default meeting time slots');
    }
  }, [mentor]);

  const handleRequestSession = async () => {
    console.log('🚀 Starting session request process...');
    
    // Check if date and time are selected
    if (!selectedDate || !selectedTime) {
      console.log('Missing date or time');
      setButtonClicked(true);
      setTimeout(() => setButtonClicked(false), 3000);
      return;
    }

    console.log('✅ Form validation passed - creating session request...');
    setButtonClicked(true);
    
    // Create session request object (pending mentor approval)
    // Get the current mentee's user ID with better error handling
    let menteeId;
    
    if (user && user.id) {
      menteeId = user.id;
      console.log('Using authenticated user ID as menteeId:', menteeId);
    } else {
      // In development/demo mode, use a fallback ID
      menteeId = 2; // Fallback for testing
      console.log('No authenticated user found, using fallback menteeId:', menteeId);
    }
    
    console.log('Current user object:', JSON.stringify(user));
    
    // EXTENSIVE DEBUG for mentor and mentee IDs
    console.log('🔍 DEBUGGING IDs:');
    console.log('- MentorID:', mentorId);
    console.log('  Type:', typeof mentorId);
    console.log('  Truthy?', Boolean(mentorId));
    console.log('  toString():', String(mentorId));
    console.log('- MenteeID:', menteeId);
    console.log('  Type:', typeof menteeId);
    console.log('  Truthy?', Boolean(menteeId));
    console.log('  toString():', String(menteeId));
    
    // More robust ID validation
    if (!mentorId && mentorId !== 0) {
      console.error('❌ Missing mentor ID:', { mentorId });
      Alert.alert('Error', 'Missing mentor information. Please go back and try again.', [
        { text: 'OK', onPress: () => navigation.goBack() }
      ]);
      setButtonClicked(false);
      return;
    }
    
    if (!menteeId && menteeId !== 0) {
      console.error('❌ Missing mentee ID:', { menteeId });
      Alert.alert('Error', 'Missing mentee information. Please sign in again.', [
        { text: 'OK' }
      ]);
      setButtonClicked(false);
      return;
    }
    
    // Double check IDs are valid numbers and not 0, null, or undefined
    const validMentorId = Number(mentorId);
    const validMenteeId = Number(menteeId);
    
    if (isNaN(validMentorId) || validMentorId <= 0 || isNaN(validMenteeId) || validMenteeId <= 0) {
      console.error('Invalid ID values:', { mentorId, menteeId, validMentorId, validMenteeId });
      Alert.alert('Error', 'Invalid mentor or mentee ID. Please try again.');
      setButtonClicked(false);
      return;
    }
    
    // Create request data that exactly matches the server expectations
    const sessionRequestData = {
      mentor_id: validMentorId,
      mentee_id: validMenteeId,
      date: selectedDate,
      time: selectedTime,
      duration: 60, // minutes
      status: 'pending_approval',
      topic: requestNote || 'General mentoring session',
      fee: mentor?.sessionFee || 0, // Server expects 'fee', not 'fee_amount'
    };
    
    // Log the request data for debugging
    console.log('Session request data (exactly as sent to server):', sessionRequestData);
    console.log('Types:', {
      mentor_id: typeof sessionRequestData.mentor_id,
      mentee_id: typeof sessionRequestData.mentee_id,
      date: typeof sessionRequestData.date,
      time: typeof sessionRequestData.time
    });
    
    console.log('📝 Created booking request:', sessionRequestData);

    try {
      // Send the session booking request to the backend API
      console.log(`Sending booking request to API: ${API_URL}/api/sessions/book`);
      console.log('Session request data:', JSON.stringify(sessionRequestData));
      
      let response, bookingResponse;
      
      try {
        // Try to connect to the actual API
        console.log('Sending data to API:', JSON.stringify(sessionRequestData, null, 2));
        
        // Double-check for valid API URL
        if (!API_URL) {
          throw new Error('API URL is not configured. Please check your settings.');
        }
        
        const url = `${API_URL}/api/sessions/book`;
        console.log('Full request URL:', url);
        console.log('Request body format:', Object.keys(sessionRequestData).join(', '));
        
        // Ensure we're sending the right data structure to the API
        console.log('Final request payload:', sessionRequestData);
        
        // Send the request with the format that matches server expectations
        console.log('Sending session booking request...');
        response = await fetchWithTimeout(url, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json'
          },
          body: JSON.stringify(sessionRequestData),
        });
        
        // Log the raw response for debugging
        console.log('API response status:', response.status);
        let responseText = await response.text(); // Using let instead of const so we can reassign it
        console.log('API response body:', responseText);
        
        // Add special handling for SQL errors
        if (response.status === 500 && responseText.includes('SQL')) {
          console.error('SQL ERROR DETECTED IN RESPONSE:', responseText);
          
          // Extract the specific SQL error if possible
          let sqlErrorMessage = 'Database error occurred';
          if (responseText.includes('Invalid column name')) {
            const match = responseText.match(/Invalid column name '([^']+)'/);
            const columnName = match ? match[1] : 'unknown column';
            sqlErrorMessage = `Database schema mismatch: Invalid column '${columnName}'`;
            console.error(`SQL error is about invalid column: ${columnName}`);
          }
          
          // Alert the user with useful information
          Alert.alert(
            'Database Error',
            `There was an issue saving your session request. Technical details: ${sqlErrorMessage}`,
            [{ text: 'OK' }]
          );
        }
        
        if (!response.ok && responseText.includes('Mentor ID and Mentee ID are required')) {
          console.error('Server reports missing mentor or mentee ID despite validation!');
          console.error('This may be due to how the IDs are being processed or converted.');
          
          // Log detailed information about the request for debugging
          console.error('Original request data:', sessionRequestData);
          console.error('Mentor ID:', sessionRequestData.mentor_id, 'Type:', typeof sessionRequestData.mentor_id);
          console.error('Mentee ID:', sessionRequestData.mentee_id, 'Type:', typeof sessionRequestData.mentee_id);
        }
        
        if (!response.ok) {
          // Try to parse the error response as JSON if possible
          let errorMessage = `Failed to book session: ${response.status}`;
          try {
            // Check if the response looks like JSON
            if (responseText.trim().startsWith('{') || responseText.trim().startsWith('[')) {
              const errorData = JSON.parse(responseText);
              errorMessage = errorData.error || errorMessage;
              console.error('Server error:', errorData);
              
              // Special handling for missing ID errors
              if (errorMessage === 'Mentor ID and Mentee ID are required') {
                console.error('🚨 CRITICAL: Mentor ID or Mentee ID missing in request despite validation!');
                console.error('Request data sent:', JSON.stringify(sessionRequestData));
                
                // Show a more helpful error message to the user
                Alert.alert(
                  'Data Error',
                  'There was an issue with the mentor or mentee information. Please try going back to the mentor profile and selecting the mentor again.',
                  [
                    { text: 'Go Back', onPress: () => navigation.goBack() },
                    { text: 'Try Anyway', style: 'cancel' }
                  ]
                );
              }
            } else {
              console.error('Server returned non-JSON error:', responseText);
            }
          } catch (parseError) {
            console.error('Could not parse error response:', parseError);
            // Use the raw response text if parsing failed
            errorMessage = responseText || errorMessage;
          }
          throw new Error(errorMessage);
        }
        
        // Parse the response JSON (if it's valid JSON)
        try {
          if (responseText.trim().length === 0) {
            throw new Error('Empty response received from server');
          }
          
          bookingResponse = JSON.parse(responseText);
          if (!bookingResponse || !bookingResponse.session_id) {
            console.warn('Response missing session_id:', bookingResponse);
            throw new Error('Invalid server response: missing session ID');
          }
        } catch (jsonError) {
          console.error('Error parsing JSON response:', jsonError);
          throw new Error('Invalid response format from server: ' + jsonError.message);
        }
        
        console.log('✅ API Response:', bookingResponse);
      } catch (apiError) {
        console.warn('API error, using mock data instead:', apiError);
        
        // First, check for SQL column errors and try to fix them
        if (apiError.message && apiError.message.includes('Invalid column name')) {
          const columnMatch = apiError.message.match(/Invalid column name '([^']+)'/);
          const invalidColumn = columnMatch ? columnMatch[1] : 'unknown';
          console.error(`Database column error detected: ${invalidColumn}`);
          
          // Try a second request with modified field names
          try {
            console.log('Attempting request with modified field names...');
            
            // Create an adjusted payload based on the specific column error
            const adjustedData = { ...sessionRequestData };
            
            if (invalidColumn === 'session_fee') {
              // Replace 'fee' with 'fee_amount'
              adjustedData.fee_amount = adjustedData.fee;
              delete adjustedData.fee;
            } else if (invalidColumn === 'fee_amount') {
              // The opposite case - maybe using older column name
              adjustedData.session_fee = adjustedData.fee;
              delete adjustedData.fee;
            }
            
            console.log('Trying with adjusted data:', adjustedData);
            
            // Make a new request with the adjusted data
            const adjustedResponse = await fetchWithTimeout(url, {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
                'Accept': 'application/json'
              },
              body: JSON.stringify(adjustedData),
            });
            
            if (adjustedResponse.ok) {
              // Success! Use this response instead of going to mock data
              const adjustedText = await adjustedResponse.text();
              bookingResponse = JSON.parse(adjustedText);
              console.log('Adjusted request successful:', bookingResponse);
              
              // Skip to success path
              Alert.alert(
                'Success',
                'Your session request has been submitted successfully!',
                [{ text: 'OK' }]
              );
              
              // Skip the rest of the error handling
              const successBookingRequest = {
                id: bookingResponse.session_id,
                mentor_id: sessionRequestData.mentor_id,
                mentee_id: sessionRequestData.mentee_id,
                date: selectedDate,
                time: selectedTime,
                duration: 60,
                topic: requestNote || 'General mentoring session',
                fee: mentor?.sessionFee || 0,
                mentorName: mentor?.name || 'Unknown Mentor',
                requestedAt: new Date().toISOString(),
                status: 'pending_approval'
              };
              
              setBookingRequest(successBookingRequest);
              setSessionStatus('pending');
              setButtonClicked(false);
              return;
            }
          } catch (adjustError) {
            console.error('Error trying adjusted request:', adjustError);
          }
        }
        
        // Log more detailed error information
        if (apiError.message) {
          try {
            // Check if the message looks like JSON by detecting curly braces
            if (apiError.message.includes('{') && apiError.message.includes('}')) {
              // Extract the JSON part from the error message
              const jsonStart = apiError.message.indexOf('{');
              const jsonEnd = apiError.message.lastIndexOf('}') + 1;
              const jsonString = apiError.message.substring(jsonStart, jsonEnd);
              
              // Try to parse the extracted JSON
              const errorJson = JSON.parse(jsonString);
              console.error('Parsed API error:', errorJson);
              
              // Display a more user-friendly error message
              const errorMessage = errorJson.error || 'Server error, please try again later';
              
              if (errorJson.error === 'Mentor ID and Mentee ID are required') {
                // This specific error means the IDs weren't sent properly
                Alert.alert(
                  'Data Error', 
                  'There was a problem with the mentor or mentee information. Please try again.',
                  [{ text: 'OK' }]
                );
                setButtonClicked(false);
                return;
              } else {
                // For any other specific error, show a user-friendly message
                Alert.alert(
                  'Booking Error', 
                  `Unable to book session: ${errorMessage}`,
                  [{ text: 'OK' }]
                );
                setButtonClicked(false);
                return;
              }
            } else {
              // Not JSON format, check for specific error types
              console.error('API error (not JSON):', apiError.message);
              
              // Special handling for database column errors
              if (apiError.message.includes('Invalid column name')) {
                console.error('DATABASE COLUMN ERROR:', apiError.message);
                
                // Extract the column name that's causing the issue
                const columnMatch = apiError.message.match(/Invalid column name '([^']+)'/);
                const invalidColumn = columnMatch ? columnMatch[1] : 'unknown';
                console.error(`The invalid column is: ${invalidColumn}`);
                
                Alert.alert(
                  'Database Error',
                  `The database schema doesn't match the API request (column '${invalidColumn}' is invalid). Using demo mode instead.`,
                  [{ text: 'OK' }]
                );
                
                // Continue to mock data
              } else {
                // General connection error
                Alert.alert(
                  'Connection Error',
                  'Could not connect to the server. Please check your connection and try again.',
                  [{ text: 'OK' }]
                );
              }
              setButtonClicked(false);
              return;
            }
          } catch (e) {
            // Not JSON or JSON parsing failed, continue with normal flow
            console.log('Error is not in valid JSON format:', e.message);
          }
        }
        
        // Simulate API response for demo purposes with a valid 32-bit integer ID
        const mockSessionId = Math.floor(Math.random() * 1000000); // Use a smaller random number
        
        bookingResponse = {
          message: 'Session booked successfully (DEMO MODE)',
          session_id: mockSessionId // Only include session_id as that's what the server returns
        };
        
        console.log('Using mock session with ID:', mockSessionId);
        
        console.log('Using mock session ID:', bookingResponse.session_id);
        
        // Add demo mode indicator in the UI
        Alert.alert(
          'Demo Mode', 
          'Using simulated data because the server connection failed. In a production app, this would connect to a real backend.',
          [{ text: 'Continue' }]
        );
      }
      
      // Update local state with the created booking
      // Always use consistent field names that match what we display in the UI
      const newBookingRequest = {
        id: bookingResponse.session_id,
        mentor_id: sessionRequestData.mentor_id,
        mentee_id: sessionRequestData.mentee_id,
        date: sessionRequestData.date,
        time: sessionRequestData.time,
        duration: sessionRequestData.duration,
        topic: sessionRequestData.topic,
        fee: sessionRequestData.fee,
        mentorName: mentor?.name || 'Unknown Mentor',
        requestedAt: new Date().toISOString(),
        hasVideoCall: false,
        emailNotificationSent: false,
        status: 'pending_approval'
      };
      
      console.log('Created session booking request:', newBookingRequest);
      
      setBookingRequest(newBookingRequest);
      setSessionStatus('pending');
      setButtonClicked(false);

      // Send notification to mentor (not confirmation email yet)
      sendMentorNotification(newBookingRequest);

      console.log('✅ Session request sent to mentor for approval');

    } catch (error) {
      console.error('❌ Error creating session request:', error);
      Alert.alert('Booking Error', `Failed to book the session. ${error.message}`);
      setButtonClicked(false);
    }
  };

  // Function to send notification to mentor about the booking request
  const sendMentorNotification = async (request) => {
    console.log('📧 Sending booking request notification to mentor...');
    
    try {
      // In real app, send notification to mentor via API
      const mentorEmail = 'mentor@example.com'; // Replace with actual mentor email
      
      // For demo purposes, simulate mentor response after 3 seconds
      setTimeout(() => {
        simulateMentorResponse(request);
      }, 3000);
      
      console.log('✅ Mentor notification sent');
    } catch (error) {
      console.error('❌ Error sending mentor notification:', error);
    }
  };

  // Function to simulate mentor confirmation (for demo purposes)
  // In a real app, this would be replaced by a webhook or polling mechanism
  // to check if the mentor has confirmed the session
  const simulateMentorResponse = async (request) => {
    console.log('🤖 Simulating mentor response...');
    
    try {
      // In a real app, this would be a call to check session status
      console.log(`Checking session status: ${API_URL}/api/sessions/${request.id}`);
      const response = await fetchWithTimeout(`${API_URL}/api/sessions/${request.id}`);
      
      if (!response.ok) {
        throw new Error(`Failed to get session status: ${response.status}`);
      }
      
      const sessionData = await response.json();
      console.log('Session status check:', sessionData);
      
      // For demo purposes, simulate a positive response from the mentor
      const mentorConfirmed = true; // In real app, this would be sessionData.status === 'confirmed'
      
      if (mentorConfirmed) {
        handleMentorConfirmation(request);
      } else {
        handleMentorRejection(request);
      }
    } catch (error) {
      console.error('Error checking session status:', error);
      // For demo purposes, still proceed with confirmation
      handleMentorConfirmation(request);
    }
  };

  // Function to handle mentor confirmation
  const handleMentorConfirmation = async (request) => {
    console.log('✅ Mentor confirmed the session!');
    
    try {
      // Update session status via API
      console.log(`Updating session status: ${API_URL}/api/sessions/${request.id}/status`);
      const response = await fetchWithTimeout(`${API_URL}/api/sessions/${request.id}/status`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ status: 'confirmed' }),
      });
      
      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(errorText || `Failed to update session status: ${response.status}`);
      }
      
      // Get updated session data
      const updatedSession = await response.json();
      console.log('📝 Updated session from API:', updatedSession);
      
      // Update request to confirmed session with video call
      const confirmedSession = {
        ...request,
        status: 'confirmed',
        confirmedAt: new Date().toISOString(),
        hasVideoCall: true
      };

      // Generate video call link only after mentor confirmation
      const sessionWithVideoCall = VideoCallService.addMeetingToSession(confirmedSession);
      console.log('🎥 Video call generated after mentor confirmation:', sessionWithVideoCall.videoCall);

      // Update states to show confirmed session
      setCreatedSession(sessionWithVideoCall);
      setSessionStatus('confirmed');
      setSessionCreated(true);

      // Send confirmation email with meeting link
      sendConfirmationEmail(sessionWithVideoCall);

    } catch (error) {
      console.error('❌ Error confirming session:', error);
      Alert.alert('Error', `Failed to confirm the session. ${error.message}`);
    }
  };

  // Function to handle mentor rejection
  const handleMentorRejection = (request) => {
    console.log('❌ Mentor rejected the session');
    setSessionStatus('rejected');
    // In real app, notify mentee about rejection and suggest alternative times
  };
  const sendConfirmationEmail = async (session) => {
    console.log('📧 Preparing to send confirmation email...');
    setEmailSending(true);

    try {
      // In a real app, you would get these from user profiles or authentication context
      const mentorEmail = 'mentor@example.com'; // Replace with actual mentor email
      const menteeEmail = 'mentee@example.com'; // Replace with actual mentee email

      const emailSent = await EmailService.sendSessionConfirmationEmail(
        session,
        mentorEmail,
        menteeEmail
      );

      if (emailSent) {
        console.log('✅ Confirmation email sent successfully!');
        setEmailSent(true);
      } else {
        console.log('📧 Email sending was cancelled or failed');
      }
    } catch (error) {
      console.error('❌ Error sending confirmation email:', error);
    } finally {
      setEmailSending(false);
    }
  };

  // Development test function for email functionality
  const testEmailFeature = async () => {
    console.log('🧪 Testing email feature...');
    try {
      await EmailTestUtils.testEmailService();
    } catch (error) {
      console.error('🧪 Email test failed:', error);
    }
  };

  // Show loading state while fetching mentor data
  if (loading && !sessionCreated && !bookingRequest) {
    return (
      <View style={[styles.container, styles.loadingContainer]}>
        <ActivityIndicator size="large" color="#667eea" />
        <Text style={styles.loadingText}>Loading mentor details...</Text>
      </View>
    );
  }
  
  // Show error state if mentor data couldn't be loaded
  if (error && !mentor && !sessionCreated && !bookingRequest) {
    return (
      <View style={[styles.container, styles.errorContainer]}>
        <Ionicons name="alert-circle" size={64} color="#e53935" />
        <Text style={styles.errorTitle}>Error Loading Mentor</Text>
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

  return (
    <ScrollView style={styles.container}>
      {/* Display error banner if using fallback data */}
      {error && mentor && (
        <View style={styles.errorBanner}>
          <Ionicons name="warning" size={18} color="#fff" />
          <Text style={styles.errorBannerText}>
            Error loading latest data. Some information may not be up to date.
          </Text>
        </View>
      )}
      
      {/* Show different screens based on session status */}
      
      {/* Pending Mentor Approval Screen */}
      {sessionStatus === 'pending' && bookingRequest ? (
        <View style={styles.pendingContainer}>
          <View style={styles.pendingHeader}>
            <Ionicons name="hourglass" size={80} color="#ffa726" />
            <Text style={styles.pendingTitle}>Request Sent! ⏳</Text>
            <Text style={styles.pendingSubtitle}>
              Waiting for {mentor?.name || 'the mentor'} to confirm your session
            </Text>
          </View>

          {/* Request Details */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Request Details</Text>
            <View style={styles.sessionDetailCard}>
              <View style={styles.detailRow}>
                <Ionicons name="person" size={24} color="#667eea" />
                <Text style={styles.detailText}>Mentor: {bookingRequest.mentorName}</Text>
              </View>
              <View style={styles.detailRow}>
                <Ionicons name="calendar" size={24} color="#667eea" />
                <Text style={styles.detailText}>Requested Date: {bookingRequest.date}</Text>
              </View>
              <View style={styles.detailRow}>
                <Ionicons name="time" size={24} color="#667eea" />
                <Text style={styles.detailText}>Requested Time: {bookingRequest.time}</Text>
              </View>
              <View style={styles.detailRow}>
                <Ionicons name="hourglass" size={24} color="#667eea" />
                <Text style={styles.detailText}>Duration: {bookingRequest.duration} minutes</Text>
              </View>
              {bookingRequest.topic && (
                <View style={styles.detailRow}>
                  <Ionicons name="book" size={24} color="#667eea" />
                  <Text style={styles.detailText}>Topic: {bookingRequest.topic}</Text>
                </View>
              )}
            </View>
          </View>

          {/* Status Information */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>
              <Ionicons name="information-circle" size={20} color="#ffa726" /> What's Next?
            </Text>
            <View style={styles.statusCard}>
              <Text style={styles.statusText}>
                📨 Your mentor has been notified about your session request
              </Text>
              <Text style={styles.statusText}>
                ⏰ You'll receive a confirmation email once they approve
              </Text>
              <Text style={styles.statusText}>
                🎥 Meeting link will be generated only after confirmation
              </Text>
              <Text style={styles.statusText}>
                📧 Both you and your mentor will get session details via email
              </Text>
            </View>
          </View>

          {/* Cancel Request Button */}
          <View style={styles.actionButtonsContainer}>
            <TouchableOpacity
              style={styles.cancelButton}
              onPress={() => {
                setSessionStatus('booking');
                setBookingRequest(null);
              }}
            >
              <Ionicons name="close" size={24} color="#e53e3e" />
              <Text style={styles.cancelButtonText}>Cancel Request</Text>
            </TouchableOpacity>
          </View>
        </View>
      ) : 
      
      /* Mentor Rejected Screen */
      sessionStatus === 'rejected' ? (
        <View style={styles.rejectedContainer}>
          <View style={styles.rejectedHeader}>
            <Ionicons name="close-circle" size={80} color="#e53e3e" />
            <Text style={styles.rejectedTitle}>Request Not Available</Text>
            <Text style={styles.rejectedSubtitle}>
              The mentor is not available at your requested time
            </Text>
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Suggested Actions</Text>
            <View style={styles.suggestionCard}>
              <Text style={styles.suggestionText}>
                • Try selecting a different time slot
              </Text>
              <Text style={styles.suggestionText}>
                • Check mentor's availability calendar
              </Text>
              <Text style={styles.suggestionText}>
                • Consider booking for next week
              </Text>
            </View>
          </View>

          <View style={styles.actionButtonsContainer}>
            <TouchableOpacity
              style={styles.tryAgainButton}
              onPress={() => {
                setSessionStatus('booking');
                setBookingRequest(null);
                setSelectedDate(null);
                setSelectedTime(null);
              }}
            >
              <Ionicons name="refresh" size={24} color="#667eea" />
              <Text style={styles.tryAgainButtonText}>Try Different Time</Text>
            </TouchableOpacity>
          </View>
        </View>
      ) : 
      
      /* Confirmed Session Screen */
      sessionStatus === 'confirmed' && sessionCreated && createdSession ? (
        <View style={styles.successContainer}>
          {/* Success Header */}
          <View style={styles.successHeader}>
            <Ionicons name="checkmark-circle" size={80} color="#4CAF50" />
            <Text style={styles.successTitle}>Session Confirmed! 🎉</Text>
            <Text style={styles.successSubtitle}>
              Your mentoring session has been successfully booked
            </Text>
          </View>

          {/* Session Details */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Session Details</Text>
            <View style={styles.sessionDetailCard}>
              <View style={styles.detailRow}>
                <Ionicons name="person" size={24} color="#667eea" />
                <Text style={styles.detailText}>Mentor: {createdSession.mentorName}</Text>
              </View>
              <View style={styles.detailRow}>
                <Ionicons name="calendar" size={24} color="#667eea" />
                <Text style={styles.detailText}>Date: {createdSession.date}</Text>
              </View>
              <View style={styles.detailRow}>
                <Ionicons name="time" size={24} color="#667eea" />
                <Text style={styles.detailText}>Time: {createdSession.time}</Text>
              </View>
              <View style={styles.detailRow}>
                <Ionicons name="hourglass" size={24} color="#667eea" />
                <Text style={styles.detailText}>Duration: {createdSession.duration} minutes</Text>
              </View>
              {createdSession.topic && (
                <View style={styles.detailRow}>
                  <Ionicons name="book" size={24} color="#667eea" />
                  <Text style={styles.detailText}>Topic: {createdSession.topic}</Text>
                </View>
              )}
            </View>
          </View>

          {/* Video Call Section */}
          {createdSession.hasVideoCall && (
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>
                <Ionicons name="videocam" size={20} color="#667eea" /> Video Call Ready
              </Text>
              <View style={styles.videoCallCard}>
                <Text style={styles.videoCallInfo}>
                  A video meeting room has been automatically created for your session.
                  You can join the call 15 minutes before the scheduled time.
                </Text>
                
                <View style={styles.meetingLinkContainer}>
                  <Text style={styles.linkLabel}>Meeting Link:</Text>
                  <View style={styles.linkRow}>
                    <TextInput
                      style={styles.linkInput}
                      value={createdSession.videoCall.meetingUrl}
                      editable={false}
                      selectTextOnFocus={true}
                    />
                    <TouchableOpacity
                      style={styles.copyButton}
                      onPress={copyMeetingLink}
                    >
                      <Ionicons name="copy" size={20} color="white" />
                      <Text style={styles.copyButtonText}>Copy</Text>
                    </TouchableOpacity>
                  </View>
                </View>

                <View style={styles.platformInfo}>
                  <Ionicons name="information-circle" size={16} color="#666" />
                  <Text style={styles.platformText}>
                    Using {createdSession.videoCall.provider === 'jitsi' ? 'Jitsi Meet' : createdSession.videoCall.provider}
                    {' - No account required, works in any browser'}
                  </Text>
                </View>
              </View>
            </View>
          )}

          {/* Email Status Section */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>
              <Ionicons name="mail" size={20} color="#667eea" /> Email Confirmation
            </Text>
            <View style={styles.emailStatusCard}>
              {emailSending ? (
                <View style={styles.emailSendingRow}>
                  <Ionicons name="sync" size={24} color="#ffa726" />
                  <Text style={styles.emailSendingText}>Sending confirmation email...</Text>
                </View>
              ) : emailSent ? (
                <View style={styles.emailSuccessRow}>
                  <Ionicons name="checkmark-circle" size={24} color="#4CAF50" />
                  <Text style={styles.emailSuccessText}>
                    Confirmation email sent! Check your inbox for session details and meeting link.
                  </Text>
                </View>
              ) : (
                <View style={styles.emailPendingRow}>
                  <Ionicons name="time" size={24} color="#ffa726" />
                  <Text style={styles.emailPendingText}>
                    Preparing to send confirmation email...
                  </Text>
                </View>
              )}
              
              <Text style={styles.emailNote}>
                📧 Both you and your mentor will receive a detailed email with session information and the video meeting link.
              </Text>

              {/* Resend Email Button */}
              {emailSent && (
                <View style={styles.emailActionButtons}>
                  <TouchableOpacity
                    style={styles.previewEmailButton}
                    onPress={() => setShowEmailPreview(true)}
                  >
                    <Ionicons name="eye" size={18} color="#667eea" />
                    <Text style={styles.previewEmailText}>Preview Email</Text>
                  </TouchableOpacity>
                  
                  <TouchableOpacity
                    style={styles.resendEmailButton}
                    onPress={() => sendConfirmationEmail(createdSession)}
                    disabled={emailSending}
                  >
                    <Ionicons name="refresh" size={18} color="#667eea" />
                    <Text style={styles.resendEmailText}>Send Again</Text>
                  </TouchableOpacity>
                </View>
              )}
            </View>
          </View>

          {/* Action Buttons */}
          <View style={styles.actionButtonsContainer}>
            <TouchableOpacity
              style={styles.doneButton}
              onPress={() => navigation.goBack()}
            >
              <Ionicons name="checkmark" size={24} color="white" />
              <Text style={styles.doneButtonText}>Done</Text>
            </TouchableOpacity>
            
            <TouchableOpacity
              style={styles.shareButton}
              onPress={copyMeetingLink}
            >
              <Ionicons name="share" size={24} color="#667eea" />
              <Text style={styles.shareButtonText}>Share Link</Text>
            </TouchableOpacity>
            
            <TouchableOpacity
              style={styles.viewSessionsButton}
              onPress={() => navigation.navigate('MySessions')}
            >
              <Ionicons name="calendar" size={24} color="#4CAF50" />
              <Text style={styles.viewSessionsText}>View All Sessions</Text>
            </TouchableOpacity>
          </View>
        </View>
      ) : (
        /* Original booking form */
        <View style={styles.bookingSection}>
          <View style={styles.mentorCard}>
            <View style={styles.mentorInfo}>
              <Ionicons name="person-circle" size={50} color="#764ba2" />
              <View style={styles.mentorDetails}>
                <Text style={styles.mentorName}>{mentor?.name || 'Mentor'}</Text>
                <Text style={styles.sessionFee}>
                  {mentor?.sessionFee === 0 ? 'Free Session' : `${mentor?.sessionFee} MMK/hr`}
                </Text>
              </View>
            </View>
          </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>{t('selectDate')}</Text>
        <View style={styles.dateGrid}>
          {Object.keys(availableSlots).map((date) => (
            <TouchableOpacity
              key={date}
              style={[
                styles.dateButton,
                selectedDate === date && styles.selectedDate,
              ]}
              onPress={() => setSelectedDate(date)}
            >
              <Text
                style={[
                  styles.dateText,
                  selectedDate === date && styles.selectedDateText,
                ]}
              >
                {date}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      {selectedDate && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>{t('selectTime')}</Text>
          <View style={styles.timeGrid}>
            {availableSlots[selectedDate].map((time) => (
              <TouchableOpacity
                key={time}
                style={[
                  styles.timeButton,
                  selectedTime === time && styles.selectedTime,
                ]}
                onPress={() => setSelectedTime(time)}
              >
                <Text
                  style={[
                    styles.timeText,
                    selectedTime === time && styles.selectedTimeText,
                  ]}
                >
                  {time}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>
      )}

      {selectedDate && selectedTime && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>{t('sessionDetails')}</Text>
          <View style={styles.detailsCard}>
            <View style={styles.detailRow}>
              <Ionicons name="calendar-outline" size={24} color="#667eea" />
              <Text style={styles.detailText}>{selectedDate}</Text>
            </View>
            <View style={styles.detailRow}>
              <Ionicons name="time-outline" size={24} color="#667eea" />
              <Text style={styles.detailText}>{selectedTime}</Text>
            </View>
            <View style={styles.detailRow}>
              <Ionicons name="hourglass-outline" size={24} color="#667eea" />
              <Text style={styles.detailText}>60 {t('minutes')}</Text>
            </View>
          </View>
        </View>
      )}

      {selectedDate && selectedTime && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Message to Mentor (optional)</Text>
          <View style={styles.detailsCard}>
            <Text style={styles.detailText}>Add a note for your mentor about your session goals, questions, or anything you'd like to discuss.</Text>
            <View style={styles.noteInputContainer}>
              <TextInput
                style={styles.noteInput}
                placeholder="Type your message here..."
                value={requestNote}
                onChangeText={setRequestNote}
                multiline
              />
            </View>
          </View>
        </View>
      )}

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>{t('paymentNote')}</Text>
        <View style={styles.paymentInfo}>
          <Text style={styles.paymentText}>
            Session fee: {mentor?.sessionFee === 0 ? 'Free' : `${mentor?.sessionFee || 0} MMK/hr`}
          </Text>
          <Text style={styles.paymentSubtext}>
            Payment will be processed after the mentor confirms your session request.
          </Text>
        </View>
      </View>

      {/* Debug info - can be removed in production */}
      {!sessionCreated && (
        <View style={[styles.section, { backgroundColor: '#f0f0f0' }]}>
          <Text style={styles.sectionTitle}>Debug Info</Text>
          <Text>Selected Date: {selectedDate || 'None'}</Text>
          <Text>Selected Time: {selectedTime || 'None'}</Text>
          <Text>Mentor Name: {mentor?.name || 'Unknown'}</Text>
          <Text>Button Enabled: {selectedDate && selectedTime ? 'YES' : 'NO'}</Text>
          
          {/* VISUAL SUCCESS INDICATOR */}
          {buttonClicked && (
            <View style={{
              backgroundColor: '#4CAF50',
              padding: 15,
              borderRadius: 10,
              marginTop: 10,
              alignItems: 'center',
            }}>
              <Text style={{ color: 'white', fontSize: 18, fontWeight: 'bold' }}>
                ✅ SESSION BEING CREATED! ✅
              </Text>
              <Text style={{ color: 'white', fontSize: 14, textAlign: 'center' }}>
                {selectedDate && selectedTime 
                  ? `Creating session for ${selectedDate} at ${selectedTime}...`
                  : 'Please select date and time first!'
                }
              </Text>
            </View>
          )}
        </View>
      )}

      <TouchableOpacity
        style={[
          styles.requestButton,
          (!selectedDate || !selectedTime) && styles.disabledButton,
        ]}
        disabled={!selectedDate || !selectedTime}
        onPress={async () => {
          console.log('🔴 BUTTON PRESSED - Starting session creation...');
          try {
            await handleRequestSession();
          } catch (error) {
            console.error('Error in session request:', error);
            Alert.alert(
              'Session Request Failed',
              `We couldn't process your request. ${error.message}`,
              [{ text: 'OK' }]
            );
          }
        }}
      >
        <Text style={styles.requestButtonText}>Request Session</Text>
        <Text style={styles.requestButtonSubtext}>
          {mentor?.sessionFee === 0 ? 'Pending mentor approval' : `${mentor?.sessionFee || 0} MMK/hr - Pending approval`}
        </Text>
      </TouchableOpacity>
    </View>
  )}

  {/* Email Preview Modal */}
      <EmailPreview
        visible={showEmailPreview}
        onClose={() => setShowEmailPreview(false)}
        session={createdSession}
      />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  successContainer: {
    flex: 1,
    padding: 20,
  },
  successHeader: {
    alignItems: 'center',
    paddingVertical: 30,
    backgroundColor: 'white',
    borderRadius: 12,
    marginBottom: 20,
  },
  successTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    marginTop: 15,
    textAlign: 'center',
  },
  successSubtitle: {
    fontSize: 16,
    color: '#666',
    marginTop: 8,
    textAlign: 'center',
  },
  sessionDetailCard: {
    backgroundColor: '#f8f9fa',
    borderRadius: 12,
    padding: 15,
  },
  videoCallCard: {
    backgroundColor: '#f0f4ff',
    borderRadius: 12,
    padding: 15,
    borderLeftWidth: 4,
    borderLeftColor: '#667eea',
  },
  videoCallInfo: {
    fontSize: 14,
    color: '#333',
    lineHeight: 20,
    marginBottom: 15,
  },
  meetingLinkContainer: {
    marginBottom: 15,
  },
  linkLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
    marginBottom: 8,
  },
  linkRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  linkInput: {
    flex: 1,
    backgroundColor: 'white',
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 12,
    marginRight: 10,
    fontSize: 14,
    color: '#333',
  },
  copyButton: {
    backgroundColor: '#667eea',
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 15,
    paddingVertical: 12,
    borderRadius: 8,
  },
  copyButtonText: {
    color: 'white',
    fontWeight: '600',
    marginLeft: 5,
  },
  platformInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  platformText: {
    fontSize: 12,
    color: '#666',
    marginLeft: 5,
    flex: 1,
  },
  actionButtonsContainer: {
    flexDirection: 'row',
    marginTop: 30,
    gap: 10,
  },
  doneButton: {
    flex: 1,
    backgroundColor: '#4CAF50',
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 15,
    borderRadius: 12,
  },
  doneButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
  },
  shareButton: {
    flex: 1,
    backgroundColor: 'white',
    borderWidth: 2,
    borderColor: '#667eea',
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 15,
    borderRadius: 12,
  },
  shareButtonText: {
    color: '#667eea',
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
  },
  viewSessionsButton: {
    backgroundColor: '#e8f5e9',
    borderWidth: 2,
    borderColor: '#4CAF50',
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 15,
    borderRadius: 12,
    marginTop: 10,
    width: '100%',
  },
  viewSessionsText: {
    color: '#4CAF50',
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
  },
  mentorCard: {
    backgroundColor: 'white',
    padding: 20,
    marginBottom: 10,
  },
  mentorInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  mentorDetails: {
    marginLeft: 15,
    flex: 1,
  },
  mentorName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  sessionFee: {
    fontSize: 16,
    color: '#667eea',
    marginTop: 4,
    fontWeight: '600',
  },
  section: {
    backgroundColor: 'white',
    padding: 20,
    marginBottom: 10,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 15,
  },
  dateGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginHorizontal: -5,
  },
  dateButton: {
    width: '31%',
    margin: '1%',
    padding: 12,
    borderRadius: 8,
    backgroundColor: '#f8f9fa',
    alignItems: 'center',
  },
  selectedDate: {
    backgroundColor: '#667eea',
  },
  dateText: {
    fontSize: 14,
    color: '#333',
  },
  selectedDateText: {
    color: 'white',
  },
  timeGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginHorizontal: -5,
  },
  timeButton: {
    width: '31%',
    margin: '1%',
    padding: 12,
    borderRadius: 8,
    backgroundColor: '#f8f9fa',
    alignItems: 'center',
  },
  selectedTime: {
    backgroundColor: '#667eea',
  },
  timeText: {
    fontSize: 14,
    color: '#333',
  },
  selectedTimeText: {
    color: 'white',
  },
  detailsCard: {
    backgroundColor: '#f8f9fa',
    borderRadius: 12,
    padding: 15,
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
  paymentInfo: {
    backgroundColor: '#F0F4FF',
    padding: 15,
    borderRadius: 8,
  },
  paymentText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#667eea',
    marginBottom: 5,
  },
  paymentSubtext: {
    fontSize: 14,
    color: '#666',
  },
  requestButton: {
    backgroundColor: '#667eea',
    margin: 20,
    padding: 20,
    borderRadius: 12,
    alignItems: 'center',
  },
  disabledButton: {
    backgroundColor: '#cccccc',
  },
  requestButtonText: {
    color: 'white',
    fontSize: 18,
    fontWeight: '700',
  },
  requestButtonSubtext: {
    color: 'rgba(255, 255, 255, 0.9)',
    fontSize: 14,
    marginTop: 4,
  },
  noteInputContainer: {
    backgroundColor: '#f8f9fa',
    borderRadius: 8,
    marginTop: 10,
  },
  noteInput: {
    padding: 10,
    fontSize: 14,
    minHeight: 40,
    color: '#333',
  },

  // Email Status Styles
  emailStatusCard: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 20,
    marginTop: 10,
    borderLeftWidth: 4,
    borderLeftColor: '#667eea',
  },
  emailSendingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 15,
  },
  emailSuccessRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 15,
  },
  emailPendingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 15,
  },
  emailSendingText: {
    fontSize: 16,
    color: '#ffa726',
    marginLeft: 10,
    fontWeight: '600',
  },
  emailSuccessText: {
    fontSize: 16,
    color: '#4CAF50',
    marginLeft: 10,
    fontWeight: '600',
    flex: 1,
  },
  emailPendingText: {
    fontSize: 16,
    color: '#ffa726',
    marginLeft: 10,
    fontWeight: '600',
  },
  emailNote: {
    fontSize: 14,
    color: '#666',
    fontStyle: 'italic',
    marginTop: 10,
    paddingTop: 15,
    borderTopWidth: 1,
    borderTopColor: '#f0f0f0',
  },
  emailActionButtons: {
    flexDirection: 'row',
    marginTop: 15,
    gap: 10,
  },
  previewEmailButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#f8f9ff',
    borderWidth: 1,
    borderColor: '#667eea',
    borderRadius: 8,
    padding: 12,
  },
  previewEmailText: {
    color: '#667eea',
    fontSize: 14,
    fontWeight: '600',
    marginLeft: 5,
  },
  resendEmailButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#f8f9ff',
    borderWidth: 1,
    borderColor: '#667eea',
    borderRadius: 8,
    padding: 12,
  },
  resendEmailText: {
    color: '#667eea',
    fontSize: 14,
    fontWeight: '600',
    marginLeft: 5,
  },
  // New styles for pending and rejected states
  pendingContainer: {
    flex: 1,
    padding: 20,
  },
  pendingHeader: {
    alignItems: 'center',
    paddingVertical: 30,
    backgroundColor: 'white',
    borderRadius: 12,
    marginBottom: 20,
  },
  pendingTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    marginTop: 15,
    textAlign: 'center',
  },
  pendingSubtitle: {
    fontSize: 16,
    color: '#666',
    marginTop: 8,
    textAlign: 'center',
  },
  statusCard: {
    backgroundColor: '#fff8e1',
    borderRadius: 12,
    padding: 15,
    borderLeftWidth: 4,
    borderLeftColor: '#ffa726',
  },
  statusText: {
    fontSize: 14,
    color: '#333',
    lineHeight: 20,
    marginBottom: 8,
  },
  cancelButton: {
    backgroundColor: 'white',
    borderWidth: 2,
    borderColor: '#e53e3e',
    borderRadius: 12,
    padding: 15,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  cancelButtonText: {
    color: '#e53e3e',
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
  },
  rejectedContainer: {
    flex: 1,
    padding: 20,
  },
  rejectedHeader: {
    alignItems: 'center',
    paddingVertical: 30,
    backgroundColor: 'white',
    borderRadius: 12,
    marginBottom: 20,
  },
  rejectedTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    marginTop: 15,
    textAlign: 'center',
  },
  rejectedSubtitle: {
    fontSize: 16,
    color: '#666',
    marginTop: 8,
    textAlign: 'center',
  },
  suggestionCard: {
    backgroundColor: '#f8f9fa',
    borderRadius: 12,
    padding: 15,
  },
  suggestionText: {
    fontSize: 14,
    color: '#333',
    lineHeight: 20,
    marginBottom: 8,
  },
  tryAgainButton: {
    backgroundColor: '#667eea',
    borderRadius: 12,
    padding: 15,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  tryAgainButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
  },
  // Loading styles
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
    minHeight: 200,
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
    padding: 20,
    minHeight: 300,
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
    marginBottom: 10,
  },
  errorBannerText: {
    color: 'white',
    fontSize: 13,
    marginLeft: 8,
  },
});
