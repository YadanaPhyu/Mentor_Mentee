import { CareerMap, CareerIntakeData, WeeklyItem } from '../types/careerMap';

class CareerMapClient {
  private baseUrl: string;

  constructor() {
    // For MVP, using mock data. In production, this would be your API endpoint
    this.baseUrl = __DEV__ ? 'http://localhost:3000/api' : 'https://your-api.com/api';
  }

  /**
   * Generate a career map based on intake data
   */
  async generateCareerMap(intakeData: CareerIntakeData): Promise<CareerMap> {
    try {
      // For MVP, return deterministic mock data based on input
      return this.getMockCareerMap(intakeData);
      
      // In production, uncomment this:
      // const response = await fetch(`${this.baseUrl}/career-map`, {
      //   method: 'POST',
      //   headers: { 'Content-Type': 'application/json' },
      //   body: JSON.stringify(intakeData)
      // });
      // return await response.json();
    } catch (error) {
      console.error('Failed to generate career map:', error);
      // Fallback to mock data
      return this.getMockCareerMap(intakeData);
    }
  }

  /**
   * Regenerate plan (for progress tracker)
   */
  async regeneratePlan(currentProgress: any, intakeData: CareerIntakeData): Promise<CareerMap> {
    // For MVP, just return updated mock data
    return this.generateCareerMap(intakeData);
  }

  /**
   * Mock career map generator for MVP
   */
  private getMockCareerMap(intakeData: CareerIntakeData): CareerMap {
    const { targetRole, currentSkills, hoursPerWeek } = intakeData;
    
    // Deterministic mock data based on target role
    const roleSnapshotMap: Record<string, any> = {
      'React Native Developer': {
        title: 'Senior React Native Developer',
        level: 'Senior',
        keySkills: ['React Native', 'TypeScript', 'Mobile Development', 'Redux', 'API Integration'],
        averageSalary: '$85,000 - $120,000',
        description: 'Build and maintain cross-platform mobile applications using React Native'
      },
      'Full Stack Developer': {
        title: 'Full Stack Developer',
        level: 'Mid-Senior',
        keySkills: ['React', 'Node.js', 'Database Design', 'API Development', 'DevOps'],
        averageSalary: '$75,000 - $110,000',
        description: 'Develop both frontend and backend systems for web applications'
      },
      'Data Scientist': {
        title: 'Data Scientist',
        level: 'Senior',
        keySkills: ['Python', 'Machine Learning', 'Statistics', 'SQL', 'Data Visualization'],
        averageSalary: '$90,000 - $130,000',
        description: 'Extract insights from data to drive business decisions'
      }
    };

    const roleSnapshot = roleSnapshotMap[targetRole] || {
      title: targetRole,
      level: 'Mid-Level',
      keySkills: ['Problem Solving', 'Communication', 'Technical Skills'],
      averageSalary: '$60,000 - $90,000',
      description: `Professional working in ${targetRole} field`
    };

    // Calculate skill gaps
    const requiredSkills = roleSnapshot.keySkills;
    const strong = currentSkills.filter(skill => 
      requiredSkills.some(req => req.toLowerCase().includes(skill.toLowerCase()))
    );
    const missing = requiredSkills.filter(skill => 
      !currentSkills.some(current => skill.toLowerCase().includes(current.toLowerCase()))
    );
    const medium = requiredSkills.filter(skill => 
      !strong.includes(skill) && !missing.includes(skill)
    );

    // Generate 8-week plan
    const weeklyPlan = this.generateWeeklyPlan(missing, medium, hoursPerWeek);

    // Generate capstone project
    const capstone = this.generateCapstone(targetRole);

    return {
      roleSnapshot,
      gapAnalysis: { strong, medium, missing },
      weeklyPlan,
      capstone
    };
  }

  private generateWeeklyPlan(missing: string[], medium: string[], hoursPerWeek: number): WeeklyItem[] {
    const skills = [...missing, ...medium];
    const weeks: WeeklyItem[] = [];

    for (let week = 1; week <= 8; week++) {
      const skillIndex = (week - 1) % skills.length;
      const currentSkill = skills[skillIndex] || 'Professional Development';
      
      weeks.push({
        week,
        goals: [
          `Master fundamentals of ${currentSkill}`,
          `Complete ${Math.ceil(hoursPerWeek / 3)} hours of practice`,
          `Build a small project using ${currentSkill}`
        ],
        resources: [
          `${currentSkill} Online Course`,
          `${currentSkill} Documentation`,
          `Practice Projects Repository`
        ],
        deliverable: `${currentSkill} mini-project with documentation`
      });
    }

    return weeks;
  }

  private generateCapstone(targetRole: string): { title: string; steps: string[]; expectedOutcome: string } {
    const capstoneMap: Record<string, any> = {
      'React Native Developer': {
        title: 'Cross-Platform Task Manager App',
        steps: [
          'Design app architecture and user interface',
          'Implement core task management features',
          'Add user authentication and data persistence',
          'Integrate push notifications',
          'Deploy to app stores and create documentation'
        ],
        expectedOutcome: 'A fully functional mobile app demonstrating React Native mastery'
      },
      'Full Stack Developer': {
        title: 'E-commerce Platform',
        steps: [
          'Design database schema and API architecture',
          'Build RESTful API with authentication',
          'Create responsive frontend interface',
          'Implement payment processing',
          'Deploy to cloud platform with CI/CD'
        ],
        expectedOutcome: 'Complete web application with frontend, backend, and deployment'
      },
      'Data Scientist': {
        title: 'Predictive Analytics Dashboard',
        steps: [
          'Collect and clean real-world dataset',
          'Perform exploratory data analysis',
          'Build and train machine learning model',
          'Create interactive visualization dashboard',
          'Present findings and recommendations'
        ],
        expectedOutcome: 'Data science project with model, visualizations, and business insights'
      }
    };

    return capstoneMap[targetRole] || {
      title: `${targetRole} Portfolio Project`,
      steps: [
        'Define project scope and requirements',
        'Research and plan implementation',
        'Build core functionality',
        'Test and refine features',
        'Document and present project'
      ],
      expectedOutcome: `Professional portfolio project demonstrating ${targetRole} skills`
    };
  }
}

export default new CareerMapClient();
