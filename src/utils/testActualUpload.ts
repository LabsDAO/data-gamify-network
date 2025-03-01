/**
 * Test script to verify actual AWS S3 upload functionality
 * This script creates a small test file and attempts to upload it to S3
 * 
 * To run this script:
 * npx vite-node src/utils/testActualUpload.ts
 */

import { uploadWithPresignedUrl } from './awsPresignedUpload';
import fs from 'fs';
import path from 'path';
import { getAwsCredentials } from './awsStorage';

// Create a temporary test file
const createTestFile = async (): Promise<File> => {
  // For Node.js environment, we need to create a File-like object
  const content = 'This is a test file for AWS S3 upload testing';
  const buffer = Buffer.from(content);
  
  // Create a File-like object
  return {
    name: 'test-upload.txt',
    type: 'text/plain',
    size: buffer.length,
    arrayBuffer: async () => buffer.buffer,
    slice: () => buffer as any,
    stream: () => buffer.values() as any,
    text: async () => content,
  } as File;
};

// Test the actual upload
const testActualUpload = async () => {
  console.log('Testing actual AWS S3 upload functionality...');
  console.log('-----------------------------------------------');
  
  // Get AWS credentials to display info
  const credentials = getAwsCredentials();
  console.log('Using AWS credentials:');
  console.log(`- Access Key ID: ${credentials.accessKeyId.substring(0, 5)}...`);
  console.log(`- Region: ${credentials.region}`);
  console.log(`- Bucket: ${credentials.bucket}`);
  console.log('');
  
  try {
    // Create a test file
    console.log('Creating test file...');
    const testFile = await createTestFile();
    console.log(`Test file created: ${testFile.name} (${testFile.size} bytes)`);
    
    // Upload the file using pre-signed URL approach
    console.log('\nUploading file using pre-signed URL approach...');
    // Use a dedicated directory for test files with a timestamp to avoid conflicts
    const testDirectory = `_system_tests_/${Date.now()}`;
    const url = await uploadWithPresignedUrl(testFile, testDirectory);
    
    console.log('\n✅ Upload successful!');
    console.log(`File uploaded to: ${url}`);
    console.log('\nYou can verify the upload by visiting the URL in your browser.');
    
    // Try to fetch the file to verify it's accessible
    console.log('\nVerifying file accessibility...');
    try {
      const response = await fetch(url, { method: 'HEAD' });
      if (response.ok) {
        console.log('✅ File is accessible via HTTP request.');
      } else {
        console.log(`❌ File is not accessible. Status: ${response.status} ${response.statusText}`);
      }
    } catch (error) {
      console.log(`❌ Error verifying file accessibility: ${error instanceof Error ? error.message : String(error)}`);
    }
    
    return url;
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
    console.log('1. Check your AWS credentials in the .env file');
    console.log('2. Verify that your IAM user has s3:PutObject permission');
    console.log('3. Check if your S3 bucket exists and is accessible');
    console.log('4. Try configuring CORS on your S3 bucket using the configureBucketCors.ts script');
    
    return null;
  }
};

// Run the test
testActualUpload()
  .then(url => {
    if (url) {
      console.log('\nNext steps:');
      console.log('1. If the upload was successful, you can now use this approach in your application');
      console.log('2. Import the uploadWithPresignedUrl function from src/utils/awsPresignedUpload.ts');
      console.log('3. Use it in your application code:');
      console.log('   const url = await uploadWithPresignedUrl(file, "your-path/");');
    } else {
      console.log('\nPlease fix the issues and try again.');
    }
  })
  .catch(console.error);