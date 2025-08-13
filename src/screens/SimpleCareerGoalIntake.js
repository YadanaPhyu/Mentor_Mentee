import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Alert,
  KeyboardAvoidingView,
  Platform,
  FlatList,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';

export default function SimpleCareerGoalIntake({ navigation }) {
  const [formData, setFormData] = useState({
    targetRole: '',
    currentSkills: '',
    experienceLevel: '',
    learningStyle: '',
    timeline: '',
    additionalInfo: ''
  });

  const [roleSuggestions, setRoleSuggestions] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(false);

  // Simple role suggestions based on common keywords
  const getRoleSuggestions = (input) => {
    if (input.length < 2) return [];
    
    const roles = [
      'Software Engineer', 'Frontend Developer', 'Backend Developer', 'Full Stack Developer',
      'Data Scientist', 'Data Analyst', 'Machine Learning Engineer', 'AI Engineer',
      'Product Manager', 'Project Manager', 'Business Analyst', 'Scrum Master',
      'UI/UX Designer', 'Graphic Designer', 'Web Designer', 'Product Designer',
      'DevOps Engineer', 'Cloud Engineer', 'System Administrator', 'Network Engineer',
      'Cybersecurity Analyst', 'Security Engineer', 'Penetration Tester',
      'Marketing Manager', 'Digital Marketing Specialist', 'Content Creator',
      'Sales Manager', 'Account Manager', 'Customer Success Manager',
      'Financial Analyst', 'Investment Banker', 'Accountant', 'Tax Specialist',
      'HR Manager', 'Recruiter', 'Training Specialist', 'Organizational Development',
      'Mobile App Developer', 'Game Developer', 'QA Engineer', 'Test Automation Engineer',
      'Technical Writer', 'Content Strategist', 'SEO Specialist', 'Social Media Manager'
    ];

    return roles.filter(role => 
      role.toLowerCase().includes(input.toLowerCase())
    ).slice(0, 5);
  };

  const handleRoleInputChange = (text) => {
    setFormData({...formData, targetRole: text});
    const suggestions = getRoleSuggestions(text);
    setRoleSuggestions(suggestions);
    setShowSuggestions(suggestions.length > 0 && text.length > 1);
  };

  const selectRoleSuggestion = (role) => {
    setFormData({...formData, targetRole: role});
    setShowSuggestions(false);
    setRoleSuggestions([]);
  };

  const experienceLevels = [
    { key: 'beginner', label: 'Beginner (0-2 years)' },
    { key: 'intermediate', label: 'Intermediate (3-5 years)' },
    { key: 'advanced', label: 'Advanced (5+ years)' },
    { key: 'expert', label: 'Expert (10+ years)' }
  ];

  const learningStyles = [
    { key: 'visual', label: 'Visual (videos, diagrams)' },
    { key: 'reading', label: 'Reading (articles, books)' },
    { key: 'hands-on', label: 'Hands-on (projects, practice)' },
    { key: 'mixed', label: 'Mixed approach' }
  ];

  const timelines = [
    { key: '1-month', label: '1 Month' },
    { key: '3-months', label: '3 Months' },
    { key: '6-months', label: '6 Months' },
    { key: '1-year', label: '1 Year' }
  ];

  const handleSubmit = () => {
    if (!formData.targetRole.trim()) {
      Alert.alert('Missing Information', 'Please enter your target career role.');
      return;
    }

    // For now, navigate to the simple career map view
    // TODO: Add AI processing here later
    navigation.navigate('CareerMapView', { 
      assessment: formData,
      careerMap: {
        targetRole: formData.targetRole,
        timeline: formData.timeline,
        message: 'Career map will be generated here'
      }
    });
  };

  const renderOptionButtons = (options, selectedValue, onSelect) => (
    <View style={styles.optionsContainer}>
      {options.map((option) => (
        <TouchableOpacity
          key={option.key}
          style={[
            styles.optionButton,
            selectedValue === option.key && styles.selectedOption
          ]}
          onPress={() => onSelect(option.key)}
        >
          <Text style={[
            styles.optionText,
            selectedValue === option.key && styles.selectedOptionText
          ]}>
            {option.label}
          </Text>
        </TouchableOpacity>
      ))}
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView 
        style={styles.container} 
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
          <View style={styles.header}>
            <Text style={styles.title}>Career Assessment</Text>
            <Text style={styles.subtitle}>Help us understand your career goals</Text>
          </View>

          <View style={styles.form}>
            {/* Target Role */}
            <View style={styles.section}>
              <Text style={styles.label}>What career role are you targeting? *</Text>
              <TextInput
                style={styles.textInput}
                value={formData.targetRole}
                onChangeText={handleRoleInputChange}
                placeholder="e.g., Software Engineer, Data Scientist, Product Manager"
                placeholderTextColor="#999"
              />
              
              {showSuggestions && (
                <View style={styles.suggestionsContainer}>
                  <Text style={styles.suggestionsHeader}>Suggestions:</Text>
                  {roleSuggestions.map((suggestion, index) => (
                    <TouchableOpacity
                      key={index}
                      style={styles.suggestionItem}
                      onPress={() => selectRoleSuggestion(suggestion)}
                    >
                      <Ionicons name="bulb-outline" size={16} color="#667eea" />
                      <Text style={styles.suggestionText}>{suggestion}</Text>
                    </TouchableOpacity>
                  ))}
                </View>
              )}
            </View>

            {/* Experience Level */}
            <View style={styles.section}>
              <Text style={styles.label}>What's your experience level?</Text>
              {renderOptionButtons(
                experienceLevels,
                formData.experienceLevel,
                (value) => setFormData({...formData, experienceLevel: value})
              )}
            </View>

            {/* Current Skills */}
            <View style={styles.section}>
              <Text style={styles.label}>Current Skills & Experience</Text>
              <TextInput
                style={[styles.textInput, styles.multilineInput]}
                value={formData.currentSkills}
                onChangeText={(text) => setFormData({...formData, currentSkills: text})}
                placeholder="Describe your current skills, technologies, and experience..."
                placeholderTextColor="#999"
                multiline
                numberOfLines={4}
              />
            </View>

            {/* Learning Style */}
            <View style={styles.section}>
              <Text style={styles.label}>Preferred Learning Style</Text>
              {renderOptionButtons(
                learningStyles,
                formData.learningStyle,
                (value) => setFormData({...formData, learningStyle: value})
              )}
            </View>

            {/* Timeline */}
            <View style={styles.section}>
              <Text style={styles.label}>Target Timeline</Text>
              {renderOptionButtons(
                timelines,
                formData.timeline,
                (value) => setFormData({...formData, timeline: value})
              )}
            </View>

            {/* Additional Info */}
            <View style={styles.section}>
              <Text style={styles.label}>Additional Information (Optional)</Text>
              <TextInput
                style={[styles.textInput, styles.multilineInput]}
                value={formData.additionalInfo}
                onChangeText={(text) => setFormData({...formData, additionalInfo: text})}
                placeholder="Any specific goals, constraints, or preferences..."
                placeholderTextColor="#999"
                multiline
                numberOfLines={3}
              />
            </View>

            {/* Submit Button */}
            <TouchableOpacity style={styles.submitButton} onPress={handleSubmit}>
              <Ionicons name="arrow-forward" size={20} color="#fff" />
              <Text style={styles.submitButtonText}>Generate Career Map</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  scrollView: {
    flex: 1,
  },
  header: {
    padding: 20,
    paddingBottom: 10,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: '#666',
    lineHeight: 22,
  },
  form: {
    padding: 20,
    paddingTop: 10,
  },
  section: {
    marginBottom: 25,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 12,
  },
  textInput: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    fontSize: 16,
    borderWidth: 1,
    borderColor: '#e1e5e9',
    color: '#333',
  },
  multilineInput: {
    height: 100,
    textAlignVertical: 'top',
  },
  optionsContainer: {
    gap: 8,
  },
  optionButton: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: '#e1e5e9',
  },
  selectedOption: {
    backgroundColor: '#667eea',
    borderColor: '#667eea',
  },
  optionText: {
    fontSize: 14,
    color: '#333',
    fontWeight: '500',
  },
  selectedOptionText: {
    color: '#fff',
  },
  submitButton: {
    backgroundColor: '#667eea',
    borderRadius: 12,
    padding: 18,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    marginTop: 20,
    marginBottom: 40,
  },
  submitButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  suggestionsContainer: {
    backgroundColor: '#f8f9ff',
    borderRadius: 8,
    marginTop: 8,
    padding: 12,
    borderWidth: 1,
    borderColor: '#e1e5e9',
  },
  suggestionsHeader: {
    fontSize: 14,
    fontWeight: '600',
    color: '#667eea',
    marginBottom: 8,
  },
  suggestionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    paddingHorizontal: 4,
    gap: 8,
  },
  suggestionText: {
    fontSize: 14,
    color: '#333',
  },
});
