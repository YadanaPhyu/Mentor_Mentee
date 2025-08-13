import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import careerMemoryService from '../services/careerMemoryService';

export default function RoleConfirmationScreen({ route, navigation }) {
  const { roleResolution, assessmentData } = route.params;
  const [selectedRole, setSelectedRole] = useState(null);
  const [isProcessing, setIsProcessing] = useState(false);

  const handleRoleSelect = (roleMatch) => {
    setSelectedRole(roleMatch);
  };

  const handleContinue = async () => {
    if (!selectedRole) {
      Alert.alert('Please select a role', 'Choose one of the suggested roles or create a custom one.');
      return;
    }

    setIsProcessing(true);

    try {
      // Update assessment data with resolved role
      const updatedAssessmentData = {
        ...assessmentData,
        targetRole: selectedRole.role,
        resolvedRole: selectedRole,
        originalTargetRole: roleResolution.originalInput,
      };

      console.log('🎯 Role confirmed:', selectedRole.role);
      console.log('📋 Updated assessment data:', updatedAssessmentData);

      // Save resolved role to memory for future use
      await careerMemoryService.saveResolvedRole(roleResolution.originalInput, selectedRole);

      // Save assessment to memory
      const assessmentId = await careerMemoryService.saveAssessment(updatedAssessmentData);
      updatedAssessmentData.assessmentId = assessmentId;

      // Import the API service dynamically to avoid circular imports
      const careerMapApi = require('../services/careerMapApi.js').default;
      
      const careerMap = await careerMapApi.generateCareerMap(updatedAssessmentData);
      
      // Save career map to memory
      if (updatedAssessmentData.assessmentId) {
        await careerMemoryService.saveCareerMap(updatedAssessmentData.assessmentId, careerMap);
      }
      
      navigation.navigate('CareerMapView', { 
        careerMap, 
        intakeData: updatedAssessmentData 
      });
    } catch (error) {
      console.error('❌ Failed to generate career map:', error);
      Alert.alert(
        'Error', 
        'Failed to generate career map. Please check your connection and try again.'
      );
    } finally {
      setIsProcessing(false);
    }
  };

  const handleCreateCustomRole = () => {
    const customRole = {
      role: roleResolution.originalInput,
      confidence: 0.5,
      matchType: 'custom',
      category: 'Custom',
      level: 'Unspecified',
      isCustom: true,
      originalInput: roleResolution.originalInput
    };

    setSelectedRole(customRole);
  };

  const getConfidenceColor = (confidence) => {
    if (confidence >= 0.8) return '#10b981'; // Green
    if (confidence >= 0.6) return '#f59e0b'; // Orange
    return '#ef4444'; // Red
  };

  const getConfidenceText = (confidence) => {
    if (confidence >= 0.8) return 'High Match';
    if (confidence >= 0.6) return 'Good Match';
    return 'Possible Match';
  };

  const RoleOption = ({ roleMatch, isSelected, onSelect }) => (
    <TouchableOpacity
      style={[styles.roleOption, isSelected && styles.selectedRoleOption]}
      onPress={() => onSelect(roleMatch)}
    >
      <View style={styles.roleHeader}>
        <Text style={[styles.roleName, isSelected && styles.selectedRoleName]}>
          {roleMatch.role}
        </Text>
        <View style={[
          styles.confidenceBadge, 
          { backgroundColor: getConfidenceColor(roleMatch.confidence) }
        ]}>
          <Text style={styles.confidenceText}>
            {Math.round(roleMatch.confidence * 100)}%
          </Text>
        </View>
      </View>
      
      <Text style={[styles.roleCategory, isSelected && styles.selectedRoleCategory]}>
        {roleMatch.category} • {roleMatch.level}
      </Text>
      
      <Text style={[styles.matchInfo, isSelected && styles.selectedMatchInfo]}>
        {getConfidenceText(roleMatch.confidence)}
        {roleMatch.matchedAlias && ` (matched: "${roleMatch.matchedAlias}")`}
      </Text>

      {isSelected && (
        <View style={styles.selectedIndicator}>
          <Ionicons name="checkmark-circle" size={20} color="#10b981" />
          <Text style={styles.selectedText}>Selected</Text>
        </View>
      )}
    </TouchableOpacity>
  );

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Ionicons name="search" size={40} color="#667eea" />
        <Text style={styles.title}>Confirm Your Career Goal</Text>
        <Text style={styles.subtitle}>
          We found some matches for "{roleResolution.originalInput}". Please select the best match or create a custom role.
        </Text>
      </View>

      <View style={styles.content}>
        <Text style={styles.sectionTitle}>📋 Suggested Roles</Text>
        
        {roleResolution.matches.length > 0 ? (
          <>
            {roleResolution.matches.map((roleMatch, index) => (
              <RoleOption
                key={index}
                roleMatch={roleMatch}
                isSelected={selectedRole?.role === roleMatch.role}
                onSelect={handleRoleSelect}
              />
            ))}
          </>
        ) : (
          <View style={styles.noMatchesContainer}>
            <Ionicons name="help-circle" size={24} color="#9ca3af" />
            <Text style={styles.noMatchesText}>
              No close matches found for "{roleResolution.originalInput}"
            </Text>
          </View>
        )}

        <Text style={styles.sectionTitle}>🎨 Custom Option</Text>
        
        <TouchableOpacity
          style={[
            styles.customRoleOption,
            selectedRole?.isCustom && styles.selectedRoleOption
          ]}
          onPress={handleCreateCustomRole}
        >
          <View style={styles.customRoleHeader}>
            <Ionicons name="create" size={20} color="#667eea" />
            <Text style={[
              styles.customRoleText,
              selectedRole?.isCustom && styles.selectedRoleName
            ]}>
              Create Custom Role: "{roleResolution.originalInput}"
            </Text>
          </View>
          <Text style={[
            styles.customRoleDescription,
            selectedRole?.isCustom && styles.selectedRoleCategory
          ]}>
            Our AI will generate a personalized roadmap for this unique career path
          </Text>

          {selectedRole?.isCustom && (
            <View style={styles.selectedIndicator}>
              <Ionicons name="checkmark-circle" size={20} color="#10b981" />
              <Text style={styles.selectedText}>Selected</Text>
            </View>
          )}
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.continueButton, !selectedRole && styles.disabledButton]}
          onPress={handleContinue}
          disabled={!selectedRole || isProcessing}
        >
          {isProcessing ? (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="small" color="white" style={styles.spinner} />
              <Text style={styles.continueButtonText}>
                Generating Career Roadmap...
              </Text>
            </View>
          ) : (
            <View style={styles.buttonContent}>
              <Ionicons name="arrow-forward" size={20} color="white" style={styles.buttonIcon} />
              <Text style={styles.continueButtonText}>
                Continue with "{selectedRole?.role || 'Selected Role'}"
              </Text>
            </View>
          )}
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Ionicons name="arrow-back" size={16} color="#6b7280" />
          <Text style={styles.backButtonText}>Go Back to Edit</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f9fafb',
  },
  header: {
    alignItems: 'center',
    padding: 30,
    paddingTop: 60,
    backgroundColor: 'white',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1f2937',
    marginTop: 15,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 16,
    color: '#6b7280',
    textAlign: 'center',
    marginTop: 10,
    lineHeight: 22,
  },
  content: {
    padding: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 15,
    marginTop: 20,
  },
  roleOption: {
    backgroundColor: 'white',
    borderWidth: 1,
    borderColor: '#d1d5db',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
  },
  selectedRoleOption: {
    borderColor: '#667eea',
    backgroundColor: '#f0f4ff',
    borderWidth: 2,
  },
  roleHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  roleName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#374151',
    flex: 1,
  },
  selectedRoleName: {
    color: '#1e40af',
  },
  confidenceBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    marginLeft: 8,
  },
  confidenceText: {
    fontSize: 12,
    fontWeight: '600',
    color: 'white',
  },
  roleCategory: {
    fontSize: 14,
    color: '#6b7280',
    marginBottom: 4,
  },
  selectedRoleCategory: {
    color: '#4338ca',
  },
  matchInfo: {
    fontSize: 12,
    color: '#9ca3af',
    fontStyle: 'italic',
  },
  selectedMatchInfo: {
    color: '#6366f1',
  },
  selectedIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 8,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: '#e5e7eb',
  },
  selectedText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#10b981',
    marginLeft: 6,
  },
  noMatchesContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f3f4f6',
    padding: 16,
    borderRadius: 12,
    marginBottom: 20,
  },
  noMatchesText: {
    fontSize: 14,
    color: '#6b7280',
    marginLeft: 12,
    flex: 1,
  },
  customRoleOption: {
    backgroundColor: '#fefbf3',
    borderWidth: 1,
    borderColor: '#f59e0b',
    borderRadius: 12,
    padding: 16,
    marginBottom: 20,
  },
  customRoleHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  customRoleText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#92400e',
    marginLeft: 8,
    flex: 1,
  },
  customRoleDescription: {
    fontSize: 14,
    color: '#a16207',
    fontStyle: 'italic',
  },
  continueButton: {
    backgroundColor: '#667eea',
    borderRadius: 12,
    padding: 18,
    marginTop: 20,
    marginBottom: 10,
  },
  disabledButton: {
    backgroundColor: '#9ca3af',
  },
  loadingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  buttonContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  spinner: {
    marginRight: 12,
  },
  buttonIcon: {
    marginRight: 8,
  },
  continueButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
  backButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 12,
  },
  backButtonText: {
    fontSize: 14,
    color: '#6b7280',
    marginLeft: 6,
  },
});
