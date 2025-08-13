const express = require('express');
const cors = require('cors');
const app = express();
const PORT = 3000;

// Middleware
app.use(cors());
app.use(express.json());

// Mock AI prompt function
function generateCareerPlanWithAI(assessmentData) {
  const { currentRole, targetRole, currentSkills, experience, hoursPerWeek } = assessmentData;
  
  console.log('🤖 AI Processing:', {
    currentRole,
    targetRole,
    skillCount: currentSkills?.length || 0,
    experience,
    hoursPerWeek
  });

  // Simulate AI processing time
  return new Promise((resolve) => {
    setTimeout(() => {
      // Return data in the format expected by CareerMapView
      resolve({
        roleSnapshot: {
          title: targetRole,
          level: getLevelFromExperience(experience),
          keySkills: getRequiredSkills(targetRole).map(skill => skill.name),
          averageSalary: generateMarketInsights(targetRole).averageSalary,
          description: `${targetRole} professional with expertise in modern technologies and industry best practices.`,
        },
        gapAnalysis: {
          strong: generateStrengths(currentSkills, targetRole),
          medium: getMediumSkills(currentSkills || [], targetRole),
          missing: generateGaps(targetRole),
        },
        weeklyPlan: generateWeeklyPlan(targetRole, hoursPerWeek),
        capstone: generateCapstoneProjectForView(targetRole),
        
        // Additional metadata
        id: `career-map-${Date.now()}`,
        targetRole: targetRole,
        currentRole: currentRole,
        currentSkills: currentSkills || [],
        generatedAt: new Date().toISOString(),
        aiGenerated: true,
      });
    }, 2000); // 2 second delay to simulate AI processing
  });
}

function getLevelFromExperience(experience) {
  const levelMap = {
    'entry': 'Entry Level',
    'mid': 'Mid Level', 
    'senior': 'Senior Level'
  };
  return levelMap[experience] || 'Entry Level';
}

function getMediumSkills(currentSkills, targetRole) {
  const requiredSkills = getRequiredSkills(targetRole).map(s => s.name);
  if (!currentSkills || currentSkills.length === 0) return [];
  
  return requiredSkills.filter(skill => 
    currentSkills.some(cs => cs.toLowerCase().includes(skill.toLowerCase().split(' ')[0]))
  ).slice(0, 2);
}

function generateWeeklyPlan(targetRole, hoursPerWeek) {
  const timeline = generateTimeline(targetRole, hoursPerWeek);
  
  return timeline.phases.map(phase => ({
    week: phase.week,
    goals: phase.goals,
    resources: phase.resources,
    deliverable: phase.deliverables[0] || 'Weekly progress update',
  }));
}

function generateCapstoneProjectForView(targetRole) {
  const capstone = generateCapstoneProject(targetRole);
  return {
    title: capstone.title,
    steps: capstone.requirements,
    expectedOutcome: capstone.description,
  };
}

function generateStrengths(currentSkills, targetRole) {
  const baseStrengths = [
    'Strong motivation for career transition',
    'Willingness to learn new skills',
    'Clear career direction',
  ];
  
  if (currentSkills && currentSkills.length > 0) {
    baseStrengths.push(`Existing foundation in ${currentSkills.slice(0, 2).join(' and ')}`);
  }
  
  // Add role-specific strengths
  if (targetRole.toLowerCase().includes('developer') || targetRole.toLowerCase().includes('engineer')) {
    baseStrengths.push('Technical aptitude and problem-solving mindset');
  } else if (targetRole.toLowerCase().includes('manager') || targetRole.toLowerCase().includes('lead')) {
    baseStrengths.push('Leadership potential and strategic thinking');
  } else if (targetRole.toLowerCase().includes('design')) {
    baseStrengths.push('Creative thinking and attention to detail');
  }
  
  return baseStrengths.slice(0, 4);
}

function generateGaps(targetRole) {
  const roleKeywords = targetRole.toLowerCase();
  
  if (roleKeywords.includes('developer') || roleKeywords.includes('engineer')) {
    return [
      'Advanced programming skills',
      'System design knowledge',
      'Development best practices',
      'Version control mastery',
    ];
  } else if (roleKeywords.includes('data') && roleKeywords.includes('scientist')) {
    return [
      'Statistical analysis expertise',
      'Machine learning algorithms',
      'Data visualization skills',
      'Research methodology',
    ];
  } else if (roleKeywords.includes('product') && roleKeywords.includes('manager')) {
    return [
      'Product strategy development',
      'Market research skills',
      'Stakeholder management',
      'Agile methodologies',
    ];
  } else if (roleKeywords.includes('design')) {
    return [
      'Design software proficiency',
      'User experience principles',
      'Design systems knowledge',
      'Client presentation skills',
    ];
  } else if (roleKeywords.includes('marketing')) {
    return [
      'Digital marketing channels',
      'Analytics and data interpretation',
      'Content creation skills',
      'Campaign optimization',
    ];
  }
  
  // Generic gaps for any role
  return [
    'Industry-specific knowledge',
    'Professional networking',
    'Advanced technical skills',
    'Leadership capabilities',
  ];
}

function generateSkillGaps(targetRole, currentSkills) {
  const requiredSkills = getRequiredSkills(targetRole);
  
  return requiredSkills.map(skill => ({
    skill: skill.name,
    importance: skill.importance,
    currentLevel: currentSkills.some(cs => 
      cs.toLowerCase().includes(skill.name.toLowerCase().split(' ')[0])
    ) ? Math.floor(Math.random() * 3) + 1 : 0,
    targetLevel: skill.importance === 'High' ? 4 : 3,
    resources: skill.resources,
  }));
}

function getRequiredSkills(targetRole) {
  const roleKeywords = targetRole.toLowerCase();
  
  if (roleKeywords.includes('react') || roleKeywords.includes('frontend')) {
    return [
      {
        name: 'React/React Native',
        importance: 'High',
        resources: ['React Documentation', 'React Native Docs', 'Expo Documentation'],
      },
      {
        name: 'JavaScript/TypeScript',
        importance: 'High',
        resources: ['MDN Web Docs', 'TypeScript Handbook', 'JavaScript.info'],
      },
      {
        name: 'Mobile UI/UX',
        importance: 'Medium',
        resources: ['Design Guidelines', 'Figma', 'UI Component Libraries'],
      },
    ];
  } else if (roleKeywords.includes('data') && roleKeywords.includes('scientist')) {
    return [
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
        resources: ['Khan Academy Statistics', 'R Documentation', 'Statistical Textbooks'],
      },
    ];
  }
  
  // Generic skills for any role
  return [
    {
      name: 'Core Technical Skills',
      importance: 'High',
      resources: ['Industry Documentation', 'Online Courses', 'Practice Projects'],
    },
    {
      name: 'Communication',
      importance: 'Medium',
      resources: ['Toastmasters', 'Business Writing', 'Presentation Skills'],
    },
    {
      name: 'Problem Solving',
      importance: 'High',
      resources: ['Practice Problems', 'Case Studies', 'Real Projects'],
    },
  ];
}

function generateTimeline(targetRole, hoursPerWeek) {
  return {
    totalWeeks: 8,
    hoursPerWeek: hoursPerWeek || 10,
    phases: [
      {
        week: 1,
        title: 'Foundation & Assessment',
        goals: [`Learn ${targetRole} fundamentals`, 'Set up learning environment'],
        deliverables: ['Skill assessment completion', 'Learning plan document'],
        resources: ['Industry overview articles', 'Setup guides'],
        mentorReview: true,
      },
      {
        week: 2,
        title: 'Core Skills Development',
        goals: ['Master basic concepts', 'Complete first projects'],
        deliverables: ['Practice project portfolio', 'Skill demonstration'],
        resources: ['Online courses', 'Documentation'],
        mentorReview: false,
      },
      {
        week: 3,
        title: 'Intermediate Application',
        goals: ['Apply advanced concepts', 'Build real-world project'],
        deliverables: ['Intermediate project', 'Peer code review'],
        resources: ['Advanced tutorials', 'Best practices guides'],
        mentorReview: true,
      },
      {
        week: 4,
        title: 'Mid-Point Review',
        goals: ['Assess progress', 'Adjust learning plan'],
        deliverables: ['Progress report', 'Updated roadmap'],
        resources: ['Self-assessment tools', 'Mentor feedback'],
        mentorReview: true,
      },
      {
        week: 5,
        title: 'Specialization',
        goals: [`Focus on ${targetRole}-specific skills`, 'Industry knowledge'],
        deliverables: ['Specialized project', 'Industry research report'],
        resources: ['Industry reports', 'Expert interviews'],
        mentorReview: false,
      },
      {
        week: 6,
        title: 'Integration Project',
        goals: ['Combine all skills', 'Build portfolio piece'],
        deliverables: ['Comprehensive project', 'Technical documentation'],
        resources: ['Project templates', 'Documentation examples'],
        mentorReview: true,
      },
      {
        week: 7,
        title: 'Capstone Development',
        goals: ['Create showcase project', 'Prepare presentation'],
        deliverables: ['Capstone project', 'Presentation materials'],
        resources: ['Portfolio examples', 'Presentation tools'],
        mentorReview: false,
      },
      {
        week: 8,
        title: 'Career Transition',
        goals: ['Finalize portfolio', 'Plan next steps'],
        deliverables: ['Complete portfolio', 'Job search strategy'],
        resources: ['Job boards', 'Interview prep', 'Networking guides'],
        mentorReview: true,
      },
    ],
  };
}

function generateCapstoneProject(targetRole) {
  const roleKeywords = targetRole.toLowerCase();
  
  if (roleKeywords.includes('developer') || roleKeywords.includes('engineer')) {
    return {
      title: `Full-Stack ${targetRole} Application`,
      description: `Build a complete application showcasing ${targetRole} skills`,
      requirements: [
        'Modern tech stack implementation',
        'Clean, maintainable code',
        'User authentication',
        'Database integration',
        'Responsive design',
      ],
      deliverables: [
        'Deployed application',
        'Source code repository',
        'Technical documentation',
        'Demo video',
        'Architecture diagram',
      ],
    };
  } else if (roleKeywords.includes('data') && roleKeywords.includes('scientist')) {
    return {
      title: 'End-to-End Data Science Project',
      description: 'Complete ML project from data collection to deployment',
      requirements: [
        'Data collection and cleaning',
        'Exploratory data analysis',
        'Model development',
        'Model evaluation',
        'Deployment pipeline',
      ],
      deliverables: [
        'Jupyter notebook with analysis',
        'Deployed ML model',
        'Technical report',
        'Data visualization dashboard',
        'Stakeholder presentation',
      ],
    };
  }
  
  return {
    title: `Professional ${targetRole} Portfolio Project`,
    description: `Comprehensive project demonstrating ${targetRole} expertise`,
    requirements: [
      'Industry best practices',
      'Real-world application',
      'Professional documentation',
      'Quality assurance',
    ],
    deliverables: [
      'Completed project',
      'Professional documentation',
      'Presentation materials',
      'Reflection and learning report',
    ],
  };
}

function generateMarketInsights(targetRole) {
  const roleKeywords = targetRole.toLowerCase();
  
  if (roleKeywords.includes('developer') || roleKeywords.includes('engineer')) {
    return {
      averageSalary: '$70,000 - $130,000',
      jobGrowth: '+25% (Much faster than average)',
      keyCompanies: ['Google', 'Meta', 'Apple', 'Microsoft', 'Amazon'],
      emergingTrends: [
        'Remote-first development',
        'AI-assisted coding',
        'Cloud-native applications',
        'Microservices architecture',
      ],
    };
  } else if (roleKeywords.includes('data') && roleKeywords.includes('scientist')) {
    return {
      averageSalary: '$85,000 - $160,000',
      jobGrowth: '+36% (Much faster than average)',
      keyCompanies: ['Netflix', 'Uber', 'Airbnb', 'Tesla', 'LinkedIn'],
      emergingTrends: [
        'MLOps and automation',
        'Ethical AI development',
        'Real-time analytics',
        'Edge computing',
      ],
    };
  }
  
  return {
    averageSalary: '$45,000 - $95,000',
    jobGrowth: '+15% (Faster than average)',
    keyCompanies: ['Industry leaders', 'Growing startups', 'Established companies'],
    emergingTrends: [
      'Digital transformation',
      'Remote work adoption',
      'Automation integration',
      'Continuous learning culture',
    ],
  };
}

// API Routes
app.post('/api/career-map', async (req, res) => {
  try {
    console.log('📥 Received career map request:', req.body);
    
    const assessmentData = req.body;
    
    // Validate required fields
    if (!assessmentData.targetRole || !assessmentData.currentRole) {
      return res.status(400).json({
        error: 'Missing required fields: targetRole and currentRole are required'
      });
    }
    
    // Generate career plan using AI (mock)
    const careerPlan = await generateCareerPlanWithAI(assessmentData);
    
    console.log('✅ Generated career plan for:', assessmentData.targetRole);
    
    res.json(careerPlan);
  } catch (error) {
    console.error('❌ Error generating career map:', error);
    res.status(500).json({
      error: 'Failed to generate career map',
      message: error.message
    });
  }
});

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    message: 'Career Map API is running'
  });
});

// Start server
app.listen(PORT, () => {
  console.log(`🚀 Career Map API Server running on http://localhost:${PORT}`);
  console.log(`📡 Health check: http://localhost:${PORT}/api/health`);
  console.log(`🎯 Career Map endpoint: http://localhost:${PORT}/api/career-map`);
});
