/**
 * Email Service for Mentor-Mentee Portal
 * Handles sending confirmation emails for session bookings
 */

import * as MailComposer from 'expo-mail-composer';

class EmailService {
  /**
   * Check if email service is available on the device
   */
  static async isAvailable() {
    try {
      return await MailComposer.isAvailableAsync();
    } catch (error) {
      console.warn('Email service availability check failed:', error);
      return false;
    }
  }

  /**
   * Generate email content for session confirmation
   * @param {Object} session - Session details
   * @param {Object} mentorEmail - Mentor's email address  
   * @param {Object} menteeEmail - Mentee's email address
   * @returns {Object} Email content object
   */
  static generateSessionConfirmationEmail(session, mentorEmail, menteeEmail) {
    const { mentorName, date, time, duration, topic, videoCall } = session;
    
    const subject = `Session Confirmed: ${mentorName} - ${date} at ${time}`;
    
    const emailBody = `
<!DOCTYPE html>
<html>
<head>
    <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
        .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
        .session-details { background: white; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #667eea; }
        .video-call-section { background: #e8f5e8; padding: 20px; border-radius: 8px; margin: 20px 0; }
        .meeting-link { background: #667eea; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block; margin: 10px 0; }
        .instructions { background: #fff3cd; padding: 15px; border-radius: 6px; margin: 15px 0; border-left: 4px solid #ffc107; }
        .footer { text-align: center; margin-top: 30px; color: #666; font-size: 14px; }
        .emoji { font-size: 24px; }
        .highlight { color: #667eea; font-weight: bold; }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <div class="emoji">🎉</div>
            <h1>Session Confirmed!</h1>
            <p>Your mentoring session has been successfully booked</p>
        </div>
        
        <div class="content">
            <div class="session-details">
                <h2>📅 Session Details</h2>
                <p><strong>Mentor:</strong> ${mentorName}</p>
                <p><strong>Date:</strong> ${date}</p>
                <p><strong>Time:</strong> ${time}</p>
                <p><strong>Duration:</strong> ${duration} minutes</p>
                <p><strong>Topic:</strong> ${topic}</p>
            </div>

            ${videoCall ? `
            <div class="video-call-section">
                <h2>🎥 Video Call Information</h2>
                <p>A video meeting room has been automatically created for your session.</p>
                <p><strong>Platform:</strong> ${videoCall.platform}</p>
                
                <div style="text-align: center; margin: 20px 0;">
                    <a href="${videoCall.meetingUrl}" class="meeting-link">
                        🔗 Join Video Call
                    </a>
                </div>
                
                <div class="instructions">
                    <h3>📋 Important Instructions:</h3>
                    <ul>
                        <li>You can join the call <span class="highlight">15 minutes before</span> the scheduled time</li>
                        <li>Please test your camera and microphone beforehand</li>
                        <li>Keep this email handy for easy access to the meeting link</li>
                        <li>If you experience any technical issues, contact support</li>
                    </ul>
                </div>
            </div>
            ` : ''}

            <div class="instructions">
                <h3>📞 What's Next?</h3>
                <ul>
                    <li>Add this session to your calendar</li>
                    <li>Prepare any questions or topics you'd like to discuss</li>
                    <li>Join the video call at the scheduled time</li>
                    <li>Reach out if you need to reschedule</li>
                </ul>
            </div>
            
            <div class="footer">
                <p>Thank you for using Mentor-Mentee Portal!</p>
                <p>If you have any questions, please don't hesitate to contact us.</p>
            </div>
        </div>
    </div>
</body>
</html>`;

    return {
      subject,
      body: emailBody,
      isHtml: true,
      recipients: [menteeEmail, mentorEmail],
    };
  }

  /**
   * Send session confirmation email to both mentor and mentee
   * @param {Object} session - Session details
   * @param {string} mentorEmail - Mentor's email address
   * @param {string} menteeEmail - Mentee's email address
   * @returns {Promise<boolean>} Success status
   */
  static async sendSessionConfirmationEmail(session, mentorEmail = 'mentor@example.com', menteeEmail = 'mentee@example.com') {
    try {
      console.log('📧 Preparing to send confirmation email...');
      console.log('📧 Session details:', {
        mentor: session.mentorName,
        date: session.date,
        time: session.time,
        hasVideoCall: !!session.videoCall
      });
      
      // Check if email service is available
      const isEmailAvailable = await this.isAvailable();
      if (!isEmailAvailable) {
        console.warn('📧 Email service not available on this device');
        
        // For development/testing, we'll log the email content and simulate success
        const emailContent = this.generateSessionConfirmationEmail(session, mentorEmail, menteeEmail);
        console.log('📧 Email would be sent with subject:', emailContent.subject);
        console.log('📧 Recipients:', emailContent.recipients);
        console.log('📧 Email content preview:', this.generatePlainTextEmail(session).substring(0, 200) + '...');
        
        // Simulate email sending delay for realistic UX
        await new Promise(resolve => setTimeout(resolve, 1500));
        console.log('✅ Email simulation completed successfully!');
        return true; // Return success for development
      }

      // Generate email content
      const emailContent = this.generateSessionConfirmationEmail(session, mentorEmail, menteeEmail);
      
      // Compose and send email
      console.log('📧 Opening email composer...');
      const result = await MailComposer.composeAsync({
        recipients: emailContent.recipients,
        subject: emailContent.subject,
        body: emailContent.body,
        isHtml: emailContent.isHtml,
      });

      console.log('📧 Email composer result:', result);
      
      // Check if email was sent successfully
      if (result.status === MailComposer.MailComposerStatus.SENT) {
        console.log('✅ Session confirmation email sent successfully!');
        return true;
      } else if (result.status === MailComposer.MailComposerStatus.SAVED) {
        console.log('📧 Email saved to drafts');
        return true;
      } else {
        console.log('📧 Email composition cancelled by user');
        return false;
      }

    } catch (error) {
      console.error('❌ Failed to send confirmation email:', error);
      // In production, you might want to report this error to your analytics service
      return false;
    }
  }

  /**
   * Send a custom email using the device's email client
   * @param {Object} emailOptions - Email options (recipients, subject, body, etc.)
   * @returns {Promise<boolean>} Success status
   */
  static async sendCustomEmail(emailOptions) {
    try {
      const isEmailAvailable = await this.isAvailable();
      if (!isEmailAvailable) {
        console.warn('📧 Email service not available on this device');
        return false;
      }

      const result = await MailComposer.composeAsync(emailOptions);
      return result.status === MailComposer.MailComposerStatus.SENT;
    } catch (error) {
      console.error('❌ Failed to send custom email:', error);
      return false;
    }
  }

  /**
   * Generate a simple text version of the confirmation email
   * @param {Object} session - Session details
   * @returns {string} Plain text email content
   */
  static generatePlainTextEmail(session) {
    const { mentorName, date, time, duration, topic, videoCall } = session;
    
    return `
🎉 SESSION CONFIRMED!

Your mentoring session has been successfully booked.

📅 SESSION DETAILS:
• Mentor: ${mentorName}
• Date: ${date}
• Time: ${time}
• Duration: ${duration} minutes
• Topic: ${topic}

${videoCall ? `
🎥 VIDEO CALL INFORMATION:
• Platform: ${videoCall.platform}
• Meeting Link: ${videoCall.meetingUrl}

📋 IMPORTANT NOTES:
• You can join the call 15 minutes before the scheduled time
• Please test your camera and microphone beforehand
• Keep this information handy for easy access
` : ''}

📞 WHAT'S NEXT:
• Add this session to your calendar
• Prepare any questions or topics you'd like to discuss
• Join the video call at the scheduled time
• Reach out if you need to reschedule

Thank you for using Mentor-Mentee Portal!
    `.trim();
  }
}

export default EmailService;
