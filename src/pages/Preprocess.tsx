
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { FileText, Image, Tag, Info, CheckCircle, ArrowRight, ArrowLeft } from 'lucide-react';
import GlassMorphismCard from '@/components/ui/GlassMorphismCard';
import { cn } from '@/lib/utils';
import { useAuth } from '@/hooks/useAuth';
import { toast } from '@/hooks/use-toast';

// Mock data - in a real app, this would come from your database or previous step
const mockFiles = [
  {
    id: 'file1',
    name: 'forest_image.jpg',
    type: 'image',
    preview: 'https://images.unsplash.com/photo-1448375240586-882707db888b?auto=format&fit=crop&q=80&w=150&h=150',
    metadata: {
      labels: ['nature', 'forest', 'trees'],
      description: 'Dense forest with tall trees and sunlight filtering through branches',
      location: 'Pacific Northwest',
      resolution: '3840x2160',
    }
  },
  {
    id: 'file2',
    name: 'city_traffic.mp4',
    type: 'video',
    preview: '',
    metadata: {
      labels: ['urban', 'traffic', 'cars'],
      description: 'Busy city intersection with vehicles and pedestrians',
      location: 'Downtown Seattle',
      duration: '45 seconds',
    }
  },
  {
    id: 'file3',
    name: 'bird_calls.mp3',
    type: 'audio',
    preview: '',
    metadata: {
      labels: ['wildlife', 'birds', 'nature'],
      description: 'Collection of various bird calls recorded at dawn',
      location: 'Amazon Rainforest',
      duration: '2 minutes 15 seconds',
    }
  }
];

interface MetadataForm {
  labels: string;
  description: string;
  location: string;
  [key: string]: string;
}

const Preprocess = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [files] = useState(mockFiles);
  const [selectedFileId, setSelectedFileId] = useState(files[0]?.id);
  const [metadataForms, setMetadataForms] = useState<{[key: string]: MetadataForm}>(() => {
    // Initialize forms with existing metadata
    const initialForms: {[key: string]: MetadataForm} = {};
    
    files.forEach(file => {
      initialForms[file.id] = {
        labels: file.metadata.labels.join(', '),
        description: file.metadata.description,
        location: file.metadata.location,
        ...(file.metadata.resolution ? { resolution: file.metadata.resolution } : {}),
        ...(file.metadata.duration ? { duration: file.metadata.duration } : {})
      };
    });
    
    return initialForms;
  });
  const [completedFiles, setCompletedFiles] = useState<string[]>([]);

  if (!user) {
    navigate('/');
    return null;
  }

  const selectedFile = files.find(file => file.id === selectedFileId);

  const handleInputChange = (fileId: string, field: string, value: string) => {
    setMetadataForms(prev => ({
      ...prev,
      [fileId]: {
        ...prev[fileId],
        [field]: value
      }
    }));
  };

  const handleMarkComplete = (fileId: string) => {
    if (!completedFiles.includes(fileId)) {
      setCompletedFiles(prev => [...prev, fileId]);
      toast({
        title: "File Marked as Complete",
        description: "Metadata has been saved successfully.",
      });
    }
  };

  const handleNextFile = () => {
    const currentIndex = files.findIndex(file => file.id === selectedFileId);
    if (currentIndex < files.length - 1) {
      setSelectedFileId(files[currentIndex + 1].id);
    } else {
      // If all files are processed, navigate to the next step
      if (completedFiles.length === files.length) {
        handleFinish();
      } else {
        toast({
          title: "All Files Viewed",
          description: "Please complete metadata for all files before continuing.",
          variant: "destructive"
        });
      }
    }
  };

  const handlePrevFile = () => {
    const currentIndex = files.findIndex(file => file.id === selectedFileId);
    if (currentIndex > 0) {
      setSelectedFileId(files[currentIndex - 1].id);
    }
  };

  const handleFinish = () => {
    if (completedFiles.length === files.length) {
      // In a real app, you'd save the metadata to your database here
      navigate('/register');
      toast({
        title: "Preprocessing Complete",
        description: "All files are ready for IP registration.",
      });
    } else {
      toast({
        title: "Cannot Continue",
        description: `Please complete metadata for all files (${completedFiles.length}/${files.length} completed).`,
        variant: "destructive"
      });
    }
  };

  const getFileTypeIcon = (type: string) => {
    switch (type) {
      case 'image':
        return <Image className="w-5 h-5" />;
      case 'video':
      case 'audio':
      default:
        return <FileText className="w-5 h-5" />;
    }
  };

  return (
    <div className="min-h-screen pt-24 pb-16 px-6">
      <div className="container mx-auto animate-fade-in">
        <h1 className="text-3xl font-bold mb-8">Label Data</h1>
        
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* File List */}
          <GlassMorphismCard className="lg:col-span-1">
            <h2 className="text-xl font-bold mb-4">Files ({files.length})</h2>
            <div className="space-y-2">
              {files.map((file) => (
                <div 
                  key={file.id}
                  onClick={() => setSelectedFileId(file.id)}
                  className={cn(
                    "p-3 rounded-lg flex items-center gap-3 cursor-pointer transition-all",
                    selectedFileId === file.id 
                      ? "bg-primary/10 text-primary"
                      : "hover:bg-secondary/80",
                    completedFiles.includes(file.id) && "border border-green-400"
                  )}
                >
                  <div className="p-2 rounded bg-secondary/80">
                    {getFileTypeIcon(file.type)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="font-medium truncate">{file.name}</div>
                    <div className="text-xs text-muted-foreground">
                      {file.type.charAt(0).toUpperCase() + file.type.slice(1)}
                    </div>
                  </div>
                  {completedFiles.includes(file.id) && (
                    <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0" />
                  )}
                </div>
              ))}
            </div>
          </GlassMorphismCard>
          
          {/* Selected File Details and Metadata */}
          {selectedFile && (
            <GlassMorphismCard className="lg:col-span-2">
              <div className="flex flex-col sm:flex-row gap-6">
                {/* File Preview/Info */}
                <div className="w-full sm:w-1/3">
                  {selectedFile.type === 'image' && selectedFile.preview ? (
                    <div className="rounded-lg overflow-hidden mb-4 border border-border">
                      <img 
                        src={selectedFile.preview} 
                        alt={selectedFile.name}
                        className="w-full h-auto object-cover"
                      />
                    </div>
                  ) : (
                    <div className="rounded-lg bg-secondary/50 flex items-center justify-center h-40 mb-4">
                      {getFileTypeIcon(selectedFile.type)}
                      <span className="ml-2">{selectedFile.type.toUpperCase()}</span>
                    </div>
                  )}
                  
                  <div className="p-4 bg-secondary/30 rounded-lg">
                    <h3 className="font-medium mb-2 flex items-center gap-2">
                      <Info className="w-4 h-4" /> File Information
                    </h3>
                    <div className="text-sm space-y-1">
                      <p><span className="text-muted-foreground">Name:</span> {selectedFile.name}</p>
                      <p>
                        <span className="text-muted-foreground">Type:</span> 
                        {selectedFile.type.charAt(0).toUpperCase() + selectedFile.type.slice(1)}
                      </p>
                      {selectedFile.metadata.resolution && (
                        <p><span className="text-muted-foreground">Resolution:</span> {selectedFile.metadata.resolution}</p>
                      )}
                      {selectedFile.metadata.duration && (
                        <p><span className="text-muted-foreground">Duration:</span> {selectedFile.metadata.duration}</p>
                      )}
                    </div>
                  </div>
                </div>
                
                {/* Metadata Form */}
                <div className="flex-1">
                  <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
                    <Tag className="w-5 h-5" />
                    Metadata Editor
                  </h3>
                  
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium mb-1">
                        Labels (comma separated)
                      </label>
                      <input
                        type="text"
                        value={metadataForms[selectedFile.id]?.labels}
                        onChange={(e) => handleInputChange(selectedFile.id, 'labels', e.target.value)}
                        className="w-full px-3 py-2 bg-secondary/50 rounded-lg border border-border focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
                        placeholder="nature, forest, trees"
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium mb-1">
                        Description
                      </label>
                      <textarea
                        value={metadataForms[selectedFile.id]?.description}
                        onChange={(e) => handleInputChange(selectedFile.id, 'description', e.target.value)}
                        className="w-full px-3 py-2 bg-secondary/50 rounded-lg border border-border focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary min-h-[100px]"
                        placeholder="Provide a detailed description of the content..."
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium mb-1">
                        Location
                      </label>
                      <input
                        type="text"
                        value={metadataForms[selectedFile.id]?.location}
                        onChange={(e) => handleInputChange(selectedFile.id, 'location', e.target.value)}
                        className="w-full px-3 py-2 bg-secondary/50 rounded-lg border border-border focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
                        placeholder="Where was this content captured?"
                      />
                    </div>
                    
                    {selectedFile.type === 'image' && (
                      <div>
                        <label className="block text-sm font-medium mb-1">
                          Resolution
                        </label>
                        <input
                          type="text"
                          value={metadataForms[selectedFile.id]?.resolution}
                          onChange={(e) => handleInputChange(selectedFile.id, 'resolution', e.target.value)}
                          className="w-full px-3 py-2 bg-secondary/50 rounded-lg border border-border focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
                          placeholder="e.g., 1920x1080"
                        />
                      </div>
                    )}
                    
                    {(selectedFile.type === 'audio' || selectedFile.type === 'video') && (
                      <div>
                        <label className="block text-sm font-medium mb-1">
                          Duration
                        </label>
                        <input
                          type="text"
                          value={metadataForms[selectedFile.id]?.duration}
                          onChange={(e) => handleInputChange(selectedFile.id, 'duration', e.target.value)}
                          className="w-full px-3 py-2 bg-secondary/50 rounded-lg border border-border focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
                          placeholder="e.g., 2 minutes 30 seconds"
                        />
                      </div>
                    )}
                  </div>
                  
                  <div className="mt-6 flex justify-between">
                    <button
                      onClick={() => handleMarkComplete(selectedFile.id)}
                      className={cn(
                        "px-4 py-2 rounded-full flex items-center gap-2 transition-all",
                        completedFiles.includes(selectedFile.id)
                          ? "bg-green-500/10 text-green-500 border border-green-500"
                          : "bg-primary text-white hover:bg-primary/90"
                      )}
                    >
                      <CheckCircle className="w-4 h-4" />
                      {completedFiles.includes(selectedFile.id) ? 'Completed' : 'Mark as Complete'}
                    </button>
                    
                    <div className="flex gap-2">
                      <button
                        onClick={handlePrevFile}
                        disabled={files.findIndex(file => file.id === selectedFileId) === 0}
                        className={cn(
                          "p-2 rounded-full flex items-center transition-all",
                          files.findIndex(file => file.id === selectedFileId) === 0
                            ? "opacity-50 cursor-not-allowed"
                            : "bg-secondary/80 hover:bg-secondary"
                        )}
                      >
                        <ArrowLeft className="w-5 h-5" />
                      </button>
                      
                      <button
                        onClick={handleNextFile}
                        className="p-2 rounded-full bg-secondary/80 hover:bg-secondary flex items-center transition-all"
                      >
                        <ArrowRight className="w-5 h-5" />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="mt-6 pt-6 border-t border-border flex justify-between">
                <button
                  onClick={() => navigate('/upload')}
                  className="px-6 py-2 text-muted-foreground hover:text-foreground transition-colors flex items-center gap-2"
                >
                  <ArrowLeft className="w-4 h-4" /> Back to Upload
                </button>
                
                <button
                  onClick={handleFinish}
                  className={cn(
                    "px-6 py-2 bg-primary text-white rounded-full flex items-center gap-2 transition-all",
                    completedFiles.length !== files.length 
                      ? "opacity-50 cursor-not-allowed" 
                      : "hover:bg-primary/90"
                  )}
                >
                  Continue to IP Registration
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </GlassMorphismCard>
          )}
        </div>
        
        {/* Progress Indicator */}
        <div className="mt-8 flex items-center justify-center">
          <div className="text-sm text-muted-foreground">
            {completedFiles.length} of {files.length} files processed
          </div>
          <div className="mx-4 w-64 bg-secondary rounded-full h-2">
            <div 
              className="bg-primary h-2 rounded-full"
              style={{ width: `${(completedFiles.length / files.length) * 100}%` }}
            />
          </div>
          <div className="text-sm font-medium">
            {Math.round((completedFiles.length / files.length) * 100)}%
          </div>
        </div>
      </div>
    </div>
  );
};

export default Preprocess;
