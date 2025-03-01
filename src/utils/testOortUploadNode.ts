/**
 * Node.js-specific test script to verify OORT file uploads
 * 
 * To run this script:
 * npx vite-node src/utils/testOortUploadNode.ts
 */

import fetch from 'node-fetch';
import { getOortCredentials } from './oortStorage';
import * as fs from 'fs';
import * as path from 'path';

// Create a test file on disk
const createTestFile = (): { path: string; size: number; name: string; type: string } => {
  const content = 'This is a test file for OORT upload testing';
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
  console.log('Testing OORT file upload from Node.js...');
  console.log('---------------------------');
  
  // Get OORT credentials to display info
  const credentials = getOortCredentials();
  console.log('Using OORT credentials:');
  console.log(`- Access Key: ${maskString(credentials.accessKey)}`);
  console.log(`- Secret Key: ${maskString(credentials.secretKey)}`);
  console.log(`- Endpoint: ${process.env.VITE_OORT_ENDPOINT || 'https://s3-standard.oortech.com'} (Standard)`);
  console.log('');
  
  try {
    // Create a test file
    console.log('Creating test file...');
    const testFile = createTestFile();
    console.log(`Test file created: ${testFile.name} (${testFile.size} bytes)`);
    
    // Upload the file
    console.log('\nUploading file to OORT...');
    const testDirectory = `_system_tests_/${Date.now()}`;
    const result = await uploadToOortStorageNode(testFile, testDirectory);
    
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
    console.log('3. Verify that your OORT account has write permissions');
    console.log('4. Check your network connection');
    
    return null;
  }
};

// Node.js specific upload function
type UploadResult = {
  success: boolean;
  url?: string;
  error?: string;
  statusCode?: number;
  verified?: boolean;
};

type FileInfo = {
  path: string;
  size: number;
  name: string;
  type: string;
};

const uploadToOortStorageNode = async (
  fileInfo: FileInfo,
  path: string = 'Flat-tires/'
): Promise<UploadResult> => {
  const credentials = getOortCredentials();
  
  // Construct the full path including the filename with timestamp
  const timestamp = Date.now();
  const fileName = `${timestamp}-${fileInfo.name}`;
  const fullPath = `${path}${fileName}`.replace(/\/\//g, '/');
  
  console.log(`Starting OORT upload: ${fileInfo.name}, Size: ${fileInfo.size} bytes, Path: ${fullPath}`);
  
  // OORT Storage config - try a different bucket name
  const OORT_BUCKET = 'test'; // Changed from 'labsmarket' to 'test'
  const endpoint = credentials.endpoint || 'https://s3-standard.oortech.com';
  
  try {
    // Set up the endpoint with the specific bucket
    const uploadUrl = `${endpoint}/${OORT_BUCKET}/${fullPath}`;
    
    console.log(`Uploading to: ${uploadUrl}`);
    
    // Read the file content
    const fileContent = fs.readFileSync(fileInfo.path);
    
    // Try different authentication method
    console.log('Trying authentication method: X-OORT-* headers only');
    
    // Make the request using node-fetch with X-OORT-* headers only
    const response = await fetch(uploadUrl, {
      method: 'PUT',
      headers: {
        'Content-Type': fileInfo.type || 'application/octet-stream',
        'X-OORT-ACCESS-KEY': credentials.accessKey,
        'X-OORT-SECRET-KEY': credentials.secretKey
      },
      body: fileContent
    });
    
    if (response.ok) {
      const fileUrl = `${endpoint}/${OORT_BUCKET}/${fullPath}`;
      console.log('OORT Storage upload successful');
      
      // Verify the file is accessible
      const verified = await verifyFileAccessibility(fileUrl);
      
      return {
        success: true,
        url: fileUrl,
        verified: verified,
        statusCode: response.status
      };
    } else {
      let errorMessage = `OORT Storage upload failed: ${response.status} - ${response.statusText}`;
      
      try {
        const responseText = await response.text();
        console.error('Response:', responseText);
        
        try {
          const responseData = JSON.parse(responseText);
          errorMessage += ` - ${responseData.message || responseData.error || 'Unknown error'}`;
        } catch (e) {
          // If we can't parse the error response, use the status text
          errorMessage += ` - ${response.statusText || 'Unknown error'}`;
        }
      } catch (e) {
        console.error('Could not read response text:', e);
      }
      
      console.error(errorMessage);
      
      return {
        success: false,
        error: errorMessage,
        statusCode: response.status
      };
    }
  } catch (error) {
    console.error('OORT Storage upload error:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error during upload'
    };
  }
};

// Verify if a file is accessible via HTTP request
const verifyFileAccessibility = async (url: string): Promise<boolean> => {
  try {
    const response = await fetch(url, { method: 'HEAD' });
    return response.ok;
  } catch (error) {
    console.error('Error verifying file accessibility:', error);
    return false;
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