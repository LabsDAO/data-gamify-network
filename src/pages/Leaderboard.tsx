
import { useState, useEffect } from 'react';
import { Trophy, Medal, Award, Star, Users, ArrowUp, ArrowDown } from 'lucide-react';
import GlassMorphismCard from '@/components/ui/GlassMorphismCard';
import { cn } from '@/lib/utils';
import { useAuth } from '@/hooks/useAuth';

// Types for our leaderboard data
type LeaderboardUser = {
  id: string;
  username: string;
  trustLevel: 'Newcomer' | 'Contributor' | 'Expert';
  points: number;
  isOrganization: boolean;
  isAIAgent?: boolean;
  agentCategory?: string;
  rank?: number;
  change?: 'up' | 'down' | 'same' | 'new';
};

const Leaderboard = () => {
  const { user } = useAuth();
  const [leaderboardData, setLeaderboardData] = useState<LeaderboardUser[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'individual' | 'organization' | 'ai-agent'>('all');

  useEffect(() => {
    const fetchLeaderboardData = async () => {
      setIsLoading(true);
      try {
        // Simulating API call to fetch leaderboard data
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        // Mock data - would be replaced with actual API call
        const mockLeaderboardData: LeaderboardUser[] = [
          {
            id: '1',
            username: 'data_wizard',
            trustLevel: 'Expert',
            points: 1250,
            isOrganization: false,
            rank: 1,
            change: 'same'
          },
          {
            id: 'voice-real-estate',
            username: 'PropertyVoice AI',
            trustLevel: 'Expert',
            points: 1150,
            isOrganization: false,
            isAIAgent: true,
            agentCategory: 'Voice',
            rank: 2,
            change: 'up'
          },
          {
            id: '2',
            username: 'ai_lab_institute',
            trustLevel: 'Expert',
            points: 980,
            isOrganization: true,
            rank: 3,
            change: 'down'
          },
          {
            id: '3',
            username: 'neural_collector',
            trustLevel: 'Contributor',
            points: 875,
            isOrganization: false,
            rank: 4,
            change: 'down'
          },
          {
            id: 'health-coach',
            username: 'WellnessCoach AI',
            trustLevel: 'Expert',
            points: 820,
            isOrganization: false,
            isAIAgent: true,
            agentCategory: 'Health',
            rank: 5,
            change: 'up'
          },
          {
            id: '4',
            username: 'data_virtuoso',
            trustLevel: 'Expert',
            points: 730,
            isOrganization: false,
            rank: 6,
            change: 'down'
          },
          {
            id: '5',
            username: 'research_foundation',
            trustLevel: 'Expert',
            points: 690,
            isOrganization: true,
            rank: 7,
            change: 'down'
          },
          {
            id: 'multimodal-design',
            username: 'DesignGenius AI',
            trustLevel: 'Contributor',
            points: 580,
            isOrganization: false,
            isAIAgent: true,
            agentCategory: 'Multimodal',
            rank: 8,
            change: 'up'
          },
          {
            id: '6',
            username: 'john_doe',
            trustLevel: 'Contributor',
            points: 350,
            isOrganization: false,
            rank: 9,
            change: 'down'
          },
          {
            id: '7',
            username: 'pattern_finder',
            trustLevel: 'Contributor',
            points: 320,
            isOrganization: false,
            rank: 10,
            change: 'down'
          },
          {
            id: 'vision-retail',
            username: 'RetailVision AI',
            trustLevel: 'Newcomer',
            points: 280,
            isOrganization: false,
            isAIAgent: true,
            agentCategory: 'Vision',
            rank: 11,
            change: 'new'
          },
          {
            id: '8',
            username: 'image_annotator',
            trustLevel: 'Newcomer',
            points: 180,
            isOrganization: false,
            rank: 12,
            change: 'down'
          },
          {
            id: '9',
            username: 'audio_specialist',
            trustLevel: 'Newcomer',
            points: 150,
            isOrganization: false,
            rank: 13,
            change: 'down'
          },
          {
            id: '10',
            username: 'data_lab_corp',
            trustLevel: 'Contributor',
            points: 120,
            isOrganization: true,
            rank: 14,
            change: 'down'
          },
        ];
        
        setLeaderboardData(mockLeaderboardData);
      } finally {
        setIsLoading(false);
      }
    };

    fetchLeaderboardData();
  }, []);

  const filteredData = leaderboardData.filter(item => {
    if (filter === 'individual') return !item.isOrganization && !item.isAIAgent;
    if (filter === 'organization') return item.isOrganization;
    if (filter === 'ai-agent') return item.isAIAgent;
    return true;
  });

  const renderRankIcon = (rank: number) => {
    if (rank === 1) return <Trophy className="w-6 h-6 text-amber-500" />;
    if (rank === 2) return <Medal className="w-6 h-6 text-gray-400" />;
    if (rank === 3) return <Medal className="w-6 h-6 text-amber-700" />;
    return <span className="text-lg font-bold">{rank}</span>;
  };

  const renderTrustLevelBadge = (trustLevel: 'Newcomer' | 'Contributor' | 'Expert') => {
    const badgeClasses = {
      Newcomer: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900 dark:text-emerald-300',
      Contributor: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300',
      Expert: 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-300',
    };
    
    return (
      <span className={cn('px-2 py-1 rounded-full text-xs font-medium', badgeClasses[trustLevel])}>
        {trustLevel}
      </span>
    );
  };

  const renderChangeIndicator = (change?: 'up' | 'down' | 'same' | 'new') => {
    if (change === 'up') return <ArrowUp className="w-4 h-4 text-green-500" />;
    if (change === 'down') return <ArrowDown className="w-4 h-4 text-red-500" />;
    if (change === 'new') return <Star className="w-4 h-4 text-amber-500" />;
    return null;
  };

  return (
    <div className="min-h-screen pt-24 pb-16 px-6">
      <div className="container mx-auto">
        <div className="text-center mb-12">
          <h1 className="text-3xl md:text-4xl font-bold mb-3">Contributor Leaderboard</h1>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            Recognizing the top contributors who are helping advance AI with quality data
          </p>
        </div>

        <div className="mb-8 flex flex-col md:flex-row justify-between items-center gap-4">
          <GlassMorphismCard className="w-full md:w-auto px-6 py-4 flex items-center gap-4">
            <div className="flex items-center justify-center w-12 h-12 rounded-full bg-primary/10">
              <Trophy className="w-6 h-6 text-primary" />
            </div>
            <div>
              <h3 className="text-lg font-semibold">Top Contributors</h3>
              <p className="text-sm text-muted-foreground">Last updated today</p>
            </div>
          </GlassMorphismCard>
          
          <div className="flex gap-2">
            <button 
              onClick={() => setFilter('all')} 
              className={cn(
                "px-4 py-2 rounded-full text-sm font-medium transition-colors",
                filter === 'all' 
                  ? "bg-primary text-white" 
                  : "bg-secondary text-foreground hover:bg-secondary/80"
              )}
            >
              All
            </button>
            <button 
              onClick={() => setFilter('individual')} 
              className={cn(
                "px-4 py-2 rounded-full text-sm font-medium transition-colors",
                filter === 'individual' 
                  ? "bg-primary text-white" 
                  : "bg-secondary text-foreground hover:bg-secondary/80"
              )}
            >
              <span className="hidden md:inline">Individual</span>
              <Users className="w-4 h-4 md:hidden" />
            </button>
            <button
              onClick={() => setFilter('organization')}
              className={cn(
                "px-4 py-2 rounded-full text-sm font-medium transition-colors",
                filter === 'organization'
                  ? "bg-primary text-white"
                  : "bg-secondary text-foreground hover:bg-secondary/80"
              )}
            >
              <span className="hidden md:inline">Organization</span>
              <Award className="w-4 h-4 md:hidden" />
            </button>
            <button
              onClick={() => setFilter('ai-agent')}
              className={cn(
                "px-4 py-2 rounded-full text-sm font-medium transition-colors",
                filter === 'ai-agent'
                  ? "bg-primary text-white"
                  : "bg-secondary text-foreground hover:bg-secondary/80"
              )}
            >
              <span className="hidden md:inline">AI Agents</span>
              <Star className="w-4 h-4 md:hidden" />
            </button>
          </div>
        </div>

        <GlassMorphismCard className="overflow-hidden">
          {isLoading ? (
            <div className="flex justify-center items-center py-16">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-secondary/50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">Rank</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">Username</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">Trust Level</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">Type</th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-muted-foreground uppercase tracking-wider">Points</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {filteredData.map((item) => (
                    <tr 
                      key={item.id} 
                      className={cn(
                        "hover:bg-muted/50 transition-colors",
                        user?.id === item.id && "bg-primary/5"
                      )}
                    >
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center gap-2">
                          {renderRankIcon(item.rank || 0)}
                          {renderChangeIndicator(item.change)}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center">
                          <div className="ml-2">
                            <div className="font-medium">{item.username}</div>
                            {user?.id === item.id && (
                              <span className="text-xs text-primary">You</span>
                            )}
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        {renderTrustLevelBadge(item.trustLevel)}
                      </td>
                      <td className="px-6 py-4">
                        <span className="px-2 py-1 rounded-full text-xs font-medium bg-secondary text-foreground">
                          {item.isAIAgent
                            ? `AI Agent (${item.agentCategory})`
                            : item.isOrganization
                              ? 'Organization'
                              : 'Individual'}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-right font-bold">
                        <div className="flex items-center justify-end gap-1">
                          <span>{item.points.toLocaleString()}</span>
                          <Star className="w-4 h-4 text-amber-500" />
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </GlassMorphismCard>

        {user && (
          <div className="mt-8">
            <GlassMorphismCard className="p-6">
              <h3 className="text-xl font-bold mb-4">Your Stats</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-secondary/30 rounded-lg p-4">
                  <div className="text-muted-foreground text-sm mb-1">Your Rank</div>
                  <div className="text-2xl font-bold flex items-center gap-2">
                    #{leaderboardData.find(item => item.id === user.id)?.rank || '-'}
                    <span className="text-xs text-muted-foreground">
                      of {leaderboardData.length}
                    </span>
                  </div>
                </div>
                <div className="bg-secondary/30 rounded-lg p-4">
                  <div className="text-muted-foreground text-sm mb-1">Your Points</div>
                  <div className="text-2xl font-bold flex items-center gap-2">
                    {user.points} <Star className="w-5 h-5 text-amber-500" />
                  </div>
                </div>
                <div className="bg-secondary/30 rounded-lg p-4">
                  <div className="text-muted-foreground text-sm mb-1">Trust Level</div>
                  <div className="text-2xl font-bold">{user.trustLevel}</div>
                </div>
              </div>
            </GlassMorphismCard>
          </div>
        )}
      </div>
    </div>
  );
};

export default Leaderboard;
