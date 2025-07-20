import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TextInput,
  TouchableOpacity,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useLanguage } from '../context/LanguageContext';
import mentors from '../data/mockData';

export default function FindMentorsScreen() {
  const { t } = useLanguage();
  const [search, setSearch] = useState('');

  // Filter mentors by name or skill
  const filteredMentors = mentors.filter(
    (mentor) =>
      mentor.name.toLowerCase().includes(search.toLowerCase()) ||
      mentor.skills.some((skill) => skill.toLowerCase().includes(search.toLowerCase()))
  );

  return (
    <View style={styles.container}>
      <Text style={styles.title}>{t('findMentors')}</Text>
      <TextInput
        style={styles.searchInput}
        placeholder={t('searchByNameOrSkill')}
        value={search}
        onChangeText={setSearch}
      />
      <ScrollView style={styles.list}>
        {filteredMentors.length === 0 ? (
          <Text style={styles.noResults}>{t('noMentorsFound')}</Text>
        ) : (
          filteredMentors.map((mentor) => (
            <View key={mentor.id} style={styles.card}>
              <View style={styles.cardHeader}>
                <Ionicons name="person-circle" size={40} color="#764ba2" />
                <View style={{ marginLeft: 12 }}>
                  <Text style={styles.name}>{mentor.name}</Text>
                  <Text style={styles.location}>{mentor.location}</Text>
                </View>
              </View>
              <Text style={styles.skillsLabel}>{t('skills')}:</Text>
              <View style={styles.skillsRow}>
                {mentor.skills.map((skill, idx) => (
                  <View key={idx} style={styles.skillTag}>
                    <Text style={styles.skillText}>{skill}</Text>
                  </View>
                ))}
              </View>
              <TouchableOpacity style={styles.requestButton}>
                <Text style={styles.requestButtonText}>{t('requestMentorship')}</Text>
              </TouchableOpacity>
            </View>
          ))
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
    padding: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#764ba2',
    marginBottom: 16,
  },
  searchInput: {
    backgroundColor: 'white',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#ddd',
  },
  list: {
    flex: 1,
  },
  noResults: {
    textAlign: 'center',
    color: '#666',
    marginTop: 40,
    fontSize: 16,
  },
  card: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 18,
    marginBottom: 18,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 2,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  name: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  location: {
    fontSize: 14,
    color: '#666',
  },
  skillsLabel: {
    fontSize: 14,
    color: '#764ba2',
    marginTop: 8,
    marginBottom: 4,
    fontWeight: '600',
  },
  skillsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: 10,
  },
  skillTag: {
    backgroundColor: '#667eea',
    borderRadius: 6,
    paddingHorizontal: 10,
    paddingVertical: 4,
    marginRight: 8,
    marginBottom: 6,
  },
  skillText: {
    color: 'white',
    fontSize: 13,
    fontWeight: '500',
  },
  requestButton: {
    backgroundColor: '#764ba2',
    borderRadius: 8,
    paddingVertical: 10,
    alignItems: 'center',
    marginTop: 8,
  },
  requestButtonText: {
    color: 'white',
    fontSize: 15,
    fontWeight: 'bold',
  },
});
