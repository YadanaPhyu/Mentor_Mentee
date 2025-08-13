import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';

export default function CareerMapView({ route, navigation }) {
  const { careerMap, intakeData } = route.params || {};
  const [selectedWeek, setSelectedWeek] = useState(1);

  console.log('🏁 CareerMapView received careerMap:', careerMap);
  console.log('🏁 CareerMapView received intakeData:', intakeData);
  console.log('🎯 CareerMapView targetRole:', careerMap?.targetRole);

  if (!careerMap) {
    return (
      <View style={styles.errorContainer}>
        <Ionicons name="warning" size={48} color="#ff6b6b" />
        <Text style={styles.errorText}>No career map data found</Text>
        <TouchableOpacity 
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Text style={styles.backButtonText}>Go Back</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const getSkillColor = (category) => {
    switch (category) {
      case 'strong': return '#4caf50';
      case 'medium': return '#ff9800';
      case 'missing': return '#f44336';
      default: return '#ccc';
    }
  };

  const renderCareerOverview = () => (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>
        <Ionicons name="briefcase" size={20} color="#667eea" /> Career Overview
      </Text>
      
      <View style={styles.careerOverviewCard}>
        <Text style={styles.targetRole}>{careerMap.targetRole || intakeData?.targetRole || 'Your Career Goal'}</Text>
        {careerMap.careerData && (
          <>
            <Text style={styles.careerDetails}>Category: {careerMap.careerData.category}</Text>
            <Text style={styles.careerDetails}>Difficulty: {careerMap.careerData.difficulty}</Text>
            <Text style={styles.careerDetails}>Salary Range: {careerMap.careerData.avgSalary}</Text>
            
            {careerMap.marketInsights && (
              <View style={styles.marketInsights}>
                <Text style={styles.marketInsightsTitle}>📊 Market Insights:</Text>
                <Text style={styles.marketDetail}>Demand: {careerMap.marketInsights.demandLevel}</Text>
                <Text style={styles.marketDetail}>Growth: {careerMap.marketInsights.growthProjection}</Text>
                <Text style={styles.marketDetail}>Remote Work: {careerMap.marketInsights.remoteOpportunities}</Text>
              </View>
            )}
          </>
        )}
      </View>
    </View>
  );

  const renderSkillGap = () => (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>
        <Ionicons name="analytics" size={20} color="#667eea" /> AI Skill Gap Analysis
      </Text>
      
      {careerMap.gapAnalysis ? ['strong', 'medium', 'missing'].map((category) => {
        const skills = careerMap.gapAnalysis[category] || [];
        if (skills.length === 0) return null;
        
        return (
          <View key={category} style={styles.skillCategory}>
            <View style={styles.skillCategoryHeader}>
              <View style={[styles.skillIndicator, { backgroundColor: getSkillColor(category) }]} />
              <Text style={styles.skillCategoryTitle}>
                {category.charAt(0).toUpperCase() + category.slice(1)} Skills
              </Text>
            </View>
            <View style={styles.skillsList}>
              {skills.map((skill, index) => (
                <View key={index} style={styles.skillChip}>
                  <Text style={styles.skillText}>{skill}</Text>
                </View>
              ))}
            </View>
          </View>
        );
      }).filter(Boolean) : (
        <Text style={styles.noDataText}>Skill analysis not available</Text>
      )}
    </View>
  );

  const renderWeeklyPlan = () => (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>
        <Ionicons name="calendar" size={20} color="#667eea" /> 8-Week Learning Plan
      </Text>
      
      {careerMap.weeklyPlan && careerMap.weeklyPlan.length > 0 ? (
        <>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.weekSelector}>
            {careerMap.weeklyPlan.map((week) => (
              <TouchableOpacity
                key={week.week}
                style={[
                  styles.weekTab,
                  selectedWeek === week.week && styles.selectedWeekTab
                ]}
                onPress={() => setSelectedWeek(week.week)}
              >
                <Text style={[
                  styles.weekTabText,
                  selectedWeek === week.week && styles.selectedWeekTabText
                ]}>
                  Week {week.week}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>

          {(() => {
            const currentWeek = careerMap.weeklyPlan.find(w => w.week === selectedWeek);
            if (!currentWeek) return null;

            return (
              <View style={styles.weekDetails}>
                <Text style={styles.weekTitle}>Week {currentWeek.week} Focus</Text>
                
                <View style={styles.weekSection}>
                  <Text style={styles.weekSectionTitle}>🎯 Goals</Text>
              {currentWeek.goals.map((goal, index) => (
                <Text key={index} style={styles.weekItem}>• {goal}</Text>
              ))}
            </View>

            <View style={styles.weekSection}>
              <Text style={styles.weekSectionTitle}>📚 Resources</Text>
              {currentWeek.resources.map((resource, index) => (
                <Text key={index} style={styles.weekItem}>• {resource}</Text>
              ))}
            </View>

            <View style={styles.weekSection}>
              <Text style={styles.weekSectionTitle}>📋 Deliverable</Text>
              <Text style={styles.deliverable}>{currentWeek.deliverable}</Text>
            </View>
            </View>
          );
        })()}
        </>
      ) : (
        <Text style={styles.noDataText}>Weekly plan not available</Text>
      )}
    </View>
  );  const renderCapstone = () => (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>
        <Ionicons name="trophy" size={20} color="#667eea" /> Capstone Project
      </Text>
      
      <View style={styles.capstoneCard}>
        <Text style={styles.capstoneTitle}>{careerMap.capstone.title}</Text>
        <Text style={styles.capstoneOutcome}>Expected Outcome: {careerMap.capstone.expectedOutcome}</Text>
        
        <Text style={styles.capstoneStepsTitle}>Project Steps:</Text>
        {careerMap.capstone.steps.map((step, index) => (
          <Text key={index} style={styles.capstoneStep}>
            {index + 1}. {step}
          </Text>
        ))}
      </View>
    </View>
  );

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Ionicons name="cpu" size={40} color="#667eea" />
        <Text style={styles.title}>🤖 AI Career Roadmap</Text>
        <Text style={styles.subtitle}>
          Personalized path to {careerMap.targetRole || intakeData?.targetRole || 'Your Career Goal'}
        </Text>
      </View>

      {renderCareerOverview()}
      {renderSkillGap()}
      {renderWeeklyPlan()}
      {renderCapstone()}

      {careerMap.recommendations && careerMap.recommendations.length > 0 && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>
            <Ionicons name="bulb" size={20} color="#667eea" /> AI Recommendations
          </Text>
          {careerMap.recommendations.map((rec, index) => (
            <View key={index} style={styles.recommendationCard}>
              <Text style={styles.recommendationTitle}>{rec.title}</Text>
              <Text style={styles.recommendationDescription}>{rec.description}</Text>
              <Text style={styles.recommendationAction}>💡 {rec.action}</Text>
            </View>
          ))}
        </View>
      )}

      <View style={styles.actionButtons}>
        <TouchableOpacity
          style={styles.primaryButton}
          onPress={() => navigation.navigate('ProgressTracker', { careerMap, intakeData })}
        >
          <Ionicons name="checkmark-circle" size={24} color="white" />
          <Text style={styles.primaryButtonText}>Start Progress Tracking</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.secondaryButton}
          onPress={() => navigation.navigate('MentorReview', { careerMap, intakeData })}
        >
          <Ionicons name="people" size={24} color="#667eea" />
          <Text style={styles.secondaryButtonText}>Request Mentor Review</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  errorText: {
    fontSize: 18,
    color: '#666',
    marginVertical: 20,
    textAlign: 'center',
  },
  backButton: {
    backgroundColor: '#667eea',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 8,
  },
  backButtonText: {
    color: 'white',
    fontWeight: '600',
  },
  header: {
    alignItems: 'center',
    padding: 30,
    backgroundColor: 'white',
    marginBottom: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    marginTop: 10,
    marginBottom: 5,
  },
  subtitle: {
    fontSize: 16,
    color: '#667eea',
    textAlign: 'center',
    fontWeight: '600',
  },
  section: {
    backgroundColor: 'white',
    margin: 10,
    padding: 20,
    borderRadius: 12,
    marginBottom: 15,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 15,
    flexDirection: 'row',
    alignItems: 'center',
  },
  skillCategory: {
    marginBottom: 15,
  },
  skillCategoryHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  skillIndicator: {
    width: 12,
    height: 12,
    borderRadius: 6,
    marginRight: 8,
  },
  skillCategoryTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
  },
  skillsList: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  skillChip: {
    backgroundColor: '#f0f4ff',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 15,
    margin: 2,
  },
  skillText: {
    fontSize: 14,
    color: '#667eea',
  },
  weekSelector: {
    marginBottom: 20,
  },
  weekTab: {
    backgroundColor: '#f0f4ff',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 20,
    marginRight: 10,
  },
  selectedWeekTab: {
    backgroundColor: '#667eea',
  },
  weekTabText: {
    fontSize: 14,
    color: '#667eea',
    fontWeight: '600',
  },
  selectedWeekTabText: {
    color: 'white',
  },
  weekDetails: {
    backgroundColor: '#f8f9fa',
    padding: 15,
    borderRadius: 10,
  },
  weekTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 15,
  },
  weekSection: {
    marginBottom: 15,
  },
  weekSectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 8,
  },
  weekItem: {
    fontSize: 14,
    color: '#666',
    marginBottom: 4,
    paddingLeft: 10,
  },
  deliverable: {
    fontSize: 14,
    color: '#667eea',
    fontWeight: '600',
    backgroundColor: '#f0f4ff',
    padding: 10,
    borderRadius: 8,
  },
  capstoneCard: {
    backgroundColor: '#f0f4ff',
    padding: 20,
    borderRadius: 12,
    borderLeftWidth: 4,
    borderLeftColor: '#667eea',
  },
  capstoneTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#667eea',
    marginBottom: 10,
  },
  capstoneOutcome: {
    fontSize: 14,
    color: '#666',
    marginBottom: 15,
    fontStyle: 'italic',
  },
  capstoneStepsTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 10,
  },
  capstoneStep: {
    fontSize: 14,
    color: '#333',
    marginBottom: 6,
    paddingLeft: 10,
  },
  careerOverviewCard: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 20,
    borderLeftWidth: 4,
    borderLeftColor: '#667eea',
  },
  targetRole: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1a202c',
    marginBottom: 15,
  },
  careerDetails: {
    fontSize: 14,
    color: '#4a5568',
    marginBottom: 5,
    textTransform: 'capitalize',
  },
  marketInsights: {
    marginTop: 15,
    padding: 15,
    backgroundColor: '#f7fafc',
    borderRadius: 8,
  },
  marketInsightsTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#2d3748',
    marginBottom: 8,
  },
  marketDetail: {
    fontSize: 13,
    color: '#4a5568',
    marginBottom: 4,
  },
  recommendationCard: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 15,
    marginBottom: 10,
    borderLeftWidth: 3,
    borderLeftColor: '#fbbf24',
  },
  recommendationTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1a202c',
    marginBottom: 8,
  },
  recommendationDescription: {
    fontSize: 14,
    color: '#4a5568',
    marginBottom: 8,
    lineHeight: 20,
  },
  recommendationAction: {
    fontSize: 13,
    color: '#d97706',
    fontStyle: 'italic',
  },
  actionButtons: {
    padding: 20,
    paddingBottom: 40,
  },
  primaryButton: {
    backgroundColor: '#667eea',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 15,
    borderRadius: 12,
    marginBottom: 15,
  },
  primaryButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '700',
    marginLeft: 10,
  },
  secondaryButton: {
    backgroundColor: 'white',
    borderWidth: 2,
    borderColor: '#667eea',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 15,
    borderRadius: 12,
  },
  secondaryButtonText: {
    color: '#667eea',
    fontSize: 16,
    fontWeight: '700',
    marginLeft: 10,
  },
  noDataText: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    fontStyle: 'italic',
    marginVertical: 20,
  },
});
