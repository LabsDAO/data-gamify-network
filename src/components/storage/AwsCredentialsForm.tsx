
import React, { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "@/components/ui/use-toast";
import { 
  getAwsCredentials, 
  saveAwsCredentials, 
  resetToDefaultAwsCredentials, 
  isUsingCustomAwsCredentials,
  setUseRealAwsStorage,
  isUsingRealAwsStorage 
} from "@/utils/awsStorage";
import { Switch } from "@/components/ui/switch";

const AwsCredentialsForm = () => {
  const [accessKeyId, setAccessKeyId] = useState('');
  const [secretAccessKey, setSecretAccessKey] = useState('');
  const [region, setRegion] = useState('');
  const [bucket, setBucket] = useState('');
  const [isCustom, setIsCustom] = useState(false);
  const [useRealStorage, setUseRealStorage] = useState(false);

  useEffect(() => {
    // Check if using custom credentials
    const usingCustom = isUsingCustomAwsCredentials();
    setIsCustom(usingCustom);
    
    // Load stored credentials
    const credentials = getAwsCredentials();
    setAccessKeyId(credentials.accessKeyId);
    setSecretAccessKey(credentials.secretAccessKey);
    setRegion(credentials.region);
    setBucket(credentials.bucket);
    
    // Check storage mode
    setUseRealStorage(isUsingRealAwsStorage());
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!accessKeyId || !secretAccessKey || !region || !bucket) {
      toast({
        title: "Validation Error",
        description: "All fields are required to configure AWS S3.",
        variant: "destructive"
      });
      return;
    }
    
    saveAwsCredentials({ 
      accessKeyId, 
      secretAccessKey, 
      region, 
      bucket 
    });
    setIsCustom(true);
    
    toast({
      title: "Success",
      description: "AWS S3 credentials saved successfully.",
    });
  };

  const handleReset = () => {
    resetToDefaultAwsCredentials();
    const defaultCreds = getAwsCredentials();
    setAccessKeyId(defaultCreds.accessKeyId);
    setSecretAccessKey(defaultCreds.secretAccessKey);
    setRegion(defaultCreds.region);
    setBucket(defaultCreds.bucket);
    setIsCustom(false);
    
    toast({
      title: "Reset Complete",
      description: "AWS S3 credentials have been reset.",
    });
  };
  
  const handleStorageToggle = (checked: boolean) => {
    setUseRealStorage(checked);
    setUseRealAwsStorage(checked);
    
    toast({
      title: checked ? "Real AWS S3 Storage Enabled" : "AWS S3 Simulation Mode Enabled",
      description: checked 
        ? "Files will be uploaded to actual AWS S3 storage." 
        : "AWS S3 uploads will be simulated for development purposes.",
    });
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>AWS S3 Configuration</CardTitle>
        <CardDescription>
          {isCustom 
            ? "You're using custom AWS S3 credentials." 
            : "Please configure your AWS S3 credentials to enable storage."}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="mb-6 flex items-center justify-between">
          <div className="space-y-1">
            <h4 className="font-medium">AWS S3 Mode</h4>
            <p className="text-sm text-muted-foreground">
              {useRealStorage ? "Using real AWS S3 storage" : "Using simulated storage (dev mode)"}
            </p>
          </div>
          <Switch 
            checked={useRealStorage} 
            onCheckedChange={handleStorageToggle} 
            id="aws-storage-mode"
          />
        </div>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="accessKeyId">Access Key ID</Label>
            <Input
              id="accessKeyId"
              value={accessKeyId}
              onChange={(e) => setAccessKeyId(e.target.value)}
              placeholder="Enter your AWS Access Key ID"
              type="text"
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="secretAccessKey">Secret Access Key</Label>
            <Input
              id="secretAccessKey"
              value={secretAccessKey}
              onChange={(e) => setSecretAccessKey(e.target.value)}
              placeholder="Enter your AWS Secret Access Key"
              type="password"
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="region">AWS Region</Label>
            <Input
              id="region"
              value={region}
              onChange={(e) => setRegion(e.target.value)}
              placeholder="e.g., us-east-1"
              type="text"
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="bucket">S3 Bucket Name</Label>
            <Input
              id="bucket"
              value={bucket}
              onChange={(e) => setBucket(e.target.value)}
              placeholder="Enter your S3 bucket name"
              type="text"
            />
          </div>
          
          <div className="flex justify-end space-x-2">
            {isCustom && (
              <Button type="button" variant="outline" onClick={handleReset}>
                Reset
              </Button>
            )}
            <Button type="submit">
              Save AWS Credentials
            </Button>
          </div>
        </form>
      </CardContent>
      <CardFooter className="text-sm text-muted-foreground">
        Your AWS credentials are stored locally in your browser and are never sent to our servers.
        {useRealStorage && !isCustom && (
          <div className="mt-2 text-amber-500">
            Please add valid AWS credentials before enabling real storage mode.
          </div>
        )}
      </CardFooter>
    </Card>
  );
};

export default AwsCredentialsForm;
