import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useStoryProtocol } from '@/hooks/use-story-protocol';
import { IPRegistrationParams } from '@/types/storyProtocol';
import { DEFAULT_IP_METADATA } from '@/utils/storyProtocolConfig';
import { Loader2, Shield } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { toast } from '@/hooks/use-toast';

// Form schema for IP registration
const formSchema = z.object({
  name: z.string().min(3, {
    message: 'Name must be at least 3 characters.',
  }),
  description: z.string().min(10, {
    message: 'Description must be at least 10 characters.',
  }),
  mediaUrl: z.string().url({
    message: 'Please enter a valid URL.',
  }),
  mediaType: z.enum(['image', 'audio', 'video', 'text', 'other'], {
    required_error: 'Please select a media type.',
  }),
  tags: z.string().optional(),
});

type FormValues = z.infer<typeof formSchema>;

interface RegisterIPFormProps {
  onSuccess?: (ipAssetId: string) => void;
  uploadedFileUrl?: string;
  uploadedFileType?: string;
}

const RegisterIPForm = ({ 
  onSuccess, 
  uploadedFileUrl,
  uploadedFileType 
}: RegisterIPFormProps) => {
  const { registerIP, loading } = useStoryProtocol();
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Initialize form with default values
  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: '',
      description: '',
      mediaUrl: uploadedFileUrl || '',
      mediaType: uploadedFileType as any || 'image',
      tags: '',
    },
  });

  // Handle form submission
  const onSubmit = async (values: FormValues) => {
    setIsSubmitting(true);
    
    try {
      // Prepare tags array
      const tags = values.tags ? values.tags.split(',').map(tag => tag.trim()) : [];
      
      // Prepare IP registration params
      const params: IPRegistrationParams = {
        name: values.name,
        description: values.description,
        mediaUrl: values.mediaUrl,
        mediaType: values.mediaType,
        metadata: {
          ...DEFAULT_IP_METADATA,
          name: values.name,
          description: values.description,
          image: values.mediaUrl,
          mediaType: values.mediaType,
          tags: tags,
        },
      };
      
      // Register IP asset
      const response = await registerIP(params);
      
      if (response.status === 'success') {
        // Clear form
        form.reset();
        
        // Call onSuccess callback if provided
        if (onSuccess) {
          // In a real implementation, we would get the ipAssetId from the response
          // For now, we'll use a mock ID
          const mockIpAssetId = `ip-${Date.now()}`;
          onSuccess(mockIpAssetId);
        }
        
        toast({
          title: 'IP Registration Successful',
          description: 'Your intellectual property has been registered successfully.',
        });
      }
    } catch (error) {
      console.error('Error registering IP:', error);
      toast({
        title: 'Registration Failed',
        description: error instanceof Error ? error.message : 'An unknown error occurred',
        variant: 'destructive',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <div className="p-2 rounded-full bg-primary/10">
          <Shield className="h-6 w-6 text-primary" />
        </div>
        <h2 className="text-2xl font-bold">Register Intellectual Property</h2>
      </div>
      
      <p className="text-muted-foreground">
        Register your data as intellectual property on the blockchain to protect your rights and enable monetization.
      </p>
      
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          <FormField
            control={form.control}
            name="name"
            render={({ field }) => (
              <FormItem>
                <FormLabel>IP Name</FormLabel>
                <FormControl>
                  <Input placeholder="My Dataset Name" {...field} />
                </FormControl>
                <FormDescription>
                  A clear, descriptive name for your intellectual property.
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
          
          <FormField
            control={form.control}
            name="description"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Description</FormLabel>
                <FormControl>
                  <Textarea 
                    placeholder="Describe your dataset, its contents, and potential uses..." 
                    className="min-h-[120px]"
                    {...field} 
                  />
                </FormControl>
                <FormDescription>
                  Provide details about your data, its contents, and how it can be used.
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <FormField
              control={form.control}
              name="mediaUrl"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Media URL</FormLabel>
                  <FormControl>
                    <Input placeholder="https://example.com/my-dataset.zip" {...field} />
                  </FormControl>
                  <FormDescription>
                    URL to your dataset or a preview image.
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="mediaType"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Media Type</FormLabel>
                  <Select 
                    onValueChange={field.onChange} 
                    defaultValue={field.value}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select media type" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="image">Image</SelectItem>
                      <SelectItem value="audio">Audio</SelectItem>
                      <SelectItem value="video">Video</SelectItem>
                      <SelectItem value="text">Text</SelectItem>
                      <SelectItem value="other">Other</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormDescription>
                    The primary type of content in your dataset.
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
          
          <FormField
            control={form.control}
            name="tags"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Tags</FormLabel>
                <FormControl>
                  <Input placeholder="ai, dataset, images, training" {...field} />
                </FormControl>
                <FormDescription>
                  Comma-separated tags to help categorize your IP.
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
          
          <Button 
            type="submit" 
            className="w-full md:w-auto"
            disabled={isSubmitting || loading}
          >
            {(isSubmitting || loading) && (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            )}
            Register Intellectual Property
          </Button>
        </form>
      </Form>
    </div>
  );
};

export default RegisterIPForm;