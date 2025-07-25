import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Alert,
  ScrollView,
} from 'react-native';
import { useDatabase } from '../context/DatabaseContext';

const TestUsersSetup = () => {
  const [isLoading, setIsLoading] = useState(false);
  const { insert, findWhere, isReady } = useDatabase();

  // Simple password hashing (same as AuthContext)
  const hashPassword = (password) => {
    return btoa(password + 'salt123');
  };

  const sampleUsers = [
    {
      email: 'admin@example.com',
      password: 'admin123',
      name: 'Admin User',
      user_type: 'admin',
      phone: '+1234567890',
      bio: 'System administrator',
      location: 'New York, NY',
    },
    {
      email: 'mentor@example.com',
      password: 'mentor123',
      name: 'Jane Mentor',
      user_type: 'mentor',
      phone: '+1234567891',
      bio: 'Senior Software Engineer with 10+ years experience',
      location: 'San Francisco, CA',
    },
    {
      email: 'mentee@example.com',
      password: 'mentee123',
      name: 'John Mentee',
      user_type: 'mentee',
      phone: '+1234567892',
      bio: 'Computer Science student looking to learn',
      location: 'Austin, TX',
    },
  ];

  const createTestUsers = async () => {
    if (!isReady) {
      Alert.alert('Error', 'Database not ready');
      return;
    }

    setIsLoading(true);
    let createdCount = 0;
    let skippedCount = 0;

    try {
      for (const userData of sampleUsers) {
        // Check if user already exists
        const existingUsers = await findWhere('users', { email: userData.email });
        
        if (existingUsers.length > 0) {
          console.log(`⏭️  Skipping ${userData.email} - already exists`);
          skippedCount++;
          continue;
        }

        // Create user
        const newUser = {
          email: userData.email.toLowerCase(),
          password_hash: hashPassword(userData.password),
          name: userData.name,
          user_type: userData.user_type,
          phone: userData.phone,
          bio: userData.bio,
          location: userData.location,
          status: 'active',
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        };

        await insert('users', newUser);
        console.log(`✅ Created user: ${userData.email}`);
        createdCount++;
      }

      Alert.alert(
        'Success', 
        `Created ${createdCount} users, skipped ${skippedCount} existing users.\n\nYou can now login with:\n• mentor@example.com / mentor123\n• mentee@example.com / mentee123`
      );

    } catch (error) {
      console.error('❌ Error creating test users:', error);
      Alert.alert('Error', `Failed to create users: ${error.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  const clearAllUsers = async () => {
    Alert.alert(
      'Confirm Clear',
      'Are you sure you want to delete ALL users? This cannot be undone.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete All',
          style: 'destructive',
          onPress: async () => {
            try {
              // In a real implementation, you'd use a delete method
              console.log('⚠️ Clear users functionality would be implemented here');
              Alert.alert('Info', 'Clear function not implemented in demo');
            } catch (error) {
              Alert.alert('Error', error.message);
            }
          },
        },
      ]
    );
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.content}>
        <Text style={styles.title}>🧪 Test Users Setup</Text>
        <Text style={styles.description}>
          Create sample users for testing the authentication system
        </Text>

        <View style={styles.usersList}>
          <Text style={styles.sectionTitle}>Sample Users:</Text>
          {sampleUsers.map((user, index) => (
            <View key={index} style={styles.userItem}>
              <Text style={styles.userName}>{user.name}</Text>
              <Text style={styles.userDetails}>
                📧 {user.email} | 🔒 {user.password}
              </Text>
              <Text style={styles.userType}>{user.user_type.toUpperCase()}</Text>
            </View>
          ))}
        </View>

        <TouchableOpacity
          style={[styles.button, styles.createButton]}
          onPress={createTestUsers}
          disabled={isLoading || !isReady}
        >
          <Text style={styles.buttonText}>
            {isLoading ? 'Creating...' : '➕ Create Test Users'}
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.button, styles.clearButton]}
          onPress={clearAllUsers}
          disabled={isLoading || !isReady}
        >
          <Text style={styles.buttonText}>🗑️ Clear All Users</Text>
        </TouchableOpacity>

        <View style={styles.instructions}>
          <Text style={styles.instructionsTitle}>Instructions:</Text>
          <Text style={styles.instructionsText}>
            1. Tap "Create Test Users" to add sample users{'\n'}
            2. Go back to login screen{'\n'}
            3. Use any email/password combo above{'\n'}
            4. Example: mentor@example.com / mentor123
          </Text>
        </View>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  content: {
    padding: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 10,
    color: '#333',
  },
  description: {
    fontSize: 16,
    textAlign: 'center',
    color: '#666',
    marginBottom: 30,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 15,
    color: '#333',
  },
  usersList: {
    marginBottom: 30,
  },
  userItem: {
    backgroundColor: 'white',
    padding: 15,
    borderRadius: 10,
    marginBottom: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  userName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 5,
  },
  userDetails: {
    fontSize: 14,
    color: '#666',
    marginBottom: 5,
  },
  userType: {
    fontSize: 12,
    fontWeight: '600',
    color: '#667eea',
    backgroundColor: '#f0f0ff',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 4,
    alignSelf: 'flex-start',
  },
  button: {
    paddingVertical: 15,
    borderRadius: 10,
    alignItems: 'center',
    marginBottom: 15,
  },
  createButton: {
    backgroundColor: '#4CAF50',
  },
  clearButton: {
    backgroundColor: '#f44336',
  },
  buttonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  instructions: {
    backgroundColor: 'white',
    padding: 20,
    borderRadius: 10,
    marginTop: 20,
  },
  instructionsTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 10,
    color: '#333',
  },
  instructionsText: {
    fontSize: 14,
    color: '#666',
    lineHeight: 20,
  },
});

export default TestUsersSetup;
