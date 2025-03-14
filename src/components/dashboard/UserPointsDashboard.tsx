import React, { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { getUserUploadHistory, getUserTotalPoints, UploadRecord } from '@/utils/userPointsTracker';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import AnimatedNumber from '@/components/ui/AnimatedNumber';
import { Separator } from '@/components/ui/separator';
import { toast } from '@/components/ui/use-toast';

/**
 * Dashboard component that displays user points and upload history
 */
const UserPointsDashboard: React.FC = () => {
  const { user } = useAuth();
  const [uploadHistory, setUploadHistory] = useState<UploadRecord[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [totalPoints, setTotalPoints] = useState(0);
  const [pointsByProvider, setPointsByProvider] = useState<{
    AWS: number;
    OORT: number;
  }>({ AWS: 0, OORT: 0 });

  // Load user's upload history and points
  useEffect(() => {
    if (!user) return;
    
    const loadData = async () => {
      setIsLoading(true);
      try {
        // Load upload history
        const history = await getUserUploadHistory(user.id);
        setUploadHistory(history);
        
        // Calculate points by provider
        const awsPoints = history
          .filter(record => record.storage_provider === 'AWS')
          .reduce((sum, record) => sum + record.points_awarded, 0);
          
        const oortPoints = history
          .filter(record => record.storage_provider === 'OORT')
          .reduce((sum, record) => sum + record.points_awarded, 0);
          
        setPointsByProvider({
          AWS: awsPoints,
          OORT: oortPoints
        });
        
        // Get total points from Supabase (this might differ from user.points if there are other ways to earn points)
        const supabasePoints = await getUserTotalPoints(user.id);
        setTotalPoints(supabasePoints);
      } catch (error) {
        console.error('Failed to load user data:', error);
        toast({
          title: "Error loading data",
          description: "Could not load your upload history and points.",
          variant: "destructive",
        });
      } finally {
        setIsLoading(false);
      }
    };
    
    loadData();
  }, [user]);

  // Group uploads by date
  const groupedUploads = React.useMemo(() => {
    const grouped: Record<string, UploadRecord[]> = {};
    
    uploadHistory.forEach(record => {
      const date = new Date(record.created_at || Date.now()).toLocaleDateString();
      if (!grouped[date]) {
        grouped[date] = [];
      }
      grouped[date].push(record);
    });
    
    return grouped;
  }, [uploadHistory]);

  if (!user) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>User Dashboard</CardTitle>
          <CardDescription>
            Please log in to view your dashboard
          </CardDescription>
        </CardHeader>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Your Points Dashboard</CardTitle>
          <CardDescription>
            Track your contributions and earned points
          </CardDescription>
        </CardHeader>
        
        <CardContent>
          <div className="flex justify-center mb-6">
            <Card className="w-full max-w-md">
              <CardHeader className="pb-2 text-center">
                <CardTitle className="text-xl">Total Points Earned</CardTitle>
                <CardDescription>1 point per image upload</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-center">
                  <AnimatedNumber
                    value={user.points}
                    className="text-6xl font-bold text-primary"
                  />
                </div>
              </CardContent>
            </Card>
          </div>
          
          <div className="mt-6">
            <h3 className="text-lg font-medium mb-2">Trust Level</h3>
            <div className="flex items-center space-x-2">
              <Badge variant={
                user.trustLevel === 'Expert' ? 'default' :
                user.trustLevel === 'Contributor' ? 'secondary' : 'outline'
              }>
                {user.trustLevel}
              </Badge>
              <span className="text-sm text-muted-foreground">
                {user.trustLevel === 'Expert' ? 'You are an expert contributor!' :
                 user.trustLevel === 'Contributor' ? 'You are a valued contributor!' :
                 'Keep uploading to increase your trust level!'}
              </span>
            </div>
          </div>
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader>
          <CardTitle>Upload History</CardTitle>
          <CardDescription>
            Your recent data contributions
          </CardDescription>
        </CardHeader>
        
        <CardContent>
          {isLoading ? (
            <div className="text-center py-8">Loading your upload history...</div>
          ) : uploadHistory.length > 0 ? (
            <div>
              <h3 className="text-lg font-medium mb-4">Your Upload History</h3>
              {Object.entries(groupedUploads).map(([date, records]) => (
                <div key={date} className="mb-6">
                  <h3 className="text-sm font-medium text-muted-foreground mb-2">{date}</h3>
                  <div className="space-y-3">
                    {records.map((record, index) => (
                      <UploadHistoryItem key={index} record={record} />
                    ))}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-muted-foreground">
              No upload history found. Start uploading images to earn points!
            </div>
          )}
        </CardContent>
        
        <CardFooter>
          <Button
            variant="outline"
            onClick={() => {
              if (!user) return;
              
              setIsLoading(true);
              getUserUploadHistory(user.id)
                .then(history => {
                  setUploadHistory(history);
                  toast({
                    title: "History refreshed",
                    description: "Your upload history has been updated.",
                  });
                })
                .catch(error => {
                  console.error('Failed to refresh history:', error);
                  toast({
                    title: "Refresh failed",
                    description: "Could not refresh your upload history.",
                    variant: "destructive",
                  });
                })
                .finally(() => setIsLoading(false));
            }}
            disabled={isLoading}
            className="w-full"
          >
            {isLoading ? 'Refreshing...' : 'Refresh History'}
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
};

// Helper component to display an individual upload record
const UploadHistoryItem: React.FC<{ record: UploadRecord }> = ({ record }) => {
  // Determine if the file is an image
  const isImage = record.file_type.startsWith('image/');
  
  return (
    <div className="border rounded-md p-4">
      <div className="flex justify-between items-start">
        <div>
          <div className="font-medium">{record.file_name}</div>
          <div className="text-sm text-muted-foreground mt-1">
            {new Date(record.created_at || '').toLocaleTimeString()}
          </div>
        </div>
        {isImage && <Badge variant="default">Image</Badge>}
      </div>
      
      <div className="grid grid-cols-2 gap-2 mt-2 text-sm">
        <div>Size: {(record.file_size / 1024).toFixed(2)} KB</div>
        <div>Type: {record.file_type.split('/')[1] || record.file_type}</div>
      </div>
      
      <div className="mt-2 flex justify-between items-center">
        <div className="font-medium text-primary">
          +{record.points_awarded} point
        </div>
        <a
          href={record.upload_url}
          target="_blank"
          rel="noopener noreferrer"
          className="text-primary hover:underline text-sm"
        >
          View {isImage ? 'Image' : 'File'}
        </a>
      </div>
    </div>
  );
};

export default UserPointsDashboard;