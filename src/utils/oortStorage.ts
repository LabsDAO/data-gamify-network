
// OORT Storage integration utility

type StorageCredentials = {
  accessKey: string;
  secretKey: string;
};

// Default credentials (should be used only if user doesn't provide their own)
const DEFAULT_CREDENTIALS: StorageCredentials = {
  accessKey: "1YAWCOB9IEL5O5K13F5P",
  secretKey: "Od4PGAW31DORFBy9RtujPbzdRsXrxJbI22hCrGjp",
};

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
];

// OORT Storage config
const OORT_ENDPOINT = 'https://s3-standard.oortech.com';
const OORT_BUCKET = 'labsmarket'; // Set the target bucket to labsmarket

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
 * Get OORT Storage credentials from localStorage or use defaults
 */
export const getOortCredentials = (): StorageCredentials => {
  const storedCredentials = localStorage.getItem('oort_credentials');
  if (storedCredentials) {
    try {
      return JSON.parse(storedCredentials);
    } catch (e) {
      console.error("Failed to parse stored OORT credentials", e);
    }
  }
  return DEFAULT_CREDENTIALS;
};

/**
 * Save OORT Storage credentials to localStorage
 */
export const saveOortCredentials = (credentials: StorageCredentials): void => {
  localStorage.setItem('oort_credentials', JSON.stringify(credentials));
};

/**
 * Check if custom credentials are being used
 */
export const isUsingCustomCredentials = (): boolean => {
  return localStorage.getItem('oort_credentials') !== null;
};

/**
 * Upload a file to OORT Storage
 * This implementation uses the OORT Storage REST API with proper error handling
 */
export const uploadToOortStorage = async (
  file: File, 
  path: string = 'uploads/'
): Promise<string> => {
  // Validate file first
  const validation = validateFile(file);
  if (!validation.valid) {
    throw new Error(validation.error);
  }
  
  const credentials = getOortCredentials();
  
  // Construct the full path including the filename with timestamp
  const timestamp = Date.now();
  const fileName = `${timestamp}-${file.name}`;
  const fullPath = `${path}${fileName}`.replace(/\/\//g, '/');
  
  console.log(`Starting OORT upload: ${file.name}, Size: ${file.size} bytes, Path: ${fullPath}`);
  
  // Enable fallback only for explicit development mode, not for production or when testing actual uploads
  const useFallbackStorage = process.env.NODE_ENV === 'development' && localStorage.getItem('use_real_oort') !== 'true';
  
  if (useFallbackStorage) {
    // Store in localStorage as base64 for demo purposes
    try {
      return new Promise((resolve) => {
        // Generate a realistic-looking URL for the demo without actually uploading
        const demoUrl = `${OORT_ENDPOINT}/${OORT_BUCKET}/${fullPath}`;
        
        // Simulate network delay
        setTimeout(() => {
          console.log('OORT Storage mock upload successful');
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
      
      // Set up the endpoint with the specific bucket
      const uploadUrl = `${OORT_ENDPOINT}/${OORT_BUCKET}/${fullPath}`;
      
      console.log(`Uploading to: ${uploadUrl}`);
      
      xhr.open('PUT', uploadUrl, true);
      
      // Set proper content type based on file type
      xhr.setRequestHeader('Content-Type', file.type || 'application/octet-stream');
      
      // Set S3-compatible authentication headers
      // Note: This is a simplified version of S3 auth, for full implementation
      // proper signature calculation is needed
      xhr.setRequestHeader('X-Amz-Content-Sha256', 'UNSIGNED-PAYLOAD');
      xhr.setRequestHeader('X-Amz-Date', new Date().toISOString().replace(/[:\-]|\.\d{3}/g, ''));
      xhr.setRequestHeader('Authorization', `AWS4-HMAC-SHA256 Credential=${credentials.accessKey}`);
      
      // Add custom OORT headers if they are supported
      // This is a fallback in case the S3-compatible headers don't work
      xhr.setRequestHeader('X-OORT-ACCESS-KEY', credentials.accessKey);
      xhr.setRequestHeader('X-OORT-SECRET-KEY', credentials.secretKey);
      
      // Handle completion
      xhr.onload = function() {
        if (xhr.status >= 200 && xhr.status < 300) {
          // S3-compatible services typically return empty response for successful PUT
          const fileUrl = `${OORT_ENDPOINT}/${OORT_BUCKET}/${fullPath}`;
          console.log('OORT Storage upload successful');
          resolve(fileUrl);
        } else {
          let errorMessage = `OORT Storage upload failed: ${xhr.status}`;
          try {
            const errorResponse = JSON.parse(xhr.responseText);
            errorMessage += ` - ${errorResponse.message || errorResponse.error || 'Unknown error'}`;
          } catch (e) {
            // If we can't parse the error response, use the status text
            errorMessage += ` - ${xhr.statusText || 'Unknown error'}`;
          }
          console.error(errorMessage);
          console.error('Response:', xhr.responseText);
          reject(new Error(errorMessage));
        }
      };
      
      // Handle network errors
      xhr.onerror = function() {
        const error = new Error('Network error occurred during OORT Storage upload');
        console.error(error);
        reject(error);
      };
      
      // Handle timeouts
      xhr.ontimeout = function() {
        const error = new Error('OORT Storage upload timed out');
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
    console.error('OORT Storage upload error:', error);
    throw error;
  }
};

/**
 * Reset to default credentials
 */
export const resetToDefaultCredentials = (): void => {
  localStorage.removeItem('oort_credentials');
};

/**
 * Toggle between real and simulated uploads
 */
export const setUseRealOortStorage = (useReal: boolean): void => {
  if (useReal) {
    localStorage.setItem('use_real_oort', 'true');
  } else {
    localStorage.removeItem('use_real_oort');
  }
};

/**
 * Check if real OORT Storage is being used
 */
export const isUsingRealOortStorage = (): boolean => {
  return localStorage.getItem('use_real_oort') === 'true';
};
