/**
 * Test script to verify environment variables are loaded correctly
 * Run with: npx ts-node src/utils/testEnvCredentials.ts
 */

// This is a simplified version of the getEnvCredentials function from awsStorage.ts
const getEnvCredentials = () => {
  const credentials = {
    accessKeyId: import.meta.env.VITE_AWS_ACCESS_KEY_ID || '(not set)',
    secretAccessKey: import.meta.env.VITE_AWS_SECRET_ACCESS_KEY ? '(set but hidden)' : '(not set)',
    region: import.meta.env.VITE_AWS_REGION || '(not set)',
    bucket: import.meta.env.VITE_AWS_BUCKET || '(not set)'
  };
  
  return credentials;
};

// Log the credentials (with secret key hidden for security)
console.log('Environment Variables Test:');
console.log('---------------------------');
console.log('AWS Credentials from Environment Variables:');
console.log(getEnvCredentials());
console.log('---------------------------');
console.log('Note: This is just a test script. In production, use the full implementation in awsStorage.ts');