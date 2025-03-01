/**
 * Test script to verify OORT Storage uploads using AWS v4 signature authentication
 * 
 * To run this script:
 * npx vite-node src/utils/testOortPresignedUpload.ts
 */

import { uploadToOortStorage, getOortCredentials, testOortPresignedUrl } from './oortStorageWithAwsAuth';
import * as fs from 'fs';
import * as path from 'path';

// Create a test file on disk
const createTestFile = (): { path: string; size: number; name: string; type: string } => {
  const content = 'This is a test file for OORT upload testing with AWS v4 signature';
  const filePath = path.join(__dirname, 'oort-test-upload.txt');
  
  // Write the file to disk
  fs.writeFileSync(filePath, content);
  
  // Return file info
  return {
    path: filePath,
    size: fs.statSync(filePath).size,
    name: 'oort-test-upload.txt',
    type: 'text/plain'
  };
};

// Test the upload
const testOortUpload = async () => {
  console.log('Testing OORT Storage upload with AWS v4 signature...');
  console.log('--------------------------------------------------');
  
  // Get OORT credentials to display info
  const credentials = getOortCredentials();
  console.log('Using OORT credentials:');
  console.log(`- Access Key: ${maskString(credentials.accessKey)}`);
  console.log(`- Secret Key: ${maskString(credentials.secretKey)}`);
  console.log(`- Endpoint: ${credentials.endpoint}`);
  console.log(`- Bucket: ${credentials.bucket}`);
  console.log('');
  
  // First, test generating a pre-signed URL
  console.log('Testing pre-signed URL generation...');
  await testOortPresignedUrl();
  console.log('');
  
  try {
    // Create a test file
    console.log('Creating test file...');
    const testFile = createTestFile();
    console.log(`Test file created: ${testFile.name} (${testFile.size} bytes)`);
    
    // Upload the file
    console.log('\nUploading file to OORT Storage...');
    const testDirectory = `_system_tests_/${Date.now()}`;
    
    // Create a File object from the file on disk
    const fileBuffer = fs.readFileSync(testFile.path);
    const file = new File([fileBuffer], testFile.name, { type: testFile.type });
    
    const result = await uploadToOortStorage(file, testDirectory);
    
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
      
      // Clean up the test file
      fs.unlinkSync(testFile.path);
      console.log(`Test file deleted: ${testFile.path}`);
      
      return result.url;
    } else {
      console.error('\n❌ Upload failed:');
      console.error(`Error: ${result.error || 'Unknown error'}`);
      
      if (result.statusCode) {
        console.error(`Status code: ${result.statusCode}`);
      }
      
      // Clean up the test file
      fs.unlinkSync(testFile.path);
      console.log(`Test file deleted: ${testFile.path}`);
      
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
    console.log('3. Verify that your OORT account has write permissions to the bucket');
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
      console.log('2. Import the uploadToOortStorage function from src/utils/oortStorageWithAwsAuth.ts');
      console.log('3. Use it in your application code:');
      console.log('   const result = await uploadToOortStorage(file, "Flat-tires/");');
    } else {
      console.log('\nPlease fix the issues and try again.');
    }
  })
  .catch(console.error);