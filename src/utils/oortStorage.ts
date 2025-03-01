
// OORT Storage integration utility

type StorageCredentials = {
  accessKey: string;
  secretKey: string;
  endpoint?: string;
};

// Get credentials from environment variables if available
const getEnvCredentials = (): Partial<StorageCredentials> => {
  const credentials: Partial<StorageCredentials> = {};
  
  if (import.meta.env.VITE_OORT_ACCESS_KEY) {
    credentials.accessKey = import.meta.env.VITE_OORT_ACCESS_KEY;
  }
  
  if (import.meta.env.VITE_OORT_SECRET_KEY) {
    credentials.secretKey = import.meta.env.VITE_OORT_SECRET_KEY;
  }
  
  if (import.meta.env.VITE_OORT_ENDPOINT) {
    credentials.endpoint = import.meta.env.VITE_OORT_ENDPOINT;
  }
  
  return credentials;
};

// Default credentials (fallback if environment variables are not set)
const DEFAULT_CREDENTIALS: StorageCredentials = {
  accessKey: "3IRFO1K3VC23DVSE81IO",
  secretKey: "qlPAgrnHGujYJzqgRrRE5bsLb40Flk8B9BTRdng8",
  endpoint: "https://s3-standard.oortech.com",
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
  // Plain text (for testing)
  'text/plain',
];

// OORT Storage config
const OORT_BUCKET = 'labsmarket'; // Set the target bucket to labsmarket

// Get the OORT endpoint from credentials or environment variable
const getOortEndpoint = (): string => {
  const credentials = getOortCredentials();
  return credentials.endpoint || 'https://s3-standard.oortech.com';
};

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
export const getOortCredentials = (): StorageCredentials => {
  // Check if we're in a browser environment with localStorage
  const isBrowser = typeof window !== 'undefined' && typeof localStorage !== 'undefined';
  
  // First try to get from localStorage (only in browser)
  if (isBrowser) {
    const storedCredentials = localStorage.getItem('oort_credentials');
    if (storedCredentials) {
      try {
        return JSON.parse(storedCredentials);
      } catch (e) {
        console.error("Failed to parse stored OORT credentials", e);
      }
    }
  }
  
  // Then try to get from environment variables
  const envCredentials = getEnvCredentials();
  
  // If we have all required credentials from environment variables, use them
  if (envCredentials.accessKey && envCredentials.secretKey) {
    return envCredentials as StorageCredentials;
  }
  
  // Otherwise, use default credentials
  return DEFAULT_CREDENTIALS;
};

/**
 * Save OORT Storage credentials to localStorage
 */
export const saveOortCredentials = (credentials: StorageCredentials): void => {
  // Check if we're in a browser environment with localStorage
  const isBrowser = typeof window !== 'undefined' && typeof localStorage !== 'undefined';
  
  if (isBrowser) {
    localStorage.setItem('oort_credentials', JSON.stringify(credentials));
  } else {
    console.warn('Cannot save OORT credentials: localStorage is not available in this environment');
  }
};

/**
 * Check if custom credentials are being used
 */
export const isUsingCustomCredentials = (): boolean => {
  // Check if we're in a browser environment with localStorage
  const isBrowser = typeof window !== 'undefined' && typeof localStorage !== 'undefined';
  
  // Check if credentials are stored in localStorage (only in browser)
  let hasStoredCredentials = false;
  if (isBrowser) {
    hasStoredCredentials = localStorage.getItem('oort_credentials') !== null;
    
    if (hasStoredCredentials) {
      return true;
    }
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
 * Upload a file to OORT Storage
 * This implementation uses AWS v4 signature authentication as required by OORT Storage
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
  // Import the AWS v4 signature implementation
  const { uploadToOortStorage: uploadWithAwsAuth } = await import('./oortStorageWithAwsAuth');
  
  // Use the AWS v4 signature implementation
  return uploadWithAwsAuth(file, path, userId, addPointsCallback);
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
