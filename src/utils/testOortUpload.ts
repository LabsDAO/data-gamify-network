/**
 * Test script to verify OORT file uploads
 * 
 * To run this script:
 * npx vite-node src/utils/testOortUpload.ts
 */

import { uploadToOortStorage, getOortCredentials, setUseRealOortStorage, UploadResult } from './oortStorage';

// Create a test file
const createTestFile = (): File => {
  const content = 'This is a test file for OORT upload testing';
  const blob = new Blob([content], { type: 'text/plain' });
  
  // Create a File object
  return new File([blob], 'oort-test-upload.txt', { type: 'text/plain' });
};

// Test the upload
const testOortUpload = async () => {
  console.log('Testing OORT file upload...');
  console.log('---------------------------');
  
  // Get OORT credentials to display info
  const credentials = getOortCredentials();
  console.log('Using OORT credentials:');
  console.log(`- Access Key: ${maskString(credentials.accessKey)}`);
  console.log(`- Secret Key: ${maskString(credentials.secretKey)}`);
  console.log(`- Endpoint: ${import.meta.env.VITE_OORT_ENDPOINT || 'https://s3-standard.oortech.com'} (Standard)`);
  console.log('');
  
  // Ensure we're using real OORT storage, not the mock
  setUseRealOortStorage(true);
  
  try {
    // Create a test file
    console.log('Creating test file...');
    const testFile = createTestFile();
    console.log(`Test file created: ${testFile.name} (${testFile.size} bytes)`);
    
    // Upload the file
    console.log('\nUploading file to OORT...');
    const testDirectory = `_system_tests_/${Date.now()}`;
    const result = await uploadToOortStorage(testFile, testDirectory);
    
    if (result.success) {
      console.log('\n✅ Upload successful!');
      console.log(`File uploaded to: ${result.url}`);
      
      if (result.verified) {
        console.log('✅ File verification successful - the file is accessible.');
      } else {
        console.log('⚠️ File verification failed - the file may not be immediately accessible.');
      }
      
      if (result.statusCode) {
        console.log(`Status code: ${result.statusCode}`);
      }
      
      console.log('\nYou can verify the upload by visiting the URL in your browser.');
      
      return result.url;
    } else {
      console.error('\n❌ Upload failed:');
      console.error(`Error: ${result.error || 'Unknown error'}`);
      
      if (result.statusCode) {
        console.error(`Status code: ${result.statusCode}`);
      }
      
      return null;
    }
  } catch (error) {
    console.error('\n❌ Upload failed:');
    if (error instanceof Error) {
      console.error(error.message);
      console.error('\nStack trace:');
      console.error(error.stack);
    } else {
      console.error(String(error));
    }
    
    // Provide troubleshooting guidance
    console.log('\nTroubleshooting steps:');
    console.log('1. Check your OORT credentials in the .env file');
    console.log('2. Verify that your OORT endpoint is correct (VITE_OORT_ENDPOINT)');
    console.log('3. Verify that your OORT account has write permissions');
    console.log('4. Check your network connection');
    
    return null;
  }
};

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

// Run the test
testOortUpload()
  .then(url => {
    if (url) {
      console.log('\nNext steps:');
      console.log('1. If the upload was successful, you can now use OORT storage in your application');
      console.log('2. Import the uploadToOortStorage function from src/utils/oortStorage.ts');
      console.log('3. Use it in your application code:');
      console.log('   const url = await uploadToOortStorage(file, "Flat-tires/");');
    } else {
      console.log('\nPlease fix the issues and try again.');
    }
  })
  .catch(console.error);