
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { usePrivy } from '@privy-io/react-auth';
import { 
  Award, 
  Search, 
  Filter, 
  Calendar, 
  Clock, 
  Upload, 
  Database,
  Tag
} from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import GlassMorphismCard from '@/components/ui/GlassMorphismCard';
import { useIsMobile } from '@/hooks/use-mobile';

// Mock data for available tasks
const allTasks = [
  {
    id: 'oil-spills',
    title: 'Oil Spill Detection Dataset',
    description: 'Collect images of oil spills in various environments to help train AI models for early detection.',
    category: 'Environmental',
    deadline: '2024-05-15',
    pointsPerUpload: 1,
    pointsPerLabel: 1,
    difficulty: 'Medium',
    progress: 35,
    organization: 'OceanGuard',
    tags: ['Environmental', 'Water', 'Pollution', 'AI Training'],
    image: 'https://images.unsplash.com/photo-1433086966358-54859d0ed716?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8M3x8b2NlYW58ZW58MHx8MHx8fDA%3D&auto=format&fit=crop&w=800&q=60'
  },
  {
    id: 'flat-tires',
    title: 'Flat Tire Recognition Dataset',
    description: 'Help build a dataset of flat tires in various conditions for roadside assistance AI.',
    category: 'Automotive',
    deadline: '2024-04-30',
    pointsPerUpload: 1,
    pointsPerLabel: 1,
    difficulty: 'Easy',
    progress: 60,
    organization: 'RoadAssist AI',
    tags: ['Automotive', 'Maintenance', 'Safety', 'ML Training'],
    image: 'https://images.unsplash.com/photo-1485833077593-4278bba3f11f?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8OXx8cm9hZHxlbnwwfHwwfHx8MA%3D%3D&auto=format&fit=crop&w=800&q=60'
  },
  {
    id: 'wildlife-counting',
    title: 'Wildlife Counting Dataset',
    description: 'Gather images of wildlife in natural habitats to train AI for population monitoring.',
    category: 'Wildlife',
    deadline: '2024-06-20',
    pointsPerUpload: 1,
    pointsPerLabel: 1,
    difficulty: 'Hard',
    progress: 15,
    organization: 'WildlifeTrack',
    tags: ['Wildlife', 'Conservation', 'Nature', 'Population'],
    image: 'https://images.unsplash.com/photo-1487252665478-49b61b47f302?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8MTB8fHdpbGRsaWZlfGVufDB8fDB8fHww&auto=format&fit=crop&w=800&q=60'
  },
  {
    id: 'plant-diseases',
    title: 'Plant Disease Detection',
    description: 'Collect images of plant diseases to help farmers identify crop issues early using AI.',
    category: 'Agriculture',
    deadline: '2024-07-10',
    pointsPerUpload: 1,
    pointsPerLabel: 1,
    difficulty: 'Medium',
    progress: 42,
    organization: 'AgriTech Solutions',
    tags: ['Agriculture', 'Crops', 'Disease', 'Food Security'],
    image: 'https://images.unsplash.com/photo-1518085250387-2aeb80ed8bd8?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8NHx8cGxhbnR8ZW58MHx8MHx8fDA%3D&auto=format&fit=crop&w=800&q=60'
  },
  {
    id: 'infrastructure-damage',
    title: 'Infrastructure Damage Assessment',
    description: 'Help build a dataset of damaged infrastructure after natural disasters for rapid assessment.',
    category: 'Disaster Response',
    deadline: '2024-06-05',
    pointsPerUpload: 1,
    pointsPerLabel: 1,
    difficulty: 'Hard',
    progress: 28,
    organization: 'DisasterTech',
    tags: ['Infrastructure', 'Disaster', 'Emergency', 'Response'],
    image: 'https://images.unsplash.com/photo-1502920514313-52581002a659?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8Nnx8ZGlzYXN0ZXJ8ZW58MHx8MHx8fDA%3D&auto=format&fit=crop&w=800&q=60'
  },
  {
    id: 'coral-reef-health',
    title: 'Coral Reef Health Monitoring',
    description: 'Collect underwater images of coral reefs to monitor their health and aid conservation efforts.',
    category: 'Marine Conservation',
    deadline: '2024-08-15',
    pointsPerUpload: 1,
    pointsPerLabel: 1,
    difficulty: 'Medium',
    progress: 22,
    organization: 'Reef Guard Initiative',
    tags: ['Marine', 'Conservation', 'Underwater', 'Ecosystem'],
    image: 'https://images.unsplash.com/photo-1546026423-cc4642628d2b?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8M3x8Y29yYWwlMjByZWVmfGVufDB8fDB8fHww&auto=format&fit=crop&w=800&q=60'
  }
];

// Categories for filters
const categories = [
  'All',
  'Environmental',
  'Automotive',
  'Wildlife',
  'Agriculture',
  'Disaster Response',
  'Marine Conservation'
];

// Difficulty levels for filters
const difficultyLevels = ['All', 'Easy', 'Medium', 'Hard'];

const Contribute = () => {
  const navigate = useNavigate();
  const { authenticated, login } = usePrivy();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [selectedDifficulty, setSelectedDifficulty] = useState('All');
  const [displayedTasks, setDisplayedTasks] = useState(allTasks);
  const isMobile = useIsMobile();

  // Filter tasks based on search term, category, and difficulty
  useEffect(() => {
    let filtered = allTasks;
    
    // Filter by search term
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      filtered = filtered.filter(task => 
        task.title.toLowerCase().includes(term) || 
        task.description.toLowerCase().includes(term) ||
        task.tags.some(tag => tag.toLowerCase().includes(term))
      );
    }
    
    // Filter by category
    if (selectedCategory !== 'All') {
      filtered = filtered.filter(task => task.category === selectedCategory);
    }
    
    // Filter by difficulty
    if (selectedDifficulty !== 'All') {
      filtered = filtered.filter(task => task.difficulty === selectedDifficulty);
    }
    
    setDisplayedTasks(filtered);
  }, [searchTerm, selectedCategory, selectedDifficulty]);

  const handleTaskClick = (taskId) => {
    if (!authenticated) {
      login();
      return;
    }
    navigate(`/task/${taskId}`);
  };

  return (
    <div className={`container mx-auto px-4 ${isMobile ? 'pt-20 pb-8' : 'py-16'}`}>
      <div className="flex flex-col md:flex-row justify-between items-center mb-6 gap-4">
        <div>
          <h1 className="text-3xl font-bold">Contribute to Datasets</h1>
          <p className="text-muted-foreground mt-2">Find tasks to contribute to and earn points</p>
        </div>
        
        <div className="self-center">
          <Button 
            onClick={() => navigate('/request')}
            className="flex items-center gap-2"
          >
            <Database className="w-4 h-4" />
            Request New Challenge
          </Button>
        </div>
      </div>
      
      {/* Search and filters */}
      <GlassMorphismCard className="mb-8">
        <div className="flex flex-col md:flex-row gap-4 p-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
            <Input
              placeholder="Search tasks, keywords, tags..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
          
          <div className="flex gap-3 flex-wrap md:flex-nowrap">
            <div className="flex items-center gap-2">
              <Filter className="w-4 h-4 text-muted-foreground" />
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="border rounded-md px-3 py-2 text-sm bg-background"
              >
                {categories.map(category => (
                  <option key={category} value={category}>{category}</option>
                ))}
              </select>
            </div>
            
            <div className="flex items-center gap-2">
              <Tag className="w-4 h-4 text-muted-foreground" />
              <select
                value={selectedDifficulty}
                onChange={(e) => setSelectedDifficulty(e.target.value)}
                className="border rounded-md px-3 py-2 text-sm bg-background"
              >
                {difficultyLevels.map(level => (
                  <option key={level} value={level}>{level}</option>
                ))}
              </select>
            </div>
          </div>
        </div>
      </GlassMorphismCard>
      
      {/* Tasks grid */}
      {displayedTasks.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
          {displayedTasks.map(task => (
            <Card 
              key={task.id} 
              className="overflow-hidden transition-all hover:shadow-lg cursor-pointer"
              onClick={() => handleTaskClick(task.id)}
            >
              <div className="h-40 overflow-hidden">
                <img 
                  src={task.image} 
                  alt={task.title} 
                  className="w-full h-full object-cover transition-transform hover:scale-105"
                />
              </div>
              
              <CardHeader className="pb-2">
                <div className="flex flex-wrap gap-2 mb-2">
                  <Badge variant="secondary">{task.category}</Badge>
                  <Badge 
                    variant={
                      task.difficulty === 'Easy' ? 'default' : 
                      task.difficulty === 'Medium' ? 'secondary' : 'destructive'
                    }
                    className={
                      task.difficulty === 'Easy' ? 'bg-green-500' : 
                      task.difficulty === 'Medium' ? 'bg-amber-500' : 'bg-red-500'
                    }
                  >
                    {task.difficulty}
                  </Badge>
                </div>
                <CardTitle className="text-xl">{task.title}</CardTitle>
                <div className="text-sm text-muted-foreground">by {task.organization}</div>
              </CardHeader>
              
              <CardContent className="pb-2">
                <p className="text-sm text-muted-foreground line-clamp-2">{task.description}</p>
                
                <div className="flex flex-wrap gap-1 mt-3">
                  {task.tags.slice(0, 3).map(tag => (
                    <span key={tag} className="text-xs bg-muted px-2 py-1 rounded-full">
                      {tag}
                    </span>
                  ))}
                  {task.tags.length > 3 && (
                    <span className="text-xs bg-muted px-2 py-1 rounded-full">
                      +{task.tags.length - 3}
                    </span>
                  )}
                </div>
              </CardContent>
              
              <CardFooter className="flex flex-col gap-3 pt-0">
                <div className="flex justify-between w-full text-sm">
                  <div className="flex items-center gap-1">
                    <Award className="w-4 h-4 text-amber-500" />
                    <span>{task.pointsPerUpload}+{task.pointsPerLabel} pts</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Calendar className="w-4 h-4 text-muted-foreground" />
                    <span>Due: {task.deadline}</span>
                  </div>
                </div>
                
                <div className="w-full">
                  <div className="flex justify-between mb-1 text-xs">
                    <span>Progress</span>
                    <span>{task.progress}%</span>
                  </div>
                  <Progress value={task.progress} className="h-1.5" />
                </div>
              </CardFooter>
            </Card>
          ))}
        </div>
      ) : (
        <div className="text-center py-16">
          <Search className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
          <h3 className="text-xl font-medium">No tasks match your search</h3>
          <p className="text-muted-foreground mt-2">Try adjusting your filters or search terms</p>
          <Button 
            variant="outline" 
            className="mt-4"
            onClick={() => {
              setSearchTerm('');
              setSelectedCategory('All');
              setSelectedDifficulty('All');
            }}
          >
            Clear Filters
          </Button>
        </div>
      )}
    </div>
  );
};

export default Contribute;
