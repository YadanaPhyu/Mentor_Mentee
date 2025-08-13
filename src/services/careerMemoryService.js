import AsyncStorage from '@react-native-async-storage/async-storage';

/**
 * Career Memory Service
 * Handles storing and retrieving career assessments and resolved roles
 */
class CareerMemoryService {
  constructor() {
    this.STORAGE_KEYS = {
      CAREER_ASSESSMENTS: '@career_assessments',
      RESOLVED_ROLES: '@resolved_roles',
      CAREER_MAPS: '@career_maps',
    };
  }

  /**
   * Save a career assessment with resolved role
   * @param {Object} assessmentData - Assessment data with resolved role
   * @returns {Promise<string>} Assessment ID
   */
  async saveAssessment(assessmentData) {
    try {
      const assessmentId = `assessment_${Date.now()}`;
      const assessmentRecord = {
        id: assessmentId,
        ...assessmentData,
        createdAt: new Date().toISOString(),
        lastModified: new Date().toISOString(),
      };

      // Get existing assessments
      const existingAssessments = await this.getAssessments();
      const updatedAssessments = [...existingAssessments, assessmentRecord];

      // Save updated list
      await AsyncStorage.setItem(
        this.STORAGE_KEYS.CAREER_ASSESSMENTS,
        JSON.stringify(updatedAssessments)
      );

      console.log('💾 Saved career assessment:', assessmentId);
      return assessmentId;
    } catch (error) {
      console.error('❌ Failed to save assessment:', error);
      throw error;
    }
  }

  /**
   * Get all saved career assessments
   * @returns {Promise<Array>} Array of assessment records
   */
  async getAssessments() {
    try {
      const stored = await AsyncStorage.getItem(this.STORAGE_KEYS.CAREER_ASSESSMENTS);
      return stored ? JSON.parse(stored) : [];
    } catch (error) {
      console.error('❌ Failed to get assessments:', error);
      return [];
    }
  }

  /**
   * Get a specific assessment by ID
   * @param {string} assessmentId - Assessment ID
   * @returns {Promise<Object|null>} Assessment record or null
   */
  async getAssessment(assessmentId) {
    try {
      const assessments = await this.getAssessments();
      return assessments.find(assessment => assessment.id === assessmentId) || null;
    } catch (error) {
      console.error('❌ Failed to get assessment:', error);
      return null;
    }
  }

  /**
   * Save a resolved role for future use
   * @param {string} originalInput - Original user input
   * @param {Object} resolvedRole - Resolved role object
   * @returns {Promise<void>}
   */
  async saveResolvedRole(originalInput, resolvedRole) {
    try {
      const existingRoles = await this.getResolvedRoles();
      
      // Check if this input already exists, update if so
      const existingIndex = existingRoles.findIndex(
        role => role.originalInput.toLowerCase() === originalInput.toLowerCase()
      );

      const roleRecord = {
        originalInput,
        resolvedRole,
        usageCount: existingIndex >= 0 ? existingRoles[existingIndex].usageCount + 1 : 1,
        lastUsed: new Date().toISOString(),
        createdAt: existingIndex >= 0 ? existingRoles[existingIndex].createdAt : new Date().toISOString(),
      };

      if (existingIndex >= 0) {
        existingRoles[existingIndex] = roleRecord;
      } else {
        existingRoles.push(roleRecord);
      }

      await AsyncStorage.setItem(
        this.STORAGE_KEYS.RESOLVED_ROLES,
        JSON.stringify(existingRoles)
      );

      console.log('💾 Saved resolved role:', originalInput, '->', resolvedRole.role);
    } catch (error) {
      console.error('❌ Failed to save resolved role:', error);
    }
  }

  /**
   * Get all resolved roles
   * @returns {Promise<Array>} Array of resolved role records
   */
  async getResolvedRoles() {
    try {
      const stored = await AsyncStorage.getItem(this.STORAGE_KEYS.RESOLVED_ROLES);
      return stored ? JSON.parse(stored) : [];
    } catch (error) {
      console.error('❌ Failed to get resolved roles:', error);
      return [];
    }
  }

  /**
   * Get suggestions based on previously resolved roles
   * @param {string} input - User input
   * @returns {Promise<Array>} Array of suggestions
   */
  async getRoleSuggestions(input) {
    try {
      const resolvedRoles = await this.getResolvedRoles();
      const normalizedInput = input.toLowerCase();

      return resolvedRoles
        .filter(roleRecord => 
          roleRecord.originalInput.toLowerCase().includes(normalizedInput) ||
          roleRecord.resolvedRole.role.toLowerCase().includes(normalizedInput)
        )
        .sort((a, b) => b.usageCount - a.usageCount) // Sort by usage count
        .slice(0, 5) // Top 5 suggestions
        .map(roleRecord => ({
          ...roleRecord.resolvedRole,
          isFromMemory: true,
          usageCount: roleRecord.usageCount,
        }));
    } catch (error) {
      console.error('❌ Failed to get role suggestions:', error);
      return [];
    }
  }

  /**
   * Save a generated career map
   * @param {string} assessmentId - Assessment ID
   * @param {Object} careerMap - Generated career map
   * @returns {Promise<void>}
   */
  async saveCareerMap(assessmentId, careerMap) {
    try {
      const existingMaps = await this.getCareerMaps();
      
      const mapRecord = {
        id: `map_${Date.now()}`,
        assessmentId,
        careerMap,
        createdAt: new Date().toISOString(),
        lastModified: new Date().toISOString(),
      };

      const updatedMaps = [...existingMaps, mapRecord];
      
      await AsyncStorage.setItem(
        this.STORAGE_KEYS.CAREER_MAPS,
        JSON.stringify(updatedMaps)
      );

      console.log('💾 Saved career map for assessment:', assessmentId);
    } catch (error) {
      console.error('❌ Failed to save career map:', error);
    }
  }

  /**
   * Get all saved career maps
   * @returns {Promise<Array>} Array of career map records
   */
  async getCareerMaps() {
    try {
      const stored = await AsyncStorage.getItem(this.STORAGE_KEYS.CAREER_MAPS);
      return stored ? JSON.parse(stored) : [];
    } catch (error) {
      console.error('❌ Failed to get career maps:', error);
      return [];
    }
  }

  /**
   * Get career maps for a specific assessment
   * @param {string} assessmentId - Assessment ID
   * @returns {Promise<Array>} Array of career maps for the assessment
   */
  async getCareerMapsForAssessment(assessmentId) {
    try {
      const allMaps = await this.getCareerMaps();
      return allMaps.filter(mapRecord => mapRecord.assessmentId === assessmentId);
    } catch (error) {
      console.error('❌ Failed to get career maps for assessment:', error);
      return [];
    }
  }

  /**
   * Clear all stored data (for testing/reset)
   * @returns {Promise<void>}
   */
  async clearAll() {
    try {
      await AsyncStorage.multiRemove([
        this.STORAGE_KEYS.CAREER_ASSESSMENTS,
        this.STORAGE_KEYS.RESOLVED_ROLES,
        this.STORAGE_KEYS.CAREER_MAPS,
      ]);
      console.log('🗑️ Cleared all career memory data');
    } catch (error) {
      console.error('❌ Failed to clear career memory:', error);
    }
  }

  /**
   * Get storage statistics
   * @returns {Promise<Object>} Storage statistics
   */
  async getStats() {
    try {
      const assessments = await this.getAssessments();
      const resolvedRoles = await this.getResolvedRoles();
      const careerMaps = await this.getCareerMaps();

      return {
        totalAssessments: assessments.length,
        totalResolvedRoles: resolvedRoles.length,
        totalCareerMaps: careerMaps.length,
        mostUsedRoles: resolvedRoles
          .sort((a, b) => b.usageCount - a.usageCount)
          .slice(0, 5)
          .map(role => ({
            role: role.resolvedRole.role,
            usageCount: role.usageCount,
          })),
      };
    } catch (error) {
      console.error('❌ Failed to get stats:', error);
      return {
        totalAssessments: 0,
        totalResolvedRoles: 0,
        totalCareerMaps: 0,
        mostUsedRoles: [],
      };
    }
  }
}

export default new CareerMemoryService();
