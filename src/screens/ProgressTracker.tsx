import React, { useState, useEffect } from 'react';
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
import careerMapClient from '../services/careerMapClient';

interface Props {
  route: {
    params: {
      careerMap: CareerMap;
      intakeData: CareerIntakeData;
    };
  };
  navigation: any;
}

export default function ProgressTracker({ route, navigation }: Props) {
  const { careerMap, intakeData } = route.params;
  const [progress, setProgress] = useState<ProgressItem[]>([]);
  const [isRegenerating, setIsRegenerating] = useState(false);

  useEffect(() => {
    // Initialize progress tracking
    initializeProgress();
  }, []);

  const initializeProgress = () => {
    const initialProgress: ProgressItem[] = [];
    careerMap.weeklyPlan.forEach(week => {
      week.goals.forEach((goal, goalIndex) => {
        initialProgress.push({
          week: week.week,
          goalIndex,
          completed: false
        });
      });
    });
    setProgress(initialProgress);
  };

  const toggleGoalCompletion = (week: number, goalIndex: number) => {
    setProgress(prevProgress => 
      prevProgress.map(item => 
        item.week === week && item.goalIndex === goalIndex
          ? { 
              ...item, 
              completed: !item.completed,
              completedDate: !item.completed ? new Date().toISOString() : undefined
            }
          : item
      )
    );
  };

  const getWeekProgress = (weekNumber: number) => {
    const weekItems = progress.filter(item => item.week === weekNumber);
    const completedItems = weekItems.filter(item => item.completed);
    return {
      total: weekItems.length,
      completed: completedItems.length,
      percentage: weekItems.length > 0 ? (completedItems.length / weekItems.length) * 100 : 0
    };
  };

  const getOverallProgress = () => {
    const totalItems = progress.length;
    const completedItems = progress.filter(item => item.completed).length;
    return {
      total: totalItems,
      completed: completedItems,
      percentage: totalItems > 0 ? (completedItems / totalItems) * 100 : 0
    };
  };

  const regeneratePlan = async () => {
    Alert.alert(
      'Regenerate Plan',
      'This will create a new learning plan based on your current progress. Continue?',
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Regenerate', 
          onPress: async () => {
            setIsRegenerating(true);
            try {
              const newCareerMap = await careerMapClient.regeneratePlan(progress, intakeData);
              navigation.replace('CareerMapView', { 
                careerMap: newCareerMap, 
                intakeData 
              });
            } catch (error) {
              Alert.alert('Error', 'Failed to regenerate plan. Please try again.');
            } finally {
              setIsRegenerating(false);
            }
          }
        }
      ]
    );
  };

  const WeekProgressCard = ({ weekNumber }: { weekNumber: number }) => {
    const week = careerMap.weeklyPlan.find(w => w.week === weekNumber);
    const weekProgress = getWeekProgress(weekNumber);
    
    if (!week) return null;

    return (
      <View style={styles.weekCard}>
        <View style={styles.weekHeader}>
          <View style={styles.weekTitleContainer}>
            <Text style={styles.weekTitle}>Week {weekNumber}</Text>
            <View style={styles.progressBadge}>
              <Text style={styles.progressBadgeText}>
                {weekProgress.completed}/{weekProgress.total}
              </Text>
            </View>
          </View>
          <View style={styles.progressBar}>
            <View 
              style={[
                styles.progressFill, 
                { width: `${weekProgress.percentage}%` }
              ]} 
            />
          </View>
        </View>

        <View style={styles.goalsContainer}>
          {week.goals.map((goal, goalIndex) => {
            const progressItem = progress.find(
              p => p.week === weekNumber && p.goalIndex === goalIndex
            );
            const isCompleted = progressItem?.completed || false;

            return (
              <TouchableOpacity
                key={goalIndex}
                style={[styles.goalItem, isCompleted && styles.completedGoal]}
                onPress={() => toggleGoalCompletion(weekNumber, goalIndex)}
              >
                <Ionicons 
                  name={isCompleted ? 'checkmark-circle' : 'ellipse-outline'} 
                  size={24} 
                  color={isCompleted ? '#4CAF50' : '#ccc'} 
                />
                <Text style={[
                  styles.goalText, 
                  isCompleted && styles.completedGoalText
                ]}>
                  {goal}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>

        <View style={styles.deliverableContainer}>
          <Text style={styles.deliverableLabel}>Week Deliverable:</Text>
          <Text style={styles.deliverableText}>{week.deliverable}</Text>
        </View>
      </View>
    );
  };

  const overallProgress = getOverallProgress();

  return (
    <ScrollView style={styles.container}>
      {/* Overall Progress */}
      <View style={styles.overallProgressCard}>
        <Text style={styles.overallProgressTitle}>
          <Ionicons name="analytics" size={24} color="#667eea" /> Overall Progress
        </Text>
        
        <View style={styles.overallProgressContent}>
          <View style={styles.progressCircle}>
            <Text style={styles.progressPercentage}>
              {Math.round(overallProgress.percentage)}%
            </Text>
          </View>
          
          <View style={styles.progressStats}>
            <Text style={styles.progressStatsText}>
              {overallProgress.completed} of {overallProgress.total} goals completed
            </Text>
            <Text style={styles.progressStatsSubtext}>
              Keep going! You're making great progress.
            </Text>
          </View>
        </View>

        <View style={styles.overallProgressBar}>
          <View 
            style={[
              styles.overallProgressFill, 
              { width: `${overallProgress.percentage}%` }
            ]} 
          />
        </View>
      </View>

      {/* Weekly Progress */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>
          <Ionicons name="calendar" size={24} color="#667eea" /> Weekly Progress
        </Text>
        
        {careerMap.weeklyPlan.map(week => (
          <WeekProgressCard key={week.week} weekNumber={week.week} />
        ))}
      </View>

      {/* Action Buttons */}
      <View style={styles.actionSection}>
        <TouchableOpacity 
          style={[styles.regenerateButton, isRegenerating && styles.disabledButton]}
          onPress={regeneratePlan}
          disabled={isRegenerating}
        >
          {isRegenerating ? (
            <Ionicons name="sync" size={24} color="white" />
          ) : (
            <Ionicons name="refresh" size={24} color="#667eea" />
          )}
          <Text style={[
            styles.regenerateButtonText,
            isRegenerating && styles.disabledButtonText
          ]}>
            {isRegenerating ? 'Regenerating Plan...' : 'Regenerate Plan'}
          </Text>
        </TouchableOpacity>

        <TouchableOpacity 
          style={styles.mentorReviewButton}
          onPress={() => navigation.navigate('MentorReview', { careerMap, intakeData, progress })}
        >
          <Ionicons name="person" size={24} color="white" />
          <Text style={styles.mentorReviewButtonText}>
            Request Mentor Review
          </Text>
        </TouchableOpacity>
      </View>

      {/* Tips Section */}
      <View style={styles.tipsSection}>
        <Text style={styles.tipsTitle}>
          <Ionicons name="bulb" size={20} color="#ffa726" /> Progress Tips
        </Text>
        <Text style={styles.tipsText}>
          • Mark goals as complete as you finish them{'\n'}
          • Review your deliverables weekly{'\n'}
          • Don't hesitate to regenerate your plan if needed{'\n'}
          • Request mentor reviews for guidance{'\n'}
          • Stay consistent with your learning schedule
        </Text>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  overallProgressCard: {
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
  overallProgressTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 20,
    flexDirection: 'row',
    alignItems: 'center',
  },
  overallProgressContent: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },
  progressCircle: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#667eea',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 20,
  },
  progressPercentage: {
    fontSize: 20,
    fontWeight: 'bold',
    color: 'white',
  },
  progressStats: {
    flex: 1,
  },
  progressStatsText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 5,
  },
  progressStatsSubtext: {
    fontSize: 14,
    color: '#666',
  },
  overallProgressBar: {
    height: 8,
    backgroundColor: '#e0e0e0',
    borderRadius: 4,
    overflow: 'hidden',
  },
  overallProgressFill: {
    height: '100%',
    backgroundColor: '#667eea',
    borderRadius: 4,
  },
  section: {
    margin: 15,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 15,
    flexDirection: 'row',
    alignItems: 'center',
  },
  weekCard: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 15,
    marginBottom: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  weekHeader: {
    marginBottom: 15,
  },
  weekTitleContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  weekTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  progressBadge: {
    backgroundColor: '#667eea',
    borderRadius: 12,
    paddingHorizontal: 10,
    paddingVertical: 4,
  },
  progressBadgeText: {
    color: 'white',
    fontSize: 12,
    fontWeight: '600',
  },
  progressBar: {
    height: 6,
    backgroundColor: '#e0e0e0',
    borderRadius: 3,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#4CAF50',
    borderRadius: 3,
  },
  goalsContainer: {
    marginBottom: 15,
  },
  goalItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    paddingHorizontal: 4,
  },
  completedGoal: {
    opacity: 0.7,
  },
  goalText: {
    fontSize: 14,
    color: '#333',
    marginLeft: 10,
    flex: 1,
    lineHeight: 18,
  },
  completedGoalText: {
    textDecorationLine: 'line-through',
    color: '#666',
  },
  deliverableContainer: {
    backgroundColor: '#f8f9ff',
    padding: 12,
    borderRadius: 8,
    borderLeftWidth: 3,
    borderLeftColor: '#667eea',
  },
  deliverableLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: '#667eea',
    marginBottom: 4,
  },
  deliverableText: {
    fontSize: 14,
    color: '#333',
    lineHeight: 18,
  },
  actionSection: {
    padding: 20,
    gap: 15,
  },
  regenerateButton: {
    backgroundColor: '#f8f9ff',
    borderWidth: 2,
    borderColor: '#667eea',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 18,
    borderRadius: 12,
  },
  disabledButton: {
    backgroundColor: '#cccccc',
    borderColor: '#cccccc',
  },
  regenerateButtonText: {
    color: '#667eea',
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 10,
  },
  disabledButtonText: {
    color: '#999',
  },
  mentorReviewButton: {
    backgroundColor: '#667eea',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 18,
    borderRadius: 12,
  },
  mentorReviewButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 10,
  },
  tipsSection: {
    backgroundColor: '#fff8e1',
    margin: 15,
    padding: 20,
    borderRadius: 12,
    borderLeftWidth: 4,
    borderLeftColor: '#ffa726',
  },
  tipsTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 10,
    flexDirection: 'row',
    alignItems: 'center',
  },
  tipsText: {
    fontSize: 14,
    color: '#333',
    lineHeight: 20,
  },
});
