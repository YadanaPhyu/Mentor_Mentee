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
import { CareerMap, CareerIntakeData, ProgressItem } from '../types/careerMap';

interface Props {
  route: {
    params: {
      careerMap: CareerMap;
      intakeData: CareerIntakeData;
      progress?: ProgressItem[];
    };
  };
  navigation: any;
}

export default function MentorReview({ route, navigation }: Props) {
  const { careerMap, intakeData, progress = [] } = route.params;
  const [selectedWeek, setSelectedWeek] = useState(1);

  const getProgressSummary = () => {
    const totalGoals = progress.length;
    const completedGoals = progress.filter(p => p.completed).length;
    const completionRate = totalGoals > 0 ? (completedGoals / totalGoals) * 100 : 0;
    
    return {
      totalGoals,
      completedGoals,
      completionRate: Math.round(completionRate)
    };
  };

  const getWeeklyProgress = (weekNumber: number) => {
    const weekItems = progress.filter(item => item.week === weekNumber);
    const completedItems = weekItems.filter(item => item.completed);
    return {
      total: weekItems.length,
      completed: completedItems.length,
      percentage: weekItems.length > 0 ? Math.round((completedItems.length / weekItems.length) * 100) : 0
    };
  };

  const requestMentorReview = () => {
    Alert.alert(
      'Request Sent!',
      'Your mentor review request has been sent. You will receive feedback within 24-48 hours.',
      [
        { 
          text: 'OK', 
          onPress: () => navigation.goBack()
        }
      ]
    );
  };

  const progressSummary = getProgressSummary();

  return (
    <ScrollView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Ionicons name="person-circle" size={60} color="#667eea" />
        <Text style={styles.headerTitle}>Mentor Review Request</Text>
        <Text style={styles.headerSubtitle}>
          Share your progress with your mentor for personalized feedback
        </Text>
      </View>

      {/* Career Goal Summary */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>
          <Ionicons name="flag" size={20} color="#667eea" /> Career Goal
        </Text>
        <View style={styles.goalCard}>
          <Text style={styles.goalCurrent}>Current: {intakeData.currentRole}</Text>
          <Ionicons name="arrow-forward" size={24} color="#667eea" />
          <Text style={styles.goalTarget}>Target: {intakeData.targetRole}</Text>
        </View>
        <View style={styles.goalDetails}>
          <Text style={styles.goalDetailItem}>
            <Ionicons name="time" size={16} color="#666" /> {intakeData.hoursPerWeek} hours/week
          </Text>
          <Text style={styles.goalDetailItem}>
            <Ionicons name="card" size={16} color="#666" /> ${intakeData.budget} budget
          </Text>
        </View>
      </View>

      {/* Progress Overview */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>
          <Ionicons name="analytics" size={20} color="#667eea" /> Progress Overview
        </Text>
        
        <View style={styles.progressOverviewCard}>
          <View style={styles.progressMetric}>
            <Text style={styles.progressMetricValue}>{progressSummary.completionRate}%</Text>
            <Text style={styles.progressMetricLabel}>Overall Completion</Text>
          </View>
          <View style={styles.progressMetric}>
            <Text style={styles.progressMetricValue}>{progressSummary.completedGoals}</Text>
            <Text style={styles.progressMetricLabel}>Goals Completed</Text>
          </View>
          <View style={styles.progressMetric}>
            <Text style={styles.progressMetricValue}>{selectedWeek}</Text>
            <Text style={styles.progressMetricLabel}>Current Week</Text>
          </View>
        </View>
      </View>

      {/* Skill Progress */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>
          <Ionicons name="school" size={20} color="#667eea" /> Skill Development
        </Text>
        
        <View style={styles.skillProgressCard}>
          <View style={styles.skillCategory}>
            <Text style={styles.skillCategoryTitle}>
              <Ionicons name="checkmark-circle" size={16} color="#4CAF50" /> Strong Skills
            </Text>
            <View style={styles.skillList}>
              {careerMap.gapAnalysis.strong.map((skill, index) => (
                <Text key={index} style={styles.skillItem}>• {skill}</Text>
              ))}
              {careerMap.gapAnalysis.strong.length === 0 && (
                <Text style={styles.noSkillsText}>No strong skills identified yet</Text>
              )}
            </View>
          </View>

          <View style={styles.skillCategory}>
            <Text style={styles.skillCategoryTitle}>
              <Ionicons name="time" size={16} color="#ffa726" /> Developing Skills
            </Text>
            <View style={styles.skillList}>
              {careerMap.gapAnalysis.medium.map((skill, index) => (
                <Text key={index} style={styles.skillItem}>• {skill}</Text>
              ))}
              {careerMap.gapAnalysis.medium.length === 0 && (
                <Text style={styles.noSkillsText}>No developing skills identified</Text>
              )}
            </View>
          </View>

          <View style={styles.skillCategory}>
            <Text style={styles.skillCategoryTitle}>
              <Ionicons name="alert-circle" size={16} color="#f44336" /> Learning Focus
            </Text>
            <View style={styles.skillList}>
              {careerMap.gapAnalysis.missing.map((skill, index) => (
                <Text key={index} style={styles.skillItem}>• {skill}</Text>
              ))}
            </View>
          </View>
        </View>
      </View>

      {/* Weekly Progress Detail */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>
          <Ionicons name="calendar" size={20} color="#667eea" /> Weekly Progress
        </Text>
        
        {/* Week Selector */}
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.weekSelector}>
          {careerMap.weeklyPlan.map(week => {
            const weekProgress = getWeeklyProgress(week.week);
            return (
              <TouchableOpacity
                key={week.week}
                style={[
                  styles.weekSelectorItem,
                  selectedWeek === week.week && styles.selectedWeekSelectorItem
                ]}
                onPress={() => setSelectedWeek(week.week)}
              >
                <Text style={[
                  styles.weekSelectorText,
                  selectedWeek === week.week && styles.selectedWeekSelectorText
                ]}>
                  Week {week.week}
                </Text>
                <Text style={[
                  styles.weekSelectorProgress,
                  selectedWeek === week.week && styles.selectedWeekSelectorProgress
                ]}>
                  {weekProgress.percentage}%
                </Text>
              </TouchableOpacity>
            );
          })}
        </ScrollView>

        {/* Selected Week Details */}
        {(() => {
          const selectedWeekData = careerMap.weeklyPlan.find(w => w.week === selectedWeek);
          const weekProgress = getWeeklyProgress(selectedWeek);
          
          if (!selectedWeekData) return null;
          
          return (
            <View style={styles.weekDetailCard}>
              <View style={styles.weekDetailHeader}>
                <Text style={styles.weekDetailTitle}>Week {selectedWeek} Details</Text>
                <View style={styles.weekDetailProgress}>
                  <Text style={styles.weekDetailProgressText}>
                    {weekProgress.completed}/{weekProgress.total} completed
                  </Text>
                </View>
              </View>

              <View style={styles.weekDetailContent}>
                <Text style={styles.weekDetailSectionTitle}>Goals:</Text>
                {selectedWeekData.goals.map((goal, index) => {
                  const isCompleted = progress.some(
                    p => p.week === selectedWeek && p.goalIndex === index && p.completed
                  );
                  return (
                    <Text key={index} style={styles.weekDetailItem}>
                      <Ionicons 
                        name={isCompleted ? 'checkmark-circle' : 'ellipse-outline'} 
                        size={16} 
                        color={isCompleted ? '#4CAF50' : '#ccc'} 
                      /> {goal}
                    </Text>
                  );
                })}

                <Text style={styles.weekDetailSectionTitle}>Deliverable:</Text>
                <Text style={styles.weekDetailDeliverable}>{selectedWeekData.deliverable}</Text>
              </View>
            </View>
          );
        })()}
      </View>

      {/* Capstone Project */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>
          <Ionicons name="rocket" size={20} color="#667eea" /> Capstone Project
        </Text>
        <View style={styles.capstoneCard}>
          <Text style={styles.capstoneTitle}>{careerMap.capstone.title}</Text>
          <Text style={styles.capstoneDescription}>{careerMap.capstone.expectedOutcome}</Text>
        </View>
      </View>

      {/* Questions for Mentor */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>
          <Ionicons name="help-circle" size={20} color="#667eea" /> Questions for Review
        </Text>
        <View style={styles.questionsCard}>
          <Text style={styles.questionItem}>
            • Am I progressing at the right pace for my {intakeData.hoursPerWeek} hours/week schedule?
          </Text>
          <Text style={styles.questionItem}>
            • Should I adjust my focus on any particular skills?
          </Text>
          <Text style={styles.questionItem}>
            • Are there any additional resources you'd recommend?
          </Text>
          <Text style={styles.questionItem}>
            • How can I better prepare for the capstone project?
          </Text>
          <Text style={styles.questionItem}>
            • What industry connections or opportunities should I be aware of?
          </Text>
        </View>
      </View>

      {/* Action Button */}
      <View style={styles.actionSection}>
        <TouchableOpacity style={styles.requestButton} onPress={requestMentorReview}>
          <Ionicons name="send" size={24} color="white" />
          <Text style={styles.requestButtonText}>Send Review Request</Text>
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
  header: {
    alignItems: 'center',
    padding: 30,
    backgroundColor: 'white',
    marginBottom: 20,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    marginTop: 10,
    marginBottom: 5,
  },
  headerSubtitle: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    lineHeight: 22,
  },
  section: {
    backgroundColor: 'white',
    margin: 15,
    borderRadius: 12,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 15,
    flexDirection: 'row',
    alignItems: 'center',
  },
  goalCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#f8f9ff',
    padding: 15,
    borderRadius: 10,
    marginBottom: 10,
  },
  goalCurrent: {
    fontSize: 14,
    color: '#666',
    fontWeight: '500',
  },
  goalTarget: {
    fontSize: 14,
    color: '#667eea',
    fontWeight: '600',
  },
  goalDetails: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  goalDetailItem: {
    fontSize: 14,
    color: '#666',
    flexDirection: 'row',
    alignItems: 'center',
  },
  progressOverviewCard: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    backgroundColor: '#f8f9ff',
    padding: 20,
    borderRadius: 10,
  },
  progressMetric: {
    alignItems: 'center',
  },
  progressMetricValue: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#667eea',
  },
  progressMetricLabel: {
    fontSize: 12,
    color: '#666',
    marginTop: 5,
    textAlign: 'center',
  },
  skillProgressCard: {
    gap: 15,
  },
  skillCategory: {
    backgroundColor: '#f9f9f9',
    padding: 15,
    borderRadius: 10,
  },
  skillCategoryTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 10,
    flexDirection: 'row',
    alignItems: 'center',
  },
  skillList: {
    gap: 5,
  },
  skillItem: {
    fontSize: 14,
    color: '#666',
  },
  noSkillsText: {
    fontSize: 14,
    color: '#999',
    fontStyle: 'italic',
  },
  weekSelector: {
    marginBottom: 15,
  },
  weekSelectorItem: {
    backgroundColor: '#f0f0f0',
    borderRadius: 20,
    paddingHorizontal: 15,
    paddingVertical: 10,
    marginRight: 10,
    alignItems: 'center',
    minWidth: 80,
  },
  selectedWeekSelectorItem: {
    backgroundColor: '#667eea',
  },
  weekSelectorText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#666',
  },
  selectedWeekSelectorText: {
    color: 'white',
  },
  weekSelectorProgress: {
    fontSize: 12,
    color: '#999',
    marginTop: 2,
  },
  selectedWeekSelectorProgress: {
    color: 'rgba(255, 255, 255, 0.8)',
  },
  weekDetailCard: {
    backgroundColor: '#f8f9ff',
    borderRadius: 10,
    padding: 15,
  },
  weekDetailHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 15,
  },
  weekDetailTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
  },
  weekDetailProgress: {
    backgroundColor: '#667eea',
    borderRadius: 15,
    paddingHorizontal: 10,
    paddingVertical: 5,
  },
  weekDetailProgressText: {
    color: 'white',
    fontSize: 12,
    fontWeight: '600',
  },
  weekDetailContent: {
    gap: 10,
  },
  weekDetailSectionTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#667eea',
    marginTop: 10,
  },
  weekDetailItem: {
    fontSize: 14,
    color: '#333',
    flexDirection: 'row',
    alignItems: 'center',
  },
  weekDetailDeliverable: {
    fontSize: 14,
    color: '#333',
    backgroundColor: 'white',
    padding: 10,
    borderRadius: 8,
    borderLeftWidth: 3,
    borderLeftColor: '#667eea',
  },
  capstoneCard: {
    backgroundColor: '#f0f8ff',
    padding: 15,
    borderRadius: 10,
    borderLeftWidth: 4,
    borderLeftColor: '#667eea',
  },
  capstoneTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 8,
  },
  capstoneDescription: {
    fontSize: 14,
    color: '#666',
    lineHeight: 20,
  },
  questionsCard: {
    backgroundColor: '#fff8e1',
    padding: 15,
    borderRadius: 10,
    borderLeftWidth: 4,
    borderLeftColor: '#ffa726',
  },
  questionItem: {
    fontSize: 14,
    color: '#333',
    marginBottom: 8,
    lineHeight: 18,
  },
  actionSection: {
    padding: 20,
  },
  requestButton: {
    backgroundColor: '#667eea',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 18,
    borderRadius: 12,
  },
  requestButtonText: {
    color: 'white',
    fontSize: 18,
    fontWeight: '700',
    marginLeft: 10,
  },
});
