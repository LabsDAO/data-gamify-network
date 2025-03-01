/**
 * Hook for AWS S3 uploads using pre-signed URLs
 * This approach helps bypass CORS issues
 */

import { useState } from 'react';
import { uploadWithPresignedUrl } from '@/utils/awsPresignedUpload';
import { UseAwsStorageOptions } from './types';

export function useAwsPresignedUpload(options: UseAwsStorageOptions = {}) {
  const [isUploading, setIsUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState<Error | null>(null);
  const [uploadUrl, setUploadUrl] = useState<string | null>(null);

  // Path for uploads
  const uploadPath = options.path || 'uploads/';

  // Progress callback
  const handleProgress = (progressEvent: number) => {
    setProgress(progressEvent);
    if (options.onProgress) {
      options.onProgress(progressEvent);
    }
  };

  // Upload file using pre-signed URL approach
  const uploadFile = async (file: File): Promise<string | null> => {
    setIsUploading(true);
    setProgress(0);
    setError(null);
    setUploadUrl(null);

    try {
      // Start progress indication
      handleProgress(10);

      console.log(`Starting AWS S3 pre-signed upload for ${file.name} to path ${uploadPath}`);
      
      // Upload using pre-signed URL
      const url = await uploadWithPresignedUrl(file, uploadPath);
      
      // Update progress
      handleProgress(100);
      
      // Set the uploaded URL
      setUploadUrl(url);
      console.log(`Upload successful: ${url}`);
      
      return url;
    } catch (err) {
      const uploadError = err instanceof Error ? err : new Error('Unknown upload error');
      console.error('AWS S3 pre-signed upload failed:', uploadError);
      setError(uploadError);
      return null;
    } finally {
      setIsUploading(false);
    }
  };

  return {
    uploadFile,
    isUploading,
    progress,
    error,
    uploadUrl
  };
}