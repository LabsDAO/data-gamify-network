import { useAwsStorage } from './aws/use-aws-storage';
import { useAuth } from './useAuth';
import { trackFileUpload } from '@/utils/userPointsTracker';

/**
 * Custom hook that combines AWS S3 storage with Supabase tracking
 * This hook automatically tracks uploads and awards points to the user
 */
export function useAwsStorageWithTracking(options: {
  path?: string;
  onSuccess?: (url: string) => void;
  onError?: (error: Error) => void;
  onProgress?: (progress: number) => void;
} = {}) {
  const { user, addPoints } = useAuth();
  
  // Initialize AWS Storage hook
  const awsStorage = useAwsStorage({
    ...options
  });
  
  // Wrap the uploadFile function to add tracking
  const uploadFileWithTracking = async (file: File) => {
    try {
      // Call the original uploadFile function
      const url = await awsStorage.uploadFile(file);
      
      // If upload was successful and we have a user, track it in Supabase
      if (url && user) {
        try {
          // Track the upload in Supabase and award points
          await trackFileUpload(
            user.id,
            file.name,
            file.size,
            file.type || 'application/octet-stream',
            'AWS',
            url,
            addPoints
          );
        } catch (error) {
          console.error('Error tracking upload:', error);
          // Continue even if tracking fails
        }
      }
      
      return url;
    } catch (error) {
      // Re-throw the error to be handled by the caller
      throw error;
    }
  };
  
  return {
    ...awsStorage,
    uploadFile: uploadFileWithTracking,
  };
}