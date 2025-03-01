import { supabase, isSupabaseConfigured } from './supabaseClient';
import { toast } from '@/components/ui/use-toast';

// Define types for upload tracking
export interface UploadRecord {
  user_id: string;
  file_name: string;
  file_size: number;
  file_type: string;
  storage_provider: 'OORT' | 'AWS';
  upload_url: string;
  points_awarded: number;
  created_at?: string;
}

// Points configuration
const POINTS_CONFIG = {
  BASE_POINTS: 1,            // Base points for any upload
  IMAGE_POINTS: 1,           // Points for image uploads
  SIZE_MULTIPLIER: 0.05,     // Points per MB
  BONUS_THRESHOLD: 10,       // MB threshold for bonus points
  BONUS_POINTS: 2,           // Bonus points for large files
  DATA_FILE_BONUS: 3,        // Bonus for data files (CSV, JSON, Excel)
  MAX_POINTS_PER_UPLOAD: 20  // Cap on points per upload
};

/**
 * Calculate points for an upload based on file size and type
 * @param fileSize File size in bytes
 * @param fileType MIME type of the file
 * @returns Number of points to award
 */
export const calculateUploadPoints = (fileSize: number, fileType: string): number => {
  // Convert bytes to MB for calculation
  const fileSizeMB = fileSize / (1024 * 1024);
  
  // Start with base points
  let points = POINTS_CONFIG.BASE_POINTS;
  
  // Add points for image uploads
  if (fileType.includes('image/')) {
    points += POINTS_CONFIG.IMAGE_POINTS;
  }
  
  // Add points based on file size
  points += Math.floor(fileSizeMB * POINTS_CONFIG.SIZE_MULTIPLIER);
  
  // Add bonus for large files
  if (fileSizeMB > POINTS_CONFIG.BONUS_THRESHOLD) {
    points += POINTS_CONFIG.BONUS_POINTS;
  }
  
  // Add bonus for specific file types (e.g., more points for data files)
  if (fileType.includes('csv') || fileType.includes('json') || fileType.includes('excel')) {
    points += POINTS_CONFIG.DATA_FILE_BONUS;
  }
  
  // Cap points at maximum
  return Math.min(points, POINTS_CONFIG.MAX_POINTS_PER_UPLOAD);
};

/**
 * Track a file upload in Supabase and award points to the user
 * @param userId User ID
 * @param fileName File name
 * @param fileSize File size in bytes
 * @param fileType MIME type of the file
 * @param storageProvider Storage provider ('OORT' or 'AWS')
 * @param uploadUrl URL of the uploaded file
 * @param addPointsCallback Callback function to add points to the user
 * @returns Promise resolving to the created record or null if failed
 */
export const trackFileUpload = async (
  userId: string,
  fileName: string,
  fileSize: number,
  fileType: string,
  storageProvider: 'OORT' | 'AWS',
  uploadUrl: string,
  addPointsCallback?: (points: number) => void
): Promise<UploadRecord | null> => {
  // Calculate points for this upload
  const pointsAwarded = calculateUploadPoints(fileSize, fileType);
  
  // Create upload record
  const uploadRecord: UploadRecord = {
    user_id: userId,
    file_name: fileName,
    file_size: fileSize,
    file_type: fileType,
    storage_provider: storageProvider,
    upload_url: uploadUrl,
    points_awarded: pointsAwarded
  };
  
  // If Supabase is configured, store the record
  if (isSupabaseConfigured()) {
    try {
      const { data, error } = await supabase
        .from('uploads')
        .insert(uploadRecord)
        .select()
        .single();
      
      if (error) {
        console.error('Error tracking upload in Supabase:', error);
        toast({
          title: "Upload tracking failed",
          description: "Your upload was successful, but we couldn't track it in our database.",
          variant: "destructive",
        });
        return null;
      }
      
      console.log('Upload tracked successfully:', data);
      
      // Award points to user if callback is provided
      if (addPointsCallback) {
        addPointsCallback(pointsAwarded);
        
        // Show a toast notification with the points earned
        toast({
          title: "Points Earned!",
          description: `You earned ${pointsAwarded} points for uploading ${fileName}`,
          variant: "success",
        });
      }
      
      return data as UploadRecord;
    } catch (error) {
      console.error('Unexpected error tracking upload:', error);
      return null;
    }
  } else {
    console.warn('Supabase not configured, skipping upload tracking');
    
    // Still award points even if Supabase is not configured
    if (addPointsCallback) {
      addPointsCallback(pointsAwarded);
      
      toast({
        title: "Points Earned!",
        description: `You earned ${pointsAwarded} points for uploading ${fileName}`,
        variant: "success",
      });
    }
    
    return uploadRecord;
  }
};

/**
 * Get user upload history from Supabase
 * @param userId User ID
 * @returns Promise resolving to array of upload records
 */
export const getUserUploadHistory = async (userId: string): Promise<UploadRecord[]> => {
  if (!isSupabaseConfigured()) {
    console.warn('Supabase not configured, cannot fetch upload history');
    return [];
  }
  
  try {
    const { data, error } = await supabase
      .from('uploads')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });
    
    if (error) {
      console.error('Error fetching user upload history:', error);
      return [];
    }
    
    return data as UploadRecord[];
  } catch (error) {
    console.error('Unexpected error fetching upload history:', error);
    return [];
  }
};

/**
 * Get total points earned by a user from uploads
 * @param userId User ID
 * @returns Promise resolving to total points
 */
export const getUserTotalPoints = async (userId: string): Promise<number> => {
  if (!isSupabaseConfigured()) {
    console.warn('Supabase not configured, cannot fetch total points');
    return 0;
  }
  
  try {
    const { data, error } = await supabase
      .from('uploads')
      .select('points_awarded')
      .eq('user_id', userId);
    
    if (error) {
      console.error('Error fetching user total points:', error);
      return 0;
    }
    
    // Sum up all points
    return data.reduce((total, record) => total + (record.points_awarded || 0), 0);
  } catch (error) {
    console.error('Unexpected error fetching total points:', error);
    return 0;
  }
};