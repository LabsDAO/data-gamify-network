
import { useState } from 'react';
import { toast } from '@/components/ui/use-toast';
import { uploadToOortStorage, validateFile, getOortCredentials } from '@/utils/oortStorage';

interface UseOortStorageOptions {
  onSuccess?: (url: string) => void;
  onError?: (error: Error) => void;
  onProgress?: (progress: number) => void;
  path?: string;
}

export function useOortStorage(options: UseOortStorageOptions = {}) {
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
      
      return;
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
      
      return;
    }
    
    setIsUploading(true);
    setProgress(0);
    setError(null);
    setUploadUrl(null);
    
    try {
      // For actual API implementation, we'd use XMLHttpRequest for progress tracking
      // instead of fetch, as fetch doesn't provide upload progress events
      const xhr = new XMLHttpRequest();
      
      xhr.upload.addEventListener('progress', (event) => {
        if (event.lengthComputable) {
          const percentage = Math.round((event.loaded / event.total) * 100);
          setProgress(percentage);
          if (options.onProgress) {
            options.onProgress(percentage);
          }
        }
      });
      
      // Create a promise to handle the XHR response
      const uploadPromise = new Promise<string>((resolve, reject) => {
        xhr.onreadystatechange = () => {
          if (xhr.readyState === 4) {
            if (xhr.status >= 200 && xhr.status < 300) {
              try {
                const response = JSON.parse(xhr.responseText);
                resolve(response.url);
              } catch (e) {
                // If the response isn't JSON or doesn't have a URL, fall back to direct upload method
                resolve(uploadToOortStorage(file, options.path));
              }
            } else {
              // Enhanced error information
              const errorMsg = `Upload failed with status ${xhr.status}${xhr.responseText ? ': ' + xhr.responseText : ''}`;
              reject(new Error(errorMsg));
            }
          }
        };
        
        // Add timeout handler
        xhr.ontimeout = () => {
          reject(new Error('Upload timed out. Please check your network connection and try again.'));
        };
        
        // Add network error handler
        xhr.onerror = () => {
          reject(new Error('Network error occurred during upload. Please check your connection and try again.'));
        };
      });
      
      // If XHR is not supported or fails, fall back to the direct upload method
      const url = await uploadPromise.catch(() => uploadToOortStorage(file, options.path));
      
      setProgress(100);
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
    } finally {
      setIsUploading(false);
    }
  };

  // Get credential status
  const credentials = getOortCredentials();
  const isUsingDefaultCredentials = credentials.accessKey === "1YAWCOB9IEL5O5K13F5P";

  return {
    uploadFile,
    isUploading,
    progress,
    error,
    uploadUrl,
    isUsingDefaultCredentials,
    validateFile: (file: File) => validateFile(file), // Expose validation function
  };
}
