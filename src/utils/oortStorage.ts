
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
  
  try {
    // For real implementation, we'll use XMLHttpRequest to track progress
    return new Promise((resolve, reject) => {
      const xhr = new XMLHttpRequest();
      
      // Set up the endpoint - using the correct OORT Storage API endpoint
      const endpoint = 'https://s3-standard.oortech.com';
      
      xhr.open('POST', endpoint, true);
      
      // Set headers for authentication
      xhr.setRequestHeader('X-OORT-ACCESS-KEY', credentials.accessKey);
      xhr.setRequestHeader('X-OORT-SECRET-KEY', credentials.secretKey);
      
      // Handle completion
      xhr.onload = function() {
        if (xhr.status >= 200 && xhr.status < 300) {
          try {
            const response = JSON.parse(xhr.responseText);
            const fileUrl = response.url || `https://s3-standard.oortech.com/${fullPath}`;
            console.log('OORT Storage upload successful:', response);
            resolve(fileUrl);
          } catch (error) {
            console.error('Error parsing OORT response:', error);
            
            // If parsing fails but the upload was successful, construct a URL
            const fallbackUrl = `https://s3-standard.oortech.com/${fullPath}`;
            console.log('Using fallback URL:', fallbackUrl);
            resolve(fallbackUrl);
          }
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
      
      // Create a FormData instance for the file upload
      const formData = new FormData();
      formData.append('file', file);
      formData.append('path', fullPath);
      
      // Execute the request
      xhr.send(formData);
    });
  } catch (error) {
    console.error('OORT Storage upload error:', error);
    
    // For development fallback only, not for production
    if (process.env.NODE_ENV !== 'production') {
      console.warn('Using fallback URL due to OORT API error');
      return `https://s3-standard.oortech.com/${fullPath}`;
    }
    
    throw error;
  }
};

/**
 * Reset to default credentials
 */
export const resetToDefaultCredentials = (): void => {
  localStorage.removeItem('oort_credentials');
};
