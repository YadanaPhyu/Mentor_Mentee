/**
 * Career Map API Service
 * Handles communication with the /api/career-map endpoint
 */

const API_BASE_URL = (typeof __DEV__ !== 'undefined' && __DEV__) || process.env.NODE_ENV === 'development' 
  ? 'http://localhost:3000' 
  : 'https://your-production-api.com';

class CareerMapApiService {
  /**
   * Generate a career map using the API endpoint
   * @param {Object} assessmentData - User assessment data
   * @returns {Promise<Object>} Career map data
   */
  async generateCareerMap(assessmentData) {
    try {
      console.log('🚀 Sending request to /api/career-map with data:', assessmentData);
      
      const response = await fetch(`${API_BASE_URL}/api/career-map`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
        body: JSON.stringify(assessmentData),
        timeout: 30000, // 30 second timeout
      });

      if (!response.ok) {
        throw new Error(`API Error: ${response.status} ${response.statusText}`);
      }

      const careerMapData = await response.json();
      console.log('✅ Received career map from API:', careerMapData);
      
      return careerMapData;
    } catch (error) {
      console.error('❌ Career Map API Error:', error);
      
      // For development/demo purposes, return a mock response
      if ((typeof __DEV__ !== 'undefined' && __DEV__) || process.env.NODE_ENV === 'development') {
        console.log('🧪 Using mock data for development');
        return this.getMockCareerMap(assessmentData);
      }
      
      throw error;
    }
  }

  /**
   * Mock career map generator for development/fallback
   * This simulates what the API would return
   */
  getMockCareerMap(assessmentData) {
    const { currentRole, targetRole, skillsText, experience, hoursPerWeek } = assessmentData;
    const skills = skillsText.split(',').map(s => s.trim()).filter(Boolean);
    
    // Convert to the format expected by CareerMapView
    return {
      roleSnapshot: {
        title: targetRole,
        level: this.getLevelFromExperience(experience),
        keySkills: this.getRequiredSkills(targetRole).map(skill => skill.name),
        averageSalary: this.generateMarketInsights(targetRole).averageSalary,
        description: `${targetRole} professional with expertise in modern technologies and industry best practices.`,
      },
      gapAnalysis: {
        strong: this.generateStrengths(skills, targetRole),
        medium: this.getMediumSkills(skills, targetRole),
        missing: this.generateGaps(targetRole),
      },
      weeklyPlan: this.generateWeeklyPlan(targetRole, hoursPerWeek),
      capstone: this.generateCapstoneProjectForView(targetRole),
      
      // Additional data for new features (backward compatibility)
      id: `career-map-${Date.now()}`,
      targetRole: targetRole,
      currentRole: currentRole,
      currentSkills: skills,
      generatedAt: new Date().toISOString(),
      aiGenerated: true,
    };
  }

  generateStrengths(skills, targetRole) {
    const commonStrengths = [
      'Strong foundation in problem-solving',
      'Good communication skills',
      'Adaptable to new technologies',
      'Team collaboration experience',
    ];
    
    if (skills && skills.length > 0) {
      commonStrengths.push(`Experience with ${skills.slice(0, 2).join(' and ')}`);
    }
    
    return commonStrengths.slice(0, 3);
  }

  getLevelFromExperience(experience) {
    const levelMap = {
      'entry': 'Entry Level',
      'mid': 'Mid Level', 
      'senior': 'Senior Level'
    };
    return levelMap[experience] || 'Entry Level';
  }

  getMediumSkills(currentSkills, targetRole) {
    const requiredSkills = this.getRequiredSkills(targetRole).map(s => s.name);
    if (!currentSkills || currentSkills.length === 0) return [];
    
    return requiredSkills.filter(skill => 
      currentSkills.some(cs => cs.toLowerCase().includes(skill.toLowerCase().split(' ')[0]))
    ).slice(0, 2);
  }

  generateWeeklyPlan(targetRole, hoursPerWeek) {
    const timeline = this.generateTimeline(targetRole, hoursPerWeek);
    
    return timeline.phases.map(phase => ({
      week: phase.week,
      goals: phase.goals,
      resources: phase.resources,
      deliverable: phase.deliverables[0] || 'Weekly progress update',
    }));
  }

  generateCapstoneProjectForView(targetRole) {
    const capstone = this.generateCapstoneProject(targetRole);
    return {
      title: capstone.title,
      steps: capstone.requirements,
      expectedOutcome: capstone.description,
    };
  }

  generateGaps(targetRole) {
    const roleBasedGaps = {
      'React Native Developer': [
        'Advanced React Native patterns',
        'Mobile app deployment',
        'Native module integration',
      ],
      'Data Scientist': [
        'Machine learning algorithms',
        'Statistical analysis',
        'Data visualization',
      ],
      'Product Manager': [
        'Product strategy development',
        'Market research methodologies',
        'Stakeholder management',
      ],
    };

    return roleBasedGaps[targetRole] || [
      'Industry-specific knowledge',
      'Advanced technical skills',
      'Professional networking',
    ];
  }

  generateSkillGaps(targetRole, currentSkills) {
    const requiredSkills = this.getRequiredSkills(targetRole);
    
    return requiredSkills.map(skill => ({
      skill: skill.name,
      importance: skill.importance,
      currentLevel: currentSkills.some(cs => 
        cs.toLowerCase().includes(skill.name.toLowerCase())
      ) ? Math.floor(Math.random() * 3) + 2 : 0,
      targetLevel: 4,
      resources: skill.resources,
    }));
  }

  getRequiredSkills(targetRole) {
    const skillsMap = {
      'React Native Developer': [
        {
          name: 'React Native',
          importance: 'High',
          resources: ['React Native Documentation', 'Expo Docs', 'YouTube Tutorials'],
        },
        {
          name: 'JavaScript/TypeScript',
          importance: 'High',
          resources: ['MDN Web Docs', 'TypeScript Handbook', 'JavaScript.info'],
        },
        {
          name: 'Mobile UI/UX',
          importance: 'Medium',
          resources: ['Human Interface Guidelines', 'Material Design', 'Figma'],
        },
      ],
      'Data Scientist': [
        {
          name: 'Python',
          importance: 'High',
          resources: ['Python.org', 'Kaggle Learn', 'DataCamp'],
        },
        {
          name: 'Machine Learning',
          importance: 'High',
          resources: ['Scikit-learn', 'TensorFlow', 'Coursera ML Course'],
        },
        {
          name: 'Statistics',
          importance: 'High',
          resources: ['Khan Academy Statistics', 'Statistics Textbooks', 'R Documentation'],
        },
      ],
    };

    return skillsMap[targetRole] || [
      {
        name: 'Core Technical Skills',
        importance: 'High',
        resources: ['Industry Documentation', 'Online Courses', 'Practice Projects'],
      },
      {
        name: 'Communication',
        importance: 'Medium',
        resources: ['Toastmasters', 'Business Writing Courses', 'Presentation Skills'],
      },
      {
        name: 'Problem Solving',
        importance: 'High',
        resources: ['LeetCode', 'HackerRank', 'Real-world Projects'],
      },
    ];
  }

  generateTimeline(targetRole, hoursPerWeek) {
    const basePhases = [
      {
        week: 1,
        title: 'Foundation & Setup',
        goals: ['Set up development environment', 'Learn basic concepts'],
        deliverables: ['Environment setup', 'First practice project'],
        resources: ['Setup guides', 'Introductory tutorials'],
        mentorReview: true,
      },
      {
        week: 2,
        title: 'Core Skills Development',
        goals: ['Master fundamental skills', 'Build practice projects'],
        deliverables: ['Skill assessment', 'Practice project portfolio'],
        resources: ['Advanced tutorials', 'Documentation'],
        mentorReview: false,
      },
      {
        week: 3,
        title: 'Intermediate Concepts',
        goals: ['Learn advanced patterns', 'Apply best practices'],
        deliverables: ['Intermediate project', 'Code review'],
        resources: ['Best practices guides', 'Industry articles'],
        mentorReview: true,
      },
      {
        week: 4,
        title: 'Mid-Point Assessment',
        goals: ['Evaluate progress', 'Identify gaps'],
        deliverables: ['Progress report', 'Skill gap analysis'],
        resources: ['Assessment tools', 'Feedback forms'],
        mentorReview: true,
      },
      {
        week: 5,
        title: 'Specialized Skills',
        goals: ['Focus on role-specific skills', 'Industry knowledge'],
        deliverables: ['Specialized project', 'Industry research'],
        resources: ['Industry reports', 'Specialized courses'],
        mentorReview: false,
      },
      {
        week: 6,
        title: 'Project Integration',
        goals: ['Combine all learned skills', 'Build comprehensive project'],
        deliverables: ['Integrated project', 'Technical documentation'],
        resources: ['Project templates', 'Documentation guides'],
        mentorReview: true,
      },
      {
        week: 7,
        title: 'Capstone Development',
        goals: ['Build portfolio-worthy project', 'Prepare for presentation'],
        deliverables: ['Capstone project', 'Presentation materials'],
        resources: ['Portfolio examples', 'Presentation tools'],
        mentorReview: false,
      },
      {
        week: 8,
        title: 'Final Review & Next Steps',
        goals: ['Complete final review', 'Plan next career steps'],
        deliverables: ['Final portfolio', 'Career action plan'],
        resources: ['Career planning guides', 'Job search resources'],
        mentorReview: true,
      },
    ];

    return {
      totalWeeks: 8,
      hoursPerWeek,
      phases: basePhases,
    };
  }

  generateCapstoneProject(targetRole) {
    const projects = {
      'React Native Developer': {
        title: 'Full-Stack Mobile App',
        description: 'Build a complete mobile application with backend integration',
        requirements: [
          'React Native frontend',
          'API integration',
          'User authentication',
          'Local data storage',
        ],
        deliverables: [
          'Published app on app store',
          'Source code repository',
          'Technical documentation',
          'Demo video',
        ],
      },
      'Data Scientist': {
        title: 'End-to-End ML Project',
        description: 'Complete machine learning project from data collection to deployment',
        requirements: [
          'Data collection and cleaning',
          'Exploratory data analysis',
          'Model development and training',
          'Model deployment',
        ],
        deliverables: [
          'Jupyter notebook with analysis',
          'Deployed ML model',
          'Technical report',
          'Presentation to stakeholders',
        ],
      },
    };

    return projects[targetRole] || {
      title: `Professional ${targetRole} Portfolio Project`,
      description: `Comprehensive project demonstrating ${targetRole} skills`,
      requirements: [
        'Industry-standard practices',
        'Real-world application',
        'Professional documentation',
        'Peer review process',
      ],
      deliverables: [
        'Completed project',
        'Professional documentation',
        'Presentation materials',
        'Reflection report',
      ],
    };
  }

  generateMarketInsights(targetRole) {
    const insights = {
      'React Native Developer': {
        averageSalary: '$75,000 - $120,000',
        jobGrowth: '+22% (Much faster than average)',
        keyCompanies: ['Meta', 'Shopify', 'Airbnb', 'Tesla'],
        emergingTrends: [
          'Cross-platform development',
          'Performance optimization',
          'New architecture patterns',
        ],
      },
      'Data Scientist': {
        averageSalary: '$85,000 - $150,000',
        jobGrowth: '+36% (Much faster than average)',
        keyCompanies: ['Google', 'Amazon', 'Netflix', 'Microsoft'],
        emergingTrends: [
          'MLOps and automation',
          'Ethical AI development',
          'Real-time analytics',
        ],
      },
    };

    return insights[targetRole] || {
      averageSalary: '$50,000 - $100,000',
      jobGrowth: '+10% (Faster than average)',
      keyCompanies: ['Industry leaders', 'Growing companies', 'Startups'],
      emergingTrends: [
        'Digital transformation',
        'Remote work opportunities',
        'Skill specialization',
      ],
    };
  }
}

export default new CareerMapApiService();
