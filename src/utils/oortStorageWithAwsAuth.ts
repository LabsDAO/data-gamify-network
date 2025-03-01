/**
 * OORT Storage integration utility with AWS v4 signature authentication
 * 
 * This implementation uses AWS v4 signature (AWS4-HMAC-SHA256) for authentication
 * as required by OORT Storage's S3-Compatible API.
 */

import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import { v4 as uuidv4 } from 'uuid';

type OortStorageCredentials = {
  accessKey: string;
  secretKey: string;
  endpoint: string;
  bucket: string;
};

// Get credentials from environment variables if available
const getEnvCredentials = (): Partial<OortStorageCredentials> => {
  const credentials: Partial<OortStorageCredentials> = {};
  
  if (import.meta.env.VITE_OORT_ACCESS_KEY) {
    credentials.accessKey = import.meta.env.VITE_OORT_ACCESS_KEY;
  }
  
  if (import.meta.env.VITE_OORT_SECRET_KEY) {
    credentials.secretKey = import.meta.env.VITE_OORT_SECRET_KEY;
  }
  
  if (import.meta.env.VITE_OORT_ENDPOINT) {
    credentials.endpoint = import.meta.env.VITE_OORT_ENDPOINT;
  }

  // Default bucket for OORT Storage
  credentials.bucket = 'labsmarket';
  
  return credentials;
};

// Default credentials (fallback if environment variables are not set)
const DEFAULT_CREDENTIALS: OortStorageCredentials = {
  accessKey: "3IRFO1K3VC23DVSE81IO",
  secretKey: "qlPAgrnHGujYJzqgRrRE5bsLb40Flk8B9BTRdng8",
  endpoint: "https://s3-standard.oortech.com",
  bucket: "labsmarket"
};

// Create a storage utility that works in both browser and Node.js environments
const createStorage = () => {
  // Check if we're in a browser environment with localStorage
  const isBrowser = typeof window !== 'undefined' && typeof localStorage !== 'undefined';
  
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

// File validation rules
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
  // Plain text (for testing)
  'text/plain',
];

/**
 * Validate file before upload
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
 * Get OORT Storage credentials from environment variables, localStorage, or use defaults
 */
export const getOortCredentials = (): OortStorageCredentials => {
  // First try to get from localStorage (only in browser)
  const storedCredentials = storage.getItem('oort_credentials');
  if (storedCredentials) {
    try {
      return JSON.parse(storedCredentials);
    } catch (e) {
      console.error("Failed to parse stored OORT credentials", e);
    }
  }
  
  // Then try to get from environment variables
  const envCredentials = getEnvCredentials();
  
  // If we have all required credentials from environment variables, use them
  if (envCredentials.accessKey && envCredentials.secretKey) {
    return {
      accessKey: envCredentials.accessKey,
      secretKey: envCredentials.secretKey,
      endpoint: envCredentials.endpoint || DEFAULT_CREDENTIALS.endpoint,
      bucket: envCredentials.bucket || DEFAULT_CREDENTIALS.bucket
    };
  }
  
  // Otherwise, use default credentials
  return DEFAULT_CREDENTIALS;
};

/**
 * Save OORT Storage credentials to localStorage
 */
export const saveOortCredentials = (credentials: OortStorageCredentials): void => {
  storage.setItem('oort_credentials', JSON.stringify(credentials));
};

/**
 * Check if custom credentials are being used
 */
export const isUsingCustomCredentials = (): boolean => {
  // Check if credentials are stored in localStorage
  const hasStoredCredentials = storage.getItem('oort_credentials') !== null;
  
  if (hasStoredCredentials) {
    return true;
  }
  
  // Check if environment variables are being used
  const envCredentials = getEnvCredentials();
  const hasEnvCredentials = !!(
    envCredentials.accessKey &&
    envCredentials.secretKey
  );
  
  return hasEnvCredentials;
};

/**
 * Generate a pre-signed URL for uploading a file to OORT Storage
 * This uses AWS v4 signature authentication as required by OORT Storage
 */
export const getOortPresignedUploadUrl = async (
  fileName: string,
  fileType: string,
  path: string = 'Flat-tires/',
  expiresIn: number = 3600 // URL expires in 1 hour by default
): Promise<{
  uploadUrl: string;
  fileKey: string;
  publicUrl: string;
}> => {
  const credentials = getOortCredentials();
  
  // Check if credentials are provided
  if (!credentials.accessKey || !credentials.secretKey) {
    throw new Error('OORT credentials not configured. Please set up your OORT credentials first.');
  }
  
  // Normalize path (make sure it ends with a slash if not empty)
  const normalizedPath = path ? (path.endsWith('/') ? path : `${path}/`) : '';
  
  // Generate a unique file key
  const timestamp = Date.now();
  const uuid = uuidv4().substring(0, 8);
  const sanitizedFilename = fileName.replace(/[^a-zA-Z0-9._-]/g, '_');
  const fileKey = `${normalizedPath}${timestamp}-${uuid}-${sanitizedFilename}`;
  
  try {
    // Extract the endpoint hostname without protocol
    const endpointUrl = new URL(credentials.endpoint);
    const hostname = endpointUrl.hostname;
    
    // Create S3 client configured for OORT Storage
    const s3Client = new S3Client({
      region: 'us-east-1', // Region doesn't matter for OORT, but is required by AWS SDK
      endpoint: credentials.endpoint,
      credentials: {
        accessKeyId: credentials.accessKey,
        secretAccessKey: credentials.secretKey
      },
      forcePathStyle: true // Required for S3-compatible APIs
    });
    
    // Create the command for putting an object in OORT Storage
    const command = new PutObjectCommand({
      Bucket: credentials.bucket,
      Key: fileKey,
      ContentType: fileType
    });
    
    // Generate the pre-signed URL
    const uploadUrl = await getSignedUrl(s3Client, command, { expiresIn });
    
    // Generate the public URL for the file after upload
    const publicUrl = `${credentials.endpoint}/${credentials.bucket}/${fileKey}`;
    
    return {
      uploadUrl,
      fileKey,
      publicUrl
    };
  } catch (error) {
    console.error('Error generating pre-signed URL for OORT Storage:', error);
    throw error;
  }
};

/**
 * Upload a file to OORT Storage using a pre-signed URL with AWS v4 signature
 */
export type UploadResult = {
  success: boolean;
  url?: string;
  error?: string;
  statusCode?: number;
  verified?: boolean;
};

export const uploadToOortStorage = async (
  file: File,
  path: string = 'Flat-tires/',
  userId?: string,
  addPointsCallback?: (points: number) => void
): Promise<UploadResult> => {
  // Validate file first
  const validation = validateFile(file);
  if (!validation.valid) {
    return {
      success: false,
      error: validation.error
    };
  }
  
  try {
    console.log(`Starting OORT Storage upload with AWS v4 signature: ${file.name}, Size: ${file.size} bytes, Path: ${path}`);
    
    // Get pre-signed URL
    const { uploadUrl, publicUrl } = await getOortPresignedUploadUrl(
      file.name,
      file.type || 'application/octet-stream',
      path
    );
    
    console.log(`Got pre-signed URL for OORT Storage: ${uploadUrl}`);
    
    // Upload the file using the pre-signed URL
    const response = await fetch(uploadUrl, {
      method: 'PUT',
      body: file,
      headers: {
        'Content-Type': file.type || 'application/octet-stream',
      }
    });
    
    if (!response.ok) {
      let errorMessage = `OORT Storage upload failed: ${response.status} - ${response.statusText}`;
      
      try {
        const responseText = await response.text();
        console.error('Response:', responseText);
        
        try {
          const responseData = JSON.parse(responseText);
          errorMessage += ` - ${responseData.message || responseData.error || 'Unknown error'}`;
        } catch (e) {
          // If we can't parse the error response, use the status text
          errorMessage += ` - ${response.statusText || 'Unknown error'}`;
        }
      } catch (e) {
        console.error('Could not read response text:', e);
      }
      
      console.error(errorMessage);
      
      return {
        success: false,
        error: errorMessage,
        statusCode: response.status
      };
    }
    
    console.log('OORT Storage upload successful!');
    
    // Verify the file is accessible
    const verified = await verifyFileAccessibility(publicUrl);
    
    // Track the upload and award points if userId is provided
    if (userId) {
      try {
        // Import the userPointsTracker dynamically to avoid circular dependencies
        const { trackFileUpload } = await import('./userPointsTracker');
        
        // Track the upload in Supabase and award points
        await trackFileUpload(
          userId,
          file.name,
          file.size,
          file.type || 'application/octet-stream',
          'OORT',
          publicUrl,
          addPointsCallback
        );
      } catch (error) {
        console.error('Error tracking upload:', error);
        // Continue even if tracking fails
      }
    }
    
    return {
      success: true,
      url: publicUrl,
      verified,
      statusCode: response.status
    };
  } catch (error) {
    console.error('OORT Storage upload failed:', error);
    
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error during upload'
    };
  }
};

/**
 * Reset to default credentials
 */
export const resetToDefaultCredentials = (): void => {
  // Check if we're in a browser environment with localStorage
  const isBrowser = typeof window !== 'undefined' && typeof localStorage !== 'undefined';
  
  if (isBrowser) {
    localStorage.removeItem('oort_credentials');
  } else {
    console.log('Running in Node.js environment - cannot reset credentials in localStorage');
  }
};

/**
 * Toggle between real and simulated uploads
 */
export const setUseRealOortStorage = (useReal: boolean): void => {
  // Check if we're in a browser environment with localStorage
  const isBrowser = typeof window !== 'undefined' && typeof localStorage !== 'undefined';
  
  if (isBrowser) {
    if (useReal) {
      localStorage.setItem('use_real_oort', 'true');
    } else {
      localStorage.removeItem('use_real_oort');
    }
  } else {
    console.log(`Running in Node.js environment - ${useReal ? 'using' : 'not using'} real OORT storage`);
    // In Node.js, we'll always use real storage for tests
    // No need to store this preference since localStorage isn't available
  }
};

/**
 * Check if real OORT Storage is being used
 */
export const isUsingRealOortStorage = (): boolean => {
  // Check if we're in a browser environment with localStorage
  const isBrowser = typeof window !== 'undefined' && typeof localStorage !== 'undefined';
  
  if (isBrowser) {
    return localStorage.getItem('use_real_oort') === 'true';
  }
  
  // In Node.js environment, always return true for tests
  return true;
};

/**
 * Verify if a file is accessible via HTTP request
 * @param url The URL of the file to verify
 * @returns A promise that resolves to true if the file is accessible, false otherwise
 */
const verifyFileAccessibility = async (url: string): Promise<boolean> => {
  try {
    const response = await fetch(url, { method: 'HEAD' });
    return response.ok;
  } catch (error) {
    console.error('Error verifying file accessibility:', error);
    return false;
  }
};

/**
 * Test function to verify pre-signed URL generation for OORT Storage
 */
export const testOortPresignedUrl = async (): Promise<void> => {
  try {
    // Use a dedicated directory for test files with a timestamp to avoid conflicts
    const testDirectory = `_system_tests_/${Date.now()}`;
    const { uploadUrl, fileKey, publicUrl } = await getOortPresignedUploadUrl(
      'test-file.txt',
      'text/plain',
      testDirectory
    );
    
    console.log('OORT Storage pre-signed URL generated successfully:');
    console.log(`- Upload URL: ${uploadUrl}`);
    console.log(`- File Key: ${fileKey}`);
    console.log(`- Public URL after upload: ${publicUrl}`);
    
    console.log('\nTo test this URL, you can use curl:');
    console.log(`curl -X PUT -H "Content-Type: text/plain" --data "This is a test file" "${uploadUrl}"`);
    console.log('\nAfter uploading, you can access the file at:');
    console.log(publicUrl);
  } catch (error) {
    console.error('Failed to generate OORT Storage pre-signed URL:', error);
  }
};