
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
 * Mock function for uploading to OORT Storage
 * In a real implementation, this would use the OORT Storage SDK/API
 */
export const uploadToOortStorage = async (
  file: File, 
  path: string = 'uploads/'
): Promise<string> => {
  const credentials = getOortCredentials();
  
  // This is a mock implementation. In production, you would use:
  // - OORT Storage SDK if available
  // - Or REST API calls to the OORT Storage service
  
  console.log(`Uploading to OORT Storage using credentials: ${credentials.accessKey.substring(0, 3)}...`);
  console.log(`File: ${file.name}, Size: ${file.size} bytes, Path: ${path}`);
  
  // Simulate upload delay
  await new Promise(resolve => setTimeout(resolve, 1000));
  
  // In a real implementation, this would be the URL returned by the OORT Storage service
  const mockedUrl = `https://oort-storage.example.com/${path}${Date.now()}-${file.name}`;
  
  return mockedUrl;
};

/**
 * Reset to default credentials
 */
export const resetToDefaultCredentials = (): void => {
  localStorage.removeItem('oort_credentials');
};
