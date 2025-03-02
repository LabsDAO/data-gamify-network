import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Shield, 
  FileText, 
  Plus, 
  Loader2, 
  RefreshCw,
  BookOpen
} from 'lucide-react';
import { useStoryProtocol } from '@/hooks/use-story-protocol';
import { IPAsset, License } from '@/types/storyProtocol';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import RegisterIPForm from '@/components/ip/RegisterIPForm';
import LicenseForm from '@/components/ip/LicenseForm';
import IPAssetCard from '@/components/ip/IPAssetCard';
import { toast } from '@/hooks/use-toast';

const IPManagement = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { 
    ipAssets, 
    licensesAsLicensor, 
    licensesAsLicensee, 
    ipPoints,
    loading, 
    error, 
    refreshData 
  } = useStoryProtocol();
  
  const [registerDialogOpen, setRegisterDialogOpen] = useState(false);
  const [licenseDialogOpen, setLicenseDialogOpen] = useState(false);
  const [selectedIPAsset, setSelectedIPAsset] = useState<IPAsset | null>(null);
  const [refreshing, setRefreshing] = useState(false);

  // Redirect to home if not authenticated
  if (!user) {
    navigate('/');
    return null;
  }

  // Handle refresh button click
  const handleRefresh = async () => {
    setRefreshing(true);
    await refreshData();
    setRefreshing(false);
    
    toast({
      title: 'Data Refreshed',
      description: 'Your IP assets and licenses have been refreshed.',
    });
  };

  // Handle create license button click
  const handleCreateLicense = (ipAsset: IPAsset) => {
    setSelectedIPAsset(ipAsset);
    setLicenseDialogOpen(true);
  };

  // Handle purchase license button click
  const handlePurchaseLicense = (license: License) => {
    // In a real implementation, this would open a dialog to confirm purchase
    toast({
      title: 'Purchase License',
      description: 'License purchase functionality will be implemented soon.',
    });
  };

  // Handle register IP success
  const handleRegisterSuccess = (ipAssetId: string) => {
    setRegisterDialogOpen(false);
    refreshData();
    
    toast({
      title: 'IP Registration Successful',
      description: 'Your intellectual property has been registered successfully.',
    });
  };

  // Handle create license success
  const handleLicenseSuccess = (licenseId: string) => {
    setLicenseDialogOpen(false);
    refreshData();
    
    toast({
      title: 'License Created',
      description: 'Your license has been created successfully.',
    });
  };

  return (
    <div className="min-h-screen pt-24 pb-16 px-6">
      <div className="container mx-auto animate-fade-in">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-8 gap-4">
          <div>
            <h1 className="text-3xl font-bold flex items-center gap-2">
              <Shield className="h-8 w-8 text-primary" />
              IP Management
            </h1>
            <p className="text-muted-foreground mt-1">
              Register, license, and monetize your intellectual property
            </p>
          </div>
          
          <div className="flex items-center gap-3">
            <div className="bg-secondary/30 px-4 py-2 rounded-lg flex items-center gap-2">
              <BookOpen className="h-5 w-5 text-primary" />
              <span className="font-medium">{ipPoints} IP Points</span>
            </div>
            
            <Button 
              variant="outline" 
              size="sm"
              onClick={handleRefresh}
              disabled={refreshing}
            >
              {refreshing ? (
                <Loader2 className="h-4 w-4 animate-spin mr-2" />
              ) : (
                <RefreshCw className="h-4 w-4 mr-2" />
              )}
              Refresh
            </Button>
            
            <Dialog open={registerDialogOpen} onOpenChange={setRegisterDialogOpen}>
              <DialogTrigger asChild>
                <Button>
                  <Plus className="h-4 w-4 mr-2" />
                  Register IP
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-3xl">
                <DialogHeader>
                  <DialogTitle>Register Intellectual Property</DialogTitle>
                  <DialogDescription>
                    Register your data as intellectual property on the blockchain to protect your rights and enable monetization.
                  </DialogDescription>
                </DialogHeader>
                <RegisterIPForm onSuccess={handleRegisterSuccess} />
              </DialogContent>
            </Dialog>
          </div>
        </div>
        
        {error && (
          <div className="bg-destructive/10 text-destructive p-4 rounded-lg mb-6">
            <p className="font-medium">Error loading data</p>
            <p className="text-sm">{error}</p>
          </div>
        )}
        
        <Tabs defaultValue="my-ip">
          <TabsList className="mb-6">
            <TabsTrigger value="my-ip" className="flex items-center gap-2">
              <Shield className="h-4 w-4" />
              My IP Assets
            </TabsTrigger>
            <TabsTrigger value="my-licenses" className="flex items-center gap-2">
              <FileText className="h-4 w-4" />
              My Licenses
            </TabsTrigger>
            <TabsTrigger value="marketplace" className="flex items-center gap-2">
              <BookOpen className="h-4 w-4" />
              IP Marketplace
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="my-ip">
            {loading ? (
              <div className="flex justify-center items-center py-12">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
              </div>
            ) : ipAssets.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {ipAssets.map((ipAsset) => (
                  <IPAssetCard 
                    key={ipAsset.id} 
                    ipAsset={ipAsset} 
                    onCreateLicense={handleCreateLicense}
                    isOwner={true}
                  />
                ))}
              </div>
            ) : (
              <div className="text-center py-12 bg-secondary/20 rounded-lg">
                <Shield className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                <h3 className="text-xl font-medium mb-2">No IP Assets Yet</h3>
                <p className="text-muted-foreground max-w-md mx-auto mb-6">
                  Register your first intellectual property to start monetizing your data.
                </p>
                <Dialog open={registerDialogOpen} onOpenChange={setRegisterDialogOpen}>
                  <DialogTrigger asChild>
                    <Button>
                      <Plus className="h-4 w-4 mr-2" />
                      Register IP
                    </Button>
                  </DialogTrigger>
                </Dialog>
              </div>
            )}
          </TabsContent>
          
          <TabsContent value="my-licenses">
            <div className="space-y-8">
              <div>
                <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
                  <FileText className="h-5 w-5 text-primary" />
                  Licenses I Created
                </h2>
                
                {loading ? (
                  <div className="flex justify-center items-center py-12">
                    <Loader2 className="h-8 w-8 animate-spin text-primary" />
                  </div>
                ) : licensesAsLicensor.length > 0 ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {/* In a real implementation, we would display license cards here */}
                    <div className="border rounded-lg p-6 bg-secondary/10">
                      <p className="text-center text-muted-foreground">
                        License display coming soon
                      </p>
                    </div>
                  </div>
                ) : (
                  <div className="text-center py-8 bg-secondary/20 rounded-lg">
                    <FileText className="h-10 w-10 mx-auto text-muted-foreground mb-3" />
                    <h3 className="text-lg font-medium mb-2">No Licenses Created</h3>
                    <p className="text-muted-foreground max-w-md mx-auto mb-4">
                      Create licenses for your IP assets to allow others to use your data.
                    </p>
                  </div>
                )}
              </div>
              
              <div>
                <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
                  <FileText className="h-5 w-5 text-primary" />
                  Licenses I Purchased
                </h2>
                
                {loading ? (
                  <div className="flex justify-center items-center py-12">
                    <Loader2 className="h-8 w-8 animate-spin text-primary" />
                  </div>
                ) : licensesAsLicensee.length > 0 ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {/* In a real implementation, we would display license cards here */}
                    <div className="border rounded-lg p-6 bg-secondary/10">
                      <p className="text-center text-muted-foreground">
                        License display coming soon
                      </p>
                    </div>
                  </div>
                ) : (
                  <div className="text-center py-8 bg-secondary/20 rounded-lg">
                    <FileText className="h-10 w-10 mx-auto text-muted-foreground mb-3" />
                    <h3 className="text-lg font-medium mb-2">No Licenses Purchased</h3>
                    <p className="text-muted-foreground max-w-md mx-auto mb-4">
                      Purchase licenses to use data from other creators.
                    </p>
                  </div>
                )}
              </div>
            </div>
          </TabsContent>
          
          <TabsContent value="marketplace">
            <div className="text-center py-12 bg-secondary/20 rounded-lg">
              <BookOpen className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
              <h3 className="text-xl font-medium mb-2">IP Marketplace Coming Soon</h3>
              <p className="text-muted-foreground max-w-md mx-auto mb-6">
                Browse and purchase licenses for datasets from other creators.
              </p>
            </div>
          </TabsContent>
        </Tabs>
      </div>
      
      {/* License creation dialog */}
      <Dialog open={licenseDialogOpen} onOpenChange={setLicenseDialogOpen}>
        <DialogContent className="max-w-3xl">
          <DialogHeader>
            <DialogTitle>Create License</DialogTitle>
            <DialogDescription>
              Create a license for your intellectual property to define how others can use your data.
            </DialogDescription>
          </DialogHeader>
          {selectedIPAsset && (
            <LicenseForm 
              ipAsset={selectedIPAsset} 
              onSuccess={handleLicenseSuccess} 
            />
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default IPManagement;