
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, Tag, ShoppingCart, Star, Brain, Bot, Cpu, Image, MessageSquare, Mic, Shield } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import GlassMorphismCard from '@/components/ui/GlassMorphismCard';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardFooter, CardHeader } from '@/components/ui/card';
import { toast } from 'sonner';
import { useAuth } from '@/hooks/useAuth';

// Define types for our AI agents
interface AIAgent {
  id: string;
  name: string;
  description: string;
  price: string;
  industry: string[];
  rating: number;
  imageUrl: string;
  features: string[];
  type: 'vision' | 'language' | 'voice' | 'multimodal';
  tags: string[];
}

const Agents = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedIndustry, setSelectedIndustry] = useState<string | null>(null);
  const [selectedType, setSelectedType] = useState<string | null>(null);
  
  // Sample AI agents data
  const agents: AIAgent[] = [
    {
      id: '1',
      name: 'VisionPro AI',
      description: 'Advanced computer vision model for image recognition and object detection with high accuracy.',
      price: '$299/month',
      industry: ['Manufacturing', 'Security', 'Retail'],
      rating: 4.8,
      imageUrl: '/placeholder.svg',
      features: ['Object detection', 'Image classification', 'Facial recognition', 'Anomaly detection'],
      type: 'vision',
      tags: ['Computer Vision', 'Image Analysis', 'Object Detection']
    },
    {
      id: '2',
      name: 'RealEstate Assistant',
      description: 'Specialized voice AI agent for real estate professionals. Handles customer inquiries and property details.',
      price: '$199/month',
      industry: ['Real Estate'],
      rating: 4.6,
      imageUrl: '/placeholder.svg',
      features: ['Property valuation', 'Market analysis', 'Customer support', 'Listing automation'],
      type: 'voice',
      tags: ['Real Estate', 'Voice Assistant', 'Property Management']
    },
    {
      id: '3',
      name: 'FitCoach AI',
      description: 'Personal health and fitness coach that creates customized workout and nutrition plans.',
      price: '$149/month',
      industry: ['Health', 'Fitness'],
      rating: 4.7,
      imageUrl: '/placeholder.svg',
      features: ['Workout planning', 'Nutrition guidance', 'Progress tracking', 'Health assessment'],
      type: 'voice',
      tags: ['Health', 'Fitness', 'Coaching', 'Wellness']
    },
    {
      id: '4',
      name: 'CodeAssistant Pro',
      description: 'Advanced LLM for software development with expertise in multiple programming languages.',
      price: '$349/month',
      industry: ['Technology', 'Software Development'],
      rating: 4.9,
      imageUrl: '/placeholder.svg',
      features: ['Code generation', 'Code review', 'Bug detection', 'Documentation generation'],
      type: 'language',
      tags: ['Coding', 'Programming', 'Software Development']
    },
    {
      id: '5',
      name: 'MedicalDiagnostics',
      description: 'AI solution for medical image analysis and preliminary diagnostics support.',
      price: '$499/month',
      industry: ['Healthcare', 'Medical'],
      rating: 4.5,
      imageUrl: '/placeholder.svg',
      features: ['Medical imaging analysis', 'Diagnostic assistance', 'Patient data analysis', 'Research support'],
      type: 'multimodal',
      tags: ['Healthcare', 'Diagnostics', 'Medical Imaging']
    },
    {
      id: '6',
      name: 'CustomerSupportBot',
      description: 'Multilingual customer service AI that can handle inquiries across multiple channels.',
      price: '$249/month',
      industry: ['Retail', 'E-commerce', 'Customer Service'],
      rating: 4.3,
      imageUrl: '/placeholder.svg',
      features: ['Ticket management', 'FAQ automation', 'Sentiment analysis', '24/7 availability'],
      type: 'language',
      tags: ['Customer Support', 'Service', 'Communication']
    },
  ];

  // Get all unique industries
  const industries = [...new Set(agents.flatMap(agent => agent.industry))];
  
  // Get all unique agent types
  const agentTypes = [...new Set(agents.map(agent => agent.type))];

  // Filter agents based on search term and selected filters
  const filteredAgents = agents.filter(agent => {
    const matchesSearch = searchTerm === '' || 
      agent.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
      agent.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      agent.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()));
    
    const matchesIndustry = selectedIndustry === null || 
      agent.industry.includes(selectedIndustry);
    
    const matchesType = selectedType === null ||
      agent.type === selectedType;
    
    return matchesSearch && matchesIndustry && matchesType;
  });

  // Function to get the icon for an agent type
  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'vision':
        return <Image className="w-5 h-5" />;
      case 'language':
        return <MessageSquare className="w-5 h-5" />;
      case 'voice':
        return <Mic className="w-5 h-5" />;
      case 'multimodal':
        return <Cpu className="w-5 h-5" />;
      default:
        return <Bot className="w-5 h-5" />;
    }
  };

  // Handle hiring an agent
  const handleHireAgent = (agentId: string) => {
    if (!user) {
      toast('Please sign in to hire an AI agent');
      return;
    }

    // Would typically integrate with payment processing here
    toast.success('Agent hired successfully! Check your dashboard for details.');
  };

  return (
    <div className="min-h-screen pt-20 md:pt-24 pb-12 md:pb-16 px-4 md:px-6">
      <div className="container mx-auto max-w-7xl">
        {/* Header Section */}
        <section className="mb-10 text-center">
          <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold mb-4">
            <span className="text-gradient">AI Agent Marketplace</span>
          </h1>
          <p className="text-base md:text-lg text-muted-foreground max-w-3xl mx-auto mb-8">
            Discover and hire specialized AI agents for your specific needs. From computer vision to voice assistants, 
            find the perfect AI solution for your industry.
          </p>

          {/* Search Bar */}
          <div className="flex items-center max-w-xl mx-auto mb-8 relative">
            <Input
              type="text"
              placeholder="Search for AI agents..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pr-10"
            />
            <Search className="absolute right-3 top-1/2 transform -translate-y-1/2 text-muted-foreground" />
          </div>

          {/* Filters */}
          <div className="flex flex-wrap gap-2 justify-center mb-8">
            {/* Industry filters */}
            <div className="flex flex-wrap gap-2 justify-center">
              <Badge 
                variant={selectedIndustry === null ? "default" : "outline"}
                className="cursor-pointer"
                onClick={() => setSelectedIndustry(null)}
              >
                All Industries
              </Badge>
              {industries.map(industry => (
                <Badge 
                  key={industry}
                  variant={selectedIndustry === industry ? "default" : "outline"}
                  className="cursor-pointer"
                  onClick={() => setSelectedIndustry(industry)}
                >
                  {industry}
                </Badge>
              ))}
            </div>

            {/* Type filters */}
            <div className="flex flex-wrap gap-2 justify-center mt-2">
              <Badge 
                variant={selectedType === null ? "secondary" : "outline"}
                className="cursor-pointer"
                onClick={() => setSelectedType(null)}
              >
                All Types
              </Badge>
              {agentTypes.map(type => (
                <Badge 
                  key={type}
                  variant={selectedType === type ? "secondary" : "outline"}
                  className="cursor-pointer"
                  onClick={() => setSelectedType(type)}
                >
                  <span className="flex items-center gap-1">
                    {getTypeIcon(type)}
                    {type.charAt(0).toUpperCase() + type.slice(1)}
                  </span>
                </Badge>
              ))}
            </div>
          </div>
        </section>

        {/* Agents Grid */}
        <section className="mb-12">
          {filteredAgents.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredAgents.map((agent, index) => (
                <Card 
                  key={agent.id}
                  className="overflow-hidden transition-all duration-300 hover:shadow-lg"
                  style={{ animationDelay: `${index * 100}ms` }}
                >
                  <CardHeader className="p-0">
                    <div className="relative">
                      <div className="h-40 bg-gradient-to-r from-primary/20 to-secondary/20 flex items-center justify-center">
                        <Bot className="w-16 h-16 text-primary/60" />
                      </div>
                      <Badge className="absolute top-3 right-3 flex items-center gap-1">
                        {getTypeIcon(agent.type)}
                        {agent.type.charAt(0).toUpperCase() + agent.type.slice(1)}
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent className="p-6">
                    <div className="flex justify-between items-start">
                      <h3 className="font-bold text-xl mb-2">{agent.name}</h3>
                      <div className="flex items-center">
                        <Star className="w-4 h-4 text-yellow-500 fill-yellow-500" />
                        <span className="ml-1 text-sm">{agent.rating}</span>
                      </div>
                    </div>
                    <p className="text-muted-foreground text-sm mb-4">
                      {agent.description}
                    </p>
                    
                    <div className="flex flex-wrap gap-1 mb-4">
                      {agent.industry.map((ind) => (
                        <Badge key={ind} variant="outline" className="text-xs">
                          {ind}
                        </Badge>
                      ))}
                    </div>
                    
                    <div className="mb-4">
                      <h4 className="font-semibold mb-2">Key Features:</h4>
                      <ul className="text-sm space-y-1">
                        {agent.features.map((feature, i) => (
                          <li key={i} className="flex items-start">
                            <span className="text-primary mr-2">•</span>
                            {feature}
                          </li>
                        ))}
                      </ul>
                    </div>
                    
                    <div className="font-bold text-lg">{agent.price}</div>
                  </CardContent>
                  <CardFooter className="px-6 py-4 border-t">
                    <Button 
                      className="w-full flex items-center justify-center gap-2"
                      onClick={() => handleHireAgent(agent.id)}
                    >
                      <ShoppingCart className="w-4 h-4" />
                      Hire Agent
                    </Button>
                  </CardFooter>
                </Card>
              ))}
            </div>
          ) : (
            <GlassMorphismCard className="text-center py-10">
              <h3 className="text-xl font-semibold mb-2">No agents found</h3>
              <p className="text-muted-foreground">Try adjusting your search or filters</p>
            </GlassMorphismCard>
          )}
        </section>

        {/* CTA Section */}
        <section className="text-center">
          <GlassMorphismCard 
            className="max-w-4xl mx-auto py-8 md:py-10 px-6 md:px-8"
            gradient={true}
          >
            <div className="space-y-6">
              <div className="mx-auto bg-white/20 rounded-full w-14 h-14 flex items-center justify-center mb-2">
                <Brain className="w-8 h-8 text-white" />
              </div>
              <h2 className="text-xl md:text-2xl lg:text-3xl font-bold leading-tight">
                Don't see the right agent for your needs?
              </h2>
              <p className="text-white text-base md:text-lg max-w-2xl mx-auto leading-relaxed">
                We can create custom AI agents tailored specifically to your industry requirements
                and business processes.
              </p>
              <div className="pt-2">
                <Button 
                  size="lg"
                  className="bg-white text-primary hover:bg-white/90 px-8"
                  onClick={() => navigate('/request')}
                >
                  Request Custom Agent
                </Button>
              </div>
            </div>
          </GlassMorphismCard>
        </section>
      </div>
    </div>
  );
};

export default Agents;
