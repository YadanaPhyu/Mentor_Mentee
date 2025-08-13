/**
 * AI-Enhanced Career Map API Service
 * Combines OpenAI with fallback mock data
 */

import openAICareerService from './openAICareerService.js';

const API_BASE_URL = (typeof __DEV__ !== 'undefined' && __DEV__) || process.env.NODE_ENV === 'development' 
  ? 'http://localhost:3000' 
  : 'https://your-production-api.com';

class AICareerMapApiService {
  /**
   * Generate career map using AI first, fallback to mock API
   * @param {Object} assessmentData - User assessment data
   * @returns {Promise<Object>} Career map data
   */
  async generateCareerMap(assessmentData) {
    try {
      console.log('🚀 Starting AI-powered career map generation...');
      
      // Try OpenAI first if available
      if (openAICareerService.isAvailable()) {
        console.log('🤖 Using OpenAI GPT-4 for career analysis...');
        
        try {
          const aiResult = await openAICareerService.generateCareerMap(assessmentData);
          
          // Validate AI response structure
          if (this.validateCareerMapStructure(aiResult)) {
            console.log('✅ AI career map generated and validated');
            
            // Save to local storage for offline access
            await this.saveToLocalStorage(assessmentData, aiResult);
            
            return aiResult;
          } else {
            console.warn('⚠️ AI result validation failed, falling back to mock API');
          }
        } catch (aiError) {
          console.warn('⚠️ AI generation failed, falling back to mock API:', aiError.message);
        }
      }

      // Fallback to mock API server
      console.log('🔄 Using mock API server...');
      return await this.generateWithMockAPI(assessmentData);

    } catch (error) {
      console.error('❌ All career map generation methods failed:', error);
      
      // Ultimate fallback: generate basic mock data
      return this.generateBasicFallback(assessmentData);
    }
  }

  /**
   * Generate career map using mock API server
   * @param {Object} assessmentData - Assessment data
   * @returns {Promise<Object>} Career map from mock API
   */
  async generateWithMockAPI(assessmentData) {
    try {
      const response = await fetch(`${API_BASE_URL}/api/career-map`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
        body: JSON.stringify(assessmentData),
        timeout: 30000,
      });

      if (!response.ok) {
        throw new Error(`Mock API Error: ${response.status} ${response.statusText}`);
      }

      const careerMapData = await response.json();
      console.log('✅ Mock API career map generated');
      
      // Add metadata
      careerMapData.aiGenerated = false;
      careerMapData.generatedAt = new Date().toISOString();
      
      // Save to local storage
      await this.saveToLocalStorage(assessmentData, careerMapData);
      
      return careerMapData;
      
    } catch (error) {
      console.error('❌ Mock API generation failed:', error);
      throw error;
    }
  }

  /**
   * Generate basic fallback career map
   * @param {Object} assessmentData - Assessment data
   * @returns {Object} Basic career map
   */
  generateBasicFallback(assessmentData) {
    console.log('🔄 Generating basic fallback career map...');
    
    const { currentRole, targetRole, skillsText, hoursPerWeek, budget } = assessmentData;
    const skills = skillsText ? skillsText.split(',').map(s => s.trim()).filter(Boolean) : [];
    
    return {
      id: `fallback-career-map-${Date.now()}`,
      roleSnapshot: {
        title: targetRole,
        level: "Mid Level",
        keySkills: this.generateBasicSkills(targetRole),
        averageSalary: "$60,000 - $100,000",
        description: `Professional ${targetRole} with expertise in modern technologies and industry best practices.`,
        marketDemand: "High",
        growthRate: "10% (Average)",
        topCompanies: ["Microsoft", "Google", "Apple", "Amazon"]
      },
      gapAnalysis: {
        strong: ["Strong motivation and learning ability", "Professional communication skills"],
        medium: skills.slice(0, 2),
        missing: this.generateBasicSkills(targetRole).slice(0, 3)
      },
      weeklyPlan: this.generateBasicWeeklyPlan(targetRole, hoursPerWeek),
      capstone: {
        title: `${targetRole} Portfolio Project`,
        description: `A comprehensive project showcasing ${targetRole} skills and best practices.`,
        keyFeatures: ["Modern architecture", "Best practices implementation", "Production-ready code"],
        expectedOutcome: "Portfolio-ready project demonstrating professional-level skills"
      },
      marketInsights: {
        industryTrends: `Growing demand for skilled ${targetRole} professionals`,
        remoteOpportunities: "High",
        competitionLevel: "Medium",
        recommendedCertifications: ["Professional Certification", "Industry Standard Certification"]
      },
      generatedAt: new Date().toISOString(),
      aiGenerated: false,
      fallbackGenerated: true
    };
  }

  /**
   * Generate basic skills for a role
   * @param {string} targetRole - Target role name
   * @returns {Array<string>} Array of basic skills
   */
  generateBasicSkills(targetRole) {
    const roleSkillMap = {
      'React Native Developer': ['React Native', 'JavaScript', 'Mobile Development', 'Redux', 'API Integration'],
      'iOS Developer': ['Swift', 'iOS SDK', 'Xcode', 'Core Data', 'App Store'],
      'Android Developer': ['Kotlin', 'Java', 'Android SDK', 'Android Studio', 'Google Play'],
      'Data Scientist': ['Python', 'Machine Learning', 'Statistics', 'SQL', 'Data Visualization'],
      'Full Stack Developer': ['JavaScript', 'React', 'Node.js', 'Database Design', 'API Development'],
      'Product Manager': ['Product Strategy', 'User Research', 'Analytics', 'Agile', 'Roadmapping'],
      'UX/UI Designer': ['Figma', 'User Research', 'Prototyping', 'Design Systems', 'Usability Testing']
    };

    return roleSkillMap[targetRole] || ['Technical Skills', 'Problem Solving', 'Communication', 'Project Management', 'Industry Knowledge'];
  }

  /**
   * Generate basic weekly plan
   * @param {string} targetRole - Target role name
   * @param {number} hoursPerWeek - Available study hours
   * @returns {Array<Object>} 8-week plan
   */
  generateBasicWeeklyPlan(targetRole, hoursPerWeek = 10) {
    const weeklyPlan = [];
    const skills = this.generateBasicSkills(targetRole);
    
    for (let week = 1; week <= 8; week++) {
      const weekData = {
        week: week,
        goals: [],
        resources: ['Online documentation', 'Video tutorials', 'Practice exercises'],
        deliverable: `Week ${week} project milestone`
      };

      if (week <= 2) {
        weekData.goals = ['Environment setup', 'Basic concepts', 'First project'];
      } else if (week <= 4) {
        weekData.goals = ['Intermediate concepts', 'Hands-on practice', 'Build mini-project'];
      } else if (week <= 6) {
        weekData.goals = ['Advanced topics', 'Integration patterns', 'Real-world scenarios'];
      } else {
        weekData.goals = ['Capstone project', 'Portfolio preparation', 'Best practices'];
      }

      weeklyPlan.push(weekData);
    }
    
    return weeklyPlan;
  }

  /**
   * Validate career map structure
   * @param {Object} careerMap - Career map to validate
   * @returns {boolean} True if valid structure
   */
  validateCareerMapStructure(careerMap) {
    const requiredFields = ['roleSnapshot', 'gapAnalysis', 'weeklyPlan', 'capstone'];
    
    for (const field of requiredFields) {
      if (!careerMap[field]) {
        console.warn(`⚠️ Missing required field: ${field}`);
        return false;
      }
    }

    if (!Array.isArray(careerMap.weeklyPlan) || careerMap.weeklyPlan.length !== 8) {
      console.warn('⚠️ Invalid weeklyPlan structure');
      return false;
    }

    return true;
  }

  /**
   * Save career map to local storage
   * @param {Object} assessmentData - Original assessment data
   * @param {Object} careerMap - Generated career map
   */
  async saveToLocalStorage(assessmentData, careerMap) {
    try {
      const careerMemoryService = require('./careerMemoryService.js');
      
      const assessmentId = `assessment_${Date.now()}`;
      const assessmentRecord = {
        id: assessmentId,
        ...assessmentData,
        createdAt: new Date().toISOString(),
        lastModified: new Date().toISOString(),
      };

      await careerMemoryService.default.saveAssessment(assessmentRecord);
      await careerMemoryService.default.saveCareerMap(assessmentId, careerMap);
      
      console.log('💾 Career map saved to local storage');
    } catch (error) {
      console.warn('⚠️ Failed to save to local storage:', error);
      // Non-critical error, don't throw
    }
  }

  /**
   * Get service status
   * @returns {Object} Service status information
   */
  getStatus() {
    return {
      aiAvailable: openAICareerService.isAvailable(),
      mockApiAvailable: true,
      fallbackAvailable: true,
      preferredMethod: openAICareerService.isAvailable() ? 'AI' : 'Mock API',
      ...openAICareerService.getUsageInfo()
    };
  }
}

// Export singleton instance
const aiCareerMapApiService = new AICareerMapApiService();
export default aiCareerMapApiService;
