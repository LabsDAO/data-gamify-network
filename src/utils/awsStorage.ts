
// AWS S3 Storage integration utility

import { v4 as uuidv4 } from 'uuid';

type AWSCredentials = {
  accessKeyId: string;
  secretAccessKey: string;
  region: string;
  bucket: string;
};

// Default credentials (these will be replaced by user input)
const DEFAULT_CREDENTIALS: AWSCredentials = {
  accessKeyId: "",
  secretAccessKey: "",
  region: "us-east-1",
  bucket: "defaultbucket",
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
  const creds = getAwsCredentials();
  return localStorage.getItem('aws_credentials') !== null && 
    creds.accessKeyId !== '' && 
    creds.secretAccessKey !== '';
};

/**
 * Upload a file to AWS S3
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
  
  // Enable fallback only for explicit development mode, not for production
  const useFallbackStorage = process.env.NODE_ENV === 'development' && localStorage.getItem('use_real_aws') !== 'true';
  
  if (useFallbackStorage) {
    // Store in localStorage as base64 for demo purposes
    try {
      return new Promise((resolve) => {
        // Generate a realistic-looking URL for the demo without actually uploading
        const demoUrl = `https://${credentials.bucket}.s3.${credentials.region}.amazonaws.com/${fullPath}`;
        
        // Simulate network delay
        setTimeout(() => {
          console.log('AWS S3 mock upload successful');
          resolve(demoUrl);
        }, 1500);
      });
    } catch (error) {
      console.error('Mock storage error:', error);
      throw error;
    }
  }

  try {
    return new Promise((resolve, reject) => {
      const xhr = new XMLHttpRequest();
      
      // AWS S3 endpoint URL
      const endpoint = `https://${credentials.bucket}.s3.${credentials.region}.amazonaws.com/${fullPath}`;
      
      console.log(`Uploading to AWS S3: ${endpoint}`);
      
      xhr.open('PUT', endpoint, true);
      
      // Set proper content type based on file type
      xhr.setRequestHeader('Content-Type', file.type || 'application/octet-stream');
      
      // Set AWS specific headers for authorization
      // Note: For actual implementation, AWS SDK or pre-signed URLs should be used
      // This is a simplified approach for demonstration
      const now = new Date().toISOString().replace(/[:-]|\.\d{3}/g, '');
      const date = now.substr(0, 8);
      
      xhr.setRequestHeader('x-amz-date', now);
      xhr.setRequestHeader('x-amz-content-sha256', 'UNSIGNED-PAYLOAD');
      xhr.setRequestHeader('Authorization', `AWS4-HMAC-SHA256 Credential=${credentials.accessKeyId}/${date}/${credentials.region}/s3/aws4_request`);
      
      // Handle completion
      xhr.onload = function() {
        if (xhr.status >= 200 && xhr.status < 300) {
          const fileUrl = `https://${credentials.bucket}.s3.${credentials.region}.amazonaws.com/${fullPath}`;
          console.log('AWS S3 upload successful');
          resolve(fileUrl);
        } else {
          let errorMessage = `AWS S3 upload failed: ${xhr.status}`;
          try {
            const errorResponse = JSON.parse(xhr.responseText);
            errorMessage += ` - ${errorResponse.message || errorResponse.error || 'Unknown error'}`;
          } catch (e) {
            errorMessage += ` - ${xhr.statusText || 'Unknown error'}`;
          }
          console.error(errorMessage);
          console.error('Response:', xhr.responseText);
          reject(new Error(errorMessage));
        }
      };
      
      // Handle network errors
      xhr.onerror = function() {
        const error = new Error('Network error occurred during AWS S3 upload');
        console.error(error);
        reject(error);
      };
      
      // Handle timeouts
      xhr.ontimeout = function() {
        const error = new Error('AWS S3 upload timed out');
        console.error(error);
        reject(error);
      };
      
      // Track upload progress
      xhr.upload.onprogress = function(event) {
        if (event.lengthComputable) {
          const percentComplete = (event.loaded / event.total) * 100;
          console.log(`Upload progress: ${percentComplete.toFixed(2)}%`);
        }
      };
      
      // Send the file directly
      xhr.send(file);
    });
  } catch (error) {
    console.error('AWS S3 upload error:', error);
    throw error;
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
  if (useReal) {
    localStorage.setItem('use_real_aws', 'true');
  } else {
    localStorage.removeItem('use_real_aws');
  }
};

/**
 * Check if real AWS S3 is being used
 */
export const isUsingRealAwsStorage = (): boolean => {
  return localStorage.getItem('use_real_aws') === 'true';
};
