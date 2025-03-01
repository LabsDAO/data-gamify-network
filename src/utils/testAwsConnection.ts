/**
 * Test script to verify AWS connection using environment variables
 * 
 * To run this script:
 * 1. Make sure you have filled in your AWS credentials in the .env file
 * 2. Run: npm run dev (in one terminal to load environment variables)
 * 3. Run: npx vite-node src/utils/testAwsConnection.ts (in another terminal)
 */

import { S3Client, ListBucketsCommand } from '@aws-sdk/client-s3';

// Get credentials from environment variables
const getCredentialsFromEnv = () => {
  const accessKeyId = import.meta.env.VITE_AWS_ACCESS_KEY_ID;
  const secretAccessKey = import.meta.env.VITE_AWS_SECRET_ACCESS_KEY;
  const region = import.meta.env.VITE_AWS_REGION || 'us-east-1';
  const bucket = import.meta.env.VITE_AWS_BUCKET;

  return {
    accessKeyId,
    secretAccessKey,
    region,
    bucket
  };
};

// Test AWS connection
const testAwsConnection = async () => {
  console.log('Testing AWS connection...');
  
  const credentials = getCredentialsFromEnv();
  
  // Check if credentials are provided
  if (!credentials.accessKeyId || !credentials.secretAccessKey) {
    console.error('❌ AWS credentials are missing in .env file');
    console.log('Please fill in your AWS credentials in the .env file:');
    console.log('VITE_AWS_ACCESS_KEY_ID=your_access_key_id');
    console.log('VITE_AWS_SECRET_ACCESS_KEY=your_secret_access_key');
    return;
  }
  
  console.log('AWS Credentials:');
  console.log(`- Access Key ID: ${credentials.accessKeyId.substring(0, 5)}...`);
  console.log(`- Secret Access Key: (hidden)`);
  console.log(`- Region: ${credentials.region}`);
  console.log(`- Bucket: ${credentials.bucket || '(not specified)'}`);
  
  try {
    // Create S3 client
    const s3Client = new S3Client({
      region: credentials.region,
      credentials: {
        accessKeyId: credentials.accessKeyId,
        secretAccessKey: credentials.secretAccessKey
      }
    });
    
    // List buckets to test connection
    console.log('\nListing available S3 buckets...');
    const { Buckets } = await s3Client.send(new ListBucketsCommand({}));
    
    if (Buckets && Buckets.length > 0) {
      console.log('✅ AWS connection successful!');
      console.log('\nAvailable buckets:');
      Buckets.forEach(bucket => {
        console.log(`- ${bucket.Name}`);
      });
      
      // Check if specified bucket exists
      if (credentials.bucket) {
        const bucketExists = Buckets.some(b => b.Name === credentials.bucket);
        if (bucketExists) {
          console.log(`\n✅ Your specified bucket "${credentials.bucket}" exists and is accessible.`);
        } else {
          console.log(`\n❌ Your specified bucket "${credentials.bucket}" was not found in your account.`);
          console.log('Please check the bucket name in your .env file.');
        }
      }
    } else {
      console.log('✅ AWS connection successful, but no buckets found in your account.');
    }
  } catch (error) {
    console.error('❌ AWS connection failed:');
    if (error instanceof Error) {
      console.error(error.message);
      
      // Provide more specific guidance for common errors
      if (error.message.includes('InvalidAccessKeyId')) {
        console.log('\nThe AWS Access Key ID you provided is invalid. Please check your credentials.');
      } else if (error.message.includes('SignatureDoesNotMatch')) {
        console.log('\nThe AWS Secret Access Key you provided is invalid. Please check your credentials.');
      } else if (error.message.includes('NetworkingError') || 
                error.message.includes('Network Error')) {
        console.log('\nNetwork error connecting to AWS. Please check your internet connection.');
      }
    } else {
      console.error(String(error));
    }
  }
};

// Run the test
testAwsConnection().catch(console.error);