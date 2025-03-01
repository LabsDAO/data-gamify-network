
import { useEffect } from 'react';
import { toast } from '@/components/ui/use-toast';
import { 
  getOortCredentials,
  setUseRealOortStorage,
  isUsingRealOortStorage 
} from '@/utils/oortStorage';
import { UseOortStorageOptions } from './types';

/**
 * Hook for managing OORT storage mode (real vs simulated)
 */
export function useOortStorageMode(options: UseOortStorageOptions = {}) {
  // Always enable real storage if forced, even on mount
  useEffect(() => {
    if (options.forceReal) {
      setUseRealOortStorage(true);
      console.log("OORT Storage: Forcing real storage mode");
    } else {
      // Enable real storage by default for consistency with AWS
      setUseRealOortStorage(true);
      console.log("OORT Storage: Using real storage mode by default");
    }
    
    // If a path is provided, log it for debugging
    if (options.path) {
      console.log(`OORT Storage initialized with path: ${options.path}`);
    }
  }, [options.forceReal, options.path]);

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
    isUsingDefaultCredentials,
    isUsingRealStorage,
    toggleStorageMode
  };
}
