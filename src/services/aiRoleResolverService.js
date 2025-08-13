/**
 * AI-Enhanced Role Resolver Service
 * Combines OpenAI with fallback algorithmic matching
 */

import openAICareerService from './openAICareerService.js';
import RoleResolverService from './roleResolverService.js';

class AIRoleResolverService {
  constructor() {
    this.fallbackResolver = new RoleResolverService();
  }

  /**
   * Resolve role using AI first, fallback to algorithmic matching
   * @param {string} userInput - User's career goal input
   * @returns {Promise<Object>} Role resolution result
   */
  async resolveRole(userInput) {
    try {
      // Try OpenAI first if available
      if (openAICareerService.isAvailable()) {
        console.log('🤖 Using OpenAI for role resolution...');
        
        try {
          const aiResult = await openAICareerService.resolveRole(userInput);
          
          // Validate AI response
          if (aiResult.matches && aiResult.matches.length > 0) {
            console.log(`✅ AI resolved "${userInput}" with ${aiResult.matches.length} matches`);
            return this.formatAIResult(aiResult);
          }
        } catch (aiError) {
          console.warn('⚠️ AI resolution failed, falling back to algorithmic:', aiError.message);
        }
      }

      // Fallback to algorithmic matching
      console.log('🔄 Using algorithmic role resolution...');
      const algorithmicResult = await this.fallbackResolver.resolveRole(userInput);
      return this.formatAlgorithmicResult(algorithmicResult);

    } catch (error) {
      console.error('❌ Role resolution completely failed:', error);
      
      // Last resort: return basic match
      return {
        originalInput: userInput,
        normalizedInput: userInput.toLowerCase().trim(),
        matches: [{
          role: userInput,
          confidence: 0.5,
          matchType: 'custom',
          category: 'Custom',
          level: 'Not specified'
        }],
        highestConfidence: 0.5,
        requiresConfirmation: true,
        timestamp: new Date().toISOString(),
        aiGenerated: false
      };
    }
  }

  /**
   * Format AI result to match expected structure
   * @param {Object} aiResult - Result from OpenAI
   * @returns {Object} Formatted result
   */
  formatAIResult(aiResult) {
    const matches = aiResult.matches.map(match => ({
      role: match.role,
      confidence: match.confidence,
      matchType: 'ai',
      category: match.category || 'Technology',
      level: match.level || 'Mid Level',
      explanation: match.explanation
    }));

    return {
      originalInput: aiResult.originalInput,
      normalizedInput: aiResult.originalInput.toLowerCase().trim(),
      matches: matches,
      highestConfidence: matches[0]?.confidence || 0,
      requiresConfirmation: matches[0]?.confidence < 0.8,
      timestamp: new Date().toISOString(),
      aiGenerated: true
    };
  }

  /**
   * Format algorithmic result to match expected structure
   * @param {Object} algorithmicResult - Result from algorithmic resolver
   * @returns {Object} Formatted result
   */
  formatAlgorithmicResult(algorithmicResult) {
    return {
      ...algorithmicResult,
      aiGenerated: false
    };
  }

  /**
   * Get service status and configuration
   * @returns {Object} Service status
   */
  getStatus() {
    return {
      aiAvailable: openAICareerService.isAvailable(),
      fallbackAvailable: true,
      preferredMethod: openAICareerService.isAvailable() ? 'AI' : 'Algorithmic',
      ...openAICareerService.getUsageInfo()
    };
  }
}

// Export singleton instance
const aiRoleResolverService = new AIRoleResolverService();
export default aiRoleResolverService;
