
import { UseOortStorageOptions } from './types';
import { useOortUpload } from './use-oort-upload';
import { useOortStorageMode } from './use-oort-storage-mode';
import { validateFile, UploadResult } from '@/utils/oortStorage';

/**
 * Main OORT Storage hook that combines upload and mode functionality
 */
export function useOortStorage(options: UseOortStorageOptions = {}) {
  const upload = useOortUpload(options);
  const storageMode = useOortStorageMode(options);

  return {
    // Upload functionality
    uploadFile: upload.uploadFile,
    isUploading: upload.isUploading,
    progress: upload.progress,
    error: upload.error,
    uploadUrl: upload.uploadUrl,
    validateFile: (file: File) => validateFile(file),
    
    // Storage mode functionality
    isUsingDefaultCredentials: storageMode.isUsingDefaultCredentials,
    isUsingRealStorage: storageMode.isUsingRealStorage,
    toggleStorageMode: storageMode.toggleStorageMode
  };
}
