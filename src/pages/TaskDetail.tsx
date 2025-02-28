
import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Upload, Tag, Clock, Award, CheckCircle, XCircle } from 'lucide-react';
import GlassMorphismCard from '@/components/ui/GlassMorphismCard';
import { useAuth } from '@/hooks/useAuth';
import { toast } from '@/components/ui/use-toast';
import { Progress } from '@/components/ui/progress';
import { usePrivy } from '@privy-io/react-auth';

// Mock task data
const tasksMockData = {
  'oil-spills': {
    id: 'oil-spills',
    title: 'Oil Spill Detection Dataset',
    description: 'Collect images of oil spills in various environments to help train AI models for early detection and environmental protection.',
    pointsPerUpload: 25,
    pointsPerLabel: 10,
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
    pointsPerUpload: 20,
    pointsPerLabel: 8,
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
  const { user } = useAuth();
  const { authenticated, login } = usePrivy();
  
  const [files, setFiles] = useState<File[]>([]);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [labels, setLabels] = useState<string>('');
  
  // Get task data based on ID
  const task = id ? tasksMockData[id as keyof typeof tasksMockData] : null;
  
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
  
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const selectedFiles = Array.from(e.target.files);
      setFiles(prev => [...prev, ...selectedFiles]);
    }
  };
  
  const handleUpload = async () => {
    if (!authenticated) {
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
    
    setUploading(true);
    
    // Simulate upload progress
    let progress = 0;
    const interval = setInterval(() => {
      progress += Math.random() * 10;
      if (progress > 100) progress = 100;
      setUploadProgress(Math.floor(progress));
      
      if (progress === 100) {
        clearInterval(interval);
        setTimeout(() => {
          setUploading(false);
          setFiles([]);
          setLabels('');
          
          // Calculate points earned
          const pointsEarned = task.pointsPerUpload * files.length;
          const labelPoints = labels.trim() ? task.pointsPerLabel : 0;
          const totalPoints = pointsEarned + labelPoints;
          
          toast({
            title: "Upload successful!",
            description: `You've earned ${totalPoints} points for your contribution!`,
            variant: "success"
          });
          
        }, 500);
      }
    }, 300);
  };
  
  const handleRemoveFile = (index: number) => {
    setFiles(prev => prev.filter((_, i) => i !== index));
  };
  
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
            <span className="text-sm font-medium text-primary/80 bg-primary/10 px-3 py-1 rounded-full">
              {task.category}
            </span>
            <h1 className="text-3xl font-bold mt-2 mb-3">{task.title}</h1>
            <p className="text-muted-foreground mb-4">{task.description}</p>
            
            <div className="flex flex-wrap gap-4 text-sm">
              <div className="flex items-center gap-1">
                <Clock className="w-4 h-4 text-muted-foreground" />
                <span>Deadline: {task.deadline}</span>
              </div>
              <div className="flex items-center gap-1">
                <Award className="w-4 h-4 text-amber-500" />
                <span>{task.pointsPerUpload} points per upload</span>
              </div>
              <div className="flex items-center gap-1">
                <Tag className="w-4 h-4 text-emerald-500" />
                <span>{task.pointsPerLabel} additional points for labeling</span>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2">
          <GlassMorphismCard className="mb-8">
            <h2 className="text-xl font-semibold mb-4">Upload Data</h2>
            
            <div className="border-2 border-dashed border-gray-300 dark:border-gray-700 rounded-lg p-8 mb-6 text-center">
              <Upload className="w-10 h-10 mx-auto mb-4 text-muted-foreground" />
              <p className="mb-4">Drag and drop files here or click to browse</p>
              <input
                type="file"
                id="file-upload"
                multiple
                accept="image/*,video/*,audio/*"
                className="hidden"
                onChange={handleFileChange}
                disabled={uploading}
              />
              <label 
                htmlFor="file-upload"
                className="px-4 py-2 bg-primary text-white rounded-md cursor-pointer disabled:opacity-50"
              >
                Select Files
              </label>
              <p className="text-sm text-muted-foreground mt-2">
                Supported formats: JPG, PNG, MP3, MP4, WAV (max 50MB per file)
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
                          {file.type.startsWith('image/') ? (
                            <img 
                              src={URL.createObjectURL(file)} 
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
            
            {uploading && (
              <div className="mb-6">
                <p className="text-sm font-medium mb-2">Uploading... {uploadProgress}%</p>
                <Progress value={uploadProgress} className="h-2" />
              </div>
            )}
            
            <button
              onClick={handleUpload}
              disabled={files.length === 0 || uploading}
              className="w-full px-4 py-2 bg-primary text-white rounded-md disabled:opacity-50"
            >
              {uploading ? 'Uploading...' : 'Upload Files'}
            </button>
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
    </div>
  );
};

export default TaskDetail;
