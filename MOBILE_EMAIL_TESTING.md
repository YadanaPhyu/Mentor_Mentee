# 📱 Mobile Email Testing Guide

## Step-by-Step Instructions for Testing Email on Mobile Device

### 🚀 **Quick Start:**

1. **Start the Development Server**
   ```bash
   npx expo start
   ```

2. **Install Expo Go App** on your phone:
   - **iOS:** Download from App Store
   - **Android:** Download from Google Play Store

3. **Connect Your Phone:**
   - Scan the QR code with Expo Go app
   - Or use the same WiFi network and enter the URL manually

4. **Test Email Feature:**
   - Navigate to mentee booking screen
   - Book a session with any mentor
   - Watch your phone's email app open automatically!

---

## 📱 **Detailed Mobile Testing Steps:**

### **Phase 1: Setup**

1. **Open Terminal/Command Prompt**
   ```bash
   cd "D:\Mentor_Mentee"
   npx expo start
   ```

2. **You'll see output like:**
   ```
   Metro waiting on exp://192.168.1.100:8081
   › Scan the QR code above with Expo Go (Android) or the Camera app (iOS)
   ```

3. **Install Expo Go on your phone:**
   - iOS: https://apps.apple.com/app/expo-go/id982107779
   - Android: https://play.google.com/store/apps/details?id=host.exp.exponent

### **Phase 2: Connect Phone**

4. **Open Expo Go app on your phone**

5. **Scan QR Code:**
   - **Android:** Use Expo Go app's scanner
   - **iOS:** Use Camera app or Expo Go scanner

6. **App loads on your phone** - You should see the Mentor-Mentee Portal

### **Phase 3: Test Email Feature**

7. **Navigate to booking:**
   - Tap "Discover" tab
   - Find any mentor (e.g., "Dr. Sarah Johnson")
   - Tap "Book Session" button

8. **Fill booking form:**
   - Select a date (e.g., "Jul 21")
   - Select a time (e.g., "2:00 PM")
   - Add optional note
   - Tap "Request Session"

9. **🎉 Email Magic Happens:**
   - Session confirmation screen appears
   - Video call link is generated
   - **Your phone's email app opens automatically!**
   - Email is pre-filled with beautiful content

10. **In the email app you'll see:**
    ```
    To: mentor@example.com, mentee@example.com
    Subject: Session Confirmed: Dr. Sarah Johnson - Jul 21 at 2:00 PM
    
    [Beautiful HTML email with session details and meeting link]
    ```

11. **Test sending:**
    - Change email addresses to your real emails
    - Tap "Send" to test actual email delivery
    - Check your inbox for the professional email!

---

## 📧 **What You'll See in the Email App:**

### **Email Content:**
- 🎉 Professional header with "Session Confirmed!"
- 📅 Complete session details
- 🎥 Video meeting room information
- 🔗 Clickable meeting link
- 📋 Instructions for joining the call
- 💼 Professional branding and styling

### **Email Features:**
- **HTML formatting** preserved on most email apps
- **Clickable meeting links** that open directly
- **Mobile-responsive design** that looks great on phones
- **Professional styling** with colors and icons

---

## 🔧 **Troubleshooting:**

### **If Email Doesn't Open:**
1. **Check email app:** Make sure you have Gmail, Apple Mail, or another email app installed
2. **Configure email:** Ensure your email app is set up with an account
3. **Check permissions:** Allow Expo Go to access other apps
4. **Try different email app:** Install Gmail if you don't have one

### **If App Won't Load:**
1. **Same WiFi:** Ensure phone and computer are on same network
2. **Firewall:** Check if Windows firewall is blocking Expo
3. **Port issues:** Try `npx expo start --tunnel` for different connection
4. **Restart:** Close Expo Go and rescan QR code

### **If Booking Doesn't Work:**
1. **Check console:** Look for error messages in terminal
2. **Reload app:** Shake phone and tap "Reload"
3. **Clear cache:** In Expo Go, shake and tap "Clear cache"

---

## 🎬 **Expected Demo Flow:**

```
📱 Phone Screen: Mentor-Mentee Portal loads
👆 Tap: Discover → Find Mentor → Book Session
📝 Fill: Date, Time, Optional Note
🚀 Tap: "Request Session"
⚡ Magic: Success screen appears with session details
📧 Automatic: Email app opens with pre-filled professional email
✉️ Ready: Change emails to real addresses and send!
```

---

## 📸 **Screenshots You'll See:**

1. **Booking Screen:** Date/time selection with professional UI
2. **Success Screen:** 
   - ✅ "Session Confirmed!" with checkmark
   - 📋 Session details card
   - 🎥 Video call section with meeting link
   - 📧 Email status showing "Email sent!"
   - 👀 "Preview Email" and "Send Again" buttons

3. **Email App:**
   - Professional email with HTML formatting
   - Session details beautifully laid out
   - Meeting link ready to copy/click
   - Instructions for video call

---

## 🚀 **Advanced Testing:**

### **Test Different Scenarios:**
1. **Free sessions** (fee: $0)
2. **Paid sessions** (fee: $50)
3. **Different mentors** (various names/topics)
4. **Long topics** (see how email handles overflow)

### **Test Email Features:**
1. **Preview Email:** Tap the eye icon to see email preview
2. **Send Again:** Test the resend functionality
3. **Copy Meeting Link:** Copy the video call URL
4. **Different Email Apps:** Try Gmail, Outlook, Apple Mail

### **Real Email Test:**
1. Use your real email addresses
2. Send the email to yourself
3. Check how it looks in different email clients
4. Test the meeting link clicks

---

## 💡 **Pro Tips:**

- **Development Emails:** The default emails are mentor@example.com and mentee@example.com
- **Change Recipients:** Edit the emails in the code for real testing
- **Multiple Devices:** Test on both iOS and Android if available
- **Email Clients:** Different apps may render HTML slightly differently
- **Meeting Links:** The Jitsi links are real and functional!

---

## 🎯 **Success Indicators:**

✅ **App loads on phone**  
✅ **Booking flow works smoothly**  
✅ **Success screen appears**  
✅ **Email app opens automatically**  
✅ **Email is pre-filled with content**  
✅ **Meeting link is clickable**  
✅ **Professional formatting preserved**  

When you see all these working, the email feature is ready for production! 🚀
