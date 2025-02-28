
import React, { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "@/components/ui/use-toast";
import { getOortCredentials, saveOortCredentials, resetToDefaultCredentials, isUsingCustomCredentials } from "@/utils/oortStorage";

const OortCredentialsForm = () => {
  const [accessKey, setAccessKey] = useState('');
  const [secretKey, setSecretKey] = useState('');
  const [isCustom, setIsCustom] = useState(false);

  useEffect(() => {
    // Check if using custom credentials
    const usingCustom = isUsingCustomCredentials();
    setIsCustom(usingCustom);
    
    if (usingCustom) {
      const credentials = getOortCredentials();
      setAccessKey(credentials.accessKey);
      setSecretKey(credentials.secretKey);
    }
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
    
    saveOortCredentials({ accessKey, secretKey });
    setIsCustom(true);
    
    toast({
      title: "Success",
      description: "OORT Storage credentials saved successfully.",
    });
  };

  const handleReset = () => {
    resetToDefaultCredentials();
    setAccessKey('');
    setSecretKey('');
    setIsCustom(false);
    
    toast({
      title: "Reset Complete",
      description: "Using default OORT Storage credentials now.",
    });
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>OORT Storage Configuration</CardTitle>
        <CardDescription>
          {isCustom 
            ? "You're using custom OORT Storage credentials." 
            : "You're using default OORT Storage credentials. Configure your own credentials below."}
        </CardDescription>
      </CardHeader>
      <CardContent>
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
      </CardFooter>
    </Card>
  );
};

export default OortCredentialsForm;
