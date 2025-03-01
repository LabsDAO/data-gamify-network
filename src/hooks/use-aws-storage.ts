
import { useState, useEffect } from 'react';
import { toast } from '@/hooks/use-toast';
import { 
  uploadToAwsS3, 
  validateFile, 
  getAwsCredentials,
  setUseRealAwsStorage,
  isUsingRealAwsStorage,
  isUsingCustomAwsCredentials,
  testAwsConnectivity,
  listAwsBuckets,
  saveAwsCredentials,
  checkBucketExists
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
  const [isTestingConnection, setIsTestingConnection] = useState(false);
  const [availableBuckets, setAvailableBuckets] = useState<string[]>([]);
  const [connectionStatus, setConnectionStatus] = useState<{
    tested: boolean;
    isValid: boolean;
    details: any;
    message: string;
  }>({
    tested: false,
    isValid: false,
    details: null,
    message: ''
  });

  // Always enable real storage if forced, even on mount
  useEffect(() => {
    if (options.forceReal) {
      setUseRealAwsStorage(true);
      console.log("AWS S3 Storage: Forcing real storage mode");
    } else {
      // Enable real storage by default
      setUseRealAwsStorage(true);
      console.log("AWS S3 Storage: Using real storage mode by default");
    }
    
    // If a path is provided, log it for debugging
    if (options.path) {
      console.log(`AWS Storage initialized with path: ${options.path}`);
    }
  }, [options.forceReal, options.path]);

  // Fetch available buckets
  const fetchAvailableBuckets = async () => {
    try {
      console.log("Fetching available S3 buckets...");
      
      const buckets = await listAwsBuckets();
      console.log("Fetched buckets:", buckets);
      setAvailableBuckets(buckets);
      return buckets;
    } catch (error) {
      console.error("Failed to fetch available buckets:", error);
      
      // Check if bucket exists in current credentials
      const credentials = getAwsCredentials();
      if (credentials.bucket) {
        const bucketExists = await checkBucketExists(credentials.bucket);
        if (bucketExists) {
          console.log(`Current bucket ${credentials.bucket} exists`);
          setAvailableBuckets([credentials.bucket]);
          return [credentials.bucket];
        }
      }
      
      // Still return an empty array so calling code can continue
      setAvailableBuckets([]);
      return [];
    }
  };

  // Test AWS S3 connectivity with real testing, not simulations
  const testConnection = async () => {
    setIsTestingConnection(true);
    setConnectionStatus({
      tested: false,
      isValid: false,
      details: null,
      message: 'Testing AWS S3 connectivity...'
    });
    
    try {
      console.log("Starting AWS S3 connectivity test");
      
      // Get the current credentials
      const credentials = getAwsCredentials();
      
      // For any credentials, run the actual test
      const result = await testAwsConnectivity();
      console.log("AWS S3 connectivity test result:", result);
      
      // Update available buckets from test result
      if (result.details.availableBuckets && result.details.availableBuckets.length > 0) {
        setAvailableBuckets(result.details.availableBuckets);
      } else {
        // If not included in result, try to fetch separately
        try {
          await fetchAvailableBuckets();
        } catch (e) {
          console.warn("Could not fetch buckets separately, continuing with connectivity test result", e);
        }
      }
      
      setConnectionStatus({
        tested: true,
        isValid: result.success,
        details: result.details,
        message: result.message
      });
      
      // Provide appropriate user feedback
      toast({
        title: result.success ? "AWS S3 Connection Successful" : "AWS S3 Connection Issues",
        description: result.message,
        variant: result.success ? "success" : "destructive",
      });
      
      return result;
    } catch (err) {
      const error = err instanceof Error ? err : new Error('Unknown error testing AWS connection');
      console.error("AWS connection test error:", error);
      
      setConnectionStatus({
        tested: true,
        isValid: false,
        details: {
          credentialsValid: false,
          bucketAccessible: false,
          writePermission: false,
          errorDetails: error.message
        },
        message: error.message
      });
      
      toast({
        title: "AWS S3 Connection Test Failed",
        description: error.message,
        variant: "destructive",
      });
      
      return {
        success: false,
        message: error.message,
        details: {
          credentialsValid: false,
          bucketAccessible: false,
          writePermission: false,
          errorDetails: error.message
        }
      };
    } finally {
      setIsTestingConnection(false);
    }
  };

  // Upload file function
  const uploadFile = async (file: File) => {
    // Validate file exists
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
    console.log(`Preparing to upload file: ${file.name} (${file.size} bytes, type: ${file.type})`);
    
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
    
    // Prepare for upload
    setIsUploading(true);
    setProgress(0);
    setError(null);
    setUploadUrl(null);
    
    // Set initial progress
    setProgress(5);
    if (options.onProgress) {
      options.onProgress(5);
    }
    
    // Use a progress interval to simulate progress since AWS SDK doesn't provide progress events
    const progressInterval = setInterval(() => {
      setProgress(prev => {
        const newProgress = Math.min(prev + Math.random() * 5, 90);
        if (options.onProgress) {
          options.onProgress(newProgress);
        }
        return newProgress;
      });
    }, 300);
    
    try {
      // Log the upload path for debugging
      const uploadPath = options.path || 'uploads/';
      console.log(`Starting upload of ${file.name} to AWS S3 bucket ${credentials.bucket} with path: ${uploadPath}`);
      
      // Perform the actual AWS S3 upload
      const url = await uploadToAwsS3(file, uploadPath);
      
      // Clear the progress interval
      clearInterval(progressInterval);
      
      // Log the successful upload URL
      console.log(`Upload successful to ${url}`);
      
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
      // Clear the progress interval
      clearInterval(progressInterval);
      
      const error = err instanceof Error ? err : new Error('Unknown error during upload');
      console.error("AWS S3 upload error:", error);
      
      setError(error);
      setProgress(0);
      
      if (options.onError) {
        options.onError(error);
      }
      
      toast({
        title: "Upload failed",
        description: error.message || 'Upload failed. Please try again.',
        variant: "destructive",
      });
      
      return null;
    } finally {
      setIsUploading(false);
    }
  };

  // Get credential status
  const credentials = getAwsCredentials();
  const hasValidCredentials = Boolean(getAwsCredentials().accessKeyId && getAwsCredentials().secretAccessKey); 
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

  // Update credentials function
  const updateCredentials = async (newCredentials: {
    accessKeyId: string;
    secretAccessKey: string;
    region: string;
    bucket: string;
  }) => {
    try {
      console.log("Updating AWS credentials:", {
        accessKeyId: newCredentials.accessKeyId.substring(0, 5) + "...",
        region: newCredentials.region,
        bucket: newCredentials.bucket
      });
      
      // Save the new credentials
      const updatedCreds = {
        ...getAwsCredentials(),
        ...newCredentials
      };
      
      // Save credentials to localStorage
      saveAwsCredentials(updatedCreds);
      
      // Force a real storage mode
      setUseRealAwsStorage(true);
      
      return await testConnection();
    } catch (error) {
      console.error("Failed to update AWS credentials:", error);
      
      toast({
        title: "Failed to update credentials",
        description: error instanceof Error ? error.message : "Unknown error",
        variant: "destructive",
      });
      
      return {
        success: false,
        message: "Failed to update credentials",
        details: {
          credentialsValid: false,
          bucketAccessible: false,
          writePermission: false
        }
      };
    }
  };

  return {
    uploadFile,
    isUploading,
    progress,
    error,
    uploadUrl,
    hasValidCredentials,
    isUsingCustomCredentials,
    isUsingRealStorage,
    toggleStorageMode,
    validateFile: (file: File) => validateFile(file),
    testConnection,
    isTestingConnection,
    connectionStatus,
    availableBuckets,
    fetchAvailableBuckets,
    updateCredentials
  };
}
