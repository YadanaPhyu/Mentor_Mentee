/**
 * Simple OpenAI Test
 * Quick test to verify your API key works
 */

require('dotenv').config();

const testOpenAI = async () => {
  console.log('🔑 Testing OpenAI API Key...\n');
  
  // Check if key is configured
  const apiKey = process.env.EXPO_PUBLIC_OPENAI_API_KEY;
  const useRealAI = process.env.EXPO_PUBLIC_USE_REAL_AI === 'true';
  
  console.log(`API Key: ${apiKey ? (apiKey.startsWith('sk-') ? '✅ Valid format' : '❌ Invalid format') : '❌ Missing'}`);
  console.log(`Use Real AI: ${useRealAI ? '✅ Enabled' : '❌ Disabled'}`);
  
  if (!apiKey || apiKey === 'your_openai_api_key_here') {
    console.log('\n❌ Please update your .env file with a real OpenAI API key');
    console.log('   EXPO_PUBLIC_OPENAI_API_KEY=sk-your-key-here');
    return;
  }
  
  if (!useRealAI) {
    console.log('\n❌ Real AI is disabled. Set EXPO_PUBLIC_USE_REAL_AI=true');
    return;
  }
  
  try {
    console.log('\n🤖 Testing OpenAI connection...');
    
    const OpenAI = require('openai');
    const openai = new OpenAI({
      apiKey: apiKey,
    });
    
    const response = await openai.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages: [
        {
          role: "system",
          content: "You are a helpful assistant. Respond with exactly: 'OpenAI connection successful!'"
        },
        {
          role: "user",
          content: "Test connection"
        }
      ],
      max_tokens: 10,
      temperature: 0
    });
    
    const result = response.choices[0].message.content;
    console.log(`✅ OpenAI Response: "${result}"`);
    console.log('✅ API key is working correctly!');
    
    console.log('\n🎯 Your AI integration is ready!');
    console.log('   - Role resolution will use GPT-3.5');
    console.log('   - Career maps will use GPT-4');
    console.log('   - Estimated cost: ~$0.01-0.03 per career map');
    
  } catch (error) {
    console.error('❌ OpenAI test failed:', error.message);
    
    if (error.message.includes('401')) {
      console.log('   → Invalid API key. Check your key is correct.');
    } else if (error.message.includes('insufficient_quota')) {
      console.log('   → No credits available. Add billing to your OpenAI account.');
    } else if (error.message.includes('rate_limit')) {
      console.log('   → Rate limit exceeded. Wait a moment and try again.');
    } else {
      console.log('   → Check your internet connection and API key.');
    }
  }
};

// Run test
testOpenAI().catch(console.error);
