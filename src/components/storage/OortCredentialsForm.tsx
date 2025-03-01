
import React, { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "@/components/ui/use-toast";
import {
  getOortCredentials,
  saveOortCredentials,
  resetToDefaultCredentials,
  isUsingCustomCredentials,
  setUseRealOortStorage,
  isUsingRealOortStorage
} from "@/utils/oortStorage";
import { Switch } from "@/components/ui/switch";

const OortCredentialsForm = () => {
  const [accessKey, setAccessKey] = useState('');
  const [secretKey, setSecretKey] = useState('');
  const [endpoint, setEndpoint] = useState('https://s3-standard.oortech.com');
  const [isCustom, setIsCustom] = useState(false);
  const [useRealStorage, setUseRealStorage] = useState(false);

  useEffect(() => {
    // Check if using custom credentials
    const usingCustom = isUsingCustomCredentials();
    setIsCustom(usingCustom);
    
    if (usingCustom) {
      const credentials = getOortCredentials();
      setAccessKey(credentials.accessKey);
      setSecretKey(credentials.secretKey);
    } else {
      // Display default credentials
      const defaultCreds = getOortCredentials();
      setAccessKey(defaultCreds.accessKey);
      setSecretKey(defaultCreds.secretKey);
    }
    
    // Get endpoint from environment variable or use default
    const envEndpoint = import.meta.env.VITE_OORT_ENDPOINT;
    if (envEndpoint) {
      setEndpoint(envEndpoint);
    }
    
    // Check storage mode
    setUseRealStorage(isUsingRealOortStorage());
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!accessKey || !secretKey) {
      toast({
        title: "Validation Error",
        description: "Both access key and secret key are required.",
        variant: "destructive"
      });
      return;
    }
    
    if (!endpoint) {
      toast({
        title: "Validation Error",
        description: "OORT endpoint URL is required.",
        variant: "destructive"
      });
      return;
    }
    
    saveOortCredentials({ accessKey, secretKey, endpoint });
    setIsCustom(true);
    
    toast({
      title: "Success",
      description: "OORT Storage credentials saved successfully.",
    });
  };

  const handleReset = () => {
    resetToDefaultCredentials();
    const defaultCreds = getOortCredentials();
    setAccessKey(defaultCreds.accessKey);
    setSecretKey(defaultCreds.secretKey);
    setEndpoint(defaultCreds.endpoint || 'https://s3-standard.oortech.com');
    setIsCustom(false);
    
    toast({
      title: "Reset Complete",
      description: "Using default OORT Storage credentials now.",
    });
  };
  
  const handleStorageToggle = (checked: boolean) => {
    setUseRealStorage(checked);
    setUseRealOortStorage(checked);
    
    toast({
      title: checked ? "Real Storage Enabled" : "Simulation Mode Enabled",
      description: checked 
        ? "Files will be uploaded to actual OORT Cloud storage." 
        : "Files will be simulated for development purposes.",
    });
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>OORT Storage Configuration</CardTitle>
        <CardDescription>
          {isCustom 
            ? "You're using custom OORT Storage credentials." 
            : "You're using default OORT Storage credentials."}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="mb-6 flex items-center justify-between">
          <div className="space-y-1">
            <h4 className="font-medium">Storage Mode</h4>
            <p className="text-sm text-muted-foreground">
              {useRealStorage ? "Using real OORT Cloud storage" : "Using simulated storage (dev mode)"}
            </p>
          </div>
          <Switch 
            checked={useRealStorage} 
            onCheckedChange={handleStorageToggle} 
            id="storage-mode"
          />
        </div>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="accessKey">Access Key</Label>
            <Input
              id="accessKey"
              value={accessKey}
              onChange={(e) => setAccessKey(e.target.value)}
              placeholder="Enter your OORT Storage access key"
              type="text"
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="secretKey">Secret Key</Label>
            <Input
              id="secretKey"
              value={secretKey}
              onChange={(e) => setSecretKey(e.target.value)}
              placeholder="Enter your OORT Storage secret key"
              type="password"
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="endpoint">OORT Endpoint</Label>
            <Input
              id="endpoint"
              value={endpoint}
              onChange={(e) => setEndpoint(e.target.value)}
              placeholder="Enter your OORT Storage endpoint URL"
              type="text"
            />
            <p className="text-xs text-muted-foreground">
              Standard endpoint: https://s3-standard.oortech.com
            </p>
          </div>
          
          <div className="flex justify-end space-x-2">
            {isCustom && (
              <Button type="button" variant="outline" onClick={handleReset}>
                Reset to Default
              </Button>
            )}
            <Button type="submit">
              Save Credentials
            </Button>
          </div>
        </form>
      </CardContent>
      <CardFooter className="text-sm text-muted-foreground">
        Your credentials are stored locally in your browser and are never sent to our servers.
        {useRealStorage && !isCustom && (
          <div className="mt-2 text-amber-500">
            Using real storage with default credentials.
          </div>
        )}
      </CardFooter>
    </Card>
  );
};

export default OortCredentialsForm;
