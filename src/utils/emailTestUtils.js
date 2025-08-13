/**
 * Email Testing Utilities
 * Helper functions for testing email functionality in development
 */

import EmailService from '../services/emailService';
import VideoCallService from '../services/videoCallService';

class EmailTestUtils {
  /**
   * Create a mock session for testing email functionality
   * @returns {Object} Mock session object
   */
  static createMockSession() {
    const mockSession = {
      id: 'test-session-' + Date.now(),
      mentorId: 'mentor123',
      mentorName: 'Dr. Sarah Johnson',
      date: 'August 15, 2025',
      time: '2:00 PM',
      duration: 60,
      status: 'confirmed',
      topic: 'React Native Development Mentoring',
      fee: 50,
    };

    // Add video call to the session
    return VideoCallService.addMeetingToSession(mockSession);
  }

  /**
   * Test email service functionality
   * @returns {Promise<void>}
   */
  static async testEmailService() {
    console.log('🧪 Starting Email Service Test...');
    
    try {
      // Check if email service is available
      const isAvailable = await EmailService.isAvailable();
      console.log('📧 Email service available:', isAvailable);

      // Create mock session
      const mockSession = this.createMockSession();
      console.log('📝 Created mock session:', mockSession);

      // Generate email content
      const emailContent = EmailService.generateSessionConfirmationEmail(
        mockSession,
        'mentor@example.com',
        'mentee@example.com'
      );
      console.log('📧 Generated email subject:', emailContent.subject);

      // Generate plain text version
      const plainText = EmailService.generatePlainTextEmail(mockSession);
      console.log('📄 Plain text email preview:');
      console.log(plainText.substring(0, 300) + '...');

      // Test sending email
      const emailSent = await EmailService.sendSessionConfirmationEmail(
        mockSession,
        'mentor@example.com',
        'mentee@example.com'
      );
      console.log('✅ Email test result:', emailSent ? 'SUCCESS' : 'FAILED');

      return {
        isAvailable,
        emailSent,
        session: mockSession,
        emailContent
      };

    } catch (error) {
      console.error('❌ Email service test failed:', error);
      throw error;
    }
  }

  /**
   * Log email content for debugging
   * @param {Object} session - Session object
   */
  static logEmailContent(session) {
    console.log('📧 === EMAIL CONTENT DEBUG ===');
    
    const htmlContent = EmailService.generateSessionConfirmationEmail(
      session,
      'mentor@example.com',
      'mentee@example.com'
    );
    
    const plainContent = EmailService.generatePlainTextEmail(session);
    
    console.log('Subject:', htmlContent.subject);
    console.log('Recipients:', htmlContent.recipients);
    console.log('HTML Email Length:', htmlContent.body.length);
    console.log('Plain Text Email:', plainContent);
    console.log('📧 === END EMAIL DEBUG ===');
  }

  /**
   * Test different session scenarios
   * @returns {Promise<void>}
   */
  static async testEmailScenarios() {
    console.log('🧪 Testing Different Email Scenarios...');

    const scenarios = [
      {
        name: 'Free Session',
        session: { ...this.createMockSession(), fee: 0 }
      },
      {
        name: 'Long Topic Name',
        session: { 
          ...this.createMockSession(), 
          topic: 'Advanced React Native Development with TypeScript, State Management, and API Integration Best Practices'
        }
      },
      {
        name: 'No Video Call',
        session: (() => {
          const session = this.createMockSession();
          delete session.videoCall;
          return session;
        })()
      },
      {
        name: 'Short Session',
        session: { ...this.createMockSession(), duration: 30 }
      }
    ];

    for (const scenario of scenarios) {
      console.log(`\n📧 Testing: ${scenario.name}`);
      this.logEmailContent(scenario.session);
    }
  }
}

export default EmailTestUtils;
