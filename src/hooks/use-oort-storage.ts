
import { useState } from 'react';
import { toast } from '@/components/ui/use-toast';
import { uploadToOortStorage, getOortCredentials } from '@/utils/oortStorage';

interface UseOortStorageOptions {
  onSuccess?: (url: string) => void;
  onError?: (error: Error) => void;
  path?: string;
}

export function useOortStorage(options: UseOortStorageOptions = {}) {
  const [isUploading, setIsUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState<Error | null>(null);
  const [uploadUrl, setUploadUrl] = useState<string | null>(null);

  const uploadFile = async (file: File) => {
    if (!file) return;
    
    setIsUploading(true);
    setProgress(0);
    setError(null);
    setUploadUrl(null);
    
    try {
      // Start progress simulation
      const progressInterval = setInterval(() => {
        setProgress((prev) => {
          const newProgress = prev + Math.random() * 10;
          return newProgress > 90 ? 90 : newProgress;
        });
      }, 300);
      
      // Get credentials and upload
      const url = await uploadToOortStorage(file, options.path);
      
      // Complete progress
      clearInterval(progressInterval);
      setProgress(100);
      setUploadUrl(url);
      
      // Call success callback
      if (options.onSuccess) {
        options.onSuccess(url);
      }
      
      toast({
        title: "Upload successful",
        description: `File uploaded to OORT Storage: ${file.name}`,
      });
      
      return url;
    } catch (err) {
      const error = err instanceof Error ? err : new Error('Unknown error during upload');
      setError(error);
      
      // Call error callback
      if (options.onError) {
        options.onError(error);
      }
      
      toast({
        title: "Upload failed",
        description: error.message,
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
  };
}
