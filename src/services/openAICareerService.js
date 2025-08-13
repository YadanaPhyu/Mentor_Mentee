/**
 * OpenAI Career Service
 * Real AI integration for career mapping and role resolution
 */

import OpenAI from 'openai';

class OpenAICareerService {
  constructor() {
    this.openai = null;
    this.isEnabled = false;
    this.initializeOpenAI();
  }

  initializeOpenAI() {
    try {
      const apiKey = process.env.EXPO_PUBLIC_OPENAI_API_KEY;
      const useRealAI = process.env.EXPO_PUBLIC_USE_REAL_AI === 'true';
      
      if (apiKey && apiKey !== 'your_openai_api_key_here' && useRealAI) {
        this.openai = new OpenAI({
          apiKey: apiKey,
          dangerouslyAllowBrowser: true // Required for React Native/Expo
        });
        this.isEnabled = true;
        console.log('✅ OpenAI service initialized successfully');
      } else {
        console.log('🔄 OpenAI not configured, using mock AI');
        this.isEnabled = false;
      }
    } catch (error) {
      console.error('❌ Failed to initialize OpenAI:', error);
      this.isEnabled = false;
    }
  }

  /**
   * Resolve user input to professional role titles using AI
   * @param {string} userInput - User's career goal input
   * @returns {Promise<Array>} Array of role matches with confidence scores
   */
  async resolveRole(userInput) {
    if (!this.isEnabled) {
      throw new Error('OpenAI not enabled');
    }

    try {
      console.log(`🤖 OpenAI analyzing role input: "${userInput}"`);
      
      const prompt = `
Analyze the user input "${userInput}" and suggest the 3 most appropriate professional job titles.

Consider:
- Standard industry job titles
- What the user likely means based on common terminology
- Variations and informal names for roles
- Technology industry standards

Respond with JSON only in this exact format:
{
  "matches": [
    {
      "role": "Exact Professional Job Title",
      "confidence": 0.95,
      "explanation": "Brief explanation of why this matches",
      "category": "Technology/Healthcare/Business/etc",
      "level": "Entry/Mid/Senior"
    }
  ]
}

Confidence should be 0.0 to 1.0. Order by highest confidence first. Include exactly 3 matches.
`;

      const response = await this.openai.chat.completions.create({
        model: "gpt-3.5-turbo",
        messages: [
          {
            role: "system",
            content: "You are an expert career counselor who standardizes job titles. Always respond with valid JSON only."
          },
          {
            role: "user",
            content: prompt
          }
        ],
        temperature: 0.3,
        max_tokens: 600,
        response_format: { type: "json_object" }
      });

      const result = JSON.parse(response.choices[0].message.content);
      console.log('✅ OpenAI role resolution completed');
      
      return {
        originalInput: userInput,
        matches: result.matches || [],
        highestConfidence: result.matches?.[0]?.confidence || 0,
        requiresConfirmation: !result.matches?.[0] || result.matches[0].confidence < 0.8,
        timestamp: new Date().toISOString(),
        aiGenerated: true
      };
      
    } catch (error) {
      console.error('❌ OpenAI role resolution failed:', error);
      throw error;
    }
  }

  /**
   * Generate comprehensive career map using AI
   * @param {Object} assessmentData - User assessment data
   * @returns {Promise<Object>} Complete career map data
   */
  async generateCareerMap(assessmentData) {
    if (!this.isEnabled) {
      throw new Error('OpenAI not enabled');
    }

    try {
      console.log('🤖 OpenAI generating comprehensive career map...');
      
      const prompt = `
You are an expert career counselor and learning path designer. Create a comprehensive 8-week career roadmap for someone transitioning from "${assessmentData.currentRole}" to "${assessmentData.targetRole}".

Current Information:
- Current Role: ${assessmentData.currentRole}
- Target Role: ${assessmentData.targetRole}
- Current Skills: ${assessmentData.skillsText || 'No specific skills mentioned'}
- Experience Level: ${assessmentData.experience || 'Not specified'}
- Study Time Available: ${assessmentData.hoursPerWeek || 10} hours per week
- Learning Budget: $${assessmentData.budget || 500}

Create a detailed, realistic, and actionable career transition plan. Consider the person's current skills and how they transfer to the target role.

Respond with JSON only in this exact format:
{
  "roleSnapshot": {
    "title": "${assessmentData.targetRole}",
    "level": "Entry Level/Mid Level/Senior Level",
    "keySkills": ["skill1", "skill2", "skill3", "skill4", "skill5"],
    "averageSalary": "$XX,XXX - $XXX,XXX",
    "description": "Comprehensive 2-3 sentence role description",
    "marketDemand": "High/Medium/Low",
    "growthRate": "XX% (Above/Below average)",
    "topCompanies": ["Company1", "Company2", "Company3"]
  },
  "gapAnalysis": {
    "strong": ["Current strengths that transfer well to target role"],
    "medium": ["Skills that need improvement or are partially relevant"],
    "missing": ["Critical skills that must be learned"]
  },
  "weeklyPlan": [
    {
      "week": 1,
      "goals": ["Specific learning objective 1", "Specific learning objective 2"],
      "resources": ["Recommended resource 1", "Recommended resource 2"],
      "deliverable": "Specific deliverable or project for this week"
    },
    {
      "week": 2,
      "goals": ["Week 2 learning objectives"],
      "resources": ["Week 2 resources"],
      "deliverable": "Week 2 deliverable"
    }
  ],
  "capstone": {
    "title": "Portfolio Project Name",
    "description": "Detailed description of final portfolio project",
    "keyFeatures": ["feature1", "feature2", "feature3"],
    "expectedOutcome": "What this project demonstrates to potential employers"
  },
  "marketInsights": {
    "industryTrends": "Current relevant industry trends",
    "remoteOpportunities": "High/Medium/Low",
    "competitionLevel": "High/Medium/Low",
    "recommendedCertifications": ["cert1", "cert2"]
  }
}

Make the plan:
- Realistic for the available study time
- Progressive from basic to advanced concepts
- Include practical, hands-on projects
- Consider the current skill level
- Provide exactly 8 weeks of content
- Focus on the most important skills first
- Include modern, relevant technologies and practices
`;

      const response = await this.openai.chat.completions.create({
        model: "gpt-4-turbo-preview",
        messages: [
          {
            role: "system",
            content: "You are an expert career counselor specializing in technology and professional development. Always respond with valid JSON only."
          },
          {
            role: "user",
            content: prompt
          }
        ],
        temperature: 0.7,
        max_tokens: 4000,
        response_format: { type: "json_object" }
      });

      const careerMapData = JSON.parse(response.choices[0].message.content);
      
      // Add metadata
      careerMapData.id = `career-map-${Date.now()}`;
      careerMapData.generatedAt = new Date().toISOString();
      careerMapData.aiGenerated = true;
      careerMapData.targetRole = assessmentData.targetRole;
      careerMapData.currentRole = assessmentData.currentRole;
      
      console.log('✅ OpenAI career map generated successfully!');
      return careerMapData;
      
    } catch (error) {
      console.error('❌ OpenAI career map generation failed:', error);
      throw error;
    }
  }

  /**
   * Check if OpenAI service is available and configured
   * @returns {boolean} True if OpenAI is ready to use
   */
  isAvailable() {
    return this.isEnabled;
  }

  /**
   * Get usage statistics (for monitoring API costs)
   * @returns {Object} Usage information
   */
  getUsageInfo() {
    return {
      enabled: this.isEnabled,
      model: this.isEnabled ? 'gpt-4-turbo-preview' : 'mock',
      estimatedCostPerRequest: this.isEnabled ? '$0.01-0.03' : '$0.00'
    };
  }
}

// Export singleton instance
const openAICareerService = new OpenAICareerService();
export default openAICareerService;
