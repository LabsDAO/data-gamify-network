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

// Real credentials with the provided values
const REAL_CREDENTIALS: AWSCredentials = {
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
 * Get AWS S3 credentials from localStorage or use real credentials
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
  return REAL_CREDENTIALS;
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
  // Since we now have real credentials, check if they've been overridden
  const creds = getAwsCredentials();
  const areRealCredsBeingUsed = 
    creds.accessKeyId === REAL_CREDENTIALS.accessKeyId && 
    creds.secretAccessKey === REAL_CREDENTIALS.secretAccessKey &&
    creds.bucket === REAL_CREDENTIALS.bucket;
  
  // Return true if credentials are stored (custom) or the real ones are used
  return localStorage.getItem('aws_credentials') !== null || areRealCredsBeingUsed;
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
 * Using a more CORS-friendly approach with explicit error handling
 */
export const listAwsBuckets = async (): Promise<string[]> => {
  const credentials = getAwsCredentials();
  
  try {
    console.log("Attempting to list AWS S3 buckets with credentials:", {
      accessKeyId: credentials.accessKeyId.substring(0, 5) + "...",
      region: credentials.region,
    });
    
    // Create S3 client
    const s3Client = createS3Client(credentials);
    
    // List all buckets with a timeout to prevent hanging requests
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 10000); // 10 second timeout
    
    try {
      const { Buckets } = await s3Client.send(new ListBucketsCommand({}));
      clearTimeout(timeoutId);
      
      // If we get here, credentials are valid
      console.log("AWS credentials validated successfully, buckets:", Buckets?.map(b => b.Name));
      
      return (Buckets || []).map(bucket => bucket.Name || '').filter(Boolean);
    } catch (error) {
      clearTimeout(timeoutId);
      throw error; // Rethrow to be caught by the outer try/catch
    }
  } catch (error) {
    console.error("Failed to list AWS S3 buckets:", error);
    
    // For specific guidance on common AWS errors
    if (error instanceof Error) {
      if (error.message.includes("InvalidAccessKeyId")) {
        throw new Error("The AWS Access Key ID you provided is invalid");
      } else if (error.message.includes("SignatureDoesNotMatch")) {
        throw new Error("The AWS Secret Access Key you provided is invalid");
      } else if (error.message.includes("NetworkingError") || 
                error.message.includes("Failed to fetch") ||
                error.message.includes("Network Error")) {
        throw new Error("Network error connecting to AWS. This may be due to CORS restrictions or network connectivity issues.");
      } else if (error.name === "AbortError") {
        throw new Error("Request to AWS timed out. Check your credentials and network connection.");
      }
    }
    
    // Default error message with troubleshooting info
    throw new Error("Failed to connect to AWS. This may be due to CORS restrictions in the browser. Try using different credentials or enabling CORS on your S3 bucket.");
  }
};

/**
 * Check if bucket exists and is accessible using a CORS-friendly approach
 */
export const checkBucketExists = async (bucket: string): Promise<boolean> => {
  if (!bucket) return false;
  
  const credentials = getAwsCredentials();
  try {
    console.log(`Checking if bucket "${bucket}" exists and is accessible`);
    
    // Create S3 client
    const s3Client = createS3Client(credentials);
    
    // Use a timeout to prevent hanging requests
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 10000); // 10 second timeout
    
    try {
      await s3Client.send(new HeadBucketCommand({ Bucket: bucket }));
      clearTimeout(timeoutId);
      
      console.log(`Bucket "${bucket}" exists and is accessible`);
      return true;
    } catch (error) {
      clearTimeout(timeoutId);
      
      // Check for specific bucket errors
      if (error instanceof Error) {
        if (error.name === "NotFound" || 
            error.message.includes("NotFound") ||
            error.message.includes("does not exist")) {
          console.log(`Bucket "${bucket}" does not exist`);
          return false;
        }
        
        // For access denied errors, the bucket exists but isn't accessible
        if (error.name === "Forbidden" || 
            error.message.includes("Forbidden") ||
            error.message.includes("Access Denied")) {
          console.log(`Bucket "${bucket}" exists but access is denied`);
          return false;
        }
      }
      
      // For other errors, assume bucket doesn't exist or isn't accessible
      console.error(`Error checking bucket "${bucket}":`, error);
      return false;
    }
  } catch (error) {
    console.error(`Error checking bucket "${bucket}":`, error);
    return false;
  }
};

/**
 * Test AWS S3 connectivity with improved error handling for CORS
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
        const testKey = `test/write-permission-test-${Date.now()}.txt`;
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
        
        // Try multiple upload approaches
        const approaches = [
          // Approach 1: AWS SDK PutObjectCommand
          async () => {
            console.log("Trying AWS SDK PutObjectCommand approach...");
            const s3Client = createS3Client(credentials);
            
            const command = new PutObjectCommand({
              Bucket: credentials.bucket,
              Key: objectKey,
              Body: new Uint8Array(arrayBuffer),
              ContentType: file.type || 'application/octet-stream',
              ACL: 'public-read',
            });
            
            await s3Client.send(command);
            console.log('AWS SDK upload successful!');
            return `${s3Endpoint}/${objectKey}`;
          },
          
          // Approach 2: XMLHttpRequest with presigned URL simulation
          async () => {
            console.log("Trying XMLHttpRequest approach...");
            
            // Use the endpoint directly
            const uploadUrl = `${s3Endpoint}/${objectKey}`;
            
            return new Promise<string>((resolveXhr, rejectXhr) => {
              const xhr = new XMLHttpRequest();
              xhr.open('PUT', uploadUrl);
              
              // Set headers
              xhr.setRequestHeader('Content-Type', file.type || 'application/octet-stream');
              
              // Add authorization header (basic auth with AWS credentials)
              const authString = `${credentials.accessKeyId}:${credentials.secretAccessKey}`;
              const authHeader = `Basic ${btoa(authString)}`;
              xhr.setRequestHeader('Authorization', authHeader);
              
              // Set public-read ACL
              xhr.setRequestHeader('x-amz-acl', 'public-read');
              
              // Track upload progress
              xhr.upload.onprogress = function(event) {
                if (event.lengthComputable) {
                  const percentComplete = (event.loaded / event.total) * 100;
                  console.log(`Upload progress: ${percentComplete.toFixed(2)}%`);
                }
              };
              
              // Handle successful upload
              xhr.onload = function() {
                if (xhr.status >= 200 && xhr.status < 300) {
                  console.log('XHR upload successful!');
                  resolveXhr(`${s3Endpoint}/${objectKey}`);
                } else {
                  const errorMsg = `XHR upload failed with status ${xhr.status}: ${xhr.responseText}`;
                  console.error(errorMsg);
                  rejectXhr(new Error(errorMsg));
                }
              };
              
              // Handle errors
              xhr.onerror = function(e) {
                console.error('XHR upload error:', e);
                rejectXhr(new Error('XHR upload failed'));
              };
              
              // Send the file
              xhr.send(arrayBuffer);
            });
          },
          
          // Approach 3: Fetch API
          async () => {
            console.log("Trying Fetch API approach...");
            
            const uploadUrl = `${s3Endpoint}/${objectKey}`;
            
            // Add authorization header (basic auth with AWS credentials)
            const authString = `${credentials.accessKeyId}:${credentials.secretAccessKey}`;
            const authHeader = `Basic ${btoa(authString)}`;
            
            const response = await fetch(uploadUrl, {
              method: 'PUT',
              headers: {
                'Content-Type': file.type || 'application/octet-stream',
                'Authorization': authHeader,
                'x-amz-acl': 'public-read'
              },
              body: file
            });
            
            if (!response.ok) {
              const errorText = await response.text();
              throw new Error(`Fetch upload failed with status ${response.status}: ${errorText}`);
            }
            
            console.log('Fetch API upload successful!');
            return `${s3Endpoint}/${objectKey}`;
          }
        ];
        
        // Try each approach in sequence
        for (let i = 0; i < approaches.length; i++) {
          try {
            const url = await approaches[i]();
            resolve(url);
            return;
          } catch (error) {
            console.error(`Approach ${i + 1} failed:`, error);
            
            // If this is the last approach, reject with the error
            if (i === approaches.length - 1) {
              reject(new Error(`All upload approaches failed. This may be due to CORS restrictions or invalid credentials. Original error: ${error instanceof Error ? error.message : String(error)}`));
            }
            // Otherwise, continue to the next approach
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
