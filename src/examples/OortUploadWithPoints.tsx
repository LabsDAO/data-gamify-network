import React, { useState } from 'react';
import { useOortStorageWithTracking } from '@/hooks/use-oort-storage-with-tracking';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { getUserUploadHistory, UploadRecord } from '@/utils/userPointsTracker';

/**
 * Example component that demonstrates OORT Storage uploads with Supabase integration
 * for tracking uploads and awarding points to users
 */
const OortUploadWithPoints: React.FC = () => {
  const { user, addPoints } = useAuth();
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [uploadHistory, setUploadHistory] = useState<UploadRecord[]>([]);
  const [showHistory, setShowHistory] = useState(false);
  
  // Initialize OORT Storage hook with tracking
  const {
    uploadFile,
    isUploading,
    progress,
    error,
    uploadUrl,
    validateFile,
  } = useOortStorageWithTracking({
    path: 'user-uploads/',
    onSuccess: (url) => {
      console.log('Upload successful:', url);
    },
    onError: (error) => {
      console.error('Upload error:', error);
    },
    onProgress: (progress) => {
      console.log(`Upload progress: ${progress}%`);
    }
  });

  // Handle file selection
  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (files && files.length > 0) {
      const file = files[0];
      const validation = validateFile(file);
      
      if (validation.valid) {
        setSelectedFile(file);
      } else {
        alert(`File validation failed: ${validation.error}`);
        event.target.value = ''; // Reset the input
      }
    }
  };

  // Handle file upload with points tracking
  const handleUpload = async () => {
    if (!selectedFile || !user) return;
    
    try {
      // Upload the file and pass the user ID and addPoints callback
      const result = await uploadFile(selectedFile);
      
      if (result && result.success) {
        // Clear the selected file after successful upload
        setSelectedFile(null);
        
        // Reset the file input
        const fileInput = document.getElementById('file-upload') as HTMLInputElement;
        if (fileInput) fileInput.value = '';
      }
    } catch (error) {
      console.error('Upload failed:', error);
    }
  };

  // Load user's upload history
  const loadUploadHistory = async () => {
    if (!user) return;
    
    try {
      const history = await getUserUploadHistory(user.id);
      setUploadHistory(history);
      setShowHistory(true);
    } catch (error) {
      console.error('Failed to load upload history:', error);
    }
  };

  return (
    <div className="space-y-6 p-4">
      <Card>
        <CardHeader>
          <CardTitle>Upload Files with OORT Storage</CardTitle>
          <CardDescription>
            Upload files and earn points for your contributions
          </CardDescription>
        </CardHeader>
        
        <CardContent className="space-y-4">
          {user ? (
            <>
              <div className="flex items-center space-x-2">
                <div className="font-medium">User:</div>
                <div>{user.username}</div>
              </div>
              
              <div className="flex items-center space-x-2">
                <div className="font-medium">Points:</div>
                <div>{user.points}</div>
              </div>
              
              <div className="flex items-center space-x-2">
                <div className="font-medium">Trust Level:</div>
                <div>{user.trustLevel}</div>
              </div>
              
              <div className="mt-4">
                <label htmlFor="file-upload" className="block text-sm font-medium mb-2">
                  Select a file to upload
                </label>
                <input
                  id="file-upload"
                  type="file"
                  onChange={handleFileChange}
                  disabled={isUploading}
                  className="block w-full text-sm text-gray-500
                    file:mr-4 file:py-2 file:px-4
                    file:rounded-md file:border-0
                    file:text-sm file:font-semibold
                    file:bg-primary file:text-white
                    hover:file:bg-primary/90"
                />
              </div>
              
              {selectedFile && (
                <div className="mt-2 text-sm">
                  Selected: {selectedFile.name} ({(selectedFile.size / 1024).toFixed(2)} KB)
                </div>
              )}
              
              {isUploading && (
                <div className="mt-4">
                  <div className="text-sm mb-1">Uploading: {progress.toFixed(0)}%</div>
                  <Progress value={progress} className="h-2" />
                </div>
              )}
              
              {error && (
                <Alert variant="destructive" className="mt-4">
                  <AlertTitle>Upload Error</AlertTitle>
                  <AlertDescription>{error.message}</AlertDescription>
                </Alert>
              )}
              
              {uploadUrl && (
                <Alert className="mt-4">
                  <AlertTitle>Upload Successful!</AlertTitle>
                  <AlertDescription>
                    <div>Your file has been uploaded successfully.</div>
                    <a 
                      href={uploadUrl} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="text-primary hover:underline mt-2 inline-block"
                    >
                      View Uploaded File
                    </a>
                  </AlertDescription>
                </Alert>
              )}
            </>
          ) : (
            <Alert>
              <AlertTitle>Not Logged In</AlertTitle>
              <AlertDescription>
                Please log in to upload files and earn points.
              </AlertDescription>
            </Alert>
          )}
        </CardContent>
        
        <CardFooter className="flex justify-between">
          <Button
            onClick={handleUpload}
            disabled={!selectedFile || isUploading || !user}
          >
            {isUploading ? 'Uploading...' : 'Upload File'}
          </Button>
          
          <Button
            variant="outline"
            onClick={loadUploadHistory}
            disabled={!user}
          >
            View Upload History
          </Button>
        </CardFooter>
      </Card>
      
      {showHistory && (
        <Card>
          <CardHeader>
            <CardTitle>Upload History</CardTitle>
            <CardDescription>
              Your previous uploads and points earned
            </CardDescription>
          </CardHeader>
          
          <CardContent>
            {uploadHistory.length > 0 ? (
              <div className="space-y-4">
                {uploadHistory.map((record, index) => (
                  <div key={index} className="border rounded-md p-4">
                    <div className="flex justify-between">
                      <div className="font-medium">{record.file_name}</div>
                      <div className="text-sm text-muted-foreground">
                        {new Date(record.created_at || '').toLocaleString()}
                      </div>
                    </div>
                    <div className="text-sm mt-2">
                      Size: {(record.file_size / 1024).toFixed(2)} KB
                    </div>
                    <div className="text-sm">
                      Type: {record.file_type}
                    </div>
                    <div className="text-sm">
                      Storage: {record.storage_provider}
                    </div>
                    <div className="mt-2 font-medium text-primary">
                      Points Earned: +{record.points_awarded}
                    </div>
                    <a 
                      href={record.upload_url} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="text-primary hover:underline mt-2 inline-block text-sm"
                    >
                      View File
                    </a>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-muted-foreground">
                No upload history found.
              </div>
            )}
          </CardContent>
          
          <CardFooter>
            <Button
              variant="outline"
              onClick={() => setShowHistory(false)}
              className="w-full"
            >
              Hide History
            </Button>
          </CardFooter>
        </Card>
      )}
    </div>
  );
};

export default OortUploadWithPoints;