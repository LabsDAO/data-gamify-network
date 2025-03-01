
// AWS S3 Storage integration utility

import { v4 as uuidv4 } from 'uuid';
import { S3Client, HeadBucketCommand, PutObjectCommand, ListBucketsCommand } from '@aws-sdk/client-s3';
import { Upload } from '@aws-sdk/lib-storage';

type AWSCredentials = {
  accessKeyId: string;
  secretAccessKey: string;
  region: string;
  bucket: string;
};

// Default credentials with the provided values
const DEFAULT_CREDENTIALS: AWSCredentials = {
  accessKeyId: "AKIAXZ5NGJRVYNNHVYFG",
  secretAccessKey: "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",
  region: "us-east-1",
  bucket: "labsmarket",
};

// File validation rules (shared with oortStorage)
const MAX_FILE_SIZE = 100 * 1024 * 1024; // 100MB
const ALLOWED_FILE_TYPES = [
  // Images
  'image/jpeg', 'image/png', 'image/gif', 'image/webp', 'image/svg+xml',
  // Documents
  'application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  // Data
  'application/json', 'text/csv', 'application/vnd.ms-excel', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  // Video
  'video/mp4', 'video/webm',
  // Audio
  'audio/mpeg', 'audio/wav', 'audio/ogg',
];

/**
 * Validate file before upload (reused from oortStorage)
 */
export const validateFile = (file: File): { valid: boolean; error?: string } => {
  // Check if file exists
  if (!file) {
    return { valid: false, error: 'No file selected' };
  }
  
  // Check file size
  if (file.size > MAX_FILE_SIZE) {
    return { 
      valid: false, 
      error: `File size exceeds 100MB limit (${(file.size / (1024 * 1024)).toFixed(2)}MB)` 
    };
  }
  
  // Check file type
  if (!ALLOWED_FILE_TYPES.includes(file.type)) {
    return { 
      valid: false, 
      error: `File type ${file.type || 'unknown'} is not supported` 
    };
  }
  
  return { valid: true };
};

/**
 * Get AWS S3 credentials from localStorage or use defaults
 */
export const getAwsCredentials = (): AWSCredentials => {
  const storedCredentials = localStorage.getItem('aws_credentials');
  if (storedCredentials) {
    try {
      return JSON.parse(storedCredentials);
    } catch (e) {
      console.error("Failed to parse stored AWS credentials", e);
    }
  }
  return DEFAULT_CREDENTIALS;
};

/**
 * Save AWS S3 credentials to localStorage
 */
export const saveAwsCredentials = (credentials: AWSCredentials): void => {
  localStorage.setItem('aws_credentials', JSON.stringify(credentials));
};

/**
 * Check if custom AWS credentials are being used
 */
export const isUsingCustomAwsCredentials = (): boolean => {
  // Since we now have default credentials, check if they've been overridden
  const creds = getAwsCredentials();
  const areDefaultsBeingUsed = 
    creds.accessKeyId === DEFAULT_CREDENTIALS.accessKeyId && 
    creds.secretAccessKey === DEFAULT_CREDENTIALS.secretAccessKey &&
    creds.bucket === DEFAULT_CREDENTIALS.bucket;
  
  // Return true if credentials are stored (custom) or the defaults are used
  return localStorage.getItem('aws_credentials') !== null || areDefaultsBeingUsed;
};

/**
 * Get a list of all available buckets for the current credentials
 * This can be used to verify bucket existence and help users select the correct bucket
 */
export const listAwsBuckets = async (): Promise<string[]> => {
  const credentials = getAwsCredentials();
  
  try {
    // Create S3 client
    const s3Client = new S3Client({
      region: credentials.region,
      credentials: {
        accessKeyId: credentials.accessKeyId,
        secretAccessKey: credentials.secretAccessKey
      }
    });
    
    // List all buckets
    const { Buckets } = await s3Client.send(new ListBucketsCommand({}));
    
    return (Buckets || []).map(bucket => bucket.Name || '').filter(Boolean);
  } catch (error) {
    console.error("Failed to list AWS S3 buckets:", error);
    throw new Error(`Failed to list AWS S3 buckets: ${error instanceof Error ? error.message : String(error)}`);
  }
};

/**
 * Test AWS S3 connectivity - returns detailed diagnostics
 */
export const testAwsConnectivity = async (): Promise<{ 
  success: boolean; 
  message: string;
  details: {
    credentialsValid: boolean;
    bucketAccessible: boolean;
    writePermission: boolean;
    corsEnabled?: boolean;
    availableBuckets?: string[];
  }
}> => {
  const credentials = getAwsCredentials();
  const results = {
    success: false,
    message: "",
    details: {
      credentialsValid: false,
      bucketAccessible: false,
      writePermission: false,
      corsEnabled: undefined,
      availableBuckets: []
    }
  };
  
  try {
    // Check if credentials are provided
    if (!credentials.accessKeyId || !credentials.secretAccessKey) {
      results.message = "AWS credentials are missing";
      return results;
    }
    
    results.details.credentialsValid = true;
    
    // Create S3 client
    const s3Client = new S3Client({
      region: credentials.region,
      credentials: {
        accessKeyId: credentials.accessKeyId,
        secretAccessKey: credentials.secretAccessKey
      }
    });
    
    try {
      // Get list of available buckets to help user verify bucket name
      try {
        const { Buckets } = await s3Client.send(new ListBucketsCommand({}));
        results.details.availableBuckets = (Buckets || []).map(bucket => bucket.Name || '').filter(Boolean);
        
        // Check if the specified bucket is in the list of available buckets
        const bucketExists = results.details.availableBuckets.includes(credentials.bucket);
        if (!bucketExists) {
          results.message = `Bucket "${credentials.bucket}" not found. Available buckets: ${results.details.availableBuckets.join(', ')}`;
        }
      } catch (listError) {
        console.error("Failed to list buckets:", listError);
        // Not critical, continue with other tests
      }
      
      try {
        // Check if bucket exists and is accessible
        await s3Client.send(new HeadBucketCommand({ Bucket: credentials.bucket }));
        results.details.bucketAccessible = true;
      } catch (headError: any) {
        console.error("AWS S3 bucket access test failed:", headError);
        
        if (headError.name === 'NoSuchBucket') {
          results.message = `Bucket "${credentials.bucket}" does not exist. Please check your bucket name.`;
        } else if (headError.name === 'AccessDenied') {
          results.message = `Access denied to bucket "${credentials.bucket}". Check IAM permissions.`;
        } else {
          results.message = `Failed to access bucket "${credentials.bucket}": ${headError.message}`;
        }
        
        return results;
      }
      
      // Second test - try to upload a tiny test file
      const testBytes = new TextEncoder().encode("AWS S3 Test");
      const testBlob = new Blob([testBytes], { type: 'text/plain' });
      const testFile = new File([testBlob], "aws-connectivity-test.txt", { type: 'text/plain' });
      
      const testPath = `tests/aws-connectivity-test-${Date.now()}.txt`;
      
      try {
        // Try direct PutObject first (simpler than multipart)
        await s3Client.send(new PutObjectCommand({
          Bucket: credentials.bucket,
          Key: testPath,
          Body: testFile,
          ContentType: testFile.type
        }));
        
        results.details.writePermission = true;
        results.details.corsEnabled = true; // If this succeeds, CORS is likely configured properly
        
        results.success = true;
        results.message = "AWS S3 connection successful! All tests passed.";
      } catch (putError: any) {
        console.error("AWS S3 write permission test failed:", putError);
        
        if (putError.toString().includes("CORS")) {
          results.details.corsEnabled = false;
          results.message = "AWS S3 CORS configuration issue detected. You need to enable CORS on your S3 bucket.";
        } else if (putError.name === 'AccessDenied') {
          results.message = "AWS S3 write permission denied. Check your IAM permissions, make sure you have s3:PutObject permission.";
        } else {
          results.details.corsEnabled = undefined; // Unknown
          results.message = `AWS S3 write permission test failed: ${putError.message}`;
        }
      }
    } catch (headError) {
      console.error("AWS S3 bucket access test failed:", headError);
      results.message = "AWS S3 bucket access failed. Check if the bucket exists and is accessible.";
    }
  } catch (error) {
    console.error("AWS S3 credentials test failed:", error);
    results.message = "AWS S3 credentials test failed: " + (error instanceof Error ? error.message : String(error));
  }
  
  return results;
};

/**
 * Generates the correct S3 bucket endpoint URL based on region
 */
export const getBucketEndpointUrl = (bucket: string, region: string): string => {
  // Handle special case for us-east-1
  if (region === 'us-east-1') {
    return `https://${bucket}.s3.amazonaws.com`;
  }
  // Standard format for all other regions
  return `https://${bucket}.s3.${region}.amazonaws.com`;
};

/**
 * Upload a file to AWS S3 using AWS SDK v3
 */
export const uploadToAwsS3 = async (
  file: File, 
  path: string = 'uploads/'
): Promise<string> => {
  // Log the upload attempt with details for debugging
  console.log(`Starting AWS S3 upload: ${file.name}, Size: ${file.size} bytes, Path: ${path}`);
  
  // Validate file first
  const validation = validateFile(file);
  if (!validation.valid) {
    throw new Error(validation.error);
  }
  
  const credentials = getAwsCredentials();
  
  // Check if credentials are provided
  if (!credentials.accessKeyId || !credentials.secretAccessKey) {
    throw new Error('AWS credentials not configured. Please set up your AWS credentials first.');
  }
  
  // Validate bucket name
  if (!credentials.bucket) {
    throw new Error('AWS S3 bucket name is not configured.');
  }
  
  // Ensure region is set
  if (!credentials.region) {
    credentials.region = 'us-east-1'; // Default to us-east-1 if not specified
  }
  
  // Construct the full path including the filename with timestamp and uuid
  const timestamp = Date.now();
  const uuid = uuidv4().substring(0, 8);
  const fileName = `${timestamp}-${uuid}-${file.name}`;
  const fullPath = `${path}${fileName}`.replace(/\/\//g, '/');
  
  try {
    // Test connectivity before attempting upload
    const connectivityTest = await testAwsConnectivity();
    if (!connectivityTest.success) {
      // Check if the bucket exists in available buckets
      if (connectivityTest.details.availableBuckets && 
          connectivityTest.details.availableBuckets.length > 0 && 
          !connectivityTest.details.availableBuckets.includes(credentials.bucket)) {
        throw new Error(`Bucket "${credentials.bucket}" not found. Available buckets: ${connectivityTest.details.availableBuckets.join(', ')}`);
      }
      throw new Error(`AWS S3 connectivity issue: ${connectivityTest.message}`);
    }
    
    // Create S3 client
    const s3Client = new S3Client({
      region: credentials.region,
      credentials: {
        accessKeyId: credentials.accessKeyId,
        secretAccessKey: credentials.secretAccessKey
      }
    });
    
    // Use Upload from @aws-sdk/lib-storage for multipart upload support
    const upload = new Upload({
      client: s3Client,
      params: {
        Bucket: credentials.bucket,
        Key: fullPath,
        Body: file,
        ContentType: file.type,
        // Make the uploaded file publicly accessible for easy viewing
        ACL: 'public-read',
      }
    });
    
    // Upload the file
    await upload.done();
    
    // Generate the URL for the uploaded file
    const fileUrl = `${getBucketEndpointUrl(credentials.bucket, credentials.region)}/${fullPath}`;
    console.log('AWS S3 upload successful:', fileUrl);
    
    return fileUrl;
  } catch (error) {
    console.error('AWS S3 upload error:', error);
    
    // Enhanced error reporting with suggested solutions
    let errorMessage = error instanceof Error ? error.message : 'Unknown error during AWS S3 upload';
    
    // Add helpful suggestions based on common error patterns
    if (errorMessage.includes('NetworkError') || errorMessage.includes('Failed to fetch')) {
      errorMessage += ' - This could be due to network connectivity issues or CORS restrictions. Check your internet connection and S3 bucket CORS configuration.';
    } else if (errorMessage.includes('Access Denied')) {
      errorMessage += ' - Ensure your IAM user has sufficient permissions (s3:PutObject and s3:PutObjectAcl) for the bucket.';
    } else if (errorMessage.includes('NoSuchBucket')) {
      errorMessage += ' - The specified bucket does not exist. Please check your bucket name.';
    } else if (errorMessage.includes('CORS')) {
      errorMessage += ' - Your S3 bucket needs CORS configuration to allow uploads from this domain.';
    }
    
    throw new Error(errorMessage);
  }
};

/**
 * Reset to default AWS credentials
 */
export const resetToDefaultAwsCredentials = (): void => {
  localStorage.removeItem('aws_credentials');
};

/**
 * Toggle between real and simulated AWS uploads
 */
export const setUseRealAwsStorage = (useReal: boolean): void => {
  localStorage.setItem('use_real_aws', useReal ? 'true' : 'false');
};

/**
 * Check if real AWS S3 is being used
 */
export const isUsingRealAwsStorage = (): boolean => {
  return localStorage.getItem('use_real_aws') !== 'false';
};

// Enable real AWS S3 storage by default
setUseRealAwsStorage(true);
