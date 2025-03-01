/**
 * Script to configure CORS on an AWS S3 bucket
 * 
 * To run this script:
 * 1. Make sure you have filled in your AWS credentials in the .env file
 * 2. Run: npm run dev (in one terminal to load environment variables)
 * 3. Run: npx vite-node src/utils/configureBucketCors.ts (in another terminal)
 */

import { S3Client, PutBucketCorsCommand } from '@aws-sdk/client-s3';

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

// CORS configuration that allows requests from any origin
// In production, you should restrict this to your specific domain
const corsConfiguration = {
  CORSRules: [
    {
      AllowedHeaders: ["*"],
      AllowedMethods: ["GET", "PUT", "POST", "DELETE", "HEAD"],
      AllowedOrigins: ["*"],  // In production, replace with your specific domain
      ExposeHeaders: [
        "ETag",
        "x-amz-server-side-encryption",
        "x-amz-request-id",
        "x-amz-id-2"
      ],
      MaxAgeSeconds: 3000
    }
  ]
};

// Configure CORS on the S3 bucket
const configureBucketCors = async () => {
  console.log('Configuring CORS on S3 bucket...');
  
  const credentials = getCredentialsFromEnv();
  
  // Check if credentials and bucket are provided
  if (!credentials.accessKeyId || !credentials.secretAccessKey) {
    console.error('❌ AWS credentials are missing in .env file');
    return;
  }
  
  if (!credentials.bucket) {
    console.error('❌ AWS bucket name is missing in .env file');
    return;
  }
  
  console.log(`Configuring CORS for bucket: ${credentials.bucket}`);
  console.log('CORS Configuration:');
  console.log(JSON.stringify(corsConfiguration, null, 2));
  
  try {
    // Create S3 client
    const s3Client = new S3Client({
      region: credentials.region,
      credentials: {
        accessKeyId: credentials.accessKeyId,
        secretAccessKey: credentials.secretAccessKey
      }
    });
    
    // Apply CORS configuration
    const command = new PutBucketCorsCommand({
      Bucket: credentials.bucket,
      CORSConfiguration: corsConfiguration
    });
    
    await s3Client.send(command);
    
    console.log('✅ CORS configuration successfully applied to the bucket!');
    console.log('\nYour S3 bucket should now accept requests from your application.');
    console.log('If you still experience CORS issues:');
    console.log('1. Make sure you\'re using the correct bucket name');
    console.log('2. Verify that your IAM user has s3:PutBucketCors permission');
    console.log('3. Clear your browser cache or try in an incognito window');
    
  } catch (error) {
    console.error('❌ Failed to configure CORS:');
    if (error instanceof Error) {
      console.error(error.message);
      
      if (error.message.includes('AccessDenied')) {
        console.log('\nAccess Denied. Your IAM user needs the s3:PutBucketCors permission.');
        console.log('Add this permission to your IAM user policy:');
        console.log(`
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Effect": "Allow",
      "Action": [
        "s3:PutBucketCors"
      ],
      "Resource": [
        "arn:aws:s3:::${credentials.bucket}"
      ]
    }
  ]
}
        `);
      }
    } else {
      console.error(String(error));
    }
  }
};

// Run the configuration
configureBucketCors().catch(console.error);