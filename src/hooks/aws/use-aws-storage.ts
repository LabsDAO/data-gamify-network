
import { UseAwsStorageOptions } from './types';
import { useAwsConnection } from './use-aws-connection';
import { useAwsUpload } from './use-aws-upload';
import { useAwsStorageMode } from './use-aws-storage-mode';
import { validateFile } from '@/utils/awsStorage';

/**
 * Main AWS S3 Storage hook that combines connection, upload, and mode functionality
 */
export function useAwsStorage(options: UseAwsStorageOptions = {}) {
  const connection = useAwsConnection();
  const upload = useAwsUpload(options);
  const storageMode = useAwsStorageMode(options);

  return {
    // Upload functionality
    uploadFile: upload.uploadFile,
    isUploading: upload.isUploading,
    progress: upload.progress,
    error: upload.error,
    uploadUrl: upload.uploadUrl,
    validateFile: (file: File) => validateFile(file),
    
    // Connection functionality
    testConnection: connection.testConnection,
    isTestingConnection: connection.isTestingConnection,
    connectionStatus: connection.connectionStatus,
    availableBuckets: connection.availableBuckets,
    fetchAvailableBuckets: connection.fetchAvailableBuckets,
    updateCredentials: connection.updateCredentials,
    
    // Storage mode functionality
    hasValidCredentials: storageMode.hasValidCredentials,
    isUsingCustomCredentials: storageMode.isUsingCustomCredentials,
    isUsingRealStorage: storageMode.isUsingRealStorage,
    toggleStorageMode: storageMode.toggleStorageMode
  };
}
