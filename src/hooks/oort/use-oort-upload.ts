
import { useState } from 'react';
import { toast } from '@/components/ui/use-toast';
import {
  uploadToOortStorage,
  validateFile,
  getOortCredentials,
  UploadResult
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

  const uploadFile = async (
    file: File,
    userId?: string,
    addPointsCallback?: (points: number) => void
  ): Promise<UploadResult | null> => {
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
      
      return {
        success: false,
        error: noFileError.message
      };
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
      
      return {
        success: false,
        error: validation.error || 'File validation failed'
      };
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
      const uploadPath = options.path || 'Flat-tires/';
      console.log(`Starting upload to OORT with path: ${uploadPath}`);
      
      toast({
        title: "Starting OORT Upload",
        description: `Uploading ${file.name} to OORT labsmarket bucket...`,
        variant: "default",
      });

      // Perform the actual upload
      const result = await uploadToOortStorage(file, uploadPath, userId, addPointsCallback);
      
      // Clear the progress interval
      clearInterval(progressInterval);
      
      // Set progress to 100% regardless of success/failure
      setProgress(100);
      if (options.onProgress) {
        options.onProgress(100);
      }
      
      if (result.success) {
        // Log the successful upload URL
        console.log(`OORT upload successful to ${result.url}`);
        
        // Store the URL
        if (result.url) {
          setUploadUrl(result.url);
          
          if (options.onSuccess) {
            options.onSuccess(result.url);
          }
        }
        
        // Show appropriate toast based on verification status
        if (result.verified) {
          toast({
            title: "Upload successful",
            description: `File uploaded to OORT Storage and verified: ${file.name}`,
            variant: "success",
          });
        } else {
          toast({
            title: "Upload completed",
            description: `File uploaded to OORT Storage but verification failed. The file may not be immediately accessible: ${file.name}`,
            variant: "default",
          });
        }
        
        return result;
      } else {
        // Handle upload failure
        const errorMessage = result.error || 'Unknown error during upload';
        const error = new Error(errorMessage);
        setError(error);
        
        if (options.onError) {
          options.onError(error);
        }
        
        toast({
          title: "Upload failed",
          description: `Error: ${errorMessage}${result.statusCode ? ` (Status: ${result.statusCode})` : ''}`,
          variant: "destructive",
        });
        
        console.error("OORT Storage upload error:", errorMessage);
        return result;
      }
    } catch (err) {
      // This should only happen for unexpected errors, as the uploadToOortStorage function
      // now handles errors internally and returns them as part of the UploadResult
      const error = err instanceof Error ? err : new Error('Unexpected error during upload process');
      setError(error);
      
      if (options.onError) {
        options.onError(error);
      }
      
      toast({
        title: "Upload process failed",
        description: `An unexpected error occurred: ${error.message}`,
        variant: "destructive",
      });
      
      console.error("Unexpected OORT Storage upload error:", error);
      return {
        success: false,
        error: error.message,
      };
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
