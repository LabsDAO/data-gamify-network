// Types for Story Protocol integration

// IP Asset type
export interface IPAsset {
  id: string;
  name: string;
  description: string;
  owner: string;
  mediaUrl: string;
  mediaType: string;
  registrationDate: string;
  licenses: License[];
  metadata: IPMetadata;
}

// License type
export interface License {
  id: string;
  ipAssetId: string;
  licensorAddress: string;
  licenseeAddress?: string;
  terms: LicenseTerms;
  status: LicenseStatus;
  creationDate: string;
  expirationDate?: string;
  price: string;
  currency: string;
}

// License terms
export interface LicenseTerms {
  commercialUse: boolean;
  attribution: boolean;
  derivativeWorks: boolean;
  revocable: boolean;
  exclusivity: boolean;
  territory: string;
  duration: string;
  royaltyPercentage: number;
  customTerms?: string;
}

// License status
export type LicenseStatus = 'active' | 'expired' | 'revoked' | 'draft';

// IP Metadata
export interface IPMetadata {
  name: string;
  description: string;
  externalURL?: string;
  image?: string;
  mediaType?: string;
  tags?: string[];
  attributes?: {
    trait_type: string;
    value: string | number;
  }[];
}

// Dataset type
export interface Dataset {
  id: string;
  name: string;
  description: string;
  owner: string;
  size: number;
  fileCount: number;
  dataType: DatasetType;
  ipAssetId?: string;
  creationDate: string;
  isPublished: boolean;
  previewUrl?: string;
  licenses?: License[];
}

// Dataset types
export type DatasetType = 'image' | 'audio' | 'video' | 'text' | 'mixed';

// License template
export interface LicenseTemplate {
  id: string;
  name: string;
  description: string;
  terms: LicenseTerms;
}

// Transaction status
export type TransactionStatus = 'pending' | 'success' | 'failed';

// Transaction response
export interface TransactionResponse {
  status: TransactionStatus;
  hash?: string;
  error?: string;
}

// IP Registration params
export interface IPRegistrationParams {
  name: string;
  description: string;
  mediaUrl: string;
  mediaType: string;
  metadata: IPMetadata;
}

// License creation params
export interface LicenseCreationParams {
  ipAssetId: string;
  terms: LicenseTerms;
  price: string;
  currency: string;
  duration?: string;
}

// License purchase params
export interface LicensePurchaseParams {
  licenseId: string;
  price: string;
  currency: string;
}