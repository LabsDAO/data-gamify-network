import { useOortStorage } from './oort/use-oort-storage';
import { useAuth } from './useAuth';
import { trackFileUpload } from '@/utils/userPointsTracker';
import { UploadResult } from '@/utils/oortStorage';

/**
 * Custom hook that combines OORT storage with Supabase tracking
 * This hook automatically tracks uploads and awards points to the user
 */
export function useOortStorageWithTracking(options: {
  path?: string;
  onSuccess?: (url: string) => void;
  onError?: (error: Error) => void;
  onProgress?: (progress: number) => void;
} = {}) {
  const { user, addPoints } = useAuth();
  
  // Initialize OORT Storage hook
  const oortStorage = useOortStorage({
    ...options,
    trackUploads: true,
  });
  
  // Wrap the uploadFile function to add tracking
  const uploadFileWithTracking = async (file: File): Promise<UploadResult | null> => {
    // Call the original uploadFile function
    const result = await oortStorage.uploadFile(file);
    
    // If upload was successful and we have a user, track it in Supabase
    if (result?.success && result.url && user) {
      try {
        // Track the upload in Supabase and award points
        await trackFileUpload(
          user.id,
          file.name,
          file.size,
          file.type || 'application/octet-stream',
          'OORT',
          result.url,
          addPoints
        );
      } catch (error) {
        console.error('Error tracking upload:', error);
        // Continue even if tracking fails
      }
    }
    
    return result;
  };
  
  return {
    ...oortStorage,
    uploadFile: uploadFileWithTracking,
  };
}