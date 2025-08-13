import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';

export default function SimpleCareerMapView({ route, navigation }) {
  const { assessment, careerMap } = route?.params || {};

  // Generate a simple career roadmap based on the assessment
  const generateSimpleRoadmap = (assessment) => {
    if (!assessment) return null;

    const { targetRole, experienceLevel, timeline } = assessment;
    
    // Simple skill recommendations based on role
    const getSkillRecommendations = (role) => {
      const roleKeywords = role.toLowerCase();
      
      if (roleKeywords.includes('software') || roleKeywords.includes('developer') || roleKeywords.includes('engineer')) {
        return ['Programming Languages', 'Version Control (Git)', 'Database Management', 'Testing', 'Problem Solving'];
      } else if (roleKeywords.includes('data') || roleKeywords.includes('analyst')) {
        return ['Statistics', 'Python/R', 'SQL', 'Data Visualization', 'Machine Learning'];
      } else if (roleKeywords.includes('product') || roleKeywords.includes('manager')) {
        return ['Strategic Planning', 'Market Research', 'User Experience', 'Analytics', 'Communication'];
      } else if (roleKeywords.includes('design')) {
        return ['Design Tools', 'User Research', 'Prototyping', 'Visual Design', 'User Experience'];
      } else if (roleKeywords.includes('marketing')) {
        return ['Digital Marketing', 'Content Creation', 'Analytics', 'SEO/SEM', 'Social Media'];
      }
      
      return ['Industry Knowledge', 'Communication', 'Problem Solving', 'Project Management', 'Leadership'];
    };

    // Generate weekly milestones based on timeline
    const generateWeeklyPlan = (timeline, skills) => {
      const weeks = timeline === '1-month' ? 4 : timeline === '3-months' ? 12 : timeline === '6-months' ? 24 : 48;
      const skillsPerWeek = Math.ceil(skills.length / Math.min(weeks, skills.length));
      
      return skills.slice(0, Math.min(6, skills.length)).map((skill, index) => ({
        week: index + 1,
        focus: skill,
        activities: [
          `Study ${skill} fundamentals`,
          `Complete practice exercises`,
          `Work on related project`,
          `Review and assess progress`
        ]
      }));
    };

    const skills = getSkillRecommendations(targetRole);
    const weeklyPlan = generateWeeklyPlan(timeline, skills);

    return {
      skillGaps: skills,
      weeklyPlan: weeklyPlan,
      recommendations: [
        'Start with foundational skills',
        'Build a portfolio project',
        'Network with professionals',
        'Seek mentorship opportunities',
        'Practice regularly and consistently'
      ]
    };
  };

  const roadmap = generateSimpleRoadmap(assessment);

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView style={styles.scrollView}>
        <View style={styles.header}>
          <Ionicons name="map" size={48} color="#667eea" style={styles.icon} />
          <Text style={styles.title}>Your Career Map</Text>
          <Text style={styles.subtitle}>Based on your assessment</Text>
        </View>

        {assessment && (
          <View style={styles.content}>
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Target Role</Text>
              <Text style={styles.sectionContent}>{assessment.targetRole || 'Not specified'}</Text>
            </View>

            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Experience Level</Text>
              <Text style={styles.sectionContent}>{assessment.experienceLevel || 'Not specified'}</Text>
            </View>

            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Timeline</Text>
              <Text style={styles.sectionContent}>{assessment.timeline || 'Not specified'}</Text>
            </View>

            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Learning Style</Text>
              <Text style={styles.sectionContent}>{assessment.learningStyle || 'Not specified'}</Text>
            </View>

            {assessment.currentSkills && (
              <View style={styles.section}>
                <Text style={styles.sectionTitle}>Current Skills</Text>
                <Text style={styles.sectionContent}>{assessment.currentSkills}</Text>
              </View>
            )}

            {assessment.additionalInfo && (
              <View style={styles.section}>
                <Text style={styles.sectionTitle}>Additional Information</Text>
                <Text style={styles.sectionContent}>{assessment.additionalInfo}</Text>
              </View>
            )}

            {roadmap && (
              <>
                <View style={styles.roadmapSection}>
                  <Text style={styles.roadmapTitle}>🎯 Your Career Roadmap</Text>
                  
                  <View style={styles.skillsSection}>
                    <Text style={styles.skillsTitle}>Key Skills to Develop:</Text>
                    {roadmap.skillGaps.map((skill, index) => (
                      <View key={index} style={styles.skillItem}>
                        <Ionicons name="checkmark-circle-outline" size={16} color="#28a745" />
                        <Text style={styles.skillText}>{skill}</Text>
                      </View>
                    ))}
                  </View>

                  <View style={styles.weeklySection}>
                    <Text style={styles.weeklyTitle}>📅 Weekly Learning Plan:</Text>
                    {roadmap.weeklyPlan.map((week, index) => (
                      <View key={index} style={styles.weekItem}>
                        <Text style={styles.weekNumber}>Week {week.week}</Text>
                        <Text style={styles.weekFocus}>Focus: {week.focus}</Text>
                        <View style={styles.activitiesList}>
                          {week.activities.map((activity, actIndex) => (
                            <Text key={actIndex} style={styles.activityText}>• {activity}</Text>
                          ))}
                        </View>
                      </View>
                    ))}
                  </View>

                  <View style={styles.recommendationsSection}>
                    <Text style={styles.recommendationsTitle}>💡 Recommendations:</Text>
                    {roadmap.recommendations.map((rec, index) => (
                      <View key={index} style={styles.recommendationItem}>
                        <Ionicons name="bulb" size={16} color="#ffa726" />
                        <Text style={styles.recommendationText}>{rec}</Text>
                      </View>
                    ))}
                  </View>
                </View>
              </>
            )}

            <View style={styles.aiPlaceholder}>
              <Ionicons name="rocket" size={32} color="#667eea" />
              <Text style={styles.placeholderTitle}>Enhanced AI Features Coming Soon</Text>
              <Text style={styles.placeholderText}>
                Future AI enhancements will include:
                {'\n'}• Real-time market insights
                {'\n'}• Personalized mentor matching
                {'\n'}• Industry salary data
                {'\n'}• Dynamic skill gap analysis
                {'\n'}• AI-powered project recommendations
              </Text>
            </View>
          </View>
        )}

        <TouchableOpacity 
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Ionicons name="arrow-back" size={20} color="#fff" />
          <Text style={styles.backButtonText}>Back to Assessment</Text>
        </TouchableOpacity>
      </ScrollView>
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
    alignItems: 'center',
    padding: 20,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#e1e5e9',
  },
  icon: {
    marginBottom: 12,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: '#666',
  },
  content: {
    padding: 20,
  },
  section: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#e1e5e9',
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 8,
  },
  sectionContent: {
    fontSize: 14,
    color: '#666',
    lineHeight: 20,
  },
  aiPlaceholder: {
    backgroundColor: '#fff3cd',
    borderRadius: 12,
    padding: 20,
    alignItems: 'center',
    marginTop: 20,
    borderWidth: 1,
    borderColor: '#ffeaa7',
  },
  placeholderTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#8b6914',
    marginTop: 12,
    marginBottom: 12,
  },
  placeholderText: {
    fontSize: 14,
    color: '#8b6914',
    textAlign: 'center',
    lineHeight: 20,
  },
  backButton: {
    backgroundColor: '#667eea',
    borderRadius: 12,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    margin: 20,
    marginTop: 30,
  },
  backButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  roadmapSection: {
    marginTop: 20,
  },
  roadmapTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 20,
    textAlign: 'center',
  },
  skillsSection: {
    backgroundColor: '#e8f5e8',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#c3e6c3',
  },
  skillsTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#28a745',
    marginBottom: 12,
  },
  skillItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
    gap: 8,
  },
  skillText: {
    fontSize: 14,
    color: '#155724',
  },
  weeklySection: {
    backgroundColor: '#e3f2fd',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#bbdefb',
  },
  weeklyTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1976d2',
    marginBottom: 12,
  },
  weekItem: {
    backgroundColor: '#fff',
    borderRadius: 8,
    padding: 12,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: '#e1f5fe',
  },
  weekNumber: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1976d2',
  },
  weekFocus: {
    fontSize: 14,
    color: '#333',
    marginBottom: 8,
    fontWeight: '500',
  },
  activitiesList: {
    paddingLeft: 8,
  },
  activityText: {
    fontSize: 12,
    color: '#666',
    marginBottom: 2,
  },
  recommendationsSection: {
    backgroundColor: '#fff3cd',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#ffeaa7',
  },
  recommendationsTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#8b6914',
    marginBottom: 12,
  },
  recommendationItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
    gap: 8,
  },
  recommendationText: {
    fontSize: 14,
    color: '#8b6914',
    flex: 1,
  },
});
