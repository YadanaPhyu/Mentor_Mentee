# Video Call Integration - MentorMyanmar

## Overview
This feature automatically creates video meeting links when sessions are confirmed and shows "Join Call" buttons to both mentors and mentees at the appropriate times.

## Features Implemented

### 1. Automatic Meeting Link Generation
- When a session is booked and confirmed, a video call link is automatically generated
- Supports multiple platforms: Google Meet, Zoom, and Jitsi Meet (default)
- Meeting details are stored with the session data

### 2. Smart Join Button Display
- Join button appears 15 minutes before scheduled time
- Button shows different states:
  - "Starting Soon" (15 minutes before)
  - "Join Now" (during session time)
  - "Join Call" (available window)
- Button disappears 1 hour after session end time

### 3. Video Call Platforms

#### Jitsi Meet (Default - Free)
- No account required
- Works directly in browser
- Instant room creation
- Format: `https://meet.jit.si/mentor-session-{sessionId}`

#### Google Meet
- Integrates with Google Calendar API (for production)
- Currently creates new meeting rooms
- Requires Google account

#### Zoom
- Integrates with Zoom API (for production)
- Currently generates meeting room links
- May require Zoom app download

### 4. User Interface Components

#### VideoCallButton Component
- Responsive button with status indicators
- Color-coded based on session timing
- Pulse animation for urgent sessions
- Automatic platform icon display

#### MeetingDetails Component
- Shows meeting platform information
- Displays meeting link with copy functionality
- Meeting ID and creation timestamp
- Platform-specific instructions

### 5. Updated Screens

#### For Mentees:
- **BookSession**: Auto-generates video call on booking confirmation
- **SessionHistory**: Shows join button for upcoming sessions
- **MentorshipProgress**: Displays video call details and join button

#### For Mentors:
- **SessionDetails**: Shows video call information for sessions
- **MentorDashboard**: Join button on upcoming session cards

## How It Works

### 1. Session Booking Flow
```
1. Mentee selects date/time → 2. Confirms booking → 3. Auto-generates video call → 4. Session created with video link
```

### 2. Join Call Flow
```
1. 15 min before → Join button appears → 2. User clicks → 3. Opens video call in browser/app
```

### 3. Video Call Service
- `VideoCallService.generateMeetingLink()` - Creates meeting links
- `VideoCallService.canJoinCall()` - Determines if join button should show
- `VideoCallService.joinCall()` - Opens video call link
- `VideoCallService.addMeetingToSession()` - Adds video call to session data

## Files Modified/Added

### New Files:
- `src/services/videoCallService.js` - Core video call functionality
- `src/components/VideoCallButton.js` - Reusable join button component
- `src/components/MeetingDetails.js` - Meeting information display

### Modified Files:
- `src/screens/mentee/BookSession.js` - Auto-generate video calls
- `src/screens/mentee/SessionHistory.js` - Join buttons for upcoming sessions
- `src/screens/mentee/MentorshipProgress.js` - Video call details and join button
- `src/screens/mentor/SessionDetails.js` - Video call information display
- `src/screens/MentorDashboard.js` - Join buttons on session cards
- `src/context/LanguageContext.js` - Video call translations (EN/MY)

## Configuration

### Default Settings
- **Default Platform**: Jitsi Meet (free, no account required)
- **Join Window**: 15 minutes before to 1 hour after session
- **Room Naming**: `mentor-session-{sessionId}`

### Customization Options
```javascript
// Change default platform
VideoCallService.defaultProvider = VIDEO_CALL_PROVIDERS.GOOGLE_MEET;

// Customize join window timing
VideoCallService.canJoinCall(session, customStartOffset, customEndOffset);
```

## Future Enhancements

### Production Ready Features:
1. **Google Calendar API Integration**
   - Automatic calendar event creation
   - Real Google Meet room generation
   - Calendar reminders

2. **Zoom API Integration**
   - Official Zoom meeting creation
   - Custom meeting passwords
   - Waiting room configuration

3. **Session Recording**
   - Automatic recording start/stop
   - Recording storage and sharing
   - Transcript generation

4. **Advanced Notifications**
   - Push notifications for session reminders
   - Email notifications with meeting links
   - SMS reminders

5. **Quality Assurance**
   - Network quality testing before calls
   - Backup platform fallbacks
   - Call quality feedback collection

## Usage Examples

### Basic Usage
```javascript
// Generate video call for session
const sessionWithVideo = VideoCallService.addMeetingToSession(session);

// Check if user can join
if (VideoCallService.canJoinCall(session)) {
  // Show join button
}

// Join the call
VideoCallService.joinCall(session.videoCall);
```

### Custom Platform
```javascript
// Use specific platform
const meetingDetails = VideoCallService.generateMeetingLink(
  session, 
  VIDEO_CALL_PROVIDERS.GOOGLE_MEET
);
```

## Testing

### Test Scenarios:
1. Book a session and verify video call generation
2. Check join button appears 15 minutes before session
3. Test join button functionality across platforms
4. Verify button disappears after session window
5. Test on different devices and browsers

### Mock Data:
All screens now include mock sessions with video call data for testing the UI components.

## Deployment Notes

### Environment Variables Needed:
```env
GOOGLE_CALENDAR_API_KEY=your_api_key
ZOOM_API_KEY=your_api_key
ZOOM_API_SECRET=your_api_secret
JITSI_DOMAIN=your_custom_domain (optional)
```

### Dependencies to Add:
```json
{
  "expo-clipboard": "^4.0.0",
  "expo-linking": "^5.0.0"
}
```

The video call integration is now complete and ready for testing! Users can book sessions and automatically get video meeting links, with smart join buttons that appear at the right time.
