
import { useState } from 'react';
import { toast } from '@/components/ui/use-toast';
import { 
  uploadToOortStorage, 
  validateFile, 
  getOortCredentials
} from '@/utils/oortStorage';
import { UseOortStorageOptions } from './types';

/**
 * Hook for handling OORT file uploads
 */
export function useOortUpload(options: UseOortStorageOptions = {}) {
  const [isUploading, setIsUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState<Error | null>(null);
  const [uploadUrl, setUploadUrl] = useState<string | null>(null);

  const uploadFile = async (file: File) => {
    if (!file) {
      const noFileError = new Error('No file selected');
      setError(noFileError);
      
      if (options.onError) {
        options.onError(noFileError);
      }
      
      toast({
        title: "Upload failed",
        description: noFileError.message,
        variant: "destructive",
      });
      
      return null;
    }
    
    // Log file info for debugging
    console.log(`Preparing to upload to OORT: ${file.name} (${file.size} bytes, type: ${file.type})`);
    
    // Validate file before starting upload
    const validation = validateFile(file);
    if (!validation.valid) {
      const validationError = new Error(validation.error || 'File validation failed');
      setError(validationError);
      
      console.error(`File validation failed: ${validation.error}`);
      
      if (options.onError) {
        options.onError(validationError);
      }
      
      toast({
        title: "File validation failed",
        description: validation.error,
        variant: "destructive",
      });
      
      return null;
    }
    
    setIsUploading(true);
    setProgress(0);
    setError(null);
    setUploadUrl(null);
    
    // Simulate initial progress for better UX
    setProgress(5);
    if (options.onProgress) {
      options.onProgress(5);
    }
    
    try {
      // For actual upload we're using XMLHttpRequest for progress tracking in the uploadToOortStorage function
      // But here we'll simulate progress updates during the upload for better UX
      const progressInterval = setInterval(() => {
        setProgress(prev => {
          // Don't go above 90% until we get actual completion
          const newProgress = Math.min(prev + Math.random() * 10, 90);
          if (options.onProgress) {
            options.onProgress(newProgress);
          }
          return newProgress;
        });
      }, 500);

      // Log the upload path for debugging
      const uploadPath = options.path || 'uploads/';
      console.log(`Starting upload to OORT with path: ${uploadPath}`);
      
      toast({
        title: "Starting OORT Upload",
        description: `Uploading ${file.name} to OORT labsmarket bucket...`,
        variant: "default",
      });

      // Perform the actual upload
      const url = await uploadToOortStorage(file, uploadPath);
      
      // Clear the progress interval
      clearInterval(progressInterval);
      
      // Log the successful upload URL
      console.log(`OORT upload successful to ${url}`);
      
      // Set progress to 100% on success
      setProgress(100);
      if (options.onProgress) {
        options.onProgress(100);
      }
      
      setUploadUrl(url);
      
      if (options.onSuccess) {
        options.onSuccess(url);
      }
      
      toast({
        title: "Upload successful",
        description: `File uploaded to OORT Storage: ${file.name}`,
        variant: "success",
      });
      
      return url;
    } catch (err) {
      const error = err instanceof Error ? err : new Error('Unknown error during upload');
      setError(error);
      
      if (options.onError) {
        options.onError(error);
      }
      
      // Enhanced error toast with more information
      const errorMessage = error.message || 'Upload failed. Please try again.';
      
      toast({
        title: "Upload failed",
        description: errorMessage,
        variant: "destructive",
      });
      
      console.error("OORT Storage upload error:", error);
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
    uploadUrl,
    validateFile: (file: File) => validateFile(file),
  };
}
