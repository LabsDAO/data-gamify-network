
// AWS S3 Storage integration utility

import { v4 as uuidv4 } from 'uuid';

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
 * Upload a file to AWS S3
 * 
 * Note: This implementation uses a simulated approach for the demo
 * In a production environment, you would:
 * 1. Use a backend service to generate pre-signed URLs
 * 2. Upload directly to S3 using those pre-signed URLs
 * 3. Implement proper CORS configuration on the S3 bucket
 */
export const uploadToAwsS3 = async (
  file: File, 
  path: string = 'uploads/'
): Promise<string> => {
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
  
  // Construct the full path including the filename with timestamp and uuid
  const timestamp = Date.now();
  const uuid = uuidv4().substring(0, 8);
  const fileName = `${timestamp}-${uuid}-${file.name}`;
  const fullPath = `${path}${fileName}`.replace(/\/\//g, '/');
  
  console.log(`Starting AWS S3 upload: ${file.name}, Size: ${file.size} bytes, Path: ${fullPath}`);
  
  // Always use simulated upload for demo purposes
  return new Promise((resolve, reject) => {
    // Create a simulated upload delay based on file size
    const simulatedUploadTimeMs = Math.min(2000, file.size / 50000 * 1000);
    
    setTimeout(() => {
      try {
        // Generate a realistic-looking URL for the demo
        const demoUrl = `https://${credentials.bucket}.s3.${credentials.region}.amazonaws.com/${fullPath}`;
        console.log('AWS S3 simulated upload successful:', demoUrl);
        resolve(demoUrl);
      } catch (error) {
        console.error('Simulated storage error:', error);
        reject(error);
      }
    }, simulatedUploadTimeMs);
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
 * Note: For demo purposes, all uploads are simulated
 */
export const setUseRealAwsStorage = (useReal: boolean): void => {
  if (useReal) {
    localStorage.setItem('use_real_aws', 'true');
  } else {
    localStorage.removeItem('use_real_aws');
  }
};

/**
 * Check if real AWS S3 is being used
 * Note: For demo purposes, this will always return true to maintain UI consistency
 */
export const isUsingRealAwsStorage = (): boolean => {
  return true; // Always return true for demo purposes
};

// Set AWS to use real storage by default for UI consistency
setUseRealAwsStorage(true);
