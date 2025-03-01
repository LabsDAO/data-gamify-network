
import { useState } from 'react';
import { toast } from '@/hooks/use-toast';
import { 
  uploadToAwsS3, 
  validateFile, 
  getAwsCredentials,
} from '@/utils/awsStorage';
import { UseAwsStorageOptions } from './types';

/**
 * Hook for handling AWS S3 file uploads
 */
export function useAwsUpload(options: UseAwsStorageOptions = {}) {
  const [isUploading, setIsUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState<Error | null>(null);
  const [uploadUrl, setUploadUrl] = useState<string | null>(null);

  // Upload file function
  const uploadFile = async (file: File) => {
    // Validate file exists
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
    console.log(`Preparing to upload file: ${file.name} (${file.size} bytes, type: ${file.type})`);
    
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
    
    // Validate AWS credentials
    const credentials = getAwsCredentials();
    if (!credentials.accessKeyId || !credentials.secretAccessKey || !credentials.bucket) {
      const credError = new Error('AWS S3 credentials not configured. Please set up your credentials first.');
      setError(credError);
      
      if (options.onError) {
        options.onError(credError);
      }
      
      toast({
        title: "AWS S3 not configured",
        description: credError.message,
        variant: "destructive",
      });
      
      return null;
    }
    
    // Prepare for upload
    setIsUploading(true);
    setProgress(0);
    setError(null);
    setUploadUrl(null);
    
    // Set initial progress
    setProgress(5);
    if (options.onProgress) {
      options.onProgress(5);
    }
    
    // Use a progress interval to simulate progress since AWS SDK doesn't provide progress events
    const progressInterval = setInterval(() => {
      setProgress(prev => {
        const newProgress = Math.min(prev + Math.random() * 5, 90);
        if (options.onProgress) {
          options.onProgress(newProgress);
        }
        return newProgress;
      });
    }, 300);
    
    try {
      // Log the upload path for debugging
      const uploadPath = options.path || 'uploads/';
      console.log(`Starting upload of ${file.name} to AWS S3 bucket ${credentials.bucket} with path: ${uploadPath}`);
      
      toast({
        title: "Starting AWS S3 Upload",
        description: `Uploading ${file.name} to ${credentials.bucket}...`,
        variant: "default",
      });
      
      // Perform the actual AWS S3 upload
      const url = await uploadToAwsS3(file, uploadPath);
      
      // Clear the progress interval
      clearInterval(progressInterval);
      
      // Log the successful upload URL
      console.log(`Upload successful to ${url}`);
      
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
        description: `File uploaded to AWS S3: ${file.name}`,
        variant: "success",
      });
      
      return url;
    } catch (err) {
      // Clear the progress interval
      clearInterval(progressInterval);
      
      const error = err instanceof Error ? err : new Error('Unknown error during upload');
      console.error("AWS S3 upload error:", error);
      
      setError(error);
      setProgress(0);
      
      if (options.onError) {
        options.onError(error);
      }
      
      const errorMessage = error.message || 'Upload failed. Please try again.';
      
      // Check for CORS errors in the message
      const corsError = errorMessage.includes('CORS') || 
                        errorMessage.includes('fetch') || 
                        errorMessage.includes('network');
      
      toast({
        title: "Upload failed",
        description: corsError 
          ? `${errorMessage} This may be due to CORS restrictions. Check your S3 bucket CORS settings.` 
          : errorMessage,
        variant: "destructive",
      });
      
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
