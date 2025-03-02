import { useState, useEffect, useCallback } from 'react';
import { useAuth } from './useAuth';
import { 
  registerIPAsset, 
  createLicense, 
  purchaseLicense,
  getUserIPAssets,
  getUserLicensesAsLicensor,
  getUserLicensesAsLicensee,
  getIPActionPoints
} from '@/utils/storyProtocolService';
import { 
  IPAsset, 
  License, 
  IPRegistrationParams, 
  LicenseCreationParams, 
  LicensePurchaseParams,
  TransactionResponse
} from '@/types/storyProtocol';
import { toast } from './use-toast';

export const useStoryProtocol = () => {
  const { user } = useAuth();
  const [ipAssets, setIpAssets] = useState<IPAsset[]>([]);
  const [licensesAsLicensor, setLicensesAsLicensor] = useState<License[]>([]);
  const [licensesAsLicensee, setLicensesAsLicensee] = useState<License[]>([]);
  const [ipPoints, setIpPoints] = useState<number>(0);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  // Load user's IP assets and licenses
  const loadUserData = useCallback(async () => {
    if (!user?.id) return;
    
    setLoading(true);
    setError(null);
    
    try {
      // Load IP assets
      const assets = await getUserIPAssets(user.id);
      setIpAssets(assets);
      
      // Load licenses as licensor
      const licensorLicenses = await getUserLicensesAsLicensor(user.id);
      setLicensesAsLicensor(licensorLicenses);
      
      // Load licenses as licensee
      const licenseeLicenses = await getUserLicensesAsLicensee(user.id);
      setLicensesAsLicensee(licenseeLicenses);
      
      // Load IP points
      const points = await getIPActionPoints(user.id);
      setIpPoints(points);
    } catch (err) {
      setError('Failed to load user data');
      console.error('Error loading user data:', err);
    } finally {
      setLoading(false);
    }
  }, [user?.id]);

  // Load data on mount and when user changes
  useEffect(() => {
    if (user?.id) {
      loadUserData();
    } else {
      // Reset state when user is not logged in
      setIpAssets([]);
      setLicensesAsLicensor([]);
      setLicensesAsLicensee([]);
      setIpPoints(0);
    }
  }, [user?.id, loadUserData]);

  // Register a new IP asset
  const registerIP = async (params: IPRegistrationParams): Promise<TransactionResponse> => {
    if (!user?.id) {
      toast({
        title: "Authentication Required",
        description: "Please sign in to register IP assets.",
        variant: "destructive"
      });
      return { status: 'failed', error: 'Authentication required' };
    }
    
    setLoading(true);
    setError(null);
    
    try {
      const response = await registerIPAsset(params, user.id);
      
      if (response.status === 'success') {
        toast({
          title: "IP Registration Successful",
          description: "Your IP asset has been registered successfully.",
          variant: "success"
        });
        
        // Reload user data to get the new IP asset
        await loadUserData();
      } else {
        toast({
          title: "IP Registration Failed",
          description: response.error || "Failed to register IP asset.",
          variant: "destructive"
        });
        setError(response.error || 'Failed to register IP asset');
      }
      
      return response;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error';
      setError(errorMessage);
      toast({
        title: "IP Registration Failed",
        description: errorMessage,
        variant: "destructive"
      });
      return { status: 'failed', error: errorMessage };
    } finally {
      setLoading(false);
    }
  };

  // Create a new license for an IP asset
  const createIPLicense = async (params: LicenseCreationParams): Promise<TransactionResponse> => {
    if (!user?.id) {
      toast({
        title: "Authentication Required",
        description: "Please sign in to create licenses.",
        variant: "destructive"
      });
      return { status: 'failed', error: 'Authentication required' };
    }
    
    setLoading(true);
    setError(null);
    
    try {
      const response = await createLicense(params, user.id);
      
      if (response.status === 'success') {
        toast({
          title: "License Created",
          description: "Your license has been created successfully.",
          variant: "success"
        });
        
        // Reload user data to get the new license
        await loadUserData();
      } else {
        toast({
          title: "License Creation Failed",
          description: response.error || "Failed to create license.",
          variant: "destructive"
        });
        setError(response.error || 'Failed to create license');
      }
      
      return response;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error';
      setError(errorMessage);
      toast({
        title: "License Creation Failed",
        description: errorMessage,
        variant: "destructive"
      });
      return { status: 'failed', error: errorMessage };
    } finally {
      setLoading(false);
    }
  };

  // Purchase a license
  const purchaseIPLicense = async (params: LicensePurchaseParams): Promise<TransactionResponse> => {
    if (!user?.id) {
      toast({
        title: "Authentication Required",
        description: "Please sign in to purchase licenses.",
        variant: "destructive"
      });
      return { status: 'failed', error: 'Authentication required' };
    }
    
    setLoading(true);
    setError(null);
    
    try {
      const response = await purchaseLicense(params, user.id);
      
      if (response.status === 'success') {
        toast({
          title: "License Purchased",
          description: "You have successfully purchased the license.",
          variant: "success"
        });
        
        // Reload user data to get the updated licenses
        await loadUserData();
      } else {
        toast({
          title: "License Purchase Failed",
          description: response.error || "Failed to purchase license.",
          variant: "destructive"
        });
        setError(response.error || 'Failed to purchase license');
      }
      
      return response;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error';
      setError(errorMessage);
      toast({
        title: "License Purchase Failed",
        description: errorMessage,
        variant: "destructive"
      });
      return { status: 'failed', error: errorMessage };
    } finally {
      setLoading(false);
    }
  };

  // Get an IP asset by ID
  const getIPAssetById = (ipAssetId: string): IPAsset | undefined => {
    return ipAssets.find(asset => asset.id === ipAssetId);
  };

  // Get a license by ID
  const getLicenseById = (licenseId: string): License | undefined => {
    // Check in both licensor and licensee licenses
    return [...licensesAsLicensor, ...licensesAsLicensee].find(
      license => license.id === licenseId
    );
  };

  // Refresh user data
  const refreshData = async (): Promise<void> => {
    await loadUserData();
  };

  return {
    // State
    ipAssets,
    licensesAsLicensor,
    licensesAsLicensee,
    ipPoints,
    loading,
    error,
    
    // Actions
    registerIP,
    createIPLicense,
    purchaseIPLicense,
    getIPAssetById,
    getLicenseById,
    refreshData
  };
};