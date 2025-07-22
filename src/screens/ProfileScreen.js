import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  TouchableOpacity,
  Image,
  Switch,
  Alert,
  Modal,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import { useNavigation } from '@react-navigation/native';

export default function ProfileScreen() {
  const { user, userType, logout } = useAuth();
  const { t } = useLanguage();
  const navigation = useNavigation();
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);
  const [availableForMentoring, setAvailableForMentoring] = useState(true);
  const [showLogoutModal, setShowLogoutModal] = useState(false);

  const profileStats = [
    { label: t('connections'), value: '24', icon: 'people' },
    { label: t('sessions'), value: '156', icon: 'time' },
    { label: t('rating'), value: '4.8', icon: 'star' },
  ];

  const getMenuItems = () => {
    const commonItems = [
      { id: 1, title: t('editProfile'), icon: 'person-outline', action: () => {} },
      { id: 4, title: t('paymentBilling'), icon: 'card-outline', action: () => {} },
      { id: 5, title: t('helpSupport'), icon: 'help-circle-outline', action: () => {} },
      { id: 6, title: t('settings'), icon: 'settings-outline', action: () => {} },
    ];

    const mentorOnlyItems = [
      { id: 2, title: t('mySkills'), icon: 'bulb-outline', action: () => {} },
      { id: 3, title: t('availability'), icon: 'calendar-outline', action: () => {} },
    ];

    return userType === 'mentor' ? [...commonItems, ...mentorOnlyItems] : commonItems;
  };

  // Handle logout function
  const handleLogout = async () => {
    console.log('handleLogout called');
    try {
      const success = await logout();
      console.log('Logout result:', success);
      
      if (success) {
        console.log('Logout successful, user state cleared');
        // The AppNavigator will automatically navigate to Auth when user is null
      } else {
        console.log('Logout failed');
        Alert.alert('Error', 'Failed to logout. Please try again.');
      }
    } catch (error) {
      console.error('Logout error:', error);
      Alert.alert('Error', 'Failed to logout. Please try again.');
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView style={styles.content}>
        <LinearGradient
          colors={['#667eea', '#764ba2']}
          style={styles.header}
        >
          <View style={styles.profileSection}>
            <Image
              source={{ uri: 'https://via.placeholder.com/100x100' }}
              style={styles.profileImage}
            />
            <Text style={styles.profileName}>{user?.name || 'User Name'}</Text>
            <Text style={styles.profileTitle}>
              {userType === 'mentor' ? t('mentor') : t('mentee')}
            </Text>
            <Text style={styles.profileEmail}>{user?.email}</Text>
          </View>

          <View style={styles.statsContainer}>
            {profileStats.map((stat, index) => (
              <View key={index} style={styles.statItem}>
                <Ionicons name={stat.icon} size={24} color="white" />
                <Text style={styles.statValue}>{stat.value}</Text>
                <Text style={styles.statLabel}>{stat.label}</Text>
              </View>
            ))}
          </View>
        </LinearGradient>

        <View style={styles.settingsSection}>
          <Text style={styles.sectionTitle}>{t('quickSettings')}</Text>
          
          <View style={styles.settingItem}>
            <View style={styles.settingLeft}>
              <Ionicons name="notifications-outline" size={24} color="#667eea" />
              <Text style={styles.settingText}>{t('pushNotifications')}</Text>
            </View>
            <Switch
              accessibilityLabel="Push Notifications Toggle"
              testID="push-notifications-switch"
              value={notificationsEnabled}
              onValueChange={setNotificationsEnabled}
              trackColor={{ false: '#767577', true: '#667eea' }}
              thumbColor={notificationsEnabled ? '#fff' : '#f4f3f4'}
            />
          </View>

          {userType === 'mentor' && (
            <View style={styles.settingItem}>
              <View style={styles.settingLeft}>
                <Ionicons name="checkmark-circle-outline" size={24} color="#667eea" />
                <Text style={styles.settingText}>{t('availableForMentoring')}</Text>
              </View>
              <Switch
                accessibilityLabel="Available for Mentoring Toggle"
                testID="mentoring-availability-switch"
                value={availableForMentoring}
                onValueChange={setAvailableForMentoring}
                trackColor={{ false: '#767577', true: '#667eea' }}
                thumbColor={availableForMentoring ? '#fff' : '#f4f3f4'}
              />
            </View>
          )}
        </View>

        <View style={styles.menuSection}>
          <Text style={styles.sectionTitle}>{t('account')}</Text>
          {getMenuItems().map((item) => (
            <TouchableOpacity
              key={item.id}
              style={styles.menuItem}
              onPress={item.action}
              accessibilityLabel={item.title}
              testID={`menu-item-${item.id}`}
            >
              <View style={styles.menuLeft}>
                <Ionicons name={item.icon} size={24} color="#667eea" />
                <Text style={styles.menuText}>{item.title}</Text>
              </View>
              <Ionicons name="chevron-forward" size={20} color="#ccc" />
            </TouchableOpacity>
          ))}
        </View>

        <View style={styles.logoutSection}>
          <TouchableOpacity 
            onPress={() => {
              console.log('Logout button pressed!');
              setShowLogoutModal(true);
            }}
            style={[
              styles.logoutButton,
              { backgroundColor: '#FF6B6B' }
            ]}
            accessibilityLabel="Logout button"
            accessibilityRole="button"
            testID="logout-button"
          >
            <Ionicons name="log-out-outline" size={24} color="white" />
            <Text style={[styles.logoutText, { color: 'white' }]}>Logout</Text>
          </TouchableOpacity>
        </View>

        {/* Custom Logout Modal */}
        <Modal
          visible={showLogoutModal}
          transparent={true}
          animationType="fade"
          onRequestClose={() => setShowLogoutModal(false)}
        >
          <View style={styles.modalOverlay}>
            <View style={styles.modalContent}>
              <Text style={styles.modalTitle}>Confirm Logout</Text>
              <Text style={styles.modalMessage}>Are you sure you want to log out?</Text>
              
              <View style={styles.modalButtons}>
                <TouchableOpacity
                  style={[styles.modalButton, styles.cancelButton]}
                  onPress={() => {
                    console.log('Modal logout cancelled');
                    setShowLogoutModal(false);
                  }}
                >
                  <Text style={styles.cancelButtonText}>Cancel</Text>
                </TouchableOpacity>
                
                <TouchableOpacity
                  style={[styles.modalButton, styles.logoutButtonModal]}
                  onPress={() => {
                    console.log('Modal logout confirmed');
                    setShowLogoutModal(false);
                    handleLogout();
                  }}
                >
                  <Text style={styles.logoutButtonModalText}>Log Out</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </Modal>

        <View style={styles.footer}>
          <Text style={styles.footerText}>{t('appVersion')}</Text>
          <Text style={styles.footerSubtext}>
            {t('appDescription')}
          </Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  content: {
    flex: 1,
  },
  header: {
    paddingTop: 20,
    paddingBottom: 30,
    paddingHorizontal: 20,
    alignItems: 'center',
  },
  profileSection: {
    alignItems: 'center',
    marginBottom: 30,
  },
  profileImage: {
    width: 100,
    height: 100,
    borderRadius: 50,
    marginBottom: 15,
    borderWidth: 3,
    borderColor: 'white',
  },
  profileName: {
    fontSize: 24,
    fontWeight: 'bold',
    color: 'white',
    marginBottom: 5,
  },
  profileTitle: {
    fontSize: 16,
    color: 'white',
    opacity: 0.9,
    marginBottom: 5,
  },
  profileEmail: {
    fontSize: 14,
    color: 'white',
    opacity: 0.8,
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    width: '100%',
  },
  statItem: {
    alignItems: 'center',
  },
  statValue: {
    fontSize: 20,
    fontWeight: 'bold',
    color: 'white',
    marginTop: 5,
  },
  statLabel: {
    fontSize: 12,
    color: 'white',
    opacity: 0.8,
    marginTop: 2,
  },
  settingsSection: {
    backgroundColor: 'white',
    marginTop: 20,
    paddingHorizontal: 20,
    paddingVertical: 15,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 15,
  },
  settingItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  settingLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  settingText: {
    fontSize: 16,
    color: '#333',
    marginLeft: 15,
  },
  menuSection: {
    backgroundColor: 'white',
    marginTop: 20,
    paddingHorizontal: 20,
    paddingVertical: 15,
  },
  menuItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  menuLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  menuText: {
    fontSize: 16,
    color: '#333',
    marginLeft: 15,
  },
  logoutSection: {
    backgroundColor: 'white',
    marginTop: 20,
    paddingHorizontal: 20,
    paddingVertical: 15,
  },
  logoutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FFE5E5',
    padding: 15,
    borderRadius: 8,
    marginVertical: 10,
  },
  logoutText: {
    fontSize: 16,
    color: '#FF6B6B',
    marginLeft: 15,
    fontWeight: '600',
  },
  footer: {
    alignItems: 'center',
    paddingVertical: 30,
  },
  footerText: {
    fontSize: 14,
    color: '#666',
    marginBottom: 5,
  },
  footerSubtext: {
    fontSize: 12,
    color: '#999',
    textAlign: 'center',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 20,
    margin: 20,
    minWidth: 280,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 10,
    textAlign: 'center',
  },
  modalMessage: {
    fontSize: 16,
    color: '#666',
    marginBottom: 20,
    textAlign: 'center',
  },
  modalButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  modalButton: {
    flex: 1,
    padding: 12,
    borderRadius: 8,
    marginHorizontal: 5,
    alignItems: 'center',
  },
  cancelButton: {
    backgroundColor: '#f8f9fa',
    borderWidth: 1,
    borderColor: '#dee2e6',
  },
  cancelButtonText: {
    color: '#6c757d',
    fontSize: 16,
    fontWeight: '600',
  },
  logoutButtonModal: {
    backgroundColor: '#FF6B6B',
  },
  logoutButtonModalText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
});
