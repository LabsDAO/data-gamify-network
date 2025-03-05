import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useStoryProtocol } from '@/hooks/use-story-protocol';
import { LicenseCreationParams, IPAsset } from '@/types/storyProtocol';
import { LICENSE_TEMPLATES } from '@/utils/storyProtocolConfig';
import { Loader2, FileText } from 'lucide-react';
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
import { Checkbox } from '@/components/ui/checkbox';
import { toast } from '@/hooks/use-toast';

// Form schema for license creation
const formSchema = z.object({
  templateId: z.string({
    required_error: "Please select a license template",
  }),
  price: z.string().min(1, {
    message: 'Please enter a price.',
  }),
  currency: z.string().default('ETH'),
  commercialUse: z.boolean().default(true),
  attribution: z.boolean().default(true),
  derivativeWorks: z.boolean().default(true),
  revocable: z.boolean().default(false),
  exclusivity: z.boolean().default(false),
  territory: z.string().default('Worldwide'),
  duration: z.string().default('Perpetual'),
  royaltyPercentage: z.coerce.number().min(0).max(100).default(2.5),
  customTerms: z.string().optional(),
});

type FormValues = z.infer<typeof formSchema>;

interface LicenseFormProps {
  ipAsset: IPAsset;
  onSuccess?: (licenseId: string) => void;
}

const LicenseForm = ({ ipAsset, onSuccess }: LicenseFormProps) => {
  const { createIPLicense, loading } = useStoryProtocol();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [selectedTemplate, setSelectedTemplate] = useState(LICENSE_TEMPLATES[0]);

  // Initialize form with default values from the first template
  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      templateId: LICENSE_TEMPLATES[0].id,
      price: '0.01',
      currency: 'ETH',
      commercialUse: LICENSE_TEMPLATES[0].terms.commercialUse,
      attribution: LICENSE_TEMPLATES[0].terms.attribution,
      derivativeWorks: LICENSE_TEMPLATES[0].terms.derivativeWorks,
      revocable: LICENSE_TEMPLATES[0].terms.revocable,
      exclusivity: LICENSE_TEMPLATES[0].terms.exclusivity,
      territory: LICENSE_TEMPLATES[0].terms.territory,
      duration: LICENSE_TEMPLATES[0].terms.duration,
      royaltyPercentage: LICENSE_TEMPLATES[0].terms.royaltyPercentage,
      customTerms: '',
    },
  });

  // Handle template selection
  const handleTemplateChange = (templateId: string) => {
    const template = LICENSE_TEMPLATES.find(t => t.id === templateId);
    if (template) {
      setSelectedTemplate(template);
      
      // Update form values based on template
      form.setValue('commercialUse', template.terms.commercialUse);
      form.setValue('attribution', template.terms.attribution);
      form.setValue('derivativeWorks', template.terms.derivativeWorks);
      form.setValue('revocable', template.terms.revocable);
      form.setValue('exclusivity', template.terms.exclusivity);
      form.setValue('territory', template.terms.territory);
      form.setValue('duration', template.terms.duration);
      form.setValue('royaltyPercentage', template.terms.royaltyPercentage);
    }
  };

  // Handle form submission
  const onSubmit = async (values: FormValues) => {
    setIsSubmitting(true);
    
    try {
      // Prepare license creation params
      const params: LicenseCreationParams = {
        ipAssetId: ipAsset.id,
        terms: {
          commercialUse: values.commercialUse,
          attribution: values.attribution,
          derivativeWorks: values.derivativeWorks,
          revocable: values.revocable,
          exclusivity: values.exclusivity,
          territory: values.territory,
          duration: values.duration,
          royaltyPercentage: values.royaltyPercentage,
          customTerms: values.customTerms,
        },
        price: values.price,
        currency: values.currency,
      };
      
      // Create license
      const response = await createIPLicense(params);
      
      if (response.status === 'success') {
        // Clear form
        form.reset();
        
        // Call onSuccess callback if provided
        if (onSuccess) {
          // In a real implementation, we would get the licenseId from the response
          // For now, we'll use a mock ID
          const mockLicenseId = `license-${Date.now()}`;
          onSuccess(mockLicenseId);
        }
        
        toast({
          title: 'License Created Successfully',
          description: 'Your license has been created and is now available for purchase.',
        });
      }
    } catch (error) {
      console.error('Error creating license:', error);
      toast({
        title: 'License Creation Failed',
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
          <FileText className="h-6 w-6 text-primary" />
        </div>
        <h2 className="text-2xl font-bold">Create License</h2>
      </div>
      
      <p className="text-muted-foreground">
        Create a license for your intellectual property to define how others can use your data.
      </p>
      
      <div className="bg-secondary/30 p-4 rounded-lg mb-6">
        <h3 className="font-medium mb-2">IP Asset: {ipAsset.name}</h3>
        <p className="text-sm text-muted-foreground">{ipAsset.description}</p>
      </div>
      
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          <FormField
            control={form.control}
            name="templateId"
            render={({ field }) => (
              <FormItem>
                <FormLabel>License Template</FormLabel>
                <Select 
                  onValueChange={(value) => {
                    field.onChange(value);
                    handleTemplateChange(value);
                  }}
                  defaultValue={field.value}
                >
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select a license template" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {LICENSE_TEMPLATES.map((template) => (
                      <SelectItem key={template.id} value={template.id}>
                        {template.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormDescription>
                  {selectedTemplate.description}
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <FormField
              control={form.control}
              name="price"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Price</FormLabel>
                  <FormControl>
                    <Input type="text" placeholder="0.01" {...field} />
                  </FormControl>
                  <FormDescription>
                    The price to purchase this license.
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="currency"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Currency</FormLabel>
                  <Select 
                    onValueChange={field.onChange} 
                    defaultValue={field.value}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select currency" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="ETH">ETH</SelectItem>
                      <SelectItem value="USDC">USDC</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormDescription>
                    The currency for the license price.
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
          
          <div className="space-y-4">
            <h3 className="font-medium">License Terms</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="commercialUse"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4">
                    <FormControl>
                      <Checkbox
                        checked={field.value}
                        onCheckedChange={field.onChange}
                      />
                    </FormControl>
                    <div className="space-y-1 leading-none">
                      <FormLabel>Commercial Use</FormLabel>
                      <FormDescription>
                        Allow use in commercial applications
                      </FormDescription>
                    </div>
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="attribution"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4">
                    <FormControl>
                      <Checkbox
                        checked={field.value}
                        onCheckedChange={field.onChange}
                      />
                    </FormControl>
                    <div className="space-y-1 leading-none">
                      <FormLabel>Attribution Required</FormLabel>
                      <FormDescription>
                        Require attribution to the original creator
                      </FormDescription>
                    </div>
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="derivativeWorks"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4">
                    <FormControl>
                      <Checkbox
                        checked={field.value}
                        onCheckedChange={field.onChange}
                      />
                    </FormControl>
                    <div className="space-y-1 leading-none">
                      <FormLabel>Derivative Works</FormLabel>
                      <FormDescription>
                        Allow creation of derivative works
                      </FormDescription>
                    </div>
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="exclusivity"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4">
                    <FormControl>
                      <Checkbox
                        checked={field.value}
                        onCheckedChange={field.onChange}
                      />
                    </FormControl>
                    <div className="space-y-1 leading-none">
                      <FormLabel>Exclusive License</FormLabel>
                      <FormDescription>
                        Grant exclusive rights to the licensee
                      </FormDescription>
                    </div>
                  </FormItem>
                )}
              />
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-4">
              <FormField
                control={form.control}
                name="territory"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Territory</FormLabel>
                    <Select 
                      onValueChange={field.onChange} 
                      defaultValue={field.value}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select territory" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="Worldwide">Worldwide</SelectItem>
                        <SelectItem value="North America">North America</SelectItem>
                        <SelectItem value="Europe">Europe</SelectItem>
                        <SelectItem value="Asia">Asia</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormDescription>
                      Geographic scope of the license.
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="duration"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Duration</FormLabel>
                    <Select 
                      onValueChange={field.onChange} 
                      defaultValue={field.value}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select duration" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="Perpetual">Perpetual</SelectItem>
                        <SelectItem value="1 year">1 Year</SelectItem>
                        <SelectItem value="2 years">2 Years</SelectItem>
                        <SelectItem value="5 years">5 Years</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormDescription>
                      How long the license remains valid.
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            
            <FormField
              control={form.control}
              name="royaltyPercentage"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Royalty Percentage (%)</FormLabel>
                  <FormControl>
                    <Input 
                      type="number" 
                      min="0" 
                      max="100" 
                      step="0.1" 
                      placeholder="2.5" 
                      {...field} 
                    />
                  </FormControl>
                  <FormDescription>
                    Percentage of revenue shared with the licensor for derivative works.
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="customTerms"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Custom Terms (Optional)</FormLabel>
                  <FormControl>
                    <Textarea 
                      placeholder="Any additional terms or conditions..." 
                      className="min-h-[100px]"
                      {...field} 
                    />
                  </FormControl>
                  <FormDescription>
                    Any additional terms or conditions for this license.
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
          
          <Button 
            type="submit" 
            className="w-full md:w-auto"
            disabled={isSubmitting || loading}
          >
            {(isSubmitting || loading) && (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            )}
            Create License
          </Button>
        </form>
      </Form>
    </div>
  );
};

export default LicenseForm;