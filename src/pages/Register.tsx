
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Shield, Check, Info, Lock, FileText, ArrowRight, ArrowLeft } from 'lucide-react';
import GlassMorphismCard from '@/components/ui/GlassMorphismCard';
import { cn } from '@/lib/utils';
import { useAuth } from '@/hooks/useAuth';
import { toast } from '@/hooks/use-toast';

// Mock data
const mockDatasets = [
  {
    id: 'dataset1',
    name: 'Nature Collection',
    description: 'A collection of high-resolution forest and wildlife images',
    fileCount: 5,
    type: 'image',
    registered: false
  },
  {
    id: 'dataset2',
    name: 'Urban Soundscape',
    description: 'Audio recordings of city environments from around the world',
    fileCount: 3,
    type: 'audio',
    registered: false
  }
];

const licensingOptions = [
  {
    id: 'cc-by',
    name: 'Creative Commons Attribution',
    shortName: 'CC BY 4.0',
    description: 'This license allows reusers to distribute, remix, adapt, and build upon the material in any medium or format, so long as attribution is given to the creator.',
    commercial: true,
    derivatives: true
  },
  {
    id: 'cc-by-sa',
    name: 'Creative Commons Attribution-ShareAlike',
    shortName: 'CC BY-SA 4.0',
    description: 'This license allows reusers to distribute, remix, adapt, and build upon the material in any medium or format, so long as attribution is given to the creator. The license requires that adaptations be shared under the same terms.',
    commercial: true,
    derivatives: true
  },
  {
    id: 'cc-by-nc',
    name: 'Creative Commons Attribution-NonCommercial',
    shortName: 'CC BY-NC 4.0',
    description: 'This license allows reusers to distribute, remix, adapt, and build upon the material in any medium or format for noncommercial purposes only, and only so long as attribution is given to the creator.',
    commercial: false,
    derivatives: true
  },
  {
    id: 'custom',
    name: 'Custom License Agreement',
    shortName: 'Custom',
    description: 'Define your own terms for how your data can be used.',
    commercial: null,
    derivatives: null
  }
];

const Register = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [datasets, setDatasets] = useState(mockDatasets);
  const [selectedDatasetId, setSelectedDatasetId] = useState(datasets[0]?.id);
  const [selectedLicense, setSelectedLicense] = useState(licensingOptions[0]?.id);
  const [customTerms, setCustomTerms] = useState('');
  const [isRegistering, setIsRegistering] = useState(false);

  if (!user) {
    navigate('/');
    return null;
  }

  const selectedDataset = datasets.find(dataset => dataset.id === selectedDatasetId);

  const handleRegisterIP = async () => {
    if (!selectedDataset || !selectedLicense) return;
    
    setIsRegistering(true);
    
    try {
      // Simulate API call to Story Protocol SDK
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      setDatasets(prev => 
        prev.map(dataset => 
          dataset.id === selectedDatasetId 
            ? { ...dataset, registered: true } 
            : dataset
        )
      );
      
      toast({
        title: "IP Registration Successful",
        description: `Your dataset "${selectedDataset.name}" has been registered with ${
          licensingOptions.find(license => license.id === selectedLicense)?.shortName
        } license.`,
      });
      
      // Check if all datasets are registered
      const allRegistered = datasets.every(dataset => 
        dataset.id === selectedDatasetId ? true : dataset.registered
      );
      
      if (allRegistered) {
        // Add a brief delay before navigating
        setTimeout(() => {
          navigate('/dashboard');
        }, 1000);
      }
    } finally {
      setIsRegistering(false);
    }
  };

  return (
    <div className="min-h-screen pt-24 pb-16 px-6">
      <div className="container mx-auto animate-fade-in">
        <h1 className="text-3xl font-bold mb-8">Register IP</h1>
        
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Datasets List */}
          <GlassMorphismCard className="lg:col-span-1">
            <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
              <FileText className="w-5 h-5" /> Datasets
            </h2>
            <div className="space-y-3">
              {datasets.map((dataset) => (
                <div 
                  key={dataset.id}
                  onClick={() => !dataset.registered && setSelectedDatasetId(dataset.id)}
                  className={cn(
                    "p-4 rounded-lg border transition-all",
                    dataset.registered 
                      ? "border-green-400 bg-green-50 dark:bg-green-900/10 cursor-default"
                      : selectedDatasetId === dataset.id 
                        ? "border-primary bg-primary/5 cursor-pointer"
                        : "border-border hover:border-primary/50 hover:bg-secondary/50 cursor-pointer"
                  )}
                >
                  <div className="flex justify-between items-start">
                    <h3 className="font-medium">{dataset.name}</h3>
                    {dataset.registered && (
                      <span className="inline-flex items-center gap-1 text-xs font-medium text-green-600 dark:text-green-400 bg-green-50 dark:bg-green-900/20 px-2 py-0.5 rounded-full">
                        <Check className="w-3 h-3" /> Registered
                      </span>
                    )}
                  </div>
                  <p className="text-sm text-muted-foreground mt-1">{dataset.description}</p>
                  <div className="mt-2 text-xs text-muted-foreground">
                    {dataset.fileCount} {dataset.fileCount === 1 ? 'file' : 'files'} • {dataset.type}
                  </div>
                </div>
              ))}
            </div>
            
            <div className="mt-6 p-4 bg-secondary/30 rounded-lg">
              <h3 className="font-medium mb-2 flex items-center gap-2">
                <Info className="w-4 h-4" /> Why Register IP?
              </h3>
              <p className="text-sm text-muted-foreground">
                Registering your data as intellectual property establishes your ownership 
                and allows you to set terms for how others can use it. This ensures you're 
                fairly compensated when organizations use your data.
              </p>
            </div>
          </GlassMorphismCard>
          
          {/* Registration Form */}
          {selectedDataset && !selectedDataset.registered && (
            <GlassMorphismCard className="lg:col-span-2">
              <h2 className="text-xl font-bold mb-6 flex items-center gap-2">
                <Shield className="w-5 h-5" /> Register IP for "{selectedDataset.name}"
              </h2>
              
              <div className="mb-6">
                <h3 className="font-medium mb-3">Select a License</h3>
                <div className="space-y-3">
                  {licensingOptions.map((license) => (
                    <div
                      key={license.id}
                      onClick={() => setSelectedLicense(license.id)}
                      className={cn(
                        "p-4 rounded-lg border transition-all cursor-pointer",
                        selectedLicense === license.id 
                          ? "border-primary bg-primary/5"
                          : "border-border hover:border-primary/30 hover:bg-secondary/50"
                      )}
                    >
                      <div className="flex items-start gap-3">
                        <div className={cn(
                          "w-5 h-5 rounded-full flex-shrink-0 mt-0.5 border flex items-center justify-center",
                          selectedLicense === license.id 
                            ? "border-primary bg-primary text-white"
                            : "border-muted-foreground"
                        )}>
                          {selectedLicense === license.id && <Check className="w-3 h-3" />}
                        </div>
                        <div>
                          <div className="font-medium">
                            {license.name}
                            <span className="ml-2 text-sm font-normal text-muted-foreground">
                              {license.shortName}
                            </span>
                          </div>
                          <p className="text-sm text-muted-foreground mt-1">
                            {license.description}
                          </p>
                          
                          {license.commercial !== null && (
                            <div className="mt-2 flex gap-4">
                              <span className="text-xs inline-flex items-center gap-1">
                                {license.commercial 
                                  ? <Check className="w-3 h-3 text-green-500" />
                                  : <span className="w-3 h-3 text-destructive">✕</span>
                                }
                                Commercial Use
                              </span>
                              <span className="text-xs inline-flex items-center gap-1">
                                {license.derivatives
                                  ? <Check className="w-3 h-3 text-green-500" />
                                  : <span className="w-3 h-3 text-destructive">✕</span>
                                }
                                Derivatives
                              </span>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
              
              {selectedLicense === 'custom' && (
                <div className="mb-6">
                  <label className="block font-medium mb-2">
                    Custom License Terms
                  </label>
                  <textarea
                    value={customTerms}
                    onChange={(e) => setCustomTerms(e.target.value)}
                    className="w-full px-3 py-2 bg-secondary/50 rounded-lg border border-border focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary min-h-[120px]"
                    placeholder="Describe the terms under which your data can be used..."
                  />
                </div>
              )}
              
              <div className="p-4 bg-secondary/30 rounded-lg mb-6">
                <div className="flex items-center gap-2 mb-2">
                  <Lock className="w-4 h-4 text-primary" />
                  <h3 className="font-medium">Security & Privacy</h3>
                </div>
                <p className="text-sm text-muted-foreground">
                  Your data will be registered on a secure blockchain using Story Protocol. 
                  This creates an immutable record of your ownership while maintaining privacy.
                  You retain full control over your content and how it's used.
                </p>
              </div>
              
              <div className="flex justify-between">
                <button
                  onClick={() => navigate('/preprocess')}
                  className="px-6 py-2 text-muted-foreground hover:text-foreground transition-colors flex items-center gap-2"
                >
                  <ArrowLeft className="w-4 h-4" /> Back to Preprocessing
                </button>
                
                <button
                  onClick={handleRegisterIP}
                  disabled={isRegistering}
                  className={cn(
                    "px-8 py-3 bg-primary text-white rounded-full font-medium flex items-center gap-2 transition-all",
                    isRegistering
                      ? "opacity-70 cursor-not-allowed"
                      : "hover:bg-primary/90 hover:shadow-lg"
                  )}
                >
                  {isRegistering ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      Registering...
                    </>
                  ) : (
                    <>
                      Register IP <ArrowRight className="w-4 h-4" />
                    </>
                  )}
                </button>
              </div>
            </GlassMorphismCard>
          )}
          
          {/* Already Registered */}
          {selectedDataset && selectedDataset.registered && (
            <GlassMorphismCard className="lg:col-span-2">
              <div className="text-center py-8">
                <div className="w-16 h-16 bg-green-100 dark:bg-green-900/20 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Check className="w-8 h-8 text-green-600 dark:text-green-400" />
                </div>
                <h2 className="text-2xl font-bold mb-2">IP Successfully Registered</h2>
                <p className="text-muted-foreground mb-6 max-w-md mx-auto">
                  Your dataset "{selectedDataset.name}" has been registered and is now protected.
                  You'll earn rewards whenever it's used by organizations.
                </p>
                <button
                  onClick={() => navigate('/dashboard')}
                  className="px-8 py-3 bg-primary text-white rounded-full font-medium inline-flex items-center gap-2 hover:bg-primary/90 transition-all"
                >
                  Return to Dashboard <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </GlassMorphismCard>
          )}
        </div>
      </div>
    </div>
  );
};

export default Register;
