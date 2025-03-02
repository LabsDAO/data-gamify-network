// Story Protocol Configuration
// This file contains configuration for Story Protocol integration

// Story Protocol contract addresses on Base Sepolia testnet
export const STORY_PROTOCOL_CONTRACTS = {
  // IP Asset Registry contract address
  IP_ASSET_REGISTRY: '0x4F9f87C9232E34fc6695Af7b74d14B3e3AB1A77A',
  // Licensing Module contract address
  LICENSING_MODULE: '0x3C9B5D6Ec9209674C3Cbc72BD93598B953E7187c',
  // IP Resolver contract address
  IP_RESOLVER: '0x1A1BB3D4D5A42A8519e87F8F7A3E9D4D86B09D8D',
};

// Supported chains for Story Protocol
export const SUPPORTED_CHAINS = [
  {
    id: 84532, // Base Sepolia testnet
    name: 'Base Sepolia',
    network: 'base-sepolia',
    rpcUrls: {
      default: {
        http: ['https://sepolia.base.org'],
      },
      public: {
        http: ['https://sepolia.base.org'],
      },
    },
    blockExplorers: {
      default: {
        name: 'BaseScan',
        url: 'https://sepolia.basescan.org',
      },
    },
    testnet: true,
  },
];

// License terms templates
export const LICENSE_TEMPLATES = [
  {
    id: 'ai-training',
    name: 'AI Training License',
    description: 'License for using data in AI model training',
    terms: {
      commercialUse: true,
      attribution: true,
      derivativeWorks: true,
      revocable: false,
      exclusivity: false,
      territory: 'Worldwide',
      duration: 'Perpetual',
      royaltyPercentage: 2.5,
    },
  },
  {
    id: 'research-only',
    name: 'Research Only License',
    description: 'License for academic and research purposes only',
    terms: {
      commercialUse: false,
      attribution: true,
      derivativeWorks: true,
      revocable: true,
      exclusivity: false,
      territory: 'Worldwide',
      duration: '1 year',
      royaltyPercentage: 0,
    },
  },
  {
    id: 'commercial',
    name: 'Commercial License',
    description: 'Full commercial license for all use cases',
    terms: {
      commercialUse: true,
      attribution: true,
      derivativeWorks: true,
      revocable: false,
      exclusivity: false,
      territory: 'Worldwide',
      duration: 'Perpetual',
      royaltyPercentage: 5,
    },
  },
];

// Points awarded for IP registration and licensing
export const IP_POINTS_CONFIG = {
  REGISTER_IP: 5,        // Points for registering IP
  CREATE_LICENSE: 3,     // Points for creating a license
  LICENSE_PURCHASED: 10, // Points when someone purchases your license
};

// Default metadata for IP registration
export const DEFAULT_IP_METADATA = {
  name: '',
  description: '',
  externalURL: '',
  image: '',
  mediaType: '',
  tags: [],
  attributes: [],
};