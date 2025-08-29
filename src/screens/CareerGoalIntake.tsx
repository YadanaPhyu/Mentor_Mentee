import React, { useState } from 'react';
import { 
  View, 
  Text, 
  TextInput, 
  TouchableOpacity, 
  StyleSheet, 
  ScrollView,
  ActivityIndicator,
  Alert
} from 'react-native';
import { Picker } from '@react-native-picker/picker';

type CareerGoalIntakeProps = {
  navigation: any;
};

interface SkillItem {
  name: string;
  level: 'beginner' | 'intermediate' | 'advanced';
}

const CareerGoalIntake: React.FC<CareerGoalIntakeProps> = ({ navigation }) => {
  const [targetRole, setTargetRole] = useState('');
  const [currentExperience, setCurrentExperience] = useState('');
  const [timeFrame, setTimeFrame] = useState('8_weeks');
  const [skills, setSkills] = useState<SkillItem[]>([
    { name: '', level: 'beginner' }
  ]);
  const [loading, setLoading] = useState(false);

  const addSkill = () => {
    setSkills([...skills, { name: '', level: 'beginner' }]);
  };

  const updateSkill = (index: number, field: 'name' | 'level', value: string) => {
    const updatedSkills = [...skills];
    updatedSkills[index] = { 
      ...updatedSkills[index], 
      [field]: field === 'level' ? value as 'beginner' | 'intermediate' | 'advanced' : value 
    };
    setSkills(updatedSkills);
  };

  const removeSkill = (index: number) => {
    if (skills.length > 1) {
      const updatedSkills = skills.filter((_, i) => i !== index);
      setSkills(updatedSkills);
    }
  };

  const handleSubmit = async () => {
    if (!targetRole) {
      Alert.alert('Please enter a target role');
      return;
    }

    setLoading(true);

    try {
      // In a real implementation, this would call an AI service
      // For now we'll simulate a response with mock data
      const careerMapData = generateMockCareerMapData(targetRole, currentExperience, skills, timeFrame);
      
      setTimeout(() => {
        setLoading(false);
        navigation.navigate('CareerMapView', { careerMapData });
      }, 1500);
    } catch (error) {
      setLoading(false);
      Alert.alert('Error', 'Failed to generate career map. Please try again.');
    }
  };

  // Generate mock data for demo purposes
  const generateMockCareerMapData = (
    role: string, 
    experience: string, 
    currentSkills: SkillItem[], 
    timeframe: string
  ) => {
    return {
      targetRole: role,
      currentExperience: experience || 'Not specified',
      skillGaps: [
        { name: 'Technical Writing', priority: 'high', resources: ['Udemy Course: Technical Documentation', 'Google Technical Writing Guide'] },
        { name: 'System Design', priority: 'medium', resources: ['System Design Interview Book', 'Architecture Patterns Course'] },
        { name: 'Leadership', priority: 'medium', resources: ['Team Leadership Workshop', 'Mentorship Program'] }
      ],
      timeline: {
        duration: timeframe === '8_weeks' ? '8 weeks' : '12 weeks',
        milestones: [
          { 
            week: 1, 
            title: 'Assessment & Planning', 
            tasks: ['Complete skill assessment', 'Set specific career goals', 'Create learning schedule'] 
          },
          { 
            week: 2, 
            title: 'Foundation Skills', 
            tasks: ['Begin Technical Writing course', 'Read first chapters of System Design book', 'Identify leadership opportunities'] 
          },
          { 
            week: 4, 
            title: 'Mid-point Review', 
            tasks: ['Complete Technical Writing assessment', 'Begin System Design exercises', 'Schedule leadership workshop'] 
          },
          { 
            week: 8, 
            title: 'Final Review & Next Steps', 
            tasks: ['Complete portfolio updates', 'Finalize capstone project', 'Prepare for interviews'] 
          }
        ]
      },
      marketInsights: {
        salaryRange: '$80,000 - $120,000',
        growthTrend: 'Growing 15% annually',
        topSkillsInDemand: ['Technical Communication', 'Project Management', 'Cloud Architecture'],
        recommendedCertifications: ['AWS Solutions Architect', 'PMP', 'Google Cloud Professional']
      },
      capstoneProject: {
        title: `${role} Portfolio Project`,
        description: `Develop a comprehensive project demonstrating your skills as a ${role}`,
        deliverables: ['Project documentation', 'Implementation code/design', 'Presentation video']
      }
    };
  };

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.title}>Career Goal Assessment</Text>
      <Text style={styles.subtitle}>Let's create your personalized career roadmap</Text>
      
      <View style={styles.formGroup}>
        <Text style={styles.label}>What is your target role?</Text>
        <TextInput
          style={styles.input}
          value={targetRole}
          onChangeText={setTargetRole}
          placeholder="e.g., Senior Software Engineer, Product Manager"
        />
      </View>
      
      <View style={styles.formGroup}>
        <Text style={styles.label}>Describe your current experience (optional)</Text>
        <TextInput
          style={[styles.input, styles.textArea]}
          value={currentExperience}
          onChangeText={setCurrentExperience}
          placeholder="Your current role, years of experience, etc."
          multiline
          numberOfLines={4}
        />
      </View>

      <View style={styles.formGroup}>
        <Text style={styles.label}>Timeline</Text>
        <View style={styles.pickerContainer}>
          <Picker
            selectedValue={timeFrame}
            onValueChange={(value) => setTimeFrame(value)}
            style={styles.picker}
          >
            <Picker.Item label="8 Weeks" value="8_weeks" />
            <Picker.Item label="12 Weeks" value="12_weeks" />
          </Picker>
        </View>
      </View>

      <Text style={styles.sectionTitle}>Your Current Skills</Text>
      
      {skills.map((skill, index) => (
        <View key={index} style={styles.skillRow}>
          <View style={styles.skillNameContainer}>
            <TextInput
              style={styles.skillInput}
              value={skill.name}
              onChangeText={(value) => updateSkill(index, 'name', value)}
              placeholder="Skill name"
            />
          </View>
          
          <View style={styles.skillLevelContainer}>
            <Picker
              selectedValue={skill.level}
              onValueChange={(value) => updateSkill(index, 'level', value)}
              style={styles.skillLevelPicker}
            >
              <Picker.Item label="Beginner" value="beginner" />
              <Picker.Item label="Intermediate" value="intermediate" />
              <Picker.Item label="Advanced" value="advanced" />
            </Picker>
          </View>
          
          <TouchableOpacity 
            style={styles.removeButton} 
            onPress={() => removeSkill(index)}
          >
            <Text style={styles.removeButtonText}>-</Text>
          </TouchableOpacity>
        </View>
      ))}
      
      <TouchableOpacity style={styles.addButton} onPress={addSkill}>
        <Text style={styles.addButtonText}>+ Add Skill</Text>
      </TouchableOpacity>
      
      <TouchableOpacity 
        style={styles.submitButton} 
        onPress={handleSubmit}
        disabled={loading}
      >
        {loading ? (
          <ActivityIndicator color="#fff" />
        ) : (
          <Text style={styles.submitButtonText}>Generate Career Map</Text>
        )}
      </TouchableOpacity>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: '#f5f5f5',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 8,
    color: '#333',
  },
  subtitle: {
    fontSize: 16,
    marginBottom: 24,
    color: '#666',
  },
  formGroup: {
    marginBottom: 20,
  },
  label: {
    fontSize: 16,
    marginBottom: 8,
    color: '#444',
  },
  input: {
    backgroundColor: '#fff',
    borderRadius: 8,
    padding: 12,
    borderWidth: 1,
    borderColor: '#ddd',
    fontSize: 16,
  },
  textArea: {
    height: 100,
    textAlignVertical: 'top',
  },
  pickerContainer: {
    backgroundColor: '#fff',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#ddd',
    overflow: 'hidden',
  },
  picker: {
    height: 50,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginTop: 16,
    marginBottom: 16,
    color: '#333',
  },
  skillRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  skillNameContainer: {
    flex: 2,
    marginRight: 8,
  },
  skillInput: {
    backgroundColor: '#fff',
    borderRadius: 8,
    padding: 12,
    borderWidth: 1,
    borderColor: '#ddd',
    fontSize: 16,
  },
  skillLevelContainer: {
    flex: 1.5,
    backgroundColor: '#fff',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#ddd',
    overflow: 'hidden',
    marginRight: 8,
  },
  skillLevelPicker: {
    height: 50,
  },
  removeButton: {
    backgroundColor: '#ff6b6b',
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
  },
  removeButtonText: {
    color: '#fff',
    fontSize: 20,
    fontWeight: 'bold',
  },
  addButton: {
    backgroundColor: '#4dabf7',
    borderRadius: 8,
    padding: 12,
    alignItems: 'center',
    marginBottom: 20,
    marginTop: 8,
  },
  addButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  submitButton: {
    backgroundColor: '#339af0',
    borderRadius: 8,
    padding: 16,
    alignItems: 'center',
    marginBottom: 40,
  },
  submitButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
});

export default CareerGoalIntake;