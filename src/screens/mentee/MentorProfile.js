import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useLanguage } from '../../context/LanguageContext';

export default function MentorProfile({ route, navigation }) {
  const { t } = useLanguage();
  // In a real app, you would get this data from the route params or an API
  const mentor = {
    name: 'John Doe',
    title: 'Senior Mobile Developer',
    experience: '8 years',
    rating: 4.8,
    totalSessions: 156,
    skills: ['React Native', 'JavaScript', 'Mobile Development', 'UI/UX'],
    availability: ['Mon', 'Wed', 'Fri'],
    bio: 'Experienced mobile developer passionate about helping others learn and grow in their development journey.',
    reviews: [
      {
        id: 1,
        mentee: 'Alice Brown',
        rating: 5,
        comment: 'Excellent mentor, very patient and knowledgeable.',
        date: '2 weeks ago',
      },
      {
        id: 2,
        mentee: 'Bob Wilson',
        rating: 4,
        comment: 'Great at explaining complex concepts in simple terms.',
        date: '1 month ago',
      },
    ],
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <View style={styles.profileInfo}>
          <Ionicons name="person-circle" size={80} color="#764ba2" />
          <View style={styles.nameContainer}>
            <Text style={styles.name}>{mentor.name}</Text>
            <Text style={styles.title}>{mentor.title}</Text>
          </View>
        </View>
        <View style={styles.stats}>
          <View style={styles.statItem}>
            <Text style={styles.statValue}>{mentor.experience}</Text>
            <Text style={styles.statLabel}>{t('experience')}</Text>
          </View>
          <View style={styles.statItem}>
            <Text style={styles.statValue}>{mentor.rating}</Text>
            <Text style={styles.statLabel}>{t('rating')}</Text>
          </View>
          <View style={styles.statItem}>
            <Text style={styles.statValue}>{mentor.totalSessions}</Text>
            <Text style={styles.statLabel}>{t('sessions')}</Text>
          </View>
        </View>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>{t('about')}</Text>
        <Text style={styles.bio}>{mentor.bio}</Text>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>{t('skills')}</Text>
        <View style={styles.skillsContainer}>
          {mentor.skills.map((skill, index) => (
            <View key={index} style={styles.skillBadge}>
              <Text style={styles.skillText}>{skill}</Text>
            </View>
          ))}
        </View>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>{t('availability')}</Text>
        <View style={styles.availabilityContainer}>
          {mentor.availability.map((day, index) => (
            <View key={index} style={styles.dayBadge}>
              <Text style={styles.dayText}>{day}</Text>
            </View>
          ))}
        </View>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>{t('reviews')}</Text>
        {mentor.reviews.map((review) => (
          <View key={review.id} style={styles.reviewCard}>
            <View style={styles.reviewHeader}>
              <Text style={styles.reviewerName}>{review.mentee}</Text>
              <Text style={styles.reviewDate}>{review.date}</Text>
            </View>
            <View style={styles.ratingContainer}>
              {[...Array(5)].map((_, i) => (
                <Ionicons
                  key={i}
                  name={i < review.rating ? 'star' : 'star-outline'}
                  size={16}
                  color="#FFD700"
                />
              ))}
            </View>
            <Text style={styles.reviewText}>{review.comment}</Text>
          </View>
        ))}
      </View>

      <TouchableOpacity
        style={styles.requestButton}
        onPress={() => navigation.navigate('BookSession', { mentorId: '1' })}
      >
        <Text style={styles.requestButtonText}>{t('requestMentorship')}</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  header: {
    backgroundColor: 'white',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  profileInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },
  nameContainer: {
    marginLeft: 20,
  },
  name: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
  },
  title: {
    fontSize: 16,
    color: '#666',
    marginTop: 4,
  },
  stats: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginTop: 10,
  },
  statItem: {
    alignItems: 'center',
  },
  statValue: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#667eea',
  },
  statLabel: {
    fontSize: 12,
    color: '#666',
    marginTop: 4,
  },
  section: {
    backgroundColor: 'white',
    padding: 20,
    marginTop: 10,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 15,
  },
  bio: {
    fontSize: 14,
    color: '#666',
    lineHeight: 22,
  },
  skillsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  skillBadge: {
    backgroundColor: '#667eea',
    borderRadius: 20,
    paddingVertical: 6,
    paddingHorizontal: 12,
    margin: 4,
  },
  skillText: {
    color: 'white',
    fontSize: 12,
  },
  availabilityContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  dayBadge: {
    backgroundColor: '#764ba2',
    borderRadius: 20,
    paddingVertical: 6,
    paddingHorizontal: 12,
    margin: 4,
  },
  dayText: {
    color: 'white',
    fontSize: 12,
  },
  reviewCard: {
    backgroundColor: '#f8f9fa',
    borderRadius: 12,
    padding: 15,
    marginBottom: 10,
  },
  reviewHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  reviewerName: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
  },
  reviewDate: {
    fontSize: 12,
    color: '#666',
  },
  ratingContainer: {
    flexDirection: 'row',
    marginBottom: 8,
  },
  reviewText: {
    fontSize: 14,
    color: '#666',
    lineHeight: 20,
  },
  requestButton: {
    backgroundColor: '#667eea',
    margin: 20,
    padding: 15,
    borderRadius: 12,
    alignItems: 'center',
  },
  requestButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
});
