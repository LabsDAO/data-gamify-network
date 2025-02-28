
import { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Upload as UploadIcon, File, X, Check, AlertCircle, Image, Music, Video } from 'lucide-react';
import GlassMorphismCard from '@/components/ui/GlassMorphismCard';
import { cn } from '@/lib/utils';
import { useAuth } from '@/hooks/useAuth';
import { toast } from '@/hooks/use-toast';

type FileType = 'image' | 'audio' | 'video' | 'unknown';

interface UploadedFile {
  id: string;
  file: File;
  progress: number;
  status: 'uploading' | 'success' | 'error';
  type: FileType;
  preview?: string;
}

const Upload = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [isDragging, setIsDragging] = useState(false);
  const [uploadedFiles, setUploadedFiles] = useState<UploadedFile[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  if (!user) {
    navigate('/');
    return null;
  }

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      handleFiles(e.dataTransfer.files);
    }
  };

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      handleFiles(e.target.files);
    }
  };

  const determineFileType = (file: File): FileType => {
    if (file.type.startsWith('image/')) return 'image';
    if (file.type.startsWith('audio/')) return 'audio';
    if (file.type.startsWith('video/')) return 'video';
    return 'unknown';
  };

  const getFileIcon = (fileType: FileType) => {
    switch (fileType) {
      case 'image':
        return <Image className="w-6 h-6" />;
      case 'audio':
        return <Music className="w-6 h-6" />;
      case 'video':
        return <Video className="w-6 h-6" />;
      default:
        return <File className="w-6 h-6" />;
    }
  };

  const handleFiles = (fileList: FileList) => {
    const newFiles: UploadedFile[] = Array.from(fileList).map(file => {
      const fileType = determineFileType(file);
      
      let preview;
      if (fileType === 'image') {
        preview = URL.createObjectURL(file);
      }
      
      return {
        id: `file_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        file,
        progress: 0,
        status: 'uploading',
        type: fileType,
        preview
      };
    });
    
    setUploadedFiles(prev => [...prev, ...newFiles]);
    
    // Simulate upload process for each file
    newFiles.forEach(fileObj => {
      simulateFileUpload(fileObj.id);
    });
  };

  const simulateFileUpload = (fileId: string) => {
    setIsUploading(true);
    let progress = 0;
    
    const interval = setInterval(() => {
      progress += Math.floor(Math.random() * 10) + 5;
      
      if (progress >= 100) {
        clearInterval(interval);
        progress = 100;
        
        setUploadedFiles(prev => 
          prev.map(file => 
            file.id === fileId 
              ? { ...file, progress, status: 'success' } 
              : file
          )
        );
        
        // Check if all files are done uploading
        const allDone = uploadedFiles.every(file => 
          file.id === fileId 
            ? true 
            : file.status === 'success' || file.status === 'error'
        );
        
        if (allDone) {
          setIsUploading(false);
          toast({
            title: "Upload Complete",
            description: "All files have been successfully uploaded.",
          });
        }
      } else {
        setUploadedFiles(prev => 
          prev.map(file => 
            file.id === fileId 
              ? { ...file, progress } 
              : file
          )
        );
      }
    }, 200);
  };

  const removeFile = (fileId: string) => {
    setUploadedFiles(prev => {
      const updatedFiles = prev.filter(file => file.id !== fileId);
      
      // If removing the file results in an empty list, set isUploading to false
      if (updatedFiles.length === 0) {
        setIsUploading(false);
      }
      
      return updatedFiles;
    });
  };

  const triggerFileInput = () => {
    fileInputRef.current?.click();
  };

  const handleContinue = () => {
    if (uploadedFiles.length > 0 && !isUploading) {
      // In a real app, you'd probably save the file metadata to a database here
      navigate('/preprocess');
      toast({
        title: "Files Ready for Preprocessing",
        description: `${uploadedFiles.length} files have been added to your workspace.`,
      });
    } else {
      toast({
        title: "Cannot Continue",
        description: isUploading 
          ? "Please wait for files to finish uploading." 
          : "Please upload at least one file before continuing.",
        variant: "destructive"
      });
    }
  };

  return (
    <div className="min-h-screen pt-24 pb-16 px-6">
      <div className="container mx-auto animate-fade-in">
        <h1 className="text-3xl font-bold mb-8">Upload Data</h1>
        
        <GlassMorphismCard>
          <div 
            className={cn(
              "border-2 border-dashed rounded-lg p-10 transition-all duration-300 text-center",
              isDragging 
                ? "border-primary bg-primary/5"
                : "border-border hover:border-primary/50 hover:bg-secondary/50"
            )}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
          >
            <UploadIcon className="w-16 h-16 mx-auto mb-4 text-muted-foreground" />
            <h2 className="text-2xl font-bold mb-2">Drag and drop files here</h2>
            <p className="text-muted-foreground mb-6">
              Support for images, audio, and video files
            </p>
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileInputChange}
              multiple
              accept="image/*,audio/*,video/*"
              className="hidden"
            />
            <button
              onClick={triggerFileInput}
              className="px-6 py-2 bg-primary text-white rounded-full hover:bg-primary/90 transition-all"
            >
              Browse Files
            </button>
          </div>
          
          {uploadedFiles.length > 0 && (
            <div className="mt-8">
              <h3 className="text-xl font-bold mb-4">Uploaded Files ({uploadedFiles.length})</h3>
              <div className="space-y-4">
                {uploadedFiles.map((fileObj) => (
                  <div 
                    key={fileObj.id}
                    className="flex items-center gap-4 p-4 bg-secondary/50 rounded-lg"
                  >
                    {fileObj.preview ? (
                      <div className="w-12 h-12 rounded overflow-hidden flex-shrink-0">
                        <img 
                          src={fileObj.preview} 
                          alt="preview" 
                          className="w-full h-full object-cover"
                        />
                      </div>
                    ) : (
                      <div className="w-12 h-12 rounded bg-secondary flex items-center justify-center flex-shrink-0">
                        {getFileIcon(fileObj.type)}
                      </div>
                    )}
                    
                    <div className="flex-1">
                      <div className="flex justify-between items-start mb-1">
                        <div className="font-medium truncate max-w-xs">
                          {fileObj.file.name}
                        </div>
                        <div className="text-sm text-muted-foreground">
                          {(fileObj.file.size / 1024 / 1024).toFixed(2)} MB
                        </div>
                      </div>
                      
                      <div className="w-full bg-secondary rounded-full h-2 mb-1">
                        <div 
                          className={cn(
                            "h-2 rounded-full transition-all duration-300",
                            fileObj.status === 'error' 
                              ? "bg-destructive" 
                              : "bg-primary"
                          )}
                          style={{ width: `${fileObj.progress}%` }}
                        />
                      </div>
                      
                      <div className="flex justify-between items-center">
                        <div className="text-sm">
                          {fileObj.status === 'uploading' && (
                            <span className="text-muted-foreground">Uploading... {fileObj.progress}%</span>
                          )}
                          {fileObj.status === 'success' && (
                            <span className="text-green-600 flex items-center gap-1">
                              <Check className="w-4 h-4" /> Uploaded successfully
                            </span>
                          )}
                          {fileObj.status === 'error' && (
                            <span className="text-red-600 flex items-center gap-1">
                              <AlertCircle className="w-4 h-4" /> Upload failed
                            </span>
                          )}
                        </div>
                        <button 
                          onClick={() => removeFile(fileObj.id)}
                          className="text-muted-foreground hover:text-destructive transition-colors"
                          aria-label="Remove file"
                        >
                          <X className="w-5 h-5" />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
          
          <div className="mt-8 flex justify-end gap-4">
            <button
              onClick={() => navigate('/dashboard')}
              className="px-6 py-2 text-muted-foreground hover:text-foreground transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handleContinue}
              disabled={uploadedFiles.length === 0 || isUploading}
              className={cn(
                "px-6 py-2 bg-primary text-white rounded-full transition-all",
                (uploadedFiles.length === 0 || isUploading) 
                  ? "opacity-50 cursor-not-allowed" 
                  : "hover:bg-primary/90"
              )}
            >
              Continue to Preprocessing
            </button>
          </div>
        </GlassMorphismCard>
      </div>
    </div>
  );
};

export default Upload;
