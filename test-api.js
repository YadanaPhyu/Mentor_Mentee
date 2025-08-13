// Test script for Career Map API
const testCareerMapAPI = async () => {
  const testData = {
    currentRole: 'Junior Developer',
    targetRole: 'Senior React Native Developer',
    skillsText: 'JavaScript, React, Node.js',
    currentSkills: ['JavaScript', 'React', 'Node.js'],
    experience: 'mid',
    hoursPerWeek: 15,
    budget: 1000,
    timestamp: new Date().toISOString(),
  };

  try {
    console.log('🚀 Testing Career Map API...');
    console.log('📝 Request data:', testData);
    
    const response = await fetch('http://localhost:3000/api/career-map', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(testData),
    });

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }

    const careerMap = await response.json();
    console.log('✅ API Response received!');
    console.log('📋 Career Map structure:');
    console.log('- roleSnapshot:', !!careerMap.roleSnapshot);
    console.log('- gapAnalysis:', !!careerMap.gapAnalysis);
    console.log('- weeklyPlan:', Array.isArray(careerMap.weeklyPlan) ? `${careerMap.weeklyPlan.length} weeks` : 'invalid');
    console.log('- capstone:', !!careerMap.capstone);
    
    if (careerMap.roleSnapshot) {
      console.log('\n🎯 Role Snapshot:');
      console.log('- Title:', careerMap.roleSnapshot.title);
      console.log('- Level:', careerMap.roleSnapshot.level);
      console.log('- Key Skills:', careerMap.roleSnapshot.keySkills?.length || 0);
      console.log('- Salary:', careerMap.roleSnapshot.averageSalary);
    }
    
    if (careerMap.gapAnalysis) {
      console.log('\n📊 Gap Analysis:');
      console.log('- Strong skills:', careerMap.gapAnalysis.strong?.length || 0);
      console.log('- Medium skills:', careerMap.gapAnalysis.medium?.length || 0);
      console.log('- Missing skills:', careerMap.gapAnalysis.missing?.length || 0);
    }
    
    console.log('\n🎉 API test completed successfully!');
    return careerMap;
    
  } catch (error) {
    console.error('❌ API test failed:', error.message);
    throw error;
  }
};

// Run the test
testCareerMapAPI().catch(console.error);
