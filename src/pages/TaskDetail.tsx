import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Upload, Tag, Clock, Award, CheckCircle, XCircle, AlertCircle, Camera, Wifi, Settings, Info } from 'lucide-react';
import GlassMorphismCard from '@/components/ui/GlassMorphismCard';
import { useAuth } from '@/hooks/useAuth';
import { toast } from '@/hooks/use-toast';
import { Progress } from '@/components/ui/progress';
import { usePrivy } from '@privy-io/react-auth';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { useIsMobile } from '@/hooks/use-mobile';
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { useOortStorage } from '@/hooks/use-oort-storage';
import { UploadResult } from '@/utils/oortStorage';
import { useAwsStorage } from '@/hooks/use-aws-storage';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { getAwsCredentials, saveAwsCredentials } from '@/utils/awsStorage';

const tasksMockData = {
  'oil-spills': {
    id: 'oil-spills',
    title: 'Oil Spill Detection Dataset',
    description: 'Collect images of oil spills in various environments to help train AI models for early detection and environmental protection.',
    pointsPerUpload: 1,
    pointsPerLabel: 1,
    deadline: '2024-05-15',
    requiredUploads: 5,
    category: 'Environmental',
    instructions: [
      'Take or find high-quality images of oil spills in oceans, rivers, or land',
      'Images should be clear and show the oil spill distinctly',
      'Include various lighting conditions and perspectives',
      'Avoid images that already contain labels or markings',
      'Metadata should include location and approximate date if possible'
    ]
  },
  'flat-tires': {
    id: 'flat-tires',
    title: 'Flat Tire Recognition Dataset',
    description: 'Help build a dataset of flat tires in various conditions to train AI systems for roadside assistance and autonomous vehicle safety.',
    pointsPerUpload: 1,
    pointsPerLabel: 1,
    deadline: '2024-04-30',
    requiredUploads: 8,
    category: 'Automotive',
    instructions: [
      'Capture images of flat tires on different vehicle types',
      'Include various angles and perspectives',
      'Show different types of damage causing flat tires',
      'Include images in different weather and lighting conditions',
      'If possible, include location data and vehicle type in metadata'
    ]
  }
};

const TaskDetail = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user, addPoints } = useAuth();
  const { authenticated, login } = usePrivy();
  const isMobile = useIsMobile();
  const cameraRef = useRef<HTMLInputElement>(null);
  
  const [files, setFiles] = useState<File[]>([]);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [labels, setLabels] = useState<string>('');
  const [previewUrls, setPreviewUrls] = useState<string[]>([]);
  const [showAuthReminder, setShowAuthReminder] = useState(false);
  const [storageOption, setStorageOption] = useState<string>("oort");
  const [uploadedUrls, setUploadedUrls] = useState<string[]>([]);
  const [verificationStatus, setVerificationStatus] = useState<{[url: string]: boolean}>({});
  const [showConnectionTest, setShowConnectionTest] = useState(false);
  const [showCredentialsDialog, setShowCredentialsDialog] = useState(false);
  const [awsCredentials, setAwsCredentials] = useState(() => getAwsCredentials());
  
  const task = id ? tasksMockData[id as keyof typeof tasksMockData] : null;
  
  const uploadPath = id ? `${id}` : 'uploads';
  
  console.log(`TaskDetail: Setting upload path for task ${id} to "${uploadPath}"`);
  
  const { 
    uploadFile: uploadToOort, 
    isUploading: isOortUploading,
    progress: oortProgress,
    isUsingRealStorage: isUsingRealOort
  } = useOortStorage({
    onProgress: (progress) => {
      if (storageOption === "oort") {
        setUploadProgress(progress);
      }
    },
    path: uploadPath,
    forceReal: true
  });
  
  const {
    uploadFile: uploadToAws,
    isUploading: isAwsUploading,
    progress: awsProgress,
    hasValidCredentials: hasAwsCredentials,
    isUsingRealStorage: isUsingRealAws,
    testConnection,
    isTestingConnection,
    connectionStatus,
    availableBuckets,
    fetchAvailableBuckets,
    updateCredentials
  } = useAwsStorage({
    onProgress: (progress) => {
      if (storageOption === "aws") {
        setUploadProgress(progress);
      }
    },
    path: uploadPath
  });
  
  useEffect(() => {
    if (!authenticated && !user) {
      const timer = setTimeout(() => {
        setShowAuthReminder(true);
      }, 2000);
      
      return () => clearTimeout(timer);
    }
  }, [authenticated, user]);
  
  useEffect(() => {
    return () => {
      previewUrls.forEach(url => URL.revokeObjectURL(url));
    };
  }, [previewUrls]);

  useEffect(() => {
    if (storageOption === "aws") {
      setAwsCredentials(getAwsCredentials());
      
      // Only show the connection test UI, but don't run the test automatically
      setShowConnectionTest(true);
    }
  }, [storageOption]);
  
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const selectedFiles = Array.from(e.target.files);
      
      selectedFiles.forEach(file => {
        console.log(`Selected file: ${file.name}, size: ${file.size} bytes, type: ${file.type}`);
      });
      
      const newPreviewUrls = selectedFiles.map(file => {
        if (file.type.startsWith('image/')) {
          return URL.createObjectURL(file);
        }
        return '';
      });
      
      setFiles(prev => [...prev, ...selectedFiles]);
      setPreviewUrls(prev => [...prev, ...newPreviewUrls]);
    }
  };
  
  const handleCameraCapture = () => {
    if (cameraRef.current) {
      cameraRef.current.click();
    }
  };
  
  const handleTestConnection = async () => {
    if (storageOption === "aws") {
      setShowConnectionTest(true);
      await testConnection();
    }
  };

  const handleUpdateAwsCredentials = async () => {
    try {
      // Save the credentials without running the connection test
      saveAwsCredentials(awsCredentials);
      
      setShowCredentialsDialog(false);
      toast({
        title: "AWS Credentials Updated",
        description: "Your AWS S3 credentials have been saved. Click 'Test Connection' to verify they work.",
        variant: "success"
      });
    } catch (error) {
      console.error("Failed to update AWS credentials:", error);
      toast({
        title: "Failed to Update Credentials",
        description: error instanceof Error ? error.message : "Unknown error occurred",
        variant: "destructive"
      });
    }
  };
  
  const handleUpload = async () => {
    if (!authenticated && !user) {
      toast({
        title: "Authentication required",
        description: "Please log in to upload files",
        variant: "destructive"
      });
      login();
      return;
    }
    
    if (files.length === 0) {
      toast({
        title: "No files selected",
        description: "Please select at least one file to upload",
        variant: "destructive"
      });
      return;
    }
    
    if (storageOption === "aws" && !hasAwsCredentials) {
      toast({
        title: "AWS S3 not configured",
        description: "Please configure your AWS S3 credentials before uploading",
        variant: "destructive"
      });
      setShowCredentialsDialog(true);
      return;
    }
    
    setUploading(true);
    setUploadProgress(0);
    setUploadedUrls([]);
    setVerificationStatus({});
    
    try {
      const successfulUploads: string[] = [];
      
      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        
        console.log(`Processing file ${i + 1} of ${files.length}: ${file.name}`);
        
        const uploadPathMessage = storageOption === "aws" 
          ? `to AWS S3 (${uploadPath})` 
          : `to OORT labsmarket bucket (${uploadPath})`;
        
        toast({
          title: `Uploading file ${i + 1} of ${files.length} ${uploadPathMessage}`,
          description: file.name,
        });
        
        let uploadedUrl;
        
        if (storageOption === "aws") {
          console.log(`Starting AWS S3 upload for ${file.name} to path ${uploadPath}`);
          uploadedUrl = await uploadToAws(file);
        } else if (storageOption === "azure") {
          toast({
            title: "Azure Storage",
            description: "Azure Blob Storage is not yet implemented",
            variant: "destructive"
          });
          continue;
        } else {
          console.log(`Starting OORT upload for ${file.name} to path ${uploadPath}`);
          const result: UploadResult = await uploadToOort(file);
          
          if (result.success && result.url) {
            uploadedUrl = result.url;
            
            // Store verification status
            if (result.verified !== undefined) {
              setVerificationStatus(prev => ({
                ...prev,
                [result.url!]: !!result.verified
              }));
            }
            
            // Log verification status
            if (result.verified === false) {
              console.log(`File uploaded but verification failed: ${result.url}`);
            } else if (result.verified === true) {
              console.log(`File uploaded and verified successfully: ${result.url}`);
            }
          } else {
            console.error(`Upload failed: ${result.error || 'Unknown error'}`);
            throw new Error(result.error || `Upload failed with status code: ${result.statusCode || 'unknown'}`);
          }
        }
        
        if (uploadedUrl) {
          console.log(`Upload success, URL: ${uploadedUrl}`);
          successfulUploads.push(uploadedUrl);
        } else {
          console.error(`Upload failed for file: ${file.name}`);
        }
      }
      
      setUploadedUrls(successfulUploads);
      
      if (successfulUploads.length > 0) {
        const pointsEarned = task ? task.pointsPerUpload * successfulUploads.length : 0;
        const labelPoints = labels.trim() && task ? task.pointsPerLabel : 0;
        const totalPoints = pointsEarned + labelPoints;
        
        addPoints(totalPoints);
        
        toast({
          title: "Upload successful!",
          description: `You've earned ${totalPoints} points for your contribution!${storageOption === "oort" ? " Files stored in OORT labsmarket bucket." : " Files stored in AWS S3."}`,
          variant: "success"
        });
        
        setFiles([]);
        setLabels('');
        setPreviewUrls([]);
      } else {
        toast({
          title: "Upload failed",
          description: "No files were successfully uploaded",
          variant: "destructive"
        });
      }
    } catch (error) {
      console.error("Upload error:", error);
      
      // Show toast notification
      toast({
        title: "Upload failed",
        description: error instanceof Error ? error.message : "An unknown error occurred",
        variant: "destructive"
      });
      
      // Add visible error message in the UI
      const errorMessage = error instanceof Error ? error.message : "An unknown error occurred";
      const isNetworkError = errorMessage.includes('Network') ||
                            errorMessage.includes('CORS') ||
                            errorMessage.includes('fetch');
      
      // Show error message in UI for 10 seconds
      setUploadedUrls([`Error: ${errorMessage}`]);
      
      // Clear error message after 10 seconds
      setTimeout(() => {
        setUploadedUrls([]);
      }, 10000);
    } finally {
      setUploading(false);
      setUploadProgress(0);
    }
  };
  
  const handleRemoveFile = (index: number) => {
    if (previewUrls[index]) {
      URL.revokeObjectURL(previewUrls[index]);
    }
    
    setFiles(prev => prev.filter((_, i) => i !== index));
    setPreviewUrls(prev => prev.filter((_, i) => i !== index));
  };
  
  if (!task) {
    return (
      <div className="container mx-auto px-4 py-20 text-center">
        <h1 className="text-2xl font-bold mb-4">Task not found</h1>
        <p className="mb-6">The task you're looking for doesn't exist or has been removed.</p>
        <button 
          onClick={() => navigate('/dashboard')}
          className="px-6 py-2 bg-primary text-white rounded-full"
        >
          Return to Dashboard
        </button>
      </div>
    );
  }
  
  const totalPointsPossible = task.pointsPerUpload + task.pointsPerLabel;
  
  return (
    <div className="container mx-auto px-4 py-16">
      <div className="mb-8">
        <button 
          onClick={() => navigate('/dashboard')}
          className="text-primary hover:underline flex items-center gap-1 mb-6"
        >
          ← Back to Dashboard
        </button>
        
        <div className="flex flex-col md:flex-row justify-between mb-8 gap-4">
          <div>
            <Badge variant="outline" className="bg-primary/10 text-primary mb-2">
              {task.category}
            </Badge>
            <h1 className="text-3xl font-bold mt-2 mb-3">{task.title}</h1>
            <p className="text-muted-foreground mb-4">{task.description}</p>
            
            <div className="flex flex-wrap gap-4 text-sm">
              <div className="flex items-center gap-1">
                <Clock className="w-4 h-4 text-muted-foreground" />
                <span>Deadline: {task.deadline}</span>
              </div>
              <div className="flex items-center gap-1">
                <Award className="w-4 h-4 text-amber-500" />
                <span>1 point per image upload</span>
              </div>
              <div className="flex items-center gap-1">
                <Tag className="w-4 h-4 text-emerald-500" />
                <span>{task.pointsPerLabel} additional points for labeling</span>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      {showAuthReminder && !authenticated && !user && (
        <GlassMorphismCard className="mb-8 border-amber-200">
          <div className="flex items-start gap-3">
            <AlertCircle className="w-6 h-6 text-amber-500 flex-shrink-0 mt-1" />
            <div>
              <h3 className="font-semibold text-amber-700">Authentication Required</h3>
              <p className="text-muted-foreground mb-4">Sign in to start uploading data and earning points for your contributions.</p>
              <button 
                onClick={login}
                className="px-4 py-2 bg-primary text-white rounded-md"
              >
                Sign In with Privy
              </button>
            </div>
          </div>
        </GlassMorphismCard>
      )}
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2">
          <GlassMorphismCard className="mb-8">
            <h2 className="text-xl font-semibold mb-4">Upload Data</h2>
            
            <div className="border-2 border-dashed border-gray-300 dark:border-gray-700 rounded-lg p-8 mb-6 text-center">
              <Upload className="w-10 h-10 mx-auto mb-4 text-muted-foreground" />
              <p className="mb-4">Drag and drop files here or use the options below</p>
              
              <div className="flex flex-wrap gap-3 justify-center">
                <input
                  type="file"
                  id="file-upload"
                  multiple
                  accept="image/*,audio/*,video/*,application/pdf,text/plain,application/json"
                  className="hidden"
                  onChange={handleFileChange}
                  disabled={uploading}
                />
                <input
                  type="file"
                  id="camera-capture"
                  accept="image/*"
                  capture={isMobile ? "environment" : undefined}
                  className="hidden"
                  onChange={handleFileChange}
                  disabled={uploading}
                  ref={cameraRef}
                />
                
                <label 
                  htmlFor="file-upload"
                  className="px-4 py-2 bg-primary text-white rounded-md cursor-pointer disabled:opacity-50 flex items-center gap-2"
                >
                  <Upload className="w-4 h-4" />
                  Browse Files
                </label>
                
                <Button 
                  onClick={handleCameraCapture}
                  variant="camera"
                  className="flex items-center gap-2"
                  disabled={uploading}
                >
                  <Camera className="w-4 h-4" />
                  Take Picture
                </Button>
              </div>
              
              <p className="text-sm text-muted-foreground mt-4">
                Supported formats: Images, Audio, Video, Documents (max 100MB per file)
              </p>
            </div>
            
            {files.length > 0 && (
              <div className="mb-6">
                <h3 className="font-semibold mb-2">Selected Files ({files.length})</h3>
                <div className="space-y-2 max-h-60 overflow-y-auto p-2">
                  {files.map((file, index) => (
                    <div key={index} className="flex items-center justify-between bg-background p-3 rounded-md">
                      <div className="flex items-center gap-2">
                        <div className="w-10 h-10 rounded bg-primary/10 flex items-center justify-center">
                          {file.type.startsWith('image/') && previewUrls[index] ? (
                            <img 
                              src={previewUrls[index]} 
                              alt="preview" 
                              className="w-10 h-10 object-cover rounded"
                            />
                          ) : (
                            <Upload className="w-5 h-5 text-primary" />
                          )}
                        </div>
                        <div>
                          <p className="text-sm font-medium truncate max-w-[200px]">{file.name}</p>
                          <p className="text-xs text-muted-foreground">{(file.size / 1024 / 1024).toFixed(2)} MB</p>
                        </div>
                      </div>
                      <button 
                        onClick={() => handleRemoveFile(index)} 
                        className="text-destructive hover:text-destructive/80"
                        disabled={uploading}
                      >
                        <XCircle className="w-5 h-5" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}
            
            <div className="mb-6">
              <label className="block font-medium mb-2">Add Labels & Description (optional)</label>
              <textarea
                className="w-full h-32 p-3 border border-input rounded-md bg-background"
                placeholder="Add comma-separated labels and a brief description to earn extra points..."
                value={labels}
                onChange={(e) => setLabels(e.target.value)}
                disabled={uploading}
              ></textarea>
            </div>
            
            <div className="mb-6">
              <h3 className="font-semibold mb-3">Storage Options</h3>
              <RadioGroup 
                defaultValue="oort" 
                value={storageOption} 
                onValueChange={(val) => {
                  setStorageOption(val);
                  setShowConnectionTest(val === "aws");
                }}
                className="flex flex-col space-y-2"
              >
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="oort" id="oort" />
                  <Label htmlFor="oort" className="cursor-pointer">OORT Cloud (Default)</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="aws" id="aws" />
                  <Label htmlFor="aws" className="cursor-pointer">
                    AWS S3
                    {hasAwsCredentials ? (
                      <Button
                        variant="ghost"
                        size="sm"
                        className="ml-2 h-6 px-2 text-xs"
                        onClick={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                          setShowCredentialsDialog(true);
                        }}
                      >
                        <Settings className="w-3 h-3 mr-1" />
                        Configure
                      </Button>
                    ) : (
                      <Button
                        variant="outline"
                        size="sm"
                        className="ml-2 h-6 px-2 text-xs"
                        onClick={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                          setShowCredentialsDialog(true);
                        }}
                      >
                        <Settings className="w-3 h-3 mr-1" />
                        Set Credentials
                      </Button>
                    )}
                  </Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="azure" id="azure" disabled={true} />
                  <Label htmlFor="azure" className="cursor-pointer text-muted-foreground">Azure Blob Storage (Coming soon)</Label>
                </div>
              </RadioGroup>
            </div>
            
            {showConnectionTest && storageOption === "aws" && (
              <div className="mb-6 p-4 border border-input rounded-md bg-accent/20">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="font-semibold flex items-center gap-2">
                    <Wifi className="w-4 h-4" />
                    AWS S3 Connection Status
                  </h3>
                  <Button
                    variant="outline"
                    size="sm"
                    className="h-8 text-xs"
                    onClick={() => setShowCredentialsDialog(true)}
                  >
                    <Settings className="w-3 h-3 mr-1" />
                    Configure S3
                  </Button>
                </div>
                
                {isTestingConnection ? (
                  <div className="space-y-2">
                    <p className="text-sm">Testing connection to AWS S3...</p>
                    <Progress value={50} className="h-2" />
                  </div>
                ) : (
                  <>
                    {connectionStatus.tested ? (
                      <div className="space-y-3">
                        <div className="flex items-center gap-2">
                          {connectionStatus.isValid ? (
                            <CheckCircle className="w-5 h-5 text-green-500" />
                          ) : (
                            <XCircle className="w-5 h-5 text-destructive" />
                          )}
                          <span className={connectionStatus.isValid ? "text-green-700" : "text-destructive"}>
                            {connectionStatus.message}
                          </span>
                        </div>
                        
                        {connectionStatus.details && (
                          <div className="text-xs space-y-1 mt-2">
                            <div className="grid grid-cols-2 gap-1">
                              <span>Credentials:</span>
                              <span className={connectionStatus.details.credentialsValid ? "text-green-600" : "text-destructive"}>
                                {connectionStatus.details.credentialsValid ? "Valid" : "Invalid"}
                              </span>
                            </div>
                            <div className="grid grid-cols-2 gap-1">
                              <span>Bucket Access:</span>
                              <span className={connectionStatus.details.bucketAccessible ? "text-green-600" : "text-destructive"}>
                                {connectionStatus.details.bucketAccessible ? "Accessible" : "Inaccessible"}
                              </span>
                            </div>
                            <div className="grid grid-cols-2 gap-1">
                              <span>Write Permission:</span>
                              <span className={connectionStatus.details.writePermission ? "text-green-600" : "text-destructive"}>
                                {connectionStatus.details.writePermission ? "Granted" : "Denied"}
                              </span>
                            </div>
                            <div className="grid grid-cols-2 gap-1">
                              <span>CORS Configuration:</span>
                              <span className={
                                connectionStatus.details.corsEnabled === undefined 
                                  ? "text-amber-600" 
                                  : connectionStatus.details.corsEnabled 
                                    ? "text-green-600" 
                                    : "text-destructive"
                              }>
                                {connectionStatus.details.corsEnabled === undefined 
                                  ? "Unknown" 
                                  : connectionStatus.details.corsEnabled 
                                    ? "Enabled" 
                                    : "Disabled"}
                              </span>
                            </div>
                          </div>
                        )}
                        
                        {!connectionStatus.isValid && (
                          <div className="mt-2 text-sm text-muted-foreground">
                            <p className="font-medium">Troubleshooting tips:</p>
                            <ul className="list-disc list-inside text-xs mt-1 space-y-1">
                              <li>Verify your AWS access key and secret key are correct</li>
                              <li>Make sure your bucket name is correct and exists in your AWS account</li>
                              <li>Ensure your IAM user has s3:PutObject and s3:PutObjectAcl permissions</li>
                              <li>Add CORS configuration to your S3 bucket to allow uploads from this domain</li>
                              {availableBuckets && availableBuckets.length > 0 && (
                                <li className="text-primary">
                                  Your account has access to these buckets: {availableBuckets.join(", ")}
                                </li>
                              )}
                            </ul>
                            
                            {connectionStatus.details?.corsEnabled === false && (
                              <div className="mt-3 p-2 bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800 rounded-md">
                                <p className="font-medium text-amber-800 dark:text-amber-400 mb-1">CORS Configuration Required</p>
                                <p className="text-xs mb-2">Your S3 bucket needs CORS configuration to allow browser uploads. Add this to your bucket CORS settings in the AWS console:</p>
                                <pre className="text-xs bg-black/5 dark:bg-white/5 p-2 rounded overflow-auto max-h-32">
                                  {connectionStatus.details?.corsConfig || ''}
                                </pre>
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                    ) : (
                      <p className="text-sm text-muted-foreground">
                        Click "Test Connection" to verify AWS S3 connectivity before uploading.
                      </p>
                    )}
                    
                    <Button 
                      onClick={handleTestConnection}
                      className="mt-3 w-full"
                      variant="outline"
                      disabled={isTestingConnection}
                    >
                      Test Connection
                    </Button>
                  </>
                )}
              </div>
            )}
            
            {uploading && (
              <div className="mb-6">
                <div className="flex justify-between items-center mb-2">
                  <p className="text-sm font-medium">
                    Uploading to {storageOption === "aws" ? "AWS S3" : "OORT"}... {uploadProgress.toFixed(0)}%
                  </p>
                  {uploadProgress > 95 && storageOption === "oort" && (
                    <div className="flex items-center">
                      <div className="w-2 h-2 rounded-full bg-amber-500 mr-2 animate-pulse"></div>
                      <span className="text-xs text-amber-600">Verifying upload...</span>
                    </div>
                  )}
                </div>
                <Progress value={uploadProgress} className="h-2" />
                <div className="flex justify-between mt-1">
                  <p className="text-xs text-muted-foreground">
                    {storageOption === "aws"
                      ? "Using pre-signed URL approach to bypass CORS restrictions"
                      : "Using direct upload to OORT storage in Flat-tires folder"}
                  </p>
                  {uploadProgress > 0 && uploadProgress < 100 && (
                    <p className="text-xs text-muted-foreground">
                      {uploadProgress < 90 ? "Uploading..." : "Finalizing..."}
                    </p>
                  )}
                </div>
              </div>
            )}
            
            <button
              onClick={handleUpload}
              disabled={files.length === 0 || uploading}
              className="w-full px-4 py-2 bg-primary text-white rounded-md disabled:opacity-50"
            >
              {uploading ? 'Uploading...' : 'Upload Files'}
            </button>
            
            {uploadedUrls.length > 0 && (
              <div className="mt-6">
                {uploadedUrls[0]?.startsWith('Error:') ? (
                  // Error message display
                  <div className="bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-800 rounded-md p-4 mb-4">
                    <div className="flex items-center gap-2 mb-2">
                      <XCircle className="w-5 h-5 text-red-500" />
                      <h3 className="font-semibold text-red-700 dark:text-red-400">
                        Upload Failed
                      </h3>
                    </div>
                    <p className="text-sm text-red-600 dark:text-red-400 mb-2">
                      {uploadedUrls[0].substring(7)}
                    </p>
                    {storageOption === "aws" && (
                      <div className="text-xs text-red-500 dark:text-red-500 mt-2">
                        <p>Troubleshooting tips:</p>
                        <ul className="list-disc list-inside mt-1">
                          <li>Check your AWS credentials</li>
                          <li>Verify your bucket name and permissions</li>
                          <li>Try configuring CORS on your S3 bucket</li>
                          <li>Check your network connection</li>
                        </ul>
                      </div>
                    )}
                  </div>
                ) : (
                  // Success message display
                  <div className="bg-green-50 dark:bg-green-950/30 border border-green-200 dark:border-green-800 rounded-md p-4 mb-4">
                    <div className="flex items-center gap-2 mb-2">
                      <CheckCircle className="w-5 h-5 text-green-500" />
                      <h3 className="font-semibold text-green-700 dark:text-green-400">
                        Upload Successful!
                      </h3>
                    </div>
                    <p className="text-sm text-green-600 dark:text-green-400 mb-2">
                      {uploadedUrls.length} {uploadedUrls.length === 1 ? 'file' : 'files'} uploaded successfully to {storageOption === "aws" ? "AWS S3" : "OORT labsmarket bucket"}.
                    </p>
                    
                    {/* Display verification status for OORT uploads */}
                    {storageOption === "oort" && (
                      <>
                        <div className="flex items-center gap-2 mt-1 mb-1">
                          <div className="w-2 h-2 rounded-full bg-green-500"></div>
                          <p className="text-xs text-green-600 dark:text-green-400">
                            Files uploaded to the Flat-tires folder in OORT labsmarket bucket
                          </p>
                        </div>
                        
                        {/* Show verification summary */}
                        {Object.keys(verificationStatus).length > 0 && (
                          <div className="mt-1 text-xs border-t border-green-200 dark:border-green-800 pt-1">
                            <p className="text-green-600 dark:text-green-400 font-medium">Verification Status:</p>
                            <div className="flex gap-4 mt-1">
                              <div className="flex items-center">
                                <div className="w-2 h-2 rounded-full bg-green-500 mr-1"></div>
                                <span>
                                  {Object.values(verificationStatus).filter(Boolean).length} verified
                                </span>
                              </div>
                              {Object.values(verificationStatus).some(v => v === false) && (
                                <div className="flex items-center">
                                  <div className="w-2 h-2 rounded-full bg-amber-500 mr-1"></div>
                                  <span>
                                    {Object.values(verificationStatus).filter(v => v === false).length} unverified
                                  </span>
                                </div>
                              )}
                            </div>
                          </div>
                        )}
                      </>
                    )}
                    
                    {storageOption === "aws" && (
                      <p className="text-xs text-green-500 dark:text-green-500">
                        Used pre-signed URL approach to bypass CORS restrictions.
                      </p>
                    )}
                  </div>
                )}
                
                {!uploadedUrls[0]?.startsWith('Error:') && (
                  <>
                    <h3 className="font-semibold mb-2">
                      Uploaded Files {storageOption === "aws" ? "(AWS S3)" : "(OORT labsmarket bucket)"}
                    </h3>
                    <div className="space-y-2 max-h-40 overflow-y-auto p-2 border border-input rounded-md">
                      {uploadedUrls.map((url, index) => {
                        // Get verification status from state
                        const isVerified = verificationStatus[url];
                        const hasVerificationInfo = url in verificationStatus;
                        
                        return (
                          <div key={index} className="flex items-center justify-between p-2 bg-background/50 rounded">
                            <div className="flex-1 min-w-0">
                              <a
                                href={url}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-primary hover:underline text-sm truncate block"
                              >
                                {url}
                              </a>
                              {storageOption === "oort" && (
                                <div className="flex items-center mt-1">
                                  {hasVerificationInfo ? (
                                    <>
                                      <div className={`w-2 h-2 rounded-full ${isVerified ? 'bg-green-500' : 'bg-amber-500'} mr-2`}></div>
                                      <span className={`text-xs ${isVerified ? 'text-green-600' : 'text-amber-600'}`}>
                                        {isVerified ? 'Verified and accessible' : 'Uploaded but verification failed'}
                                      </span>
                                    </>
                                  ) : (
                                    <>
                                      <div className="w-2 h-2 rounded-full bg-green-500 mr-2"></div>
                                      <span className="text-xs text-green-600">Upload successful</span>
                                    </>
                                  )}
                                </div>
                              )}
                            </div>
                            <CheckCircle className="w-4 h-4 text-green-500 flex-shrink-0 ml-2" />
                          </div>
                        );
                      })}
                    </div>
                  </>
                )}
              </div>
            )}
          </GlassMorphismCard>
        </div>
        
        <div>
          <GlassMorphismCard className="mb-8">
            <h2 className="text-xl font-semibold mb-4">Task Information</h2>
            
            <div className="mb-6">
              <div className="bg-primary/5 p-4 rounded-lg mb-4">
                <div className="flex justify-between items-center mb-2">
                  <span className="font-medium">Points per contribution:</span>
                  <span className="font-bold text-primary">{totalPointsPossible}</span>
                </div>
                <div className="flex flex-col space-y-1 text-sm">
                  <div className="flex justify-between">
                    <span>- Per upload</span>
                    <span>{task.pointsPerUpload}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>- Adding labels</span>
                    <span>+{task.pointsPerLabel}</span>
                  </div>
                </div>
              </div>
              
              <div>
                <h3 className="font-semibold mb-2">Instructions:</h3>
                <ul className="space-y-2">
                  {task.instructions.map((instruction, index) => (
                    <li key={index} className="flex gap-2">
                      <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0" />
                      <span>{instruction}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </GlassMorphismCard>
          
          <GlassMorphismCard>
            <h2 className="text-xl font-semibold mb-4">Requirements</h2>
            <div className="space-y-4">
              <div>
                <p className="mb-1">Required uploads: {task.requiredUploads}</p>
                <p className="text-sm text-muted-foreground mb-2">
                  Upload at least {task.requiredUploads} files to complete this task
                </p>
              </div>
              
              <div>
                <p className="font-medium">Quality Guidelines:</p>
                <ul className="text-sm text-muted-foreground list-disc list-inside space-y-1 mt-1">
                  <li>Files must be clear and relevant to the task</li>
                  <li>Images should be at least 1024x768 pixels</li>
                  <li>For best results, include different angles and lighting</li>
                  <li>Proper labeling significantly increases value</li>
                </ul>
              </div>
            </div>
          </GlassMorphismCard>
        </div>
      </div>

      <Dialog open={showCredentialsDialog} onOpenChange={setShowCredentialsDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>AWS S3 Credentials</DialogTitle>
            <DialogDescription>
              Enter your AWS credentials to connect to S3. Make sure your IAM user has appropriate permissions.
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="accessKeyId">Access Key ID</Label>
              <Input
                id="accessKeyId"
                value={awsCredentials.accessKeyId}
                onChange={(e) => setAwsCredentials(prev => ({ ...prev, accessKeyId: e.target.value }))}
                placeholder="e.g. AKIAIOSFODNN7EXAMPLE"
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="secretAccessKey">Secret Access Key</Label>
              <Input
                id="secretAccessKey"
                type="password"
                value={awsCredentials.secretAccessKey}
                onChange={(e) => setAwsCredentials(prev => ({ ...prev, secretAccessKey: e.target.value }))}
                placeholder="Your secret access key"
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="region">Region</Label>
              <Input
                id="region"
                value={awsCredentials.region}
                onChange={(e) => setAwsCredentials(prev => ({ ...prev, region: e.target.value }))}
                placeholder="e.g. us-east-1"
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="bucket" className="flex justify-between">
                <span>Bucket Name</span>
                {availableBuckets && availableBuckets.length > 0 && (
                  <Dialog>
                    <DialogTrigger asChild>
                      <Button variant="link" className="h-6 px-0 text-xs">
                        <Info className="w-3 h-3 mr-1" />
                        View Available Buckets
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="sm:max-w-md">
                      <DialogHeader>
                        <DialogTitle>Available S3 Buckets</DialogTitle>
                        <DialogDescription>
                          Your AWS account has access to the following buckets:
                        </DialogDescription>
                      </DialogHeader>
                      <div className="max-h-48 overflow-y-auto">
                        <ul className="space-y-1">
                          {availableBuckets.map((bucket, index) => (
                            <li 
                              key={index} 
                              className="p-2 hover:bg-accent rounded cursor-pointer"
                              onClick={() => {
                                setAwsCredentials(prev => ({ ...prev, bucket }));
                                setShowCredentialsDialog(true);
                              }}
                            >
                              {bucket}
                            </li>
                          ))}
                        </ul>
                      </div>
                    </DialogContent>
                  </Dialog>
                )}
              </Label>
              <Input
                id="bucket"
                value={awsCredentials.bucket}
                onChange={(e) => setAwsCredentials(prev => ({ ...prev, bucket: e.target.value }))}
                placeholder="Your S3 bucket name"
              />
            </div>
          </div>
          
          <div className="flex flex-col space-y-2">
            <div className="space-y-3">
              <div className="text-xs text-muted-foreground bg-accent/20 p-2 rounded">
                <p className="font-medium mb-1">Required S3 bucket permissions:</p>
                <ul className="list-disc list-inside space-y-1 pl-1">
                  <li>s3:PutObject - To upload files</li>
                  <li>s3:PutObjectAcl - To set file permissions</li>
                  <li>s3:GetObject - To retrieve files</li>
                  <li>CORS configuration must allow uploads from this domain</li>
                </ul>
              </div>
              
              <div className="text-xs bg-primary/5 p-2 rounded">
                <p className="font-medium mb-1">CORS Configuration:</p>
                <p className="mb-1">Copy this configuration to your S3 bucket CORS settings in the AWS console:</p>
                <pre className="bg-black/5 dark:bg-white/5 p-2 rounded overflow-auto max-h-32 text-[10px]">
                  {connectionStatus.details?.corsConfig || ''}
                </pre>
              </div>
            </div>
          </div>
          
          <DialogFooter className="flex justify-between">
            <Button
              variant="outline"
              onClick={() => setShowCredentialsDialog(false)}
            >
              Cancel
            </Button>
            <div className="flex gap-2">
              <Button 
                variant="outline" 
                onClick={handleTestConnection}
                disabled={isTestingConnection}
              >
                Test Connection
              </Button>
              <Button onClick={handleUpdateAwsCredentials}>
                Save & Connect
              </Button>
            </div>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default TaskDetail;
