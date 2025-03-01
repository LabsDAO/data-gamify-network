/**
 * Test script for AWS S3 pre-signed URL uploads
 * 
 * To run this script:
 * 1. Make sure you have filled in your AWS credentials in the .env file
 * 2. Run: npm run dev (in one terminal to load environment variables)
 * 3. Run: npx vite-node src/utils/testPresignedUpload.ts (in another terminal)
 */

import { testPresignedUrl } from './awsPresignedUpload';

console.log('Testing AWS S3 pre-signed URL generation...');
console.log('This approach can help bypass CORS issues by using pre-signed URLs.');
console.log('---------------------------------------------------------------');

// Run the test
testPresignedUrl()
  .then(() => {
    console.log('\nIf the pre-signed URL was generated successfully, you can use it to upload a file');
    console.log('without encountering CORS issues, as the browser makes a direct PUT request to S3.');
    console.log('\nTo implement this approach in your application:');
    console.log('1. Import the uploadWithPresignedUrl function from src/utils/awsPresignedUpload.ts');
    console.log('2. Use it instead of the direct upload method:');
    console.log('   const url = await uploadWithPresignedUrl(file, "your-path/");');
  })
  .catch(error => {
    console.error('Test failed:', error);
  });