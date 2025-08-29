// Video call service for generating meeting links and managing video sessions
import { Alert, Linking } from 'react-native';

export const VIDEO_CALL_PROVIDERS = {
  GOOGLE_MEET: 'google_meet',
  ZOOM: 'zoom',
  JITSI: 'jitsi',
};

class VideoCallService {
  constructor() {
    this.defaultProvider = VIDEO_CALL_PROVIDERS.JITSI; // Default to Jitsi (free and easy)
  }

  /**
   * Generate a meeting link based on session details
   * @param {Object} session - Session object containing id, date, time, etc.
   * @param {string} provider - Video call provider
   * @returns {Object} - Meeting link and join details
   */
  generateMeetingLink(session, provider = this.defaultProvider) {
    const sessionId = session.id || Date.now().toString();
    const roomName = `mentor-session-${sessionId}`;
    
    switch (provider) {
      case VIDEO_CALL_PROVIDERS.GOOGLE_MEET:
        return this.generateGoogleMeetLink(session, roomName);
      
      case VIDEO_CALL_PROVIDERS.ZOOM:
        return this.generateZoomLink(session, roomName);
      
      case VIDEO_CALL_PROVIDERS.JITSI:
      default:
        return this.generateJitsiLink(session, roomName);
    }
  }
  
  /**
   * Simple method to generate just a meeting URL without the full object
   * @param {string} sessionId - Session ID to use in the URL
   * @returns {string} - Meeting URL
   */
  generateMeetingUrl(sessionId) {
    const sanitizedRoomName = `mentor-session-${sessionId}`.replace(/[^a-zA-Z0-9-]/g, '');
    return `https://meet.jit.si/${sanitizedRoomName}`;
  }

  /**
   * Generate Google Meet link (requires Google Calendar API integration)
   * For now, we'll create a basic meet.google.com link
   */
  generateGoogleMeetLink(session, roomName) {
    const meetingId = `mentor-${session.id}-${Date.now()}`;
    return {
      provider: VIDEO_CALL_PROVIDERS.GOOGLE_MEET,
      meetingUrl: `https://meet.google.com/new`, // In production, use Google Calendar API
      meetingId: meetingId,
      instructions: 'Click the link to create a new Google Meet room. Share the room code with your mentoring partner.',
      joinText: 'Join Google Meet',
      createdAt: new Date().toISOString(),
    };
  }

  /**
   * Generate Zoom link (requires Zoom API integration)
   * For now, we'll create a personal meeting room link
   */
  generateZoomLink(session, roomName) {
    const meetingId = `${Math.floor(Math.random() * 1000000000)}`;
    return {
      provider: VIDEO_CALL_PROVIDERS.ZOOM,
      meetingUrl: `https://zoom.us/j/${meetingId}`, // In production, use Zoom API
      meetingId: meetingId,
      instructions: 'Click the link to join the Zoom meeting. You may need to download the Zoom app.',
      joinText: 'Join Zoom Meeting',
      createdAt: new Date().toISOString(),
    };
  }

  /**
   * Generate Jitsi Meet link (free and instant)
   */
  generateJitsiLink(session, roomName) {
    const sanitizedRoomName = roomName.replace(/[^a-zA-Z0-9-]/g, '');
    return {
      provider: VIDEO_CALL_PROVIDERS.JITSI,
      meetingUrl: `https://meet.jit.si/${sanitizedRoomName}`,
      meetingId: sanitizedRoomName,
      instructions: 'Click the link to join the video call. No account or app download required.',
      joinText: 'Join Video Call',
      createdAt: new Date().toISOString(),
    };
  }

  /**
   * Check if it's time to show the "Join Call" button
   * Show button 15 minutes before scheduled time until 1 hour after
   */
  canJoinCall(session) {
    const now = new Date();
    const sessionDateTime = new Date(`${session.date} ${session.time}`);
    const fifteenMinutesBefore = new Date(sessionDateTime.getTime() - 15 * 60 * 1000);
    const oneHourAfter = new Date(sessionDateTime.getTime() + 60 * 60 * 1000);
    
    return now >= fifteenMinutesBefore && now <= oneHourAfter;
  }

  /**
   * Check if the session is starting soon (within 15 minutes)
   */
  isSessionStartingSoon(session) {
    const now = new Date();
    const sessionDateTime = new Date(`${session.date} ${session.time}`);
    const fifteenMinutesBefore = new Date(sessionDateTime.getTime() - 15 * 60 * 1000);
    
    return now >= fifteenMinutesBefore && now < sessionDateTime;
  }

  /**
   * Check if the session is currently active
   */
  isSessionActive(session) {
    const now = new Date();
    const sessionDateTime = new Date(`${session.date} ${session.time}`);
    const sessionEndTime = new Date(sessionDateTime.getTime() + (session.duration || 60) * 60 * 1000);
    
    return now >= sessionDateTime && now <= sessionEndTime;
  }

  /**
   * Open the video call in the device's browser or app
   */
  async joinCall(meetingDetails) {
    try {
      const supported = await Linking.canOpenURL(meetingDetails.meetingUrl);
      
      if (supported) {
        await Linking.openURL(meetingDetails.meetingUrl);
      } else {
        Alert.alert(
          'Unable to open link',
          'Please copy the meeting link and open it in your browser manually.',
          [
            {
              text: 'Copy Link',
              onPress: () => {
                // In a real app, you'd copy to clipboard
                console.log('Copy to clipboard:', meetingDetails.meetingUrl);
              },
            },
            { text: 'OK' },
          ]
        );
      }
    } catch (error) {
      console.error('Error opening video call:', error);
      Alert.alert('Error', 'Unable to open the video call. Please try again.');
    }
  }

  /**
   * Get the status text for the join button
   */
  getJoinButtonStatus(session) {
    if (this.isSessionActive(session)) {
      return { text: 'Join Now', color: '#4CAF50', urgent: true };
    } else if (this.isSessionStartingSoon(session)) {
      return { text: 'Starting Soon', color: '#FF9800', urgent: true };
    } else if (this.canJoinCall(session)) {
      return { text: 'Join Call', color: '#667eea', urgent: false };
    }
    return null;
  }

  /**
   * Store meeting details in session data
   * In a real app, this would be stored in a database
   */
  addMeetingToSession(session, provider = this.defaultProvider) {
    const meetingDetails = this.generateMeetingLink(session, provider);
    
    return {
      ...session,
      videoCall: meetingDetails,
      hasVideoCall: true,
    };
  }
}

export default new VideoCallService();
