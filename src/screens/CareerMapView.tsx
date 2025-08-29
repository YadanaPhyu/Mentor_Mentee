import React, { useState } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  ScrollView, 
  TouchableOpacity,
  FlatList,
  Linking
} from 'react-native';

interface SkillGap {
  name: string;
  priority: 'high' | 'medium' | 'low';
  resources: string[];
}

interface Milestone {
  week: number;
  title: string;
  tasks: string[];
}

interface MarketInsights {
  salaryRange: string;
  growthTrend: string;
  topSkillsInDemand: string[];
  recommendedCertifications: string[];
}

interface CapstoneProject {
  title: string;
  description: string;
  deliverables: string[];
}

interface CareerMapData {
  targetRole: string;
  currentExperience: string;
  skillGaps: SkillGap[];
  timeline: {
    duration: string;
    milestones: Milestone[];
  };
  marketInsights: MarketInsights;
  capstoneProject: CapstoneProject;
}

type CareerMapViewProps = {
  navigation: any;
  route: {
    params: {
      careerMapData: CareerMapData;
    }
  };
};

const CareerMapView: React.FC<CareerMapViewProps> = ({ navigation, route }) => {
  const { careerMapData } = route.params;
  const [activeTab, setActiveTab] = useState('timeline');

  const renderPriorityBadge = (priority: string) => {
    let badgeStyle = styles.badgeMedium;
    let textStyle = styles.badgeTextMedium;
    
    if (priority === 'high') {
      badgeStyle = styles.badgeHigh;
      textStyle = styles.badgeTextHigh;
    } else if (priority === 'low') {
      badgeStyle = styles.badgeLow;
      textStyle = styles.badgeTextLow;
    }
    
    return (
      <View style={badgeStyle}>
        <Text style={textStyle}>{priority}</Text>
      </View>
    );
  };

  const renderSkillGaps = () => (
    <View style={styles.contentSection}>
      <Text style={styles.sectionTitle}>Skill Gaps to Address</Text>
      {careerMapData.skillGaps.map((skill, index) => (
        <View key={index} style={styles.skillGapItem}>
          <View style={styles.skillGapHeader}>
            <Text style={styles.skillGapName}>{skill.name}</Text>
            {renderPriorityBadge(skill.priority)}
          </View>
          <Text style={styles.resourcesTitle}>Recommended Resources:</Text>
          {skill.resources.map((resource, idx) => (
            <Text key={idx} style={styles.resourceItem}>• {resource}</Text>
          ))}
        </View>
      ))}
    </View>
  );

  const renderTimeline = () => (
    <View style={styles.contentSection}>
      <Text style={styles.sectionTitle}>
        {careerMapData.timeline.duration} Learning Path
      </Text>
      
      {careerMapData.timeline.milestones.map((milestone, index) => (
        <View key={index} style={styles.milestoneItem}>
          <View style={styles.milestoneHeader}>
            <View style={styles.weekBadge}>
              <Text style={styles.weekNumber}>Week {milestone.week}</Text>
            </View>
            <Text style={styles.milestoneTitle}>{milestone.title}</Text>
          </View>
          
          <View style={styles.tasksList}>
            {milestone.tasks.map((task, idx) => (
              <View key={idx} style={styles.taskItem}>
                <View style={styles.taskBullet} />
                <Text style={styles.taskText}>{task}</Text>
              </View>
            ))}
          </View>
        </View>
      ))}
    </View>
  );

  const renderMarketInsights = () => (
    <View style={styles.contentSection}>
      <Text style={styles.sectionTitle}>Market Insights</Text>
      
      <View style={styles.insightItem}>
        <Text style={styles.insightLabel}>Average Salary Range:</Text>
        <Text style={styles.insightValue}>{careerMapData.marketInsights.salaryRange}</Text>
      </View>
      
      <View style={styles.insightItem}>
        <Text style={styles.insightLabel}>Growth Trend:</Text>
        <Text style={styles.insightValue}>{careerMapData.marketInsights.growthTrend}</Text>
      </View>
      
      <View style={styles.insightItem}>
        <Text style={styles.insightLabel}>Top Skills in Demand:</Text>
        <View style={styles.tagContainer}>
          {careerMapData.marketInsights.topSkillsInDemand.map((skill, idx) => (
            <View key={idx} style={styles.tag}>
              <Text style={styles.tagText}>{skill}</Text>
            </View>
          ))}
        </View>
      </View>
      
      <View style={styles.insightItem}>
        <Text style={styles.insightLabel}>Recommended Certifications:</Text>
        {careerMapData.marketInsights.recommendedCertifications.map((cert, idx) => (
          <Text key={idx} style={styles.certItem}>• {cert}</Text>
        ))}
      </View>
    </View>
  );

  const renderCapstoneProject = () => (
    <View style={styles.contentSection}>
      <Text style={styles.sectionTitle}>Capstone Project</Text>
      
      <Text style={styles.projectTitle}>{careerMapData.capstoneProject.title}</Text>
      <Text style={styles.projectDescription}>{careerMapData.capstoneProject.description}</Text>
      
      <Text style={styles.deliverablesSectionTitle}>Project Deliverables:</Text>
      {careerMapData.capstoneProject.deliverables.map((deliverable, idx) => (
        <View key={idx} style={styles.deliverableItem}>
          <Text style={styles.deliverableNumber}>{idx + 1}.</Text>
          <Text style={styles.deliverableText}>{deliverable}</Text>
        </View>
      ))}

      <TouchableOpacity style={styles.findMentorButton} onPress={() => navigation.navigate('MentorSearch')}>
        <Text style={styles.findMentorText}>Find a Mentor for Guidance</Text>
      </TouchableOpacity>
    </View>
  );

  const renderActiveTabContent = () => {
    switch (activeTab) {
      case 'timeline':
        return renderTimeline();
      case 'skills':
        return renderSkillGaps();
      case 'market':
        return renderMarketInsights();
      case 'project':
        return renderCapstoneProject();
      default:
        return renderTimeline();
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Career Roadmap</Text>
        <Text style={styles.targetRole}>{careerMapData.targetRole}</Text>
      </View>
      
      <View style={styles.tabs}>
        <TouchableOpacity 
          style={[styles.tab, activeTab === 'timeline' && styles.activeTab]} 
          onPress={() => setActiveTab('timeline')}
        >
          <Text style={[styles.tabText, activeTab === 'timeline' && styles.activeTabText]}>Timeline</Text>
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={[styles.tab, activeTab === 'skills' && styles.activeTab]} 
          onPress={() => setActiveTab('skills')}
        >
          <Text style={[styles.tabText, activeTab === 'skills' && styles.activeTabText]}>Skills</Text>
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={[styles.tab, activeTab === 'market' && styles.activeTab]} 
          onPress={() => setActiveTab('market')}
        >
          <Text style={[styles.tabText, activeTab === 'market' && styles.activeTabText]}>Market</Text>
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={[styles.tab, activeTab === 'project' && styles.activeTab]} 
          onPress={() => setActiveTab('project')}
        >
          <Text style={[styles.tabText, activeTab === 'project' && styles.activeTabText]}>Project</Text>
        </TouchableOpacity>
      </View>
      
      <ScrollView style={styles.content}>
        {renderActiveTabContent()}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  header: {
    backgroundColor: '#339af0',
    paddingTop: 60,
    paddingBottom: 24,
    paddingHorizontal: 16,
    borderBottomRightRadius: 24,
    borderBottomLeftRadius: 24,
  },
  title: {
    fontSize: 18,
    color: '#fff',
    fontWeight: '600',
    marginBottom: 8,
  },
  targetRole: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#fff',
  },
  tabs: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    paddingVertical: 12,
    paddingHorizontal: 8,
    justifyContent: 'space-between',
    borderRadius: 12,
    marginHorizontal: 16,
    marginTop: -20,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  tab: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 8,
  },
  activeTab: {
    backgroundColor: '#edf2ff',
    borderRadius: 8,
  },
  tabText: {
    color: '#666',
    fontWeight: '500',
  },
  activeTabText: {
    color: '#339af0',
    fontWeight: 'bold',
  },
  content: {
    flex: 1,
    padding: 16,
  },
  contentSection: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 16,
    color: '#333',
  },
  skillGapItem: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
  },
  skillGapHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  skillGapName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    flex: 1,
  },
  badgeHigh: {
    backgroundColor: '#ffe3e3',
    paddingVertical: 4,
    paddingHorizontal: 8,
    borderRadius: 6,
  },
  badgeTextHigh: {
    color: '#ff6b6b',
    fontWeight: '600',
    fontSize: 12,
  },
  badgeMedium: {
    backgroundColor: '#fff9db',
    paddingVertical: 4,
    paddingHorizontal: 8,
    borderRadius: 6,
  },
  badgeTextMedium: {
    color: '#fab005',
    fontWeight: '600',
    fontSize: 12,
  },
  badgeLow: {
    backgroundColor: '#e6fcf5',
    paddingVertical: 4,
    paddingHorizontal: 8,
    borderRadius: 6,
  },
  badgeTextLow: {
    color: '#0ca678',
    fontWeight: '600',
    fontSize: 12,
  },
  resourcesTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 8,
    color: '#555',
  },
  resourceItem: {
    fontSize: 14,
    color: '#666',
    marginBottom: 4,
    paddingLeft: 4,
  },
  milestoneItem: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
  },
  milestoneHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  weekBadge: {
    backgroundColor: '#339af0',
    paddingVertical: 4,
    paddingHorizontal: 8,
    borderRadius: 6,
    marginRight: 12,
  },
  weekNumber: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 12,
  },
  milestoneTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  tasksList: {
    marginTop: 4,
  },
  taskItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  taskBullet: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#339af0',
    marginTop: 6,
    marginRight: 8,
  },
  taskText: {
    fontSize: 14,
    color: '#555',
    flex: 1,
  },
  insightItem: {
    marginBottom: 16,
  },
  insightLabel: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 8,
  },
  insightValue: {
    fontSize: 16,
    color: '#555',
  },
  tagContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginTop: 4,
  },
  tag: {
    backgroundColor: '#e7f5ff',
    borderRadius: 16,
    paddingVertical: 6,
    paddingHorizontal: 12,
    marginRight: 8,
    marginBottom: 8,
  },
  tagText: {
    color: '#339af0',
    fontSize: 14,
  },
  certItem: {
    fontSize: 14,
    color: '#555',
    marginBottom: 6,
    paddingLeft: 4,
  },
  projectTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 8,
  },
  projectDescription: {
    fontSize: 16,
    color: '#555',
    marginBottom: 16,
    lineHeight: 22,
  },
  deliverablesSectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 12,
    color: '#444',
  },
  deliverableItem: {
    flexDirection: 'row',
    marginBottom: 8,
  },
  deliverableNumber: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#339af0',
    width: 24,
  },
  deliverableText: {
    fontSize: 14,
    color: '#555',
    flex: 1,
  },
  findMentorButton: {
    backgroundColor: '#339af0',
    borderRadius: 8,
    paddingVertical: 14,
    paddingHorizontal: 20,
    alignItems: 'center',
    marginTop: 20,
  },
  findMentorText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
});

export default CareerMapView;