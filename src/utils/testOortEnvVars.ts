/**
 * Test script to verify OORT environment variables are loaded correctly
 * 
 * To run this script:
 * npx vite-node src/utils/testOortEnvVars.ts
 */

import { getOortCredentials, isUsingCustomCredentials } from './oortStorage';

console.log('Testing OORT environment variables...');
console.log('--------------------------------------');

// Check for OORT Access Key
const oortAccessKey = import.meta.env.VITE_OORT_ACCESS_KEY;
if (oortAccessKey) {
  console.log('✅ VITE_OORT_ACCESS_KEY is set:', maskString(oortAccessKey));
} else {
  console.log('❌ VITE_OORT_ACCESS_KEY is not set');
}

// Check for OORT Secret Key
const oortSecretKey = import.meta.env.VITE_OORT_SECRET_KEY;
if (oortSecretKey) {
  console.log('✅ VITE_OORT_SECRET_KEY is set:', maskString(oortSecretKey));
} else {
  console.log('❌ VITE_OORT_SECRET_KEY is not set');
}

// Check for OORT Endpoint
const oortEndpoint = import.meta.env.VITE_OORT_ENDPOINT;
if (oortEndpoint) {
  console.log('✅ VITE_OORT_ENDPOINT is set:', oortEndpoint);
} else {
  console.log('❌ VITE_OORT_ENDPOINT is not set (will use default: https://s3-standard.oortech.com)');
}

// Check if custom credentials are being used
const usingCustomCredentials = isUsingCustomCredentials();
console.log(`\n${usingCustomCredentials ? '✅' : '❌'} Custom credentials are ${usingCustomCredentials ? '' : 'not '}being used`);

// Get the actual credentials that would be used
const credentials = getOortCredentials();
console.log('\nCredentials that will be used:');
console.log('- Access Key:', maskString(credentials.accessKey));
console.log('- Secret Key:', maskString(credentials.secretKey));

// Helper function to mask sensitive values
function maskString(str: string): string {
  if (str.length <= 8) {
    return '****';
  }
  
  const firstFour = str.substring(0, 4);
  const lastFour = str.substring(str.length - 4);
  const masked = '*'.repeat(Math.min(str.length - 8, 8));
  
  return `${firstFour}${masked}${lastFour}`;
}

console.log('\nIf both environment variables are set, your OORT configuration should work correctly.');
console.log('If any variables are missing, check your .env file and make sure it contains the correct values.');
console.log('\nTo use these environment variables in your code:');
console.log('import.meta.env.VITE_OORT_ACCESS_KEY');
console.log('import.meta.env.VITE_OORT_SECRET_KEY');
console.log('import.meta.env.VITE_OORT_ENDPOINT');

// Test uploading a file
console.log('\nTo test uploading a file to OORT, run:');
console.log('npx vite-node src/utils/testOortUpload.ts');