import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useLanguage } from '../../context/LanguageContext';

export default function ManageUsers() {
  const { t } = useLanguage();
  const [searchQuery, setSearchQuery] = useState('');
  const [users, setUsers] = useState([
    {
      id: 1,
      name: 'John Doe',
      email: 'john@example.com',
      type: 'mentor',
      status: 'active',
      registeredDate: '2025-06-15',
    },
    {
      id: 2,
      name: 'Alice Smith',
      email: 'alice@example.com',
      type: 'mentee',
      status: 'active',
      registeredDate: '2025-06-20',
    },
    {
      id: 3,
      name: 'Bob Wilson',
      email: 'bob@example.com',
      type: 'mentor',
      status: 'inactive',
      registeredDate: '2025-06-18',
    },
  ]);

  const handleStatusChange = (userId, newStatus) => {
    setUsers(prevUsers =>
      prevUsers.map(user =>
        user.id === userId
          ? { ...user, status: newStatus }
          : user
      )
    );
  };

  const filteredUsers = users.filter(user =>
    user.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    user.email.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <View style={styles.container}>
      <View style={styles.searchContainer}>
        <Ionicons name="search" size={20} color="#666" style={styles.searchIcon} />
        <TextInput
          style={styles.searchInput}
          placeholder="Search users..."
          value={searchQuery}
          onChangeText={setSearchQuery}
        />
      </View>

      <ScrollView style={styles.userList}>
        {filteredUsers.map((user) => (
          <View key={user.id} style={styles.userCard}>
            <View style={styles.userHeader}>
              <View style={styles.userInfo}>
                <Text style={styles.userName}>{user.name}</Text>
                <Text style={styles.userEmail}>{user.email}</Text>
              </View>
              <View style={styles.userMeta}>
                <View style={[
                  styles.typeBadge,
                  user.type === 'mentor' ? styles.mentorBadge : styles.menteeBadge
                ]}>
                  <Text style={styles.typeBadgeText}>{user.type}</Text>
                </View>
                <View style={[
                  styles.statusBadge,
                  user.status === 'active' ? styles.activeBadge : styles.inactiveBadge
                ]}>
                  <Text style={styles.statusBadgeText}>{user.status}</Text>
                </View>
              </View>
            </View>

            <Text style={styles.registeredDate}>
              Registered: {user.registeredDate}
            </Text>

            <View style={styles.actionButtons}>
              <TouchableOpacity 
                style={[styles.actionButton, styles.editButton]}
                onPress={() => {/* Navigate to edit user */}}
              >
                <Ionicons name="create-outline" size={20} color="white" />
                <Text style={styles.actionButtonText}>Edit</Text>
              </TouchableOpacity>
              
              <TouchableOpacity 
                style={[
                  styles.actionButton,
                  user.status === 'active' ? styles.deactivateButton : styles.activateButton
                ]}
                onPress={() => handleStatusChange(
                  user.id,
                  user.status === 'active' ? 'inactive' : 'active'
                )}
              >
                <Ionicons 
                  name={user.status === 'active' ? "close-circle-outline" : "checkmark-circle-outline"}
                  size={20}
                  color="white"
                />
                <Text style={styles.actionButtonText}>
                  {user.status === 'active' ? 'Deactivate' : 'Activate'}
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        ))}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'white',
    margin: 20,
    paddingHorizontal: 15,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  searchIcon: {
    marginRight: 10,
  },
  searchInput: {
    flex: 1,
    paddingVertical: 12,
    fontSize: 16,
  },
  userList: {
    paddingHorizontal: 20,
  },
  userCard: {
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
  userHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  userInfo: {
    flex: 1,
  },
  userName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
  },
  userEmail: {
    fontSize: 14,
    color: '#666',
    marginTop: 2,
  },
  userMeta: {
    alignItems: 'flex-end',
  },
  typeBadge: {
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 12,
    marginBottom: 5,
  },
  mentorBadge: {
    backgroundColor: '#E3E8FF',
  },
  menteeBadge: {
    backgroundColor: '#FFE3E8',
  },
  typeBadgeText: {
    fontSize: 12,
    fontWeight: '600',
    textTransform: 'capitalize',
  },
  statusBadge: {
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 12,
  },
  activeBadge: {
    backgroundColor: '#4CAF50',
  },
  inactiveBadge: {
    backgroundColor: '#F44336',
  },
  statusBadgeText: {
    color: 'white',
    fontSize: 12,
    fontWeight: '600',
    textTransform: 'capitalize',
  },
  registeredDate: {
    fontSize: 14,
    color: '#666',
  },
  actionButtons: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    marginTop: 15,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 15,
    paddingVertical: 8,
    borderRadius: 8,
    marginLeft: 10,
  },
  editButton: {
    backgroundColor: '#667eea',
  },
  deactivateButton: {
    backgroundColor: '#F44336',
  },
  activateButton: {
    backgroundColor: '#4CAF50',
  },
  actionButtonText: {
    color: 'white',
    fontSize: 14,
    fontWeight: '600',
    marginLeft: 5,
  },
});
