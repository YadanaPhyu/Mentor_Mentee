// AI-powered Career Map Service
// This service generates dynamic career roadmaps using AI-like algorithms

class AICareerMapService {
  constructor() {
    // Comprehensive career database with skills, learning paths, and industry insights
    this.careerDatabase = {
      // Tech Careers
      'React Native Developer': {
        category: 'technology',
        difficulty: 'intermediate',
        avgSalary: '$75,000 - $120,000',
        keySkills: ['React Native', 'JavaScript', 'TypeScript', 'Mobile Development', 'iOS/Android'],
        prerequisites: ['JavaScript fundamentals', 'React basics', 'Mobile app concepts'],
        tools: ['React Native CLI', 'Expo', 'Xcode', 'Android Studio', 'VS Code'],
        certifications: ['React Native Certification', 'Mobile App Development'],
        careerPath: ['Junior Mobile Developer', 'React Native Developer', 'Senior Mobile Developer', 'Mobile Architect'],
        industries: ['Fintech', 'E-commerce', 'Healthcare', 'Education', 'Entertainment']
      },
      'Full Stack Developer': {
        category: 'technology',
        difficulty: 'advanced',
        avgSalary: '$80,000 - $140,000',
        keySkills: ['JavaScript', 'Node.js', 'React', 'Database Design', 'API Development', 'DevOps'],
        prerequisites: ['Programming fundamentals', 'Web development basics', 'Database concepts'],
        tools: ['VS Code', 'Git', 'Docker', 'AWS/Azure', 'MongoDB/PostgreSQL'],
        certifications: ['AWS Solutions Architect', 'Full Stack Web Development'],
        careerPath: ['Junior Developer', 'Full Stack Developer', 'Senior Developer', 'Tech Lead', 'Engineering Manager'],
        industries: ['Tech Startups', 'Enterprise Software', 'Consulting', 'Financial Services']
      },
      'Data Scientist': {
        category: 'technology',
        difficulty: 'advanced',
        avgSalary: '$90,000 - $160,000',
        keySkills: ['Python', 'R', 'Machine Learning', 'Statistics', 'SQL', 'Data Visualization'],
        prerequisites: ['Statistics', 'Programming basics', 'Mathematics', 'Research methods'],
        tools: ['Jupyter', 'Pandas', 'Scikit-learn', 'TensorFlow', 'Tableau', 'SQL databases'],
        certifications: ['Google Data Analytics', 'IBM Data Science', 'Microsoft Azure AI'],
        careerPath: ['Data Analyst', 'Junior Data Scientist', 'Data Scientist', 'Senior Data Scientist', 'Chief Data Officer'],
        industries: ['Healthcare', 'Finance', 'Retail', 'Technology', 'Government']
      },
      'UX/UI Designer': {
        category: 'design',
        difficulty: 'intermediate',
        avgSalary: '$65,000 - $110,000',
        keySkills: ['Figma', 'Adobe Creative Suite', 'User Research', 'Prototyping', 'Usability Testing'],
        prerequisites: ['Design principles', 'Color theory', 'Typography', 'Basic psychology'],
        tools: ['Figma', 'Sketch', 'Adobe XD', 'InVision', 'Miro', 'Principle'],
        certifications: ['Google UX Design', 'Adobe Certified Expert', 'Nielsen Norman Group'],
        careerPath: ['Junior Designer', 'UX/UI Designer', 'Senior Designer', 'Design Lead', 'Head of Design'],
        industries: ['Tech Companies', 'Digital Agencies', 'Startups', 'E-commerce', 'Healthcare']
      },
      'Product Manager': {
        category: 'business',
        difficulty: 'advanced',
        avgSalary: '$95,000 - $180,000',
        keySkills: ['Product Strategy', 'User Research', 'Data Analysis', 'Agile/Scrum', 'Stakeholder Management'],
        prerequisites: ['Business analysis', 'Project management', 'Market research', 'Communication'],
        tools: ['Jira', 'Confluence', 'Figma', 'Analytics tools', 'Roadmapping software'],
        certifications: ['Certified Scrum Product Owner', 'Product Management Certificate'],
        careerPath: ['Associate PM', 'Product Manager', 'Senior PM', 'Director of Product', 'VP of Product'],
        industries: ['Technology', 'Fintech', 'Healthcare', 'E-commerce', 'SaaS']
      },
      'DevOps Engineer': {
        category: 'technology',
        difficulty: 'advanced',
        avgSalary: '$85,000 - $150,000',
        keySkills: ['Docker', 'Kubernetes', 'AWS/Azure', 'CI/CD', 'Infrastructure as Code', 'Linux'],
        prerequisites: ['System administration', 'Networking', 'Programming', 'Cloud concepts'],
        tools: ['Docker', 'Jenkins', 'Terraform', 'Ansible', 'Monitoring tools'],
        certifications: ['AWS DevOps Engineer', 'Kubernetes Administrator', 'Docker Certified'],
        careerPath: ['System Admin', 'DevOps Engineer', 'Senior DevOps', 'Platform Engineer', 'Infrastructure Architect'],
        industries: ['Cloud Services', 'Fintech', 'E-commerce', 'Enterprise Software']
      },
      'Digital Marketing Manager': {
        category: 'marketing',
        difficulty: 'intermediate',
        avgSalary: '$60,000 - $100,000',
        keySkills: ['SEO/SEM', 'Social Media Marketing', 'Content Strategy', 'Analytics', 'Email Marketing'],
        prerequisites: ['Marketing fundamentals', 'Communication', 'Analytics basics', 'Social media'],
        tools: ['Google Analytics', 'HubSpot', 'Hootsuite', 'Canva', 'Email platforms'],
        certifications: ['Google Ads', 'HubSpot Marketing', 'Facebook Blueprint'],
        careerPath: ['Marketing Coordinator', 'Digital Marketer', 'Marketing Manager', 'Marketing Director'],
        industries: ['E-commerce', 'SaaS', 'Retail', 'Healthcare', 'Education']
      },
      'Cybersecurity Analyst': {
        category: 'technology',
        difficulty: 'advanced',
        avgSalary: '$75,000 - $130,000',
        keySkills: ['Network Security', 'Incident Response', 'Risk Assessment', 'Ethical Hacking', 'Compliance'],
        prerequisites: ['Networking', 'System administration', 'Security fundamentals'],
        tools: ['Wireshark', 'Metasploit', 'Nessus', 'SIEM tools', 'Penetration testing tools'],
        certifications: ['CISSP', 'CEH', 'Security+', 'CISM'],
        careerPath: ['Security Analyst', 'Senior Analyst', 'Security Engineer', 'Security Manager', 'CISO'],
        industries: ['Financial Services', 'Healthcare', 'Government', 'Technology', 'Consulting']
      },
      'High School Teacher': {
        category: 'education',
        difficulty: 'intermediate',
        avgSalary: '$45,000 - $75,000',
        keySkills: ['Curriculum Development', 'Classroom Management', 'Student Assessment', 'Communication', 'Subject Expertise'],
        prerequisites: ['Bachelor\'s degree', 'Teaching certification', 'Student teaching experience'],
        tools: ['Learning Management Systems', 'Google Classroom', 'Educational software', 'Presentation tools'],
        certifications: ['Teaching License', 'Subject-specific certifications', 'ESL certification'],
        careerPath: ['Student Teacher', 'High School Teacher', 'Department Head', 'Assistant Principal', 'Principal'],
        industries: ['Public Education', 'Private Schools', 'Charter Schools', 'Online Education']
      },
      'Professional Chef': {
        category: 'culinary',
        difficulty: 'advanced',
        avgSalary: '$50,000 - $120,000',
        keySkills: ['Culinary Techniques', 'Menu Planning', 'Food Safety', 'Kitchen Management', 'Creativity'],
        prerequisites: ['Culinary training', 'Food safety certification', 'Kitchen experience'],
        tools: ['Professional kitchen equipment', 'POS systems', 'Inventory management software'],
        certifications: ['ServSafe', 'Culinary degree', 'Sommelier certification'],
        careerPath: ['Line Cook', 'Sous Chef', 'Head Chef', 'Executive Chef', 'Restaurant Owner'],
        industries: ['Restaurants', 'Hotels', 'Catering', 'Food Media', 'Private Chef Services']
      },
      'Nurse Practitioner': {
        category: 'healthcare',
        difficulty: 'advanced',
        avgSalary: '$95,000 - $150,000',
        keySkills: ['Clinical Assessment', 'Patient Care', 'Medical Knowledge', 'Communication', 'Critical Thinking'],
        prerequisites: ['RN license', 'Bachelor\'s in Nursing', 'Clinical experience'],
        tools: ['Electronic Health Records', 'Medical equipment', 'Diagnostic tools'],
        certifications: ['NP license', 'Board certification', 'BLS/ACLS'],
        careerPath: ['Registered Nurse', 'Nurse Practitioner', 'Nurse Manager', 'Clinical Director'],
        industries: ['Hospitals', 'Clinics', 'Private Practice', 'Telehealth', 'Urgent Care']
      },
      'Real Estate Agent': {
        category: 'sales',
        difficulty: 'intermediate',
        avgSalary: '$45,000 - $150,000',
        keySkills: ['Sales', 'Negotiation', 'Market Analysis', 'Customer Service', 'Networking'],
        prerequisites: ['Real estate license', 'Sales experience', 'Local market knowledge'],
        tools: ['MLS systems', 'CRM software', 'Virtual tour technology', 'Marketing platforms'],
        certifications: ['Real Estate License', 'Broker License', 'Realtor designation'],
        careerPath: ['Real Estate Agent', 'Senior Agent', 'Team Leader', 'Broker', 'Agency Owner'],
        industries: ['Residential Real Estate', 'Commercial Real Estate', 'Property Management', 'Real Estate Investment']
      }
    };

    // Learning resource database
    this.learningResources = {
      beginner: [
        'Interactive coding tutorials',
        'YouTube educational channels',
        'Free online courses',
        'Documentation and guides',
        'Community forums'
      ],
      intermediate: [
        'Structured online bootcamps',
        'Project-based learning',
        'Professional courses',
        'Industry blogs and articles',
        'Networking events'
      ],
      advanced: [
        'Advanced certifications',
        'Industry conferences',
        'Mentorship programs',
        'Specialized workshops',
        'Research papers and case studies'
      ]
    };
  }

  // AI-powered career analysis
  analyzeCareerFit(userProfile) {
    const { currentSkills, targetRole, experience, hoursPerWeek, budget } = userProfile;
    
    console.log('🤖 AI Service analyzing career fit for:', targetRole);
    console.log('📋 Full user profile:', userProfile);
    
    const careerData = this.careerDatabase[targetRole];
    
    if (!careerData) {
      console.log('📭 No specific career data found, generating generic map for:', targetRole);
      return this.generateGenericCareerMap(userProfile);
    }

    console.log('📊 Found specific career data for:', targetRole);

    // Analyze skill gaps using AI-like algorithms
    const skillAnalysis = this.analyzeSkillGaps(currentSkills, careerData.keySkills);
    
    // Generate personalized learning timeline
    const timeline = this.generateLearningTimeline(skillAnalysis, experience, hoursPerWeek);
    
    // Create dynamic weekly plan
    const weeklyPlan = this.generateWeeklyPlan(skillAnalysis, timeline, careerData);
    
    // Generate capstone project
    const capstone = this.generateCapstoneProject(targetRole, careerData);
    
    const result = {
      targetRole,
      careerData,
      gapAnalysis: skillAnalysis,
      weeklyPlan,
      capstone,
      recommendations: this.generateRecommendations(userProfile, careerData),
      marketInsights: this.generateMarketInsights(careerData)
    };
    
    console.log('✅ AI Service result targetRole:', result.targetRole);
    return result;
  }

  analyzeSkillGaps(currentSkills, requiredSkills) {
    const currentSkillsLower = currentSkills.map(skill => skill.toLowerCase().trim());
    
    const strong = [];
    const medium = [];
    const missing = [];

    requiredSkills.forEach(skill => {
      const skillLower = skill.toLowerCase();
      const hasExactMatch = currentSkillsLower.some(current => 
        current.includes(skillLower) || skillLower.includes(current)
      );
      
      const hasPartialMatch = currentSkillsLower.some(current => 
        this.calculateSkillSimilarity(current, skillLower) > 0.6
      );

      if (hasExactMatch) {
        strong.push(skill);
      } else if (hasPartialMatch) {
        medium.push(skill);
      } else {
        missing.push(skill);
      }
    });

    // Add related skills based on AI analysis
    const relatedSkills = this.generateRelatedSkills(currentSkillsLower, requiredSkills);
    
    return {
      strong: [...strong, ...relatedSkills.strong],
      medium: [...medium, ...relatedSkills.medium],
      missing: [...missing, ...relatedSkills.missing]
    };
  }

  calculateSkillSimilarity(skill1, skill2) {
    // Simple similarity algorithm
    const synonyms = {
      'javascript': ['js', 'ecmascript', 'node'],
      'python': ['py', 'django', 'flask'],
      'react': ['reactjs', 'react.js'],
      'database': ['sql', 'mysql', 'postgresql', 'mongodb'],
      'design': ['ui', 'ux', 'graphic', 'visual'],
      'mobile': ['ios', 'android', 'app development']
    };

    for (const [key, values] of Object.entries(synonyms)) {
      if ((skill1.includes(key) || values.some(v => skill1.includes(v))) &&
          (skill2.includes(key) || values.some(v => skill2.includes(v)))) {
        return 0.8;
      }
    }

    // Levenshtein distance similarity
    const distance = this.levenshteinDistance(skill1, skill2);
    const maxLength = Math.max(skill1.length, skill2.length);
    return 1 - (distance / maxLength);
  }

  levenshteinDistance(str1, str2) {
    const matrix = [];
    for (let i = 0; i <= str2.length; i++) {
      matrix[i] = [i];
    }
    for (let j = 0; j <= str1.length; j++) {
      matrix[0][j] = j;
    }
    for (let i = 1; i <= str2.length; i++) {
      for (let j = 1; j <= str1.length; j++) {
        if (str2.charAt(i - 1) === str1.charAt(j - 1)) {
          matrix[i][j] = matrix[i - 1][j - 1];
        } else {
          matrix[i][j] = Math.min(
            matrix[i - 1][j - 1] + 1,
            matrix[i][j - 1] + 1,
            matrix[i - 1][j] + 1
          );
        }
      }
    }
    return matrix[str2.length][str1.length];
  }

  generateRelatedSkills(currentSkills, requiredSkills) {
    const relatedSkills = {
      strong: [],
      medium: [],
      missing: []
    };

    // AI logic to find transferable skills
    const skillTransfers = {
      'problem solving': ['debugging', 'troubleshooting', 'analytical thinking'],
      'communication': ['documentation', 'presentation', 'stakeholder management'],
      'project management': ['planning', 'coordination', 'time management'],
      'teamwork': ['collaboration', 'leadership', 'mentoring']
    };

    currentSkills.forEach(skill => {
      for (const [category, transfers] of Object.entries(skillTransfers)) {
        if (skill.includes(category)) {
          transfers.forEach(transfer => {
            if (requiredSkills.some(req => req.toLowerCase().includes(transfer))) {
              relatedSkills.medium.push(`${transfer} (from ${skill})`);
            }
          });
        }
      }
    });

    return relatedSkills;
  }

  generateLearningTimeline(skillAnalysis, experience, hoursPerWeek) {
    const totalMissingSkills = skillAnalysis.missing.length;
    const totalMediumSkills = skillAnalysis.medium.length;
    
    // AI algorithm to determine optimal learning pace
    const complexityScore = (totalMissingSkills * 2) + (totalMediumSkills * 1);
    const experienceMultiplier = experience === 'entry' ? 1.5 : experience === 'mid' ? 1.2 : 1.0;
    const timeMultiplier = hoursPerWeek < 10 ? 1.4 : hoursPerWeek > 20 ? 0.8 : 1.0;
    
    const estimatedWeeks = Math.max(6, Math.min(12, Math.ceil(complexityScore * experienceMultiplier * timeMultiplier)));
    
    return {
      totalWeeks: estimatedWeeks,
      phase1: Math.ceil(estimatedWeeks * 0.3), // Foundation
      phase2: Math.ceil(estimatedWeeks * 0.5), // Core Skills
      phase3: Math.ceil(estimatedWeeks * 0.2)  // Advanced/Project
    };
  }

  generateWeeklyPlan(skillAnalysis, timeline, careerData) {
    const weeklyPlan = [];
    const allSkills = [...skillAnalysis.missing, ...skillAnalysis.medium];
    
    // Phase 1: Foundation (30% of time)
    for (let week = 1; week <= timeline.phase1; week++) {
      const foundationSkills = this.selectFoundationSkills(allSkills, careerData);
      weeklyPlan.push({
        week,
        phase: 'Foundation',
        theme: `Building ${foundationSkills.join(' & ')} Fundamentals`,
        goals: this.generateWeeklyGoals(foundationSkills, 'foundation'),
        resources: this.generateWeeklyResources(foundationSkills, 'beginner'),
        deliverable: this.generateWeeklyDeliverable(foundationSkills, week, 'foundation'),
        estimatedHours: 8,
        difficulty: 'Beginner'
      });
    }

    // Phase 2: Core Skills (50% of time)
    for (let week = timeline.phase1 + 1; week <= timeline.phase1 + timeline.phase2; week++) {
      const coreSkills = this.selectCoreSkills(allSkills, careerData, week - timeline.phase1);
      weeklyPlan.push({
        week,
        phase: 'Core Development',
        theme: `Mastering ${coreSkills.join(' & ')}`,
        goals: this.generateWeeklyGoals(coreSkills, 'core'),
        resources: this.generateWeeklyResources(coreSkills, 'intermediate'),
        deliverable: this.generateWeeklyDeliverable(coreSkills, week, 'core'),
        estimatedHours: 10,
        difficulty: 'Intermediate'
      });
    }

    // Phase 3: Advanced & Integration (20% of time)
    for (let week = timeline.phase1 + timeline.phase2 + 1; week <= timeline.totalWeeks; week++) {
      const advancedSkills = this.selectAdvancedSkills(allSkills, careerData);
      weeklyPlan.push({
        week,
        phase: 'Advanced Integration',
        theme: `Advanced ${advancedSkills.join(' & ')} & Portfolio Building`,
        goals: this.generateWeeklyGoals(advancedSkills, 'advanced'),
        resources: this.generateWeeklyResources(advancedSkills, 'advanced'),
        deliverable: this.generateWeeklyDeliverable(advancedSkills, week, 'advanced'),
        estimatedHours: 12,
        difficulty: 'Advanced'
      });
    }

    return weeklyPlan;
  }

  selectFoundationSkills(allSkills, careerData) {
    const foundationMap = {
      'JavaScript': ['Programming fundamentals', 'ES6 syntax'],
      'React Native': ['JavaScript basics', 'React fundamentals'],
      'Python': ['Programming concepts', 'Data structures'],
      'Database': ['SQL basics', 'Data modeling'],
      'Design': ['Design principles', 'Color theory'],
      'Marketing': ['Marketing fundamentals', 'Customer research']
    };

    return allSkills.slice(0, 2).map(skill => {
      for (const [key, foundations] of Object.entries(foundationMap)) {
        if (skill.toLowerCase().includes(key.toLowerCase())) {
          return foundations[0];
        }
      }
      return `${skill} fundamentals`;
    });
  }

  selectCoreSkills(allSkills, careerData, weekNumber) {
    const skillsPerWeek = Math.max(1, Math.floor(allSkills.length / 4));
    const startIndex = (weekNumber - 1) * skillsPerWeek;
    return allSkills.slice(startIndex, startIndex + skillsPerWeek);
  }

  selectAdvancedSkills(allSkills, careerData) {
    return careerData.tools.slice(0, 2);
  }

  generateWeeklyGoals(skills, phase) {
    const goalTemplates = {
      foundation: [
        `Complete introduction to {skill}`,
        `Practice basic {skill} exercises`,
        `Understand {skill} core concepts`
      ],
      core: [
        `Build practical {skill} project`,
        `Master intermediate {skill} techniques`,
        `Apply {skill} in real-world scenario`
      ],
      advanced: [
        `Integrate {skill} with other technologies`,
        `Optimize {skill} for production`,
        `Create portfolio piece using {skill}`
      ]
    };

    return skills.flatMap(skill => 
      goalTemplates[phase].slice(0, 2).map(template => 
        template.replace('{skill}', skill)
      )
    );
  }

  generateWeeklyResources(skills, level) {
    const resourceTemplates = {
      beginner: [
        `Official {skill} documentation`,
        `{skill} beginner tutorial series`,
        `Interactive {skill} coding exercises`,
        `{skill} community forum discussions`
      ],
      intermediate: [
        `{skill} project-based course`,
        `{skill} best practices guide`,
        `{skill} case studies and examples`,
        `{skill} webinars and workshops`
      ],
      advanced: [
        `Advanced {skill} certification program`,
        `{skill} industry conference talks`,
        `{skill} expert blog posts`,
        `{skill} open source projects`
      ]
    };

    return skills.flatMap(skill => 
      resourceTemplates[level].slice(0, 2).map(template => 
        template.replace('{skill}', skill)
      )
    );
  }

  generateWeeklyDeliverable(skills, week, phase) {
    const deliverableTemplates = {
      foundation: [
        `Complete {skill} basics quiz and reflection`,
        `Create simple {skill} demo project`,
        `Write {skill} learning summary blog post`
      ],
      core: [
        `Build functional {skill} application`,
        `Create {skill} tutorial for beginners`,
        `Contribute to {skill} open source project`
      ],
      advanced: [
        `Develop production-ready {skill} solution`,
        `Present {skill} project to peers`,
        `Publish {skill} case study or article`
      ]
    };

    const templates = deliverableTemplates[phase];
    const template = templates[week % templates.length];
    const skill = skills[0] || 'core concept';
    
    return template.replace('{skill}', skill);
  }

  generateCapstoneProject(targetRole, careerData) {
    const projectTemplates = {
      'React Native Developer': {
        title: 'Cross-Platform Mobile App with Authentication',
        description: 'Build a full-featured mobile application with user authentication, data persistence, and API integration',
        outcomes: ['Production-ready mobile app', 'App store deployment', 'Technical documentation'],
        steps: [
          'Design app architecture and user flows',
          'Implement authentication system',
          'Build core features with navigation',
          'Integrate external APIs',
          'Add offline functionality',
          'Test on multiple devices',
          'Deploy to app stores',
          'Create project documentation'
        ]
      },
      'Data Scientist': {
        title: 'End-to-End Machine Learning Pipeline',
        description: 'Create a complete ML project from data collection to model deployment',
        outcomes: ['Deployed ML model', 'Data analysis report', 'Interactive dashboard'],
        steps: [
          'Define problem and collect data',
          'Perform exploratory data analysis',
          'Clean and preprocess data',
          'Feature engineering and selection',
          'Train and evaluate multiple models',
          'Deploy best model to production',
          'Create monitoring dashboard',
          'Present findings and recommendations'
        ]
      },
      'UX/UI Designer': {
        title: 'Complete Product Design Case Study',
        description: 'Design a digital product from user research to high-fidelity prototypes',
        outcomes: ['Interactive prototype', 'Design system', 'Case study presentation'],
        steps: [
          'Conduct user research and interviews',
          'Create user personas and journey maps',
          'Design information architecture',
          'Create wireframes and user flows',
          'Develop visual design system',
          'Build high-fidelity prototypes',
          'Conduct usability testing',
          'Present complete case study'
        ]
      }
    };

    return projectTemplates[targetRole] || {
      title: `${targetRole} Portfolio Project`,
      description: `Create a comprehensive project showcasing ${targetRole} skills`,
      outcomes: ['Professional portfolio piece', 'Technical documentation', 'Presentation'],
      steps: [
        'Plan project scope and requirements',
        'Research industry best practices',
        'Design solution architecture',
        'Implement core functionality',
        'Test and refine solution',
        'Document project thoroughly',
        'Present to stakeholders',
        'Publish and share work'
      ]
    };
  }

  generateRecommendations(userProfile, careerData) {
    const recommendations = [];

    // Budget-based recommendations
    if (userProfile.budget < 200) {
      recommendations.push({
        type: 'budget',
        priority: 'high',
        title: 'Maximize Free Resources',
        description: 'Focus on free online courses, documentation, and open-source projects',
        action: 'Explore Coursera audit options, freeCodeCamp, and YouTube tutorials'
      });
    } else if (userProfile.budget > 1000) {
      recommendations.push({
        type: 'budget',
        priority: 'medium',
        title: 'Invest in Premium Learning',
        description: 'Consider bootcamps, mentorship programs, or certification courses',
        action: 'Research highly-rated paid courses and certification programs'
      });
    }

    // Time-based recommendations
    if (userProfile.hoursPerWeek < 10) {
      recommendations.push({
        type: 'time',
        priority: 'high',
        title: 'Optimize Learning Efficiency',
        description: 'Focus on high-impact learning activities and microlearning',
        action: 'Use spaced repetition and focus on practical projects'
      });
    }

    // Career-specific recommendations
    recommendations.push({
      type: 'networking',
      priority: 'medium',
      title: `Join ${careerData.category} Communities`,
      description: `Connect with professionals in ${careerData.industries.join(', ')} industries`,
      action: `Join LinkedIn groups, attend virtual meetups, participate in relevant forums`
    });

    return recommendations;
  }

  generateMarketInsights(careerData) {
    return {
      demandLevel: this.calculateDemandLevel(careerData),
      salaryRange: careerData.avgSalary,
      growthProjection: this.calculateGrowthProjection(careerData),
      keyIndustries: careerData.industries,
      competitionLevel: this.calculateCompetitionLevel(careerData),
      remoteOpportunities: this.calculateRemoteOpportunities(careerData)
    };
  }

  calculateDemandLevel(careerData) {
    const highDemandCategories = ['technology', 'healthcare', 'cybersecurity'];
    return highDemandCategories.includes(careerData.category) ? 'High' : 'Medium';
  }

  calculateGrowthProjection(careerData) {
    const growthRates = {
      'technology': '15-25% over next 5 years',
      'design': '8-12% over next 5 years',
      'business': '10-15% over next 5 years',
      'marketing': '6-10% over next 5 years'
    };
    return growthRates[careerData.category] || '5-8% over next 5 years';
  }

  calculateCompetitionLevel(careerData) {
    return careerData.difficulty === 'advanced' ? 'High' : 
           careerData.difficulty === 'intermediate' ? 'Medium' : 'Low';
  }

  calculateRemoteOpportunities(careerData) {
    const remoteFreendly = ['technology', 'design', 'marketing'];
    return remoteFreendly.includes(careerData.category) ? 'High' : 'Medium';
  }

  generateGenericCareerMap(userProfile) {
    console.log('🔄 Generating generic career map for:', userProfile.targetRole);
    
    // Fallback for unknown careers
    const result = {
      targetRole: userProfile.targetRole,
      careerData: {
        category: 'general',
        difficulty: 'intermediate',
        avgSalary: 'Varies by location and experience',
        keySkills: ['Communication', 'Problem Solving', 'Learning Agility', 'Adaptability'],
        tools: ['Industry-specific software', 'Productivity tools', 'Communication platforms']
      },
      gapAnalysis: {
        strong: ['Motivation', 'Learning Commitment'],
        medium: ['Industry Knowledge', 'Professional Network'],
        missing: ['Specialized Skills', 'Industry Experience']
      },
      weeklyPlan: this.generateGenericWeeklyPlan(userProfile),
      capstone: {
        title: `${userProfile.targetRole} Professional Portfolio`,
        description: 'Create a comprehensive portfolio showcasing your skills and experience',
        expectedOutcome: 'Professional portfolio demonstrating competency',
        steps: [
          'Research industry requirements',
          'Identify key skills to demonstrate',
          'Create portfolio structure',
          'Develop portfolio content',
          'Get feedback from professionals',
          'Refine and publish portfolio'
        ]
      },
      recommendations: [
        {
          type: 'research',
          priority: 'high',
          title: 'Research Career Requirements',
          description: 'Conduct thorough research on your target role',
          action: 'Interview professionals, review job postings, join professional associations'
        }
      ],
      marketInsights: {
        demandLevel: 'Research Required',
        salaryRange: 'Varies by location and industry',
        growthProjection: 'Research industry trends',
        keyIndustries: ['Various'],
        competitionLevel: 'Varies',
        remoteOpportunities: 'Depends on role'
      }
    };
    
    console.log('✅ Generic career map result targetRole:', result.targetRole);
    return result;
  }

  generateGenericWeeklyPlan(userProfile) {
    const genericPlan = [];
    for (let week = 1; week <= 8; week++) {
      genericPlan.push({
        week,
        phase: week <= 2 ? 'Research' : week <= 6 ? 'Skill Building' : 'Portfolio',
        theme: week <= 2 ? 'Industry Research' : week <= 6 ? 'Skill Development' : 'Portfolio Creation',
        goals: [
          `Research ${userProfile.targetRole} requirements`,
          `Connect with industry professionals`,
          `Identify key skills to develop`
        ],
        resources: [
          'Industry publications and websites',
          'Professional networking events',
          'Online courses and tutorials',
          'Industry reports and analysis'
        ],
        deliverable: week <= 2 ? 'Research summary document' : 
                    week <= 6 ? 'Skill demonstration project' : 
                    'Portfolio component',
        estimatedHours: 8,
        difficulty: 'Beginner'
      });
    }
    return genericPlan;
  }
}

export default new AICareerMapService();
