
import { useState } from 'react';
import { toast } from '@/hooks/use-toast';
import { 
  getAwsCredentials,
  testAwsConnectivity,
  listAwsBuckets,
  checkBucketExists,
  saveAwsCredentials
} from '@/utils/awsStorage';
import { ConnectionStatus, ConnectivityTestResult } from './types';

/**
 * Hook for managing AWS S3 connection status and testing
 */
export function useAwsConnection() {
  const [isTestingConnection, setIsTestingConnection] = useState(false);
  const [availableBuckets, setAvailableBuckets] = useState<string[]>([]);
  const [connectionStatus, setConnectionStatus] = useState<ConnectionStatus>({
    tested: false,
    isValid: false,
    details: null,
    message: ''
  });

  // Fetch available buckets
  const fetchAvailableBuckets = async () => {
    try {
      console.log("Fetching available S3 buckets...");
      
      // Show loading toast for better UX
      toast({
        title: "Checking AWS Connection",
        description: "Fetching available S3 buckets...",
        variant: "default",
      });
      
      const buckets = await listAwsBuckets();
      console.log("Fetched buckets:", buckets);
      setAvailableBuckets(buckets);
      
      if (buckets.length > 0) {
        toast({
          title: "AWS Connection Success",
          description: `Found ${buckets.length} available S3 buckets.`,
          variant: "success",
        });
      }
      
      return buckets;
    } catch (error) {
      console.error("Failed to fetch available buckets:", error);
      
      toast({
        title: "AWS Connection Issue",
        description: error instanceof Error ? error.message : "Failed to fetch buckets",
        variant: "destructive",
      });
      
      // Check if bucket exists in current credentials
      const credentials = getAwsCredentials();
      if (credentials.bucket) {
        try {
          const bucketExists = await checkBucketExists(credentials.bucket);
          if (bucketExists) {
            console.log(`Current bucket ${credentials.bucket} exists`);
            setAvailableBuckets([credentials.bucket]);
            return [credentials.bucket];
          }
        } catch (bucketError) {
          console.error("Error checking current bucket:", bucketError);
        }
      }
      
      // Still return an empty array so calling code can continue
      setAvailableBuckets([]);
      return [];
    }
  };

  // Test AWS S3 connectivity with real testing, not simulations
  const testConnection = async (): Promise<ConnectivityTestResult> => {
    setIsTestingConnection(true);
    setConnectionStatus({
      tested: false,
      isValid: false,
      details: null,
      message: 'Testing AWS S3 connectivity...'
    });
    
    try {
      console.log("Starting AWS S3 connectivity test");
      
      // Show toast for better UX
      toast({
        title: "Testing AWS Connection",
        description: "Please wait while we verify your AWS S3 credentials...",
        variant: "default",
      });
      
      // Get the current credentials
      const credentials = getAwsCredentials();
      
      // Run the actual test
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
      
      // Show toast for better UX
      toast({
        title: "Updating AWS Credentials",
        description: "Saving your AWS S3 credentials...",
        variant: "default",
      });
      
      // Save the new credentials
      const updatedCreds = {
        ...getAwsCredentials(),
        ...newCredentials
      };
      
      // Save credentials to localStorage
      saveAwsCredentials(updatedCreds);
      
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
    isTestingConnection,
    connectionStatus,
    availableBuckets,
    fetchAvailableBuckets,
    testConnection,
    updateCredentials
  };
}
