import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import GlassMorphismCard from '@/components/ui/GlassMorphismCard';
import { Award, Upload, Database, Shield, Clock, Calendar, CheckCircle, Filter } from 'lucide-react';
import { Progress } from '@/components/ui/progress';
import { usePrivy } from '@privy-io/react-auth';

// Task mock data
const availableTasks = [
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
    image: 'https://images.unsplash.com/photo-1487252665478-49b61b47f302?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8MTB8fHdpbGRsaWZlfGVufDB8fDB8fHww&auto=format&fit=crop&w=800&q=60'
  }
];

// Contribution stats mock data
const contributionStats = {
  totalPoints: 475,
  uploads: 18,
  preprocessing: 12,
  verified: 15,
  trustLevel: 'Contributor',
  nextLevel: {
    name: 'Expert',
    pointsRequired: 750,
    pointsRemaining: 275
  }
};

const Dashboard = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { authenticated, login } = usePrivy();
  const [filter, setFilter] = useState('all');

  const handleTaskClick = (taskId: string) => {
    if (!authenticated) {
      login();
      return;
    }
    navigate(`/task/${taskId}`);
  };

  const filteredTasks = filter === 'all' 
    ? availableTasks 
    : availableTasks.filter(task => task.category.toLowerCase() === filter.toLowerCase());

  return (
    <div className="container mx-auto px-4 py-16">
      <h1 className="text-3xl font-bold mb-8">Dashboard</h1>
      
      <div className="mb-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-10">
          {/* User stats card */}
          <GlassMorphismCard className="lg:col-span-1">
            <div className="flex items-center mb-4">
              <div className="w-16 h-16 rounded-full bg-primary/20 flex items-center justify-center mr-4">
                <Award className="w-8 h-8 text-primary" />
              </div>
              <div>
                <h2 className="text-2xl font-bold">{contributionStats.totalPoints}</h2>
                <p className="text-muted-foreground">Total Points</p>
              </div>
            </div>
            
            <div className="mb-6">
              <div className="flex justify-between mb-1">
                <span className="text-sm">Trust Level: {contributionStats.trustLevel}</span>
                <span className="text-sm">{contributionStats.totalPoints}/{contributionStats.nextLevel.pointsRequired}</span>
              </div>
              <Progress value={(contributionStats.totalPoints / contributionStats.nextLevel.pointsRequired) * 100} className="h-2" />
              <p className="text-xs text-muted-foreground mt-1">
                {contributionStats.nextLevel.pointsRemaining} more points to reach {contributionStats.nextLevel.name} level
              </p>
            </div>
            
            <div className="grid grid-cols-3 gap-4 mb-6">
              <div className="bg-background p-3 rounded-lg text-center">
                <p className="text-2xl font-bold">{contributionStats.uploads}</p>
                <p className="text-xs text-muted-foreground">Uploads</p>
              </div>
              <div className="bg-background p-3 rounded-lg text-center">
                <p className="text-2xl font-bold">{contributionStats.preprocessing}</p>
                <p className="text-xs text-muted-foreground">Labeled</p>
              </div>
              <div className="bg-background p-3 rounded-lg text-center">
                <p className="text-2xl font-bold">{contributionStats.verified}</p>
                <p className="text-xs text-muted-foreground">Verified</p>
              </div>
            </div>
            
            <div>
              <h3 className="font-semibold mb-3">Recent Activity</h3>
              <div className="space-y-3">
                <div className="flex items-center text-sm">
                  <Calendar className="w-4 h-4 mr-2 text-muted-foreground" />
                  <p>Uploaded 3 images to "Oil Spill Detection" - 2 days ago</p>
                </div>
                <div className="flex items-center text-sm">
                  <Database className="w-4 h-4 mr-2 text-muted-foreground" />
                  <p>Labeled 5 images with metadata - 3 days ago</p>
                </div>
                <div className="flex items-center text-sm">
                  <Shield className="w-4 h-4 mr-2 text-muted-foreground" />
                  <p>Registered IP for wildlife dataset - 1 week ago</p>
                </div>
              </div>
            </div>
          </GlassMorphismCard>
          
          {/* Available tasks */}
          <div className="lg:col-span-2">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-bold">Available Tasks</h2>
              <div className="flex items-center gap-2">
                <Filter className="w-4 h-4 text-muted-foreground" />
                <select
                  value={filter}
                  onChange={(e) => setFilter(e.target.value)}
                  className="text-sm border-none bg-background rounded-md"
                >
                  <option value="all">All Categories</option>
                  <option value="environmental">Environmental</option>
                  <option value="automotive">Automotive</option>
                  <option value="wildlife">Wildlife</option>
                </select>
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {filteredTasks.map(task => (
                <GlassMorphismCard
                  key={task.id}
                  className="cursor-pointer hover:shadow-lg transition-shadow"
                  hoverEffect={true}
                  onClick={() => handleTaskClick(task.id)}
                >
                  <div className="h-40 mb-4 rounded-lg overflow-hidden">
                    <img
                      src={task.image}
                      alt={task.title}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  
                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-xs font-medium bg-primary/10 text-primary px-2 py-0.5 rounded-full">
                      {task.category}
                    </span>
                    <span className="text-xs font-medium bg-secondary/10 text-secondary px-2 py-0.5 rounded-full">
                      {task.difficulty}
                    </span>
                  </div>
                  
                  <h3 className="text-lg font-bold mb-2">{task.title}</h3>
                  <p className="text-sm text-muted-foreground mb-4">{task.description}</p>
                  
                  <div className="flex justify-between text-sm mb-3">
                    <div className="flex items-center gap-1">
                      <Award className="w-4 h-4 text-amber-500" />
                      <span>{task.pointsPerUpload}+{task.pointsPerLabel} pts</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Clock className="w-4 h-4 text-muted-foreground" />
                      <span>Due: {task.deadline}</span>
                    </div>
                  </div>
                  
                  <div>
                    <div className="flex justify-between mb-1 text-xs">
                      <span>Progress</span>
                      <span>{task.progress}%</span>
                    </div>
                    <Progress value={task.progress} className="h-1.5" />
                  </div>
                </GlassMorphismCard>
              ))}
            </div>
          </div>
        </div>
        
        {/* Recent contributions */}
        <GlassMorphismCard>
          <h2 className="text-xl font-bold mb-4">Your Contributions</h2>
          
          {contributionStats.uploads > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
              <div className="bg-background p-4 rounded-lg flex items-start gap-3">
                <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center">
                  <Upload className="w-5 h-5 text-blue-600" />
                </div>
                <div>
                  <h3 className="font-medium">Oil Spill Dataset</h3>
                  <p className="text-sm text-muted-foreground">3 images uploaded</p>
                  <div className="flex items-center gap-1 mt-1 text-xs text-green-600">
                    <CheckCircle className="w-3 h-3" />
                    <span>Verified</span>
                  </div>
                </div>
              </div>
              
              <div className="bg-background p-4 rounded-lg flex items-start gap-3">
                <div className="w-10 h-10 rounded-full bg-purple-100 flex items-center justify-center">
                  <Database className="w-5 h-5 text-purple-600" />
                </div>
                <div>
                  <h3 className="font-medium">Flat Tire Recognition</h3>
                  <p className="text-sm text-muted-foreground">5 images labeled</p>
                  <div className="flex items-center gap-1 mt-1 text-xs text-green-600">
                    <CheckCircle className="w-3 h-3" />
                    <span>Verified</span>
                  </div>
                </div>
              </div>
              
              <div className="bg-background p-4 rounded-lg flex items-start gap-3">
                <div className="w-10 h-10 rounded-full bg-amber-100 flex items-center justify-center">
                  <Shield className="w-5 h-5 text-amber-600" />
                </div>
                <div>
                  <h3 className="font-medium">Wildlife Dataset</h3>
                  <p className="text-sm text-muted-foreground">IP registered</p>
                  <div className="flex items-center gap-1 mt-1 text-xs text-amber-600">
                    <Clock className="w-3 h-3" />
                    <span>Pending</span>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="text-center py-8">
              <Upload className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-medium mb-2">No contributions yet</h3>
              <p className="text-muted-foreground mb-4">
                Start by uploading data for available tasks to earn points and rewards.
              </p>
              <button
                onClick={() => navigate('/task/oil-spills')}
                className="px-4 py-2 bg-primary text-white rounded-md"
              >
                Start Contributing
              </button>
            </div>
          )}
        </GlassMorphismCard>
      </div>
    </div>
  );
};

export default Dashboard;
