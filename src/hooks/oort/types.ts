
/**
 * OORT Storage Hook Types
 */

export interface UseOortStorageOptions {
  onSuccess?: (url: string) => void;
  onError?: (error: Error) => void;
  onProgress?: (progress: number) => void;
  path?: string;
  forceReal?: boolean;
  trackUploads?: boolean; // Whether to track uploads in Supabase
}
