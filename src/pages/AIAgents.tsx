import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { usePrivy } from '@privy-io/react-auth';
import { AIAgent, AgentCategory } from '@/types/agent';
import { mockAgents, getFeaturedAgents } from '@/data/mockAgents';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Search, Star, Filter, Briefcase, Clock } from 'lucide-react';
import GlassMorphismCard from '@/components/ui/GlassMorphismCard';
import { useIsMobile } from '@/hooks/use-mobile';

const categories: { value: AgentCategory | 'all'; label: string }[] = [
  { value: 'all', label: 'All Categories' },
  { value: 'voice', label: 'Voice AI' },
  { value: 'health', label: 'Health & Wellness' },
  { value: 'vision', label: 'Computer Vision' },
  { value: 'multimodal', label: 'Multimodal' },
  { value: 'data', label: 'Data Analysis' },
  { value: 'creative', label: 'Creative' },
  { value: 'business', label: 'Business' },
  { value: 'education', label: 'Education' },
  { value: 'customer-service', label: 'Customer Service' }
];

const AIAgents = () => {
  const navigate = useNavigate();
  const { authenticated, login } = usePrivy();
  const { user } = useAuth();
  const isMobile = useIsMobile();
  
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<AgentCategory | 'all'>('all');
  const [displayedAgents, setDisplayedAgents] = useState<AIAgent[]>(mockAgents);
  const [featuredAgents, setFeaturedAgents] = useState<AIAgent[]>([]);
  
  // Filter agents based on search term and category
  useEffect(() => {
    let filtered = mockAgents;
    
    // Filter by search term
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      filtered = filtered.filter(agent => 
        agent.name.toLowerCase().includes(term) || 
        agent.description.toLowerCase().includes(term) ||
        agent.tags.some(tag => tag.toLowerCase().includes(term))
      );
    }
    
    // Filter by category
    if (selectedCategory !== 'all') {
      filtered = filtered.filter(agent => agent.category === selectedCategory);
    }
    
    setDisplayedAgents(filtered);
  }, [searchTerm, selectedCategory]);
  
  // Load featured agents
  useEffect(() => {
    setFeaturedAgents(getFeaturedAgents());
  }, []);
  
  const handleAgentClick = (agentId: string) => {
    if (!authenticated) {
      login();
      return;
    }
    navigate(`/agents/${agentId}`);
  };
  
  return (
    <div className={`container mx-auto px-4 ${isMobile ? 'pt-20 pb-8' : 'py-16'}`}>
      <div className="flex flex-col md:flex-row justify-between items-center mb-6 gap-4">
        <div>
          <h1 className="text-3xl font-bold">AI Agent Marketplace</h1>
          <p className="text-muted-foreground mt-2">Hire AI agents to help with your tasks</p>
        </div>
        
        {user && (
          <div className="self-center">
            <Button 
              onClick={() => navigate('/my-agents')}
              className="flex items-center gap-2"
            >
              <Briefcase className="w-4 h-4" />
              My Hired Agents
            </Button>
          </div>
        )}
      </div>
      
      {/* Search and filters */}
      <GlassMorphismCard className="mb-8">
        <div className="flex flex-col md:flex-row gap-4 p-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
            <Input
              placeholder="Search AI agents, capabilities, use cases..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
          
          <div className="flex gap-3">
            <div className="flex items-center gap-2">
              <Filter className="w-4 h-4 text-muted-foreground" />
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value as AgentCategory | 'all')}
                className="border rounded-md px-3 py-2 text-sm bg-background"
              >
                {categories.map(category => (
                  <option key={category.value} value={category.value}>{category.label}</option>
                ))}
              </select>
            </div>
          </div>
        </div>
      </GlassMorphismCard>
      
      {/* Featured agents section */}
      {featuredAgents.length > 0 && selectedCategory === 'all' && !searchTerm && (
        <div className="mb-12">
          <h2 className="text-2xl font-bold mb-6">Featured AI Agents</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {featuredAgents.map(agent => (
              <AgentCard 
                key={agent.id} 
                agent={agent} 
                onClick={() => handleAgentClick(agent.id)}
              />
            ))}
          </div>
        </div>
      )}
      
      {/* All agents grid */}
      <div className="mb-8">
        <h2 className="text-2xl font-bold mb-6">
          {selectedCategory !== 'all' 
            ? `${categories.find(c => c.value === selectedCategory)?.label} Agents` 
            : 'All AI Agents'}
        </h2>
        
        {displayedAgents.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {displayedAgents.map(agent => (
              <AgentCard 
                key={agent.id} 
                agent={agent} 
                onClick={() => handleAgentClick(agent.id)}
              />
            ))}
          </div>
        ) : (
          <div className="text-center py-16">
            <Search className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-xl font-medium">No agents match your search</h3>
            <p className="text-muted-foreground mt-2">Try adjusting your filters or search terms</p>
            <Button 
              variant="outline" 
              className="mt-4"
              onClick={() => {
                setSearchTerm('');
                setSelectedCategory('all');
              }}
            >
              Clear Filters
            </Button>
          </div>
        )}
      </div>
      
      {/* How it works section */}
      <div className="mt-16">
        <h2 className="text-2xl font-bold mb-6 text-center">How It Works</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <Card className="text-center">
            <CardHeader>
              <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mx-auto">
                <Search className="w-6 h-6 text-primary" />
              </div>
              <CardTitle className="mt-4">1. Browse & Select</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">
                Browse our marketplace of specialized AI agents and select the one that matches your needs.
              </p>
            </CardContent>
          </Card>
          
          <Card className="text-center">
            <CardHeader>
              <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mx-auto">
                <Briefcase className="w-6 h-6 text-primary" />
              </div>
              <CardTitle className="mt-4">2. Hire & Configure</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">
                Hire your chosen agent with flexible pricing options and configure it to your specific requirements.
              </p>
            </CardContent>
          </Card>
          
          <Card className="text-center">
            <CardHeader>
              <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mx-auto">
                <Star className="w-6 h-6 text-primary" />
              </div>
              <CardTitle className="mt-4">3. Delegate & Manage</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">
                Assign tasks to your AI agent, monitor progress, and review results through your dashboard.
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

interface AgentCardProps {
  agent: AIAgent;
  onClick: () => void;
}

const AgentCard: React.FC<AgentCardProps> = ({ agent, onClick }) => {
  return (
    <Card 
      className="overflow-hidden transition-all hover:shadow-lg cursor-pointer h-full flex flex-col"
      onClick={onClick}
    >
      <div className="h-48 overflow-hidden">
        <img 
          src={agent.imageUrl} 
          alt={agent.name} 
          className="w-full h-full object-cover transition-transform hover:scale-105"
        />
      </div>
      
      <CardHeader className="pb-2 flex-grow">
        <div className="flex flex-wrap gap-2 mb-2">
          <Badge variant="secondary">{categories.find(c => c.value === agent.category)?.label}</Badge>
          {agent.featured && <Badge variant="default" className="bg-amber-500">Featured</Badge>}
        </div>
        <CardTitle className="text-xl">{agent.name}</CardTitle>
        <p className="text-sm text-muted-foreground line-clamp-3">{agent.description}</p>
      </CardHeader>
      
      <CardContent className="pb-2">
        <div className="flex flex-wrap gap-1 mt-3">
          {agent.tags.slice(0, 3).map(tag => (
            <span key={tag} className="text-xs bg-muted px-2 py-1 rounded-full">
              {tag}
            </span>
          ))}
          {agent.tags.length > 3 && (
            <span className="text-xs bg-muted px-2 py-1 rounded-full">
              +{agent.tags.length - 3}
            </span>
          )}
        </div>
      </CardContent>
      
      <CardFooter className="flex justify-between items-center pt-2 mt-auto">
        <div className="flex items-center gap-1">
          <Star className="w-4 h-4 text-amber-500 fill-amber-500" />
          <span className="text-sm font-medium">{agent.rating}</span>
          <span className="text-xs text-muted-foreground">({agent.reviewCount})</span>
        </div>
        <div className="text-right">
          <div className="text-sm font-bold">${agent.pricing.hourly}/hr</div>
          {agent.pricing.monthly && (
            <div className="text-xs text-muted-foreground">${agent.pricing.monthly}/mo</div>
          )}
        </div>
      </CardFooter>
    </Card>
  );
};

export default AIAgents;