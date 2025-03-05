import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Database, 
  Search, 
  Filter, 
  Tag, 
  Loader2,
  BookOpen,
  BarChart3
} from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { toast } from '@/hooks/use-toast';

// Dataset type for TypeScript
type Dataset = {
  id: string;
  name: string;
  description: string;
  owner: string;
  ownerName: string;
  size: number;
  fileCount: number;
  dataType: 'image' | 'audio' | 'video' | 'text' | 'mixed';
  creationDate: string;
  isPublished: boolean;
  previewUrl?: string;
  price: string;
  currency: string;
  tags: string[];
  downloads: number;
  rating: number;
};

// Mock dataset for demonstration
const MOCK_DATASETS: Dataset[] = [
  {
    id: 'dataset-1',
    name: 'Image Classification Dataset',
    description: 'A curated collection of labeled images for training image classification models.',
    owner: 'user123',
    ownerName: 'AI Research Lab',
    size: 1.2, // GB
    fileCount: 5000,
    dataType: 'image',
    creationDate: '2025-02-15T12:00:00Z',
    isPublished: true,
    previewUrl: 'https://example.com/preview1.jpg',
    price: '0.05',
    currency: 'ETH',
    tags: ['computer vision', 'classification', 'labeled'],
    downloads: 128,
    rating: 4.7
  },
  {
    id: 'dataset-2',
    name: 'Conversational AI Training Corpus',
    description: 'High-quality conversational data for training chatbots and dialogue systems.',
    owner: 'user456',
    ownerName: 'NLP Innovations',
    size: 0.8, // GB
    fileCount: 12000,
    dataType: 'text',
    creationDate: '2025-02-20T15:30:00Z',
    isPublished: true,
    previewUrl: 'https://example.com/preview2.jpg',
    price: '0.03',
    currency: 'ETH',
    tags: ['nlp', 'conversations', 'dialogue'],
    downloads: 85,
    rating: 4.5
  },
  {
    id: 'dataset-3',
    name: 'Environmental Sound Collection',
    description: 'Diverse collection of environmental sounds for audio recognition models.',
    owner: 'user789',
    ownerName: 'Audio Research Group',
    size: 2.5, // GB
    fileCount: 3000,
    dataType: 'audio',
    creationDate: '2025-02-25T09:15:00Z',
    isPublished: true,
    previewUrl: 'https://example.com/preview3.jpg',
    price: '0.08',
    currency: 'ETH',
    tags: ['audio', 'environmental', 'recognition'],
    downloads: 42,
    rating: 4.2
  },
  {
    id: 'dataset-4',
    name: 'Medical Imaging Dataset',
    description: 'Anonymized medical images for healthcare AI research and development.',
    owner: 'user101',
    ownerName: 'HealthTech AI',
    size: 5.2, // GB
    fileCount: 8500,
    dataType: 'image',
    creationDate: '2025-02-28T14:45:00Z',
    isPublished: true,
    previewUrl: 'https://example.com/preview4.jpg',
    price: '0.12',
    currency: 'ETH',
    tags: ['medical', 'healthcare', 'imaging'],
    downloads: 67,
    rating: 4.9
  },
  {
    id: 'dataset-5',
    name: 'Synthetic Video Sequences',
    description: 'Computer-generated video sequences for training video analysis models.',
    owner: 'user202',
    ownerName: 'Synthetic Data Inc',
    size: 3.7, // GB
    fileCount: 1200,
    dataType: 'video',
    creationDate: '2025-03-01T10:30:00Z',
    isPublished: true,
    previewUrl: 'https://example.com/preview5.jpg',
    price: '0.09',
    currency: 'ETH',
    tags: ['video', 'synthetic', 'computer-generated'],
    downloads: 31,
    rating: 4.3
  }
];

const DatasetMarketplace = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [searchQuery, setSearchQuery] = useState('');
  const [dataTypeFilter, setDataTypeFilter] = useState<string>('all');
  const [sortBy, setSortBy] = useState<string>('newest');
  const [loading, setLoading] = useState(false);
  const [datasets, setDatasets] = useState<Dataset[]>(MOCK_DATASETS);

  // Redirect to home if not authenticated
  if (!user) {
    navigate('/');
    return null;
  }

  // Filter datasets based on search query and filters
  const filteredDatasets = datasets.filter(dataset => {
    // Filter by search query
    const matchesSearch = 
      dataset.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      dataset.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      dataset.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()));
    
    // Filter by data type
    const matchesDataType = dataTypeFilter === 'all' || dataset.dataType === dataTypeFilter;
    
    return matchesSearch && matchesDataType;
  });

  // Sort datasets
  const sortedDatasets = [...filteredDatasets].sort((a, b) => {
    switch (sortBy) {
      case 'newest':
        return new Date(b.creationDate).getTime() - new Date(a.creationDate).getTime();
      case 'oldest':
        return new Date(a.creationDate).getTime() - new Date(b.creationDate).getTime();
      case 'price-low':
        return parseFloat(a.price) - parseFloat(b.price);
      case 'price-high':
        return parseFloat(b.price) - parseFloat(a.price);
      case 'downloads':
        return b.downloads - a.downloads;
      case 'rating':
        return b.rating - a.rating;
      default:
        return 0;
    }
  });

  // Handle dataset purchase
  const handlePurchaseDataset = (dataset: Dataset) => {
    setLoading(true);
    
    // Simulate API call
    setTimeout(() => {
      setLoading(false);
      
      toast({
        title: 'Dataset License Purchased',
        description: `You have successfully purchased a license for "${dataset.name}".`,
      });
    }, 1500);
  };

  // Format date
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  // Get data type icon
  const getDataTypeIcon = (dataType: string) => {
    switch (dataType) {
      case 'image':
        return '🖼️';
      case 'audio':
        return '🎵';
      case 'video':
        return '🎬';
      case 'text':
        return '📄';
      default:
        return '📁';
    }
  };

  return (
    <div className="min-h-screen pt-24 pb-16 px-6">
      <div className="container mx-auto animate-fade-in">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-8 gap-4">
          <div>
            <h1 className="text-3xl font-bold flex items-center gap-2">
              <Database className="h-8 w-8 text-primary" />
              Dataset Marketplace
            </h1>
            <p className="text-muted-foreground mt-1">
              Browse and license datasets for AI model training
            </p>
          </div>
        </div>
        
        {/* Search and filters */}
        <div className="bg-secondary/20 p-4 rounded-lg mb-8">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
              <Input
                placeholder="Search datasets..."
                className="pl-10"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            
            <div className="flex gap-4">
              <div className="w-40">
                <Select
                  value={dataTypeFilter}
                  onValueChange={setDataTypeFilter}
                >
                  <SelectTrigger>
                    <div className="flex items-center gap-2">
                      <Filter className="h-4 w-4" />
                      <SelectValue placeholder="Data Type" />
                    </div>
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Types</SelectItem>
                    <SelectItem value="image">Images</SelectItem>
                    <SelectItem value="audio">Audio</SelectItem>
                    <SelectItem value="video">Video</SelectItem>
                    <SelectItem value="text">Text</SelectItem>
                    <SelectItem value="mixed">Mixed</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div className="w-40">
                <Select
                  value={sortBy}
                  onValueChange={setSortBy}
                >
                  <SelectTrigger>
                    <div className="flex items-center gap-2">
                      <BarChart3 className="h-4 w-4" />
                      <SelectValue placeholder="Sort By" />
                    </div>
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="newest">Newest</SelectItem>
                    <SelectItem value="oldest">Oldest</SelectItem>
                    <SelectItem value="price-low">Price: Low to High</SelectItem>
                    <SelectItem value="price-high">Price: High to Low</SelectItem>
                    <SelectItem value="downloads">Most Downloads</SelectItem>
                    <SelectItem value="rating">Highest Rated</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>
        </div>
        
        {/* Dataset grid */}
        {loading ? (
          <div className="flex justify-center items-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        ) : sortedDatasets.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {sortedDatasets.map((dataset) => (
              <Card key={dataset.id} className="overflow-hidden transition-all hover:shadow-md">
                <CardHeader className="pb-4">
                  <div className="flex justify-between items-start">
                    <CardTitle className="text-xl">{dataset.name}</CardTitle>
                    <Badge variant="outline" className="flex items-center gap-1">
                      {getDataTypeIcon(dataset.dataType)} {dataset.dataType}
                    </Badge>
                  </div>
                  <CardDescription className="mt-2">
                    {dataset.description}
                  </CardDescription>
                </CardHeader>
                
                <CardContent className="pb-3">
                  {dataset.previewUrl && (
                    <div className="mb-4">
                      <div className="rounded-md overflow-hidden h-48 bg-secondary/30">
                        <img 
                          src={dataset.previewUrl} 
                          alt={dataset.name} 
                          className="w-full h-full object-cover"
                          onError={(e) => {
                            // If image fails to load, show a placeholder
                            (e.target as HTMLImageElement).src = '/placeholder.svg';
                          }}
                        />
                      </div>
                    </div>
                  )}
                  
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div className="flex items-center gap-2">
                      <BookOpen className="h-4 w-4 text-muted-foreground" />
                      <span>{dataset.fileCount.toLocaleString()} files</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Database className="h-4 w-4 text-muted-foreground" />
                      <span>{dataset.size.toFixed(1)} GB</span>
                    </div>
                  </div>
                  
                  {dataset.tags.length > 0 && (
                    <div className="mt-4 flex items-center gap-2">
                      <Tag className="h-4 w-4 text-muted-foreground" />
                      <div className="flex flex-wrap gap-1">
                        {dataset.tags.map((tag, index) => (
                          <Badge key={index} variant="secondary" className="text-xs">
                            {tag}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}
                </CardContent>
                
                <Separator />
                
                <CardFooter className="flex justify-between py-4">
                  <div className="flex flex-col">
                    <span className="text-sm text-muted-foreground">Created by</span>
                    <span className="font-medium">{dataset.ownerName}</span>
                  </div>
                  
                  <Button 
                    onClick={() => handlePurchaseDataset(dataset)}
                    className="flex items-center gap-2"
                  >
                    <span>{dataset.price} {dataset.currency}</span>
                    <span>License</span>
                  </Button>
                </CardFooter>
              </Card>
            ))}
          </div>
        ) : (
          <div className="text-center py-12 bg-secondary/20 rounded-lg">
            <Database className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
            <h3 className="text-xl font-medium mb-2">No Datasets Found</h3>
            <p className="text-muted-foreground max-w-md mx-auto mb-6">
              No datasets match your search criteria. Try adjusting your filters or search query.
            </p>
            <Button 
              variant="outline" 
              onClick={() => {
                setSearchQuery('');
                setDataTypeFilter('all');
                setSortBy('newest');
              }}
            >
              Clear Filters
            </Button>
          </div>
        )}
      </div>
    </div>
  );
};

export default DatasetMarketplace;