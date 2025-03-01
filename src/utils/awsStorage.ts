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

// Create a storage utility that works in both browser and Node.js environments
const createStorage = () => {
  // Check if we're in a browser environment with localStorage
  const isBrowser = typeof window !== 'undefined' && typeof window.localStorage !== 'undefined';
  
  // In-memory storage for Node.js environment
  const memoryStorage: Record<string, string> = {};
  
  return {
    getItem: (key: string): string | null => {
      if (isBrowser) {
        return localStorage.getItem(key);
      }
      return memoryStorage[key] || null;
    },
    setItem: (key: string, value: string): void => {
      if (isBrowser) {
        localStorage.setItem(key, value);
      } else {
        memoryStorage[key] = value;
      }
    },
    removeItem: (key: string): void => {
      if (isBrowser) {
        localStorage.removeItem(key);
      } else {
        delete memoryStorage[key];
      }
    }
  };
};

// Create a storage instance
const storage = createStorage();

// Get credentials from environment variables if available
const getEnvCredentials = (): Partial<AWSCredentials> => {
  const credentials: Partial<AWSCredentials> = {};
  
  if (import.meta.env.VITE_AWS_ACCESS_KEY_ID) {
    credentials.accessKeyId = import.meta.env.VITE_AWS_ACCESS_KEY_ID;
  }
  
  if (import.meta.env.VITE_AWS_SECRET_ACCESS_KEY) {
    credentials.secretAccessKey = import.meta.env.VITE_AWS_SECRET_ACCESS_KEY;
  }
  
  if (import.meta.env.VITE_AWS_REGION) {
    credentials.region = import.meta.env.VITE_AWS_REGION;
  }
  
  if (import.meta.env.VITE_AWS_BUCKET) {
    credentials.bucket = import.meta.env.VITE_AWS_BUCKET;
  }
  
  return credentials;
};

// Fallback credentials (only used if environment variables are not set)
const FALLBACK_CREDENTIALS: AWSCredentials = {
  accessKeyId: "",
  secretAccessKey: "",
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
  'text/plain', // Plain text files
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
 * Get AWS S3 credentials from storage, environment variables, or fallback credentials
 */
export const getAwsCredentials = (): AWSCredentials => {
  // First try to get from storage
  const storedCredentials = storage.getItem('aws_credentials');
  if (storedCredentials) {
    try {
      return JSON.parse(storedCredentials);
    } catch (e) {
      console.error("Failed to parse stored AWS credentials", e);
    }
  }
  
  // Then try to get from environment variables
  const envCredentials = getEnvCredentials();
  
  // If we have all required credentials from environment variables, use them
  if (envCredentials.accessKeyId &&
      envCredentials.secretAccessKey &&
      envCredentials.region &&
      envCredentials.bucket) {
    return envCredentials as AWSCredentials;
  }
  
  // Otherwise, use fallback credentials
  return FALLBACK_CREDENTIALS;
};

/**
 * Save AWS S3 credentials to storage
 */
export const saveAwsCredentials = (credentials: AWSCredentials): void => {
  storage.setItem('aws_credentials', JSON.stringify(credentials));
};

/**
 * Check if custom AWS credentials are being used
 */
export const isUsingCustomAwsCredentials = (): boolean => {
  // Check if credentials are stored in storage
  const hasStoredCredentials = storage.getItem('aws_credentials') !== null;
  
  if (hasStoredCredentials) {
    return true;
  }
  
  // Check if environment variables are being used
  const envCredentials = getEnvCredentials();
  const hasEnvCredentials = !!(
    envCredentials.accessKeyId &&
    envCredentials.secretAccessKey &&
    envCredentials.bucket
  );
  
  return hasEnvCredentials;
};

/**
 * Create S3 client with proper configuration
 */
const createS3Client = (credentials: AWSCredentials) => {
  console.log("Creating S3 client with credentials:", {
    accessKeyId: credentials.accessKeyId.substring(0, 5) + "...",
    region: credentials.region,
    bucket: credentials.bucket
  });
  
  return new S3Client({
    region: credentials.region,
    credentials: {
      accessKeyId: credentials.accessKeyId,
      secretAccessKey: credentials.secretAccessKey
    },
    maxAttempts: 3,
  });
};

/**
 * Get a list of all available buckets for the current credentials
 * This version doesn't run any tests or upload any files
 */
export const listAwsBuckets = async (): Promise<string[]> => {
  try {
    console.log("Getting AWS S3 bucket from credentials");
    
    // Just return the bucket from the credentials without running any tests
    const credentials = getAwsCredentials();
    if (credentials.bucket) {
      return [credentials.bucket];
    }
    
    // If no bucket is specified in the credentials, return an empty array
    return [];
  } catch (error) {
    console.error("Failed to get AWS S3 bucket from credentials:", error);
    
    // Default error message with troubleshooting info
    throw new Error("Failed to get AWS S3 bucket from credentials. Please make sure you've entered a bucket name in your AWS credentials.");
  }
};

/**
 * Check if bucket exists and is accessible
 * This version doesn't run any tests or upload any files
 */
export const checkBucketExists = async (bucket: string): Promise<boolean> => {
  if (!bucket) return false;
  
  try {
    console.log(`Assuming bucket "${bucket}" exists without testing`);
    
    // Just return true without actually testing the bucket
    // This avoids uploading test files to the bucket
    return true;
  } catch (error) {
    console.error(`Error checking bucket "${bucket}":`, error);
    return false;
  }
};

/**
 * Get CORS configuration for AWS S3 bucket
 * This returns a JSON string that can be used in the AWS S3 console
 */
export const getS3CorsConfiguration = (): string => {
  return JSON.stringify([
    {
      "AllowedHeaders": [
        "*"
      ],
      "AllowedMethods": [
        "GET",
        "PUT",
        "POST",
        "DELETE",
        "HEAD"
      ],
      "AllowedOrigins": [
        "*"  // In production, replace with your specific domain
      ],
      "ExposeHeaders": [
        "ETag",
        "x-amz-server-side-encryption",
        "x-amz-request-id",
        "x-amz-id-2"
      ],
      "MaxAgeSeconds": 3000
    }
  ], null, 2);
};

/**
 * Test AWS S3 connectivity using pre-signed URLs to bypass CORS restrictions
 */
export const testAwsConnectivityWithPresignedUrl = async (): Promise<{
  success: boolean;
  message: string;
  details: {
    credentialsValid: boolean;
    bucketAccessible: boolean;
    writePermission: boolean;
    corsEnabled?: boolean;
    availableBuckets?: string[];
    errorDetails?: string;
    corsConfig?: string;
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
      errorDetails: undefined,
      corsConfig: getS3CorsConfiguration()
    }
  };
  
  try {
    // Check if credentials are provided
    if (!credentials.accessKeyId || !credentials.secretAccessKey) {
      results.message = "AWS credentials are missing";
      return results;
    }
    
    console.log("Testing AWS connectivity with pre-signed URL approach:", {
      accessKeyId: credentials.accessKeyId.substring(0, 5) + "...",
      region: credentials.region,
      bucket: credentials.bucket
    });
    
    // Import the pre-signed URL functions
    const { getPresignedUploadUrl } = await import('./awsPresignedUpload');
    
    // Step 1: Test credentials by generating a pre-signed URL
    try {
      // Use a dedicated directory for test files with a timestamp to avoid conflicts
      const testDirectory = `_system_tests_/${Date.now()}`;
      const testKey = `${testDirectory}/connectivity-test.txt`;
      const { uploadUrl, publicUrl } = await getPresignedUploadUrl(
        'connectivity-test.txt',
        'text/plain',
        testDirectory
      );
      
      // If we get here, credentials are valid
      results.details.credentialsValid = true;
      console.log("AWS credentials valid. Pre-signed URL generated successfully.");
      
      // Step 2: Test bucket accessibility with a small upload
      try {
        // Create a small test file
        const testContent = 'Connectivity test';
        const testBlob = new Blob([testContent], { type: 'text/plain' });
        
        // Remove any ACL parameters from the URL
        const uploadUrlWithoutAcl = uploadUrl.replace(/&x-amz-acl=[^&]+/, '');
        
        // Upload the test file using fetch
        const response = await fetch(uploadUrlWithoutAcl, {
          method: 'PUT',
          body: testBlob,
          headers: {
            'Content-Type': 'text/plain',
          }
        });
        
        if (response.ok) {
          results.details.bucketAccessible = true;
          results.details.writePermission = true;
          results.success = true;
          results.message = "AWS S3 connection successful! Ready to upload.";
          console.log("Write permissions test passed");
          
          // Step 3: Verify the uploaded file is accessible
          try {
            const verifyResponse = await fetch(publicUrl, { method: 'HEAD' });
            if (verifyResponse.ok) {
              results.details.corsEnabled = true;
              console.log("CORS appears to be configured correctly");
            } else {
              results.details.corsEnabled = false;
              console.log("CORS may not be configured correctly");
            }
          } catch (corsError) {
            console.log("Could not verify CORS configuration:", corsError);
            results.details.corsEnabled = false;
          }
        } else {
          results.message = `Upload test failed with status: ${response.status} ${response.statusText}`;
          results.details.errorDetails = `HTTP Error: ${response.status} ${response.statusText}`;
          console.error("Write permission test failed:", results.message);
        }
      } catch (uploadError) {
        results.message = "AWS credentials are valid, but upload test failed.";
        results.details.errorDetails = uploadError instanceof Error ? uploadError.message : String(uploadError);
        console.error("Upload test failed:", uploadError);
      }
    } catch (error) {
      results.message = error instanceof Error ? error.message : "Invalid AWS credentials";
      results.details.errorDetails = error instanceof Error ? error.message : String(error);
      console.error("Failed to generate pre-signed URL:", error);
      
      // Add CORS troubleshooting info if it looks like a CORS issue
      if (error instanceof Error &&
          (error.message.includes("fetch") ||
           error.message.includes("CORS") ||
           error.message.includes("Network"))) {
        results.message += " This may be due to CORS restrictions in your browser. You may need to enable CORS on your S3 bucket.";
      }
    }
    
    return results;
  } catch (error) {
    console.error("AWS S3 general test failed:", error);
    results.details.errorDetails = error instanceof Error ? error.message : String(error);
    results.message = "AWS S3 test failed: " + (error instanceof Error ? error.message : String(error));
    
    return results;
  }
};

/**
 * Test AWS S3 connectivity with improved error handling for CORS
 * @deprecated Use testAwsConnectivityWithPresignedUrl instead for better browser compatibility
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
    corsConfig?: string;
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
      errorDetails: undefined,
      corsConfig: getS3CorsConfiguration()
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
    
    // Step 1: Test credentials by listing buckets
    try {
      const buckets = await listAwsBuckets();
      results.details.credentialsValid = true;
      results.details.availableBuckets = buckets;
      console.log("AWS credentials valid. Available buckets:", buckets);
    } catch (error) {
      results.message = error instanceof Error ? error.message : "Invalid AWS credentials";
      results.details.errorDetails = error instanceof Error ? error.message : String(error);
      
      // Add CORS troubleshooting info if it looks like a CORS issue
      if (error instanceof Error && 
          (error.message.includes("fetch") || 
           error.message.includes("CORS") || 
           error.message.includes("Network"))) {
        results.message += " This may be due to CORS restrictions in your browser. You may need to enable CORS on your S3 bucket.";
      }
      
      return results;
    }
    
    // Step 2: Check if bucket exists and is accessible
    if (credentials.bucket) {
      try {
        const bucketExists = await checkBucketExists(credentials.bucket);
        results.details.bucketAccessible = bucketExists;
        
        if (!bucketExists) {
          // Check if the bucket is in the available buckets list
          const bucketInList = results.details.availableBuckets?.includes(credentials.bucket) || false;
          
          if (bucketInList) {
            results.message = `You have access to the "${credentials.bucket}" bucket, but there may be CORS restrictions preventing browser access.`;
            results.details.errorDetails = "CORS restrictions detected";
          } else {
            results.message = `Bucket "${credentials.bucket}" does not exist or is not accessible.`;
            results.details.errorDetails = `Bucket "${credentials.bucket}" does not exist or is not accessible.`;
            
            // Add available buckets info if we have them
            if (results.details.availableBuckets && results.details.availableBuckets.length > 0) {
              results.message += ` Available buckets: ${results.details.availableBuckets.join(', ')}`;
            }
          }
          
          return results;
        }
        
        console.log(`Bucket "${credentials.bucket}" is accessible`);
      } catch (error) {
        results.message = `Error checking bucket "${credentials.bucket}": ${error instanceof Error ? error.message : String(error)}`;
        results.details.errorDetails = error instanceof Error ? error.message : String(error);
        return results;
      }
      
      // Step 3: Test write permissions with a small file
      try {
        // Use a dedicated directory for test files with a timestamp to avoid conflicts
        const testDirectory = `_system_tests_/${Date.now()}`;
        const testKey = `${testDirectory}/write-permission-test.txt`;
        const s3Client = createS3Client(credentials);
        
        await s3Client.send(new PutObjectCommand({
          Bucket: credentials.bucket,
          Key: testKey,
          Body: 'Write permission test',
          ContentType: 'text/plain',
          ACL: 'public-read',
        }));
        
        results.details.writePermission = true;
        console.log("Write permissions test passed");
        
        // If we get here, we have write permissions
        results.success = true;
        results.message = "AWS S3 connection successful! Ready to upload.";
        
        // Attempt to detect CORS configuration
        try {
          const bucketUrl = getBucketEndpointUrl(credentials.bucket, credentials.region);
          const testUrl = `${bucketUrl}/${testKey}`;
          
          // Try to fetch the file we just uploaded to check if CORS is configured
          const response = await fetch(testUrl, { method: 'HEAD' });
          
          if (response.ok) {
            results.details.corsEnabled = true;
            console.log("CORS appears to be configured correctly");
          } else {
            results.details.corsEnabled = false;
            console.log("CORS may not be configured correctly");
          }
        } catch (corsError) {
          console.log("Could not verify CORS configuration:", corsError);
          results.details.corsEnabled = false;
        }
        
      } catch (error) {
        results.message = "AWS credentials are valid and bucket is accessible, but write permission test failed.";
        results.details.errorDetails = error instanceof Error ? error.message : String(error);
        console.error("Write permission test failed:", error);
        
        // Add more specific guidance for permission errors
        if (error instanceof Error && error.message.includes("Access Denied")) {
          results.message += " Your IAM user needs s3:PutObject and s3:PutObjectAcl permissions.";
        }
      }
    } else {
      results.message = "AWS credentials are valid, but no bucket is specified.";
    }
    
  } catch (error) {
    console.error("AWS S3 general test failed:", error);
    results.details.errorDetails = error instanceof Error ? error.message : String(error);
    results.message = "AWS S3 test failed: " + (error instanceof Error ? error.message : String(error));
    
    // Add CORS troubleshooting info
    if (error instanceof Error && 
        (error.message.includes("fetch") || 
         error.message.includes("CORS") || 
         error.message.includes("Network"))) {
      results.message += " This may be due to CORS restrictions in your browser.";
    }
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
 * Upload a file to AWS S3 using a direct browser upload approach
 * with improved CORS handling
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
  
  // Normalize path (make sure it ends with a slash if not empty)
  const normalizedPath = path ? (path.endsWith('/') ? path : `${path}/`) : '';
  
  // Construct the full path including the filename with timestamp and uuid
  const timestamp = Date.now();
  const uuid = uuidv4().substring(0, 8);
  const sanitizedFilename = file.name.replace(/[^a-zA-Z0-9._-]/g, '_');
  const fileName = `${timestamp}-${uuid}-${sanitizedFilename}`;
  const objectKey = `${normalizedPath}${fileName}`;
  
  console.log(`AWS S3 Upload - Full key path: ${objectKey}`);
  
  // Get the endpoint URL
  const s3Endpoint = getBucketEndpointUrl(credentials.bucket, credentials.region);
  
  // First, verify we can access the bucket
  try {
    const bucketExists = await checkBucketExists(credentials.bucket);
    if (!bucketExists) {
      throw new Error(`Bucket "${credentials.bucket}" does not exist or is not accessible. Please check your AWS credentials and bucket name.`);
    }
  } catch (error) {
    console.error("Bucket access check failed:", error);
    throw new Error(`Failed to verify bucket access: ${error instanceof Error ? error.message : String(error)}`);
  }
  
  return new Promise((resolve, reject) => {
    try {
      console.log(`Using AWS SDK for S3 upload to: ${credentials.bucket}/${objectKey}`);
      
      // Use FileReader to get file content
      const reader = new FileReader();
      
      reader.onload = async function(event) {
        const arrayBuffer = event.target?.result;
        
        if (!arrayBuffer || typeof arrayBuffer === 'string') {
          reject(new Error('Failed to read file as ArrayBuffer'));
          return;
        }
        
        // Use AWS SDK Upload for multipart upload with progress tracking
        try {
          console.log("Using AWS SDK Upload for multipart upload...");
          const s3Client = createS3Client(credentials);
          
          // Create a multipart upload using the Upload utility from @aws-sdk/lib-storage
          // This handles large files better and provides progress tracking
          const upload = new Upload({
            client: s3Client,
            params: {
              Bucket: credentials.bucket,
              Key: objectKey,
              Body: new Uint8Array(arrayBuffer),
              ContentType: file.type || 'application/octet-stream',
              ACL: 'public-read',
            },
          });
      
          // Add progress tracking
          upload.on('httpUploadProgress', (progress) => {
            if (progress.loaded && progress.total) {
              const percentComplete = (progress.loaded / progress.total) * 100;
              console.log(`Upload progress: ${percentComplete.toFixed(2)}%`);
            }
          });
          
          // Execute the upload
          await upload.done();
          console.log('AWS SDK multipart upload successful!');
          
          // Return the URL to the uploaded file
          const url = `${s3Endpoint}/${objectKey}`;
          resolve(url);
        } catch (error) {
          console.error("AWS S3 upload failed:", error);
          
          // Provide more specific error messages for common issues
          if (error instanceof Error) {
            if (error.message.includes("NetworkingError") ||
                error.message.includes("Network Error") ||
                error.message.includes("Failed to fetch")) {
              reject(new Error("Network error during upload. This is likely due to CORS restrictions on your S3 bucket. Please add CORS configuration to allow uploads from this domain."));
            } else if (error.message.includes("Access Denied")) {
              reject(new Error("Access denied. Your AWS credentials don't have permission to upload to this bucket. Ensure your IAM user has s3:PutObject and s3:PutObjectAcl permissions."));
            } else if (error.message.includes("InvalidAccessKeyId")) {
              reject(new Error("Invalid AWS Access Key ID. Please check your credentials."));
            } else if (error.message.includes("SignatureDoesNotMatch")) {
              reject(new Error("Invalid AWS Secret Access Key. Please check your credentials."));
            } else {
              reject(new Error(`AWS S3 upload failed: ${error.message}`));
            }
          } else {
            reject(new Error("Unknown error during AWS S3 upload"));
          }
        }
      };
      
      reader.onerror = function() {
        reject(new Error('Error reading file'));
      };
      
      // Read the file as ArrayBuffer
      reader.readAsArrayBuffer(file);
      
    } catch (error) {
      console.error('Unexpected error setting up AWS S3 upload:', error);
      reject(error);
    }
  });
};

/**
 * Reset to default AWS credentials
 */
export const resetToDefaultAwsCredentials = (): void => {
  storage.removeItem('aws_credentials');
};

/**
 * Toggle between real and simulated AWS uploads
 */
export const setUseRealAwsStorage = (useReal: boolean): void => {
  storage.setItem('use_real_aws', useReal ? 'true' : 'false');
};

/**
 * Check if real AWS S3 is being used
 */
export const isUsingRealAwsStorage = (): boolean => {
  return storage.getItem('use_real_aws') !== 'false';
};

// Enable real AWS S3 storage by default
setUseRealAwsStorage(true);
