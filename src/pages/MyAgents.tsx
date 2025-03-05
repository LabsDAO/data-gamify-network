import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { usePrivy } from '@privy-io/react-auth';
import { HiredAgent, AgentTask } from '@/types/agent';
import { mockAgents } from '@/data/mockAgents';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Search, 
  Star, 
  Filter, 
  Briefcase, 
  Clock, 
  Calendar, 
  CheckCircle, 
  XCircle, 
  AlertCircle, 
  Plus,
  ArrowRight,
  RefreshCw
} from 'lucide-react';
import GlassMorphismCard from '@/components/ui/GlassMorphismCard';
import { useIsMobile } from '@/hooks/use-mobile';
import { useToast } from '@/hooks/use-toast';
import { Progress } from '@/components/ui/progress';

// Mock data for hired agents
const mockHiredAgents: HiredAgent[] = [
  {
    ...mockAgents[0],
    hiredDate: '2025-02-15',
    expiryDate: '2025-03-15',
    status: 'active',
    usageHours: 12.5,
    tasks: [
      {
        id: 'task-1',
        title: 'Property market analysis',
        description: 'Analyze current market trends for residential properties in San Francisco',
        status: 'completed',
        createdAt: '2025-02-18',
        completedAt: '2025-02-19',
        result: 'Comprehensive analysis of 250 properties with price trends and neighborhood comparisons'
      },
      {
        id: 'task-2',
        title: 'Client follow-up calls',
        description: 'Make follow-up calls to 15 potential buyers who showed interest last week',
        status: 'in-progress',
        createdAt: '2025-02-28'
      }
    ]
  },
  {
    ...mockAgents[1],
    hiredDate: '2025-02-20',
    expiryDate: '2025-03-20',
    status: 'active',
    usageHours: 8.2,
    tasks: [
      {
        id: 'task-3',
        title: 'Nutrition plan creation',
        description: 'Create a personalized nutrition plan based on my fitness goals and dietary restrictions',
        status: 'completed',
        createdAt: '2025-02-21',
        completedAt: '2025-02-22',
        result: '4-week meal plan with shopping lists and recipes'
      },
      {
        id: 'task-4',
        title: 'Weekly progress check-in',
        description: 'Review my fitness progress and adjust workout plan accordingly',
        status: 'pending',
        createdAt: '2025-03-01'
      }
    ]
  },
  {
    ...mockAgents[3],
    hiredDate: '2025-01-10',
    expiryDate: '2025-02-10',
    status: 'expired',
    usageHours: 45.8,
    tasks: [
      {
        id: 'task-5',
        title: 'Website redesign concepts',
        description: 'Create 3 design concepts for our company website redesign',
        status: 'completed',
        createdAt: '2025-01-15',
        completedAt: '2025-01-20',
        result: '3 complete design concepts with mobile and desktop versions'
      },
      {
        id: 'task-6',
        title: 'Logo variations',
        description: 'Design 5 variations of our new logo based on the approved concept',
        status: 'completed',
        createdAt: '2025-01-25',
        completedAt: '2025-01-28',
        result: '5 logo variations with different color schemes and layouts'
      }
    ]
  }
];

const MyAgents = () => {
  const navigate = useNavigate();
  const { authenticated, login } = usePrivy();
  const { user } = useAuth();
  const isMobile = useIsMobile();
  const { toast } = useToast();
  
  const [hiredAgents, setHiredAgents] = useState<HiredAgent[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedStatus, setSelectedStatus] = useState<'all' | 'active' | 'expired'>('all');
  const [displayedAgents, setDisplayedAgents] = useState<HiredAgent[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  
  // Load hired agents
  useEffect(() => {
    if (!authenticated) {
      navigate('/agents');
      return;
    }
    
    // Simulate API call
    setTimeout(() => {
      setHiredAgents(mockHiredAgents);
      setIsLoading(false);
    }, 1000);
  }, [authenticated, navigate]);
  
  // Filter agents based on search term and status
  useEffect(() => {
    let filtered = hiredAgents;
    
    // Filter by search term
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      filtered = filtered.filter(agent => 
        agent.name.toLowerCase().includes(term) || 
        agent.description.toLowerCase().includes(term) ||
        agent.tags.some(tag => tag.toLowerCase().includes(term))
      );
    }
    
    // Filter by status
    if (selectedStatus !== 'all') {
      filtered = filtered.filter(agent => agent.status === selectedStatus);
    }
    
    setDisplayedAgents(filtered);
  }, [searchTerm, selectedStatus, hiredAgents]);
  
  const handleRenew = (agentId: string) => {
    toast({
      title: "Agent Renewed",
      description: "Your subscription has been renewed for another month.",
    });
    
    // Update the agent's status and expiry date
    setHiredAgents(prev => prev.map(agent => {
      if (agent.id === agentId) {
        const currentDate = new Date();
        const expiryDate = new Date();
        expiryDate.setMonth(expiryDate.getMonth() + 1);
        
        return {
          ...agent,
          status: 'active',
          hiredDate: currentDate.toISOString().split('T')[0],
          expiryDate: expiryDate.toISOString().split('T')[0]
        };
      }
      return agent;
    }));
  };
  
  const handleCreateTask = (agentId: string) => {
    navigate(`/agents/${agentId}/new-task`);
  };
  
  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-16">
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
        </div>
      </div>
    );
  }
  
  return (
    <div className={`container mx-auto px-4 ${isMobile ? 'pt-20 pb-8' : 'py-16'}`}>
      <div className="flex flex-col md:flex-row justify-between items-center mb-6 gap-4">
        <div>
          <h1 className="text-3xl font-bold">My AI Agents</h1>
          <p className="text-muted-foreground mt-2">Manage your hired AI agents and tasks</p>
        </div>
        
        <div className="self-center">
          <Button 
            onClick={() => navigate('/agents')}
            className="flex items-center gap-2"
          >
            <Plus className="w-4 h-4" />
            Hire New Agent
          </Button>
        </div>
      </div>
      
      {/* Search and filters */}
      <GlassMorphismCard className="mb-8">
        <div className="flex flex-col md:flex-row gap-4 p-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
            <Input
              placeholder="Search your agents..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
          
          <div className="flex gap-3">
            <div className="flex items-center gap-2">
              <Filter className="w-4 h-4 text-muted-foreground" />
              <select
                value={selectedStatus}
                onChange={(e) => setSelectedStatus(e.target.value as 'all' | 'active' | 'expired')}
                className="border rounded-md px-3 py-2 text-sm bg-background"
              >
                <option value="all">All Statuses</option>
                <option value="active">Active</option>
                <option value="expired">Expired</option>
              </select>
            </div>
          </div>
        </div>
      </GlassMorphismCard>
      
      {/* Agents list */}
      {displayedAgents.length > 0 ? (
        <div className="space-y-6">
          {displayedAgents.map(agent => (
            <AgentCard 
              key={agent.id} 
              agent={agent} 
              onRenew={handleRenew}
              onCreateTask={handleCreateTask}
            />
          ))}
        </div>
      ) : (
        <div className="text-center py-16">
          <Briefcase className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
          <h3 className="text-xl font-medium">No agents found</h3>
          <p className="text-muted-foreground mt-2 mb-6">
            {hiredAgents.length === 0 
              ? "You haven't hired any AI agents yet." 
              : "No agents match your search criteria."}
          </p>
          {hiredAgents.length === 0 ? (
            <Button onClick={() => navigate('/agents')}>Browse Agents</Button>
          ) : (
            <Button 
              variant="outline" 
              onClick={() => {
                setSearchTerm('');
                setSelectedStatus('all');
              }}
            >
              Clear Filters
            </Button>
          )}
        </div>
      )}
    </div>
  );
};

interface AgentCardProps {
  agent: HiredAgent;
  onRenew: (agentId: string) => void;
  onCreateTask: (agentId: string) => void;
}

const AgentCard: React.FC<AgentCardProps> = ({ agent, onRenew, onCreateTask }) => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<'overview' | 'tasks'>('overview');
  
  const isExpired = agent.status === 'expired';
  const daysLeft = isExpired ? 0 : Math.max(0, Math.floor((new Date(agent.expiryDate).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24)));
  
  const completedTasks = agent.tasks ? agent.tasks.filter(task => task.status === 'completed').length : 0;
  const totalTasks = agent.tasks ? agent.tasks.length : 0;
  const taskCompletionRate = totalTasks > 0 ? (completedTasks / totalTasks) * 100 : 0;
  
  return (
    <GlassMorphismCard>
      <div className="flex flex-col md:flex-row gap-6">
        <div className="w-full md:w-1/4">
          <div className="rounded-lg overflow-hidden">
            <img 
              src={agent.imageUrl} 
              alt={agent.name} 
              className="w-full h-auto object-cover"
            />
          </div>
          
          <div className="mt-4">
            <Badge 
              variant={isExpired ? "destructive" : "default"}
              className={isExpired ? "" : "bg-green-500"}
            >
              {isExpired ? "Expired" : "Active"}
            </Badge>
            
            {!isExpired && (
              <div className="mt-2 text-sm">
                <span className="text-muted-foreground">Expires in: </span>
                <span className="font-medium">{daysLeft} days</span>
              </div>
            )}
            
            <div className="mt-4 flex items-center">
              <Star className="w-4 h-4 text-amber-500 fill-amber-500" />
              <span className="ml-2 font-medium">{agent.rating}</span>
            </div>
          </div>
        </div>
        
        <div className="w-full md:w-3/4">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-4">
            <h2 className="text-2xl font-bold">{agent.name}</h2>
            
            <div className="flex gap-2 mt-2 md:mt-0">
              {isExpired ? (
                <Button 
                  variant="default"
                  onClick={() => onRenew(agent.id)}
                  className="flex items-center gap-1"
                >
                  <RefreshCw className="w-4 h-4" />
                  Renew
                </Button>
              ) : (
                <Button 
                  variant="default"
                  onClick={() => onCreateTask(agent.id)}
                  className="flex items-center gap-1"
                >
                  <Plus className="w-4 h-4" />
                  New Task
                </Button>
              )}
              
              <Button 
                variant="outline"
                onClick={() => navigate(`/agents/${agent.id}`)}
              >
                Details
              </Button>
            </div>
          </div>
          
          <Tabs 
            defaultValue="overview" 
            className="w-full"
            onValueChange={(value) => setActiveTab(value as 'overview' | 'tasks')}
          >
            <TabsList className="mb-4">
              <TabsTrigger value="overview">Overview</TabsTrigger>
              <TabsTrigger value="tasks">Tasks</TabsTrigger>
            </TabsList>
            
            <TabsContent value="overview">
              <div className="space-y-4">
                <p className="text-muted-foreground">{agent.description}</p>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
                  <div className="bg-background p-3 rounded-lg">
                    <div className="text-sm text-muted-foreground mb-1">Hired Date</div>
                    <div className="font-medium flex items-center">
                      <Calendar className="w-4 h-4 mr-2 text-primary" />
                      {agent.hiredDate}
                    </div>
                  </div>
                  
                  <div className="bg-background p-3 rounded-lg">
                    <div className="text-sm text-muted-foreground mb-1">Usage</div>
                    <div className="font-medium flex items-center">
                      <Clock className="w-4 h-4 mr-2 text-primary" />
                      {agent.usageHours} hours
                    </div>
                  </div>
                  
                  <div className="bg-background p-3 rounded-lg">
                    <div className="text-sm text-muted-foreground mb-1">Task Completion</div>
                    <div className="font-medium flex items-center">
                      <CheckCircle className="w-4 h-4 mr-2 text-primary" />
                      {completedTasks}/{totalTasks} tasks
                    </div>
                  </div>
                </div>
                
                <div className="mt-4">
                  <div className="flex justify-between mb-1 text-sm">
                    <span>Task Completion Rate</span>
                    <span>{taskCompletionRate.toFixed(0)}%</span>
                  </div>
                  <Progress value={taskCompletionRate} className="h-2" />
                </div>
              </div>
            </TabsContent>
            
            <TabsContent value="tasks">
              {agent.tasks && agent.tasks.length > 0 ? (
                <div className="space-y-4">
                  {agent.tasks.map(task => (
                    <TaskItem key={task.id} task={task} agentId={agent.id} />
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <AlertCircle className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-lg font-medium mb-2">No tasks yet</h3>
                  <p className="text-muted-foreground mb-4">
                    You haven't assigned any tasks to this agent yet.
                  </p>
                  {!isExpired && (
                    <Button onClick={() => onCreateTask(agent.id)}>Create First Task</Button>
                  )}
                </div>
              )}
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </GlassMorphismCard>
  );
};

interface TaskItemProps {
  task: AgentTask;
  agentId: string;
}

const TaskItem: React.FC<TaskItemProps> = ({ task, agentId }) => {
  const navigate = useNavigate();
  
  const getStatusBadge = () => {
    switch (task.status) {
      case 'completed':
        return <Badge variant="default" className="bg-green-500">Completed</Badge>;
      case 'in-progress':
        return <Badge variant="default" className="bg-blue-500">In Progress</Badge>;
      case 'pending':
        return <Badge variant="outline">Pending</Badge>;
      case 'failed':
        return <Badge variant="destructive">Failed</Badge>;
      default:
        return null;
    }
  };
  
  return (
    <Card className="overflow-hidden">
      <CardHeader className="pb-2">
        <div className="flex justify-between items-start">
          <CardTitle className="text-lg">{task.title}</CardTitle>
          {getStatusBadge()}
        </div>
      </CardHeader>
      
      <CardContent className="pb-2">
        <p className="text-sm text-muted-foreground">{task.description}</p>
        
        <div className="flex items-center mt-3 text-xs text-muted-foreground">
          <Calendar className="w-3 h-3 mr-1" />
          <span>Created: {task.createdAt}</span>
          
          {task.completedAt && (
            <>
              <span className="mx-2">•</span>
              <CheckCircle className="w-3 h-3 mr-1" />
              <span>Completed: {task.completedAt}</span>
            </>
          )}
        </div>
        
        {task.result && (
          <div className="mt-3 p-2 bg-muted rounded-md text-sm">
            <div className="font-medium mb-1">Result:</div>
            <p className="text-muted-foreground">{task.result}</p>
          </div>
        )}
      </CardContent>
      
      <CardFooter className="pt-2">
        <Button 
          variant="ghost" 
          size="sm" 
          className="ml-auto flex items-center gap-1"
          onClick={() => navigate(`/agents/${agentId}/tasks/${task.id}`)}
        >
          View Details
          <ArrowRight className="w-3 h-3" />
        </Button>
      </CardFooter>
    </Card>
  );
};

export default MyAgents;