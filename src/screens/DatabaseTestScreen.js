import React, { useState, useEffect } from 'react';
import { View, Text, Button, ScrollView, StyleSheet, Alert } from 'react-native';
import Constants from 'expo-constants';

export default function DatabaseTestScreen() {
  const [users, setUsers] = useState([]);
  const [profiles, setProfiles] = useState([]);
  const [isConnected, setIsConnected] = useState(false);
  const API_URL = 'http://localhost:3000';

  const testConnection = async () => {
    try {
      const response = await fetch(`${API_URL}/api/test`);
      const data = await response.json();
      setIsConnected(true);
      Alert.alert('Success', 'Connected to database successfully!');
      console.log('Connection test result:', data);
    } catch (error) {
      setIsConnected(false);
      Alert.alert('Error', 'Failed to connect to database: ' + error.message);
      console.error('Connection test error:', error);
    }
  };

  const createTestData = async () => {
    try {
      // Create test users
      const mentorResponse = await fetch(`${API_URL}/api/users`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: 'mentor@test.com',
          password: 'test123',
          role: 'mentor'
        })
      });
      const mentor = await mentorResponse.json();

      const menteeResponse = await fetch(`${API_URL}/api/users`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: 'mentee@test.com',
          password: 'test123',
          role: 'mentee'
        })
      });
      const mentee = await menteeResponse.json();

      // Create test profiles
      await fetch(`${API_URL}/api/profiles`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId: mentor.id,
          fullName: 'John Mentor',
          bio: 'Experienced developer',
          skills: 'JavaScript,React Native,Node.js',
          interests: 'Mobile Development,Teaching',
          experienceLevel: 'senior'
        })
      });

      await fetch(`${API_URL}/api/profiles`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId: mentee.id,
          fullName: 'Jane Mentee',
          bio: 'Aspiring developer',
          skills: 'HTML,CSS',
          interests: 'Web Development,Mobile Apps',
          experienceLevel: 'junior'
        })
      });

      // Refresh data
      fetchData();
    } catch (error) {
      console.error('Error creating test data:', error);
    }
  };

  const fetchData = async () => {
    try {
      // Fetch all users
      const usersResponse = await fetch(`${API_URL}/api/users`);
      const usersData = await usersResponse.json();
      setUsers(usersData);

      // Fetch profiles for each user
      const profilesData = await Promise.all(
        usersData.map(user => 
          fetch(`${API_URL}/api/profiles/${user.id}`)
            .then(res => res.json())
        )
      );
      setProfiles(profilesData.filter(Boolean));
    } catch (error) {
      console.error('Error fetching data:', error);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  return (
    <ScrollView style={styles.container}>
      <Button 
        title="Test Database Connection" 
        onPress={testConnection}
        color={isConnected ? "green" : "blue"}
      />
      <View style={styles.spacer} />
      <Button title="Create Test Data" onPress={createTestData} />
      <View style={styles.spacer} />
      <Button title="Refresh Data" onPress={fetchData} />

      <View style={styles.section}>
        <Text style={styles.heading}>Users in Database:</Text>
        {users.map(user => (
          <View key={user.id} style={styles.item}>
            <Text>ID: {user.id}</Text>
            <Text>Email: {user.email}</Text>
            <Text>Role: {user.role}</Text>
          </View>
        ))}
      </View>

      <View style={styles.section}>
        <Text style={styles.heading}>Profiles in Database:</Text>
        {profiles.map(profile => (
          <View key={profile.id} style={styles.item}>
            <Text>ID: {profile.id}</Text>
            <Text>User ID: {profile.user_id}</Text>
            <Text>Name: {profile.full_name}</Text>
            <Text>Bio: {profile.bio}</Text>
            <Text>Skills: {profile.skills}</Text>
          </View>
        ))}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
  },
  spacer: {
    height: 10,
  },
  section: {
    marginVertical: 16,
  },
  heading: {
    fontSize: 18,
    fontWeight: 'bold',
    marginVertical: 8,
  },
  item: {
    padding: 12,
    borderRadius: 8,
    backgroundColor: '#f0f0f0',
    marginVertical: 4,
  },
});
