/**
 * Role Resolver AI Service
 * Normalizes user input and matches to professional role titles
 */

class RoleResolverService {
  constructor() {
    // Comprehensive role database with variations and aliases
    this.roleDatabase = {
      // Software Development
      'iOS Developer': {
        aliases: ['ios app builder', 'iphone developer', 'ios programmer', 'swift developer', 'ios mobile developer'],
        category: 'Software Development',
        level: 'Specialized',
        confidence: 0.95
      },
      'Android Developer': {
        aliases: ['android app builder', 'android programmer', 'kotlin developer', 'java mobile developer'],
        category: 'Software Development', 
        level: 'Specialized',
        confidence: 0.95
      },
      'React Native Developer': {
        aliases: ['react native programmer', 'mobile app developer', 'cross platform developer', 'rn developer'],
        category: 'Software Development',
        level: 'Specialized', 
        confidence: 0.90
      },
      'Full Stack Developer': {
        aliases: ['fullstack developer', 'full-stack programmer', 'web developer', 'full stack engineer'],
        category: 'Software Development',
        level: 'Generalist',
        confidence: 0.85
      },
      'Frontend Developer': {
        aliases: ['front-end developer', 'ui developer', 'web frontend', 'client-side developer'],
        category: 'Software Development',
        level: 'Specialized',
        confidence: 0.90
      },
      'Backend Developer': {
        aliases: ['back-end developer', 'server developer', 'api developer', 'backend engineer'],
        category: 'Software Development',
        level: 'Specialized',
        confidence: 0.90
      },
      'Software Engineer': {
        aliases: ['software developer', 'programmer', 'software programmer', 'code developer'],
        category: 'Software Development',
        level: 'Generalist',
        confidence: 0.80
      },
      'DevOps Engineer': {
        aliases: ['devops specialist', 'deployment engineer', 'infrastructure engineer', 'site reliability engineer'],
        category: 'Software Development',
        level: 'Specialized',
        confidence: 0.85
      },

      // Data & Analytics
      'Data Scientist': {
        aliases: ['data analyst', 'data researcher', 'machine learning scientist', 'ai researcher'],
        category: 'Data & Analytics',
        level: 'Specialized',
        confidence: 0.90
      },
      'Machine Learning Engineer': {
        aliases: ['ml engineer', 'ai engineer', 'deep learning engineer', 'ai developer'],
        category: 'Data & Analytics',
        level: 'Specialized',
        confidence: 0.85
      },
      'Data Analyst': {
        aliases: ['business analyst', 'data researcher', 'analytics specialist', 'reporting analyst'],
        category: 'Data & Analytics',
        level: 'Entry-Mid',
        confidence: 0.80
      },

      // Design
      'UX/UI Designer': {
        aliases: ['ui designer', 'ux designer', 'user interface designer', 'user experience designer', 'web designer'],
        category: 'Design',
        level: 'Specialized',
        confidence: 0.85
      },
      'Graphic Designer': {
        aliases: ['visual designer', 'brand designer', 'creative designer', 'graphics artist'],
        category: 'Design',
        level: 'Entry-Mid',
        confidence: 0.80
      },

      // Product & Management
      'Product Manager': {
        aliases: ['product owner', 'pm', 'product lead', 'product strategist'],
        category: 'Product & Management',
        level: 'Mid-Senior',
        confidence: 0.85
      },
      'Project Manager': {
        aliases: ['project coordinator', 'project lead', 'program manager', 'scrum master'],
        category: 'Product & Management',
        level: 'Mid-Senior',
        confidence: 0.80
      },

      // Marketing & Sales
      'Digital Marketing Manager': {
        aliases: ['marketing manager', 'digital marketer', 'online marketing specialist', 'marketing coordinator'],
        category: 'Marketing & Sales',
        level: 'Mid-Senior',
        confidence: 0.80
      },
      'Content Creator': {
        aliases: ['content writer', 'blogger', 'youtuber', 'social media creator', 'influencer'],
        category: 'Marketing & Sales',
        level: 'Entry-Mid',
        confidence: 0.75
      },
      'Sales Manager': {
        aliases: ['sales representative', 'account manager', 'sales executive', 'business development'],
        category: 'Marketing & Sales',
        level: 'Mid-Senior',
        confidence: 0.75
      },

      // Healthcare
      'Nurse Practitioner': {
        aliases: ['nurse', 'registered nurse', 'rn', 'clinical nurse', 'healthcare provider'],
        category: 'Healthcare',
        level: 'Professional',
        confidence: 0.85
      },
      'Physical Therapist': {
        aliases: ['physiotherapist', 'pt', 'rehabilitation therapist', 'sports therapist'],
        category: 'Healthcare',
        level: 'Professional',
        confidence: 0.85
      },

      // Education
      'Teacher': {
        aliases: ['educator', 'instructor', 'high school teacher', 'elementary teacher', 'professor'],
        category: 'Education',
        level: 'Professional',
        confidence: 0.80
      },

      // Other Professions
      'Chef': {
        aliases: ['cook', 'culinary artist', 'kitchen chef', 'professional chef', 'head chef'],
        category: 'Culinary',
        level: 'Professional',
        confidence: 0.80
      },
      'Real Estate Agent': {
        aliases: ['realtor', 'property agent', 'real estate broker', 'property sales'],
        category: 'Sales',
        level: 'Professional',
        confidence: 0.80
      }
    };
  }

  /**
   * Resolve user input to professional role matches
   * @param {string} userInput - Raw user input
   * @returns {Promise<Object>} Resolution result with matches and confidence
   */
  async resolveRole(userInput) {
    const normalizedInput = this.normalizeInput(userInput);
    const matches = this.findMatches(normalizedInput);
    const topMatches = this.rankMatches(matches).slice(0, 3);
    
    const result = {
      originalInput: userInput,
      normalizedInput,
      matches: topMatches,
      highestConfidence: topMatches.length > 0 ? topMatches[0].confidence : 0,
      requiresConfirmation: topMatches.length === 0 || topMatches[0].confidence < 0.75,
      timestamp: new Date().toISOString()
    };

    console.log('🔍 Role Resolution Result:', result);
    return result;
  }

  /**
   * Normalize user input for better matching
   * @param {string} input - Raw user input
   * @returns {string} Normalized input
   */
  normalizeInput(input) {
    return input
      .toLowerCase()
      .trim()
      .replace(/[^\w\s]/g, '') // Remove special characters
      .replace(/\s+/g, ' ') // Normalize whitespace
      .replace(/\b(app|application)\b/g, '') // Remove common filler words
      .replace(/\b(software|computer)\b/g, '')
      .trim();
  }

  /**
   * Find role matches based on normalized input
   * @param {string} normalizedInput - Normalized user input
   * @returns {Array} Array of potential matches
   */
  findMatches(normalizedInput) {
    const matches = [];

    Object.entries(this.roleDatabase).forEach(([roleName, roleData]) => {
      // Check exact role name match
      const roleNameNormalized = roleName.toLowerCase();
      if (roleNameNormalized.includes(normalizedInput) || normalizedInput.includes(roleNameNormalized)) {
        matches.push({
          role: roleName,
          confidence: 0.95,
          matchType: 'exact',
          ...roleData
        });
        return;
      }

      // Check alias matches
      roleData.aliases.forEach(alias => {
        const aliasNormalized = alias.toLowerCase();
        const similarity = this.calculateSimilarity(normalizedInput, aliasNormalized);
        
        if (similarity > 0.6) {
          matches.push({
            role: roleName,
            confidence: similarity * 0.9, // Slightly lower confidence for alias matches
            matchType: 'alias',
            matchedAlias: alias,
            ...roleData
          });
        }
      });

      // Check partial word matches
      const words = normalizedInput.split(' ');
      const roleWords = roleNameNormalized.split(' ');
      
      let wordMatches = 0;
      words.forEach(word => {
        if (word.length > 2) { // Ignore very short words
          roleWords.forEach(roleWord => {
            if (roleWord.includes(word) || word.includes(roleWord)) {
              wordMatches++;
            }
          });
        }
      });

      if (wordMatches > 0) {
        const confidence = (wordMatches / Math.max(words.length, roleWords.length)) * 0.7;
        matches.push({
          role: roleName,
          confidence,
          matchType: 'partial',
          wordMatches,
          ...roleData
        });
      }
    });

    return matches;
  }

  /**
   * Calculate string similarity using simple algorithm
   * @param {string} str1 - First string
   * @param {string} str2 - Second string
   * @returns {number} Similarity score (0-1)
   */
  calculateSimilarity(str1, str2) {
    const longer = str1.length > str2.length ? str1 : str2;
    const shorter = str1.length > str2.length ? str2 : str1;
    
    if (longer.length === 0) return 1.0;
    
    const editDistance = this.levenshteinDistance(longer, shorter);
    return (longer.length - editDistance) / longer.length;
  }

  /**
   * Calculate Levenshtein distance between two strings
   * @param {string} str1 - First string
   * @param {string} str2 - Second string
   * @returns {number} Edit distance
   */
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

  /**
   * Rank and deduplicate matches by confidence
   * @param {Array} matches - Array of matches
   * @returns {Array} Ranked and deduplicated matches
   */
  rankMatches(matches) {
    // Deduplicate by role name, keeping highest confidence
    const uniqueMatches = {};
    matches.forEach(match => {
      if (!uniqueMatches[match.role] || uniqueMatches[match.role].confidence < match.confidence) {
        uniqueMatches[match.role] = match;
      }
    });

    // Sort by confidence descending
    return Object.values(uniqueMatches)
      .sort((a, b) => b.confidence - a.confidence);
  }

  /**
   * Get suggested roles for empty input or fallback
   * @returns {Array} Array of suggested roles
   */
  getSuggestedRoles() {
    const popularRoles = [
      'Software Engineer',
      'Data Scientist',
      'Product Manager',
      'UX/UI Designer',
      'Digital Marketing Manager',
      'iOS Developer',
      'Full Stack Developer',
      'Machine Learning Engineer'
    ];

    return popularRoles.map(role => ({
      role,
      confidence: 1.0,
      matchType: 'suggestion',
      ...this.roleDatabase[role]
    }));
  }

  /**
   * Create a custom role entry for unmatched input
   * @param {string} userInput - Original user input
   * @returns {Object} Custom role object
   */
  createCustomRole(userInput) {
    return {
      role: this.capitalizeWords(userInput),
      confidence: 0.5,
      matchType: 'custom',
      category: 'Custom',
      level: 'Unspecified',
      isCustom: true,
      originalInput: userInput
    };
  }

  /**
   * Capitalize words for display
   * @param {string} str - Input string
   * @returns {string} Capitalized string
   */
  capitalizeWords(str) {
    return str.replace(/\b\w/g, char => char.toUpperCase());
  }
}

export default RoleResolverService;
