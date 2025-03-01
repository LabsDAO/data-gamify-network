
import { useState, useEffect } from 'react';
import { toast } from '@/hooks/use-toast';
import { 
  getAwsCredentials,
  isUsingCustomAwsCredentials,
  setUseRealAwsStorage,
  isUsingRealAwsStorage
} from '@/utils/awsStorage';
import { UseAwsStorageOptions } from './types';

/**
 * Hook for managing AWS S3 storage mode (real vs simulated)
 */
export function useAwsStorageMode(options: UseAwsStorageOptions = {}) {
  // Always enable real storage by default
  useEffect(() => {
    // Either force real storage or use the default real storage setting
    if (options.forceReal) {
      setUseRealAwsStorage(true);
      console.log("AWS S3 Storage: Forcing real storage mode");
    } else {
      // Enable real storage by default anyway
      setUseRealAwsStorage(true);
      console.log("AWS S3 Storage: Using real storage mode by default");
    }
    
    // If a path is provided, log it for debugging
    if (options.path) {
      console.log(`AWS Storage initialized with path: ${options.path}`);
    }
  }, [options.forceReal, options.path]);

  // Get credential status
  const credentials = getAwsCredentials();
  const hasValidCredentials = Boolean(credentials.accessKeyId && credentials.secretAccessKey && credentials.bucket); 
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
    hasValidCredentials,
    isUsingCustomCredentials,
    isUsingRealStorage,
    toggleStorageMode
  };
}
