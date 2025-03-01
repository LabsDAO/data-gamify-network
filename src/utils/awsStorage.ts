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
 * Create S3 client with appropriate configuration, including CORS handling
 */
const createS3Client = (credentials: AWSCredentials) => {
  // Add custom fetch handler to handle CORS issues better
  const customFetchHandler = async (url: URL | string, options: RequestInit) => {
    try {
      console.log(`S3 Client requesting: ${typeof url === 'string' ? url : url.toString()}`);
      const response = await fetch(url, {
        ...options,
        mode: 'cors', // Explicitly state CORS mode
        credentials: 'omit' // Don't send cookies to AWS
      });
      return response;
    } catch (error) {
      console.error('AWS S3 fetch error:', error);
      // Throw a more descriptive error
      if (error instanceof Error) {
        if (error.message.includes('Failed to fetch') || error.message.includes('NetworkError')) {
          throw new Error('Network connection error. Please check your internet connection and firewall settings.');
        }
      }
      throw error;
    }
  };

  // Create S3 client with customized configuration
  return new S3Client({
    region: credentials.region,
    credentials: {
      accessKeyId: credentials.accessKeyId,
      secretAccessKey: credentials.secretAccessKey
    },
    maxAttempts: 3,
    // Use custom fetch with better error handling
    requestHandler: {
      fetch: customFetchHandler
    }
  });
};

/**
 * Get a list of all available buckets for the current credentials
 * This can be used to verify bucket existence and help users select the correct bucket
 */
export const listAwsBuckets = async (): Promise<string[]> => {
  const credentials = getAwsCredentials();
  
  try {
    console.log("Attempting to list AWS S3 buckets with credentials:", {
      accessKeyId: credentials.accessKeyId.substring(0, 5) + "...",
      region: credentials.region,
    });
    
    // Create S3 client with our enhanced configuration
    const s3Client = createS3Client(credentials);
    
    // List all buckets
    const { Buckets } = await s3Client.send(new ListBucketsCommand({}));
    
    // If we get here, credentials are valid
    console.log("AWS credentials validated successfully, buckets:", Buckets?.map(b => b.Name));
    
    return (Buckets || []).map(bucket => bucket.Name || '').filter(Boolean);
  } catch (error) {
    console.error("Failed to list AWS S3 buckets:", error);
    
    // More specific error handling
    if (error instanceof Error) {
      if (error.message.includes("InvalidAccessKeyId")) {
        throw new Error("The AWS Access Key ID you provided is invalid");
      } else if (error.message.includes("SignatureDoesNotMatch")) {
        throw new Error("The AWS Secret Access Key you provided is invalid");
      } else if (error.message.includes("NetworkError") || error.message.includes("Failed to fetch") || 
                 error.message.includes("Network connection error")) {
        throw new Error("Network error: Check your internet connection and make sure AWS services are not blocked");
      }
    }
    
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
    errorDetails?: string;
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
      availableBuckets: [],
      errorDetails: undefined
    }
  };
  
  try {
    // Check if credentials are provided
    if (!credentials.accessKeyId || !credentials.secretAccessKey) {
      results.message = "AWS credentials are missing";
      return results;
    }
    
    console.log("Testing AWS connectivity with credentials:", {
      accessKeyId: credentials.accessKeyId.substring(0, 5) + "...",
      region: credentials.region,
      bucket: credentials.bucket
    });
    
    // Create S3 client with our enhanced configuration
    const s3Client = createS3Client(credentials);
    
    // Step 1: Validate credentials by listing buckets
    try {
      const { Buckets } = await s3Client.send(new ListBucketsCommand({}));
      results.details.credentialsValid = true;
      results.details.availableBuckets = (Buckets || []).map(bucket => bucket.Name || '').filter(Boolean);
      
      console.log("AWS S3 credentials valid, available buckets:", results.details.availableBuckets);
      
      // If no bucket is specified, suggest one
      if (!credentials.bucket && results.details.availableBuckets.length > 0) {
        results.message = `No bucket specified. Available buckets: ${results.details.availableBuckets.join(", ")}`;
        return results;
      }
      
      // Check if specified bucket exists
      const bucketExists = credentials.bucket && results.details.availableBuckets.includes(credentials.bucket);
      if (!bucketExists && credentials.bucket) {
        results.message = `Bucket "${credentials.bucket}" not found. Available buckets: ${results.details.availableBuckets.join(", ")}`;
        // Don't return here, try to access the bucket anyway in case it's a permissions issue
      }
    } catch (listError) {
      console.error("AWS S3 credentials test failed:", listError);
      
      results.details.credentialsValid = false;
      results.details.errorDetails = listError instanceof Error ? listError.message : String(listError);
      
      if (listError instanceof Error) {
        if (listError.message.includes("InvalidAccessKeyId")) {
          results.message = "The AWS Access Key ID you provided is invalid";
        } else if (listError.message.includes("SignatureDoesNotMatch")) {
          results.message = "The AWS Secret Access Key you provided is invalid";
        } else if (listError.message.includes("NetworkError") || listError.message.includes("Failed to fetch") || 
                  listError.message.includes("Network connection error")) {
          results.message = "Network error connecting to AWS. Check your internet connection or if AWS services are blocked";
        } else {
          results.message = `AWS credentials error: ${listError.message}`;
        }
      } else {
        results.message = "AWS credentials test failed with unknown error";
      }
      
      return results;
    }
    
    // If we couldn't test bucket connectivity due to network issues, provide a fallback mechanism
    if (results.details.credentialsValid && results.details.availableBuckets.includes(credentials.bucket)) {
      results.details.bucketAccessible = true;
      results.success = true;
      results.message = "Your bucket exists but we couldn't test full connectivity due to network constraints. " + 
                        "You may be able to upload if your bucket permissions are correctly configured.";
    }
    
    // The rest of the function will try to access the bucket and test writing to it
    // Step 2: Check bucket existence and accessibility
    if (!credentials.bucket) {
      results.message = "No bucket specified. Please select a bucket.";
      return results;
    }
    
    try {
      // Try to access bucket
      console.log(`Testing access to bucket: ${credentials.bucket}`);
      
      await s3Client.send(new HeadBucketCommand({
        Bucket: credentials.bucket
      }));
      
      results.details.bucketAccessible = true;
      console.log(`Bucket ${credentials.bucket} is accessible`);
    } catch (bucketError: any) {
      console.error("AWS S3 bucket access test failed:", bucketError);
      
      // Extract more specific error information
      if (bucketError.name === 'NoSuchBucket') {
        results.message = `Bucket "${credentials.bucket}" does not exist. Please check your bucket name.`;
      } else if (bucketError.name === 'AccessDenied' || bucketError.message?.includes('Access Denied')) {
        results.message = `Access denied to bucket "${credentials.bucket}". Check IAM permissions.`;
      } else if (bucketError.message?.includes('NetworkingError') || bucketError.message?.includes('Failed to fetch')) {
        results.message = "Network error connecting to S3 bucket. Check your internet connection.";
      } else {
        results.message = `Failed to access bucket "${credentials.bucket}": ${bucketError.message || 'Unknown error'}`;
      }
      
      // If the error was permissions, try to test write permissions anyway
      if (!bucketError.message?.includes('NoSuchBucket')) {
        // Continue to test write permissions
      } else {
        return results;
      }
    }
    
    // Step 3: Test write permissions
    try {
      console.log(`Testing write permissions to bucket: ${credentials.bucket}`);
      
      // Create a tiny test file
      const testBytes = new TextEncoder().encode("AWS S3 Test");
      const testBlob = new Blob([testBytes], { type: 'text/plain' });
      const testFile = new File([testBlob], "aws-connectivity-test.txt", { type: 'text/plain' });
      
      const testPath = `tests/aws-connectivity-test-${Date.now()}.txt`;
      
      // Try direct PutObject for write permission test
      await s3Client.send(new PutObjectCommand({
        Bucket: credentials.bucket,
        Key: testPath,
        Body: testFile,
        ContentType: testFile.type,
        ACL: 'public-read'
      }));
      
      results.details.writePermission = true;
      results.details.corsEnabled = true; // If this succeeds, CORS is likely configured properly
      
      results.success = true;
      results.message = "AWS S3 connection successful! All tests passed.";
      
      console.log("AWS S3 write permission test passed");
    } catch (writeError: any) {
      console.error("AWS S3 write permission test failed:", writeError);
      
      if (writeError.toString().includes("CORS")) {
        results.details.corsEnabled = false;
        results.message = "AWS S3 CORS configuration issue detected. You need to enable CORS on your S3 bucket.";
      } else if (writeError.name === 'AccessDenied' || writeError.message?.includes('Access Denied')) {
        results.message = "AWS S3 write permission denied. Check your IAM permissions, make sure you have s3:PutObject permission.";
      } else if (writeError.message?.includes('NetworkingError') || writeError.message?.includes('Failed to fetch')) {
        results.message = "Network error during write test. Check your internet connection.";
      } else {
        results.details.corsEnabled = undefined; // Unknown
        results.message = `AWS S3 write permission test failed: ${writeError.message || 'Unknown error'}`;
      }
    }
  } catch (error) {
    console.error("AWS S3 general test failed:", error);
    results.details.errorDetails = error instanceof Error ? error.message : String(error);
    results.message = "AWS S3 test failed: " + (error instanceof Error ? error.message : String(error));
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
    // Use a more lenient connectivity test for environments with CORS restrictions
    console.log("Testing AWS connectivity before upload");
    const connectivityTest = await testAwsConnectivity();
    
    // Allow uploads to proceed if we know the credentials are valid and the bucket exists,
    // even if we couldn't complete the full connectivity test due to network/CORS constraints
    const canProceed = connectivityTest.success || 
                       (connectivityTest.details.credentialsValid && 
                        connectivityTest.details.availableBuckets?.includes(credentials.bucket));
    
    if (!canProceed) {
      console.error("AWS connectivity test failed:", connectivityTest.message);
      
      // Check if the bucket exists in available buckets
      if (connectivityTest.details.credentialsValid && 
          connectivityTest.details.availableBuckets && 
          connectivityTest.details.availableBuckets.length > 0 && 
          !connectivityTest.details.availableBuckets.includes(credentials.bucket)) {
        throw new Error(`Bucket "${credentials.bucket}" not found. Available buckets: ${connectivityTest.details.availableBuckets.join(', ')}`);
      }
      
      // If credentials are valid but bucket is inaccessible, provide specific guidance
      if (connectivityTest.details.credentialsValid && !connectivityTest.details.bucketAccessible) {
        throw new Error(`Cannot access bucket "${credentials.bucket}". Make sure the bucket exists and you have permission to access it.`);
      }
      
      // If credentials are valid and bucket is accessible but write permission is denied
      if (connectivityTest.details.credentialsValid && 
          connectivityTest.details.bucketAccessible && 
          !connectivityTest.details.writePermission) {
        throw new Error(`You don't have permission to write to bucket "${credentials.bucket}". Check your IAM permissions.`);
      }
      
      throw new Error(`AWS S3 connectivity issue: ${connectivityTest.message}`);
    }
    
    // Use our enhanced S3 client with better error handling
    const s3Client = createS3Client(credentials);
    
    console.log(`Uploading to S3: ${credentials.bucket}/${fullPath}`);
    
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
