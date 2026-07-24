require('dotenv').config();
const { sendSMS } = require('./utils/fast2sms');

async function testSMS() {
  console.log('🧪 Testing Fast2SMS Integration...');
  console.log('📱 API Key:', process.env.FAST2SMS_API_KEY ? '✅ Set' : '❌ Not set');
  
  if (!process.env.FAST2SMS_API_KEY) {
    console.error('❌ FAST2SMS_API_KEY not found in environment variables');
    console.log('💡 Please add FAST2SMS_API_KEY=your_api_key to your .env file');
    return;
  }

  const testNumber = '9398884972'; // Your test number
  const testMessage = 'Test SMS from Farmer Assistant - ' + new Date().toLocaleString();

  console.log('📞 Testing with number:', testNumber);
  console.log('💬 Message:', testMessage);
  console.log('⏳ Sending SMS...');

  try {
    const result = await sendSMS(testNumber, testMessage);
    console.log('✅ SMS sent successfully!');
    console.log('📊 Result:', result);
  } catch (error) {
    console.error('❌ SMS failed:', error.message);
    
    // Additional debugging info
    if (error.response) {
      console.error('🔍 API Response Status:', error.response.status);
      console.error('🔍 API Response Data:', error.response.data);
    }
  }
}

// Run the test
testSMS().then(() => {
  console.log('🏁 Test completed');
  process.exit(0);
}).catch(error => {
  console.error('💥 Test failed:', error);
  process.exit(1);
}); 