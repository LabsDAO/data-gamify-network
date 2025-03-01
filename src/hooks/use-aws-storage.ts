
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
    
    // Simulate initial progress for better UX
    setProgress(5);
    if (options.onProgress) {
      options.onProgress(5);
    }
    
    try {
      // Simulate progress updates during the upload for better UX
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
      
      // Enable real storage if the option is set
      if (options.forceReal) {
        setUseRealAwsStorage(true);
      }

      // Perform the actual upload
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
      
      // Enhanced error toast with more information
      const errorMessage = error.message || 'Upload failed. Please try again.';
      
      toast({
        title: "Upload failed",
        description: errorMessage,
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
    hasValidCredentials: true, // Always true now with default credentials
    isUsingCustomCredentials,
    isUsingRealStorage: true, // Always using real storage now
    toggleStorageMode, // Keep this for compatibility
    validateFile: (file: File) => validateFile(file),
  };
}
