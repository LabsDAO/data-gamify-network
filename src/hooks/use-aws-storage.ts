
import { useState, useEffect } from 'react';
import { toast } from '@/components/ui/use-toast';
import { 
  uploadToAwsS3, 
  validateFile, 
  getAwsCredentials,
  setUseRealAwsStorage,
  isUsingRealAwsStorage,
  isUsingCustomAwsCredentials
} from '@/utils/awsStorage';

interface UseAwsStorageOptions {
  onSuccess?: (url: string) => void;
  onError?: (error: Error) => void;
  onProgress?: (progress: number) => void;
  path?: string;
  forceReal?: boolean;
}

export function useAwsStorage(options: UseAwsStorageOptions = {}) {
  const [isUploading, setIsUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState<Error | null>(null);
  const [uploadUrl, setUploadUrl] = useState<string | null>(null);

  // Always enable real storage if forced, even on mount
  useEffect(() => {
    if (options.forceReal) {
      setUseRealAwsStorage(true);
      console.log("AWS S3 Storage: Forcing real storage mode");
    } else {
      // Enable real storage by default since we have valid credentials
      setUseRealAwsStorage(true);
      console.log("AWS S3 Storage: Using real storage mode by default");
    }
  }, [options.forceReal]);

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
    
    // Validate file before starting upload
    const validation = validateFile(file);
    if (!validation.valid) {
      const validationError = new Error(validation.error);
      setError(validationError);
      
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
    
    // Set initial progress
    setProgress(5);
    if (options.onProgress) {
      options.onProgress(5);
    }
    
    try {
      // Use a progress interval to update the UI during upload
      // Since AWS SDK v3 Upload doesn't provide progress events in browser
      const progressInterval = setInterval(() => {
        setProgress(prev => {
          const newProgress = Math.min(prev + Math.random() * 5, 90);
          if (options.onProgress) {
            options.onProgress(newProgress);
          }
          return newProgress;
        });
      }, 300);
      
      // Perform the actual AWS S3 upload
      const url = await uploadToAwsS3(file, options.path);
      
      // Clear the progress interval
      clearInterval(progressInterval);
      
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
      const error = err instanceof Error ? err : new Error('Unknown error during upload');
      setError(error);
      
      if (options.onError) {
        options.onError(error);
      }
      
      toast({
        title: "Upload failed",
        description: error.message || 'Upload failed. Please try again.',
        variant: "destructive",
      });
      
      console.error("AWS S3 upload error:", error);
      return null;
    } finally {
      setIsUploading(false);
    }
  };

  // Get credential status
  const credentials = getAwsCredentials();
  const hasValidCredentials = credentials.accessKeyId !== "" && credentials.secretAccessKey !== "";
  const isUsingCustomCredentials = isUsingCustomAwsCredentials();
  
  // Get storage mode (real or simulated)
  const isUsingRealStorage = isUsingRealAwsStorage();
  
  // Toggle between real and simulated storage
  const toggleStorageMode = () => {
    const newMode = !isUsingRealStorage;
    setUseRealAwsStorage(newMode);
    
    toast({
      title: newMode ? "Using Real AWS S3" : "Using Simulated AWS S3",
      description: newMode 
        ? "Files will be uploaded to actual AWS S3." 
        : "Files will be simulated for development purposes.",
      variant: "default",
    });
  };

  return {
    uploadFile,
    isUploading,
    progress,
    error,
    uploadUrl,
    hasValidCredentials, 
    isUsingCustomCredentials,
    isUsingRealStorage, 
    toggleStorageMode,
    validateFile: (file: File) => validateFile(file),
  };
}
