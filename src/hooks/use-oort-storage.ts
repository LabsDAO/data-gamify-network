
import { useState, useEffect } from 'react';
import { toast } from '@/components/ui/use-toast';
import { 
  uploadToOortStorage, 
  validateFile, 
  getOortCredentials,
  setUseRealOortStorage,
  isUsingRealOortStorage 
} from '@/utils/oortStorage';

interface UseOortStorageOptions {
  onSuccess?: (url: string) => void;
  onError?: (error: Error) => void;
  onProgress?: (progress: number) => void;
  path?: string;
  forceReal?: boolean; // New option to force real storage
}

export function useOortStorage(options: UseOortStorageOptions = {}) {
  const [isUploading, setIsUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState<Error | null>(null);
  const [uploadUrl, setUploadUrl] = useState<string | null>(null);

  // Always enable real storage if forced, even on mount
  useEffect(() => {
    if (options.forceReal) {
      setUseRealOortStorage(true);
      console.log("OORT Storage: Forcing real storage mode");
    }
    
    // If a path is provided, log it for debugging
    if (options.path) {
      console.log(`OORT Storage initialized with path: ${options.path}`);
    }
  }, [options.forceReal, options.path]);

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
      
      // Enable real storage if the option is set
      if (options.forceReal) {
        setUseRealOortStorage(true);
      }

      // Log the upload path for debugging
      const uploadPath = options.path || 'uploads/';
      console.log(`Starting upload to OORT with path: ${uploadPath}`);

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

  // Get credential status
  const credentials = getOortCredentials();
  const isUsingDefaultCredentials = credentials.accessKey === "3IRFO1K3VC23DVSE81IO";
  
  // Get storage mode (real or simulated)
  const isUsingRealStorage = isUsingRealOortStorage();
  
  // Toggle between real and simulated storage
  const toggleStorageMode = () => {
    const newMode = !isUsingRealStorage;
    setUseRealOortStorage(newMode);
    
    toast({
      title: newMode ? "Using Real OORT Storage" : "Using Simulated Storage",
      description: newMode 
        ? "Files will be uploaded to actual OORT Cloud storage." 
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
    isUsingDefaultCredentials,
    isUsingRealStorage,
    toggleStorageMode,
    validateFile: (file: File) => validateFile(file), // Expose validation function
  };
}
