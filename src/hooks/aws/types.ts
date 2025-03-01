
/**
 * AWS Storage Hook Types
 */

export interface UseAwsStorageOptions {
  onSuccess?: (url: string) => void;
  onError?: (error: Error) => void;
  onProgress?: (progress: number) => void;
  path?: string;
  forceReal?: boolean;
}

export interface ConnectionStatus {
  tested: boolean;
  isValid: boolean;
  details: any;
  message: string;
}

export interface ConnectivityTestResult {
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
}
