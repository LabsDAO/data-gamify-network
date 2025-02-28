
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Upload, FileText, Award, Database, Plus, User, BarChart3, Clock } from 'lucide-react';
import GlassMorphismCard from '@/components/ui/GlassMorphismCard';
import AnimatedNumber from '@/components/ui/AnimatedNumber';
import { useAuth } from '@/hooks/useAuth';
import { cn } from '@/lib/utils';

const Dashboard = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [isLoading, setIsLoading] = useState(true);
  const [recentActivity, setRecentActivity] = useState<any[]>([]);

  // Mock activity data
  const mockActivity = [
    { id: 1, type: 'upload', description: 'Uploaded 5 images', timestamp: new Date(Date.now() - 3600000).toISOString(), points: 50 },
    { id: 2, type: 'preprocess', description: 'Added metadata to 10 files', timestamp: new Date(Date.now() - 86400000).toISOString(), points: 25 },
    { id: 3, type: 'register', description: 'Registered IP for 2 datasets', timestamp: new Date(Date.now() - 172800000).toISOString(), points: 20 },
  ];

  useEffect(() => {
    // Simulate loading data
    const timer = setTimeout(() => {
      setRecentActivity(mockActivity);
      setIsLoading(false);
    }, 1000);

    return () => clearTimeout(timer);
  }, []);

  const getActivityIcon = (type: string) => {
    switch (type) {
      case 'upload':
        return <Upload className="w-5 h-5 text-blue-500" />;
      case 'preprocess':
        return <FileText className="w-5 h-5 text-violet-500" />;
      case 'register':
        return <Database className="w-5 h-5 text-emerald-500" />;
      default:
        return <Clock className="w-5 h-5 text-gray-500" />;
    }
  };

  const formatTimestamp = (timestamp: string) => {
    const date = new Date(timestamp);
    return date.toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const actionCards = [
    {
      title: 'Upload Data',
      description: 'Add new images, audio, or video files',
      icon: Upload,
      color: 'from-blue-500 to-cyan-500',
      action: () => navigate('/upload')
    },
    {
      title: 'Preprocess Data',
      description: 'Add metadata to your uploaded files',
      icon: FileText,
      color: 'from-violet-500 to-purple-500',
      action: () => navigate('/preprocess')
    },
    {
      title: 'Register IP',
      description: 'Register your data as intellectual property',
      icon: Database,
      color: 'from-emerald-500 to-green-500',
      action: () => navigate('/register')
    },
    {
      title: 'View Leaderboard',
      description: 'See how you rank among contributors',
      icon: Award,
      color: 'from-amber-500 to-orange-500',
      action: () => navigate('/leaderboard')
    },
  ];

  if (!user) {
    navigate('/');
    return null;
  }

  return (
    <div className="min-h-screen pt-24 pb-16 px-6">
      <div className="container mx-auto animate-fade-in">
        <h1 className="text-3xl font-bold mb-8">Dashboard</h1>
        
        {/* Stats Overview */}
        <section className="mb-10">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <GlassMorphismCard className="animate-slide-up" style={{ animationDelay: '100ms' }}>
              <div className="flex items-center gap-4">
                <div className="bg-gradient-to-r from-blue-500 to-cyan-500 w-12 h-12 rounded-full flex items-center justify-center">
                  <Award className="w-6 h-6 text-white" />
                </div>
                <div>
                  <p className="text-muted-foreground text-sm">Total Points</p>
                  <h3 className="text-2xl font-bold">
                    <AnimatedNumber 
                      value={user?.points || 0} 
                      duration={1500}
                    />
                  </h3>
                </div>
              </div>
            </GlassMorphismCard>
            
            <GlassMorphismCard className="animate-slide-up" style={{ animationDelay: '200ms' }}>
              <div className="flex items-center gap-4">
                <div className="bg-gradient-to-r from-violet-500 to-purple-500 w-12 h-12 rounded-full flex items-center justify-center">
                  <User className="w-6 h-6 text-white" />
                </div>
                <div>
                  <p className="text-muted-foreground text-sm">Trust Level</p>
                  <h3 className="text-2xl font-bold">{user?.trustLevel}</h3>
                </div>
              </div>
            </GlassMorphismCard>
            
            <GlassMorphismCard className="animate-slide-up" style={{ animationDelay: '300ms' }}>
              <div className="flex items-center gap-4">
                <div className="bg-gradient-to-r from-emerald-500 to-green-500 w-12 h-12 rounded-full flex items-center justify-center">
                  <BarChart3 className="w-6 h-6 text-white" />
                </div>
                <div>
                  <p className="text-muted-foreground text-sm">Account Type</p>
                  <h3 className="text-2xl font-bold">{user?.isOrganization ? 'Organization' : 'Contributor'}</h3>
                </div>
              </div>
            </GlassMorphismCard>
          </div>
        </section>
        
        {/* Actions Grid */}
        <section className="mb-10">
          <h2 className="text-2xl font-bold mb-4">Quick Actions</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {actionCards.map((card, index) => (
              <GlassMorphismCard
                key={index}
                hoverEffect={true}
                className="h-full cursor-pointer animate-slide-up"
                style={{ animationDelay: `${(index + 3) * 100}ms` }}
                onClick={card.action}
              >
                <div className={cn(
                  "w-12 h-12 rounded-full flex items-center justify-center mb-4 bg-gradient-to-r",
                  card.color
                )}>
                  <card.icon className="w-6 h-6 text-white" />
                </div>
                <h3 className="text-xl font-bold mb-2">{card.title}</h3>
                <p className="text-muted-foreground">{card.description}</p>
              </GlassMorphismCard>
            ))}
          </div>
        </section>
        
        {/* Recent Activity */}
        <section>
          <h2 className="text-2xl font-bold mb-4">Recent Activity</h2>
          <GlassMorphismCard className="animate-slide-up" style={{ animationDelay: '700ms' }}>
            {isLoading ? (
              <div className="flex justify-center items-center py-10">
                <div className="animate-pulse-subtle">Loading recent activity...</div>
              </div>
            ) : recentActivity.length > 0 ? (
              <ul className="divide-y divide-border">
                {recentActivity.map((activity) => (
                  <li key={activity.id} className="py-4 first:pt-0 last:pb-0">
                    <div className="flex items-center gap-4">
                      <div className="p-2 rounded-full bg-secondary">
                        {getActivityIcon(activity.type)}
                      </div>
                      <div className="flex-1">
                        <p className="font-medium">{activity.description}</p>
                        <p className="text-sm text-muted-foreground">
                          {formatTimestamp(activity.timestamp)}
                        </p>
                      </div>
                      <div className="text-right">
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200">
                          +{activity.points} pts
                        </span>
                      </div>
                    </div>
                  </li>
                ))}
              </ul>
            ) : (
              <div className="text-center py-8">
                <p className="text-muted-foreground">No recent activity found</p>
                <button 
                  onClick={() => navigate('/upload')}
                  className="mt-4 inline-flex items-center gap-2 px-4 py-2 bg-primary text-white rounded-full text-sm"
                >
                  <Plus className="w-4 h-4" />
                  Add New Activity
                </button>
              </div>
            )}
          </GlassMorphismCard>
        </section>
      </div>
    </div>
  );
};

export default Dashboard;
