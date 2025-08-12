import React, { createContext, useContext, useState } from 'react';

const LanguageContext = createContext();

export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
};

// Translation texts
const translations = {
  en: {
    // Auth Screen
    appTitle: 'MentorMyanmar',
    welcomeBack: 'Welcome Back!',
    createAccount: 'Create Your Account',
    fullName: 'Full Name',
    email: 'Email',
    password: 'Password',
    iAmA: 'I am a:',
    mentee: 'Mentee',
    mentor: 'Mentor',
    signIn: 'Sign In',
    signUp: 'Sign Up',
    dontHaveAccount: "Don't have an account? Sign Up",
    alreadyHaveAccount: 'Already have an account? Sign In',
    error: 'Error',
    fillAllFields: 'Please fill in all fields',
    
    // Home Screen
    welcomeBack2: 'Welcome back',
    mentorDashboard: 'Mentor Dashboard',
    menteeDashboard: 'Mentee Dashboard',
    yourStats: 'Your Stats',
    connections: 'Connections',
    messages: 'Messages',
    sessions: 'Sessions',
    recentActivity: 'Recent Activity',
    quickActions: 'Quick Actions',
    findMentees: 'Find Mentees',
    findMentors: 'Find Mentors',
    
    // Discover Screen
    discoverMentees: 'Discover Mentees',
    discoverMentors: 'Discover Mentors',
    searchByNameOrSkills: 'Search by name or skills...',
    viewProfile: 'View Profile',
    connect: 'Connect',
    noProfilesFound: 'No profiles found',
    tryAdjustingSearch: 'Try adjusting your search terms',
    verified: 'Verified',
    
    // Messages Screen
    searchConversations: 'Search conversations...',
    noConversationsFound: 'No conversations found',
    startConnecting: 'Start connecting with mentors to begin messaging',
    
    // Profile Screen
    quickSettings: 'Quick Settings',
    pushNotifications: 'Push Notifications',
    availableForMentoring: 'Available for Mentoring',
    account: 'Account',
    editProfile: 'Edit Profile',
    mySkills: 'My Skills',
    availability: 'Availability',
    paymentBilling: 'Payment & Billing',
    helpSupport: 'Help & Support',
    settings: 'Settings',
    logout: 'Logout',
    logoutConfirm: 'Are you sure you want to logout?',
    cancel: 'Cancel',
    appVersion: 'MentorMyanmar v1.0.0',
    appDescription: 'Connecting mentors and mentees across Myanmar',
    
    // Admin Dashboard
    adminDashboard: 'Admin Dashboard',
    totalUsers: 'Total Users',
    activeMentors: 'Active Mentors',
    activeSessions: 'Active Sessions',
    pendingMentorApprovals: 'Pending Mentor Approvals',
    manageUsers: 'Manage Users',
    viewAnalytics: 'View Analytics',
    reportedIssues: 'Reported Issues',
    approve: 'Approve',
    reject: 'Reject',
    searchUsers: 'Search users...',
    registeredDate: 'Registered:',
    edit: 'Edit',
    activate: 'Activate',
    deactivate: 'Deactivate',
    
    // Video Call Features
    videoCall: 'Video Call',
    videoCallDetails: 'Video Call Details',
    meetingLink: 'Meeting Link',
    meetingId: 'Meeting ID',
    createdAt: 'Created at',
    joinCall: 'Join Call',
    joinNow: 'Join Now',
    startingSoon: 'Starting Soon',
    startSession: 'Start Session',
    upcomingSessions: 'Upcoming Sessions',
    sessionDetails: 'Session Details',
    reschedule: 'Reschedule',
    messageNow: 'Message Now',
    cancelSession: 'Cancel Session',
    mentorInfo: 'Mentor Information',
    topic: 'Topic',
    objectives: 'Objectives',
    notes: 'Notes',
    minutes: 'minutes',
    paymentNote: 'Payment Information',
    selectDate: 'Select Date',
    selectTime: 'Select Time',
    pendingRequests: 'Pending Requests',
    accept: 'Accept',
    decline: 'Decline',
    manageAvailability: 'Manage Availability',
    mentorSettings: 'Mentor Settings',
    
    // Common
    rating: 'Rating',
    location: 'Location',
    online: 'Online',
    offline: 'Offline',
  },
  my: {
    // Auth Screen
    appTitle: 'MentorMyanmar',
    welcomeBack: 'ပြန်လာတာကြိုဆိုပါတယ်!',
    createAccount: 'အကောင့်အသစ်ဖွင့်ရန်',
    fullName: 'အမည်အပြည့်အစုံ',
    email: 'အီးမေးလ်',
    password: 'စကားဝှက်',
    iAmA: 'ကျွန်ုပ်သည်:',
    mentee: 'ကျောင်းသား/သူ',
    mentor: 'ဆရာ/ဆရာမ',
    signIn: 'ဝင်ရောက်ရန်',
    signUp: 'စာရင်းသွင်းရန်',
    dontHaveAccount: "အကောင့်မရှိသေးဘူးလား? စာရင်းသွင်းရန်",
    alreadyHaveAccount: 'အကောင့်ရှိပြီးလား? ဝင်ရောက်ရန်',
    error: 'အမှား',
    fillAllFields: 'အချက်လက်များအားလုံးဖြည့်ပါ',
    
    // Home Screen
    welcomeBack2: 'ပြန်လာတာကြိုဆိုပါတယ်',
    mentorDashboard: 'ဆရာ/ဆရာမ ဒက်ရှ်ဘုတ်',
    menteeDashboard: 'ကျောင်းသား/သူ ဒက်ရှ်ဘုတ်',
    yourStats: 'သင့်ကိန်းဂဏန်းများ',
    connections: 'ချိတ်ဆက်မှုများ',
    messages: 'မက်ဆေ့ချ်များ',
    sessions: 'သင်ခန်းစာများ',
    recentActivity: 'လတ်တလောလှုပ်ရှားမှုများ',
    quickActions: 'မြန်ဆန်သောလုပ်ဆောင်ချက်များ',
    findMentees: 'ကျောင်းသား/သူများရှာရန်',
    findMentors: 'ဆရာ/ဆရာမများရှာရန်',
    
    // Discover Screen
    discoverMentees: 'ကျောင်းသား/သူများရှာဖွေရန်',
    discoverMentors: 'ဆရာ/ဆရာမများရှာဖွေရန်',
    searchByNameOrSkills: 'အမည် သို့မဟုတ် ကျွမ်းကျင်မှုဖြင့်ရှာရန်...',
    viewProfile: 'ပရိုဖိုင်ကြည့်ရန်',
    connect: 'ချိတ်ဆက်ရန်',
    noProfilesFound: 'ပရိုဖိုင်မတွေ့ပါ',
    tryAdjustingSearch: 'ရှာဖွေမှုကို ပြောင်းလဲကြည့်ပါ',
    verified: 'အတည်ပြုပြီး',
    
    // Messages Screen
    searchConversations: 'စကားဝိုင်းများရှာရန်...',
    noConversationsFound: 'စကားဝိုင်းမတွေ့ပါ',
    startConnecting: 'မက်ဆေ့ချ်ပို့ရန် ဆရာများနှင့် ချိတ်ဆက်ပါ',
    
    // Profile Screen
    quickSettings: 'မြန်ဆန်သော ဆက်တင်များ',
    pushNotifications: 'အကြောင်းကြားချက်များ',
    availableForMentoring: 'သင်ကြားနိုင်သည်',
    account: 'အကောင့်',
    editProfile: 'ပရိုဖိုင်တည်းဖြတ်ရန်',
    mySkills: 'ကျွန်ုပ်၏ကျွမ်းကျင်မှုများ',
    availability: 'အချိန်ရရှိနိုင်မှု',
    paymentBilling: 'ငွေပေးချေမှုနှင့် ဘီလ်',
    helpSupport: 'အကူအညီနှင့် ပံ့ပိုးမှု',
    settings: 'ဆက်တင်များ',
    logout: 'ထွက်ရန်',
    logoutConfirm: 'သင် လုံးဝထွက်လိုသလား?',
    cancel: 'မလုပ်တော့',
    appVersion: 'MentorMyanmar v1.0.0',
    appDescription: 'မြန်မာနိုင်ငံတစ်ဝှမ်းရှိ ဆရာများနှင့် ကျောင်းသားများကို ချိတ်ဆက်ပေးခြင်း',
    
    // Video Call Features
    videoCall: 'ဗီဒီယိုခေါ်ဆိုမှု',
    videoCallDetails: 'ဗီဒီယိုခေါ်ဆိုမှု အသေးစိတ်',
    meetingLink: 'တွေ့ဆုံပွဲ လင့်ခ်',
    meetingId: 'တွေ့ဆုံပွဲ ID',
    createdAt: 'ဖန်တီးသည့်အချိန်',
    joinCall: 'ခေါ်ဆိုမှုတွင် ပါဝင်ရန်',
    joinNow: 'ယခု ပါဝင်ရန်',
    startingSoon: 'မကြာခင် စတင်ပါမည်',
    startSession: 'သင်ခန်းစာ စတင်ရန်',
    upcomingSessions: 'လာမည့် သင်ခန်းစာများ',
    sessionDetails: 'သင်ခန်းစာ အသေးစိတ်',
    reschedule: 'အချိန်ပြောင်းရန်',
    messageNow: 'ယခု မက်ဆေ့ချ်ပို့ရန်',
    cancelSession: 'သင်ခန်းစာ ပယ်ဖျက်ရန်',
    mentorInfo: 'ဆရာ/ဆရာမ အချက်အလက်',
    topic: 'အကြောင်းအရာ',
    objectives: 'ရည်မှန်းချက်များ',
    notes: 'မှတ်ချက်များ',
    minutes: 'မိနစ်',
    paymentNote: 'ငွေပေးချေမှု အချက်အလက်',
    selectDate: 'ရက်စွဲရွေးပါ',
    selectTime: 'အချိန်ရွေးပါ',
    pendingRequests: 'စောင့်ဆိုင်းနေသော တောင်းဆိုမှုများ',
    accept: 'လက်ခံရန်',
    decline: 'ငြင်းပယ်ရန်',
    manageAvailability: 'အချိန်ရရှိနိုင်မှု စီမံရန်',
    mentorSettings: 'ဆရာ/ဆရာမ ဆက်တင်များ',
    
    // Common
    rating: 'အဆင့်သတ်မှတ်ချက်',
    location: 'တည်နေရာ',
    online: 'အွန်လိုင်း',
    offline: 'အော့ဖ်လိုင်း',
  },
};

export const LanguageProvider = ({ children }) => {
  const [language, setLanguage] = useState('en'); // Default to English

  const toggleLanguage = () => {
    setLanguage(prev => prev === 'en' ? 'my' : 'en');
  };

  const t = (key) => {
    return translations[language][key] || key;
  };

  const value = {
    language,
    setLanguage,
    toggleLanguage,
    t,
    isMyanmar: language === 'my',
  };

  return (
    <LanguageContext.Provider value={value}>
      {children}
    </LanguageContext.Provider>
  );
};
