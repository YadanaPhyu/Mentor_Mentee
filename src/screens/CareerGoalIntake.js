import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Alert,
  FlatList,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import careerMemoryService from '../services/careerMemoryService';

// Import AI-Enhanced Services
import aiRoleResolverService from '../services/aiRoleResolverService.js';
import aiCareerMapApiService from '../services/aiCareerMapApiService.js';

export default function CareerGoalIntake({ navigation }) {
  const [currentRole, setCurrentRole] = useState('');
  const [targetRole, setTargetRole] = useState('');
  const [skillsText, setSkillsText] = useState('');
  const [hoursPerWeek, setHoursPerWeek] = useState('10');
  const [budget, setBudget] = useState('500');
  const [experience, setExperience] = useState('entry');
  const [isGenerating, setIsGenerating] = useState(false);
  const [showQuickPicks, setShowQuickPicks] = useState(true);

  // Quick-pick career chips - curated list for easy selection
  const quickPickCareers = [
    'Software Engineer',
    'Data Scientist', 
    'Product Manager',
    'UX/UI Designer',
    'Digital Marketing Manager',
    'DevOps Engineer',
    'Business Analyst',
    'Content Creator',
    'Project Manager',
    'Sales Manager',
    'Teacher',
    'Nurse Practitioner',
  ];

  const experienceOptions = [
    { value: 'entry', label: 'Entry Level (0-2 years)' },
    { value: 'mid', label: 'Mid Level (3-5 years)' },
    { value: 'senior', label: 'Senior Level (5+ years)' },
  ];

  const handleQuickPickSelect = (career) => {
    setTargetRole(career);
    setShowQuickPicks(false);
  };

  const handleGenerateMap = async () => {
    if (!currentRole.trim()) {
      Alert.alert('Missing Information', 'Please enter your current role.');
      return;
    }

    if (!targetRole.trim()) {
      Alert.alert('Missing Information', 'Please enter your target role.');
      return;
    }

    setIsGenerating(true);
    
    try {
      const assessmentData = {
        currentRole: currentRole.trim(),
        targetRole: targetRole.trim(),
        skillsText: skillsText.trim(),
        currentSkills: skillsText.split(',').map(skill => skill.trim()).filter(Boolean),
        experience,
        hoursPerWeek: parseInt(hoursPerWeek) || 10,
        budget: parseInt(budget) || 500,
        timestamp: new Date().toISOString(),
      };

      console.log('🤖 Starting role resolution for:', targetRole);
      
      // Step 1: Resolve the target role using AI
      const roleResolution = await aiRoleResolverService.resolveRole(targetRole);
      
      console.log('🔍 Role resolution result:', roleResolution);

      // Step 2: Check if confirmation is needed
      if (roleResolution.requiresConfirmation) {
        console.log('❓ Role requires confirmation, navigating to confirmation screen');
        
        navigation.navigate('RoleConfirmation', {
          roleResolution,
          assessmentData
        });
        return;
      }

      // Step 3: Use the highest confidence match
      const resolvedRole = roleResolution.matches[0];
      const updatedAssessmentData = {
        ...assessmentData,
        targetRole: resolvedRole.role,
        resolvedRole: resolvedRole,
        originalTargetRole: targetRole,
      };

      console.log('✅ Role auto-resolved to:', resolvedRole.role);

      // Save resolved role to memory for future use
      await careerMemoryService.saveResolvedRole(targetRole, resolvedRole);

      // Save assessment to memory
      const assessmentId = await careerMemoryService.saveAssessment(updatedAssessmentData);
      updatedAssessmentData.assessmentId = assessmentId;

      console.log('📡 Sending assessment data to AI career mapping service:', updatedAssessmentData);
      
      const careerMap = await aiCareerMapApiService.default.generateCareerMap(updatedAssessmentData);
      
      // Save career map to memory
      if (updatedAssessmentData.assessmentId) {
        await careerMemoryService.saveCareerMap(updatedAssessmentData.assessmentId, careerMap);
      }
      
      console.log('✅ Received AI-generated career map:', careerMap);
      
      navigation.navigate('CareerMapView', { 
        careerMap, 
        intakeData: updatedAssessmentData 
      });
    } catch (error) {
      console.error('❌ Failed to generate career map:', error);
      Alert.alert(
        'Error', 
        'Failed to generate career map. Please check your connection and try again.',
        [
          { text: 'OK', style: 'default' }
        ]
      );
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <KeyboardAvoidingView 
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        <View style={styles.content}>
          {/* Header */}
          <View style={styles.header}>
            <Text style={styles.title}>Create Your Career Roadmap</Text>
            <Text style={styles.subtitle}>
              Tell us about your goals and get a personalized 8-week learning plan
            </Text>
          </View>

          {/* Current Role */}
          <View style={styles.section}>
            <Text style={styles.label}>Current Role/Position *</Text>
            <TextInput
              style={styles.input}
              value={currentRole}
              onChangeText={setCurrentRole}
              placeholder="e.g., Student, Junior Developer, Marketing Assistant"
              multiline={false}
            />
          </View>

          {/* Target Role with Quick Picks */}
          <View style={styles.section}>
            <Text style={styles.label}>Target Role/Position *</Text>
            <TextInput
              style={styles.input}
              value={targetRole}
              onChangeText={(text) => {
                setTargetRole(text);
                setShowQuickPicks(text === '');
              }}
              placeholder="e.g., Senior Software Engineer, Data Scientist"
              multiline={false}
            />
            
            {/* Quick Pick Careers */}
            {showQuickPicks && (
              <View style={styles.quickPickContainer}>
                <Text style={styles.quickPickLabel}>Popular Careers:</Text>
                <FlatList
                  data={quickPickCareers}
                  renderItem={({ item }) => (
                    <TouchableOpacity
                      style={styles.quickPickChip}
                      onPress={() => handleQuickPickSelect(item)}
                    >
                      <Text style={styles.quickPickText}>{item}</Text>
                    </TouchableOpacity>
                  )}
                  keyExtractor={(item) => item}
                  horizontal
                  showsHorizontalScrollIndicator={false}
                  style={styles.quickPickList}
                />
              </View>
            )}

            {!showQuickPicks && (
              <TouchableOpacity
                style={styles.showQuickPicksButton}
                onPress={() => {
                  setShowQuickPicks(true);
                  setTargetRole('');
                }}
              >
                <Text style={styles.showQuickPicksText}>Browse popular careers</Text>
              </TouchableOpacity>
            )}
          </View>

          {/* Current Skills */}
          <View style={styles.section}>
            <Text style={styles.label}>Current Skills (Optional)</Text>
            <TextInput
              style={[styles.input, styles.textArea]}
              value={skillsText}
              onChangeText={setSkillsText}
              placeholder="List your skills separated by commas..."
              multiline={true}
              numberOfLines={3}
            />
          </View>

          {/* Experience Level */}
          <View style={styles.section}>
            <Text style={styles.label}>Experience Level</Text>
            <View style={styles.optionsContainer}>
              {experienceOptions.map((option) => (
                <TouchableOpacity
                  key={option.value}
                  style={[
                    styles.optionButton,
                    experience === option.value && styles.optionButtonSelected
                  ]}
                  onPress={() => setExperience(option.value)}
                >
                  <Text style={[
                    styles.optionText,
                    experience === option.value && styles.optionTextSelected
                  ]}>
                    {option.label}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          {/* Time Commitment */}
          <View style={styles.section}>
            <Text style={styles.label}>Hours per week for learning</Text>
            <TextInput
              style={styles.input}
              value={hoursPerWeek}
              onChangeText={setHoursPerWeek}
              placeholder="10"
              keyboardType="numeric"
            />
          </View>

          {/* Budget */}
          <View style={styles.section}>
            <Text style={styles.label}>Learning budget (USD)</Text>
            <TextInput
              style={styles.input}
              value={budget}
              onChangeText={setBudget}
              placeholder="500"
              keyboardType="numeric"
            />
          </View>

          {/* Generate Button */}
          <TouchableOpacity
            style={[styles.generateButton, isGenerating && styles.generateButtonDisabled]}
            onPress={handleGenerateMap}
            disabled={isGenerating}
          >
            {isGenerating ? (
              <View style={styles.loadingContainer}>
                <ActivityIndicator size="small" color="white" />
                <Text style={styles.generateButtonText}>Generating your roadmap...</Text>
              </View>
            ) : (
              <>
                <Ionicons name="map" size={20} color="white" />
                <Text style={styles.generateButtonText}>
                  Generate AI Career Roadmap
                </Text>
              </>
            )}
          </TouchableOpacity>

          <View style={styles.footer}>
            <Text style={styles.footerText}>
              🤖 Powered by AI for personalized career guidance
            </Text>
          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
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
  content: {
    padding: 20,
  },
  header: {
    marginBottom: 30,
    alignItems: 'center',
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#333',
    textAlign: 'center',
    marginBottom: 10,
  },
  subtitle: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    lineHeight: 22,
  },
  section: {
    marginBottom: 25,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 8,
  },
  input: {
    backgroundColor: 'white',
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 15,
    fontSize: 16,
    color: '#333',
  },
  textArea: {
    height: 80,
    textAlignVertical: 'top',
  },
  quickPickContainer: {
    marginTop: 10,
  },
  quickPickLabel: {
    fontSize: 14,
    color: '#666',
    marginBottom: 10,
  },
  quickPickList: {
    marginBottom: 10,
  },
  quickPickChip: {
    backgroundColor: '#667eea',
    paddingHorizontal: 15,
    paddingVertical: 8,
    borderRadius: 20,
    marginRight: 10,
    marginBottom: 10,
  },
  quickPickText: {
    color: 'white',
    fontSize: 14,
    fontWeight: '500',
  },
  showQuickPicksButton: {
    marginTop: 10,
    padding: 10,
  },
  showQuickPicksText: {
    color: '#667eea',
    fontSize: 14,
    textDecorationLine: 'underline',
  },
  optionsContainer: {
    flexDirection: 'column',
    gap: 10,
  },
  optionButton: {
    backgroundColor: 'white',
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 15,
    alignItems: 'center',
  },
  optionButtonSelected: {
    backgroundColor: '#667eea',
    borderColor: '#667eea',
  },
  optionText: {
    fontSize: 16,
    color: '#333',
  },
  optionTextSelected: {
    color: 'white',
    fontWeight: '600',
  },
  generateButton: {
    backgroundColor: '#667eea',
    borderRadius: 12,
    padding: 18,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginVertical: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  generateButtonDisabled: {
    opacity: 0.7,
  },
  generateButtonText: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
    marginLeft: 10,
  },
  loadingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  footer: {
    alignItems: 'center',
    marginTop: 20,
    marginBottom: 40,
  },
  footerText: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
  },
});
