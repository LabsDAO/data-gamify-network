/**
 * AWS S3 Pre-signed URL Upload Utility
 * 
 * This provides an alternative approach to direct S3 uploads that can help
 * bypass CORS issues by using pre-signed URLs.
 */

import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import { v4 as uuidv4 } from 'uuid';
import { validateFile } from './awsStorage';

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

/**
 * Generate a pre-signed URL for uploading a file to S3
 * This approach can help bypass CORS issues since the browser
 * makes a direct PUT request to the pre-signed URL
 */
export const getPresignedUploadUrl = async (
  fileName: string,
  fileType: string,
  path: string = 'uploads/',
  expiresIn: number = 3600 // URL expires in 1 hour by default
): Promise<{
  uploadUrl: string;
  fileKey: string;
  publicUrl: string;
}> => {
  const credentials = getCredentialsFromEnv();
  
  // Check if credentials are provided
  if (!credentials.accessKeyId || !credentials.secretAccessKey) {
    throw new Error('AWS credentials not configured. Please set up your AWS credentials first.');
  }
  
  // Validate bucket name
  if (!credentials.bucket) {
    throw new Error('AWS S3 bucket name is not configured.');
  }
  
  // Normalize path (make sure it ends with a slash if not empty)
  const normalizedPath = path ? (path.endsWith('/') ? path : `${path}/`) : '';
  
  // Generate a unique file key
  const timestamp = Date.now();
  const uuid = uuidv4().substring(0, 8);
  const sanitizedFilename = fileName.replace(/[^a-zA-Z0-9._-]/g, '_');
  const fileKey = `${normalizedPath}${timestamp}-${uuid}-${sanitizedFilename}`;
  
  try {
    // Create S3 client
    const s3Client = new S3Client({
      region: credentials.region,
      credentials: {
        accessKeyId: credentials.accessKeyId,
        secretAccessKey: credentials.secretAccessKey
      }
    });
    
    // Create the command for putting an object in S3
    const command = new PutObjectCommand({
      Bucket: credentials.bucket,
      Key: fileKey,
      ContentType: fileType,
      // Remove ACL parameter as the bucket does not allow ACLs
    });
    
    // Generate the pre-signed URL
    const uploadUrl = await getSignedUrl(s3Client, command, { expiresIn });
    
    // Generate the public URL for the file after upload
    const publicUrl = `https://${credentials.bucket}.s3.${credentials.region === 'us-east-1' ? '' : credentials.region + '.'}amazonaws.com/${fileKey}`;
    
    return {
      uploadUrl,
      fileKey,
      publicUrl
    };
  } catch (error) {
    console.error('Error generating pre-signed URL:', error);
    throw error;
  }
};

/**
 * Upload a file to S3 using a pre-signed URL
 * This approach can help bypass CORS issues
 */
export const uploadWithPresignedUrl = async (
  file: File,
  path: string = 'uploads/'
): Promise<string> => {
  // Validate file first
  const validation = validateFile(file);
  if (!validation.valid) {
    throw new Error(validation.error);
  }
  
  try {
    console.log(`Starting AWS S3 pre-signed URL upload: ${file.name}, Size: ${file.size} bytes, Path: ${path}`);
    
    // Get pre-signed URL
    const { uploadUrl, publicUrl } = await getPresignedUploadUrl(
      file.name,
      file.type || 'application/octet-stream',
      path
    );
    
    console.log(`Got pre-signed URL: ${uploadUrl}`);
    
    // Remove any ACL parameters from the URL as the bucket doesn't allow ACLs
    const uploadUrlWithoutAcl = uploadUrl.replace(/&x-amz-acl=[^&]+/, '');
    
    // Upload the file using the pre-signed URL
    const response = await fetch(uploadUrlWithoutAcl, {
      method: 'PUT',
      body: file,
      headers: {
        'Content-Type': file.type || 'application/octet-stream',
      }
    });
    
    if (!response.ok) {
      throw new Error(`Upload failed with status: ${response.status} ${response.statusText}`);
    }
    
    console.log('Pre-signed URL upload successful!');
    return publicUrl;
  } catch (error) {
    console.error('Pre-signed URL upload failed:', error);
    
    if (error instanceof Error) {
      // Provide more specific error messages
      if (error.message.includes('NetworkError') || 
          error.message.includes('Network Error') ||
          error.message.includes('Failed to fetch')) {
        throw new Error('Network error during upload. Check your internet connection and try again.');
      } else {
        throw new Error(`AWS S3 upload failed: ${error.message}`);
      }
    } else {
      throw new Error('Unknown error during AWS S3 upload');
    }
  }
};

/**
 * Test function to verify pre-signed URL generation
 */
export const testPresignedUrl = async (): Promise<void> => {
  try {
    // Use a dedicated directory for test files with a timestamp to avoid conflicts
    const testDirectory = `_system_tests_/${Date.now()}`;
    const { uploadUrl, fileKey, publicUrl } = await getPresignedUploadUrl(
      'test-file.txt',
      'text/plain',
      testDirectory
    );
    
    console.log('Pre-signed URL generated successfully:');
    console.log(`- Upload URL: ${uploadUrl}`);
    console.log(`- File Key: ${fileKey}`);
    console.log(`- Public URL after upload: ${publicUrl}`);
    
    console.log('\nTo test this URL, you can use curl:');
    console.log(`curl -X PUT -H "Content-Type: text/plain" --data "This is a test file" "${uploadUrl}"`);
    console.log('\nAfter uploading, you can access the file at:');
    console.log(publicUrl);
  } catch (error) {
    console.error('Failed to generate pre-signed URL:', error);
  }
};