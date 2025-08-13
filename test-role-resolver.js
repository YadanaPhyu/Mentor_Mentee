// Test script for Role Resolver Service
const RoleResolverService = require('./src/services/roleResolverService.js');
const roleResolverService = new RoleResolverService();

const testCases = [
  'ios app builder',
  'react native developer',
  'machine learning engineer', 
  'full stack developer',
  'data scientist',
  'ui/ux designer',
  'marketing manager',
  'chef',
  'teacher',
  'some random career that doesnt exist',
  'app developer',
  'backend engineer',
  'content creator',
];

async function testRoleResolver() {
  console.log('🧪 Testing Role Resolver Service...\n');

  for (const testInput of testCases) {
    console.log(`\n🔍 Testing: "${testInput}"`);
    console.log('─'.repeat(50));
    
    try {
      const result = await roleResolverService.resolveRole(testInput);
      
      console.log(`📝 Normalized: "${result.normalizedInput}"`);
      console.log(`🎯 Confidence: ${result.highestConfidence.toFixed(2)}`);
      console.log(`❓ Requires Confirmation: ${result.requiresConfirmation ? 'YES' : 'NO'}`);
      
      if (result.matches.length > 0) {
        console.log('🏆 Top Matches:');
        result.matches.forEach((match, index) => {
          console.log(`  ${index + 1}. ${match.role} (${(match.confidence * 100).toFixed(0)}% - ${match.matchType})`);
          if (match.matchedAlias) {
            console.log(`     └─ Matched alias: "${match.matchedAlias}"`);
          }
        });
      } else {
        console.log('❌ No matches found');
      }
      
    } catch (error) {
      console.error(`❌ Error testing "${testInput}":`, error.message);
    }
  }

  console.log('\n✅ Role Resolver testing completed!');
}

// Run the test
testRoleResolver().catch(console.error);
