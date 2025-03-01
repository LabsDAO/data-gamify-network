export interface AIAgent {
  id: string;
  name: string;
  description: string;
  category: AgentCategory;
  capabilities: string[];
  useCases: string[];
  pricing: {
    hourly: number;
    monthly?: number;
  };
  rating: number;
  reviewCount: number;
  imageUrl: string;
  featured?: boolean;
  tags: string[];
  integrations?: string[];
}

export type AgentCategory = 
  | 'voice'
  | 'health'
  | 'vision'
  | 'multimodal'
  | 'data'
  | 'creative'
  | 'business'
  | 'education'
  | 'customer-service';

export interface AgentFilter {
  category?: AgentCategory | 'all';
  priceRange?: [number, number];
  rating?: number;
  searchTerm?: string;
  tags?: string[];
}

export interface HiredAgent extends AIAgent {
  hiredDate: string;
  expiryDate: string;
  status: 'active' | 'expired' | 'pending';
  usageHours?: number;
  tasks?: AgentTask[];
}

export interface AgentTask {
  id: string;
  title: string;
  description: string;
  status: 'pending' | 'in-progress' | 'completed' | 'failed';
  createdAt: string;
  completedAt?: string;
  result?: string;
}