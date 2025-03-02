import { ethers } from 'ethers';
import { STORY_PROTOCOL_CONTRACTS } from './storyProtocolConfig';
import { 
  IPAsset, 
  License, 
  IPRegistrationParams, 
  LicenseCreationParams, 
  LicensePurchaseParams,
  TransactionResponse
} from '@/types/storyProtocol';
import { supabase, isSupabaseConfigured } from './supabaseClient';
import { IP_POINTS_CONFIG } from './storyProtocolConfig';

// ABI for IP Asset Registry (simplified for demo)
const IP_ASSET_REGISTRY_ABI = [
  "function registerIpAsset(address owner, string memory tokenURI) external returns (uint256)",
  "function getIpAsset(uint256 ipAssetId) external view returns (address, string memory)",
  "event IpAssetRegistered(uint256 indexed ipAssetId, address indexed owner, string tokenURI)"
];

// ABI for Licensing Module (simplified for demo)
const LICENSING_MODULE_ABI = [
  "function createLicense(uint256 ipAssetId, string memory licenseURI, uint256 price) external returns (uint256)",
  "function purchaseLicense(uint256 licenseId) external payable",
  "function getLicense(uint256 licenseId) external view returns (uint256, address, address, string memory, uint256, bool)",
  "event LicenseCreated(uint256 indexed licenseId, uint256 indexed ipAssetId, address indexed licensor, string licenseURI, uint256 price)",
  "event LicensePurchased(uint256 indexed licenseId, address indexed licensee, uint256 price)"
];

/**
 * Initialize ethers provider and signer
 */
const getProviderAndSigner = async () => {
  // Check if window.ethereum is available (MetaMask or other wallet)
  if (window.ethereum) {
    try {
      // Request account access
      await window.ethereum.request({ method: 'eth_requestAccounts' });
      
      // Create provider and signer
      const provider = new ethers.BrowserProvider(window.ethereum);
      const signer = await provider.getSigner();
      return { provider, signer };
    } catch (error) {
      console.error('Error connecting to wallet:', error);
      throw new Error('Failed to connect to wallet. Please make sure your wallet is unlocked and connected.');
    }
  } else {
    throw new Error('No Ethereum wallet detected. Please install MetaMask or another compatible wallet.');
  }
};

/**
 * Register an IP asset on Story Protocol
 */
export const registerIPAsset = async (params: IPRegistrationParams, userId: string): Promise<TransactionResponse> => {
  try {
    const { signer } = await getProviderAndSigner();
    
    // Create contract instance
    const ipAssetRegistry = new ethers.Contract(
      STORY_PROTOCOL_CONTRACTS.IP_ASSET_REGISTRY,
      IP_ASSET_REGISTRY_ABI,
      signer
    );
    
    // Prepare metadata URI (in a real implementation, this would be stored on IPFS)
    const metadataURI = `ipfs://metadata/${Date.now()}`;
    
    // Register IP asset
    const tx = await ipAssetRegistry.registerIpAsset(await signer.getAddress(), metadataURI);
    
    // Wait for transaction to be mined
    const receipt = await tx.wait();
    
    // Extract IP asset ID from event logs (simplified)
    const ipAssetId = `ip-${Date.now()}`;
    
    // Store IP asset in Supabase
    if (isSupabaseConfigured()) {
      const ipAsset = {
        id: ipAssetId,
        user_id: userId,
        name: params.name,
        description: params.description,
        media_url: params.mediaUrl,
        media_type: params.mediaType,
        tx_hash: receipt.hash,
        created_at: new Date().toISOString(),
        metadata: params.metadata
      };
      
      await supabase.from('ip_assets').insert(ipAsset);
      
      // Award points for IP registration
      await awardPointsForIPAction(userId, 'register_ip', IP_POINTS_CONFIG.REGISTER_IP);
    }
    
    return {
      status: 'success',
      hash: receipt.hash
    };
  } catch (error) {
    console.error('Error registering IP asset:', error);
    return {
      status: 'failed',
      error: error instanceof Error ? error.message : 'Unknown error'
    };
  }
};

/**
 * Create a license for an IP asset
 */
export const createLicense = async (params: LicenseCreationParams, userId: string): Promise<TransactionResponse> => {
  try {
    const { signer } = await getProviderAndSigner();
    
    // Create contract instance
    const licensingModule = new ethers.Contract(
      STORY_PROTOCOL_CONTRACTS.LICENSING_MODULE,
      LICENSING_MODULE_ABI,
      signer
    );
    
    // Prepare license URI (in a real implementation, this would be stored on IPFS)
    const licenseURI = `ipfs://license/${Date.now()}`;
    
    // Convert price to wei
    const priceInWei = ethers.parseEther(params.price);
    
    // Create license
    const tx = await licensingModule.createLicense(params.ipAssetId, licenseURI, priceInWei);
    
    // Wait for transaction to be mined
    const receipt = await tx.wait();
    
    // Extract license ID from event logs (simplified)
    const licenseId = `license-${Date.now()}`;
    
    // Store license in Supabase
    if (isSupabaseConfigured()) {
      const license = {
        id: licenseId,
        ip_asset_id: params.ipAssetId,
        licensor_id: userId,
        terms: params.terms,
        price: params.price,
        currency: params.currency,
        status: 'active',
        tx_hash: receipt.hash,
        created_at: new Date().toISOString()
      };
      
      await supabase.from('licenses').insert(license);
      
      // Award points for license creation
      await awardPointsForIPAction(userId, 'create_license', IP_POINTS_CONFIG.CREATE_LICENSE);
    }
    
    return {
      status: 'success',
      hash: receipt.hash
    };
  } catch (error) {
    console.error('Error creating license:', error);
    return {
      status: 'failed',
      error: error instanceof Error ? error.message : 'Unknown error'
    };
  }
};

/**
 * Purchase a license
 */
export const purchaseLicense = async (params: LicensePurchaseParams, userId: string): Promise<TransactionResponse> => {
  try {
    const { signer } = await getProviderAndSigner();
    
    // Create contract instance
    const licensingModule = new ethers.Contract(
      STORY_PROTOCOL_CONTRACTS.LICENSING_MODULE,
      LICENSING_MODULE_ABI,
      signer
    );
    
    // Convert price to wei
    const priceInWei = ethers.parseEther(params.price);
    
    // Purchase license
    const tx = await licensingModule.purchaseLicense(params.licenseId, { value: priceInWei });
    
    // Wait for transaction to be mined
    const receipt = await tx.wait();
    
    // Update license in Supabase
    if (isSupabaseConfigured()) {
      // Get license details
      const { data: licenseData } = await supabase
        .from('licenses')
        .select('*, ip_assets(user_id)')
        .eq('id', params.licenseId)
        .single();
      
      if (licenseData) {
        // Update license with licensee
        await supabase
          .from('licenses')
          .update({
            licensee_id: userId,
            purchase_tx_hash: receipt.hash,
            purchased_at: new Date().toISOString()
          })
          .eq('id', params.licenseId);
        
        // Award points to the licensor when their license is purchased
        const licensorId = licenseData.ip_assets?.user_id;
        if (licensorId) {
          await awardPointsForIPAction(licensorId, 'license_purchased', IP_POINTS_CONFIG.LICENSE_PURCHASED);
        }
      }
    }
    
    return {
      status: 'success',
      hash: receipt.hash
    };
  } catch (error) {
    console.error('Error purchasing license:', error);
    return {
      status: 'failed',
      error: error instanceof Error ? error.message : 'Unknown error'
    };
  }
};

/**
 * Get all IP assets for a user
 */
export const getUserIPAssets = async (userId: string): Promise<IPAsset[]> => {
  if (!isSupabaseConfigured()) {
    return [];
  }
  
  try {
    const { data, error } = await supabase
      .from('ip_assets')
      .select('*, licenses(*)')
      .eq('user_id', userId);
    
    if (error) {
      console.error('Error fetching user IP assets:', error);
      return [];
    }
    
    // Transform data to match IPAsset type
    return data.map(item => ({
      id: item.id,
      name: item.name,
      description: item.description,
      owner: item.user_id,
      mediaUrl: item.media_url,
      mediaType: item.media_type,
      registrationDate: item.created_at,
      licenses: item.licenses || [],
      metadata: item.metadata || {}
    }));
  } catch (error) {
    console.error('Error fetching user IP assets:', error);
    return [];
  }
};

/**
 * Get all licenses for a user (as licensor)
 */
export const getUserLicensesAsLicensor = async (userId: string): Promise<License[]> => {
  if (!isSupabaseConfigured()) {
    return [];
  }
  
  try {
    const { data, error } = await supabase
      .from('licenses')
      .select('*')
      .eq('licensor_id', userId);
    
    if (error) {
      console.error('Error fetching user licenses as licensor:', error);
      return [];
    }
    
    // Transform data to match License type
    return data.map(item => ({
      id: item.id,
      ipAssetId: item.ip_asset_id,
      licensorAddress: item.licensor_id,
      licenseeAddress: item.licensee_id,
      terms: item.terms,
      status: item.status,
      creationDate: item.created_at,
      expirationDate: item.expiration_date,
      price: item.price,
      currency: item.currency
    }));
  } catch (error) {
    console.error('Error fetching user licenses as licensor:', error);
    return [];
  }
};

/**
 * Get all licenses for a user (as licensee)
 */
export const getUserLicensesAsLicensee = async (userId: string): Promise<License[]> => {
  if (!isSupabaseConfigured()) {
    return [];
  }
  
  try {
    const { data, error } = await supabase
      .from('licenses')
      .select('*')
      .eq('licensee_id', userId);
    
    if (error) {
      console.error('Error fetching user licenses as licensee:', error);
      return [];
    }
    
    // Transform data to match License type
    return data.map(item => ({
      id: item.id,
      ipAssetId: item.ip_asset_id,
      licensorAddress: item.licensor_id,
      licenseeAddress: item.licensee_id,
      terms: item.terms,
      status: item.status,
      creationDate: item.created_at,
      expirationDate: item.expiration_date,
      price: item.price,
      currency: item.currency
    }));
  } catch (error) {
    console.error('Error fetching user licenses as licensee:', error);
    return [];
  }
};

/**
 * Award points for IP-related actions
 */
export const awardPointsForIPAction = async (
  userId: string,
  actionType: 'register_ip' | 'create_license' | 'license_purchased',
  points: number
): Promise<void> => {
  if (!isSupabaseConfigured()) {
    console.warn('Supabase not configured, skipping points award');
    return;
  }
  
  try {
    // Record the action and points
    await supabase.from('user_points').insert({
      user_id: userId,
      action_type: actionType,
      points: points,
      created_at: new Date().toISOString()
    });
    
    console.log(`Awarded ${points} points to user ${userId} for ${actionType}`);
  } catch (error) {
    console.error('Error awarding points:', error);
  }
};

/**
 * Get total points earned from IP actions
 */
export const getIPActionPoints = async (userId: string): Promise<number> => {
  if (!isSupabaseConfigured()) {
    return 0;
  }
  
  try {
    const { data, error } = await supabase
      .from('user_points')
      .select('points')
      .eq('user_id', userId);
    
    if (error) {
      console.error('Error fetching IP action points:', error);
      return 0;
    }
    
    // Sum up all points
    return data.reduce((total, record) => total + (record.points || 0), 0);
  } catch (error) {
    console.error('Error fetching IP action points:', error);
    return 0;
  }
};