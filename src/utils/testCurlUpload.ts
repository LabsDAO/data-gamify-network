/**
 * Test script to verify AWS S3 upload using pre-signed URLs with curl
 * This script generates a pre-signed URL and then uses curl to upload a file
 * 
 * To run this script:
 * npx vite-node src/utils/testCurlUpload.ts
 */

import { getPresignedUploadUrl } from './awsPresignedUpload';
import { exec } from 'child_process';
import { promisify } from 'util';
import fs from 'fs';
import path from 'path';

const execPromise = promisify(exec);

// Create a temporary test file
const createTestFile = async (): Promise<string> => {
  const tempDir = path.join(process.cwd(), 'temp');
  const filePath = path.join(tempDir, 'test-upload.txt');
  
  // Create temp directory if it doesn't exist
  if (!fs.existsSync(tempDir)) {
    fs.mkdirSync(tempDir, { recursive: true });
  }
  
  // Write test content to file
  const content = 'This is a test file for AWS S3 upload testing';
  fs.writeFileSync(filePath, content);
  
  return filePath;
};

// Test the upload using curl
const testCurlUpload = async () => {
  console.log('Testing AWS S3 upload using pre-signed URL with curl...');
  console.log('-------------------------------------------------------');
  
  try {
    // Create a test file
    console.log('Creating test file...');
    const filePath = await createTestFile();
    console.log(`Test file created at: ${filePath}`);
    
    // Generate a pre-signed URL
    console.log('\nGenerating pre-signed URL...');
    // Use a dedicated directory for test files with a timestamp to avoid conflicts
    const testDirectory = `_system_tests_/${Date.now()}`;
    const { uploadUrl, publicUrl } = await getPresignedUploadUrl(
      'test-upload.txt',
      'text/plain',
      testDirectory
    );
    
    console.log(`Pre-signed URL generated: ${uploadUrl}`);
    console.log(`Public URL will be: ${publicUrl}`);
    
    // Upload the file using curl
    console.log('\nUploading file using curl...');
    
    // Remove any ACL parameters from the URL as the bucket doesn't allow ACLs
    const uploadUrlWithoutAcl = uploadUrl.replace(/&x-amz-acl=[^&]+/, '');
    
    const curlCommand = `curl -v -X PUT -H "Content-Type: text/plain" --upload-file "${filePath}" "${uploadUrlWithoutAcl}"`;
    console.log(`Executing: ${curlCommand}`);
    
    const { stdout, stderr } = await execPromise(curlCommand);
    
    console.log('\nCurl output:');
    console.log(stdout);
    
    if (stderr) {
      console.log('\nCurl error output:');
      console.log(stderr);
    }
    
    // Verify the upload
    console.log('\nVerifying upload...');
    try {
      const verifyCommand = `curl -s -I "${publicUrl}"`;
      const { stdout: verifyStdout } = await execPromise(verifyCommand);
      
      if (verifyStdout.includes('200 OK')) {
        console.log('✅ Upload successful! File is accessible at:');
        console.log(publicUrl);
      } else {
        console.log('❌ File verification failed. Response headers:');
        console.log(verifyStdout);
      }
    } catch (verifyError) {
      console.log('❌ Error verifying upload:');
      console.log(verifyError);
    }
    
    return publicUrl;
  } catch (error) {
    console.error('\n❌ Upload failed:');
    if (error instanceof Error) {
      console.error(error.message);
      console.error('\nStack trace:');
      console.error(error.stack);
    } else {
      console.error(String(error));
    }
    
    return null;
  }
};

// Run the test
testCurlUpload()
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