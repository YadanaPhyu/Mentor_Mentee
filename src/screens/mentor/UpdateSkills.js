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

export default function UpdateSkills() {
  const { t } = useLanguage();
  const [skills, setSkills] = useState([
    'React Native',
    'JavaScript',
    'Mobile Development',
    'UI/UX Design',
  ]);
  const [newSkill, setNewSkill] = useState('');

  const addSkill = () => {
    if (newSkill.trim() && !skills.includes(newSkill.trim())) {
      setSkills([...skills, newSkill.trim()]);
      setNewSkill('');
    }
  };

  const removeSkill = (skillToRemove) => {
    setSkills(skills.filter(skill => skill !== skillToRemove));
  };

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.header}>{t('updateYourSkills')}</Text>
      
      <View style={styles.addSkillContainer}>
        <TextInput
          style={styles.input}
          value={newSkill}
          onChangeText={setNewSkill}
          placeholder={t('enterNewSkill')}
          placeholderTextColor="#999"
        />
        <TouchableOpacity style={styles.addButton} onPress={addSkill}>
          <Text style={styles.addButtonText}>{t('add')}</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.skillsContainer}>
        {skills.map((skill, index) => (
          <View key={index} style={styles.skillBadge}>
            <Text style={styles.skillText}>{skill}</Text>
            <TouchableOpacity
              onPress={() => removeSkill(skill)}
              style={styles.removeButton}
            >
              <Ionicons name="close-circle" size={20} color="white" />
            </TouchableOpacity>
          </View>
        ))}
      </View>

      <TouchableOpacity style={styles.saveButton}>
        <Text style={styles.saveButtonText}>{t('saveSkills')}</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
    padding: 20,
  },
  header: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 20,
  },
  addSkillContainer: {
    flexDirection: 'row',
    marginBottom: 20,
  },
  input: {
    flex: 1,
    backgroundColor: 'white',
    borderRadius: 8,
    padding: 12,
    marginRight: 10,
    fontSize: 16,
    borderWidth: 1,
    borderColor: '#ddd',
  },
  addButton: {
    backgroundColor: '#667eea',
    borderRadius: 8,
    padding: 12,
    justifyContent: 'center',
  },
  addButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  skillsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: 20,
  },
  skillBadge: {
    backgroundColor: '#667eea',
    borderRadius: 20,
    paddingVertical: 8,
    paddingHorizontal: 12,
    marginRight: 10,
    marginBottom: 10,
    flexDirection: 'row',
    alignItems: 'center',
  },
  skillText: {
    color: 'white',
    fontSize: 14,
    marginRight: 5,
  },
  removeButton: {
    marginLeft: 5,
  },
  saveButton: {
    backgroundColor: '#764ba2',
    padding: 15,
    borderRadius: 12,
    alignItems: 'center',
    marginTop: 20,
  },
  saveButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
});
