import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';

export default function ProfileCard({ profile, onPress, onConnect }) {
  return (
    <View style={styles.card}>
      <View style={styles.header}>
        <Image
          source={{ uri: profile.image || 'https://via.placeholder.com/100x100' }}
          style={styles.profileImage}
        />
        <View style={styles.profileInfo}>
          <Text style={styles.name}>{profile.name}</Text>
          <Text style={styles.title}>{profile.title}</Text>
          <Text style={styles.company}>{profile.company}</Text>
          <View style={styles.locationContainer}>
            <Ionicons name="location" size={14} color="#666" />
            <Text style={styles.location}>{profile.location}</Text>
          </View>
        </View>
      </View>

      <View style={styles.skillsContainer}>
        {profile.skills.slice(0, 4).map((skill, index) => (
          <View key={index} style={styles.skillTag}>
            <Text style={styles.skillText}>{skill}</Text>
          </View>
        ))}
        {profile.skills.length > 4 && (
          <View style={styles.skillTag}>
            <Text style={styles.skillText}>+{profile.skills.length - 4}</Text>
          </View>
        )}
      </View>

      <View style={styles.statsContainer}>
        <View style={styles.statItem}>
          <Ionicons name="star" size={16} color="#FFD700" />
          <Text style={styles.statText}>{profile.rating}</Text>
        </View>
        <View style={styles.statItem}>
          <Ionicons name="people" size={16} color="#667eea" />
          <Text style={styles.statText}>{profile.sessions} sessions</Text>
        </View>
        {profile.verified && (
          <View style={styles.statItem}>
            <Ionicons name="checkmark-circle" size={16} color="#4CAF50" />
            <Text style={styles.statText}>Verified</Text>
          </View>
        )}
      </View>

      <View style={styles.actionButtons}>
        <TouchableOpacity style={styles.viewButton} onPress={onPress}>
          <Text style={styles.viewButtonText}>View Profile</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.connectButton} onPress={onConnect}>
          <Text style={styles.connectButtonText}>Connect</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 20,
    marginBottom: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  header: {
    flexDirection: 'row',
    marginBottom: 15,
  },
  profileImage: {
    width: 60,
    height: 60,
    borderRadius: 30,
    marginRight: 15,
    backgroundColor: '#ddd',
  },
  profileInfo: {
    flex: 1,
  },
  name: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 5,
  },
  title: {
    fontSize: 16,
    color: '#667eea',
    marginBottom: 3,
  },
  company: {
    fontSize: 14,
    color: '#666',
    marginBottom: 5,
  },
  locationContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  location: {
    fontSize: 12,
    color: '#666',
    marginLeft: 3,
  },
  skillsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: 15,
  },
  skillTag: {
    backgroundColor: '#f0f0f0',
    borderRadius: 15,
    paddingHorizontal: 12,
    paddingVertical: 6,
    marginRight: 8,
    marginBottom: 8,
  },
  skillText: {
    fontSize: 12,
    color: '#333',
  },
  statsContainer: {
    flexDirection: 'row',
    marginBottom: 15,
  },
  statItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 20,
  },
  statText: {
    fontSize: 14,
    color: '#333',
    marginLeft: 5,
  },
  actionButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  viewButton: {
    flex: 1,
    backgroundColor: '#f0f0f0',
    borderRadius: 8,
    paddingVertical: 12,
    alignItems: 'center',
    marginRight: 10,
  },
  viewButtonText: {
    color: '#333',
    fontSize: 16,
    fontWeight: '600',
  },
  connectButton: {
    flex: 1,
    backgroundColor: '#667eea',
    borderRadius: 8,
    paddingVertical: 12,
    alignItems: 'center',
  },
  connectButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
});
