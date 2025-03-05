import { useState } from 'react';
import { IPAsset, License } from '@/types/storyProtocol';
import { 
  Shield, 
  FileText, 
  ExternalLink, 
  ChevronDown, 
  ChevronUp,
  Tag,
  Calendar,
  Globe,
  DollarSign
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { cn } from '@/lib/utils';

interface IPAssetCardProps {
  ipAsset: IPAsset;
  onCreateLicense?: (ipAsset: IPAsset) => void;
  onPurchaseLicense?: (license: License) => void;
  isOwner?: boolean;
}

const IPAssetCard = ({ 
  ipAsset, 
  onCreateLicense,
  onPurchaseLicense,
  isOwner = false
}: IPAssetCardProps) => {
  const [showLicenses, setShowLicenses] = useState(false);
  
  // Format date
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };
  
  // Get media type icon
  const getMediaTypeIcon = () => {
    switch (ipAsset.mediaType) {
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
  
  // Toggle licenses display
  const toggleLicenses = () => {
    setShowLicenses(!showLicenses);
  };
  
  // Handle create license button click
  const handleCreateLicense = () => {
    if (onCreateLicense) {
      onCreateLicense(ipAsset);
    }
  };
  
  // Handle purchase license button click
  const handlePurchaseLicense = (license: License) => {
    if (onPurchaseLicense) {
      onPurchaseLicense(license);
    }
  };

  return (
    <Card className="overflow-hidden transition-all hover:shadow-md">
      <CardHeader className="pb-4">
        <div className="flex justify-between items-start">
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-full bg-primary/10">
              <Shield className="h-5 w-5 text-primary" />
            </div>
            <CardTitle className="text-xl">{ipAsset.name}</CardTitle>
          </div>
          <Badge variant="outline" className="flex items-center gap-1">
            {getMediaTypeIcon()} {ipAsset.mediaType}
          </Badge>
        </div>
        <CardDescription className="mt-2">
          {ipAsset.description}
        </CardDescription>
      </CardHeader>
      
      <CardContent className="pb-3">
        {ipAsset.mediaUrl && (
          <div className="mb-4">
            {ipAsset.mediaType === 'image' ? (
              <div className="rounded-md overflow-hidden h-48 bg-secondary/30">
                <img 
                  src={ipAsset.mediaUrl} 
                  alt={ipAsset.name} 
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    // If image fails to load, show a placeholder
                    (e.target as HTMLImageElement).src = '/placeholder.svg';
                  }}
                />
              </div>
            ) : (
              <div className="flex items-center justify-center h-48 bg-secondary/30 rounded-md">
                <div className="text-4xl">{getMediaTypeIcon()}</div>
              </div>
            )}
          </div>
        )}
        
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div className="flex items-center gap-2">
            <Calendar className="h-4 w-4 text-muted-foreground" />
            <span>Registered: {formatDate(ipAsset.registrationDate)}</span>
          </div>
          
          {ipAsset.metadata?.tags && ipAsset.metadata.tags.length > 0 && (
            <div className="flex items-center gap-2">
              <Tag className="h-4 w-4 text-muted-foreground" />
              <div className="flex flex-wrap gap-1">
                {ipAsset.metadata.tags.slice(0, 3).map((tag, index) => (
                  <Badge key={index} variant="secondary" className="text-xs">
                    {tag}
                  </Badge>
                ))}
                {ipAsset.metadata.tags.length > 3 && (
                  <Badge variant="secondary" className="text-xs">
                    +{ipAsset.metadata.tags.length - 3}
                  </Badge>
                )}
              </div>
            </div>
          )}
        </div>
        
        {/* Licenses section */}
        <div className="mt-4">
          <div 
            className="flex items-center justify-between cursor-pointer py-2"
            onClick={toggleLicenses}
          >
            <div className="flex items-center gap-2">
              <FileText className="h-4 w-4 text-muted-foreground" />
              <span className="font-medium">
                Licenses ({ipAsset.licenses?.length || 0})
              </span>
            </div>
            <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
              {showLicenses ? (
                <ChevronUp className="h-4 w-4" />
              ) : (
                <ChevronDown className="h-4 w-4" />
              )}
            </Button>
          </div>
          
          {showLicenses && (
            <div className="space-y-3 mt-2">
              {ipAsset.licenses && ipAsset.licenses.length > 0 ? (
                ipAsset.licenses.map((license, index) => (
                  <div 
                    key={license.id} 
                    className={cn(
                      "border rounded-md p-3",
                      index < ipAsset.licenses.length - 1 && "mb-3"
                    )}
                  >
                    <div className="flex justify-between items-start mb-2">
                      <div>
                        <h4 className="font-medium">
                          {license.terms.commercialUse ? 'Commercial' : 'Non-Commercial'} License
                        </h4>
                        <p className="text-sm text-muted-foreground">
                          Created: {formatDate(license.creationDate)}
                        </p>
                      </div>
                      <Badge>
                        {license.price} {license.currency}
                      </Badge>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-x-4 gap-y-2 text-sm mt-3">
                      <div className="flex items-center gap-2">
                        <Globe className="h-3 w-3 text-muted-foreground" />
                        <span>Territory: {license.terms.territory}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Calendar className="h-3 w-3 text-muted-foreground" />
                        <span>Duration: {license.terms.duration}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <DollarSign className="h-3 w-3 text-muted-foreground" />
                        <span>Royalty: {license.terms.royaltyPercentage}%</span>
                      </div>
                    </div>
                    
                    {!isOwner && (
                      <Button 
                        className="w-full mt-3"
                        size="sm"
                        onClick={() => handlePurchaseLicense(license)}
                      >
                        Purchase License
                      </Button>
                    )}
                  </div>
                ))
              ) : (
                <div className="text-center py-3 text-muted-foreground text-sm">
                  No licenses available for this IP asset.
                </div>
              )}
            </div>
          )}
        </div>
      </CardContent>
      
      <Separator />
      
      <CardFooter className="flex justify-between py-3">
        {isOwner && (
          <Button 
            variant="outline" 
            size="sm"
            onClick={handleCreateLicense}
          >
            <FileText className="h-4 w-4 mr-2" />
            Create License
          </Button>
        )}
        
        {ipAsset.mediaUrl && (
          <Button 
            variant="ghost" 
            size="sm"
            asChild
          >
            <a 
              href={ipAsset.mediaUrl} 
              target="_blank" 
              rel="noopener noreferrer"
              className="flex items-center"
            >
              <ExternalLink className="h-4 w-4 mr-2" />
              View Media
            </a>
          </Button>
        )}
      </CardFooter>
    </Card>
  );
};

export default IPAssetCard;