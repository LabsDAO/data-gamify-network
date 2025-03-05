import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { usePrivy } from '@privy-io/react-auth';
import { AIAgent, AgentCategory } from '@/types/agent';
import { getAgentById } from '@/data/mockAgents';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Star, ArrowLeft, Clock, Check, Briefcase, Calendar } from 'lucide-react';
import GlassMorphismCard from '@/components/ui/GlassMorphismCard';
import { useToast } from '@/hooks/use-toast';

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

const AgentDetail = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { authenticated, login } = usePrivy();
  const { user } = useAuth();
  const { toast } = useToast();
  
  const [agent, setAgent] = useState<AIAgent | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedPlan, setSelectedPlan] = useState<'hourly' | 'monthly'>('monthly');
  const [isHiring, setIsHiring] = useState(false);
  
  useEffect(() => {
    if (id) {
      const agentData = getAgentById(id);
      if (agentData) {
        setAgent(agentData);
      }
      setLoading(false);
    }
  }, [id]);
  
  const handleHire = () => {
    if (!authenticated) {
      login();
      return;
    }
    
    setIsHiring(true);
    
    // Simulate API call
    setTimeout(() => {
      setIsHiring(false);
      toast({
        title: "Agent Hired Successfully",
        description: `You've hired ${agent?.name}. You can now assign tasks to this agent.`,
      });
      
      // Navigate to my agents page
      navigate('/my-agents');
    }, 1500);
  };
  
  if (loading) {
    return (
      <div className="container mx-auto px-4 py-16">
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
        </div>
      </div>
    );
  }
  
  if (!agent) {
    return (
      <div className="container mx-auto px-4 py-16">
        <Button 
          variant="ghost" 
          className="mb-6 flex items-center gap-2"
          onClick={() => navigate('/agents')}
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Agents
        </Button>
        
        <div className="text-center py-16">
          <h2 className="text-2xl font-bold mb-4">Agent Not Found</h2>
          <p className="text-muted-foreground mb-6">The agent you're looking for doesn't exist or has been removed.</p>
          <Button onClick={() => navigate('/agents')}>Browse All Agents</Button>
        </div>
      </div>
    );
  }
  
  return (
    <div className="container mx-auto px-4 py-16">
      <Button 
        variant="ghost" 
        className="mb-6 flex items-center gap-2"
        onClick={() => navigate('/agents')}
      >
        <ArrowLeft className="w-4 h-4" />
        Back to Agents
      </Button>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Agent details */}
        <div className="lg:col-span-2">
          <GlassMorphismCard>
            <div className="flex flex-col md:flex-row gap-6">
              <div className="w-full md:w-1/3">
                <div className="rounded-lg overflow-hidden">
                  <img 
                    src={agent.imageUrl} 
                    alt={agent.name} 
                    className="w-full h-auto object-cover"
                  />
                </div>
                
                <div className="mt-4 flex flex-wrap gap-2">
                  <Badge variant="secondary">
                    {categories.find(c => c.value === agent.category)?.label}
                  </Badge>
                  {agent.featured && (
                    <Badge variant="default" className="bg-amber-500">
                      Featured
                    </Badge>
                  )}
                </div>
                
                <div className="mt-4 flex items-center">
                  <Star className="w-5 h-5 text-amber-500 fill-amber-500" />
                  <span className="ml-2 font-medium">{agent.rating}</span>
                  <span className="ml-1 text-sm text-muted-foreground">({agent.reviewCount} reviews)</span>
                </div>
              </div>
              
              <div className="w-full md:w-2/3">
                <h1 className="text-3xl font-bold mb-2">{agent.name}</h1>
                <p className="text-muted-foreground mb-6">{agent.description}</p>
                
                <h3 className="font-semibold text-lg mb-2">Capabilities</h3>
                <ul className="list-disc pl-5 mb-6 space-y-1">
                  {agent.capabilities.map((capability, index) => (
                    <li key={index} className="text-muted-foreground">{capability}</li>
                  ))}
                </ul>
                
                <h3 className="font-semibold text-lg mb-2">Use Cases</h3>
                <ul className="list-disc pl-5 mb-6 space-y-1">
                  {agent.useCases.map((useCase, index) => (
                    <li key={index} className="text-muted-foreground">{useCase}</li>
                  ))}
                </ul>
                
                <div className="flex flex-wrap gap-2 mt-4">
                  {agent.tags.map(tag => (
                    <span key={tag} className="text-xs bg-muted px-2 py-1 rounded-full">
                      {tag}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </GlassMorphismCard>
          
          <Tabs defaultValue="reviews" className="mt-8">
            <TabsList className="mb-4">
              <TabsTrigger value="reviews">Reviews</TabsTrigger>
              <TabsTrigger value="faq">FAQ</TabsTrigger>
              {agent.integrations && (
                <TabsTrigger value="integrations">Integrations</TabsTrigger>
              )}
            </TabsList>
            
            <TabsContent value="reviews">
              <Card>
                <CardHeader>
                  <CardTitle>Customer Reviews</CardTitle>
                </CardHeader>
                <CardContent>
                  {/* Mock reviews - in a real app, these would come from an API */}
                  <div className="space-y-6">
                    <div className="border-b pb-4">
                      <div className="flex items-center mb-2">
                        <div className="flex">
                          {[...Array(5)].map((_, i) => (
                            <Star key={i} className={`w-4 h-4 ${i < 5 ? 'text-amber-500 fill-amber-500' : 'text-gray-300'}`} />
                          ))}
                        </div>
                        <span className="ml-2 font-medium">Excellent service</span>
                      </div>
                      <p className="text-sm text-muted-foreground">
                        This AI agent has been a game-changer for our business. It handles customer inquiries efficiently and has freed up our team to focus on more complex issues.
                      </p>
                      <div className="mt-2 text-xs text-muted-foreground">
                        Jane D. - 2 weeks ago
                      </div>
                    </div>
                    
                    <div className="border-b pb-4">
                      <div className="flex items-center mb-2">
                        <div className="flex">
                          {[...Array(5)].map((_, i) => (
                            <Star key={i} className={`w-4 h-4 ${i < 4 ? 'text-amber-500 fill-amber-500' : 'text-gray-300'}`} />
                          ))}
                        </div>
                        <span className="ml-2 font-medium">Very helpful</span>
                      </div>
                      <p className="text-sm text-muted-foreground">
                        The agent is very responsive and accurate. It took some time to configure it to our specific needs, but once set up, it works flawlessly.
                      </p>
                      <div className="mt-2 text-xs text-muted-foreground">
                        Michael T. - 1 month ago
                      </div>
                    </div>
                    
                    <div>
                      <div className="flex items-center mb-2">
                        <div className="flex">
                          {[...Array(5)].map((_, i) => (
                            <Star key={i} className={`w-4 h-4 ${i < 5 ? 'text-amber-500 fill-amber-500' : 'text-gray-300'}`} />
                          ))}
                        </div>
                        <span className="ml-2 font-medium">Exceeded expectations</span>
                      </div>
                      <p className="text-sm text-muted-foreground">
                        I was skeptical at first, but this AI agent has exceeded all my expectations. It's like having an extra team member who works 24/7.
                      </p>
                      <div className="mt-2 text-xs text-muted-foreground">
                        Sarah L. - 2 months ago
                      </div>
                    </div>
                  </div>
                </CardContent>
                <CardFooter>
                  <Button variant="outline" className="w-full">View All Reviews</Button>
                </CardFooter>
              </Card>
            </TabsContent>
            
            <TabsContent value="faq">
              <Card>
                <CardHeader>
                  <CardTitle>Frequently Asked Questions</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div>
                      <h4 className="font-medium mb-1">How does the agent learn my specific requirements?</h4>
                      <p className="text-sm text-muted-foreground">
                        After hiring, you'll go through a brief onboarding process where you can provide specific instructions, examples, and preferences. The agent adapts to your needs over time through feedback.
                      </p>
                    </div>
                    
                    <div>
                      <h4 className="font-medium mb-1">Can I customize the agent's responses?</h4>
                      <p className="text-sm text-muted-foreground">
                        Yes, you can customize tone, style, and content guidelines. You can also provide templates for specific types of interactions.
                      </p>
                    </div>
                    
                    <div>
                      <h4 className="font-medium mb-1">What happens if the agent can't handle a task?</h4>
                      <p className="text-sm text-muted-foreground">
                        The agent is designed to recognize its limitations. When it encounters a task beyond its capabilities, it will notify you and suggest alternatives or escalation paths.
                      </p>
                    </div>
                    
                    <div>
                      <h4 className="font-medium mb-1">How secure is my data?</h4>
                      <p className="text-sm text-muted-foreground">
                        All data is encrypted in transit and at rest. We follow industry best practices for data security and privacy. You can also set data retention policies.
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
            
            {agent.integrations && (
              <TabsContent value="integrations">
                <Card>
                  <CardHeader>
                    <CardTitle>Integrations</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                      {agent.integrations.map((integration, index) => (
                        <div key={index} className="border rounded-lg p-4 flex items-center gap-3">
                          <Check className="w-5 h-5 text-green-500" />
                          <span>{integration}</span>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
            )}
          </Tabs>
        </div>
        
        {/* Pricing and hire section */}
        <div className="lg:col-span-1">
          <Card className="sticky top-24">
            <CardHeader>
              <CardTitle>Pricing Plans</CardTitle>
            </CardHeader>
            <CardContent>
              <Tabs defaultValue={agent.pricing.monthly ? "monthly" : "hourly"} className="w-full" onValueChange={(value) => setSelectedPlan(value as 'hourly' | 'monthly')}>
                <TabsList className="grid w-full grid-cols-2 mb-4">
                  <TabsTrigger value="hourly">Hourly</TabsTrigger>
                  <TabsTrigger value="monthly" disabled={!agent.pricing.monthly}>Monthly</TabsTrigger>
                </TabsList>
                
                <TabsContent value="hourly" className="space-y-4">
                  <div className="text-center p-4 border rounded-lg">
                    <div className="text-3xl font-bold">${agent.pricing.hourly}</div>
                    <div className="text-sm text-muted-foreground">per hour</div>
                  </div>
                  
                  <div className="space-y-2">
                    <div className="flex items-center">
                      <Check className="w-4 h-4 text-green-500 mr-2" />
                      <span className="text-sm">Pay only for what you use</span>
                    </div>
                    <div className="flex items-center">
                      <Check className="w-4 h-4 text-green-500 mr-2" />
                      <span className="text-sm">No long-term commitment</span>
                    </div>
                    <div className="flex items-center">
                      <Check className="w-4 h-4 text-green-500 mr-2" />
                      <span className="text-sm">Ideal for occasional tasks</span>
                    </div>
                  </div>
                </TabsContent>
                
                <TabsContent value="monthly" className="space-y-4">
                  {agent.pricing.monthly && (
                    <>
                      <div className="text-center p-4 border rounded-lg">
                        <div className="text-3xl font-bold">${agent.pricing.monthly}</div>
                        <div className="text-sm text-muted-foreground">per month</div>
                        <div className="mt-2 text-xs text-green-600">
                          Save ${Math.round(agent.pricing.hourly * 160 - agent.pricing.monthly)} compared to hourly
                        </div>
                      </div>
                      
                      <div className="space-y-2">
                        <div className="flex items-center">
                          <Check className="w-4 h-4 text-green-500 mr-2" />
                          <span className="text-sm">Unlimited usage</span>
                        </div>
                        <div className="flex items-center">
                          <Check className="w-4 h-4 text-green-500 mr-2" />
                          <span className="text-sm">Priority support</span>
                        </div>
                        <div className="flex items-center">
                          <Check className="w-4 h-4 text-green-500 mr-2" />
                          <span className="text-sm">Advanced customization</span>
                        </div>
                      </div>
                    </>
                  )}
                </TabsContent>
              </Tabs>
              
              <div className="mt-6">
                <Button 
                  className="w-full"
                  onClick={handleHire}
                  disabled={isHiring}
                >
                  {isHiring ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                      Processing...
                    </>
                  ) : (
                    <>Hire This Agent</>
                  )}
                </Button>
                
                <div className="mt-4 text-xs text-center text-muted-foreground">
                  You can cancel anytime. No long-term contract required.
                </div>
              </div>
            </CardContent>
            <CardFooter className="flex flex-col gap-4">
              <div className="w-full border-t pt-4">
                <h4 className="font-medium mb-2">Satisfaction Guarantee</h4>
                <p className="text-xs text-muted-foreground">
                  If you're not satisfied with the agent's performance within the first 7 days, you can request a full refund.
                </p>
              </div>
              
              <div className="w-full border-t pt-4">
                <h4 className="font-medium mb-2">Need Help?</h4>
                <Button variant="outline" className="w-full">Contact Support</Button>
              </div>
            </CardFooter>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default AgentDetail;