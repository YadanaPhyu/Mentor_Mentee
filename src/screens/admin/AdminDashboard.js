import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Switch,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useLanguage } from '../../context/LanguageContext';
import { useAuth } from '../../context/AuthContext';

export default function AdminDashboard({ navigation }) {
  const { t } = useLanguage();
  const { logout } = useAuth();

  const confirmLogout = () => {
    Alert.alert(
      'Confirm Logout',
      'Are you sure you want to logout?',
      [
        {
          text: 'Cancel',
          onPress: () => console.log('Cancel Pressed'),
          style: 'cancel',
        },
        {
          text: 'Logout',
          onPress: () => {
            console.log('Logout Pressed');
            logout();
          },
          style: 'destructive',
        },
      ],
      { cancelable: true }
    );
  };
  const [pendingMentors, setPendingMentors] = useState([
    { 
      id: 1, 
      name: 'John Doe', 
      email: 'john@example.com',
      skills: ['React Native', 'JavaScript'],
      experience: '5 years',
      status: 'pending'
    },
    { 
      id: 2, 
      name: 'Jane Smith', 
      email: 'jane@example.com',
      skills: ['UI/UX', 'Mobile Design'],
      experience: '3 years',
      status: 'pending'
    },
  ]);

  const handleMentorApproval = (id, action) => {
    setPendingMentors(prevMentors =>
      prevMentors.map(mentor =>
        mentor.id === id
          ? { ...mentor, status: action }
          : mentor
      )
    );
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Admin Dashboard</Text>
        
        <View style={styles.statsContainer}>
          <View style={styles.statItem}>
            <Text style={styles.statValue}>24</Text>
            <Text style={styles.statLabel}>Total Users</Text>
          </View>
          <View style={styles.statItem}>
            <Text style={styles.statValue}>15</Text>
            <Text style={styles.statLabel}>Active Mentors</Text>
          </View>
          <View style={styles.statItem}>
            <Text style={styles.statValue}>42</Text>
            <Text style={styles.statLabel}>Active Sessions</Text>
          </View>
        </View>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Pending Mentor Approvals</Text>
        {pendingMentors.map((mentor) => (
          <View key={mentor.id} style={styles.mentorCard}>
            <View style={styles.mentorHeader}>
              <View style={styles.mentorInfo}>
                <Text style={styles.mentorName}>{mentor.name}</Text>
                <Text style={styles.mentorEmail}>{mentor.email}</Text>
              </View>
              <View style={[styles.statusBadge, 
                mentor.status === 'approved' && styles.statusApproved,
                mentor.status === 'rejected' && styles.statusRejected
              ]}>
                <Text style={styles.statusText}>{mentor.status}</Text>
              </View>
            </View>

            <View style={styles.skillsContainer}>
              {mentor.skills.map((skill, index) => (
                <View key={index} style={styles.skillBadge}>
                  <Text style={styles.skillText}>{skill}</Text>
                </View>
              ))}
            </View>

            <Text style={styles.experienceText}>Experience: {mentor.experience}</Text>

            <View style={styles.actionButtons}>
              <TouchableOpacity 
                style={[styles.actionButton, styles.approveButton]}
                onPress={() => handleMentorApproval(mentor.id, 'approved')}
              >
                <Text style={styles.actionButtonText}>Approve</Text>
              </TouchableOpacity>
              <TouchableOpacity 
                style={[styles.actionButton, styles.rejectButton]}
                onPress={() => handleMentorApproval(mentor.id, 'rejected')}
              >
                <Text style={styles.actionButtonText}>Reject</Text>
              </TouchableOpacity>
            </View>
          </View>
        ))}
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Quick Actions</Text>
        <TouchableOpacity 
          style={styles.menuItem}
          onPress={() => navigation.navigate('ManageUsers')}
        >
          <View style={styles.menuLeft}>
            <Ionicons name="people-outline" size={24} color="#667eea" />
            <Text style={styles.menuText}>Manage Users</Text>
          </View>
          <Ionicons name="chevron-forward" size={20} color="#ccc" />
        </TouchableOpacity>

        <TouchableOpacity style={styles.menuItem}>
          <View style={styles.menuLeft}>
            <Ionicons name="stats-chart-outline" size={24} color="#667eea" />
            <Text style={styles.menuText}>View Analytics</Text>
          </View>
          <Ionicons name="chevron-forward" size={20} color="#ccc" />
        </TouchableOpacity>

        <TouchableOpacity style={styles.menuItem}>
          <View style={styles.menuLeft}>
            <Ionicons name="warning-outline" size={24} color="#667eea" />
            <Text style={styles.menuText}>Reported Issues</Text>
          </View>
          <Ionicons name="chevron-forward" size={20} color="#ccc" />
        </TouchableOpacity>
      </View>

      <View style={[styles.section, styles.logoutSection]}>
        <TouchableOpacity 
          onPress={confirmLogout}
          style={styles.logoutButton}
          accessibilityLabel="Logout button"
          accessibilityRole="button"
          testID="logout-button"
        >
          <Ionicons name="log-out-outline" size={24} color="white" />
          <Text style={styles.logoutText}>{t('logout')}</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
    padding: 20,
  },
  section: {
    marginBottom: 30,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 15,
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    backgroundColor: 'white',
    padding: 20,
    borderRadius: 12,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  statItem: {
    alignItems: 'center',
  },
  statValue: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#667eea',
  },
  statLabel: {
    fontSize: 14,
    color: '#666',
    marginTop: 5,
  },
  mentorCard: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 15,
    marginBottom: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  mentorHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 10,
  },
  mentorInfo: {
    flex: 1,
  },
  mentorName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
  },
  mentorEmail: {
    fontSize: 14,
    color: '#666',
    marginTop: 2,
  },
  statusBadge: {
    backgroundColor: '#FFB74D',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 12,
  },
  statusApproved: {
    backgroundColor: '#4CAF50',
  },
  statusRejected: {
    backgroundColor: '#F44336',
  },
  statusText: {
    color: 'white',
    fontSize: 12,
    fontWeight: '600',
    textTransform: 'capitalize',
  },
  skillsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginTop: 10,
  },
  skillBadge: {
    backgroundColor: '#E3E8FF',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 12,
    marginRight: 8,
    marginBottom: 8,
  },
  skillText: {
    color: '#667eea',
    fontSize: 12,
  },
  experienceText: {
    fontSize: 14,
    color: '#666',
    marginTop: 10,
  },
  actionButtons: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    marginTop: 15,
  },
  actionButton: {
    paddingHorizontal: 20,
    paddingVertical: 8,
    borderRadius: 8,
    marginLeft: 10,
  },
  approveButton: {
    backgroundColor: '#4CAF50',
  },
  rejectButton: {
    backgroundColor: '#F44336',
  },
  actionButtonText: {
    color: 'white',
    fontSize: 14,
    fontWeight: '600',
  },
  menuItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: 'white',
    padding: 15,
    borderRadius: 12,
    marginBottom: 10,
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
    backgroundColor: '#FF6B6B',
    padding: 15,
    borderRadius: 8,
    marginVertical: 10,
  },
  logoutText: {
    fontSize: 16,
    color: 'white',
    marginLeft: 15,
    fontWeight: '600',
  },
});
