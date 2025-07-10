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
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';

export default function ProfileScreen() {
  const { user, userType, logout } = useAuth();
  const { t } = useLanguage();
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);
  const [availableForMentoring, setAvailableForMentoring] = useState(true);

  const handleLogout = () => {
    Alert.alert(
      t('logout'),
      t('logoutConfirm'),
      [
        { text: t('cancel'), style: 'cancel' },
        { text: t('logout'), style: 'destructive', onPress: logout },
      ]
    );
  };

  const profileStats = [
    { label: t('connections'), value: '24', icon: 'people' },
    { label: t('sessions'), value: '156', icon: 'time' },
    { label: t('rating'), value: '4.8', icon: 'star' },
  ];

  const menuItems = [
    { id: 1, title: t('editProfile'), icon: 'person-outline', action: () => {} },
    { id: 2, title: t('mySkills'), icon: 'bulb-outline', action: () => {} },
    { id: 3, title: t('availability'), icon: 'calendar-outline', action: () => {} },
    { id: 4, title: t('paymentBilling'), icon: 'card-outline', action: () => {} },
    { id: 5, title: t('helpSupport'), icon: 'help-circle-outline', action: () => {} },
    { id: 6, title: t('settings'), icon: 'settings-outline', action: () => {} },
  ];

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
          {menuItems.map((item) => (
            <TouchableOpacity
              key={item.id}
              style={styles.menuItem}
              onPress={item.action}
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
          <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
            <Ionicons name="log-out-outline" size={24} color="#FF6B6B" />
            <Text style={styles.logoutText}>{t('logout')}</Text>
          </TouchableOpacity>
        </View>

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
    paddingVertical: 15,
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
});
