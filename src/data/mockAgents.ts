import { AIAgent } from '@/types/agent';

export const mockAgents: AIAgent[] = [
  {
    id: 'voice-real-estate',
    name: 'PropertyVoice AI',
    description: 'An advanced voice AI assistant specialized in real estate that can handle property inquiries, schedule viewings, and provide detailed information about listings.',
    category: 'voice',
    capabilities: [
      'Natural conversation about properties',
      'Scheduling viewings and appointments',
      'Property feature comparison',
      'Neighborhood information',
      'Price negotiation assistance'
    ],
    useCases: [
      'Virtual property tours',
      'Real-time property Q&A',
      'Automated follow-ups with clients',
      'Market trend analysis'
    ],
    pricing: {
      hourly: 15,
      monthly: 299
    },
    rating: 4.8,
    reviewCount: 124,
    imageUrl: 'https://images.unsplash.com/photo-1560518883-ce09059eeffa?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxzZWFyY2h8MXx8cmVhbCUyMGVzdGF0ZXxlbnwwfHwwfHw%3D&auto=format&fit=crop&w=800&q=60',
    featured: true,
    tags: ['real estate', 'voice assistant', 'property', 'sales']
  },
  {
    id: 'health-coach',
    name: 'WellnessCoach AI',
    description: 'A personalized health coach that provides nutrition advice, workout plans, and mental wellness strategies tailored to your specific health goals.',
    category: 'health',
    capabilities: [
      'Personalized nutrition planning',
      'Workout routine creation',
      'Progress tracking',
      'Mental wellness exercises',
      'Sleep optimization'
    ],
    useCases: [
      'Weight management',
      'Fitness improvement',
      'Stress reduction',
      'Chronic condition management'
    ],
    pricing: {
      hourly: 12,
      monthly: 249
    },
    rating: 4.7,
    reviewCount: 208,
    imageUrl: 'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxzZWFyY2h8M3x8aGVhbHRoJTIwY29hY2h8ZW58MHx8MHx8&auto=format&fit=crop&w=800&q=60',
    featured: true,
    tags: ['health', 'wellness', 'fitness', 'nutrition']
  },
  {
    id: 'vision-retail',
    name: 'RetailVision AI',
    description: 'Computer vision system that analyzes in-store customer behavior, optimizes product placement, and provides real-time inventory management.',
    category: 'vision',
    capabilities: [
      'Customer flow analysis',
      'Heat mapping of store traffic',
      'Product interaction tracking',
      'Automated inventory counting',
      'Theft prevention'
    ],
    useCases: [
      'Retail store optimization',
      'Product placement testing',
      'Customer engagement analysis',
      'Inventory management'
    ],
    pricing: {
      hourly: 25,
      monthly: 499
    },
    rating: 4.5,
    reviewCount: 87,
    imageUrl: 'https://images.unsplash.com/photo-1567401893414-76b7b1e5a7a5?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxzZWFyY2h8Mnx8cmV0YWlsfGVufDB8fDB8fA%3D%3D&auto=format&fit=crop&w=800&q=60',
    tags: ['retail', 'computer vision', 'analytics', 'inventory']
  },
  {
    id: 'multimodal-design',
    name: 'DesignGenius AI',
    description: 'A multimodal AI that combines visual, textual, and interactive capabilities to assist with product design, UI/UX creation, and creative direction.',
    category: 'multimodal',
    capabilities: [
      'Visual design generation',
      'UI/UX prototyping',
      'Design feedback analysis',
      'Brand consistency checking',
      'Accessibility evaluation'
    ],
    useCases: [
      'Product design iteration',
      'Marketing material creation',
      'Website and app design',
      'Brand identity development'
    ],
    pricing: {
      hourly: 30,
      monthly: 599
    },
    rating: 4.9,
    reviewCount: 156,
    imageUrl: 'https://images.unsplash.com/photo-1561070791-2526d30994b5?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxzZWFyY2h8M3x8ZGVzaWdufGVufDB8fDB8fA%3D%3D&auto=format&fit=crop&w=800&q=60',
    featured: true,
    tags: ['design', 'creative', 'UI/UX', 'multimodal']
  },
  {
    id: 'data-finance',
    name: 'FinanceAnalyst AI',
    description: 'Advanced data analysis AI specialized in financial modeling, market prediction, and investment strategy optimization.',
    category: 'data',
    capabilities: [
      'Financial data analysis',
      'Market trend prediction',
      'Investment portfolio optimization',
      'Risk assessment',
      'Anomaly detection'
    ],
    useCases: [
      'Investment strategy development',
      'Financial reporting automation',
      'Market research',
      'Fraud detection'
    ],
    pricing: {
      hourly: 40,
      monthly: 799
    },
    rating: 4.6,
    reviewCount: 92,
    imageUrl: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxzZWFyY2h8M3x8ZmluYW5jZXxlbnwwfHwwfHw%3D&auto=format&fit=crop&w=800&q=60',
    tags: ['finance', 'data analysis', 'investment', 'prediction']
  },
  {
    id: 'voice-customer-service',
    name: 'CustomerCare AI',
    description: 'Voice AI system that handles customer service inquiries, resolves common issues, and escalates complex problems to human agents when necessary.',
    category: 'voice',
    capabilities: [
      'Natural language understanding',
      'Issue classification and resolution',
      'Sentiment analysis',
      'Multi-language support',
      'Seamless human handoff'
    ],
    useCases: [
      '24/7 customer support',
      'High volume inquiry handling',
      'Customer satisfaction improvement',
      'Support team augmentation'
    ],
    pricing: {
      hourly: 18,
      monthly: 349
    },
    rating: 4.4,
    reviewCount: 215,
    imageUrl: 'https://images.unsplash.com/photo-1549923746-c502d488b3ea?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxzZWFyY2h8Mnx8Y3VzdG9tZXIlMjBzZXJ2aWNlfGVufDB8fDB8fA%3D%3D&auto=format&fit=crop&w=800&q=60',
    tags: ['customer service', 'voice assistant', 'support', 'multilingual']
  },
  {
    id: 'vision-manufacturing',
    name: 'QualityInspect AI',
    description: 'Computer vision system for manufacturing quality control that detects defects, ensures compliance with specifications, and optimizes production processes.',
    category: 'vision',
    capabilities: [
      'Defect detection and classification',
      'Dimensional verification',
      'Assembly verification',
      'Production line monitoring',
      'Quality trend analysis'
    ],
    useCases: [
      'Manufacturing quality control',
      'Production line optimization',
      'Compliance verification',
      'Waste reduction'
    ],
    pricing: {
      hourly: 35,
      monthly: 699
    },
    rating: 4.7,
    reviewCount: 78,
    imageUrl: 'https://images.unsplash.com/photo-1581093458791-9d2b0e3b1b0f?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxzZWFyY2h8M3x8bWFudWZhY3R1cmluZ3xlbnwwfHwwfHw%3D&auto=format&fit=crop&w=800&q=60',
    tags: ['manufacturing', 'quality control', 'computer vision', 'production']
  },
  {
    id: 'multimodal-education',
    name: 'TutorGenius AI',
    description: 'Personalized education assistant that combines text, voice, and visual learning methods to adapt to individual learning styles and needs.',
    category: 'multimodal',
    capabilities: [
      'Personalized curriculum creation',
      'Multi-format content delivery',
      'Progress assessment',
      'Learning style adaptation',
      'Interactive problem solving'
    ],
    useCases: [
      'K-12 education support',
      'College-level tutoring',
      'Professional skill development',
      'Special education assistance'
    ],
    pricing: {
      hourly: 20,
      monthly: 399
    },
    rating: 4.8,
    reviewCount: 183,
    imageUrl: 'https://images.unsplash.com/photo-1503676260728-1c00da094a0b?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxzZWFyY2h8M3x8ZWR1Y2F0aW9ufGVufDB8fDB8fA%3D%3D&auto=format&fit=crop&w=800&q=60',
    tags: ['education', 'tutoring', 'learning', 'multimodal']
  },
  {
    id: 'health-mental-wellness',
    name: 'MindfulnessCoach AI',
    description: 'Mental health assistant that provides therapy-informed conversations, mood tracking, and personalized mindfulness exercises.',
    category: 'health',
    capabilities: [
      'Cognitive behavioral therapy techniques',
      'Mood and anxiety tracking',
      'Guided meditation sessions',
      'Sleep improvement strategies',
      'Stress management tools'
    ],
    useCases: [
      'Daily mental wellness maintenance',
      'Anxiety and stress reduction',
      'Depression management support',
      'Mindfulness practice'
    ],
    pricing: {
      hourly: 22,
      monthly: 449
    },
    rating: 4.9,
    reviewCount: 201,
    imageUrl: 'https://images.unsplash.com/photo-1506126613408-eca07ce68773?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxzZWFyY2h8M3x8bWVudGFsJTIwaGVhbHRofGVufDB8fDB8fA%3D%3D&auto=format&fit=crop&w=800&q=60',
    tags: ['mental health', 'wellness', 'mindfulness', 'therapy']
  },
  {
    id: 'data-marketing',
    name: 'MarketingOptimizer AI',
    description: 'Data-driven marketing assistant that analyzes campaign performance, predicts customer behavior, and optimizes marketing strategies across channels.',
    category: 'data',
    capabilities: [
      'Campaign performance analysis',
      'Customer segmentation',
      'A/B test design and analysis',
      'ROI prediction',
      'Cross-channel optimization'
    ],
    useCases: [
      'Digital marketing optimization',
      'Customer journey mapping',
      'Content strategy development',
      'Marketing budget allocation'
    ],
    pricing: {
      hourly: 28,
      monthly: 549
    },
    rating: 4.5,
    reviewCount: 112,
    imageUrl: 'https://images.unsplash.com/photo-1533750349088-cd871a92f312?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxzZWFyY2h8M3x8bWFya2V0aW5nfGVufDB8fDB8fA%3D%3D&auto=format&fit=crop&w=800&q=60',
    tags: ['marketing', 'analytics', 'optimization', 'campaigns']
  }
];

export const getAgentById = (id: string): AIAgent | undefined => {
  return mockAgents.find(agent => agent.id === id);
};

export const getFeaturedAgents = (): AIAgent[] => {
  return mockAgents.filter(agent => agent.featured);
};

export const getAgentsByCategory = (category: string): AIAgent[] => {
  if (category === 'all') return mockAgents;
  return mockAgents.filter(agent => agent.category === category);
};